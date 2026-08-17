import base64
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from backend.services.gemini_service import gemini_service
from backend.models.schemas import GeminiAnalysisResult

router = APIRouter(prefix="/analyze", tags=["Multimodal Analysis"])

class AnalyzeRequest(BaseModel):
    text: str
    image_base64: Optional[str] = None
    image_mime_type: str = "image/jpeg"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: str = "en"
    voice_transcript: Optional[str] = None

@router.post("", response_model=GeminiAnalysisResult)
def analyze_multimodal(payload: AnalyzeRequest):
    image_bytes = None
    if payload.image_base64:
        try:
            # Handle data URL prefix if present
            raw_b64 = payload.image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            image_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    result = gemini_service.analyze_report(
        description=payload.text,
        image_bytes=image_bytes,
        image_mime_type=payload.image_mime_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        language=payload.language,
        voice_transcript=payload.voice_transcript
    )
    return result
