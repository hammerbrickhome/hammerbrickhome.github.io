#!/usr/bin/env python3
from pathlib import Path
import json, re
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/"admin-tools/full-site-audit.json"

def load(path,default=None):
    try:return json.loads(path.read_text(encoding="utf-8"))
    except Exception:return default if default is not None else {}

business=load(ROOT/"site-data/business.json",{})
settings=load(ROOT/"site-data/health-settings.json",{})
hic=str(business.get("nycHic") or "")
ignore_services=bool(settings.get("ignoreHiddenServiceLinks",True))
large_mb=float(settings.get("largeImageWarningMB",1.5))
checks=[]

def add(name,status,details,items=None):
    checks.append({"name":name,"status":status,"details":details,"items":items or []})

required=[".pages.yml","site-data/business.json","site-data/homepage.json","site-data/navigation.json","site-data/estimator.json","site-data/chat.json","scripts/build_managed_content.py","scripts/sync_admin_settings.py",".github/workflows/hammer-managed-content-build.yml",".github/workflows/hammer-admin-sync.yml"]
missing=[x for x in required if not (ROOT/x).exists()]
add("Admin V4 files","PASS" if not missing else "FAIL","All core V4 admin files are present." if not missing else "Missing required V4 files.",missing)

bad=[]
for p in list((ROOT/"site-data").glob("*.json"))+list((ROOT/"content").glob("*/*.json")):
    try:json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:bad.append(f"{p.relative_to(ROOT)}: {e}")
add("CMS JSON","PASS" if not bad else "FAIL","CMS JSON files are valid." if not bad else "Some CMS JSON is invalid.",bad)

mismatches=[]
if hic:
    for p in list(ROOT.glob("*.html"))+list(ROOT.glob("*.js")):
        text=p.read_text(encoding="utf-8",errors="ignore")
        for m in re.finditer(r'(?i)HIC\s*#\s*(\d{7,8})',text):
            if m.group(1)!=hic:mismatches.append(f"{p.name}: {m.group(0)}")
        if "21311291" in text and hic!="21311291":mismatches.append(f"{p.name}: contains old license 21311291")
add("NYC HIC consistency","PASS" if not mismatches else "FAIL","NYC HIC wording is consistent." if not mismatches else "Found license-number drift.",sorted(set(mismatches))[:50])

placeholders=[]
header=ROOT/"header.html"
if header.exists():
    t=header.read_text(encoding="utf-8",errors="ignore")
    if "G-XXXXXXXXXX" in t:placeholders.append("Google Analytics placeholder G-XXXXXXXXXX")
    if "YOUR_CLARITY_ID_HERE" in t:placeholders.append("Microsoft Clarity placeholder YOUR_CLARITY_ID_HERE")
add("Analytics setup","PASS" if not placeholders else "WARN","No analytics placeholders found." if not placeholders else "Analytics placeholders are still present.",placeholders)

# Marketing claims that deserve periodic manual verification.
# This does NOT say a claim is wrong; it reminds the owner to confirm that
# public offers/financing/rewards still match the real current program.
claim_patterns = [
    ("0% Financing", r"0%\s+Financing"),
    ("Monthly draw / giveaway", r"monthly\s+draw"),
    ("Win a free service", r"win\s+one\s+service|service\s+free"),
    ("VIP discount", r"VIP\s+Members?\s+get\s+10%"),
    ("$250 value claim", r"\$250\s+Value")
]
claim_items = []
for fp in list(ROOT.glob("*.html")) + list(ROOT.glob("*.js")):
    content = fp.read_text(encoding="utf-8", errors="ignore")
    for label, pattern in claim_patterns:
        if re.search(pattern, content, re.I):
            claim_items.append(f"{fp.name}: {label}")
add(
    "Marketing claims review",
    "PASS" if not claim_items else "WARN",
    "No watched promotional claims found." if not claim_items else "Review these public promotional claims periodically to make sure the offer/provider/terms are still accurate.",
    sorted(set(claim_items))
)

clutter=[]
for rel in ["pages.yml",".DS_Store"]:
    if (ROOT/rel).exists():clutter.append(rel)
if (ROOT/"workflows").exists():clutter.append("root /workflows folder")
add("Repository housekeeping","PASS" if not clutter else "WARN","No common admin clutter found." if not clutter else "Safe cleanup items were found.",clutter)

html_files=list(ROOT.glob("*.html"))
for folder in ("projects","services","areas","resources"):
    if (ROOT/folder).exists():html_files+=list((ROOT/folder).glob("*.html"))

broken=[];missing_meta=[];missing_canonical=[];missing_alt=[]
href_re=re.compile(r'href=["\']([^"\']+)["\']',re.I)
img_re=re.compile(r'<img\b([^>]*)>',re.I)
for p in html_files:
    text=p.read_text(encoding="utf-8",errors="ignore")
    lower=text.lower()
    if '<meta name="description"' not in lower and p.name!="404.html":missing_meta.append(str(p.relative_to(ROOT)))
    if 'rel="canonical"' not in lower and "rel='canonical'" not in lower and p.name!="404.html":missing_canonical.append(str(p.relative_to(ROOT)))
    for tag in img_re.findall(text):
        if not re.search(r'\balt\s*=',tag,re.I):
            missing_alt.append(str(p.relative_to(ROOT)));break
    for href in href_re.findall(text):
        if href.startswith(("http://","https://","mailto:","tel:","sms:","#","javascript:")):continue
        clean=href.split("#",1)[0].split("?",1)[0]
        if not clean:continue
        if ignore_services and ("service" in clean.lower() or p.name=="services.html"):continue
        rel=clean[1:] if clean.startswith("/") else clean
        if rel.endswith("/"):target=ROOT/rel/"index.html"
        elif "." not in Path(rel).name:
            t1=ROOT/(rel+".html");t2=ROOT/rel/"index.html"
            if t1.exists() or t2.exists():continue
            target=t1
        else:target=ROOT/rel
        if not target.exists():broken.append(f"{p.relative_to(ROOT)} → {href}")

add("Internal links","PASS" if not broken else "WARN","No checked internal broken links found." if not broken else "Some internal links do not resolve. Hidden Services links are ignored when that setting is ON.",sorted(set(broken))[:100])
add("Meta descriptions","PASS" if not missing_meta else "WARN","All checked pages have meta descriptions." if not missing_meta else "Some pages are missing meta descriptions.",missing_meta[:100])
add("Canonical URLs","PASS" if not missing_canonical else "WARN","All checked pages have canonical URLs." if not missing_canonical else "Some pages are missing canonical URLs.",missing_canonical[:100])
add("Image alt text","PASS" if not missing_alt else "WARN","All checked image tags have alt text." if not missing_alt else "Some pages contain images without alt text.",missing_alt[:100])

large=[]
img_dir=ROOT/"images"
if img_dir.exists():
    for p in img_dir.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".jpg",".jpeg",".png",".webp"}:
            mb=p.stat().st_size/(1024*1024)
            if mb>=large_mb:large.append(f"{p.relative_to(ROOT)} — {mb:.2f} MB")
add("Large images","PASS" if not large else "WARN",f"No images at or above {large_mb:.1f} MB." if not large else f"Images at or above {large_mb:.1f} MB may be worth optimizing.",large[:100])

sm=[]
sitemap=ROOT/"sitemap.xml"
if not sitemap.exists():sm.append("sitemap.xml is missing")
else:
    txt=sitemap.read_text(encoding="utf-8",errors="ignore")
    if "2025-12-04" in txt:sm.append("sitemap.xml still contains the old 2025-12-04 lastmod date")
add("Sitemap","PASS" if not sm else "WARN","Sitemap is present without the known stale date." if not sm else "Sitemap needs a managed rebuild.",sm)

fail=sum(x["status"]=="FAIL" for x in checks);warn=sum(x["status"]=="WARN" for x in checks)
overall="GOOD" if fail==0 and warn==0 else ("ATTENTION" if fail==0 else "ACTION NEEDED")
report={"generatedAt":datetime.now(timezone.utc).isoformat(),"status":overall,"summary":f"{fail} failed check(s), {warn} warning(s).","checks":checks}
REPORT.parent.mkdir(parents=True,exist_ok=True)
REPORT.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
print(overall,report["summary"])
