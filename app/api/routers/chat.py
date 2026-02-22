from ollama import Client
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.organization import Organization
from app.models.document import Document
from app.models.chunk import Chunk
from app.core.embeddings import get_embedding_model

router = APIRouter()

@router.post("/ask")
async def ask_question(org_slug: str, question: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Organization).where(Organization.slug == org_slug))
    org = res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")

    model = get_embedding_model()
    question_vector = list(model.embed([question]))[0].tolist()

    search_query = (
        select(Chunk.content, Document.url)
        .join(Document, Chunk.document_id == Document.id)
        .where(Document.organization_id == org.id)
        .order_by(Chunk.embedding.cosine_distance(question_vector))
        .limit(3)
    )
    
    result = await db.execute(search_query)
    relevant_chunks = result.all()
    
    if not relevant_chunks:
        return {"answer": "I couldn't find any information."}

    context_text = "\n\n".join([f"Source: {c.url}\nContent: {c.content}" for c in relevant_chunks])
    
    prompt = f"""
    Use the following pieces of context to answer the question.
    Context: {context_text}
    Question: {question}
    Answer:
    """

    client = Client(host='http://ollama:11434')
    response = client.generate(model="qwen2.5:1.5b", prompt=prompt)

    return {
        "answer": response['response'],
        "sources": list(set([c.url for c in relevant_chunks]))
    }