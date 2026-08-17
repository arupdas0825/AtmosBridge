import os
import sys
import numpy as np
import pandas as pd
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import settings

def train_and_export_model():
    print("Training AtmosBridge XGBoost Atmospheric Spike Regressor...")
    
    models_dir = settings.BASE_DIR / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    model_output_path = settings.MODEL_PATH

    # Generate synthetic training observations (grounded in realistic meteorological physics)
    np.random.seed(42)
    n_samples = 2500

    # Features:
    # 0: base_pm25 (20 to 350 ug/m3)
    # 1: temperature (10 to 42 C)
    # 2: humidity (20 to 95%)
    # 3: wind_speed (1 to 25 km/h)
    # 4: wind_direction (0 to 360 deg)
    # 5: report_count (0 to 15 citizen sightings)
    # 6: satellite_aod (0.2 to 1.5)

    base_pm25 = np.random.uniform(20, 350, n_samples)
    temp = np.random.uniform(10, 42, n_samples)
    humidity = np.random.uniform(20, 95, n_samples)
    wind_spd = np.random.uniform(1, 25, n_samples)
    wind_dir = np.random.uniform(0, 360, n_samples)
    report_count = np.random.poisson(3, n_samples)
    satellite_aod = np.random.uniform(0.2, 1.5, n_samples)

    # Physics-grounded target: AQI Spike multiplier over 12h horizon
    stagnation = np.maximum(0.1, (20.0 - np.minimum(wind_spd, 20.0)) / 20.0)
    inversion_hum = np.maximum(0.0, (humidity - 45.0) / 55.0)
    citizen_spike = np.minimum(1.5, report_count * 0.12)
    aod_impact = satellite_aod * 0.25

    target_aqi_multiplier = 1.0 + (0.45 * stagnation + 0.35 * citizen_spike + 0.25 * inversion_hum + 0.15 * aod_impact)
    target_aqi_12h = (base_pm25 * 2.1) * target_aqi_multiplier + np.random.normal(0, 5.0, n_samples)

    X = pd.DataFrame({
        "base_pm25": base_pm25,
        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind_spd,
        "wind_direction": wind_dir,
        "report_count": report_count,
        "satellite_aod": satellite_aod
    })
    y = target_aqi_12h

    try:
        import xgboost as xgb
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42
        )
        model.fit(X, y)
        model.save_model(str(model_output_path))
        print(f"[OK] Successfully trained and saved XGBoost model to {model_output_path}")
        
        # Print feature importances
        importance = model.feature_importances_
        print("\nModel Feature Importances:")
        for name, imp in zip(X.columns, importance):
            print(f"  - {name:20s}: {imp:.4f}")
            
    except Exception as e:
        print(f"Warning: XGBoost training encountered {e}. Model fallback will operate seamlessly.")

if __name__ == "__main__":
    train_and_export_model()
