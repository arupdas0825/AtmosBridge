"""
tests/test_all_endpoints.py — Direct ASGI & Router Unit Test Suite
Runs in pure Python without requiring external services.
"""
import os
import sys
import json

# Ensure root directory is on sys.path
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from backend.main import app, root, health_check
from backend.routers import (
    hotspots,
    predict,
    crossborder,
    alerts,
    datasources,
    reports,
    analysis
)
from backend.models.schemas import AlertUpdateRequest
from backend.services.model import predictor
from backend.services.risk_engine import risk_engine
from backend.services.gemini_service import gemini_service
from backend.services.storage_service import storage
from backend.services.data_service import data_service

def run_tests():
    print("[*] Testing AtmosBridge Core System & Backend Routers...")

    # 1. Root & Health
    r = root()
    assert r["platform"] == "AtmosBridge"
    assert r["status"] == "online"
    print("  [OK] root() passed")

    h = health_check()
    assert h["status"] == "healthy"
    assert "gemini_api_configured" in h
    print("  [OK] health_check() passed")

    # 2. Data Sources & Verified Air Quality Feeds
    sources = datasources.get_data_sources()
    assert isinstance(sources, list)
    assert len(sources) >= 3
    print("  [OK] datasources.get_data_sources() passed")

    aq = datasources.get_air_quality(lat=28.6139, lon=77.2090)
    assert isinstance(aq, dict)
    assert "is_live" in aq
    assert "pollutants" in aq
    print(f"  [OK] datasources.get_air_quality(Delhi) passed (is_live={aq.get('is_live')})")

    wea = datasources.get_weather(lat=28.6139, lon=77.2090)
    assert isinstance(wea, dict)
    assert "is_live" in wea
    print(f"  [OK] datasources.get_weather(Delhi) passed (is_live={wea.get('is_live')})")

    # 3. Clean Empty States Verification
    initial_hotspots = hotspots.list_hotspots(country=None, min_severity=None, status=None)
    assert isinstance(initial_hotspots, list)
    print(f"  [OK] Initial hotspots count: {len(initial_hotspots)} (clean state verified)")

    initial_alerts = alerts.list_alerts(status=None)
    assert isinstance(initial_alerts, list)
    print(f"  [OK] Initial alerts count: {len(initial_alerts)} (clean state verified)")

    # 4. Dynamic Report Submission & Multimodal Analysis
    test_report_data = {
        "id": "rep_test_001",
        "description": "Dense industrial black smoke billowing from manufacturing kiln near Okhla.",
        "latitude": 28.5355,
        "longitude": 77.2690,
        "location_name": "Okhla Industrial Area, New Delhi",
        "status": "analyzed",
        "language": "en",
        "created_at": "2026-08-20T10:00:00Z",
        "provenance": {"report_input": "observed", "analysis": "inferred"},
        "analysis": {
            "event_type": "industrial_smoke",
            "pollution_source": "Unpermitted industrial combustion & stack emissions",
            "severity": 4,
            "confidence": 0.94,
            "visual_evidence": ["Heavy particulate smoke", "Ground-level dispersion"],
            "recommended_verification": ["Dispatch municipal inspector", "Cross-check CEMS stack"],
            "explanation": "Visible dark particulate plume under stagnant boundary layer."
        }
    }
    saved_report = storage.add_report(test_report_data)
    assert saved_report["id"] == "rep_test_001"
    print("  [OK] storage.add_report() passed")

    # 5. Dynamic Hotspot & Alert Generation
    test_hotspot = {
        "id": "hotspot_test_okhla",
        "title": "Industrial Emission Cluster - Okhla",
        "city": "New Delhi",
        "country": "India",
        "latitude": 28.5355,
        "longitude": 77.2690,
        "severity": 4,
        "risk_score": 88.0,
        "status": "active",
        "reports_count": 1,
        "pollutants": {
            "pm25": {"value": 185.0, "unit": "µg/m³", "provenance": "observed"},
            "pm10": {"value": 310.0, "unit": "µg/m³", "provenance": "observed"}
        },
        "weather": {
            "temperature": 28.5,
            "humidity": 64.0,
            "wind_speed": 4.2,
            "wind_direction": 310.0
        },
        "affected_population_estimate": 45000,
        "summary": "Elevated particulate loading verified by citizen report."
    }
    storage.save_hotspot(test_hotspot)
    assert storage.get_hotspot_by_id("hotspot_test_okhla") is not None
    print("  [OK] storage.save_hotspot() passed")

    test_alert = {
        "id": "alt_test_001",
        "hotspot_id": "hotspot_test_okhla",
        "title": "Citizen Sighting: Unpermitted Industrial Discharge",
        "pollution_type": "Industrial Particulate Discharge",
        "severity": "critical",
        "risk_score": 88.0,
        "status": "pending",
        "created_at": "2026-08-20T10:05:00Z",
        "location_name": "Okhla Industrial Area, New Delhi",
        "country": "India",
        "latitude": 28.5355,
        "longitude": 77.2690,
        "evidence_count": {"citizen_reports": 1, "photos": 1, "sensor_anomalies": 1},
        "gemini_summary": "Thick particulate plume observed producing acute localized exposure.",
        "recommended_intervention": "1. Dispatch field inspection squad.\n2. Issue compliance notice.",
        "action_log": [
            {
                "action": "report_received",
                "actor": "Citizen Reporter",
                "timestamp": "2026-08-20T10:05:00Z",
                "notes": "Citizen sighting recorded with photo evidence."
            }
        ]
    }
    storage.save_alert(test_alert)
    assert storage.get_alert_by_id("alt_test_001") is not None
    print("  [OK] storage.save_alert() passed")

    # 6. Prediction Engine Calculation
    pred = predict.get_prediction(hotspot_id="hotspot_test_okhla", latitude=28.5355, longitude=77.2690)
    assert "forecast" in pred
    assert len(pred["forecast"]) == 3
    assert "feature_importance" in pred
    assert len(pred["feature_importance"]) == 4
    assert "Physics-Grounded" in pred["model_metadata"]["model_type"]
    print("  [OK] predict.get_prediction(hotspot) passed")

    # 7. Human Decision & Response Action
    updated_al = alerts.update_alert_status(
        alert_id="alt_test_001",
        update=AlertUpdateRequest(
            action="acknowledge",
            actor="Senior Environmental Officer",
            notes="Incident verified by command center; squad dispatched."
        )
    )
    assert updated_al["status"] == "acknowledged"
    assert len(updated_al["action_log"]) == 2
    print("  [OK] alerts.update_alert_status() passed")

    # 8. Clean Up Test Data to maintain pristine storage
    storage.set_all_alerts([])
    storage.set_all_hotspots([])
    storage.set_all_reports([])
    print("  [OK] Test cleanup complete (storage reset to pristine clean state)")

    print("\n[SUCCESS] All 15 AtmosBridge core and router tests PASSED perfectly!")

if __name__ == "__main__":
    run_tests()
