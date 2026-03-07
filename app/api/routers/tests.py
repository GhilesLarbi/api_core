from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.core.embeddings import get_embedding_model
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.organization import OrganizationRepository
from app.repositories.chunk import ChunkRepository
from app.models.enums import LanguageEnum
from langdetect import detect
from app.core.ranker import get_ranker
from flashrank import RerankRequest

from crawl4ai.docker_client import Crawl4aiDockerClient
from crawl4ai import CrawlerRunConfig, CacheMode
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_scraping_strategy import LXMLWebScrapingStrategy

router = APIRouter()

##########################################################################################
##########################################################################################
@router.get("/test")
async def crawl_test(url: str, depth: int = 1):
    prune_filter = PruningContentFilter(
        threshold=0.4,
        threshold_type="dynamic",
        min_word_threshold=5
    )

    md_generator = DefaultMarkdownGenerator(
        content_filter=prune_filter,
        options={
            "ignore_links": True,
            "ignore_images": True,
            "skip_internal_links": True
        }
    )

    deep_search_strat = BFSDeepCrawlStrategy(
        max_depth=depth,
        include_external=False,
        max_pages=20
    )

    run_conf = CrawlerRunConfig(
        deep_crawl_strategy=deep_search_strat,
        markdown_generator=md_generator,
        scraping_strategy=LXMLWebScrapingStrategy(),
        cache_mode=CacheMode.BYPASS,
        verbose=True
    )

    async with Crawl4aiDockerClient(base_url="http://crawl4ai:11235", timeout=600.0) as client:
        results = await client.crawl(
            urls=[url],
            crawler_config=run_conf
        )

        return results
    
##########################################################################################
##########################################################################################
@router.post("/vectorize")
async def get_vector(text: str):
    model = get_embedding_model()
    embeddings = list(model.embed([text]))
    vector = embeddings[0].tolist()
    
    return {
        "text": text,
        "dimensions": len(vector),
        "vector": vector
    }




##########################################################################################
##########################################################################################
@router.post("/ranker")
async def ranker(
    org_slug: str, 
    question: str, 
    db: AsyncSession = Depends(get_db)
):
    org_repo = OrganizationRepository(db)
    db_organiztion = await org_repo.get_by_slug(org_slug)
    if not db_organiztion:
        raise HTTPException(status_code=404, detail="Org not found")

    try:
        lang_code = detect(question).upper()
        q_lang = LanguageEnum[lang_code] if lang_code in LanguageEnum.__members__ else LanguageEnum.EN
    except:
        q_lang = LanguageEnum.EN

    model = get_embedding_model()
    formatted_question = f"query: {question}"     
    embeddings = list(model.embed([formatted_question]))
    question_vector = embeddings[0].tolist()

    chunk_repo = ChunkRepository(db)
    relevant_docs = await chunk_repo.search_with_window(
        org_id=db_organiztion.id,
        lang=q_lang,
        question_vector=question_vector,
        limit=10, 
        window_size=3
    )
    
    if not relevant_docs:
        return []
    
    ranker = get_ranker()

    # 1. Map results to Passages
    # Note: doc['id'] from your search_with_window is the DOCUMENT ID
    passages = [
        {
            "id": str(doc['id']),  # FlashRank needs an ID, we use the Document ID
            "text": doc['content'],
            "meta": {
                "chunk_ids": doc['chunk_ids'] # Store the list of chunk IDs in meta
            }
        } for doc in relevant_docs
    ]

    rerank_request = RerankRequest(query=question, passages=passages)
    rerank_results = ranker.rerank(rerank_request)

    # 2. Extract the top result
    top_docs = rerank_results[:2]

    serializable_results = []
    for doc in top_docs:
        serializable_results.append({
            "document_id": doc["id"],         # This is the doc_id
            "chunk_ids": doc["meta"]["chunk_ids"], # The list of chunks that made up this text
            "text": doc["text"],
            "score": float(doc["score"]),
        })

    return serializable_results