import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from backend.config import settings

class StorageService:
    def __init__(self):
        self.data_dir = settings.DATA_DIR
        self.reports_file = self.data_dir / "reports.json"
        self.hotspots_file = self.data_dir / "hotspots.json"
        self.alerts_file = self.data_dir / "alerts.json"
        self.crossborder_file = self.data_dir / "crossborder.json"
        self.sensors_file = self.data_dir / "sensors.json"
        self.audit_log_file = self.data_dir / "audit_log.json"
        self.satellite_file = self.data_dir / "satellite.json"

        # Initialize files if missing
        self._init_storage()

    def _init_storage(self):
        self.data_dir.mkdir(parents=True, exist_ok=True)
        for f in [
            self.reports_file,
            self.hotspots_file,
            self.alerts_file,
            self.crossborder_file,
            self.sensors_file,
            self.audit_log_file,
            self.satellite_file,
        ]:
            if not f.exists():
                with open(f, "w", encoding="utf-8") as fp:
                    json.dump([], fp, indent=2)

    def _load_json(self, file_path: Path) -> List[Dict[str, Any]]:
        try:
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            return []
        except Exception:
            return []

    def _save_json(self, file_path: Path, data: List[Dict[str, Any]]):
        temp_file = file_path.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        temp_file.replace(file_path)

    # --- Reports ---
    def get_reports(self) -> List[Dict[str, Any]]:
        return self._load_json(self.reports_file)

    def get_report_by_id(self, report_id: str) -> Optional[Dict[str, Any]]:
        reports = self.get_reports()
        for r in reports:
            if r.get("id") == report_id:
                return r
        return None

    def add_report(self, report: Dict[str, Any]) -> Dict[str, Any]:
        reports = self.get_reports()
        if "id" not in report or not report["id"]:
            report["id"] = f"rep_{uuid.uuid4().hex[:8]}"
        if "created_at" not in report:
            report["created_at"] = datetime.now(timezone.utc).isoformat()
        reports.insert(0, report)
        self._save_json(self.reports_file, reports)
        return report

    # --- Hotspots ---
    def get_hotspots(self, country: Optional[str] = None) -> List[Dict[str, Any]]:
        hotspots = self._load_json(self.hotspots_file)
        if country and country.lower() != "all":
            return [h for h in hotspots if h.get("country", "").lower() == country.lower()]
        return hotspots

    def get_hotspot_by_id(self, hotspot_id: str) -> Optional[Dict[str, Any]]:
        for h in self.get_hotspots():
            if h.get("id") == hotspot_id:
                return h
        return None

    def save_hotspot(self, hotspot: Dict[str, Any]) -> Dict[str, Any]:
        hotspots = self.get_hotspots()
        existing_index = next((i for i, h in enumerate(hotspots) if h.get("id") == hotspot.get("id")), None)
        hotspot["last_updated"] = datetime.now(timezone.utc).isoformat()
        if existing_index is not None:
            hotspots[existing_index] = hotspot
        else:
            hotspots.insert(0, hotspot)
        self._save_json(self.hotspots_file, hotspots)
        return hotspot

    def set_all_hotspots(self, hotspots: List[Dict[str, Any]]):
        self._save_json(self.hotspots_file, hotspots)

    # --- Alerts ---
    def get_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        alerts = self._load_json(self.alerts_file)
        if status and status.lower() != "all":
            return [a for a in alerts if a.get("status", "").lower() == status.lower()]
        return alerts

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        for a in self.get_alerts():
            if a.get("id") == alert_id:
                return a
        return None

    def save_alert(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        alerts = self.get_alerts()
        existing_index = next((i for i, a in enumerate(alerts) if a.get("id") == alert.get("id")), None)
        if existing_index is not None:
            alerts[existing_index] = alert
        else:
            if "id" not in alert:
                alert["id"] = f"alt_{uuid.uuid4().hex[:8]}"
            if "created_at" not in alert:
                alert["created_at"] = datetime.now(timezone.utc).isoformat()
            alerts.insert(0, alert)
        self._save_json(self.alerts_file, alerts)
        return alert

    def update_alert_status(self, alert_id: str, action: str, actor: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        alerts = self.get_alerts()
        for a in alerts:
            if a.get("id") == alert_id:
                # Update status
                status_map = {
                    "acknowledge": "acknowledged",
                    "escalate": "escalated",
                    "dispatch": "escalated",
                    "resolve": "resolved"
                }
                a["status"] = status_map.get(action, "acknowledged")
                # Append to action log
                if "action_log" not in a or not isinstance(a["action_log"], list):
                    a["action_log"] = []
                log_entry = {
                    "action": action,
                    "actor": actor,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "notes": notes or f"Action {action} performed by {actor}"
                }
                a["action_log"].append(log_entry)
                self._save_json(self.alerts_file, alerts)
                
                # Also log to global audit log
                self.add_audit_log_entry({
                    "alert_id": alert_id,
                    "hotspot_id": a.get("hotspot_id"),
                    **log_entry
                })
                return a
        return None

    def set_all_alerts(self, alerts: List[Dict[str, Any]]):
        self._save_json(self.alerts_file, alerts)

    # --- Cross-Border Scenarios ---
    def get_crossborder_scenarios(self) -> List[Dict[str, Any]]:
        return self._load_json(self.crossborder_file)

    def set_all_crossborder(self, scenarios: List[Dict[str, Any]]):
        self._save_json(self.crossborder_file, scenarios)

    # --- Sensors ---
    def get_sensors(self, country: Optional[str] = None) -> List[Dict[str, Any]]:
        sensors = self._load_json(self.sensors_file)
        if country and country.lower() != "all":
            return [s for s in sensors if s.get("country", "").lower() == country.lower()]
        return sensors

    def set_all_sensors(self, sensors: List[Dict[str, Any]]):
        self._save_json(self.sensors_file, sensors)

    # --- Satellite Data ---
    def get_satellite_grid(self) -> List[Dict[str, Any]]:
        return self._load_json(self.satellite_file)

    def set_all_satellite(self, data: List[Dict[str, Any]]):
        self._save_json(self.satellite_file, data)

    # --- Audit Log ---
    def get_audit_log(self) -> List[Dict[str, Any]]:
        return self._load_json(self.audit_log_file)

    def add_audit_log_entry(self, entry: Dict[str, Any]):
        logs = self.get_audit_log()
        if "id" not in entry:
            entry["id"] = f"log_{uuid.uuid4().hex[:8]}"
        if "timestamp" not in entry:
            entry["timestamp"] = datetime.now(timezone.utc).isoformat()
        logs.insert(0, entry)
        self._save_json(self.audit_log_file, logs)

storage = StorageService()
