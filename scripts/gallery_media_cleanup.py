#!/usr/bin/env python3
"""Create a conservative unused-image report or delete only re-verified report entries."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
REPORT = ROOT / "admin-tools" / "unused-images-report.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".json", ".yml", ".yaml", ".md", ".xml", ".txt"}


def human_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{size} B"


def repository_text() -> str:
    chunks: list[str] = []
    excluded = {REPORT.resolve()}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if ".git" in path.parts or path.resolve() in excluded:
            continue
        chunks.append(path.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(chunks)


def unused_images() -> list[Path]:
    source = repository_text()
    results: list[Path] = []
    if not IMAGES.exists():
        return results
    for path in sorted(IMAGES.iterdir(), key=lambda item: item.name.lower()):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        relative = path.relative_to(ROOT).as_posix()
        if path.name not in source and relative not in source and ("/" + relative) not in source:
            results.append(path)
    return results


def write_report(paths: list[Path]) -> None:
    total = sum(path.stat().st_size for path in paths)
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(paths),
        "totalSize": human_size(total),
        "note": "Report only. Review every file before using the separate delete action.",
        "files": [
            {
                "image": "/" + path.relative_to(ROOT).as_posix(),
                "size": human_size(path.stat().st_size),
                "reason": "No reference to this filename was found in website content or configuration."
            }
            for path in paths
        ]
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def delete_verified() -> None:
    if not REPORT.exists():
        raise SystemExit("No scan report exists. Run scan first.")
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    listed = {
        str(item.get("image", "")).removeprefix("/")
        for item in report.get("files", []) if isinstance(item, dict)
    }
    currently_unused = {path.relative_to(ROOT).as_posix(): path for path in unused_images()}
    deleted = []
    for relative in sorted(listed):
        path = currently_unused.get(relative)
        if path and path.parent.resolve() == IMAGES.resolve():
            path.unlink()
            deleted.append(path.name)
    write_report(unused_images())
    print(f"Deleted {len(deleted)} re-verified unused image(s).")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("scan", "delete"), required=True)
    args = parser.parse_args()
    if args.mode == "scan":
        paths = unused_images()
        write_report(paths)
        print(f"Found {len(paths)} possible unused image(s); nothing deleted.")
    else:
        delete_verified()


if __name__ == "__main__":
    main()
