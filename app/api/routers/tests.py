from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db
from app.core.embeddings import get_embedding_model
from sqlalchemy.ext.asyncio import AsyncSession
from app.background_tasks.crawler import crawl_site_task
from app.background_tasks.scraper import scrape_and_store_url_task
from app.repositories.organization import OrganizationRepository
from app.repositories.chunk import ChunkRepository
from app.models.enums import LanguageEnum
from langdetect import detect
from app.core.ranker import get_ranker
from flashrank import RerankRequest


router = APIRouter()

##########################################################################################
##########################################################################################
@router.get("/test")
async def test(
    url: str,
    max_pages: int,
    org_slug: str
):
    # task_handle = await crawl_site_task.kiq(url=url, max_pages=max_pages)
    task_handle = await scrape_and_store_url_task.kiq(url=url, org_slug=org_slug)
    result = await task_handle.wait_result()
    
    return {
        "task_id": task_handle.task_id,
        "worker_output": result.return_value
    }

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