from app.core.config import settings
from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


#####################################################################################
#####################################################################################
app = FastAPI(
    title=settings.PROJECT_NAME, 
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

#####################################################################################
#####################################################################################
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#####################################################################################
#####################################################################################
app.include_router(router=router, prefix=settings.API_V1_STR)


#####################################################################################
#####################################################################################
if __name__ == "__main__":    
    uvicorn.run(
        "app.main:app", 
        host=settings.API_HOST, 
        port=settings.API_PORT, 
        reload=True,
        log_level="info",
        access_log=False,
        use_colors=False,
        timeout_graceful_shutdown=1
    )
