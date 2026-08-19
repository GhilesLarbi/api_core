from enum import StrEnum
from typing import Optional
from pydantic import BaseModel

#########################################################################################################
#########################################################################################################
class FileType(BaseModel):
    content_type: str
    extension: str
    magic_bytes: Optional[bytes] = None  # signature at offset 0; None = text-based / offset-based

#########################################################################################################
#########################################################################################################
class AllowedContentType:
    # Static images (no animated GIF).
    JPEG = FileType(content_type="image/jpeg", extension="jpg", magic_bytes=b"\xff\xd8\xff")
    PNG = FileType(content_type="image/png", extension="png", magic_bytes=b"\x89PNG\r\n\x1a\n")
    WEBP = FileType(content_type="image/webp", extension="webp", magic_bytes=b"RIFF")
    AVIF = FileType(content_type="image/avif", extension="avif", magic_bytes=None)
    HEIC = FileType(content_type="image/heic", extension="heic", magic_bytes=None)
    HEIF = FileType(content_type="image/heif", extension="heif", magic_bytes=None)
    BMP = FileType(content_type="image/bmp", extension="bmp", magic_bytes=b"BM")
    TIFF = FileType(content_type="image/tiff", extension="tiff", magic_bytes=b"II*\x00")
    SVG = FileType(content_type="image/svg+xml", extension="svg", magic_bytes=None)  # XML text; XSS risk if inline

    # Recorded in the browser: what MediaRecorder produces is webm on Chrome and
    # Firefox, mp4 on Safari, and audio only recordings are the same containers.
    WEBM = FileType(content_type="video/webm", extension="webm", magic_bytes=b"\x1a\x45\xdf\xa3")
    MP4 = FileType(content_type="video/mp4", extension="mp4", magic_bytes=None)  # ftyp at offset 4
    WEBM_AUDIO = FileType(content_type="audio/webm", extension="webm", magic_bytes=b"\x1a\x45\xdf\xa3")
    MP4_AUDIO = FileType(content_type="audio/mp4", extension="m4a", magic_bytes=None)  # ftyp at offset 4

    # PDF
    PDF = FileType(content_type="application/pdf", extension="pdf", magic_bytes=b"%PDF")

    # Microsoft Word
    DOC = FileType(content_type="application/msword", extension="doc", magic_bytes=b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    DOCX = FileType(content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension="docx", magic_bytes=b"PK\x03\x04")

    # Microsoft Excel
    XLS = FileType(content_type="application/vnd.ms-excel", extension="xls", magic_bytes=b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    XLSX = FileType(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension="xlsx", magic_bytes=b"PK\x03\x04")

    # Microsoft PowerPoint
    PPT = FileType(content_type="application/vnd.ms-powerpoint", extension="ppt", magic_bytes=b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    PPTX = FileType(content_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", extension="pptx", magic_bytes=b"PK\x03\x04")

    # Text / other documents
    TXT = FileType(content_type="text/plain", extension="txt", magic_bytes=None)
    CSV = FileType(content_type="text/csv", extension="csv", magic_bytes=None)
    RTF = FileType(content_type="application/rtf", extension="rtf", magic_bytes=b"{\\rtf")

    #########################################################################################################
    #########################################################################################################
    @classmethod
    def by_content_type(cls, content_type: str) -> Optional[FileType]:
        for value in vars(cls).values():
            if isinstance(value, FileType) and value.content_type == content_type:
                return value
        return None

#########################################################################################################
#########################################################################################################
# Derived from the registry above so the API param renders as a dropdown of MIME types in the OpenAPI docs.
AllowedContentTypeEnum = StrEnum(
    "AllowedContentTypeEnum",
    {name: file_type.content_type for name, file_type in vars(AllowedContentType).items() if isinstance(file_type, FileType)},
)
