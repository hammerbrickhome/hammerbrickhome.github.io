#!/usr/bin/env python3
"""
Hammer Brick & Home LLC — Safe unused image cleanup

SCAN:
  - Finds image files under /images that are not referenced anywhere in the repo's
    text/code/content files.
  - Creates admin-tools/unused-images-report.json.
  - Does NOT delete anything.

DELETE:
  - Loads the latest scan report.
  - Re-scans the repo.
  - Deletes ONLY files that:
      1) were in the latest report, AND
      2) are still unused now.
  - Refreshes the report afterward.

This intentionally favors false "used" results over risky deletions.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
REPORT = ROOT / "admin-tools" / "unused-images-report.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"}

# Files that can contain image references.
TEXT_EXTS = {
    ".html", ".htm", ".css", ".js", ".mjs", ".cjs", ".json",
    ".yml", ".yaml", ".md", ".txt", ".xml", ".csv", ".toml"
}

# Extra protection for important branding/site assets.
PROTECTED_NAME_WORDS = {
    "hero", "logo", "favicon", "icon", "badge", "brand",
    "qr", "membership", "avatar", "og-image", "social"
}

# Paths we never scan as reference sources.
SKIP_DIRS = {
    ".git", "node_modules", ".wrangler", ".cloudflare", "dist", "build",
    ".next", ".cache"
}

def human_size(n: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    value = float(n)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.0f} {unit}" if unit == "B" else f"{value:.1f} {unit}"
        value /= 1024
    return f"{n} B"

def rel_posix(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()

def public_path(path: Path) -> str:
    return "/" + rel_posix(path)

def is_protected(path: Path) -> bool:
    name = path.name.lower()
    return any(word in name for word in PROTECTED_NAME_WORDS)

def candidate_images() -> list[Path]:
    if not IMAGES_DIR.exists():
        return []
    items = []
    for path in IMAGES_DIR.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTS:
            continue
        if any(part.startswith(".") for part in path.relative_to(IMAGES_DIR).parts):
            continue
        items.append(path)
    return sorted(items)

def reference_files() -> list[Path]:
    result = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue

        rel_parts = path.relative_to(ROOT).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue

        # Don't let the cleanup report reference itself.
        if path.resolve() == REPORT.resolve():
            continue

        # Don't search image binaries as text.
        if path.suffix.lower() in IMAGE_EXTS:
            continue

        if path.suffix.lower() not in TEXT_EXTS:
            continue

        # Avoid very large generated files.
        try:
            if path.stat().st_size > 5 * 1024 * 1024:
                continue
        except OSError:
            continue

        result.append(path)
    return result

def load_reference_corpus() -> list[tuple[Path, str]]:
    corpus = []
    for path in reference_files():
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        corpus.append((path, text))
    return corpus

def image_is_referenced(image: Path, corpus: list[tuple[Path, str]]) -> tuple[bool, list[str]]:
    """
    Search conservatively for:
      - filename only
      - images/subpath
      - /images/subpath

    Searching filename alone helps old gallery.json entries that store only
    "photo.jpg" while JS prepends /images/.
    """
    rel = rel_posix(image)                      # images/foo.jpg
    pub = "/" + rel                            # /images/foo.jpg
    basename = image.name                      # foo.jpg

    needles = {rel, pub, basename}
    found_in = []

    for source, text in corpus:
        if any(needle in text for needle in needles):
            found_in.append(rel_posix(source))

    return (len(found_in) > 0, found_in)

def scan_unused() -> dict:
    corpus = load_reference_corpus()
    unused = []
    protected_unreferenced = []

    for image in candidate_images():
        referenced, sources = image_is_referenced(image, corpus)
        if referenced:
            continue

        if is_protected(image):
            protected_unreferenced.append(public_path(image))
            continue

        try:
            size = image.stat().st_size
        except OSError:
            size = 0

        unused.append({
            "image": public_path(image),
            "size": human_size(size),
            "bytes": size,
            "reason": "No reference to this filename/path was found in the repository."
        })

    total = sum(item["bytes"] for item in unused)

    # Keep Pages CMS-facing report tidy: don't expose raw bytes.
    display_files = [
        {k: v for k, v in item.items() if k != "bytes"}
        for item in unused
    ]

    note = (
        "Review every image below before deleting. "
        "The delete action re-checks the repository and only deletes images "
        "that were in this report and are still unused."
    )
    if protected_unreferenced:
        note += (
            f" {len(protected_unreferenced)} unreferenced branding/critical-looking "
            "file(s) were automatically protected and are not listed."
        )

    return {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "count": len(unused),
        "totalSize": human_size(total),
        "note": note,
        "files": display_files
    }

def write_report(report: dict) -> None:
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

def load_previous_report_paths() -> set[str]:
    if not REPORT.exists():
        return set()
    try:
        data = json.loads(REPORT.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return set()
    return {
        item.get("image", "")
        for item in data.get("files", [])
        if isinstance(item, dict) and item.get("image")
    }

def delete_verified() -> tuple[int, list[str]]:
    reviewed = load_previous_report_paths()
    if not reviewed:
        return 0, []

    fresh = scan_unused()
    still_unused = {
        item["image"]
        for item in fresh.get("files", [])
        if isinstance(item, dict) and item.get("image")
    }

    # Critical safety rule: only delete files that the user already reviewed
    # in the latest report AND are still unused right now.
    approved = sorted(reviewed & still_unused)
    deleted = []

    for pub in approved:
        rel = pub.lstrip("/")
        path = (ROOT / rel).resolve()

        # Directory traversal / scope protection.
        try:
            path.relative_to(IMAGES_DIR.resolve())
        except ValueError:
            continue

        if not path.exists() or not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTS:
            continue
        if is_protected(path):
            continue

        path.unlink()
        deleted.append(pub)

    # Refresh after deletion.
    write_report(scan_unused())
    return len(deleted), deleted

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["scan", "delete"], required=True)
    args = parser.parse_args()

    if args.mode == "scan":
        report = scan_unused()
        write_report(report)
        print(f"Unused images found: {report['count']}")
        print(f"Potential space: {report['totalSize']}")
        for item in report["files"]:
            print(f"UNUSED: {item['image']} ({item['size']})")
        return 0

    count, deleted = delete_verified()
    print(f"Deleted {count} verified unused image(s).")
    for path in deleted:
        print(f"DELETED: {path}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
