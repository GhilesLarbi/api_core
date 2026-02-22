import uuid
from typing import List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, or_
from app.repositories.base_repository import BaseRepository
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.enums import LanguageEnum

class ChunkRepository(BaseRepository[Chunk]):
    
    #################################################################################
    #################################################################################
    def __init__(self, db: AsyncSession):
        super().__init__(Chunk, db)

    #################################################################################
    #################################################################################
    async def delete_by_document_id(self, document_id: uuid.UUID) -> None:
        await self.db.execute(
            delete(self.model).where(self.model.document_id == document_id)
        )

    #################################################################################
    #################################################################################
    def create_many(self, chunks_data: List[Dict[str, Any]]) -> None:
        models_to_insert = [
            self.model(
                document_id=data["document_id"],
                chunk_index=data["chunk_index"],
                content=data["content"],
                embedding=data["embedding"]
            )
            for data in chunks_data
        ]
        self.db.add_all(models_to_insert)

    #################################################################################
    #################################################################################
    async def search_with_window(
        self, 
        org_id: uuid.UUID, 
        lang: LanguageEnum, 
        question_vector: list[float], 
        limit: int = 5,
        window_size: int = 2
    ) -> List[Dict[str, Any]]:
        
        stmt = (
            select(
                self.model.document_id,
                self.model.chunk_index,
                self.model.embedding.cosine_distance(question_vector).label("distance")
            )
            .join(Document, self.model.document_id == Document.id)
            .where(
                Document.organization_id == org_id, 
                Document.lang == lang
            )
            .order_by("distance")
            .limit(limit)
            .cte("seeds")
        )

        query = (
            select(self.model, Document)
            .join(Document, self.model.document_id == Document.id)
            .join(
                stmt, 
                (self.model.document_id == stmt.c.document_id) & 
                (self.model.chunk_index >= stmt.c.chunk_index - window_size) & 
                (self.model.chunk_index <= stmt.c.chunk_index + window_size)
            )
            .order_by(self.model.document_id, self.model.chunk_index)
        )

        result = await self.db.execute(query)
        rows = result.all()

        grouped_results = {}
        
        seen_chunks = set()

        for chunk, doc in rows:
            unique_key = (doc.id, chunk.id)
            
            if unique_key in seen_chunks:
                continue
            
            seen_chunks.add(unique_key)

            if doc.id not in grouped_results:
                grouped_results[doc.id] = {
                    "id": doc.id,
                    "source": doc.url,
                    "title": doc.title,
                    "chunks": [],
                    "chunk_ids": []
                }
            
            grouped_results[doc.id]["chunks"].append(chunk.content)
            grouped_results[doc.id]["chunk_ids"].append(chunk.id)

        # 4. Format Output
        final_output = []
        for doc_data in grouped_results.values():
            full_text = " ".join(doc_data["chunks"])
            final_output.append({
                "id": doc_data["id"],
                "source": doc_data["source"],
                "title": doc_data["title"],
                "content": full_text,
                "chunk_ids": doc_data["chunk_ids"]
            })

        return final_output