import os
import sys

# Ensure project root is on sys.path so 'from backend.xxx import ...' resolves
# correctly when Vercel executes with root: "backend" (cwd = backend/).
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import settings

# Vercel sets this env var automatically on all serverless deployments
_SERVERLESS = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
from backend.routers import (
    reports,
    hotspots,
    predict,
    crossborder,
    alerts,
    analysis,
    datasources
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Federated AI Climate-Intelligence Platform for Hyperlocal and Cross-Border Pollution Detection",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Allowed Origins for CORS (Production + Localhost + Vercel Preview Deployments)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

default_origins = [
    "https://atmosbridgeai.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

all_allowed_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for photo uploads — disabled on Vercel (read-only filesystem)
# Works normally for local dev and Docker/Cloud Run deployments
if not _SERVERLESS:
    uploads_dir = settings.UPLOADS_DIR
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Mount API Routers
app.include_router(reports.router, prefix="/api")
app.include_router(hotspots.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(crossborder.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(datasources.router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "provenance_framework": "Enabled (Observed, Inferred, Predicted, Simulated)"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
