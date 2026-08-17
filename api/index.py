"""
api/index.py — Vercel Serverless Entrypoint for AtmosBridge Backend

The @vercel/python runtime imports the pp FastAPI object from this file.
We insert the project root onto sys.path so that all rom backend.xxx import ...
statements in the backend package resolve correctly.
"""
import sys
import os

# Ensure the project root (parent of this file's directory) is on sys.path
# so that rom backend.config import ..., rom backend.routers import ..., etc. all work.
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

# Import the FastAPI app — Vercel reads pp from this module
from backend.main import app  # noqa: F401, E402

# pp is re-exported as the module-level name Vercel looks for.
