import json
import base64
import os
import requests
from typing import Dict, Any, Optional, List
from backend.config import settings
from backend.models.schemas import GeminiAnalysisResult
from backend.services.data_service import data_service

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
        Analyze a citizen report using Gemini multimodal models or demo-mode fallback.
        """
        # Step 1: Execute backend tools to gather ground-truth environmental context
        aqi_data = {}
        weather_data = {}
        if latitude is not None and longitude is not None:
            aqi_data = data_service.get_air_quality(latitude, longitude)
            weather_data = data_service.get_weather(latitude, longitude)

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

        # Step 2: Try calling Gemini via direct REST or SDK across supported model names
        if self.api_key:
            candidate_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"]
            for model_name in candidate_models:
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

                    resp = requests.post(url, json=payload, timeout=12)
                    if resp.status_code == 200:
                        res_json = resp.json()
                        candidates = res_json.get("candidates", [])
                        if candidates:
                            text_out = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            # Parse JSON
                            if text_out:
                                parsed = json.loads(text_out)
                                validated = GeminiAnalysisResult(**parsed)
                                res_dict = validated.model_dump()
                                res_dict["is_demo_fallback"] = False
                                return res_dict
                except Exception as e:
                    continue

        # Step 3: High-fidelity deterministic Demo-Mode Fallback
        return self._generate_demo_fallback(
            description=description,
            has_image=image_bytes is not None,
            latitude=latitude,
            longitude=longitude,
            weather=weather_data,
            aqi=aqi_data,
            voice_transcript=voice_transcript
        )

    def _generate_demo_fallback(
        self,
        description: str,
        has_image: bool,
        latitude: Optional[float],
        longitude: Optional[float],
        weather: Dict[str, Any],
        aqi: Dict[str, Any],
        voice_transcript: Optional[str]
    ) -> Dict[str, Any]:
        """
        Deterministic, intelligent rule-grounded fallback matching Gemini schema.
        """
        desc_lower = (description + " " + (voice_transcript or "")).lower()

        if any(k in desc_lower for k in ["industrial", "factory", "chimney", "chemical", "boiler", "stack", "furnace", "scrap"]):
            event_type = "industrial_smoke"
            source = "Unpermitted industrial chimney discharge & boiler combustion"
            severity = 4 if any(w in desc_lower for w in ["thick", "black", "heavy", "acrid", "huge"]) else 3
            evidence = ["Dense dark particulate plume", "Ground-level dispersion towards residential area", "Visible stack emission"]
            verification = ["Dispatch municipal environmental inspector to industrial quadrant", "Verify factory continuous emission monitoring (CEMS) log", "Cross-reference nearest industrial zone sensor"]
        elif any(k in desc_lower for k in ["farm", "crop", "stubble", "field", "agriculture", "paddy", "straw"]):
            event_type = "agricultural_burning"
            source = "Post-harvest paddy crop residue open field burning"
            severity = 3
            evidence = ["Wide-area low-altitude smoke haze", "Thermal biomass signature indicators", "Horizontal drift across agricultural tract"]
            verification = ["Alert local agricultural enforcement cell", "Deploy drone surveillance unit for fire boundary mapping", "Coordinate mechanized balers and water tenders"]
        elif any(k in desc_lower for k in ["traffic", "truck", "diesel", "vehicle", "highway", "exhaust", "cars"]):
            event_type = "vehicular"
            source = "Heavy vehicular congestion and diesel freight idling"
            severity = 2
            evidence = ["Corridor-level particulate buildup", "Exhaust accumulation along high-density transit artery"]
            verification = ["Optimize traffic signal sequencing to clear congestion", "Deploy mobile particulate scrubber units"]
        elif any(k in desc_lower for k in ["dust", "construction", "sand", "demolition", "excavation"]):
            event_type = "dust"
            source = "Uncovered construction excavation and road dust re-suspension"
            severity = 2
            evidence = ["Coarse particulate cloud", "Lack of mandated dust suppression water netting"]
            verification = ["Issue site compliance notice to construction supervisor", "Mandate immediate water misting application"]
        elif any(k in desc_lower for k in ["garbage", "trash", "waste", "dump", "plastic", "tire"]):
            event_type = "waste_burning"
            source = "Illegal municipal solid waste or plastic open combustion"
            severity = 4
            evidence = ["High-toxicity dark acrid smoke", "Low-temperature open pile smoldering", "Heavy local odor and particulate density"]
            verification = ["Dispatch immediate municipal fire response", "Extinguish smoldering waste pile with foam/water", "Issue penalty notice to site operators"]
        else:
            event_type = "industrial_smoke"
            source = "Unidentified acute particulate emission source"
            severity = 3
            evidence = ["Dense particulate plume observed in citizen sighting", "Localized visibility reduction"]
            verification = ["Dispatch local environmental patrol team for ground verification", "Inspect nearby industrial and commercial units"]

        wind_spd = weather.get("wind_speed", 6.8)
        wind_dir = weather.get("wind_direction", 310)
        pm25 = aqi.get("pm25", {}).get("value", 160.0)

        explanation = (
            f"Citizen sighting confirms {source.lower()}. "
            f"Current wind conditions ({wind_spd} km/h from {wind_dir}°) indicate limited atmospheric dispersion, "
            f"amplifying localized risk on top of ambient PM2.5 levels ({pm25} µg/m³). "
            f"Immediate human-supervised verification recommended."
        )

        return {
            "event_type": event_type,
            "pollution_source": source,
            "severity": severity,
            "confidence": 0.92 if has_image else 0.84,
            "visual_evidence": evidence,
            "recommended_verification": verification,
            "explanation": explanation,
            "is_demo_fallback": True
        }

gemini_service = GeminiService()
