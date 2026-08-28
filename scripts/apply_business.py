#!/usr/bin/env python3
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
B = json.loads((ROOT / "site-data/business.json").read_text(encoding="utf-8"))

hic = str(B.get("nycHic") or "").strip()
nj = str(B.get("njHic") or "").strip()
email = str(B.get("email") or "").strip()
phone = re.sub(r"\D", "", str(B.get("phone") or ""))
formatted = f"{phone[:3]}-{phone[3:6]}-{phone[6:]}" if len(phone) == 10 else str(B.get("phone") or "")
tel = "+1" + phone if len(phone) == 10 else ""

targets = list(ROOT.glob("*.html")) + list(ROOT.glob("*.js")) + [ROOT/"header.html", ROOT/"footer.html"]
seen = set()

for p in targets:
    if not p.exists() or p in seen:
        continue
    seen.add(p)

    old = p.read_text(encoding="utf-8", errors="replace")
    new = old

    if hic:
        new = new.replace("21311291", hic)
        new = re.sub(r'(?i)(HIC\s*#\s*)\d{7,8}', lambda m: m.group(1) + hic, new)

    if nj:
        new = re.sub(r'(?i)(NJ\s*HIC\s*#\s*)[A-Z0-9]+', lambda m: m.group(1) + nj, new)

    if email:
        new = new.replace("hammerbrickhome@gmail.com", email)

    if len(phone) == 10:
        new = new.replace("929-595-5300", formatted)
        new = new.replace("+19295955300", tel)
        new = re.sub(r'(href=["\']tel:)[^"\']+(["\'])', lambda m: m.group(1) + tel + m.group(2), new)
        new = re.sub(r'(href=["\']sms:)[^"\']+(["\'])', lambda m: m.group(1) + tel + m.group(2), new)

    if new != old:
        p.write_text(new, encoding="utf-8")
        print("Updated", p.name)

print("Business settings applied.")
