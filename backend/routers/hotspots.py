from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.services.storage_service import storage
from backend.models.schemas import Hotspot

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])

@router.get("", response_model=List[Hotspot])
def list_hotspots(
    country: Optional[str] = Query(None, description="Filter by BRICS country"),
    min_severity: Optional[int] = Query(None, ge=1, le=4, description="Minimum severity 1-4"),
    status: Optional[str] = Query(None, description="Filter by active status")
):
    hotspots = storage.get_hotspots(country=country)
    if isinstance(min_severity, int):
        hotspots = [h for h in hotspots if h.get("severity", 1) >= min_severity]
    if isinstance(status, str) and status.lower() != "all":
        hotspots = [h for h in hotspots if h.get("status", "").lower() == status.lower()]
    return hotspots

@router.get("/{hotspot_id}", response_model=Hotspot)
def get_hotspot(hotspot_id: str):
    hotspot = storage.get_hotspot_by_id(hotspot_id)
    if not hotspot:
        raise HTTPException(status_code=404, detail="Hotspot not found.")
    return hotspot
