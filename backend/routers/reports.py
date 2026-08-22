import os
import uuid
import time
import logging
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.services.storage_service import storage
from backend.services.gemini_service import gemini_service, GeminiUnavailableError
from backend.services.risk_engine import risk_engine
from backend.models.schemas import ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])
logger = logging.getLogger(__name__)

# Simple IP-based rate limiting (15 submissions per minute per IP)
ip_rate_limits = {}

@router.post("", response_model=ReportResponse)
async def create_report(
    request: Request,
    description: Optional[str] = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: Optional[str] = Form(None),
    language: str = Form("en"),
    voice_transcript: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    # 1. Rate Limiting Check
    client_ip = request.client.host if (request and request.client) else "127.0.0.1"
    now = time.time()
    if client_ip in ip_rate_limits:
        timestamps = [t for t in ip_rate_limits[client_ip] if now - t < 60]
        if len(timestamps) >= 15:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": "Rate limit exceeded. Please wait a minute before submitting again.",
                    "stage": "validation"
                }
            )
        timestamps.append(now)
        ip_rate_limits[client_ip] = timestamps
    else:
        ip_rate_limits[client_ip] = [now]

    # 2. Input Validation (Text / Photo / GPS)
    desc_clean = (description or "").strip()
    has_photo = photo and bool(getattr(photo, "filename", None))
    if not desc_clean and not has_photo:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Please provide a description or upload a photo of the pollution sighting.",
                "stage": "validation"
            }
        )

    if not desc_clean and has_photo:
        desc_clean = "Pollution sighting photo evidence attached."

    if len(desc_clean) > 2000:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Description exceeds maximum length of 2000 characters.",
                "stage": "validation"
            }
        )

    if not (-90.0 <= latitude <= 90.0):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Latitude must be a valid coordinate between -90 and +90 degrees.",
                "stage": "validation"
            }
        )

    if not (-180.0 <= longitude <= 180.0):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Longitude must be a valid coordinate between -180 and +180 degrees.",
                "stage": "validation"
            }
        )

    # 3. Process Photo Upload
    photo_url = None
    image_bytes = None
    image_mime_type = "image/jpeg"

    if photo and getattr(photo, "filename", None):
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if photo.content_type not in allowed_types:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Image validation failed. Allowed formats: JPEG, PNG, WebP.",
                    "stage": "upload"
                }
            )

        try:
            image_bytes = await photo.read()
        except Exception as e:
            logger.error(f"[Upload Error] Failed reading file: {e}")
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Failed to process uploaded image file.",
                    "stage": "upload"
                }
            )

        if len(image_bytes) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Image file exceeds maximum 10 MB size limit.",
                    "stage": "upload"
                }
            )

        image_mime_type = photo.content_type
        file_ext = os.path.splitext(photo.filename)[1] or ".jpg"
        saved_filename = f"{uuid.uuid4().hex}{file_ext}"
        try:
            saved_path = settings.UPLOADS_DIR / saved_filename
            with open(saved_path, "wb") as f:
                f.write(image_bytes)
            photo_url = f"/static/uploads/{saved_filename}"
        except Exception:
            import base64
            b64_str = base64.b64encode(image_bytes).decode("utf-8")
            photo_url = f"data:{image_mime_type};base64,{b64_str}"

    # 4. Trigger Server-Side Gemini Multimodal Analysis
    try:
        analysis_dict = gemini_service.analyze_report(
            description=desc_clean,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
            latitude=latitude,
            longitude=longitude,
            language=language,
            voice_transcript=voice_transcript
        )
    except GeminiUnavailableError as e:
        logger.error(f"[Gemini Error] {e}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Gemini analysis is temporarily unavailable.",
                "stage": "gemini"
            }
        )
    except Exception as e:
        logger.error(f"[Gemini Exception] {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Gemini analysis service encountered an unexpected error.",
                "stage": "gemini"
            }
        )

    # 5. Build Report Record
    report_id = f"rep_{uuid.uuid4().hex[:8]}"
    report_record = {
        "success": True,
        "incident_id": report_id,
        "id": report_id,
        "description": desc_clean,
        "latitude": latitude,
        "longitude": longitude,
        "location_name": location_name or f"Coords ({round(latitude, 3)}, {round(longitude, 3)})",
        "language": language,
        "voice_transcript": voice_transcript,
        "photo_url": photo_url,
        "analysis": analysis_dict,
        "status": "analyzed",
        "provenance": {
            "analysis": "inferred",
            "report_input": "observed"
        }
    }

    # 6. Save Report to Storage
    try:
        saved_report = storage.add_report(report_record)
    except Exception as e:
        logger.error(f"[Storage Error] Failed to save report: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to store report in database.",
                "stage": "storage"
            }
        )

    # 7. Process into Hotspot and Authority Alert via Risk Engine
    try:
        risk_engine.process_report_into_hotspot(saved_report, analysis_dict)
    except Exception as e:
        logger.warning(f"[Risk Engine Warning] {e}")

    return saved_report

@router.get("", response_model=List[ReportResponse])
def list_reports(limit: int = 50):
    reports = storage.get_reports()
    return reports[:limit]

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str):
    report = storage.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report
