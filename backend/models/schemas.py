from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Provenance types
ProvenanceType = Literal["observed", "inferred", "predicted", "simulated"]
SeverityLevel = Literal["safe", "watch", "high", "critical"]

# Gemini Multimodal Structured Output Schema (PRD §5A)
class GeminiAnalysisResult(BaseModel):
    event_type: Literal[
        "industrial_smoke",
        "agricultural_burning",
        "vehicular",
        "dust",
        "waste_burning",
        "unknown"
    ] = Field(..., description="Classified category of the pollution event")
    pollution_source: str = Field(..., description="Specific identified source or activity")
    severity: int = Field(..., ge=1, le=4, description="Severity score from 1 (Safe/Minor) to 4 (Critical)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in the visual and textual assessment")
    visual_evidence: List[str] = Field(default_factory=list, description="Visual cues observed in photo or text")
    recommended_verification: List[str] = Field(default_factory=list, description="Operational verification steps for authorities")
    explanation: str = Field(..., description="Explainable rationale citing visual, meteorological, and sensor indicators")

# Report Models
class ReportCreate(BaseModel):
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    language: str = "en"
    voice_transcript: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    created_at: str
    status: str
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    language: str = "en"
    voice_transcript: Optional[str] = None
    photo_url: Optional[str] = None
    analysis: Optional[GeminiAnalysisResult] = None
    fused_aqi: Optional[float] = None
    fused_weather: Optional[Dict[str, Any]] = None
    provenance: Dict[str, ProvenanceType] = Field(default_factory=dict)

# Pollutant & Metric Models with Provenance
class MetricValue(BaseModel):
    value: float
    unit: str
    provenance: ProvenanceType

# Hotspot Models
class Hotspot(BaseModel):
    id: str
    title: str
    country: str
    city: str
    latitude: float
    longitude: float
    severity: int = Field(..., ge=1, le=4)
    severity_label: SeverityLevel
    risk_score: float = Field(..., ge=0.0, le=100.0)
    status: Literal["active", "monitoring", "contained", "resolved"]
    pollutants: Dict[str, MetricValue]
    weather: Dict[str, Any]
    affected_population_estimate: int
    cross_border_risk: bool
    reports_count: int
    last_updated: str
    summary: str
    satellite_aerosol_index: Optional[MetricValue] = None
    contributing_report_ids: List[str] = Field(default_factory=list)

# Prediction Horizon Models
class PredictionHorizon(BaseModel):
    horizon_hours: int
    timestamp: str
    predicted_aqi: float
    spike_probability: float
    confidence_lower: float
    confidence_upper: float
    provenance: ProvenanceType = "predicted"

class FeatureImportance(BaseModel):
    feature: str
    importance: float
    description: str

class PredictionResponse(BaseModel):
    hotspot_id: Optional[str] = None
    latitude: float
    longitude: float
    forecast: List[PredictionHorizon]
    feature_importance: List[FeatureImportance]
    model_metadata: Dict[str, str]

# Cross-Border Scenario Models
class CrossBorderScenario(BaseModel):
    id: str
    title: str
    source_region: str
    target_region: str
    country_source: str
    country_target: str
    pollutant_type: str
    wind_vector: Dict[str, Any]
    estimated_arrival_window: str
    confidence: float
    plume_polygon: List[List[float]]
    recommended_crossborder_action: str
    provenance: ProvenanceType = "predicted"
    status: str
    last_updated: str

# Authority Alert & Audit Log Models
class AlertEvidenceCount(BaseModel):
    citizen_reports: int = 1
    photos: int = 0
    sensor_anomalies: int = 0

class AlertActionEntry(BaseModel):
    action: str
    actor: str
    timestamp: str
    notes: Optional[str] = None

class AuthorityAlert(BaseModel):
    id: str
    hotspot_id: str
    title: str
    pollution_type: Optional[str] = "Industrial Combustion & Particulate Emission"
    severity: SeverityLevel
    risk_score: float
    status: Literal["pending", "acknowledged", "escalated", "resolved"]
    created_at: str
    affected_population: int
    evidence_count: Optional[AlertEvidenceCount] = None
    gemini_summary: str
    recommended_intervention: str
    action_log: List[AlertActionEntry] = Field(default_factory=list)
    location_name: str
    country: str
    latitude: float
    longitude: float
    evidence_photo_url: Optional[str] = None

class AlertUpdateRequest(BaseModel):
    action: Literal["acknowledge", "escalate", "dispatch", "resolve"]
    actor: str
    notes: Optional[str] = None

# Data Source Transparency Models
class DataSourceInfo(BaseModel):
    name: str
    provider: str
    provenance: ProvenanceType
    protocol: str
    update_cadence: str
    description: str
    is_live: bool
