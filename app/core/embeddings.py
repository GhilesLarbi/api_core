import os
from fastembed import TextEmbedding

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        cache_path = "/models_cache"
        os.makedirs(cache_path, exist_ok=True)
        
        _model = TextEmbedding(
            model_name="intfloat/multilingual-e5-large",
            # model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            cache_dir=cache_path
        )
    return _model