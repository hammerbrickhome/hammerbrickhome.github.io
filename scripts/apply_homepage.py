#!/usr/bin/env python3
from pathlib import Path
import json, re, html

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
DATA = ROOT / "site-data"

def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))

def esc(v):
    return html.escape(str(v or ""), quote=True)

def replace_once(text, pattern, replacement, label):
    new, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Safety stop: could not uniquely find " + label + ". No homepage changes were written.")
    return new

def render_specials(data):
    cards = []
    for item in data.get("specials", []):
        if item.get("active") is False:
            continue
        accent = esc(item.get("accentColor") or "#e7bf63")
        features = "".join("<li>" + esc(x) + "</li>" for x in item.get("features", []))
        addons = "".join(
            '<li><span>' + esc(x.get("name")) + '</span> <span class="addon-price">' + esc(x.get("price")) + '</span></li>'
            for x in item.get("addons", [])
        )
        card = (
            '<div class="special-card" style="border-top:4px solid ' + accent + ';">'
            '<div class="special-tag" style="background:' + accent + ';">' + esc(item.get("badge")) + '</div>'
            '<h3>' + esc(item.get("title")) + '</h3>'
            '<div class="special-price">' + esc(item.get("price")) + '</div>'
            '<p class="special-desc">' + esc(item.get("description")) + '</p>'
            '<ul class="bullets">' + features + '</ul>'
            '<div class="special-addons"><h4>Popular Add-Ons</h4><ul class="addon-list">' + addons + '</ul></div>'
            '<div class="special-protection"><strong>Client Requirements:</strong> ' + esc(item.get("requirements")) + '</div>'
            '<button type="button" class="btn contact-panel-toggle">' + esc(item.get("buttonText") or "Contact Us") + '</button>'
            '</div>'
        )
        cards.append(card)

    return (
        '<section class="section fade-up">'
        '<div style="text-align:center; max-width:700px; margin:0 auto 25px;">'
        '<h2>' + esc(data.get("heading")) + '</h2>'
        '<p style="color:var(--muted); font-size:14px;">' + esc(data.get("subheading")) + '</p>'
        '</div>'
        '<div class="specials-grid">' + "".join(cards) + '</div>'
        '<p class="fine-print" style="text-align:center; margin-top:20px;">' + esc(data.get("finePrint")) + '</p>'
        '</section>'
    )

def render_reviews(home, data):
    active = [x for x in data.get("reviews", []) if x.get("active") is not False]
    slides, dots = [], []

    for i, item in enumerate(active):
        try:
            rating = max(1, min(5, int(item.get("rating") or 5)))
        except Exception:
            rating = 5

        slides.append(
            '<div class="review-slide">'
            '<p class="review-score">' + ("⭐" * rating) + ' <span class="verified-badge">' + esc(item.get("source") or "Google Review") + '</span></p>'
            '<p class="review-quote">“' + esc(item.get("review")) + '”</p>'
            '<p class="review-note">— ' + esc(item.get("name")) + '</p>'
            '<p class="review-service">' + esc(item.get("service")) + '</p>'
            '</div>'
        )
        dots.append(
            '<button class="review-dot' + (' active' if i == 0 else '') + '" data-index="' + str(i) + '" aria-label="Review ' + str(i + 1) + '"></button>'
        )

    return (
        '<section class="section section-reviews-highlight fade-up" id="google-reviews">'
        '<div style="text-align:center; max-width:760px; margin:0 auto 25px;">'
        '<p style="color:var(--gold);text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:800;margin-bottom:8px;">' + esc(home.get("reviewEyebrow")) + '</p>'
        '<h2 style="margin-bottom:8px;">' + esc(home.get("reviewHeading")) + '</h2>'
        '<p style="color:var(--muted);font-size:13px;">' + esc(home.get("reviewIntro")) + '</p>'
        '</div>'
        '<div class="review-carousel-container">'
        '<div class="review-track" id="reviewTrack">' + "".join(slides) + '</div>'
        '<div class="review-nav" id="reviewNav">' + "".join(dots) + '</div>'
        '<div style="text-align:center; margin-top:22px;">'
        '<a href="' + esc(data.get("reviewUrl")) + '" target="_blank" rel="noopener" class="btn ghost">' + esc(home.get("reviewButtonText")) + '</a>'
        '</div></div></section>'
    )

def render_faq(home, data):
    items = []
    for item in data.get("items", []):
        if item.get("active") is False:
            continue
        items.append(
            '<details><summary>' + esc(item.get("question")) + '</summary><p>' + esc(item.get("answer")) + '</p></details>'
        )

    return (
        '<section class="section faq-section fade-up">'
        '<h2 class="faq-title shimmer-gold">' + esc(home.get("faqHeading") or "Common Questions") + '</h2>'
        + "".join(items) +
        '</section>'
    )

def main():
    original = INDEX.read_text(encoding="utf-8")
    text = original

    home = load("homepage.json")
    specials = load("specials.json")
    reviews = load("reviews.json")
    faqs = load("faqs.json")

    required = [
        "Luxury Residential & Commercial Remodeling in NYC",
        "Monthly Service Specials",
        'id="google-reviews"',
        "Common Questions",
        "gallery.json"
    ]
    missing = [x for x in required if x not in text]
    if missing:
        raise RuntimeError("Safety stop: current working homepage structure changed: " + ", ".join(missing))

    text = replace_once(
        text,
        r'(<section class="hero hero-home fade-up"[^>]*>.*?<div class="hero-content hero-glass">\s*<h1>).*?(</h1>\s*<p>).*?(</p>)',
        lambda m: m.group(1) + esc(home.get("heroTitle")) + m.group(2) + esc(home.get("heroText")) + m.group(3),
        "homepage hero"
    )

    mats = "".join(
        '<span style="font-weight:900; font-size:18px; color:#fff;">' + esc(x) + '</span>'
        for x in home.get("premiumMaterials", [])
    )
    text = replace_once(
        text,
        r'(<p[^>]*>We Use Premium Materials</p>\s*<div[^>]*>).*?(</div>)',
        lambda m: m.group(1) + mats + m.group(2),
        "premium materials"
    )

    text = replace_once(
        text,
        r'<section class="section fade-up">\s*<div[^>]*>\s*<h2>Monthly Service Specials</h2>.*?</section>',
        render_specials(specials),
        "monthly specials"
    )

    text = replace_once(
        text,
        r'<section class="section section-reviews-highlight fade-up" id="google-reviews">.*?</section>',
        render_reviews(home, reviews),
        "review section"
    )

    text = replace_once(
        text,
        r'(<h2 style="margin-bottom:10px; text-align:left;">)Serving Our Neighbors(</h2>\s*<p style="color:var\(--muted\); margin-bottom:20px;">).*?(</p>)',
        lambda m: m.group(1) + esc(home.get("serviceAreaHeading")) + m.group(2) + esc(home.get("serviceAreaIntro")) + m.group(3),
        "service area"
    )

    text = replace_once(
        text,
        r'<section class="section faq-section fade-up">.*?</section>',
        render_faq(home, faqs),
        "FAQ section"
    )

    # Write once, only after all safety checks/replacements succeeded.
    INDEX.write_text(text, encoding="utf-8")
    print("Homepage content applied safely.")

if __name__ == "__main__":
    main()
