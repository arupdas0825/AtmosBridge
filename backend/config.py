import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root or backend
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "AtmosBridge"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Gemini API Key (Server-Side Only)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # OpenAQ API Key (Optional)
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")
    
    # File Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = BASE_DIR / "static" / "uploads"
    MODEL_PATH: Path = BASE_DIR / "models" / "spike_predictor.json"
    
    # BRICS Supported Countries
    BRICS_COUNTRIES = ["India", "Brazil", "Russia", "China", "South Africa"]
    
    # Risk Score Thresholds
    RISK_SAFE = 25.0
    RISK_WATCH = 50.0
    RISK_HIGH = 75.0
    RISK_CRITICAL = 90.0

settings = Settings()

# Ensure directories exist (safely caught for read-only serverless environments)
try:
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    (settings.BASE_DIR / "models").mkdir(parents=True, exist_ok=True)
except Exception:
    pass

