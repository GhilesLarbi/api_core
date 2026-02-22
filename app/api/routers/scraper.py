# app/api/routers/scraper.py
import httpx
from selectolax.parser import HTMLParser
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.organization import Organization
from app.models.document import Document
from app.models.chunk import Chunk
from app.models.enums import LanguageEnum
from app.core.embeddings import get_embedding_model # Correct import

router = APIRouter()

@router.post("/fill-db")
async def fill_db(org_slug: str, url: str, db: AsyncSession = Depends(get_db)):
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        resp = await client.get(url, timeout=20.0)
        html = resp.text

    tree = HTMLParser(html)
    title = tree.css_first("title").text() if tree.css_first("title") else "Untitled"
    raw_text = tree.body.text(separator=" ", strip=True) 

    res = await db.execute(select(Organization).where(Organization.slug == org_slug))
    org = res.scalar_one()

    new_doc = Document(
        organization_id=org.id,
        url=url,
        title=title,
        lang=LanguageEnum.EN,
        content_hash="static_hash"
    )
    db.add(new_doc)
    await db.flush() 

    words = raw_text.split()
    chunks_text = [" ".join(words[i : i + 400]) for i in range(0, len(words), 400)]

    # Use the getter inside the function
    model = get_embedding_model()
    vectors = list(model.embed(chunks_text))

    for i, (txt, vec) in enumerate(zip(chunks_text, vectors)):
        db.add(Chunk(document_id=new_doc.id, chunk_index=i, content=txt, embedding=vec.tolist()))

    await db.commit()
    return {"status": "success", "chunks_created": len(chunks_text)}