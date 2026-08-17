import time
import requests
from typing import Dict, Any, Optional, Tuple
from backend.config import settings
from backend.services.storage_service import storage

class DataService:
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self.CACHE_TTL = 900  # 15 minutes TTL

    def _get_cached(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, data = self._cache[key]
            if time.time() - timestamp < self.CACHE_TTL:
                return data
        return None

    def _set_cached(self, key: str, data: Any):
        self._cache[key] = (time.time(), data)

    def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch real-time weather from Open-Meteo API or fallback to realistic observation.
        """
        cache_key = f"weather_{round(lat, 2)}_{round(lon, 2)}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure"
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                result = {
                    "temperature": current.get("temperature_2m", 28.5),
                    "humidity": current.get("relative_humidity_2m", 62),
                    "wind_speed": current.get("wind_speed_10m", 8.4),
                    "wind_direction": current.get("wind_direction_10m", 315),
                    "surface_pressure": current.get("surface_pressure", 1012.0),
                    "provenance": "observed",
                    "source": "Open-Meteo Live API"
                }
                self._set_cached(cache_key, result)
                return result
        except Exception as e:
            # Fallback to nearest sensor / realistic meteorological baseline
            pass

        # Fallback realistic weather
        fallback = {
            "temperature": 30.2,
            "humidity": 64,
            "wind_speed": 6.8,
            "wind_direction": 290,
            "surface_pressure": 1011.5,
            "provenance": "simulated",
            "source": "Seeded Meteorological Baseline"
        }
        self._set_cached(cache_key, fallback)
        return fallback

    def get_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch real-time air quality from OpenAQ API or nearest seeded ground sensor.
        """
        cache_key = f"aqi_{round(lat, 2)}_{round(lon, 2)}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        # Check OpenAQ if available
        headers = {}
        if settings.OPENAQ_API_KEY:
            headers["X-API-Key"] = settings.OPENAQ_API_KEY

        try:
            url = f"https://api.openaq.org/v2/latest?coordinates={lat},{lon}&radius=25000&limit=1"
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results and len(results) > 0:
                    measurements = results[0].get("measurements", [])
                    m_map = {m["parameter"]: m["value"] for m in measurements if "parameter" in m and "value" in m}
                    
                    pm25 = m_map.get("pm25", 85.0)
                    pm10 = m_map.get("pm10", 145.0)
                    no2 = m_map.get("no2", 35.0)
                    so2 = m_map.get("so2", 12.0)
                    
                    result = {
                        "pm25": {"value": round(pm25, 1), "unit": "µg/m³", "provenance": "observed"},
                        "pm10": {"value": round(pm10, 1), "unit": "µg/m³", "provenance": "observed"},
                        "no2": {"value": round(no2, 1), "unit": "ppb", "provenance": "observed"},
                        "so2": {"value": round(so2, 1), "unit": "ppb", "provenance": "observed"},
                        "overall_aqi": int(pm25 * 2.1) if pm25 else 165,
                        "location_name": results[0].get("location", "Nearest OpenAQ Station"),
                        "provenance": "observed",
                        "source": "OpenAQ Live Monitoring Network"
                    }
                    self._set_cached(cache_key, result)
                    return result
        except Exception:
            pass

        # Fallback to nearest seeded sensor in storage
        sensors = storage.get_sensors()
        nearest_sensor = None
        min_dist = float("inf")
        for s in sensors:
            d = (s.get("latitude", 0) - lat) ** 2 + (s.get("longitude", 0) - lon) ** 2
            if d < min_dist:
                min_dist = d
                nearest_sensor = s

        if nearest_sensor:
            p = nearest_sensor.get("pollutants", {})
            pm25_val = p.get("pm25", {}).get("value", 120.0)
            pm10_val = p.get("pm10", {}).get("value", 195.0)
            no2_val = p.get("no2", {}).get("value", 45.0)
            so2_val = p.get("so2", {}).get("value", 15.0)
            
            result = {
                "pm25": {"value": pm25_val, "unit": "µg/m³", "provenance": "simulated"},
                "pm10": {"value": pm10_val, "unit": "µg/m³", "provenance": "simulated"},
                "no2": {"value": no2_val, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": so2_val, "unit": "ppb", "provenance": "simulated"},
                "overall_aqi": int(pm25_val * 2.1),
                "location_name": nearest_sensor.get("name", "Seeded Sensor Node"),
                "provenance": "simulated",
                "source": "Seeded High-Density Micro-Sensor Network"
            }
            self._set_cached(cache_key, result)
            return result

        # Default fallback
        result = {
            "pm25": {"value": 142.0, "unit": "µg/m³", "provenance": "simulated"},
            "pm10": {"value": 215.0, "unit": "µg/m³", "provenance": "simulated"},
            "no2": {"value": 48.0, "unit": "ppb", "provenance": "simulated"},
            "so2": {"value": 18.0, "unit": "ppb", "provenance": "simulated"},
            "overall_aqi": 210,
            "location_name": "Regional Micro-Sensor Node",
            "provenance": "simulated",
            "source": "Seeded Environmental Baseline"
        }
        self._set_cached(cache_key, result)
        return result

data_service = DataService()
