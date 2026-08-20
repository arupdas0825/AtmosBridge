from typing import List, Optional
from fastapi import APIRouter, Query
from backend.models.schemas import DataSourceInfo
from backend.services.storage_service import storage
from backend.services.data_service import data_service

router = APIRouter(prefix="/data-sources", tags=["Data Sources & Transparency"])

@router.get("", response_model=List[DataSourceInfo])
def get_data_sources():
    return [
        {
            "name": "Live Ground Air Quality Telemetry",
            "provider": "Open-Meteo & OpenAQ Verified Network",
            "provenance": "observed",
            "protocol": "REST / JSON (PM2.5, PM10, NO2, SO2, CO, O3, US AQI)",
            "update_cadence": "Hourly Live",
            "description": "Continuous baseline atmospheric measurements from verified global government and meteorological monitoring networks.",
            "is_live": True
        },
        {
            "name": "Meteorological & Atmospheric Boundary Feeds",
            "provider": "Open-Meteo Public Service",
            "provenance": "observed",
            "protocol": "REST / JSON (Temp, Humidity, Wind Vector, Surface Pressure)",
            "update_cadence": "Hourly Live",
            "description": "High-resolution planetary boundary layer wind vectors and thermal stratification for plume dispersion modeling.",
            "is_live": True
        },
        {
            "name": "Multimodal Citizen Sighting Intelligence",
            "provider": "Community Environmental Reporters",
            "provenance": "inferred",
            "protocol": "Multipart / Web Speech Audio / JPEG Imagery",
            "update_cadence": "Real-time Event Driven",
            "description": "Hyperlocal citizen sightings structured through Gemini multimodal vision and structured analysis.",
            "is_live": True
        }
    ]

@router.get("/air-quality")
def get_air_quality(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    force_refresh: bool = Query(False, description="Bypass cache")
):
    """
    Fetch verified live air quality measurements from public station APIs.
    """
    return data_service.get_air_quality(lat, lon, force_refresh=force_refresh)

@router.get("/weather")
def get_weather(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    force_refresh: bool = Query(False, description="Bypass cache")
):
    """
    Fetch verified live meteorological observations.
    """
    return data_service.get_weather(lat, lon, force_refresh=force_refresh)

@router.get("/sensors")
def get_sensors(country: Optional[str] = None):
    """
    Returns registered public monitoring stations. Starts empty unless real sensors are configured.
    """
    return storage.get_sensors(country=country)

@router.get("/satellite")
def get_satellite():
    return storage.get_satellite_grid()

@router.get("/audit-log")
def get_audit_log():
    return storage.get_audit_log()
