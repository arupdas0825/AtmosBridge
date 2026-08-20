from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.services.storage_service import storage
from backend.models.schemas import CrossBorderScenario

router = APIRouter(prefix="/crossborder", tags=["Cross-Border Intelligence"])

@router.get("", response_model=List[CrossBorderScenario])
def list_crossborder_scenarios(
    scenario_id: Optional[str] = Query(None, description="Specific scenario ID")
):
    scenarios = storage.get_crossborder_scenarios()
    if isinstance(scenario_id, str) and scenario_id.strip():
        scenarios = [s for s in scenarios if s.get("id") == scenario_id]
        if not scenarios:
            raise HTTPException(status_code=404, detail="Cross-border scenario not found.")
    return scenarios
