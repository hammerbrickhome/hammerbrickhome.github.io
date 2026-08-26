#!/usr/bin/env python3
from pathlib import Path
import json
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "admin-tools" / "site-health-report.json"

def check(name, status, details):
    return {"name": name, "status": status, "details": details}

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except Exception as exc:
        return None, str(exc)

checks = []

required = [
    ".pages.yml",
    "gallery.json",
    "site-data/business.json",
    "site-data/homepage.json",
    "site-data/specials.json",
    "site-data/reviews.json",
    "site-data/faqs.json",
    "scripts/gallery_media_cleanup.py",
    ".github/workflows/gallery-image-cleanup.yml",
]
missing = [p for p in required if not (ROOT / p).exists()]
checks.append(check(
    "Admin files",
    "PASS" if not missing else "FAIL",
    "All core admin files are present." if not missing else "Missing: " + ", ".join(missing)
))

json_files = [
    "gallery.json",
    "site-data/business.json",
    "site-data/homepage.json",
    "site-data/specials.json",
    "site-data/reviews.json",
    "site-data/faqs.json",
]
bad_json = []
parsed = {}
for rel in json_files:
    p = ROOT / rel
    if not p.exists():
        continue
    data, err = load_json(p)
    if err:
        bad_json.append(f"{rel}: {err}")
    else:
        parsed[rel] = data
checks.append(check(
    "JSON data",
    "PASS" if not bad_json else "FAIL",
    "All CMS JSON files are valid." if not bad_json else "Invalid JSON: " + " | ".join(bad_json)
))

# Gallery image references: exact case-sensitive path check.
missing_images = []
gallery = parsed.get("gallery.json")
if isinstance(gallery, dict):
    refs = []
    for key in ("homePairs", "galleryPairs"):
        for item in gallery.get(key, []) or []:
            if isinstance(item, dict):
                refs += [item.get("before"), item.get("after")]
    for item in gallery.get("galleryGrid", []) or []:
        refs.append(item.get("name") if isinstance(item, dict) else item)

    for ref in refs:
        if not ref:
            continue
        value = str(ref).strip()
        rel = value[1:] if value.startswith("/") else value
        if not rel.startswith("images/"):
            rel = "images/" + rel
        if not (ROOT / rel).exists():
            missing_images.append(value)

checks.append(check(
    "Gallery image references",
    "PASS" if not missing_images else "WARN",
    "Every gallery image reference exists." if not missing_images
    else "Missing or case-mismatched references: " + ", ".join(sorted(set(missing_images))[:30])
))

# Common clutter/misplaced admin files.
warnings = []
if (ROOT / "pages.yml").exists():
    warnings.append("Root pages.yml exists; Pages CMS uses .pages.yml.")
if (ROOT / ".DS_Store").exists():
    warnings.append(".DS_Store is committed at the repo root.")
if (ROOT / "workflows").exists():
    warnings.append("A root /workflows folder exists. GitHub Actions belong in /.github/workflows.")
checks.append(check(
    "Repository housekeeping",
    "PASS" if not warnings else "WARN",
    "No common admin clutter found." if not warnings else " ".join(warnings)
))

# Health workflow itself.
workflow = ROOT / ".github" / "workflows" / "hammer-admin-health.yml"
checks.append(check(
    "Admin Health workflow",
    "PASS" if workflow.exists() else "FAIL",
    "Health-check workflow is installed." if workflow.exists() else "Missing .github/workflows/hammer-admin-health.yml"
))

fail_count = sum(c["status"] == "FAIL" for c in checks)
warn_count = sum(c["status"] == "WARN" for c in checks)
status = "GOOD" if fail_count == 0 and warn_count == 0 else ("ATTENTION" if fail_count == 0 else "ACTION NEEDED")
summary = (
    "Everything checked out." if status == "GOOD"
    else f"{fail_count} failed check(s), {warn_count} warning(s)."
)

REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text(json.dumps({
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "status": status,
    "summary": summary,
    "checks": checks
}, indent=2) + "\n", encoding="utf-8")

print(status)
for c in checks:
    print(f"[{c['status']}] {c['name']}: {c['details']}")
