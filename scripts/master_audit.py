#!/usr/bin/env python3
from pathlib import Path
import json, re
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
B = json.loads((ROOT / "admin-data/business.json").read_text(encoding="utf-8"))
hic = str(B.get("nycHic") or "")
checks = []

def add(name, status, details, items=None):
    checks.append({"name":name, "status":status, "details":details, "items":items or []})

required = ["index.html","style.css","script.js",".pages.yml","gallery.json"]
missing = [x for x in required if not (ROOT/x).exists()]
add("Working site core", "PASS" if not missing else "FAIL",
    "Core working files present." if not missing else "Core files missing.", missing)

mismatch = []
for p in list(ROOT.glob("*.html")) + list(ROOT.glob("*.js")):
    t = p.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r'(?i)HIC\s*#\s*(\d{7,8})', t):
        if hic and m.group(1) != hic:
            mismatch.append(f"{p.name}: {m.group(0)}")
add("NYC HIC consistency", "PASS" if not mismatch else "WARN",
    "HIC values consistent." if not mismatch else "Review inconsistent HIC values.",
    sorted(set(mismatch)))

placeholders = []
header = ROOT / "header.html"
if header.exists():
    t = header.read_text(encoding="utf-8", errors="ignore")
    if "G-XXXXXXXXXX" in t:
        placeholders.append("Google Analytics placeholder")
    if "YOUR_CLARITY_ID_HERE" in t:
        placeholders.append("Microsoft Clarity placeholder")
add("Analytics placeholders", "PASS" if not placeholders else "WARN",
    "No known placeholders found." if not placeholders else "Analytics setup is incomplete.",
    placeholders)

fail = sum(x["status"] == "FAIL" for x in checks)
warn = sum(x["status"] == "WARN" for x in checks)
status = "GOOD" if fail == 0 and warn == 0 else ("ATTENTION" if fail == 0 else "ACTION NEEDED")

report = {
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "status": status,
    "summary": f"{fail} failed, {warn} warning(s).",
    "checks": checks
}

out = ROOT / "admin-tools/master-audit.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(report["status"], report["summary"])
