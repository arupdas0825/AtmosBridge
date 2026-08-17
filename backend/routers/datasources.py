from typing import List
from fastapi import APIRouter
from backend.models.schemas import DataSourceInfo
from backend.services.storage_service import storage

router = APIRouter(prefix="/data-sources", tags=["Data Sources & Transparency"])

@router.get("", response_model=List[DataSourceInfo])
def get_data_sources():
    return [
        {
            "name": "Live Air Quality Ground Telemetry",
            "provider": "OpenAQ API v2",
            "provenance": "observed",
            "protocol": "REST / JSON (PM2.5, PM10, NO2, SO2, CO, O3)",
            "update_cadence": "Hourly",
            "description": "Continuous baseline atmospheric measurements from verified global government monitoring networks.",
            "is_live": True
        },
        {
            "name": "Meteorological & Atmospheric Boundary Feeds",
            "provider": "Open-Meteo API",
            "provenance": "observed",
            "protocol": "REST / JSON (Temp, Humidity, Wind Vector, Surface Pressure)",
            "update_cadence": "Real-Time / 15 min",
            "description": "High-resolution planetary boundary layer wind vectors and thermal stratification for plume dispersion modeling.",
            "is_live": True
        },
        {
            "name": "Multimodal Citizen Sighting Intelligence",
            "provider": "Community Environmental Reporters",
            "provenance": "inferred",
            "protocol": "Multipart / Web Speech Audio / JPEG Imagery",
            "update_cadence": "Real-time Event Driven",
            "description": "Hyperlocal citizen sightings structured through Gemini multimodal vision and function calling.",
            "is_live": True
        },
        {
            "name": "High-Density Micro-Sensor Mesh",
            "provider": "Seeded Hyperlocal Urban Sensor Grid",
            "provenance": "simulated",
            "protocol": "GeoJSON Spatial Point FeatureCollection",
            "update_cadence": "Simulated 15-min intervals",
            "description": "Realistic micro-sensor distribution across industrial clusters and residential boundaries in BRICS cities.",
            "is_live": False
        },
        {
            "name": "Satellite Aerosol Optical Depth (AOD) Proxy",
            "provider": "Synthetic Sentinel-5P / MODIS Aerosol Proxy Grid",
            "provenance": "simulated",
            "protocol": "GeoJSON Grid / Continuous Surface Matrix",
            "update_cadence": "Simulated Daily Orbit",
            "description": "Regional background aerosol loading and optical depth indicators benchmarked for demonstration.",
            "is_live": False
        },
        {
            "name": "Trans-Boundary Regional Drift Models",
            "provider": "Atmospheric Dispersion Corridor Simulator",
            "provenance": "predicted",
            "protocol": "GeoJSON Plume Vector Polygons",
            "update_cadence": "Continuous Scenario Engine",
            "description": "Cross-border wind transport modeling and bilateral notification corridors for BRICS sustainability coordination.",
            "is_live": False
        }
    ]

@router.get("/sensors")
def get_sensors(country: str = None):
    return storage.get_sensors(country=country)

@router.get("/satellite")
def get_satellite():
    return storage.get_satellite_grid()

@router.get("/audit-log")
def get_audit_log():
    return storage.get_audit_log()
