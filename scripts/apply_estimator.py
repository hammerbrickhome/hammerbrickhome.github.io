#!/usr/bin/env python3
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "estimator-advanced.js"

if not P.exists():
    raise SystemExit("estimator-advanced.js not found; no changes made.")

cfg = json.loads((ROOT / "admin-data/estimator.json").read_text(encoding="utf-8"))
text = P.read_text(encoding="utf-8")

def patch_object(source, const_name, values):
    m = re.search(r'(const\s+' + re.escape(const_name) + r'\s*=\s*\{)(.*?)(\};)', source, re.S)
    if not m:
        raise RuntimeError("Safety stop: " + const_name + " not found. No estimator changes written.")

    block = m.group(2)

    for key, value in values.items():
        pat = r'(["\']' + re.escape(str(key)) + r'["\']\s*:\s*)(-?\d+(?:\.\d+)?)'
        block, count = re.subn(pat, lambda x: x.group(1) + str(value), block, count=1)
        if count != 1:
            raise RuntimeError("Safety stop: " + const_name + "." + str(key) + " not found. No estimator changes written.")

    return source[:m.start(2)] + block + source[m.end(2):]

text = patch_object(text, "BOROUGH_FACTOR", cfg.get("boroughFactors", {}))
text = patch_object(text, "FINISH_FACTOR", cfg.get("finishFactors", {}))
text = patch_object(text, "URGENCY_FACTOR", cfg.get("urgencyFactors", {}))

P.write_text(text, encoding="utf-8")
print("Estimator factors applied safely.")
