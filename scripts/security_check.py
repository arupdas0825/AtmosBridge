#!/usr/bin/env python3
"""
AtmosBridge Lightweight Repository Security Scanner
Scans tracked files for accidental credentials, secrets, private keys, or API tokens.
"""

import os
import re
import sys
from pathlib import Path

# High-risk secret patterns
SECRET_PATTERNS = [
    (r"AIza[0-9A-Za-z\-_]{35}", "Google API Key (AIza...)"),
    (r"sk-[a-zA-Z0-9]{32,}", "OpenAI / Generic Secret Key (sk-...)"),
    (r"AQ\.[a-zA-Z0-9_\-]{40,}", "Google Cloud / AI Studio Session Token (AQ....)"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----", "Private Key Block"),
    (r"-----BEGIN CERTIFICATE-----", "Certificate Block"),
    (r'"type":\s*"service_account"', "Google Cloud Service Account JSON"),
    (r'"private_key":\s*"-----BEGIN', "GCP Service Account Private Key"),
]

# Paths/extensions to skip
IGNORED_DIRS = {".git", "node_modules", ".venv", "venv", "env", "dist", "build", "__pycache__", ".idea", ".vscode"}
IGNORED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".ico", ".webp", ".svg", ".map", ".pyc", ".lock"}
# These files contain the regex patterns themselves — skip to avoid false positives
IGNORED_FILES = {".env", "security_check.py", "pre_commit_check.py"}

def scan_file(filepath: Path) -> list:
    violations = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        for pattern, desc in SECRET_PATTERNS:
            matches = re.finditer(pattern, content)
            for m in matches:
                # Get line number
                line_no = content.count("\n", 0, m.start()) + 1
                violations.append((line_no, desc, m.group(0)[:12] + "..." if len(m.group(0)) > 12 else m.group(0)))
    except Exception as e:
        pass
    return violations

def run_security_scan(root_dir: Path) -> int:
    print(f"[*] Starting AtmosBridge Security Audit in: {root_dir}")
    total_scanned = 0
    issues = []

    for root, dirs, files in os.walk(root_dir):
        # Prune ignored directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            if file in IGNORED_FILES or any(file.endswith(ext) for ext in IGNORED_EXTENSIONS):
                continue
            
            filepath = Path(root) / file
            rel_path = filepath.relative_to(root_dir)
            total_scanned += 1

            file_violations = scan_file(filepath)
            if file_violations:
                for line_no, desc, preview in file_violations:
                    issues.append((str(rel_path), line_no, desc, preview))

    print(f"[*] Scanned {total_scanned} files across repository.")
    
    if issues:
        print("\n[!] CRITICAL: Potential secrets found:")
        for path, line, desc, preview in issues:
            print(f"    - {path}:{line} -> {desc} (Match: {preview})")
        print("\n[X] SECURITY AUDIT FAILED. Please sanitize before committing.\n")
        return 1
    else:
        print("[+] SUCCESS: No hardcoded API keys, private keys, or credentials found in tracked files.")
        print("[+] Repository is clean for public commit.\n")
        return 0

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    sys.exit(run_security_scan(base_dir))
