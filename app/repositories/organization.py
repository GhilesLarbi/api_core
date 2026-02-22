# app/repositories/organization.py
import uuid
from typing import Optional, Dict, Any
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base_repository import BaseRepository
from app.models.organization import Organization
from app.models.document import Document
from app.models.chunk import Chunk

class OrganizationRepository(BaseRepository[Organization]):

    #################################################################################
    #################################################################################
    def __init__(self, db: AsyncSession):
        super().__init__(Organization, db)


    #################################################################################
    #################################################################################
    async def get_by_slug(self, slug: str) -> Optional[Organization]:
        result = await self.db.execute(select(self.model).where(self.model.slug == slug))
        return result.scalar_one_or_none()


    #################################################################################
    #################################################################################
    def create(self, name: str, slug: str, url: Optional[str] = None) -> Organization:
        new_org = self.model(name=name, slug=slug, url=url)
        self.db.add(new_org)
        return new_org


    #################################################################################
    #################################################################################
    async def delete_by_slug(self, slug: str) -> bool:
        stmt = delete(self.model).where(self.model.slug == slug)
        result = await self.db.execute(stmt)
        return result.rowcount > 0

    #################################################################################
    #################################################################################
    async def get_stats(self, org_id: uuid.UUID) -> Dict[str, Any]:
        doc_count_stmt = select(func.count(Document.id)).where(Document.organization_id == org_id)
        doc_count_res = await self.db.execute(doc_count_stmt)
        doc_count = doc_count_res.scalar() or 0

        chunk_count_stmt = (
            select(func.count(Chunk.id))
            .join(Document, Chunk.document_id == Document.id)
            .where(Document.organization_id == org_id)
        )
        chunk_count_res = await self.db.execute(chunk_count_stmt)
        chunk_count = chunk_count_res.scalar() or 0

        lang_stmt = (
            select(Document.lang, func.count(Document.id))
            .where(Document.organization_id == org_id)
            .group_by(Document.lang)
        )
        lang_res = await self.db.execute(lang_stmt)
        languages = {lang.value: count for lang, count in lang_res.all()}

        return {
            "total_documents": doc_count,
            "total_chunks": chunk_count,
            "languages": languages
        }