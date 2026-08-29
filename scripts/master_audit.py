#!/usr/bin/env python3
"""Generate the Pages CMS master health report without changing public content."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
checks: list[dict[str, object]] = []


def add(name: str, status: str, details: str, items: list[str] | None = None) -> None:
    checks.append({"name": name, "status": status, "details": details, "items": items or []})


def read_json(path: Path) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


required_core = [
    ".pages.yml", "index.html", "style.css", "script.js", "header.html",
    "footer.html", "gallery.json", "sitemap.xml", "robots.txt"
]
missing_core = [path for path in required_core if not (ROOT / path).exists()]
add(
    "Working site core",
    "PASS" if not missing_core else "FAIL",
    "All core website files are present." if not missing_core else "One or more core website files are missing.",
    missing_core,
)

required_data = [
    "site-data/homepage.json", "site-data/business.json", "site-data/header.json",
    "site-data/pages.json", "site-data/areas.json", "site-data/services.json",
    "site-data/faqs.json", "site-data/reviews.json", "site-data/specials.json",
    "admin-data/estimator.json", "admin-tools/master-audit.json",
    "admin-tools/unused-images-report.json",
]
missing_data = [path for path in required_data if not (ROOT / path).exists()]
add(
    "CMS data files",
    "PASS" if not missing_data else "FAIL",
    "All CMS data and report files are present." if not missing_data else "CMS data files are missing.",
    missing_data,
)

invalid_json: list[str] = []
for path in sorted(ROOT.rglob("*.json")):
    if ".git" in path.parts:
        continue
    try:
        json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        invalid_json.append(f"{path.relative_to(ROOT).as_posix()}: {exc}")
add(
    "JSON validity",
    "PASS" if not invalid_json else "FAIL",
    "Every JSON file is valid." if not invalid_json else "Invalid JSON prevents CMS or website updates from loading.",
    invalid_json,
)

cms_missing: list[str] = []
pages_config = ROOT / ".pages.yml"
if pages_config.exists():
    config_text = pages_config.read_text(encoding="utf-8", errors="ignore")
    configured_paths = re.findall(r"^\s+path:\s*[\"']?([^\"'\n]+?)[\"']?\s*$", config_text, re.MULTILINE)
    for configured in sorted(set(configured_paths)):
        if not (ROOT / configured).exists():
            cms_missing.append(configured)
add(
    "Pages CMS editor paths",
    "PASS" if not cms_missing else "FAIL",
    "Every configured CMS editor points to an existing file or folder." if not cms_missing else "Some CMS editors point to missing paths.",
    cms_missing,
)

sitemap_missing: list[str] = []
sitemap_path = ROOT / "sitemap.xml"
if sitemap_path.exists():
    try:
        tree = ElementTree.parse(sitemap_path)
        for loc in tree.findall(".//{*}loc"):
            url_path = unquote(urlparse(loc.text or "").path)
            expected = ROOT / ("index.html" if url_path in ("", "/") else url_path.lstrip("/"))
            if not expected.exists():
                sitemap_missing.append(url_path or "/")
    except ElementTree.ParseError as exc:
        sitemap_missing.append(f"Invalid sitemap.xml: {exc}")
add(
    "Sitemap pages",
    "PASS" if not sitemap_missing else "FAIL",
    "Every sitemap URL has a website file." if not sitemap_missing else "The sitemap includes missing pages.",
    sitemap_missing,
)

missing_links: list[str] = []
attribute_pattern = re.compile(r"\b(?:href|src)=[\"']([^\"']+)[\"']", re.IGNORECASE)
for html_path in sorted(ROOT.glob("*.html")):
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    for raw in attribute_pattern.findall(html):
        if not raw or raw.startswith(("#", "mailto:", "tel:", "sms:", "javascript:", "data:")):
            continue
        parsed = urlparse(raw)
        if parsed.scheme or parsed.netloc or "{" in parsed.path:
            continue
        clean_path = unquote(parsed.path)
        if not clean_path:
            continue
        expected = (ROOT / clean_path.lstrip("/")) if clean_path.startswith("/") else (html_path.parent / clean_path)
        expected = expected.resolve()
        if ROOT not in expected.parents and expected != ROOT:
            continue
        if clean_path.endswith("/"):
            expected = expected / "index.html"
        if not expected.exists():
            missing_links.append(f"{html_path.name}: {raw}")
add(
    "Static page links and assets",
    "PASS" if not missing_links else "WARN",
    "All static HTML links and assets resolve locally." if not missing_links else "Review HTML references that do not have a matching local file.",
    sorted(set(missing_links)),
)

gallery_missing: list[str] = []
gallery = read_json(ROOT / "gallery.json")
if isinstance(gallery, dict):
    references: list[tuple[str, str]] = []
    for section in ("homePairs", "galleryPairs"):
        for index, item in enumerate(gallery.get(section, []), start=1):
            if not isinstance(item, dict) or item.get("active") is False:
                continue
            for side in ("before", "after"):
                references.append((str(item.get(side) or ""), f"{section} item {index} ({side})"))
    for index, item in enumerate(gallery.get("galleryGrid", []), start=1):
        if isinstance(item, dict):
            if item.get("active") is False:
                continue
            value = str(item.get("name") or "")
        else:
            value = str(item or "")
        references.append((value, f"galleryGrid item {index}"))

    for value, used_in in references:
        clean = value.split("?", 1)[0].split("#", 1)[0].strip()
        if not clean:
            gallery_missing.append(f"{used_in}: no photo selected")
            continue
        relative = clean.lstrip("/")
        if not relative.startswith("images/"):
            relative = f"images/{relative}"
        if not (ROOT / relative).exists():
            gallery_missing.append(f"{used_in}: /{relative}")
add(
    "Gallery photo references",
    "PASS" if not gallery_missing else "FAIL",
    "Every active gallery photo exists." if not gallery_missing else "Active gallery items reference missing or blank photos.",
    gallery_missing,
)

duplicate_scripts: list[str] = []
script_pattern = re.compile(r"<script\b[^>]*\bsrc=[\"']([^\"']+)[\"']", re.IGNORECASE)
for html_path in sorted(ROOT.glob("*.html")):
    seen: set[str] = set()
    for source in script_pattern.findall(html_path.read_text(encoding="utf-8", errors="ignore")):
        normalized = source.split("?", 1)[0]
        if normalized in seen:
            duplicate_scripts.append(f"{html_path.name}: {normalized}")
        seen.add(normalized)
add(
    "Duplicate script loading",
    "PASS" if not duplicate_scripts else "WARN",
    "No page loads the same script twice." if not duplicate_scripts else "Duplicate scripts can make page controls fail or run twice.",
    duplicate_scripts,
)

business = read_json(ROOT / "site-data" / "business.json")
hic = str(business.get("nycHic") or "") if isinstance(business, dict) else ""
hic_mismatch: list[str] = []
hic_pattern = re.compile(r"(?i)(?<!NJ )HIC\s*#\s*(\d{7,8})")
for path in sorted(list(ROOT.glob("*.html")) + list(ROOT.glob("*.js"))):
    text = path.read_text(encoding="utf-8", errors="ignore")
    for match in hic_pattern.finditer(text):
        if hic and match.group(1) != hic:
            hic_mismatch.append(f"{path.name}: {match.group(0)}")
add(
    "NYC HIC consistency",
    "PASS" if not hic_mismatch else "WARN",
    "NYC HIC values match Business Settings." if not hic_mismatch else "Some older page text has a different NYC HIC value.",
    sorted(set(hic_mismatch)),
)

placeholders: list[str] = []
for path in (ROOT / "header.html", ROOT / "index.html"):
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    if "G-XXXXXXXXXX" in text:
        placeholders.append(f"{path.name}: Google Analytics placeholder")
    if "YOUR_CLARITY_ID_HERE" in text:
        placeholders.append(f"{path.name}: Microsoft Clarity placeholder")
add(
    "Analytics setup",
    "PASS" if not placeholders else "WARN",
    "No known analytics placeholders were found." if not placeholders else "Analytics placeholders remain and will not collect useful data.",
    placeholders,
)

fail_count = sum(item["status"] == "FAIL" for item in checks)
warn_count = sum(item["status"] == "WARN" for item in checks)
status = "GOOD" if fail_count == 0 and warn_count == 0 else ("ATTENTION" if fail_count == 0 else "ACTION NEEDED")
report = {
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "status": status,
    "summary": f"{len(checks)} checks: {fail_count} failed, {warn_count} warning(s).",
    "checks": checks,
}

output = ROOT / "admin-tools" / "master-audit.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(report["status"], report["summary"])
