import time
import requests
from typing import Dict, Any, Optional, Tuple
from backend.config import settings

class DataService:
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self.CACHE_TTL = 300  # 5 minutes cache TTL

    def _get_cached(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, data = self._cache[key]
            if time.time() - timestamp < self.CACHE_TTL:
                return data
        return None

    def _set_cached(self, key: str, data: Any):
        self._cache[key] = (time.time(), data)

    def get_weather(self, lat: float, lon: float, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetch real-time weather from Open-Meteo API. Returns unavailable status if API fails.
        """
        cache_key = f"weather_{round(lat, 3)}_{round(lon, 3)}"
        if not force_refresh:
            cached = self._get_cached(cache_key)
            if cached:
                return cached

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure"
        try:
            resp = requests.get(url, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                result = {
                    "is_live": True,
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "surface_pressure": current.get("surface_pressure"),
                    "timestamp": current.get("time"),
                    "provenance": "observed",
                    "source": "Open-Meteo Public Meteorological Service"
                }
                self._set_cached(cache_key, result)
                return result
        except Exception:
            pass

        # If live API is unreachable, return unavailable state (NEVER invent fake weather values)
        unavailable = {
            "is_live": False,
            "status": "unavailable",
            "message": "Live meteorological data unavailable for this location",
            "provenance": "observed"
        }
        return unavailable

    def get_air_quality(self, lat: float, lon: float, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetch verified live air quality telemetry from Open-Meteo / Copernicus Atmospheric Service.
        Returns unavailable state if live data is not accessible.
        """
        cache_key = f"aqi_{round(lat, 3)}_{round(lon, 3)}"
        if not force_refresh:
            cached = self._get_cached(cache_key)
            if cached:
                return cached

        # Check OpenAQ API v3 if API key is present
        if settings.OPENAQ_API_KEY:
            try:
                headers = {"X-API-Key": settings.OPENAQ_API_KEY}
                url = f"https://api.openaq.org/v3/locations?coordinates={lat},{lon}&radius=25000&limit=1"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results and len(results) > 0:
                        loc = results[0]
                        # Fetch latest measurements for location
                        loc_id = loc.get("id")
                        if loc_id:
                            m_resp = requests.get(f"https://api.openaq.org/v3/locations/{loc_id}/latest", headers=headers, timeout=5)
                            if m_resp.status_code == 200:
                                m_data = m_resp.json().get("results", [])
                                pollutants = {}
                                for m in m_data:
                                    param = m.get("parameter", {}).get("name")
                                    val = m.get("value")
                                    unit = m.get("parameter", {}).get("units", "µg/m³")
                                    if param and val is not None:
                                        pollutants[param] = {"value": round(val, 1), "unit": unit, "provenance": "observed"}
                                
                                if pollutants:
                                    res = {
                                        "is_live": True,
                                        "status": "active",
                                        "location_name": loc.get("name", "Verified OpenAQ Station"),
                                        "pollutants": pollutants,
                                        "timestamp": loc.get("datetimeLast", {}).get("utc"),
                                        "provenance": "observed",
                                        "source": "OpenAQ Live Monitoring Network"
                                    }
                                    self._set_cached(cache_key, res)
                                    return res
            except Exception:
                pass

        # Primary Live Source: Open-Meteo Air Quality & CAMS Telemetry
        try:
            url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi"
            resp = requests.get(url, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                
                pollutants = {}
                if current.get("pm2_5") is not None:
                    pollutants["pm25"] = {
                        "value": round(float(current["pm2_5"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }
                if current.get("pm10") is not None:
                    pollutants["pm10"] = {
                        "value": round(float(current["pm10"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }
                if current.get("nitrogen_dioxide") is not None:
                    pollutants["no2"] = {
                        "value": round(float(current["nitrogen_dioxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }
                if current.get("sulphur_dioxide") is not None:
                    pollutants["so2"] = {
                        "value": round(float(current["sulphur_dioxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }
                if current.get("carbon_monoxide") is not None:
                    pollutants["co"] = {
                        "value": round(float(current["carbon_monoxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }
                if current.get("ozone") is not None:
                    pollutants["o3"] = {
                        "value": round(float(current["ozone"]), 1),
                        "unit": "µg/m³",
                        "provenance": "observed"
                    }

                us_aqi = current.get("us_aqi")
                european_aqi = current.get("european_aqi")
                timestamp = current.get("time")

                result = {
                    "is_live": True,
                    "status": "active",
                    "latitude": lat,
                    "longitude": lon,
                    "us_aqi": us_aqi,
                    "european_aqi": european_aqi,
                    "pollutants": pollutants,
                    "timestamp": timestamp,
                    "provenance": "observed",
                    "source": "Open-Meteo / Copernicus Atmospheric Service"
                }
                self._set_cached(cache_key, result)
                return result
        except Exception:
            pass

        # If live telemetry is unavailable, return clean unavailable response (NEVER invent fake numbers)
        unavailable = {
            "is_live": False,
            "status": "unavailable",
            "message": "No current observations available for this location",
            "pollutants": {},
            "provenance": "observed"
        }
        return unavailable

data_service = DataService()
