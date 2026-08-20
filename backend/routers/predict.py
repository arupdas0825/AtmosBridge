from typing import Optional
from fastapi import APIRouter, Query
from backend.services.storage_service import storage
from backend.services.data_service import data_service
from backend.services.model import predictor
from backend.models.schemas import PredictionResponse

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.get("", response_model=PredictionResponse)
def get_prediction(
    hotspot_id: Optional[str] = Query(None, description="Hotspot ID to forecast"),
    latitude: Optional[float] = Query(None, description="Custom latitude"),
    longitude: Optional[float] = Query(None, description="Custom longitude")
):
    """
    Generate atmospheric risk prediction only when sufficient real observational data exists.
    """
    lat = latitude
    lon = longitude
    base_pm25 = None
    temp = None
    humidity = None
    wind_spd = None
    wind_dir = None
    report_count = 0
    satellite_aod = 0.5

    if hotspot_id:
        hotspot = storage.get_hotspot_by_id(hotspot_id)
        if hotspot:
            lat = hotspot.get("latitude", lat)
            lon = hotspot.get("longitude", lon)
            p = hotspot.get("pollutants", {})
            if "pm25" in p and "value" in p["pm25"]:
                base_pm25 = p["pm25"]["value"]
            w = hotspot.get("weather", {})
            temp = w.get("temperature")
            humidity = w.get("humidity")
            wind_spd = w.get("wind_speed")
            wind_dir = w.get("wind_direction")
            report_count = hotspot.get("reports_count", 0)

    # If coordinates provided but no base_pm25, fetch live observations
    if base_pm25 is None and lat is not None and lon is not None:
        aq = data_service.get_air_quality(lat, lon)
        if aq.get("is_live") and "pm25" in aq.get("pollutants", {}):
            base_pm25 = aq["pollutants"]["pm25"].get("value")
        
        wea = data_service.get_weather(lat, lon)
        if wea.get("is_live"):
            temp = wea.get("temperature")
            humidity = wea.get("humidity")
            wind_spd = wea.get("wind_speed")
            wind_dir = wea.get("wind_direction")

    # Generate prediction ONLY if baseline observational telemetry exists
    if base_pm25 is not None and temp is not None and humidity is not None and wind_spd is not None:
        prediction_result = predictor.predict(
            base_pm25=base_pm25,
            temperature=temp,
            humidity=humidity,
            wind_speed=wind_spd,
            wind_direction=wind_dir or 0.0,
            report_count=report_count,
            satellite_aod=satellite_aod
        )
        if prediction_result.get("model_metadata", {}).get("status") != "insufficient_data":
            return {
                "hotspot_id": hotspot_id,
                "latitude": lat or 0.0,
                "longitude": lon or 0.0,
                "forecast": prediction_result["forecast"],
                "feature_importance": prediction_result["feature_importance"],
                "model_metadata": prediction_result["model_metadata"]
            }

    # If insufficient real observational data exists, return empty forecast
    return {
        "hotspot_id": hotspot_id,
        "latitude": lat or 0.0,
        "longitude": lon or 0.0,
        "forecast": [],
        "feature_importance": [],
        "model_metadata": {
            "model_type": "Physics-Grounded Atmospheric Risk Predictor",
            "status": "insufficient_data",
            "message": "Insufficient verified observational telemetry to compute 24h dispersion trajectory."
        }
    }
