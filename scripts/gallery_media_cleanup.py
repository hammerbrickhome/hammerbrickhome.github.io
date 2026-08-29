#!/usr/bin/env python3
"""Conservative Pages CMS gallery image scanner and verified cleanup action."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMAGES = (ROOT / "images").resolve()
REPORT = ROOT / "admin-tools" / "unused-images-report.json"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}
TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".yml", ".yaml", ".md", ".txt"}


def human_size(size: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{size} B"


def site_text() -> str:
    chunks: list[str] = []
    excluded = {REPORT.resolve()}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if path.resolve() in excluded or ".git" in path.parts:
            continue
        chunks.append(path.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(chunks)


def image_files() -> list[Path]:
    if not IMAGES.exists():
        return []
    return sorted(
        path.resolve()
        for path in IMAGES.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )


def currently_unused() -> list[Path]:
    content = site_text()
    unused: list[Path] = []
    for path in image_files():
        rel = path.relative_to(IMAGES).as_posix()
        site_path = f"/images/{rel}"
        if site_path not in content and f"images/{rel}" not in content and path.name not in content:
            unused.append(path)
    return unused


def gallery_missing_references() -> list[dict[str, str]]:
    gallery_path = ROOT / "gallery.json"
    if not gallery_path.exists():
        return [{
            "image": "gallery.json",
            "usedIn": "Project Gallery",
            "reason": "The gallery data file is missing. Restore it before editing project photos."
        }]

    try:
        gallery = json.loads(gallery_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [{
            "image": "gallery.json",
            "usedIn": "Project Gallery",
            "reason": "The gallery data file is not valid JSON. Repair it before editing project photos."
        }]

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

    missing: list[dict[str, str]] = []
    for raw_value, used_in in references:
        clean = raw_value.split("?", 1)[0].split("#", 1)[0].strip()
        if not clean:
            missing.append({
                "image": "(no photo selected)",
                "usedIn": used_in,
                "reason": "Choose a photo in Project Gallery Manager or turn this gallery item off."
            })
            continue
        relative = clean.lstrip("/")
        if not relative.startswith("images/"):
            relative = f"images/{relative}"
        expected = (ROOT / relative).resolve()
        if ROOT not in expected.parents or expected.exists():
            continue
        missing.append({
            "image": f"/{relative}",
            "usedIn": used_in,
            "reason": "Upload this exact filename, select a different existing photo, or turn this gallery item off."
        })
    return missing


def write_report(paths: list[Path], note: str) -> None:
    total = sum(path.stat().st_size for path in paths if path.exists())
    missing = gallery_missing_references()
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(paths),
        "totalSize": human_size(total),
        "missingCount": len(missing),
        "note": note,
        "missingReferences": missing,
        "files": [
            {
                "image": f"/images/{path.relative_to(IMAGES).as_posix()}",
                "size": human_size(path.stat().st_size),
                "reason": "No reference was found in current website, CMS, JSON, CSS, JavaScript, or documentation files."
            }
            for path in paths
            if path.exists()
        ]
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def scan() -> None:
    paths = currently_unused()
    missing = gallery_missing_references()
    write_report(
        paths,
        "Report only — nothing was deleted. Review every image before running the separate delete action."
    )
    print(
        f"Found {len(paths)} potentially unused image(s) and "
        f"{len(missing)} missing gallery reference(s). Nothing deleted."
    )


def delete_verified() -> None:
    if not REPORT.exists():
        raise SystemExit("Run scan mode before delete mode.")
    prior = json.loads(REPORT.read_text(encoding="utf-8"))
    approved = {str(item.get("image", "")) for item in prior.get("files", [])}
    unused_now = currently_unused()
    deleted = 0
    for path in unused_now:
        site_path = f"/images/{path.relative_to(IMAGES).as_posix()}"
        if site_path not in approved:
            continue
        resolved = path.resolve()
        if IMAGES not in resolved.parents:
            continue
        resolved.unlink()
        deleted += 1
    write_report(
        currently_unused(),
        f"Deleted {deleted} image(s) that were listed in the reviewed report and still verified unused."
    )
    print(f"Deleted {deleted} verified unused image(s).")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("scan", "delete"), required=True)
    args = parser.parse_args()
    scan() if args.mode == "scan" else delete_verified()


if __name__ == "__main__":
    main()
