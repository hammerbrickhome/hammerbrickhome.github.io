#!/usr/bin/env python3
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
BUSINESS_FILE = ROOT / "site-data/business.json"
SNAPSHOT_FILE = ROOT / "admin-data/business.json"

if not BUSINESS_FILE.exists():
    raise SystemExit("site-data/business.json not found; no changes made.")

B = json.loads(BUSINESS_FILE.read_text(encoding="utf-8"))
previous = {}
if SNAPSHOT_FILE.exists():
    previous = json.loads(SNAPSHOT_FILE.read_text(encoding="utf-8"))

hic = str(B.get("nycHic") or "").strip()
nj = str(B.get("njHic") or "").strip()
email = str(B.get("email") or "").strip()
website = str(B.get("website") or "").strip()
phone = re.sub(r"\D", "", str(B.get("phone") or ""))
formatted = f"{phone[:3]}-{phone[3:6]}-{phone[6:]}" if len(phone) == 10 else str(B.get("phone") or "")
tel = "+1" + phone if len(phone) == 10 else ""
international_formatted = "+1-" + formatted if len(phone) == 10 else ""
old_email = str(previous.get("email") or "hammerbrickhome@gmail.com").strip()
old_phone = re.sub(r"\D", "", str(previous.get("phone") or "929-595-5300"))

targets = list(ROOT.glob("*.html")) + list(ROOT.glob("*.js")) + [ROOT / "hammerbrickhome.vcf"]
seen = set()
changes = {}

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
        for prior_email in {old_email, "hammerbrickhome@gmail.com"}:
            if prior_email:
                new = re.sub(re.escape(prior_email), lambda _: email, new, flags=re.IGNORECASE)

    if website:
        new = re.sub(r"(?im)^URL:.*$", "URL:" + website, new)

    if len(phone) == 10:
        if len(old_phone) == 10:
            old_local = rf"\(?{re.escape(old_phone[:3])}\)?[-. ]?{re.escape(old_phone[3:6])}[-. ]?{re.escape(old_phone[6:])}"
            new = re.sub(rf"(?<!\d)\+1[-. ]?{old_local}(?!\d)", international_formatted, new)
            new = re.sub(rf"(?<![\d-]){old_local}(?!\d)", formatted, new)
            new = new.replace("+1" + old_phone, tel)
        new = re.sub(r'(href=["\']tel:)[^"\']+(["\'])', lambda m: m.group(1) + tel + m.group(2), new)
        new = re.sub(r'(href=["\']sms:)[^"\']+(["\'])', lambda m: m.group(1) + tel + m.group(2), new)
        new = re.sub(r"(?im)^(TEL(?:;[^:]*)?:).*$", lambda m: m.group(1) + tel, new)

    if new != old:
        changes[p] = new

for path, content in changes.items():
    path.write_text(content, encoding="utf-8")
    print("Updated", path.name)

snapshot_content = json.dumps(B, indent=2) + "\n"
if not SNAPSHOT_FILE.exists() or SNAPSHOT_FILE.read_text(encoding="utf-8") != snapshot_content:
    SNAPSHOT_FILE.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_FILE.write_text(snapshot_content, encoding="utf-8")
    print("Updated", SNAPSHOT_FILE.relative_to(ROOT).as_posix())

print("Business settings applied.")
