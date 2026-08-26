#!/usr/bin/env python3
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site-data"

def load(name, default=None):
    try: return json.loads((SITE/name).read_text(encoding="utf-8"))
    except Exception: return default if default is not None else {}

def save_if_changed(path, new):
    old = path.read_text(encoding="utf-8", errors="replace")
    if old != new:
        path.write_text(new, encoding="utf-8")
        print("Updated", path.relative_to(ROOT))
        return True
    return False

def sync_business():
    b = load("business.json", {})
    a = load("analytics.json", {})
    hic = str(b.get("nycHic") or "").strip()
    nj = str(b.get("njHic") or "").strip()
    email = str(b.get("email") or "").strip()
    ga = str(a.get("googleAnalyticsId") or "").strip()
    clarity = str(a.get("microsoftClarityId") or "").strip()

    targets = list(ROOT.glob("*.html")) + list(ROOT.glob("*.js"))
    for folder in ("projects","services","areas","resources"):
        if (ROOT/folder).exists(): targets += list((ROOT/folder).glob("*.html"))

    for p in targets:
        text = p.read_text(encoding="utf-8", errors="replace")
        new = text
        if hic:
            new = new.replace("21311291", hic).replace("2131291", hic)
            new = re.sub(r'(?i)(HIC\s*#\s*)\d{7,8}', lambda m: m.group(1)+hic, new)
        if nj:
            new = new.replace("13VH14026000", nj)
            new = re.sub(r'(?i)(NJ\s*HIC\s*#\s*)[A-Z0-9]+', lambda m: m.group(1)+nj, new)

        if email:
            new = new.replace("hammerbrickhome@gmail.com", email)

        phone_digits = re.sub(r"\D", "", str(b.get("phone") or ""))
        if len(phone_digits) == 10:
            formatted_phone = f"{phone_digits[:3]}-{phone_digits[3:6]}-{phone_digits[6:]}"
            compact_phone = "+1" + phone_digits
            international_phone = f"+1-{formatted_phone}"

            new = new.replace("929-595-5300", formatted_phone)
            new = new.replace("+1-929-595-5300", international_phone)
            new = new.replace("+19295955300", compact_phone)
            new = re.sub(r'(href=["\']tel:)[^"\']+(["\'])', lambda m: m.group(1)+compact_phone+m.group(2), new)
            new = re.sub(r'(href=["\']sms:)[^"\']+(["\'])', lambda m: m.group(1)+compact_phone+m.group(2), new)
            new = re.sub(r'("telephone"\s*:\s*")[^"]+(")', lambda m: m.group(1)+international_phone+m.group(2), new)

        if p.suffix.lower() == ".html":
            new = re.sub(r'/script\.js(?:\?v=\d+)?', '/script.js?v=4', new)
            new = re.sub(r'/style\.css(?:\?v=\d+)?', '/style.css?v=4', new)
            new = re.sub(r'/chat\.js(?:\?v=\d+)?', '/chat.js?v=4', new)
            new = re.sub(r'/estimator-advanced\.js(?:\?v=\d+)?', '/estimator-advanced.js?v=4', new)

        if p.name == "header.html":
            if ga: new = new.replace("G-XXXXXXXXXX", ga)
            if clarity: new = new.replace("YOUR_CLARITY_ID_HERE", clarity)
        if new != text:
            p.write_text(new, encoding="utf-8")
            print("Business sync:", p.relative_to(ROOT))

def find_object_block(text, marker, key):
    start_search = text.find(marker)
    if start_search < 0: return None
    m = re.compile(r'["\']'+re.escape(key)+r'["\']\s*:\s*\{').search(text, start_search)
    if not m: return None
    brace = text.find("{", m.start())
    depth, in_str, esc = 0, None, False
    for i in range(brace, len(text)):
        c = text[i]
        if in_str:
            if esc: esc = False
            elif c == "\\": esc = True
            elif c == in_str: in_str = None
            continue
        if c in ("'", '"', "`"): in_str = c; continue
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0: return (m.start(), i+1)
    return None

def patch_number(block, field, value):
    if value is None: return block
    pat = re.compile(r'(\b'+re.escape(field)+r'\s*:\s*)(-?\d+(?:\.\d+)?)')
    return pat.sub(lambda m:m.group(1)+str(value), block, count=1)

def patch_map(text, marker, values):
    start = text.find(marker)
    if start < 0: return text
    end = text.find("};", start)
    if end < 0: return text
    block = text[start:end+2]
    new = block
    for key,value in values.items():
        pat = re.compile(r'(["\']'+re.escape(str(key))+r'["\']\s*:\s*)(-?\d+(?:\.\d+)?)')
        new = pat.sub(lambda m:m.group(1)+str(value), new)
    return text[:start]+new+text[end+2:]

def sync_estimator():
    cfg = load("estimator.json", {})
    p = ROOT/"estimator-advanced.js"
    if not p.exists():
        print("Estimator file not present; skipped."); return
    text = p.read_text(encoding="utf-8", errors="replace")
    new = text
    for svc in cfg.get("services", []):
        key = str(svc.get("key") or "")
        loc = find_object_block(new, "const SERVICE_CONFIG", key)
        if not loc:
            print("Estimator service not found:",key); continue
        a,b = loc
        block = new[a:b]
        if svc.get("mode") == "area":
            for field in ("minArea","maxArea","perSqLow","perSqHigh","minLow","minHigh"):
                block = patch_number(block, field, svc.get(field))
        elif svc.get("mode") == "scope":
            for scope in svc.get("scopes", []):
                sloc = find_object_block(block, "scopes", str(scope.get("key") or ""))
                if not sloc: continue
                sa,sb = sloc
                sbk = block[sa:sb]
                sbk = patch_number(sbk, "low", scope.get("low"))
                sbk = patch_number(sbk, "high", scope.get("high"))
                block = block[:sa]+sbk+block[sb:]
        new = new[:a]+block+new[b:]
    new = patch_map(new, "const BOROUGH_FACTOR", cfg.get("boroughFactors", {}))
    new = patch_map(new, "const BUILDING_FACTOR", cfg.get("buildingFactors", {}))
    new = patch_map(new, "const FINISH_FACTOR", cfg.get("finishFactors", {}))
    new = patch_map(new, "const URGENCY_FACTOR", cfg.get("urgencyFactors", {}))
    save_if_changed(p,new)

def sync_chat():
    cfg = load("chat.json", {})
    business = load("business.json", {})
    est = load("estimator.json", {})
    p = ROOT/"chat.js"
    if not p.exists():
        print("Chat file not present; skipped."); return
    text = p.read_text(encoding="utf-8", errors="replace")
    new = text
    phone = re.sub(r"\D","",str(business.get("phone") or ""))
    if phone:
        new = re.sub(r'const PHONE_NUMBER\s*=\s*"[^"]*";',f'const PHONE_NUMBER = "{phone}";',new,count=1)
    title = str(cfg.get("headerTitle") or "Hammer Brick & Home")
    subtitle = str(cfg.get("headerSubtitle") or f'NYC Licensed #{business.get("nycHic","")}')
    fab = str(cfg.get("fabLabel") or "Instant Estimate")
    share = str(cfg.get("shareButtonText") or "📢 Share This Estimate Tool")
    start_text = str(cfg.get("startButtonText") or "✅ I Understand – Start Estimate")
    new = re.sub(r'(<span class="hb-fab-text">).*?(</span>)',lambda m:m.group(1)+fab+m.group(2),new,count=1)
    new = re.sub(r'(<h3>).*?(</h3>)',lambda m:m.group(1)+title+m.group(2),new,count=1)
    new = re.sub(r'(<span style="color:#e7bf63; font-size:11px; letter-spacing:0.5px;">).*?(</span>)',lambda m:m.group(1)+subtitle+m.group(2),new,count=1)
    new = re.sub(r'shareBtn\.textContent\s*=\s*"[^"]*";','shareBtn.textContent = '+json.dumps(share,ensure_ascii=False)+';',new,count=1)
    new = re.sub(r'(\{\s*label:\s*")[^"]+(",\s*key:\s*"agree"\s*\})',lambda m:m.group(1)+start_text+m.group(2),new,count=1)

    mapping={"Manhattan":"manhattan","Brooklyn":"brooklyn","Queens":"queens","Bronx":"bronx","Staten Island":"staten-island","New Jersey":"nj"}
    for display,key in mapping.items():
        if key in est.get("boroughFactors",{}):
            new = re.sub(r'("'+re.escape(display)+r'"\s*:\s*)(-?\d+(?:\.\d+)?)',lambda m:m.group(1)+str(est["boroughFactors"][key]),new,count=1)

    market = str(cfg.get("disclaimerMarketText") or "")
    competitive = str(cfg.get("disclaimerCompetitiveText") or "")
    final = str(cfg.get("disclaimerFinalText") or "")
    if market or competitive or final:
        replacement = f'''const disclaimerText = `
        📝 **{cfg.get("disclaimerTitle","Just so you know:")}** {market}

        🚀 **Good News:** {competitive}

        ({final})
    `;'''
        new = re.sub(r'const disclaimerText\s*=\s*`[\s\S]*?`;',replacement,new,count=1)
    save_if_changed(p,new)

def main():
    sync_business()
    sync_estimator()
    sync_chat()
    print("Admin settings sync complete.")

if __name__ == "__main__":
    main()
