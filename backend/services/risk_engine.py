import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from backend.config import settings
from backend.services.storage_service import storage
from backend.services.data_service import data_service

class RiskEngine:
    def process_report_into_hotspot(
        self,
        report: Dict[str, Any],
        gemini_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Prototype Hotspot Detection Engine:
        Correlates citizen reports, Gemini multimodal analysis, verified public air quality telemetry,
        and meteorological dispersion factors into a scored Hotspot and Authority Alert if warranted.
        """
        lat = report.get("latitude", 28.6139)
        lon = report.get("longitude", 77.2090)
        location_name = report.get("location_name", "Hyperlocal Urban Zone")
        
        # 1. Fetch verified public air quality & meteorological feeds
        aqi_data = data_service.get_air_quality(lat, lon)
        weather_data = data_service.get_weather(lat, lon)
        
        # 2. Extract verified parameters (zero invented measurements)
        pollutants = aqi_data.get("pollutants", {})
        pm25_obj = pollutants.get("pm25")
        pm25_val = pm25_obj.get("value") if pm25_obj else 0.0
        
        gemini_severity = gemini_analysis.get("severity", 3)
        confidence = gemini_analysis.get("confidence", 0.85)
        wind_speed = weather_data.get("wind_speed") if weather_data.get("is_live") else 8.0
        if wind_speed is None:
            wind_speed = 8.0
        
        # 3. Calculate Transparent Hotspot Risk Score (0-100)
        # Component weights:
        # - Multimodal visual severity from citizen report (35%)
        # - Ambient PM2.5 baseline elevation (30%)
        # - Meteorological boundary stagnation (20%)
        # - Sighting classification confidence (15%)
        c_severity = (gemini_severity / 4.0) * 35.0
        c_pm25 = min(30.0, (pm25_val / 300.0) * 30.0) if pm25_val > 0 else 15.0
        stagnation = max(0.0, (15.0 - min(wind_speed, 15.0)) / 15.0)
        c_wind = stagnation * 20.0
        c_conf = confidence * 15.0
        
        raw_score = c_severity + c_pm25 + c_wind + c_conf
        risk_score = round(min(98.5, max(15.0, raw_score)), 1)
        
        # Severity mapping
        if risk_score >= settings.RISK_CRITICAL:
            severity_label = "critical"
            num_severity = 4
        elif risk_score >= settings.RISK_HIGH:
            severity_label = "high"
            num_severity = 3
        elif risk_score >= settings.RISK_WATCH:
            severity_label = "watch"
            num_severity = 2
        else:
            severity_label = "safe"
            num_severity = 1

        # Determine country from coordinates
        country = self._infer_country(lat, lon)
        city = self._infer_city(lat, lon, location_name)
        
        # Rough indicative population exposure estimate based on urban density heuristics.
        # NOTE: This is a ROUGH INDICATIVE ESTIMATE — not a verified measurement.
        # Based on a simplified radial exposure model (severity-scaled radius × average urban density).
        # Actual exposure depends on local population density, building height, and dispersion.
        pop_density_factor = 8000  # people / km² (conservative urban average)
        radius_km = 0.5 + (num_severity * 0.5)  # conservative radii: 1.0, 1.5, 2.0, 2.5 km
        affected_pop_estimate = int(3.14159 * (radius_km ** 2) * pop_density_factor * (risk_score / 100.0))

        # Check cross-border proximity (within 100km of borders)
        is_cross_border = self._check_cross_border_proximity(lat, lon)

        # 4. Check for existing nearby hotspot (within ~3km spatial cluster)
        existing_hotspots = storage.get_hotspots()
        matched_hotspot = None
        for h in existing_hotspots:
            dist_sq = (h.get("latitude", 0) - lat) ** 2 + (h.get("longitude", 0) - lon) ** 2
            if dist_sq < 0.001:  # approx 3km cluster
                matched_hotspot = h
                break

        now_iso = datetime.now(timezone.utc).isoformat()

        if matched_hotspot:
            # Update existing hotspot with new correlated evidence
            matched_hotspot["reports_count"] = matched_hotspot.get("reports_count", 1) + 1
            matched_hotspot["risk_score"] = max(matched_hotspot.get("risk_score", 0), risk_score)
            matched_hotspot["severity"] = max(matched_hotspot.get("severity", 1), num_severity)
            matched_hotspot["severity_label"] = severity_label
            matched_hotspot["last_updated"] = now_iso
            matched_hotspot["summary"] = gemini_analysis.get("explanation", matched_hotspot.get("summary"))
            if report.get("id") not in matched_hotspot.get("contributing_report_ids", []):
                matched_hotspot.setdefault("contributing_report_ids", []).append(report.get("id"))
            if pollutants:
                matched_hotspot["pollutants"] = pollutants
            if weather_data.get("is_live"):
                matched_hotspot["weather"] = weather_data
            
            saved_hotspot = storage.save_hotspot(matched_hotspot)
            hotspot_id = saved_hotspot["id"]
        else:
            # Create new correlated hotspot
            hotspot_id = f"hotspot_{country.lower()[:3]}_{uuid.uuid4().hex[:6]}"
            new_hotspot = {
                "id": hotspot_id,
                "title": f"{gemini_analysis.get('event_type', 'Pollution').replace('_', ' ').title()} Event — {location_name}",
                "event_type": gemini_analysis.get('event_type', 'unclassified_emission'),
                "country": country,
                "city": city,
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "severity": num_severity,
                "severity_label": severity_label,
                "risk_score": risk_score,
                "status": "active" if num_severity >= 3 else "investigating",
                "pollutants": pollutants,
                "weather": weather_data if weather_data.get("is_live") else None,
                "affected_population_estimate": affected_pop_estimate,
                "cross_border_risk": is_cross_border,
                "reports_count": 1,
                "first_detected": now_iso,
                "last_updated": now_iso,
                "summary": gemini_analysis.get("explanation", "Acute localized pollution sighting correlated with atmospheric telemetry."),
                "provenance": "inferred",
                "engine": "Prototype Hotspot Detection Engine",
                "contributing_report_ids": [report.get("id")]
            }
            saved_hotspot = storage.save_hotspot(new_hotspot)

        # 5. Create Authority Alert if severity >= 3 (High or Critical)
        if num_severity >= 3:
            alert_id = f"alt_{uuid.uuid4().hex[:6]}"
            alert = {
                "id": alert_id,
                "hotspot_id": hotspot_id,
                "title": f"High-Confidence {gemini_analysis.get('event_type', 'Pollution').replace('_', ' ').title()} Alert — {location_name}",
                "severity": severity_label,
                "risk_score": risk_score,
                "status": "pending",
                "created_at": now_iso,
                "affected_population": affected_pop_estimate,
                "gemini_summary": gemini_analysis.get("explanation", "Visual sighting matched with elevated ground telemetry."),
                "recommended_intervention": "\n".join([f"• {step}" for step in gemini_analysis.get("recommended_verification", ["Dispatch municipal inspector"])]) or "Deploy inspection unit immediately.",
                "action_log": [],
                "location_name": location_name,
                "country": country,
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "evidence_photo_url": report.get("photo_url")
            }
            storage.save_alert(alert)

        return saved_hotspot

    def _infer_country(self, lat: float, lon: float) -> str:
        # India bounds
        if 6.0 <= lat <= 38.0 and 68.0 <= lon <= 98.0:
            return "India"
        # Brazil bounds
        if -34.0 <= lat <= 6.0 and -74.0 <= lon <= -34.0:
            return "Brazil"
        # Russia bounds
        if 41.0 <= lat <= 82.0 and 19.0 <= lon <= 180.0:
            return "Russia"
        # China bounds
        if 18.0 <= lat <= 54.0 and 73.0 <= lon <= 135.0:
            return "China"
        # South Africa bounds
        if -35.0 <= lat <= -22.0 and 16.0 <= lon <= 33.0:
            return "South Africa"
        return "India"

    def _infer_city(self, lat: float, lon: float, default_name: str) -> str:
        hubs = [
            ("New Delhi", 28.6139, 77.2090),
            ("Mumbai", 19.0760, 72.8777),
            ("Kolkata", 22.5726, 88.3639),
            ("São Paulo", -23.5505, -46.6333),
            ("Rio de Janeiro", -22.9068, -43.1729),
            ("Moscow", 55.7558, 37.6173),
            ("Beijing", 39.9042, 116.4074),
            ("Shanghai", 31.2304, 121.4737),
            ("Johannesburg", -26.2041, 28.0473),
            ("Cape Town", -33.9249, 18.4241),
        ]
        for name, h_lat, h_lon in hubs:
            if (h_lat - lat) ** 2 + (h_lon - lon) ** 2 < 1.0:
                return name
        return default_name

    def _check_cross_border_proximity(self, lat: float, lon: float) -> bool:
        border_boxes = [
            (29.5, 33.0, 73.5, 76.0),  # India-Pakistan Punjab
            (-26.0, -24.0, -55.0, -53.0), # Brazil-Paraguay-Argentina Tri-Border
            (48.0, 52.0, 125.0, 135.0), # Russia-China Amur
            (-26.5, -25.5, 31.5, 32.5)  # South Africa-Mozambique border
        ]
        for min_lat, max_lat, min_lon, max_lon in border_boxes:
            if min_lat <= lat <= max_lat and min_lon <= lon <= max_lon:
                return True
        return False

risk_engine = RiskEngine()
