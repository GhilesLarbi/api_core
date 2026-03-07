import hashlib
from datetime import datetime
from typing import List
from uuid import UUID

from taskiq import TaskiqDepends
from sqlalchemy.ext.asyncio import AsyncSession

from crawl4ai import (
    Crawl4aiDockerClient, 
    CrawlerRunConfig, 
    DefaultMarkdownGenerator, 
    PruningContentFilter, 
    BFSDeepCrawlStrategy,
    CacheMode,
    LXMLWebScrapingStrategy,
    CrawlResult
)
from app.taskiq.broker import broker
from app.core.database import get_db
from app.repositories.organization import OrganizationRepository
from app.repositories.document import DocumentRepository
from app.repositories.chunk import ChunkRepository
from app.models.enums import LanguageEnum
from app.core.embeddings import get_embedding_model

######################################################################################################################
######################################################################################################################
async def run_deep_crawl(url: str, depth: int, max_pages: int) -> List[CrawlResult]:
    """Configures and executes the deep crawl, returning the raw library results."""
    run_conf = CrawlerRunConfig(
        deep_crawl_strategy=BFSDeepCrawlStrategy(
            max_depth=depth, 
            include_external=False, 
            max_pages=max_pages
        ),
        markdown_generator=DefaultMarkdownGenerator(
            content_filter=PruningContentFilter(
                threshold=0.4, 
                threshold_type="dynamic", 
                min_word_threshold=5
            ),
            options={
                "ignore_links": True, 
                "ignore_images": True, 
                "skip_internal_links": True
            }
        ),
        scraping_strategy=LXMLWebScrapingStrategy(),
        cache_mode=CacheMode.BYPASS,
        verbose=True
    )

    async with Crawl4aiDockerClient(base_url="http://crawl4ai:11235", timeout=3600) as client:
        return await client.crawl(
            urls=[url], 
            crawler_config=run_conf,
        )
    

######################################################################################################################
######################################################################################################################
def get_language_enum(text: str) -> LanguageEnum:
    from langdetect import detect
    try:
        code = detect(text[:2000]).upper()
        return LanguageEnum[code] if code in LanguageEnum.__members__ else LanguageEnum.EN
    except Exception:
        return LanguageEnum.EN

######################################################################################################################
######################################################################################################################
@broker.task
async def process_and_store_page_task(
    result: CrawlResult,
    org_id: str,
    db: AsyncSession = TaskiqDepends(get_db)
) -> dict:
    doc_repo = DocumentRepository(db)
    chunk_repo = ChunkRepository(db)
    
    fit_md = result.markdown.fit_markdown if result.markdown else ""
    content_hash = hashlib.md5(fit_md.encode('utf-8')).hexdigest()
    
    existing_doc = await doc_repo.get_by_url_and_org(result.url, org_id)
    if existing_doc:
        await chunk_repo.delete_by_document_id(existing_doc.id)
        existing_doc.content_hash = content_hash
        existing_doc.updated_at = datetime.now()
        doc_id = existing_doc.id
    else:
        new_doc = doc_repo.create(
            organization_id=org_id,
            url=result.url,
            title=(result.metadata or {}).get("title") or "Untitled",
            lang=get_language_enum(fit_md),
            content_hash=content_hash,
            tags=[], suggestions=[]
        )
        await db.flush()
        doc_id = new_doc.id

    words = fit_md.split()
    chunks_text = [" ".join(words[i : i + 400]) for i in range(0, len(words), 400)]
    
    if chunks_text:
        model = get_embedding_model()
        vectors = list(model.embed(chunks_text))
        chunks_data = [
            {"document_id": doc_id, "chunk_index": i, "content": txt, "embedding": vec.tolist()}
            for i, (txt, vec) in enumerate(zip(chunks_text, vectors))
        ]
        chunk_repo.create_many(chunks_data)

    await db.commit()
    return {"status": "success", "url": result.url}


######################################################################################################################
######################################################################################################################
@broker.task
async def sync_site_task(
    org_slug: str, 
    depth: int = 1, 
    max_pages: int = 20,
    db: AsyncSession = TaskiqDepends(get_db)
) -> dict:    
    org_repo = OrganizationRepository(db)
    doc_repo = DocumentRepository(db)
    
    db_org = await org_repo.get_by_slug(org_slug)
    if not db_org:
        return {"status": "error", "message": "Org not found"}

    results = await run_deep_crawl(url=db_org.url, depth=depth, max_pages=max_pages)
    queued_urls = set()

    for result in results:
        if not result.success:
            continue
            
        normalized_url = result.url.rstrip('/')
        if normalized_url in queued_urls:
            continue

        fit_md = result.markdown.fit_markdown if result.markdown else None

        if not fit_md or len(fit_md.strip()) < 100:
            continue

        content_hash = hashlib.md5(fit_md.encode('utf-8')).hexdigest()
        existing_doc = await doc_repo.get_by_url_and_org(result.url, db_org.id)
        
        if existing_doc and existing_doc.content_hash == content_hash:
            continue

        queued_urls.add(normalized_url)
        await process_and_store_page_task.kiq(result=result, org_id=db_org.id)

    return {
        "status": "success",
        "org_slug": org_slug,
        "results_found": len(results),
    }