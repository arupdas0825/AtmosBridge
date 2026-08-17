from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.services.storage_service import storage
from backend.services.model import predictor
from backend.models.schemas import PredictionResponse

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.get("", response_model=PredictionResponse)
def get_prediction(
    hotspot_id: Optional[str] = Query(None, description="Hotspot ID to forecast"),
    latitude: Optional[float] = Query(None, description="Custom latitude"),
    longitude: Optional[float] = Query(None, description="Custom longitude")
):
    lat = latitude or 28.6139
    lon = longitude or 77.2090
    base_pm25 = 140.0
    temp = 28.0
    humidity = 62.0
    wind_spd = 6.5
    wind_dir = 310.0
    report_count = 5
    satellite_aod = 0.65

    if hotspot_id:
        hotspot = storage.get_hotspot_by_id(hotspot_id)
        if hotspot:
            lat = hotspot.get("latitude", lat)
            lon = hotspot.get("longitude", lon)
            p = hotspot.get("pollutants", {})
            base_pm25 = p.get("pm25", {}).get("value", base_pm25)
            w = hotspot.get("weather", {})
            temp = w.get("temperature", temp)
            humidity = w.get("humidity", humidity)
            wind_spd = w.get("wind_speed", wind_spd)
            wind_dir = w.get("wind_direction", wind_dir)
            report_count = hotspot.get("reports_count", report_count)
            sat = hotspot.get("satellite_aerosol_index", {})
            satellite_aod = sat.get("value", satellite_aod)

    prediction_result = predictor.predict(
        base_pm25=base_pm25,
        temperature=temp,
        humidity=humidity,
        wind_speed=wind_spd,
        wind_direction=wind_dir,
        report_count=report_count,
        satellite_aod=satellite_aod
    )

    return {
        "hotspot_id": hotspot_id,
        "latitude": lat,
        "longitude": lon,
        "forecast": prediction_result["forecast"],
        "feature_importance": prediction_result["feature_importance"],
        "model_metadata": prediction_result["model_metadata"]
    }
