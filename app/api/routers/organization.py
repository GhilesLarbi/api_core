# app/api/routers/organization.py
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.organization import OrganizationRepository
from app.background_tasks.sync import sync_site_task
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


#################################################################################
#################################################################################
class OrganizationCreate(BaseModel):
    name: str
    slug: str
    url: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_organization(data: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    org = repo.create(name=data.name, slug=data.slug, url=data.url)
    await db.commit()
    return {"id": org.id, "name": org.name, "slug": org.slug}


#################################################################################
#################################################################################
@router.get("/{slug}/stats")
async def get_organization_stats(slug: str, db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    org = await repo.get_by_slug(slug)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    stats = await repo.get_stats(org.id)
    return {
        "organization": org.name,
        "base_url": org.url,
        "statistics": stats
    }


#################################################################################
#################################################################################
@router.post("/{slug}/sync")
async def start_scraping(
    slug: str, 
    max_pages: int = 1000,
    depth: int = 10,
    db: AsyncSession = Depends(get_db)
):
    repo = OrganizationRepository(db)
    org = await repo.get_by_slug(slug)
    if not org or not org.url:
        raise HTTPException(status_code=404, detail="Org not found or has no URL configured")

    task = await sync_site_task.kiq(
        org_slug=slug, 
        max_pages=max_pages,
        depth=depth
    )

    return {
        "status": "started",
        "task_id": task.task_id,
        "info": "The crawler is mapping the site. Extraction will follow automatically."
    }


#################################################################################
#################################################################################
@router.delete("/{slug}")
async def delete_organization(slug: str, db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    success = await repo.delete_by_slug(slug)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await db.commit()
    return {"message": f"Organization {slug} and all associated data deleted."}