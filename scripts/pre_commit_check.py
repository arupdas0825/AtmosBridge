#!/usr/bin/env python3
"""
AtmosBridge Pre-Commit Security Hook
Scans Git-staged files for accidental credentials before every commit.
Install: copy this file to .git/hooks/pre-commit (done automatically by setup).
"""

import re
import subprocess
import sys

SECRET_PATTERNS = [
    (r"AIza[0-9A-Za-z\-_]{35}", "Google API Key (AIza...)"),
    (r"sk-[a-zA-Z0-9]{32,}", "OpenAI / Generic Secret Key (sk-...)"),
    (r"AQ\.[a-zA-Z0-9_\-]{40,}", "Google Cloud / AI Studio Session Token (AQ....)"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----", "Private Key Block"),
    (r"-----BEGIN CERTIFICATE-----", "Certificate Block"),
    (r'"type":\s*"service_account"', "Google Cloud Service Account JSON"),
    (r'"private_key":\s*"-----BEGIN', "GCP Service Account Private Key"),
    (r"(?i)password\s*=\s*['\"][^'\"]{6,}", "Hardcoded password assignment"),
]

SKIP_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".ico", ".webp", ".svg",
    ".map", ".pyc", ".lock", ".woff", ".woff2", ".ttf", ".eot",
}

def get_staged_files():
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True
    )
    return [f.strip() for f in result.stdout.splitlines() if f.strip()]

def get_staged_content(filepath):
    result = subprocess.run(
        ["git", "show", f":{filepath}"],
        capture_output=True, text=True, errors="ignore"
    )
    return result.stdout

def scan_content(content, filepath):
    issues = []
    lines = content.splitlines()
    for i, line in enumerate(lines, 1):
        for pattern, desc in SECRET_PATTERNS:
            m = re.search(pattern, line)
            if m:
                preview = m.group(0)[:16] + "..." if len(m.group(0)) > 16 else m.group(0)
                issues.append((i, desc, preview))
    return issues

def main():
    staged = get_staged_files()
    if not staged:
        sys.exit(0)

    found_issues = False
    for filepath in staged:
        ext = "." + filepath.rsplit(".", 1)[-1].lower() if "." in filepath else ""
        if ext in SKIP_EXTENSIONS:
            continue
        if filepath in (".env", "scripts/pre_commit_check.py", "scripts/security_check.py") or filepath.startswith("secrets/"):
            continue

        content = get_staged_content(filepath)
        issues = scan_content(content, filepath)
        if issues:
            found_issues = True
            for line_no, desc, preview in issues:
                print(f"  [BLOCKED] {filepath}:{line_no} -- {desc} (match: {preview})")

    if found_issues:
        print()
        print("AtmosBridge Pre-Commit Security Check FAILED")
        print("Potential secrets found in staged files.")
        print("Move secrets to .env (which is git-ignored) and retry.")
        sys.exit(1)

    print("[OK] AtmosBridge pre-commit security scan passed.")
    sys.exit(0)

if __name__ == "__main__":
    main()

