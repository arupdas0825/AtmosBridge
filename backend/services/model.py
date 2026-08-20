import os
import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path
from backend.config import settings

# Feature order the XGBoost model was trained on (see scripts/train_model.py) —
# must match exactly for inference to be valid.
_XGB_FEATURE_ORDER = [
    "base_pm25", "temperature", "humidity",
    "wind_speed", "wind_direction", "report_count", "satellite_aod"
]


class SpikePredictor:
    def __init__(self):
        self.model_path = settings.MODEL_PATH
        self.model = None
        self._load_xgboost_model()

    def _load_xgboost_model(self) -> None:
        """
        Attempt to load the trained XGBoost regressor exported by
        scripts/train_model.py. If xgboost isn't installed or the model
        file doesn't exist yet (e.g. train_model.py hasn't been run),
        fail silently and keep self.model as None — predict() falls back
        to the physics-grounded estimate with no behavior change.
        """
        try:
            if not Path(self.model_path).exists():
                return
            import xgboost as xgb
            loaded = xgb.XGBRegressor()
            loaded.load_model(str(self.model_path))
            self.model = loaded
        except Exception as e:
            # Missing xgboost package, corrupt/incompatible model file, etc.
            # This must never crash the API — the physics model is always
            # a safe, fully-functional fallback.
            print(f"[model.py] XGBoost model not loaded, using physics-grounded fallback: {e}")
            self.model = None

    def _xgb_predict_12h_aqi(
        self, base_pm25: float, temperature: float, humidity: float,
        wind_speed: float, wind_direction: float, report_count: int,
        satellite_aod: float
    ) -> Optional[float]:
        """Run the trained model for its native 12h AQI target. Returns None on any failure."""
        if self.model is None:
            return None
        try:
            import pandas as pd
            X = pd.DataFrame([{
                "base_pm25": base_pm25,
                "temperature": temperature,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "wind_direction": wind_direction,
                "report_count": report_count,
                "satellite_aod": satellite_aod
            }])[_XGB_FEATURE_ORDER]
            return float(self.model.predict(X)[0])
        except Exception as e:
            print(f"[model.py] XGBoost inference failed, using physics-grounded fallback: {e}")
            return None

    def predict(
        self,
        base_pm25: Optional[float] = None,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None,
        wind_speed: Optional[float] = None,
        wind_direction: Optional[float] = None,
        report_count: int = 0,
        satellite_aod: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generate 6h, 12h, and 24h spike predictions and feature importance analysis.
        Returns insufficient_data state if required observational inputs are missing.
        """
        if base_pm25 is None or temperature is None or humidity is None or wind_speed is None:
            return {
                "forecast": [],
                "feature_importance": [],
                "model_metadata": {
                    "model_type": "Physics-Grounded Atmospheric Risk Predictor",
                    "status": "insufficient_data",
                    "message": "Insufficient verified observational telemetry to compute 24h dispersion trajectory.",
                    "provenance": "predicted"
                }
            }

        wind_direction = wind_direction if wind_direction is not None else 0.0
        satellite_aod = satellite_aod if satellite_aod is not None else 0.5

        # Feature calculations
        # Low wind (< 10 km/h) causes particulate accumulation
        stagnation_factor = max(0.2, (15.0 - min(wind_speed, 15.0)) / 15.0)
        # High humidity (> 60%) promotes secondary aerosol formation & boundary inversion
        humidity_factor = max(0.0, (humidity - 40.0) / 60.0)
        # Report density signals acute localized unmetered emissions
        citizen_impact = min(1.0, report_count / 10.0)
        # Satellite background haze
        aod_factor = min(1.0, satellite_aod / 1.0)

        # Baseline AQI
        baseline_aqi = max(50.0, base_pm25 * 2.1)

        # If the trained XGBoost model is available, use its 12h AQI estimate to
        # anchor the physics curve: compute what the pure-physics model would have
        # predicted at 12h, then scale every horizon by the ratio between the
        # XGBoost estimate and that physics estimate. This keeps the explainable
        # physics shape (why risk rises/falls by horizon) while grounding the
        # absolute magnitude in the trained model rather than the heuristic alone.
        xgb_correction = 1.0
        used_xgboost = False
        physics_12h_multiplier = 1.0 + (1.45 - 1.0) * (
            0.4 * stagnation_factor + 0.3 * citizen_impact + 0.2 * humidity_factor + 0.1 * aod_factor
        )
        physics_12h_aqi = baseline_aqi * physics_12h_multiplier
        xgb_12h_aqi = self._xgb_predict_12h_aqi(
            base_pm25, temperature, humidity, wind_speed, wind_direction, report_count, satellite_aod
        )
        if xgb_12h_aqi is not None and physics_12h_aqi > 0:
            xgb_correction = xgb_12h_aqi / physics_12h_aqi
            # Guard against a wild correction factor from an out-of-distribution input
            xgb_correction = min(1.6, max(0.6, xgb_correction))
            used_xgboost = True

        # Time projections
        now = datetime.now(timezone.utc)
        forecasts: List[Dict[str, Any]] = []

        horizons = [
            (6, 1.25, 0.82),   # 6h horizon
            (12, 1.45, 0.89),  # 12h night inversion peak
            (24, 1.10, 0.65)   # 24h daytime dispersion
        ]

        for hours, spike_multiplier, base_prob in horizons:
            ts = (now + timedelta(hours=hours)).isoformat()
            
            # Dynamic calculation
            effective_multiplier = 1.0 + (spike_multiplier - 1.0) * (0.4 * stagnation_factor + 0.3 * citizen_impact + 0.2 * humidity_factor + 0.1 * aod_factor)
            pred_aqi = round(baseline_aqi * effective_multiplier * xgb_correction, 1)
            
            # Probability calculation
            prob = min(0.98, max(0.15, base_prob * (0.5 + 0.5 * citizen_impact + 0.3 * stagnation_factor)))
            
            # Uncertainty / Confidence interval bounds
            uncertainty_margin = pred_aqi * (0.08 + 0.03 * (hours / 6))
            conf_lower = round(max(20.0, pred_aqi - uncertainty_margin), 1)
            conf_upper = round(pred_aqi + uncertainty_margin, 1)

            forecasts.append({
                "horizon_hours": hours,
                "timestamp": ts,
                "predicted_aqi": pred_aqi,
                "spike_probability": round(prob, 2),
                "confidence_lower": conf_lower,
                "confidence_upper": conf_upper,
                "provenance": "predicted"
            })

        # Feature Importance Analysis (explainable AI)
        total_weight = stagnation_factor * 0.38 + citizen_impact * 0.30 + humidity_factor * 0.20 + aod_factor * 0.12
        w_stag = round((stagnation_factor * 0.38 / total_weight), 2)
        w_cit = round((citizen_impact * 0.30 / total_weight), 2)
        w_hum = round((humidity_factor * 0.20 / total_weight), 2)
        w_aod = round(max(0.05, 1.0 - (w_stag + w_cit + w_hum)), 2)

        feature_importance = [
            {
                "feature": "Atmospheric Stagnation & Wind Dispersion",
                "importance": w_stag,
                "description": f"Wind speed of {wind_speed} km/h restricts horizontal atmospheric particulate flushing."
            },
            {
                "feature": "Citizen Sighting Incident Velocity",
                "importance": w_cit,
                "description": f"{report_count} clustered citizen reports indicate active, unpermitted ground emissions."
            },
            {
                "feature": "Night Boundary Inversion & Humidity",
                "importance": w_hum,
                "description": f"Relative humidity of {humidity}% lowers mixing layer ceiling during evening hours."
            },
            {
                "feature": "Satellite Aerosol Optical Depth Baseline",
                "importance": w_aod,
                "description": f"Regional AOD index of {satellite_aod} indicates elevated background atmospheric particulate loading."
            }
        ]

        return {
            "forecast": forecasts,
            "feature_importance": feature_importance,
            "model_metadata": {
                "model_type": (
                    "XGBoost-Corrected Physics-Grounded Atmospheric Risk Predictor"
                    if used_xgboost else
                    "Physics-Grounded Atmospheric Risk Predictor (XGBoost model not loaded — "
                    "run scripts/train_model.py to enable it)"
                ),
                "training_dataset": "Multi-City Historical AQI & Meteorological Corpus",
                "xgboost_active": used_xgboost,
                "provenance": "predicted"
            }
        }

predictor = SpikePredictor()
