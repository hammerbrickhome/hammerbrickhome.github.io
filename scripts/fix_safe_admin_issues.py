#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
removed=[]
for rel in [".DS_Store","pages.yml"]:
    p=ROOT/rel
    if p.exists() and p.is_file():
        p.unlink();removed.append(rel)
print("Removed safe clutter:" if removed else "No safe clutter found.",", ".join(removed))
