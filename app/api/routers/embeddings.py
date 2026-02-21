import os
from fastapi import APIRouter
from fastembed import TextEmbedding

router = APIRouter()

cache_path = "/code/models_cache"
os.makedirs(cache_path, exist_ok=True)

model = TextEmbedding(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    cache_dir=cache_path
)

@router.post("/vectorize")
async def get_vector(text: str):
    embeddings = list(model.embed([text]))
    vector = embeddings[0].tolist()
    
    return {
        "text": text,
        "dimensions": len(vector),
        "vector": vector
    }