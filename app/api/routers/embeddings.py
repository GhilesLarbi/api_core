from fastapi import APIRouter
from app.core.embeddings import get_embedding_model

router = APIRouter()

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