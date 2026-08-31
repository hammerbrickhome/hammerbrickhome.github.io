#!/usr/bin/env python3
"""Build read-only owner and SEO reports for Pages CMS."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "admin-tools"


def read_json(relative: str, default):
    try:
        return json.loads((ROOT / relative).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


def write_json(relative: str, payload: object) -> None:
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def parse_day(value: object) -> date | None:
    try:
        return date.fromisoformat(str(value)) if value else None
    except ValueError:
        return None


def is_live(item: object, start_field: str = "publishStart", end_field: str = "publishEnd") -> bool:
    if not isinstance(item, dict) or item.get("active") is False:
        return False
    status = str(item.get("publishStatus") or "live").lower()
    if status in {"draft", "archived"}:
        return False
    if status == "scheduled" and not item.get(start_field):
        return False
    today = date.today()
    start = parse_day(item.get(start_field))
    end = parse_day(item.get(end_field))
    return not ((start and today < start) or (end and today > end))


def text_length_issue(path: str, field: str, value: object, low: int, high: int) -> dict[str, str] | None:
    text = str(value or "").strip()
    if not text:
        return {"severity": "ERROR", "path": path, "field": field, "message": f"Add a {field}."}
    if len(text) < low:
        return {"severity": "WARN", "path": path, "field": field, "message": f"{field} is short ({len(text)} characters). Aim for at least {low}."}
    if len(text) > high:
        return {"severity": "WARN", "path": path, "field": field, "message": f"{field} is long ({len(text)} characters). Aim for no more than {high}."}
    return None


def seo_report() -> dict[str, object]:
    issues: list[dict[str, str]] = []
    pages = read_json("site-data/pages.json", {}).get("pages", [])
    active_pages = [item for item in pages if isinstance(item, dict) and item.get("active") is not False]

    for item in active_pages:
        page_path = str(item.get("url") or item.get("slug") or "Unknown page")
        for field, low, high in (("seoTitle", 25, 65), ("seoDescription", 70, 170)):
            issue = text_length_issue(page_path, field, item.get(field), low, high)
            if issue:
                issues.append(issue)
        url = str(item.get("url") or "")
        if url:
            local = "index.html" if url == "/" else urlparse(url).path.lstrip("/")
            if local and not (ROOT / local).exists():
                issues.append({"severity": "ERROR", "path": page_path, "field": "url", "message": "The public HTML file does not exist."})
        if item.get("heroImage") and not str(item.get("heroImageAlt") or "").strip():
            issues.append({"severity": "WARN", "path": page_path, "field": "heroImageAlt", "message": "Add a clear description for the hero photo."})
        for index, block in enumerate(item.get("contentBlocks", []), start=1):
            if not isinstance(block, dict) or block.get("active") is False:
                continue
            has_photos = bool(block.get("image") or (isinstance(block.get("images"), list) and any(block.get("images"))))
            if has_photos and not str(block.get("imageAlt") or "").strip():
                issues.append({"severity": "WARN", "path": page_path, "field": f"contentBlocks[{index}].imageAlt", "message": "Add a description for this page-section photo."})

    for area_path in sorted((ROOT / "content" / "areas").glob("*.json")):
        area = read_json(area_path.relative_to(ROOT).as_posix(), {})
        if not isinstance(area, dict) or area.get("published") is False:
            continue
        label = area_path.relative_to(ROOT).as_posix()
        for field, low, high in (("seoTitle", 25, 65), ("seoDescription", 70, 170)):
            issue = text_length_issue(label, field, area.get(field), low, high)
            if issue:
                issues.append(issue)
        if area.get("showHeroImage") and area.get("heroImage") and not str(area.get("heroImageAlt") or "").strip():
            issues.append({"severity": "WARN", "path": label, "field": "heroImageAlt", "message": "Add a clear description for the area hero photo."})
        for index, photo in enumerate(area.get("galleryImages", []), start=1):
            if isinstance(photo, dict) and photo.get("active") is not False and not str(photo.get("alt") or "").strip():
                issues.append({"severity": "WARN", "path": label, "field": f"galleryImages[{index}].alt", "message": "Add a photo description for accessibility and local SEO."})

    for field in ("seoTitle", "seoDescription"):
        values = [str(item.get(field) or "").strip() for item in active_pages]
        duplicates = {value for value, count in Counter(values).items() if value and count > 1}
        for value in sorted(duplicates):
            paths = [str(item.get("url") or item.get("slug")) for item in active_pages if str(item.get(field) or "").strip() == value]
            issues.append({"severity": "WARN", "path": ", ".join(paths), "field": field, "message": "These pages use the same SEO wording. Make each one unique."})

    errors = sum(item["severity"] == "ERROR" for item in issues)
    warnings = sum(item["severity"] == "WARN" for item in issues)
    status = "GOOD" if not issues else ("ACTION NEEDED" if errors else "ATTENTION")
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "issueCount": len(issues),
        "summary": f"{errors} error(s) and {warnings} recommendation(s) across public pages.",
        "issues": issues,
    }


def command_center(seo: dict[str, object]) -> dict[str, object]:
    audit = read_json("admin-tools/master-audit.json", {})
    checks = audit.get("checks", []) if isinstance(audit, dict) else []
    failures = [item for item in checks if isinstance(item, dict) and item.get("status") == "FAIL"]
    warnings = [item for item in checks if isinstance(item, dict) and item.get("status") == "WARN"]

    pages = read_json("site-data/pages.json", {}).get("pages", [])
    areas = read_json("site-data/areas.json", {}).get("areas", [])
    projects = read_json("site-data/projects.json", {}).get("projects", [])
    reviews = read_json("site-data/reviews.json", {}).get("reviews", [])
    faqs = read_json("site-data/faqs.json", {}).get("items", [])
    specials = read_json("site-data/specials.json", {}).get("specials", [])

    live_projects = sum(is_live(item) for item in projects)
    draft_projects = sum(isinstance(item, dict) and not is_live(item) for item in projects)
    image_suffixes = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}
    photo_count = sum(path.is_file() and path.suffix.lower() in image_suffixes for path in (ROOT / "images").rglob("*")) if (ROOT / "images").exists() else 0
    seo_errors = sum(isinstance(item, dict) and item.get("severity") == "ERROR" for item in seo.get("issues", []))
    broken = len(failures) + seo_errors
    warning_count = len(warnings) + sum(isinstance(item, dict) and item.get("severity") == "WARN" for item in seo.get("issues", []))

    next_steps = []
    for item in failures[:3] + warnings[:2]:
        next_steps.append(f"{item.get('name')}: {item.get('details')}")
    if seo.get("issueCount"):
        next_steps.append("Open SEO Control Report and review the highest-priority items.")
    if not next_steps:
        next_steps.append("No urgent repair is currently listed. Create a backup before the next major content update.")

    status = "GOOD" if broken == 0 and warning_count == 0 else ("ATTENTION" if broken == 0 else "ACTION NEEDED")
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "summary": f"{broken} broken item(s), {warning_count} warning(s), {live_projects} live project(s), and {photo_count} project photo(s).",
        "counts": {
            "activePages": sum(isinstance(item, dict) and item.get("active") is not False for item in pages),
            "activeAreas": sum(isinstance(item, dict) and item.get("active") is not False for item in areas),
            "liveProjects": live_projects,
            "draftProjects": draft_projects,
            "liveReviews": sum(is_live(item) for item in reviews),
            "liveFaqs": sum(is_live(item) for item in faqs),
            "currentSpecials": sum(is_live(item, "startDate", "endDate") for item in specials),
            "projectPhotos": photo_count,
            "brokenItems": broken,
            "warnings": warning_count,
        },
        "lastBackupNote": "GitHub stores downloadable backup ZIPs with the Admin Power Tools workflow for 30 days. Run a fresh backup before major edits.",
        "nextSteps": next_steps,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="Fail only for core publishing blockers.")
    args = parser.parse_args()

    seo = seo_report()
    dashboard = command_center(seo)
    write_json("admin-tools/seo-report.json", seo)
    write_json("admin-tools/command-center.json", dashboard)
    print(dashboard["status"], dashboard["summary"])

    if args.strict:
        audit = read_json("admin-tools/master-audit.json", {})
        blockers = {"Working site core", "CMS data files", "JSON validity", "Pages CMS editor paths", "Sitemap pages"}
        failed = [item.get("name") for item in audit.get("checks", []) if isinstance(item, dict) and item.get("name") in blockers and item.get("status") == "FAIL"]
        if failed:
            raise SystemExit("Safe publish check blocked: " + ", ".join(str(item) for item in failed))


if __name__ == "__main__":
    main()
