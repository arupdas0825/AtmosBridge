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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
