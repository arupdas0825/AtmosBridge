import json
import base64
import os
import time
import requests
import logging
from typing import Dict, Any, Optional, List
from backend.config import settings
from backend.models.schemas import GeminiAnalysisResult
from backend.services.data_service import data_service

logger = logging.getLogger(__name__)

class GeminiUnavailableError(Exception):
    """Raised when Gemini API is unreachable, unconfigured, or fails all candidate models."""
    pass

GEMINI_SYSTEM_INSTRUCTION = """
You are AtmosBridge AI, an expert environmental multimodal analyst for the Hack2Skill × Google Cloud Clean Air initiative.
Your role is to analyze citizen pollution sighting reports (photos, audio transcripts, text descriptions) alongside real-time meteorological and sensor telemetry.

CRITICAL RULES:
1. NEVER invent, synthesize, or hallucinate sensor readings, AQI values, or weather numbers. Ground all numbers ONLY in the provided tool/data context.
2. If tool readings are not provided, focus solely on visual and qualitative assessment of the report.
3. You must respond in STRICT, valid JSON matching the required schema with no extra commentary or markdown formatting outside the JSON block.

JSON OUTPUT SCHEMA:
{
  "event_type": "industrial_smoke | agricultural_burning | vehicular | dust | waste_burning | unknown",
  "pollution_source": "Specific concise description of identified source or activity",
  "severity": 1 to 4 (1=Safe/Minor, 2=Watch/Moderate, 3=High/Significant, 4=Critical/Hazardous),
  "confidence": 0.0 to 1.0 (confidence in your assessment),
  "visual_evidence": ["cues from the image/description, e.g. thick black particulate plume, ground dispersion"],
  "recommended_verification": ["actionable inspection steps for municipal authorities"],
  "explanation": "Clear 2-3 sentence explanation of why this event poses risk, citing visible density and weather dispersion"
}
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def analyze_report(
        self,
        description: str,
        image_bytes: Optional[bytes] = None,
        image_mime_type: str = "image/jpeg",
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        language: str = "en",
        voice_transcript: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a citizen report using real Gemini multimodal models.
        Raises GeminiUnavailableError if Gemini API is unconfigured or fails all models.
        """
        if not self.api_key:
            logger.warning("[GeminiService] GEMINI_API_KEY is not configured.")
            raise GeminiUnavailableError("Gemini API key is not configured on the server.")

        # Step 1: Execute backend tools to gather ground-truth environmental context
        aqi_data = {}
        weather_data = {}
        if latitude is not None and longitude is not None:
            try:
                aqi_data = data_service.get_air_quality(latitude, longitude)
                weather_data = data_service.get_weather(latitude, longitude)
            except Exception as e:
                logger.warning(f"[GeminiService] Telemetry lookup warning: {e}")

        # Context prompt block
        env_context = f"""
Live Ground Context:
- Ambient PM2.5: {aqi_data.get('pm25', {}).get('value', 'N/A')} µg/m³ (Provenance: {aqi_data.get('pm25', {}).get('provenance', 'unknown')})
- Ambient PM10: {aqi_data.get('pm10', {}).get('value', 'N/A')} µg/m³
- Temperature: {weather_data.get('temperature', 'N/A')} °C
- Relative Humidity: {weather_data.get('humidity', 'N/A')}%
- Wind Speed: {weather_data.get('wind_speed', 'N/A')} km/h, Direction: {weather_data.get('wind_direction', 'N/A')}°
- Target Language: {language}
"""

        full_user_prompt = f"""
Citizen Sighting Report:
- Text Description: {description}
- Voice Transcript: {voice_transcript if voice_transcript else "N/A"}
{env_context}

Please evaluate the severity of this pollution event, extract visual/textual evidence, recommend operational municipal verification steps, and provide an explainable risk rationale. Return ONLY valid JSON matching the schema.
"""

        # Step 2: Call active Gemini models via REST API
        candidate_models = [
            "gemini-flash-latest",
            "gemini-3.6-flash",
            "gemini-2.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest"
        ]

        last_error = None
        for model_name in candidate_models:
            for attempt in range(2):
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                    
                    parts = [{"text": f"{GEMINI_SYSTEM_INSTRUCTION}\n\n{full_user_prompt}"}]
                    if image_bytes:
                        b64_data = base64.b64encode(image_bytes).decode("utf-8")
                        parts.append({
                            "inline_data": {
                                "mime_type": image_mime_type,
                                "data": b64_data
                            }
                        })

                    payload = {
                        "contents": [{"parts": parts}],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "temperature": 0.2
                        }
                    }

                    resp = requests.post(url, json=payload, timeout=30)
                    if resp.status_code == 200:
                        res_json = resp.json()
                        candidates = res_json.get("candidates", [])
                        if candidates:
                            text_out = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text_out:
                                parsed = json.loads(text_out)
                                validated = GeminiAnalysisResult(**parsed)
                                res_dict = validated.model_dump()
                                res_dict["is_demo_fallback"] = False
                                res_dict["analysis_status"] = "AI analysis verified"
                                return res_dict
                    elif resp.status_code == 503 and attempt == 0:
                        time.sleep(1.5)
                        continue
                    else:
                        last_error = f"Model {model_name} HTTP {resp.status_code}: {resp.text[:200]}"
                        logger.warning(f"[GeminiService] {last_error}")
                        break
                except Exception as e:
                    last_error = f"Model {model_name} Exception: {str(e)}"
                    logger.warning(f"[GeminiService] {last_error}")
                    break

        # Raise exception if Gemini is unavailable
        raise GeminiUnavailableError(f"Gemini analysis is temporarily unavailable. Details: {last_error}")

gemini_service = GeminiService()
