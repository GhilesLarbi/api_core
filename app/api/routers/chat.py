from ollama import AsyncClient
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException
from langdetect import detect
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.enums import LanguageEnum
from app.core.embeddings import get_embedding_model
from app.core.ranker import get_ranker
from flashrank import RerankRequest
from app.repositories.organization import OrganizationRepository
from app.repositories.chunk import ChunkRepository
import json

router = APIRouter()

@router.post("/ask")
async def ask_question_stream(
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

    print(q_lang)
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
        async def empty_gen():
            yield f"data: {json.dumps({'content': 'No info found.'})}\n\n"
        return StreamingResponse(empty_gen(), media_type="text/event-stream")

    ranker = get_ranker()
    passages = [{"id": i, "text": doc['content']} for i, doc in enumerate(relevant_docs)]
    rerank_request = RerankRequest(query=question, passages=passages)
    rerank_results = ranker.rerank(rerank_request)

    top_docs = rerank_results[:2]
    context_text = "\n\n".join([doc['text'] for doc in top_docs])

    prompt = f"""
    Answer the question based on the context below. 
    If the answer isn't in the context, say you don't know.
    
    Context:
    {context_text}

    Question: {question}

    Answer:
    """

    async def event_generator():
        client = AsyncClient(host='http://ollama:11434')
        
        async for chunk in await client.generate(
            model="qwen2.5:1.5b", 
            prompt=prompt,
            options={
                "temperature": 0,
                "num_thread": 8,
                "num_ctx": 4096,
                "num_batch": 512
            },
            stream=True 
        ):
            data = json.dumps({"content": chunk['response']})
            yield f"data: {data}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")