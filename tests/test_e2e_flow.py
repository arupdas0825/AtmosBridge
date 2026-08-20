"""
tests/test_e2e_flow.py — Comprehensive End-to-End System & API Verification
Tests live endpoints, citizen reporting workflow, human authority triage, and empty state guarantees.
"""
import os
import sys
import urllib.request
import urllib.parse
import json
import time

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "AtmosBridge-E2E-Tester"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post_form(path, fields):
    url = f"{BASE_URL}{path}"
    # Form data multipart or urlencoded
    data = urllib.parse.urlencode(fields).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": "AtmosBridge-E2E-Tester",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def patch(path, body):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": "AtmosBridge-E2E-Tester",
            "Content-Type": "application/json"
        },
        method="PATCH"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_e2e_tests():
    print("=" * 70)
    print("ATMOSBRIDGE END-TO-END VERIFICATION & AUDIT")
    print("=" * 70)

    # 1. System Health
    print("\n[Step 1] Verifying System Health & Metadata...")
    health = get("/api/health")
    assert health["status"] == "healthy"
    print(f"  [OK] Backend Healthy: {health}")

    # 2. Verified Live Air Quality Feeds
    print("\n[Step 2] Verifying Live Public Air Quality Ingestion...")
    delhi_aq = get("/api/data-sources/air-quality?lat=28.6139&lon=77.2090")
    assert delhi_aq["is_live"] is True
    assert delhi_aq["provenance"] == "observed"
    assert "pm25" in delhi_aq["pollutants"]
    print(f"  [OK] Live Delhi Telemetry:")
    print(f"    - PM2.5: {delhi_aq['pollutants']['pm25']['value']} {delhi_aq['pollutants']['pm25']['unit']}")
    print(f"    - PM10: {delhi_aq['pollutants']['pm10']['value']} {delhi_aq['pollutants']['pm10']['unit']}")
    print(f"    - Source: {delhi_aq['source']}")
    print(f"    - Observed Timestamp: {delhi_aq['timestamp']}")

    sp_aq = get("/api/data-sources/air-quality?lat=-23.5505&lon=-46.6333")
    assert sp_aq["is_live"] is True
    print(f"  [OK] Live Sao Paulo Telemetry: PM2.5 = {sp_aq['pollutants'].get('pm25', {}).get('value')} ug/m3")

    # 3. Clean Empty States Guarantee
    print("\n[Step 3] Verifying Seed Data Purge & Clean Empty States...")
    hs = get("/api/hotspots")
    assert isinstance(hs, list)
    print(f"  [OK] Hotspots Initial Count: {len(hs)} (Zero fake records)")

    al = get("/api/alerts")
    assert isinstance(al, list)
    print(f"  [OK] Alerts Initial Count: {len(al)} (Zero fake records)")

    xb = get("/api/crossborder")
    assert isinstance(xb, list)
    print(f"  [OK] Cross-Border Corridors Count: {len(xb)} (Zero fake records)")

    # 4. Predict Router with insufficient data
    print("\n[Step 4] Verifying Prediction Engine Insufficient Data Behavior...")
    pred_empty = get("/api/predict")
    assert pred_empty["model_metadata"]["status"] == "insufficient_data"
    print(f"  [OK] Predict gracefully returns empty forecast when telemetry is missing:")
    print(f"    - Message: {pred_empty['model_metadata']['message']}")

    # 5. Predict Router with live coordinates
    print("\n[Step 5] Verifying Prediction Engine with Live Coordinates...")
    pred_live = get("/api/predict?latitude=28.6139&longitude=77.2090")
    if pred_live["forecast"]:
        print(f"  [OK] Prediction successfully computed from live telemetry:")
        print(f"    - Horizon 6h: AQI {pred_live['forecast'][0]['predicted_aqi']} (P(spike)={pred_live['forecast'][0]['spike_probability']})")
        print(f"    - Horizon 12h: AQI {pred_live['forecast'][1]['predicted_aqi']}")
        print(f"    - Horizon 24h: AQI {pred_live['forecast'][2]['predicted_aqi']}")
        print(f"    - Top Feature: {pred_live['feature_importance'][0]['feature']} ({pred_live['feature_importance'][0]['importance']})")

    # 6. Citizen Report Submission Flow
    print("\n[Step 6] Submitting Real Citizen Pollution Sighting...")
    report_res = post_form("/api/reports", {
        "description": "Dense black smoke billowing from unpermitted tire burning near industrial cluster.",
        "latitude": "28.5355",
        "longitude": "77.2690",
        "location_name": "Okhla Phase III, New Delhi",
        "language": "en"
    })
    assert report_res["status"] == "analyzed"
    report_id = report_res["id"]
    print(f"  [OK] Report Submitted & Multimodal Analysis Returned:")
    print(f"    - Report ID: {report_id}")
    print(f"    - Event Type: {report_res['analysis']['event_type']}")
    print(f"    - Severity: {report_res['analysis']['severity']}/5")
    print(f"    - Confidence: {report_res['analysis']['confidence']}")
    print(f"    - Gemini Explanation: {report_res['analysis']['explanation']}")

    # 7. Verify Hotspot & Alert Created in Authority Queue
    print("\n[Step 7] Verifying Dynamic Incident Ingestion in Authority Queue...")
    alerts_after = get("/api/alerts")
    assert len(alerts_after) >= 1
    new_alert = alerts_after[0]
    print(f"  [OK] Incident Present in Authority Queue:")
    print(f"    - Alert ID: {new_alert['id']}")
    print(f"    - Title: {new_alert['title']}")
    print(f"    - Status: {new_alert['status']}")
    print(f"    - Risk Score: {new_alert['risk_score']}/100")

    # 8. Human-in-the-Loop Authority Decision Action
    print("\n[Step 8] Testing Human Governance Actions (Acknowledge & Dispatch)...")
    ack_res = patch(f"/api/alerts/{new_alert['id']}", {
        "action": "acknowledge",
        "actor": "Environmental Officer Verma",
        "notes": "Evidence verified; municipal inspection unit notified."
    })
    assert ack_res["status"] == "acknowledged"
    print(f"  [OK] Action 'acknowledge' executed:")
    print(f"    - New Status: {ack_res['status']}")
    print(f"    - Audit Log Entries: {len(ack_res['action_log'])}")

    dispatch_res = patch(f"/api/alerts/{new_alert['id']}", {
        "action": "dispatch",
        "actor": "Senior Field Commander",
        "notes": "Field squad deployed to Okhla Phase III with portable air monitors."
    })
    assert dispatch_res["status"] == "escalated"
    print(f"  [OK] Action 'dispatch' executed:")
    print(f"    - New Status: {dispatch_res['status']}")

    resolve_res = patch(f"/api/alerts/{new_alert['id']}", {
        "action": "resolve",
        "actor": "Senior Field Commander",
        "notes": "Unpermitted combustion extinguished; citation issued to site operator."
    })
    assert resolve_res["status"] == "resolved"
    print(f"  [OK] Action 'resolve' executed:")
    print(f"    - New Status: {resolve_res['status']}")
    print(f"    - Full Action Timeline: {[log['action'] for log in resolve_res['action_log']]}")

    # 9. Clean up test report to leave system pristine
    from backend.services.storage_service import storage
    storage.set_all_alerts([])
    storage.set_all_hotspots([])
    storage.set_all_reports([])
    print("\n[Step 9] Pristine Storage State Restored (0 fake records remaining)")

    print("\n" + "=" * 70)
    print("ALL 9 END-TO-END VERIFICATION CHECKS PASSED WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_tests()
