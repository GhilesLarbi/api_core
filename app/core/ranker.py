import os
from flashrank import Ranker

_ranker = None

def get_ranker():
    """
    Returns a singleton instance of the FlashRank Ranker.
    Using 'ms-marco-MultiBERT-L-12' for high-performance multilingual support (AR, FR, EN).
    """
    global _ranker
    if _ranker is None:
        cache_path = "/models_cache"
        os.makedirs(cache_path, exist_ok=True)
        
        _ranker = Ranker(
            model_name="ms-marco-MultiBERT-L-12", 
            cache_dir=cache_path
        )
    return _ranker