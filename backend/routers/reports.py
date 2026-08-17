import os
import uuid
import time
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from backend.config import settings
from backend.services.storage_service import storage
from backend.services.gemini_service import gemini_service
from backend.services.risk_engine import risk_engine
from backend.models.schemas import ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

# Simple IP-based rate limiting (10 submissions per minute per IP)
ip_rate_limits = {}

@router.post("", response_model=ReportResponse)
async def create_report(
    request: Request,
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: Optional[str] = Form(None),
    language: str = Form("en"),
    voice_transcript: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    # 1. Rate Limiting Check
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    if client_ip in ip_rate_limits:
        timestamps = [t for t in ip_rate_limits[client_ip] if now - t < 60]
        if len(timestamps) >= 15:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a minute before submitting again.")
        timestamps.append(now)
        ip_rate_limits[client_ip] = timestamps
    else:
        ip_rate_limits[client_ip] = [now]

    # 2. Validate Description Length
    if len(description.strip()) < 3:
        raise HTTPException(status_code=400, detail="Description is too short. Please provide more detail.")
    if len(description) > 2000:
        raise HTTPException(status_code=400, detail="Description exceeds maximum length of 2000 characters.")

    # 3. Process Photo Upload
    photo_url = None
    image_bytes = None
    image_mime_type = "image/jpeg"

    if photo and photo.filename:
        # Validate MIME type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if photo.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid image format. Allowed formats: JPEG, PNG, WebP.")

        # Read image bytes & enforce 5MB cap
        image_bytes = await photo.read()
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file exceeds 5MB size limit.")

        image_mime_type = photo.content_type
        # Save image locally
        file_ext = os.path.splitext(photo.filename)[1] or ".jpg"
        saved_filename = f"{uuid.uuid4().hex}{file_ext}"
        saved_path = settings.UPLOADS_DIR / saved_filename
        with open(saved_path, "wb") as f:
            f.write(image_bytes)
        photo_url = f"/static/uploads/{saved_filename}"

    # 4. Trigger Server-Side Gemini Multimodal Analysis
    analysis_dict = gemini_service.analyze_report(
        description=description,
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
        latitude=latitude,
        longitude=longitude,
        language=language,
        voice_transcript=voice_transcript
    )

    # 5. Build Report Record
    report_id = f"rep_{uuid.uuid4().hex[:8]}"
    report_record = {
        "id": report_id,
        "description": description,
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

    # 6. Save Report
    saved_report = storage.add_report(report_record)

    # 7. Process into Hotspot and Authority Alert via Risk Engine
    risk_engine.process_report_into_hotspot(saved_report, analysis_dict)

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
