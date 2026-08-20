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
                    "provenance": "modelled",
                    "source": "Open-Meteo Meteorological Reanalysis"
                }
                self._set_cached(cache_key, result)
                return result
        except Exception:
            pass

        # If API is unreachable, return clean unavailable state
        unavailable = {
            "is_live": False,
            "status": "unavailable",
            "message": "Live meteorological data unavailable for this location",
            "provenance": "modelled"
        }
        return unavailable

    def get_air_quality(self, lat: float, lon: float, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetch verified air quality telemetry.
        - Ground Station feeds (OpenAQ) -> Provenance: "observed"
        - Atmospheric Transport / Reanalysis (Open-Meteo / Copernicus CAMS) -> Provenance: "modelled"
        Returns unavailable state if live data is not accessible.
        """
        cache_key = f"aqi_{round(lat, 3)}_{round(lon, 3)}"
        if not force_refresh:
            cached = self._get_cached(cache_key)
            if cached:
                return cached

        # 1. Check OpenAQ API v3 for direct ground-station observations if API key is present
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
                                        pollutants[param] = {
                                            "value": round(val, 1),
                                            "unit": unit,
                                            "provenance": "observed"
                                        }
                                
                                if pollutants:
                                    res = {
                                        "is_live": True,
                                        "status": "active",
                                        "location_name": loc.get("name", "Verified Ground Monitoring Station"),
                                        "pollutants": pollutants,
                                        "timestamp": loc.get("datetimeLast", {}).get("utc"),
                                        "provenance": "observed",
                                        "data_type": "Observed (Physical Ground Station)",
                                        "source": "OpenAQ Monitoring Station",
                                        "aqi_type": "calculated"
                                    }
                                    self._set_cached(cache_key, res)
                                    return res
            except Exception:
                pass

        # 2. Public Source: Open-Meteo Air Quality API (Atmospheric Transport / CAMS Reanalysis Model)
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
                        "provenance": "modelled"
                    }
                if current.get("pm10") is not None:
                    pollutants["pm10"] = {
                        "value": round(float(current["pm10"]), 1),
                        "unit": "µg/m³",
                        "provenance": "modelled"
                    }
                if current.get("nitrogen_dioxide") is not None:
                    pollutants["no2"] = {
                        "value": round(float(current["nitrogen_dioxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "modelled"
                    }
                if current.get("sulphur_dioxide") is not None:
                    pollutants["so2"] = {
                        "value": round(float(current["sulphur_dioxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "modelled"
                    }
                if current.get("carbon_monoxide") is not None:
                    pollutants["co"] = {
                        "value": round(float(current["carbon_monoxide"]), 1),
                        "unit": "µg/m³",
                        "provenance": "modelled"
                    }
                if current.get("ozone") is not None:
                    pollutants["o3"] = {
                        "value": round(float(current["ozone"]), 1),
                        "unit": "µg/m³",
                        "provenance": "modelled"
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
                    "aqi_type": "reported" if us_aqi is not None else "calculated",
                    "pollutants": pollutants,
                    "timestamp": timestamp,
                    "provenance": "modelled",
                    "data_type": "Modelled (Atmospheric Chemical Transport)",
                    "source": "Open-Meteo Air Quality",
                    "atmospheric_source": "Copernicus Atmosphere"
                }
                self._set_cached(cache_key, result)
                return result
        except Exception:
            pass

        # If data is unavailable, return clean unavailable response with zero fake numbers
        unavailable = {
            "is_live": False,
            "status": "unavailable",
            "message": "No verified environmental data is currently available for this location.",
            "pollutants": {},
            "provenance": "modelled"
        }
        return unavailable

data_service = DataService()
