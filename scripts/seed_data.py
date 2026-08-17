import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.config import settings

def generate_seed_data():
    now_iso = datetime.now(timezone.utc).isoformat()
    data_dir = settings.DATA_DIR
    data_dir.mkdir(parents=True, exist_ok=True)

    print("Generating AtmosBridge Seed Datasets (BRICS Clean Air & Climate Intelligence)...")

    # 1. Hotspots across BRICS
    hotspots = [
        {
            "id": "hotspot_ind_delhi_01",
            "title": "Industrial Waste Combustion — Okhla Phase II",
            "country": "India",
            "city": "New Delhi",
            "latitude": 28.5355,
            "longitude": 77.2690,
            "severity": 4,
            "severity_label": "critical",
            "risk_score": 89.5,
            "status": "active",
            "pollutants": {
                "pm25": {"value": 248.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 385.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 78.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 24.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 32.5,
                "humidity": 68,
                "wind_speed": 4.5,
                "wind_direction": 310,
                "provenance": "observed"
            },
            "affected_population_estimate": 58000,
            "cross_border_risk": False,
            "reports_count": 9,
            "last_updated": now_iso,
            "summary": "Heavy unpermitted rubber and waste combustion confirmed by 9 visual citizen sightings and sharp PM2.5 spike to 248 µg/m³. Low wind speed prevents horizontal ventilation.",
            "satellite_aerosol_index": {"value": 0.88, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": ["rep_seed_01", "rep_seed_02"]
        },
        {
            "id": "hotspot_ind_punjab_02",
            "title": "Agricultural Stubble Fire Cluster — Amritsar East",
            "country": "India",
            "city": "Amritsar",
            "latitude": 31.6340,
            "longitude": 74.8723,
            "severity": 3,
            "severity_label": "high",
            "risk_score": 78.0,
            "status": "active",
            "pollutants": {
                "pm25": {"value": 192.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 290.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 32.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 14.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 29.0,
                "humidity": 55,
                "wind_speed": 14.2,
                "wind_direction": 115,
                "provenance": "observed"
            },
            "affected_population_estimate": 84000,
            "cross_border_risk": True,
            "reports_count": 6,
            "last_updated": now_iso,
            "summary": "Post-harvest paddy straw burning generating significant aerosol plume. Prevailing ESE wind (14 km/h) is transporting smoke towards the Lahore trans-boundary corridor.",
            "satellite_aerosol_index": {"value": 0.76, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": ["rep_seed_03"]
        },
        {
            "id": "hotspot_bra_sp_01",
            "title": "Industrial Smelting Emissions — Cubatão Valley",
            "country": "Brazil",
            "city": "São Paulo",
            "latitude": -23.8950,
            "longitude": -46.4250,
            "severity": 3,
            "severity_label": "high",
            "risk_score": 74.5,
            "status": "active",
            "pollutants": {
                "pm25": {"value": 115.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 180.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 68.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 45.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 24.0,
                "humidity": 82,
                "wind_speed": 6.0,
                "wind_direction": 160,
                "provenance": "observed"
            },
            "affected_population_estimate": 42000,
            "cross_border_risk": False,
            "reports_count": 4,
            "last_updated": now_iso,
            "summary": "Valley temperature inversion trapping metallurgical emissions in coastal Serra do Mar basin.",
            "satellite_aerosol_index": {"value": 0.62, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": ["rep_seed_04"]
        },
        {
            "id": "hotspot_za_joburg_01",
            "title": "Coal Mining Dust & Smoldering Slag — Mpumalanga Belt",
            "country": "South Africa",
            "city": "Johannesburg",
            "latitude": -26.0150,
            "longitude": 29.2340,
            "severity": 3,
            "severity_label": "high",
            "risk_score": 76.0,
            "status": "active",
            "pollutants": {
                "pm25": {"value": 138.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 265.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 54.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 62.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 21.5,
                "humidity": 45,
                "wind_speed": 11.0,
                "wind_direction": 280,
                "provenance": "observed"
            },
            "affected_population_estimate": 36000,
            "cross_border_risk": True,
            "reports_count": 5,
            "last_updated": now_iso,
            "summary": "Highveld power station corridor combining with opencast dust re-suspension and trans-boundary drift towards Eswatini/Mozambique border.",
            "satellite_aerosol_index": {"value": 0.71, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": ["rep_seed_05"]
        },
        {
            "id": "hotspot_chn_beijing_01",
            "title": "Hebei Heavy Industrial Stagnation Zone",
            "country": "China",
            "city": "Beijing",
            "latitude": 39.4500,
            "longitude": 116.8000,
            "severity": 4,
            "severity_label": "critical",
            "risk_score": 86.0,
            "status": "active",
            "pollutants": {
                "pm25": {"value": 210.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 320.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 85.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 38.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 18.0,
                "humidity": 75,
                "wind_speed": 3.8,
                "wind_direction": 190,
                "provenance": "observed"
            },
            "affected_population_estimate": 125000,
            "cross_border_risk": False,
            "reports_count": 8,
            "last_updated": now_iso,
            "summary": "Southerly wind pushing regional industrial emissions against Taihang Mountain barrier creating intense localized haze accumulation.",
            "satellite_aerosol_index": {"value": 0.92, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": []
        },
        {
            "id": "hotspot_rus_moscow_01",
            "title": "Refinery Flaring & Ring Road Congestion — Kapotnya",
            "country": "Russia",
            "city": "Moscow",
            "latitude": 55.6350,
            "longitude": 37.7850,
            "severity": 2,
            "severity_label": "watch",
            "risk_score": 48.0,
            "status": "monitoring",
            "pollutants": {
                "pm25": {"value": 45.0, "unit": "µg/m³", "provenance": "observed"},
                "pm10": {"value": 78.0, "unit": "µg/m³", "provenance": "observed"},
                "no2": {"value": 58.0, "unit": "ppb", "provenance": "simulated"},
                "so2": {"value": 22.0, "unit": "ppb", "provenance": "simulated"}
            },
            "weather": {
                "temperature": 14.0,
                "humidity": 70,
                "wind_speed": 12.0,
                "wind_direction": 270,
                "provenance": "observed"
            },
            "affected_population_estimate": 28000,
            "cross_border_risk": False,
            "reports_count": 3,
            "last_updated": now_iso,
            "summary": "Moderate emissions flare at oil processing facility combined with heavy ring-road diesel transport.",
            "satellite_aerosol_index": {"value": 0.42, "unit": "AOD index", "provenance": "simulated"},
            "contributing_report_ids": []
        }
    ]

    # 2. Authority Alerts
    alerts = [
        {
            "id": "alt_delhi_8812",
            "hotspot_id": "hotspot_ind_delhi_01",
            "title": "Critical Industrial Discharge — Okhla Phase II",
            "severity": "critical",
            "risk_score": 89.5,
            "status": "pending",
            "created_at": now_iso,
            "affected_population": 58000,
            "gemini_summary": "Unpermitted tire/waste combustion confirmed by 9 visual reports and local PM2.5 sensor spike to 248 µg/m³. Severe immediate respiratory hazard for neighboring residential colonies.",
            "recommended_intervention": "1. Dispatch hazardous emissions inspection unit to Block C industrial quadrant.\n2. Issue school outdoor recess suspension advisory within 2.5km radius.\n3. Deploy misting cannons along Maa Anandmayee Marg corridor.",
            "action_log": [],
            "location_name": "Okhla Industrial Area, Phase II",
            "country": "India",
            "latitude": 28.5355,
            "longitude": 77.2690,
            "evidence_photo_url": "https://images.unsplash.com/photo-1579240830604-fa9a781258d4?w=600&auto=format&fit=crop&q=60"
        },
        {
            "id": "alt_punjab_8813",
            "hotspot_id": "hotspot_ind_punjab_02",
            "title": "Cross-Border Crop Residue Fire Plume — Amritsar Border",
            "severity": "high",
            "risk_score": 78.0,
            "status": "acknowledged",
            "created_at": now_iso,
            "affected_population": 84000,
            "gemini_summary": "Intense stubble combustion cluster generating eastward-moving smoke corridor across international border. High particulate density (PM2.5: 192 µg/m³).",
            "recommended_intervention": "1. Alert District Agricultural Magistrate for rapid mechanized fire suppression.\n2. Trigger bilateral cross-border clean air coordination bulletin.",
            "action_log": [
                {
                    "action": "acknowledge",
                    "actor": "Officer H. Singh (Punjab Pollution Control Board)",
                    "timestamp": now_iso,
                    "notes": "Acknowledged. Dispatched field team with agricultural balers."
                }
            ],
            "location_name": "Majha Agricultural Corridor, Amritsar",
            "country": "India",
            "latitude": 31.6340,
            "longitude": 74.8723,
            "evidence_photo_url": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=60"
        }
    ]

    # 3. Cross-Border Scenarios
    crossborder_scenarios = [
        {
            "id": "xb_punjab_lahore_01",
            "title": "Agricultural Crop Residue Drift Corridor",
            "source_region": "Punjab Agricultural Belt (India)",
            "target_region": "Lahore Metropolitan District & Punjab Border (Pakistan / Regional Corridor)",
            "country_source": "India",
            "country_target": "Pakistan / Cross-Border Grid",
            "pollutant_type": "Biomass Smoke (PM2.5, PM10 & Carbon Monoxide)",
            "wind_vector": {"speed_kmh": 14.2, "bearing_deg": 115, "direction": "ESE"},
            "estimated_arrival_window": "3.5 to 5.0 hours (14:30 – 16:00 UTC)",
            "confidence": 0.88,
            "plume_polygon": [
                [31.45, 74.20],
                [31.75, 74.55],
                [31.85, 75.10],
                [31.35, 75.30],
                [31.10, 74.60]
            ],
            "recommended_crossborder_action": "Issue bilateral trans-boundary advisory; coordinate localized agricultural fire suppression and trigger clean-air air filtration shelters in border settlements.",
            "provenance": "predicted",
            "status": "active",
            "last_updated": now_iso
        },
        {
            "id": "xb_amazon_mercosur_02",
            "title": "Amazon Southern Arc Biomass Haze Drift",
            "source_region": "Mato Grosso Deforestation & Agricultural Frontier (Brazil)",
            "target_region": "Paraguay Chaco & Northern Argentina Border",
            "country_source": "Brazil",
            "country_target": "Paraguay / Argentina (Mercosur Shared Airshed)",
            "pollutant_type": "Dense Forest & Pasture Smoke (AOD > 1.2)",
            "wind_vector": {"speed_kmh": 18.0, "bearing_deg": 195, "direction": "SSW"},
            "estimated_arrival_window": "8.0 to 12.0 hours",
            "confidence": 0.84,
            "plume_polygon": [
                [-14.0, -56.0],
                [-17.0, -58.0],
                [-22.0, -59.5],
                [-21.0, -56.5],
                [-16.0, -53.0]
            ],
            "recommended_crossborder_action": "Activate Mercosur Environmental Emergency Protocol; share real-time aerosol trajectory with Asunción and Buenos Aires meteorological institutes.",
            "provenance": "predicted",
            "status": "active",
            "last_updated": now_iso
        }
    ]

    # 4. Dense Micro-Sensor Mesh
    sensors = [
        # Delhi Cluster
        {"id": "sn_del_01", "name": "Okhla C-Block Industrial Node", "latitude": 28.536, "longitude": 77.271, "country": "India", "city": "New Delhi", "pollutants": {"pm25": {"value": 252.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 390.0, "unit": "µg/m³", "provenance": "simulated"}}},
        {"id": "sn_del_02", "name": "Anand Vihar Transit Terminal", "latitude": 28.650, "longitude": 77.315, "country": "India", "city": "New Delhi", "pollutants": {"pm25": {"value": 218.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 345.0, "unit": "µg/m³", "provenance": "simulated"}}},
        {"id": "sn_del_03", "name": "Dwarka Sector 8 Residential", "latitude": 28.570, "longitude": 77.070, "country": "India", "city": "New Delhi", "pollutants": {"pm25": {"value": 112.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 178.0, "unit": "µg/m³", "provenance": "simulated"}}},
        {"id": "sn_del_04", "name": "Nehru Place Commercial Hub", "latitude": 28.549, "longitude": 77.252, "country": "India", "city": "New Delhi", "pollutants": {"pm25": {"value": 164.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 240.0, "unit": "µg/m³", "provenance": "simulated"}}},
        # Punjab Border
        {"id": "sn_pun_01", "name": "Amritsar GT Road Agri Monitor", "latitude": 31.640, "longitude": 74.880, "country": "India", "city": "Amritsar", "pollutants": {"pm25": {"value": 195.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 298.0, "unit": "µg/m³", "provenance": "simulated"}}},
        {"id": "sn_pun_02", "name": "Attari Border Outpost Sensor", "latitude": 31.602, "longitude": 74.605, "country": "India", "city": "Amritsar", "pollutants": {"pm25": {"value": 182.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 275.0, "unit": "µg/m³", "provenance": "simulated"}}},
        # São Paulo
        {"id": "sn_sp_01", "name": "Paulista Avenue Air Node", "latitude": -23.561, "longitude": -46.656, "country": "Brazil", "city": "São Paulo", "pollutants": {"pm25": {"value": 38.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 62.0, "unit": "µg/m³", "provenance": "simulated"}}},
        {"id": "sn_sp_02", "name": "Cubatão Chemical Valley Sensor", "latitude": -23.890, "longitude": -46.420, "country": "Brazil", "city": "São Paulo", "pollutants": {"pm25": {"value": 118.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 185.0, "unit": "µg/m³", "provenance": "simulated"}}},
        # Johannesburg
        {"id": "sn_za_01", "name": "Mpumalanga Power Grid Sensor", "latitude": -26.020, "longitude": 29.240, "country": "South Africa", "city": "Johannesburg", "pollutants": {"pm25": {"value": 140.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 270.0, "unit": "µg/m³", "provenance": "simulated"}}},
        # Beijing
        {"id": "sn_bj_01", "name": "Chaoyang District Micro Node", "latitude": 39.920, "longitude": 116.440, "country": "China", "city": "Beijing", "pollutants": {"pm25": {"value": 185.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 290.0, "unit": "µg/m³", "provenance": "simulated"}}},
        # Moscow
        {"id": "sn_mos_01", "name": "Kapotnya Petrochemical Sensor", "latitude": 55.638, "longitude": 37.790, "country": "Russia", "city": "Moscow", "pollutants": {"pm25": {"value": 48.0, "unit": "µg/m³", "provenance": "simulated"}, "pm10": {"value": 82.0, "unit": "µg/m³", "provenance": "simulated"}}}
    ]

    # 5. Satellite Aerosol Proxy Points
    satellite_points = [
        {"latitude": 28.5, "longitude": 77.2, "aod": 0.88, "provenance": "simulated"},
        {"latitude": 28.6, "longitude": 77.3, "aod": 0.82, "provenance": "simulated"},
        {"latitude": 31.6, "longitude": 74.8, "aod": 0.76, "provenance": "simulated"},
        {"latitude": -23.5, "longitude": -46.6, "aod": 0.52, "provenance": "simulated"},
        {"latitude": -26.0, "longitude": 29.2, "aod": 0.71, "provenance": "simulated"},
        {"latitude": 39.5, "longitude": 116.8, "aod": 0.92, "provenance": "simulated"},
        {"latitude": 55.6, "longitude": 37.8, "aod": 0.42, "provenance": "simulated"}
    ]

    # 6. Seed Citizen Reports
    reports = [
        {
            "id": "rep_seed_01",
            "created_at": now_iso,
            "status": "analyzed",
            "description": "Massive black smoke billowing from waste processing area behind industrial complex. Acrid smell spreading across residential blocks.",
            "latitude": 28.5355,
            "longitude": 77.2690,
            "location_name": "Okhla Industrial Area, Phase II",
            "language": "en",
            "voice_transcript": "Massive dark smoke plume coming from the recycling unit. Hard to breathe outside.",
            "photo_url": "https://images.unsplash.com/photo-1579240830604-fa9a781258d4?w=600&auto=format&fit=crop&q=60",
            "analysis": {
                "event_type": "industrial_smoke",
                "pollution_source": "Unpermitted tire and industrial scrap combustion",
                "severity": 4,
                "confidence": 0.94,
                "visual_evidence": ["Thick black particulate plume", "Ground-level dispersion towards residential colonies", "Heavy soot accumulation"],
                "recommended_verification": ["Dispatch municipal environmental inspection squad", "Examine continuous stack emission logs", "Cross-check sensor sn_del_01"],
                "explanation": "High-density hydrocarbon combustion combined with atmospheric stagnation (wind 4.5 km/h) creates severe localized acute exposure risk."
            },
            "provenance": {"analysis": "inferred", "report_input": "observed"}
        },
        {
            "id": "rep_seed_03",
            "created_at": now_iso,
            "status": "analyzed",
            "description": "Large agricultural stubble burning visible across eastern farmland. Haze drifting across highway towards border.",
            "latitude": 31.6340,
            "longitude": 74.8723,
            "location_name": "Majha Agricultural Corridor, Amritsar",
            "language": "en",
            "voice_transcript": "Farmers burning paddy residue in multiple fields. Smoke is thick and moving west.",
            "photo_url": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=60",
            "analysis": {
                "event_type": "agricultural_burning",
                "pollution_source": "Post-harvest paddy straw field fires",
                "severity": 3,
                "confidence": 0.90,
                "visual_evidence": ["Low-altitude white/grey biomass smoke cloud", "Multi-acre field smoldering", "Horizontal windward drift"],
                "recommended_verification": ["Alert district agricultural enforcement unit", "Coordinate mechanized balers and fire suppression"],
                "explanation": "Widespread biomass burning with ESE wind (14.2 km/h) driving trans-boundary plume movement."
            },
            "provenance": {"analysis": "inferred", "report_input": "observed"}
        }
    ]

    # Write files
    def write_json(path, data):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"  [OK] Written: {path.name} ({len(data)} items)")

    write_json(data_dir / "hotspots.json", hotspots)
    write_json(data_dir / "alerts.json", alerts)
    write_json(data_dir / "crossborder.json", crossborder_scenarios)
    write_json(data_dir / "sensors.json", sensors)
    write_json(data_dir / "satellite.json", satellite_points)
    write_json(data_dir / "reports.json", reports)
    write_json(data_dir / "audit_log.json", [
        {
            "id": "log_init_01",
            "alert_id": "alt_punjab_8813",
            "action": "acknowledge",
            "actor": "Officer H. Singh (Punjab Pollution Control Board)",
            "timestamp": now_iso,
            "notes": "Acknowledged. Dispatched field team with agricultural balers."
        }
    ])

    print("All AtmosBridge seed datasets generated successfully!")

if __name__ == "__main__":
    generate_seed_data()
