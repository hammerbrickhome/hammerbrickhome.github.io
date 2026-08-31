#!/usr/bin/env python3
"""Conservative Pages CMS gallery image scanner and verified cleanup action."""

from __future__ import annotations

import argparse
import hashlib
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


def read_json(relative: str, default):
    try:
        return json.loads((ROOT / relative).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


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


def image_usage(paths: list[Path]) -> list[dict[str, object]]:
    searchable = []
    excluded = {REPORT.resolve()}
    for text_path in ROOT.rglob("*"):
        if not text_path.is_file() or text_path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if text_path.resolve() in excluded or ".git" in text_path.parts or text_path.parts[-2:] == ("admin-tools", "command-center.json"):
            continue
        searchable.append((text_path, text_path.read_text(encoding="utf-8", errors="ignore")))

    usage = []
    for path in paths:
        rel = path.relative_to(IMAGES).as_posix()
        needles = (f"/images/{rel}", f"images/{rel}", path.name)
        used_in = sorted({
            text_path.relative_to(ROOT).as_posix()
            for text_path, content in searchable
            if any(needle in content for needle in needles)
        })
        if used_in:
            usage.append({"image": f"/images/{rel}", "usedIn": used_in})
    return usage


def duplicate_groups(paths: list[Path]) -> list[dict[str, object]]:
    groups: dict[str, list[Path]] = {}
    for path in paths:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        groups.setdefault(digest, []).append(path)
    result = []
    for matching in groups.values():
        if len(matching) < 2:
            continue
        result.append({
            "count": len(matching),
            "size": human_size(matching[0].stat().st_size),
            "images": [f"/images/{path.relative_to(IMAGES).as_posix()}" for path in matching],
        })
    return sorted(result, key=lambda item: (-int(item["count"]), item["images"][0]))


def missing_alt_descriptions() -> list[dict[str, str]]:
    missing: list[dict[str, str]] = []
    pages = read_json("site-data/pages.json", {}).get("pages", [])
    for page_index, page in enumerate(pages, start=1):
        if not isinstance(page, dict) or page.get("active") is False:
            continue
        if page.get("heroImage") and not str(page.get("heroImageAlt") or "").strip():
            missing.append({"image": str(page.get("heroImage")), "usedIn": f"All Website Pages item {page_index} hero", "reason": "Add Hero Photo Description."})
        for block_index, block in enumerate(page.get("contentBlocks", []), start=1):
            if not isinstance(block, dict) or block.get("active") is False:
                continue
            photos = [block.get("image")]
            photos.extend(block.get("images", []) if isinstance(block.get("images"), list) else [])
            if any(photos) and not str(block.get("imageAlt") or "").strip():
                missing.append({"image": str(next((photo for photo in photos if photo), "")), "usedIn": f"All Website Pages item {page_index}, section {block_index}", "reason": "Add Photo Description in Additional Page Sections."})

    projects = read_json("site-data/projects.json", {}).get("projects", [])
    for index, project in enumerate(projects, start=1):
        if not isinstance(project, dict) or project.get("active") is False:
            continue
        photos = [project.get("coverImage"), project.get("beforeImage"), project.get("afterImage")]
        photos.extend(project.get("midProcessImages", []) if isinstance(project.get("midProcessImages"), list) else [])
        photos.extend(project.get("additionalImages", []) if isinstance(project.get("additionalImages"), list) else [])
        if any(photos) and not str(project.get("imageAlt") or "").strip():
            missing.append({
                "image": str(next((photo for photo in photos if photo), "")),
                "usedIn": f"Live Project Library item {index}: {project.get('title') or 'Untitled project'}",
                "reason": "Add Photo Description (Accessibility) in the project editor.",
            })

    for area_path in sorted((ROOT / "content" / "areas").glob("*.json")):
        area = read_json(area_path.relative_to(ROOT).as_posix(), {})
        if not isinstance(area, dict) or area.get("published") is False:
            continue
        if area.get("showHeroImage") and area.get("heroImage") and not str(area.get("heroImageAlt") or "").strip():
            missing.append({"image": str(area.get("heroImage")), "usedIn": f"{area_path.name} hero", "reason": "Add Hero Photo Description."})
        for index, item in enumerate(area.get("galleryImages", []), start=1):
            if not isinstance(item, dict) or item.get("active") is False:
                continue
            photos = [item.get("image"), item.get("beforeImage"), item.get("afterImage")]
            photos.extend(item.get("midProcessImages", []) if isinstance(item.get("midProcessImages"), list) else [])
            if any(photos) and not str(item.get("alt") or "").strip():
                missing.append({"image": str(next((photo for photo in photos if photo), "")), "usedIn": f"{area_path.name} gallery item {index}", "reason": "Add Photo Description in the area gallery editor."})
    return missing


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


def managed_missing_references() -> list[dict[str, str]]:
    references: list[tuple[object, str]] = []
    pages = read_json("site-data/pages.json", {}).get("pages", [])
    for page_index, page in enumerate(pages, start=1):
        if not isinstance(page, dict) or page.get("active") is False:
            continue
        references.append((page.get("heroImage"), f"All Website Pages item {page_index} (heroImage)"))
        for block_index, block in enumerate(page.get("contentBlocks", []), start=1):
            if not isinstance(block, dict) or block.get("active") is False:
                continue
            references.append((block.get("image"), f"All Website Pages item {page_index}, section {block_index} (image)"))
            for photo_index, value in enumerate(block.get("images", []) if isinstance(block.get("images"), list) else [], start=1):
                references.append((value, f"All Website Pages item {page_index}, section {block_index} (images {photo_index})"))

    projects = read_json("site-data/projects.json", {}).get("projects", [])
    for index, project in enumerate(projects, start=1):
        if not isinstance(project, dict) or project.get("active") is False:
            continue
        for field in ("coverImage", "beforeImage", "afterImage"):
            references.append((project.get(field), f"Live Project Library item {index} ({field})"))
        for field in ("midProcessImages", "additionalImages"):
            for photo_index, value in enumerate(project.get(field, []) if isinstance(project.get(field), list) else [], start=1):
                references.append((value, f"Live Project Library item {index} ({field} {photo_index})"))

    for area_path in sorted((ROOT / "content" / "areas").glob("*.json")):
        area = read_json(area_path.relative_to(ROOT).as_posix(), {})
        if not isinstance(area, dict) or area.get("published") is False:
            continue
        if area.get("showHeroImage"):
            references.append((area.get("heroImage"), f"{area_path.name} heroImage"))
        for index, item in enumerate(area.get("galleryImages", []), start=1):
            if not isinstance(item, dict) or item.get("active") is False:
                continue
            for field in ("image", "beforeImage", "afterImage"):
                references.append((item.get(field), f"{area_path.name} gallery item {index} ({field})"))
            for photo_index, value in enumerate(item.get("midProcessImages", []) if isinstance(item.get("midProcessImages"), list) else [], start=1):
                references.append((value, f"{area_path.name} gallery item {index} (midProcessImages {photo_index})"))

    missing = []
    for raw_value, used_in in references:
        clean = str(raw_value or "").split("?", 1)[0].split("#", 1)[0].strip()
        if not clean:
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
            "reason": "Upload this exact file, choose another photo, or turn off the affected content item.",
        })
    return missing


def write_report(paths: list[Path], note: str) -> None:
    total = sum(path.stat().st_size for path in paths if path.exists())
    all_images = image_files()
    all_total = sum(path.stat().st_size for path in all_images)
    missing = gallery_missing_references() + managed_missing_references()
    oversized = [path for path in all_images if path.stat().st_size > 2 * 1024 * 1024]
    duplicates = duplicate_groups(all_images)
    missing_alt = missing_alt_descriptions()
    usage = image_usage(all_images)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(paths),
        "totalImages": len(all_images),
        "usedCount": len(all_images) - len(paths),
        "totalSize": human_size(total),
        "totalLibrarySize": human_size(all_total),
        "missingCount": len(missing),
        "oversizedCount": len(oversized),
        "duplicateCount": len(duplicates),
        "missingAltCount": len(missing_alt),
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
        ],
        "oversizedFiles": [
            {
                "image": f"/images/{path.relative_to(IMAGES).as_posix()}",
                "size": human_size(path.stat().st_size),
                "reason": "Larger than 2 MB. Use the optimization preview tool and review the replacement before changing the website.",
            }
            for path in oversized
        ],
        "duplicateGroups": duplicates,
        "missingAlt": missing_alt,
        "usage": usage,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def scan() -> None:
    paths = currently_unused()
    missing = gallery_missing_references() + managed_missing_references()
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
