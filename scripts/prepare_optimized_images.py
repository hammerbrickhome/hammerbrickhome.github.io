#!/usr/bin/env python3
"""Create a review-only ZIP of optimized photos without changing website files."""

from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--max-width", type=int, default=2000)
    parser.add_argument("--quality", type=int, default=82)
    args = parser.parse_args()
    max_width = min(4000, max(800, args.max_width))
    quality = min(95, max(60, args.quality))
    destination = Path(args.output)
    manifest = {
        "warning": "REVIEW ONLY. This ZIP does not change the website. Do not delete originals until replacement photos are uploaded, selected in Pages CMS, and verified live.",
        "maxWidth": max_width,
        "quality": quality,
        "files": [],
    }

    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for source in sorted(IMAGES.rglob("*")):
            if not source.is_file() or source.suffix.lower() not in SUPPORTED:
                continue
            try:
                with Image.open(source) as opened:
                    image = ImageOps.exif_transpose(opened)
                    original_width, original_height = image.size
                    if original_width <= max_width and source.stat().st_size <= 2 * 1024 * 1024:
                        continue
                    if image.mode not in ("RGB", "RGBA"):
                        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
                    if image.width > max_width:
                        new_height = round(image.height * max_width / image.width)
                        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    buffer = io.BytesIO()
                    image.save(buffer, format="WEBP", quality=quality, method=6)
            except (OSError, ValueError):
                continue

            relative = source.relative_to(IMAGES)
            optimized_name = Path("optimized-images") / relative.with_suffix(".webp")
            optimized = buffer.getvalue()
            archive.writestr(optimized_name.as_posix(), optimized)
            original_size = source.stat().st_size
            manifest["files"].append({
                "original": f"/images/{relative.as_posix()}",
                "optimizedPreview": optimized_name.as_posix(),
                "originalDimensions": f"{original_width}x{original_height}",
                "optimizedDimensions": f"{image.width}x{image.height}",
                "originalBytes": original_size,
                "optimizedBytes": len(optimized),
                "savingsPercent": round((1 - len(optimized) / original_size) * 100, 1) if original_size else 0,
            })

        archive.writestr("optimization-manifest.json", json.dumps(manifest, indent=2) + "\n")
        archive.writestr("README.txt", manifest["warning"] + "\n")

    print(f"Prepared {len(manifest['files'])} optimized preview file(s) in {destination}.")


if __name__ == "__main__":
    main()
