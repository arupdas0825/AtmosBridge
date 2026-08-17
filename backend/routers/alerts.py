from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from backend.services.storage_service import storage
from backend.models.schemas import AuthorityAlert, AlertUpdateRequest

router = APIRouter(prefix="/alerts", tags=["Authority Alerts"])

@router.get("", response_model=List[AuthorityAlert])
def list_alerts(
    status: Optional[str] = Query(None, description="Filter by status (pending, acknowledged, escalated, resolved)")
):
    alerts = storage.get_alerts(status=status)
    return alerts

@router.get("/{alert_id}", response_model=AuthorityAlert)
def get_alert(alert_id: str):
    alert = storage.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert

@router.patch("/{alert_id}", response_model=AuthorityAlert)
def update_alert_status(
    alert_id: str,
    update: AlertUpdateRequest = Body(...)
):
    updated = storage.update_alert_status(
        alert_id=alert_id,
        action=update.action,
        actor=update.actor,
        notes=update.notes
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return updated
