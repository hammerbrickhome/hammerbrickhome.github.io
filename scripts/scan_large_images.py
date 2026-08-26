#!/usr/bin/env python3
from pathlib import Path
import json
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
settings={}
try:settings=json.loads((ROOT/"site-data/health-settings.json").read_text())
except:pass
limit=float(settings.get("largeImageWarningMB",1.5))
files=[]
img=ROOT/"images"
if img.exists():
    for p in img.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".jpg",".jpeg",".png",".webp"}:
            mb=p.stat().st_size/(1024*1024)
            if mb>=limit:files.append({"image":"/"+str(p.relative_to(ROOT)).replace("\\","/"),"size":f"{mb:.2f} MB","reviewed":False})
report={"generatedAt":datetime.now(timezone.utc).isoformat(),"threshold":f"{limit:.1f} MB","count":len(files),"note":"Report only. No image is changed or deleted by this scan.","files":files}
out=ROOT/"admin-tools/large-images-report.json";out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+"\n")
print("Large images found:",len(files))
