#!/usr/bin/env python3
from pathlib import Path
import json, html, re
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site-data"
CONTENT = ROOT / "content"

def load_json(path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default

BUSINESS = load_json(SITE / "business.json", {}) or {}
SEO = load_json(SITE / "seo.json", {}) or {}
BASE_URL = str(SEO.get("siteUrl") or "https://www.hammerbrickhome.com").rstrip("/")
SITE_NAME = str(SEO.get("siteName") or BUSINESS.get("businessName") or "Hammer Brick & Home LLC")
DEFAULT_IMAGE = str(SEO.get("defaultImage") or "/images/hero.PNG")
MANIFEST = SITE / "generated-pages-manifest.json"

def esc(v):
    return html.escape(str(v or ""), quote=True)

def slugify(value):
    s = re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")
    return s or "page"

def inline_md(text):
    s = esc(text)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    return s

def markdown_basic(text):
    text = str(text or "").replace("\r\n", "\n")
    out, in_ul = [], False
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            if in_ul:
                out.append("</ul>"); in_ul = False
            continue
        if line.startswith("### "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h3>{esc(line[4:])}</h3>")
        elif line.startswith("## "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h2>{esc(line[3:])}</h2>")
        elif line.startswith("# "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h2>{esc(line[2:])}</h2>")
        elif line.startswith("- "):
            if not in_ul:
                out.append('<ul class="bullets">'); in_ul = True
            out.append(f"<li>{inline_md(line[2:])}</li>")
        else:
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<p>{inline_md(line)}</p>")
    if in_ul: out.append("</ul>")
    return "\n".join(out)

def page_shell(title, description, canonical, body, noindex=False, image=None, schema_type="WebPage"):
    image = image or DEFAULT_IMAGE
    robots = '<meta name="robots" content="noindex,nofollow">' if noindex else ""
    schema = {
        "@context":"https://schema.org",
        "@type":schema_type,
        "name":title,
        "url":canonical,
        "description":description
    }
    if image:
        schema["image"] = BASE_URL + image if str(image).startswith("/") else image
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} | {esc(SITE_NAME)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(canonical)}">
<link rel="icon" href="/images/hero.PNG">
<link rel="stylesheet" href="/style.css?v=4">
{robots}
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
<style>
.managed-hero{{max-width:900px;margin:38px auto 26px;padding:30px;border:1px solid rgba(231,191,99,.3);border-radius:24px;background:radial-gradient(circle at top,rgba(231,191,99,.08),transparent 60%),rgba(7,14,26,.88);box-shadow:0 20px 50px rgba(0,0,0,.35)}}
.managed-eyebrow{{font-size:10px;color:#e7bf63;letter-spacing:.2em;font-weight:900;text-transform:uppercase;margin-bottom:9px}}
.managed-body{{max-width:900px;margin:0 auto 70px}}
.managed-body h2{{margin-top:28px}}
.managed-body p{{color:rgba(255,255,255,.82);line-height:1.75;margin:10px 0}}
.managed-body .lead{{font-size:17px;color:#fff}}
.managed-media{{width:100%;max-height:520px;object-fit:cover;border-radius:20px;border:1px solid rgba(231,191,99,.25);margin:18px 0}}
.managed-cta{{margin-top:30px;padding:18px;border:1px solid rgba(231,191,99,.28);border-radius:18px;background:rgba(231,191,99,.05)}}
.managed-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}}
.managed-card{{padding:18px;border-radius:18px;border:1px solid rgba(231,191,99,.22);background:rgba(7,14,26,.9)}}
.managed-card a{{color:#f5d89b}}
.project-compare{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}}
.project-compare figure{{margin:0}}
.project-compare img{{width:100%;height:360px;object-fit:cover;border-radius:18px}}
.project-compare figcaption{{font-size:11px;color:rgba(255,255,255,.65);margin-top:6px;text-align:center}}
@media(max-width:720px){{.project-compare{{grid-template-columns:1fr}}.project-compare img{{height:280px}}}}
</style>
</head>
<body>
<div id="header-include"></div>
<main class="page content-wrapper">
{body}
</main>
<div id="footer-include"></div>
<link rel="stylesheet" href="/chat.css">
<script defer src="/chat.js?v=2"></script>
<script defer src="/script.js?v=4"></script>
</body>
</html>'''

def read_collection(name):
    folder = CONTENT / name
    items = []
    if not folder.exists(): return items
    for p in sorted(folder.glob("*.json")):
        if p.name.startswith("_"): continue
        data = load_json(p)
        if isinstance(data, dict):
            data["_source"] = p.name
            items.append(data)
    return items

def published(items):
    return [x for x in items if x.get("published") is True]

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")

def build_projects():
    items = published(read_collection("projects"))
    index_data, cards = [], []
    for item in items:
        slug = slugify(item.get("slug") or item.get("title"))
        title = str(item.get("title") or "Project")
        desc = str(item.get("seoDescription") or item.get("summary") or "")
        before = str(item.get("beforeImage") or "")
        after = str(item.get("afterImage") or "")
        url = f"/projects/{slug}.html"
        index_data.append({
            "title":title,"slug":slug,"url":url,"summary":item.get("summary",""),
            "service":item.get("service",""),"location":item.get("location",""),
            "featured":bool(item.get("featured")),"beforeImage":before,"afterImage":after
        })
        media = ""
        if before and after:
            media = f'''<div class="project-compare">
<figure><img src="{esc(before)}" alt="Before — {esc(title)}"><figcaption>Before</figcaption></figure>
<figure><img src="{esc(after)}" alt="After — {esc(title)}"><figcaption>After</figcaption></figure>
</div>'''
        extra = "".join(
            f'<img class="managed-media" loading="lazy" src="{esc(x)}" alt="{esc(title)} project photo">'
            for x in (item.get("additionalImages") or []) if x
        )
        materials = item.get("materials") or []
        materials_html = ""
        if materials:
            materials_html = "<h2>Materials / Systems</h2><ul class='bullets'>" + "".join(f"<li>{esc(x)}</li>" for x in materials) + "</ul>"
        body = f'''<section class="managed-hero">
<p class="managed-eyebrow">{esc(item.get("service") or "PROJECT STORY")}</p>
<h1>{esc(title)}</h1>
<p class="lead">{esc(item.get("summary"))}</p>
<p>{esc(item.get("location"))}{(" · " + esc(item.get("neighborhood"))) if item.get("neighborhood") else ""}</p>
</section>
<section class="managed-body">
{media}
<h2>The Problem</h2><p>{esc(item.get("problem"))}</p>
<h2>What We Did</h2><p>{esc(item.get("solution"))}</p>
{materials_html}
{("<h2>Timeline</h2><p>"+esc(item.get("timeline"))+"</p>") if item.get("timeline") else ""}
{("<h2>Permit / Building Note</h2><p>"+esc(item.get("permitNote"))+"</p>") if item.get("permitNote") else ""}
{("<h2>Lead-Safe Note</h2><p>"+esc(item.get("leadSafeNote"))+"</p>") if item.get("leadSafeNote") else ""}
{extra}
{("<blockquote class='managed-cta'>“"+esc(item.get("testimonial"))+"”</blockquote>") if item.get("testimonial") else ""}
<div class="managed-cta"><strong>Have a similar project?</strong><p>Send photos or request a free walkthrough so we can review your exact conditions.</p><a class="btn" href="/contact.html">Request Estimate</a></div>
</section>'''
        write(ROOT/"projects"/f"{slug}.html", page_shell(item.get("seoTitle") or title, desc, BASE_URL+url, body, image=after or before, schema_type="Article"))
        cards.append(f'''<article class="managed-card"><h2>{esc(title)}</h2><p>{esc(item.get("service"))} · {esc(item.get("location"))}</p><p>{esc(item.get("summary"))}</p><a href="{url}">View project →</a></article>''')
    idx = f'''<section class="managed-hero"><p class="managed-eyebrow">REAL WORK</p><h1>Project Stories</h1><p class="lead">Before-and-after work with more context about the problem, scope and finished result.</p></section><section class="managed-body"><div class="managed-grid">{''.join(cards) if cards else '<p>Project stories are being prepared.</p>'}</div></section>'''
    write(ROOT/"projects/index.html", page_shell("Project Stories","Real project stories from Hammer Brick & Home.",BASE_URL+"/projects/",idx))
    write(SITE/"project-index.json", json.dumps(index_data, indent=2, ensure_ascii=False)+"\n")

def build_standard_collection(name, outdir, index_title, eyebrow, schema_type):
    items = published(read_collection(name))
    index_data, cards = [], []
    for item in items:
        slug = slugify(item.get("slug") or item.get("title"))
        title = str(item.get("title") or "Page")
        desc = str(item.get("seoDescription") or item.get("summary") or item.get("intro") or "")
        url = f"/{outdir}/{slug}.html"
        hero = str(item.get("heroImage") or "")
        summary = item.get("summary") or item.get("intro") or ""
        if name == "services":
            body_html = ""
            included = item.get("servicesIncluded") or []
            process = item.get("process") or []
            if included:
                body_html += "<h2>Common Scope Items</h2><ul class='bullets'>" + "".join(f"<li>{esc(x)}</li>" for x in included) + "</ul>"
            if process:
                body_html += "<h2>Typical Project Flow</h2><ol>" + "".join(f"<li>{esc(x)}</li>" for x in process) + "</ol>"
            if item.get("whyChooseUs"):
                body_html += "<h2>Our Approach</h2><p>"+esc(item.get("whyChooseUs"))+"</p>"
        elif name == "areas":
            body_html = ""
            neighborhoods = item.get("neighborhoods") or []
            services = item.get("featuredServices") or []
            if neighborhoods:
                body_html += "<h2>Areas We Commonly Discuss</h2><p>"+", ".join(esc(x) for x in neighborhoods)+"</p>"
            if services:
                body_html += "<h2>Popular Project Types</h2><ul class='bullets'>" + "".join(f"<li>{esc(x)}</li>" for x in services) + "</ul>"
            if item.get("localNotes"):
                body_html += "<h2>Local Planning Notes</h2><p>"+esc(item.get("localNotes"))+"</p>"
        else:
            body_html = markdown_basic(item.get("body") or "")
        hero_html = f'<img class="managed-media" src="{esc(hero)}" alt="{esc(title)}">' if hero else ""
        cta = item.get("cta") or "Contact us to discuss your project."
        body = f'''<section class="managed-hero"><p class="managed-eyebrow">{esc(eyebrow)}</p><h1>{esc(title)}</h1><p class="lead">{esc(summary)}</p></section><section class="managed-body">{hero_html}{body_html}<div class="managed-cta"><p>{esc(cta)}</p><a class="btn" href="/contact.html">Request Estimate</a></div></section>'''
        write(ROOT/outdir/f"{slug}.html", page_shell(item.get("seoTitle") or title, desc, BASE_URL+url, body, image=hero or DEFAULT_IMAGE, schema_type=schema_type))
        index_data.append({"title":title,"slug":slug,"url":url,"summary":summary,"featured":bool(item.get("featured"))})
        cards.append(f'<article class="managed-card"><h2>{esc(title)}</h2><p>{esc(summary)}</p><a href="{url}">Learn more →</a></article>')
    idx = f'''<section class="managed-hero"><p class="managed-eyebrow">{esc(eyebrow)}</p><h1>{esc(index_title)}</h1></section><section class="managed-body"><div class="managed-grid">{''.join(cards) if cards else '<p>Content is being prepared.</p>'}</div></section>'''
    write(ROOT/outdir/"index.html", page_shell(index_title,f"{index_title} from {SITE_NAME}.",BASE_URL+f"/{outdir}/",idx))
    index_name = {"services":"service-index.json","areas":"area-index.json","resources":"resource-index.json"}[name]
    write(SITE/index_name, json.dumps(index_data, indent=2, ensure_ascii=False)+"\n")

def build_fixed_pages():
    items = published(read_collection("pages"))
    index_data = []
    for item in items:
        slug = slugify(item.get("slug") or item.get("title"))
        title = str(item.get("title") or "Page")
        desc = str(item.get("seoDescription") or item.get("summary") or "")
        body = f'''<section class="managed-hero"><p class="managed-eyebrow">{esc(item.get("eyebrow") or "HAMMER BRICK & HOME")}</p><h1>{esc(title)}</h1><p class="lead">{esc(item.get("summary"))}</p></section><section class="managed-body">{markdown_basic(item.get("body"))}<div class="managed-cta"><a class="btn" href="/contact.html">Contact Hammer Brick & Home</a></div></section>'''
        write(ROOT/f"{slug}.html", page_shell(item.get("seoTitle") or title, desc, BASE_URL+f"/{slug}.html", body, noindex=bool(item.get("noindex"))))
        index_data.append({"title":title,"slug":slug,"url":f"/{slug}.html","noindex":bool(item.get("noindex"))})
    write(SITE/"page-index.json", json.dumps(index_data, indent=2, ensure_ascii=False)+"\n")

def build_404():
    body = '''<section class="managed-hero"><p class="managed-eyebrow">PAGE NOT FOUND</p><h1>We couldn’t find that page.</h1><p class="lead">The link may be old or the page may have moved.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn" href="/">Go Home</a><a class="btn ghost" href="/contact.html">Contact Us</a><a class="btn ghost" href="/gallery.html">View Portfolio</a></div></section>'''
    write(ROOT/"404.html", page_shell("Page Not Found","The requested page could not be found.",BASE_URL+"/404.html",body,noindex=True))

def build_sitemap():
    if SEO.get("generateManagedSitemap") is False: return
    urls = set()
    for p in ROOT.glob("*.html"):
        if p.name.startswith("_") or p.name in {"404.html","thank-you.html"}: continue
        rel = "/" if p.name=="index.html" else "/"+p.name
        urls.add(BASE_URL+rel)
    for folder in ("projects","services","areas","resources"):
        for p in (ROOT/folder).glob("*.html"):
            rel = f"/{folder}/" + ("" if p.name=="index.html" else p.name)
            urls.add(BASE_URL+rel)
    today = datetime.now(timezone.utc).date().isoformat()
    xml = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in sorted(urls):
        priority = "1.00" if u==BASE_URL+"/" else "0.80"
        xml += ["  <url>",f"    <loc>{html.escape(u)}</loc>",f"    <lastmod>{today}</lastmod>",f"    <priority>{priority}</priority>","  </url>"]
    xml.append("</urlset>")
    write(ROOT/"sitemap.xml","\n".join(xml)+"\n")

def expected_generated_paths():
    expected = {
        "projects/index.html",
        "services/index.html",
        "areas/index.html",
        "resources/index.html",
        "404.html"
    }

    for item in published(read_collection("projects")):
        expected.add(f"projects/{slugify(item.get('slug') or item.get('title'))}.html")

    for collection, folder in (("services","services"),("areas","areas"),("resources","resources")):
        for item in published(read_collection(collection)):
            expected.add(f"{folder}/{slugify(item.get('slug') or item.get('title'))}.html")

    for item in published(read_collection("pages")):
        expected.add(f"{slugify(item.get('slug') or item.get('title'))}.html")

    return expected

def cleanup_stale_generated(expected):
    previous = load_json(MANIFEST, []) or []
    if not isinstance(previous, list):
        previous = []

    for rel in previous:
        rel = str(rel or "")
        if not rel or rel in expected or rel == "sitemap.xml":
            continue

        target = ROOT / rel
        try:
            target.relative_to(ROOT)
        except ValueError:
            continue

        if target.is_file():
            target.unlink()
            print("Removed unpublished generated page:", rel)

def save_manifest(expected):
    paths = sorted(set(expected) | {"sitemap.xml"})
    write(MANIFEST, json.dumps(paths, indent=2) + "\n")

def main():
    build_projects()
    build_standard_collection("services","services","Service Guides","SERVICES","Service")
    build_standard_collection("areas","areas","Areas We Serve","LOCAL SERVICE","WebPage")
    build_standard_collection("resources","resources","Homeowner Advice Center","HOMEOWNER RESOURCES","Article")
    build_fixed_pages()
    build_404()

    expected = expected_generated_paths()
    cleanup_stale_generated(expected)

    build_sitemap()
    save_manifest(expected)
    print("Managed content build complete.")

if __name__ == "__main__":
    main()
