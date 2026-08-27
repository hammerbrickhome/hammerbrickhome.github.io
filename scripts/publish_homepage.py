#!/usr/bin/env python3
from pathlib import Path
import json, html

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site-data"
INDEX = ROOT / "index.html"

PHONE_DISPLAY = "929-595-5300"
PHONE_E164 = "+19295955300"
EMAIL = "hammerbrickhome@gmail.com"
NYC_HIC = "2131291"
NJ_HIC = "13VH14026000"
WEBSITE = "https://www.hammerbrickhome.com/"

def load(name):
    return json.loads((SITE / name).read_text(encoding="utf-8"))

def e(v):
    return html.escape(str(v or ""), quote=True)

def a(url, text, cls="hb-btn"):
    return f'<a class="{cls}" href="{e(url)}">{e(text)}</a>'

def section_head(eyebrow, heading, intro):
    out = '<div class="hb-section-head">'
    if eyebrow:
        out += f'<div class="hb-kicker">{e(eyebrow)}</div>'
    out += f'<h2>{e(heading)}</h2>'
    if intro:
        out += f'<p>{e(intro)}</p>'
    out += '</div>'
    return out

def render_home():
    h = load("homepage.json")
    services = load("services.json")
    process = load("process.json")
    tiers = load("tiers.json")
    specials = load("specials.json")
    reviews = load("reviews.json")
    faqs = load("faqs.json")
    parts = []

    parts.append(f'''
<section class="hb-hero" aria-labelledby="home-title">
  <div class="hb-hero-shade"></div>
  <div class="hb-hero-grid">
    <div class="hb-hero-copy">
      <div class="hb-kicker">{e(h.get("heroEyebrow"))}</div>
      <h1 id="home-title">{e(h.get("heroTitle"))}</h1>
      <div class="hb-hero-accent">{e(h.get("heroAccent") or "Across NYC & New Jersey")}</div>
      <p>{e(h.get("heroText"))}</p>
      <div class="hb-hero-actions">
        {a("tel:"+PHONE_E164, "📞 " + str(h.get("heroCallText") or "Call for a Free Estimate"), "hb-btn")}
        {a("sms:"+PHONE_E164, "📱 " + str(h.get("heroTextText") or "Text Photos for a Free Estimate"), "hb-btn hb-btn-ghost")}
        {a(str(h.get("heroWorkUrl") or "#project-proof"), str(h.get("heroWorkText") or "See Our Work"), "hb-text-link")}
      </div>
      <div class="hb-hero-note">{e(h.get("heroNote"))}</div>
    </div>
    <aside class="hb-contact-card" aria-label="Free estimate contact">
      <span class="hb-card-small">FREE ESTIMATE</span>
      <h2>Start With a Call or Photos</h2>
      <p>Tell us the property location, what you want done and your timing.</p>
      <a href="tel:{PHONE_E164}" class="hb-contact-row"><span>Call directly</span><strong>{PHONE_DISPLAY}</strong></a>
      <a href="sms:{PHONE_E164}" class="hb-contact-row"><span>Text project photos</span><strong>Open Messages →</strong></a>
      <div class="hb-card-foot">Staten Island based · NYC + select NJ</div>
    </aside>
  </div>
</section>''')

    if h.get("showTrust", True):
        parts.append(f'''
<section class="hb-trust" aria-label="Licenses and credentials">
  <div><strong>NYC HIC #{NYC_HIC}</strong><span>Licensed contractor</span></div>
  <div><strong>NJ HIC #{NJ_HIC}</strong><span>New Jersey registration</span></div>
  <div><strong>Bonded &amp; Insured</strong><span>Professional protection</span></div>
  <div><strong>EPA Lead-Safe</strong><span>Certified firm</span></div>
</section>''')

    if h.get("showServices", True):
        cards = []
        for item in services.get("items", []):
            if item.get("active") is False:
                continue
            photo = str(item.get("image") or "").strip() or str(item.get("imageUrl") or "").strip()
            if photo and not photo.startswith(("http://","https://","/")):
                photo = "/" + photo
            photo_html = (
                f'<div class="hb-service-photo"><img src="{e(photo)}" alt="{e(item.get("imageAlt") or item.get("title"))}" loading="lazy"></div>'
                if photo else '<div class="hb-service-photo hb-service-photo-empty"></div>'
            )
            cards.append(f'''
<a class="hb-service-card" href="{e(item.get("url") or "/contact.html")}">
  {photo_html}
  <span class="hb-service-icon">{e(item.get("icon"))}</span>
  <div class="hb-service-copy">
    <h3>{e(item.get("title"))}</h3>
    <p>{e(item.get("description"))}</p>
  </div>
</a>''')
        parts.append(f'''
<section class="hb-section" id="services">
  {section_head(h.get("servicesEyebrow"), h.get("servicesHeading"), h.get("servicesIntro"))}
  <div class="hb-service-grid">{"".join(cards)}</div>
  <p class="hb-other-services">{e(services.get("otherServices"))} <a href="sms:{PHONE_E164}">Text us about your project →</a></p>
</section>''')

    if h.get("showMaterials", True):
        brands = "".join(f"<span>{e(x)}</span>" for x in h.get("materials", []))
        parts.append(f'''
<section class="hb-materials" aria-label="Materials and brands">
  <p>{e(h.get("materialsHeading"))}</p>
  <div>{brands}</div>
</section>''')

    if h.get("showProjects", True):
        size = max(1, min(int(h.get("projectPageSize") or 4), 8))
        parts.append(f'''
<section class="hb-section hb-projects" id="project-proof" data-page-size="{size}">
  {section_head(h.get("projectsEyebrow"), h.get("projectsHeading"), h.get("projectsIntro"))}
  <div id="hb-ba-grid" class="hb-ba-grid" aria-live="polite"></div>
  <div class="hb-project-actions">
    <button type="button" class="hb-btn hb-btn-ghost" id="hb-ba-more">Load More Projects</button>
    {a("/gallery.html", str(h.get("galleryButtonText") or "View Full Project Gallery"), "hb-btn")}
  </div>
  <template id="hb-ba-template">
    <article class="hb-ba-card">
      <div class="hb-ba-frame">
        <img class="hb-ba-before" alt="" loading="lazy">
        <div class="hb-ba-after-wrap"><img class="hb-ba-after" alt="" loading="lazy"></div>
        <span class="hb-ba-label hb-ba-label-before">Before</span>
        <span class="hb-ba-label hb-ba-label-after">After</span>
        <input class="hb-ba-slider" type="range" min="0" max="100" value="50" aria-label="Before and after comparison">
      </div>
      <div class="hb-ba-caption"></div>
    </article>
  </template>
</section>''')

    if h.get("showReviews", True):
        slides, dots = [], []
        active_reviews = [r for r in reviews.get("items", []) if r.get("active") is not False]
        for i, r in enumerate(active_reviews):
            try:
                rating = max(1, min(5, int(r.get("rating") or 5)))
            except Exception:
                rating = 5
            slides.append(f'''
<article class="hb-review-slide">
  <div class="hb-stars">{"★"*rating}<span>{e(r.get("source") or "Customer Review")}</span></div>
  <blockquote>“{e(r.get("review"))}”</blockquote>
  <div class="hb-review-person"><strong>{e(r.get("name"))}</strong><span>{e(r.get("service"))}</span></div>
</article>''')
            dots.append(f'<button class="hb-review-dot{" is-active" if i == 0 else ""}" type="button" data-index="{i}" aria-label="Review {i+1}"></button>')
        parts.append(f'''
<section class="hb-section hb-reviews" id="reviews">
  {section_head(h.get("reviewsEyebrow"), h.get("reviewsHeading"), h.get("reviewsIntro"))}
  <div class="hb-review-shell">
    <button type="button" class="hb-review-arrow hb-review-prev" aria-label="Previous review">‹</button>
    <div class="hb-review-window"><div class="hb-review-track" id="hb-review-track">{"".join(slides)}</div></div>
    <button type="button" class="hb-review-arrow hb-review-next" aria-label="Next review">›</button>
  </div>
  <div class="hb-review-dots">{"".join(dots)}</div>
  <div class="hb-center">{a(reviews.get("reviewUrl"), "★ " + str(reviews.get("buttonText") or "Read Our Google Reviews"), "hb-btn hb-btn-ghost")}</div>
</section>''')

    if h.get("showOwner", True):
        bullets = "".join(f"<li>{e(x)}</li>" for x in process.get("ownerBullets", []))
        parts.append(f'''
<section class="hb-section">
  <div class="hb-owner-grid">
    <div class="hb-owner-quote">
      <div class="hb-owner-mark">HB</div>
      <blockquote>“{e(process.get("ownerQuote"))}”</blockquote>
      <p>{e(process.get("ownerByline"))}</p>
    </div>
    <div class="hb-owner-copy">
      <div class="hb-kicker">{e(process.get("ownerEyebrow"))}</div>
      <h2>{e(process.get("ownerHeading"))}</h2>
      <p>{e(process.get("ownerText"))}</p>
      <ul>{bullets}</ul>
      <div class="hb-inline-actions">
        {a("tel:"+PHONE_E164, "Call " + PHONE_DISPLAY, "hb-btn")}
        {a("sms:"+PHONE_E164, "Text Project Photos", "hb-btn hb-btn-ghost")}
        {a("/about.html", "About Hammer Brick & Home", "hb-text-link")}
      </div>
    </div>
  </div>
</section>''')

    if h.get("showProcess", True):
        steps = "".join(
            f'<div class="hb-step"><span>{e(st.get("number"))}</span><h3>{e(st.get("title"))}</h3><p>{e(st.get("text"))}</p></div>'
            for st in process.get("steps", [])
        )
        parts.append(f'''
<section class="hb-section hb-process">
  {section_head(process.get("processEyebrow"), process.get("processHeading"), process.get("processIntro"))}
  <div class="hb-step-grid">{steps}</div>
</section>''')

    if h.get("showTiers", True):
        tier_cards = []
        for t in tiers.get("items", []):
            li = "".join(f"<li>{e(x)}</li>" for x in t.get("features", []))
            tier_cards.append(f'''
<article class="hb-tier-card">
  <div class="hb-tier-top"><h3>{e(t.get("name"))}</h3><span>{e(t.get("badge"))}</span></div>
  <p>{e(t.get("description"))}</p>
  <ul>{li}</ul>
  <div class="hb-best"><strong>Best for:</strong> {e(t.get("bestFor"))}</div>
</article>''')
        parts.append(f'''
<section class="hb-section hb-tiers">
  {section_head(tiers.get("eyebrow"), tiers.get("heading"), tiers.get("intro"))}
  <div class="hb-tier-grid">{"".join(tier_cards)}</div>
  <div class="hb-center hb-tier-actions">
    {a("sms:"+PHONE_E164, str(tiers.get("buttonText") or "Ask About Your Project"), "hb-btn")}
    {a(str(tiers.get("estimatorUrl") or "/project-estimator.html"), str(tiers.get("estimatorText") or "Online estimator"), "hb-text-link")}
  </div>
</section>''')

    if h.get("showSpecials", True):
        special_cards = []
        for s in specials.get("items", []):
            if s.get("active") is False:
                continue
            li = "".join(f"<li>{e(x)}</li>" for x in s.get("features", []))
            special_cards.append(f'''
<article class="hb-special-card">
  <span class="hb-special-badge">{e(s.get("badge"))}</span>
  <h3>{e(s.get("title"))}</h3>
  <div class="hb-special-price">{e(s.get("price"))}</div>
  <p>{e(s.get("description"))}</p>
  <ul>{li}</ul>
  {a("sms:"+PHONE_E164, str(s.get("buttonText") or "Text About This Special"), "hb-btn hb-btn-ghost")}
</article>''')
        parts.append(f'''
<section class="hb-section hb-specials">
  {section_head(specials.get("eyebrow"), specials.get("heading"), specials.get("intro"))}
  <div class="hb-special-grid">{"".join(special_cards)}</div>
  <p class="hb-fineprint">{e(specials.get("finePrint"))}</p>
  <div class="hb-center">{a(str(specials.get("viewAllUrl") or "/monthly-specials.html"), str(specials.get("viewAllText") or "View specials"), "hb-text-link")}</div>
</section>''')

    if h.get("showMembership", True):
        parts.append(f'''
<section class="hb-membership">
  <div><span>FOR EXISTING &amp; FUTURE CUSTOMERS</span><h2>{e(h.get("membershipTitle"))}</h2><p>{e(h.get("membershipText"))}</p></div>
  {a(str(h.get("membershipUrl") or "/membership.html"), str(h.get("membershipButtonText") or "Learn More"), "hb-btn hb-btn-ghost")}
</section>''')

    if h.get("showAreas", True):
        area_links = "".join(f'<a href="{e(x.get("url"))}">{e(x.get("name"))}</a>' for x in h.get("areas", []))
        parts.append(f'''
<section class="hb-section hb-areas">
  {section_head(h.get("areasEyebrow"), h.get("areasHeading"), h.get("areasIntro"))}
  <div class="hb-area-links">{area_links}</div>
  <p class="hb-area-note">Not sure if we cover your location? <a href="sms:{PHONE_E164}">Text us your ZIP code →</a></p>
</section>''')

    if h.get("showFaq", True):
        items = "".join(
            f'<details><summary>{e(q.get("question"))}</summary><p>{e(q.get("answer"))}</p></details>'
            for q in faqs.get("items", []) if q.get("active") is not False
        )
        parts.append(f'''
<section class="hb-section hb-faq">
  {section_head("QUESTIONS", faqs.get("heading") or "Common Questions", "Straight answers before you call.")}
  <div class="hb-faq-list">{items}</div>
</section>''')

    parts.append(f'''
<section class="hb-final-cta">
  <div class="hb-kicker">{e(h.get("finalEyebrow"))}</div>
  <h2>{e(h.get("finalHeading"))}</h2>
  <p>{e(h.get("finalText"))}</p>
  <div class="hb-final-actions">
    {a("tel:"+PHONE_E164, "📞 " + str(h.get("finalCallText") or PHONE_DISPLAY), "hb-btn")}
    {a("sms:"+PHONE_E164, "📱 " + str(h.get("finalTextText") or "Text Project Photos"), "hb-btn hb-btn-ghost")}
  </div>
</section>''')

    return "\n".join(parts)

def render_seo():
    h = load("homepage.json")
    schema = {
        "@context":"https://schema.org",
        "@graph":[
            {"@type":"WebSite","@id":WEBSITE+"#website","url":WEBSITE,"name":"Hammer Brick & Home LLC"},
            {
                "@type":"Organization",
                "@id":WEBSITE+"#organization",
                "name":"Hammer Brick & Home LLC",
                "url":WEBSITE,
                "telephone":PHONE_E164,
                "email":EMAIL,
                "areaServed":["Staten Island","Brooklyn","Queens","Manhattan","The Bronx","New Jersey"],
                "identifier":[
                    {"@type":"PropertyValue","name":"NYC HIC","value":NYC_HIC},
                    {"@type":"PropertyValue","name":"NJ HIC","value":NJ_HIC},
                    {"@type":"PropertyValue","name":"EPA Lead-Safe Certified Firm","value":"Yes"}
                ],
                "sameAs":[
                    "https://www.facebook.com/hammerbrickhome",
                    "https://www.instagram.com/hammerbrickhome",
                    "https://www.youtube.com/@hammerbrickhome"
                ]
            }
        ]
    }
    title = e(h.get("pageTitle"))
    desc = e(h.get("metaDescription"))
    return f'''<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{WEBSITE}">
<meta property="og:image" content="{WEBSITE}images/hero.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{WEBSITE}images/hero.jpg">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'''

def replace_block(text, start, end, content, label):
    if text.count(start) != 1 or text.count(end) != 1:
        raise RuntimeError(f"Safety stop: {label} markers are missing or duplicated. No file written.")
    a_pos = text.index(start) + len(start)
    b_pos = text.index(end)
    if b_pos <= a_pos:
        raise RuntimeError(f"Safety stop: invalid {label} marker order.")
    return text[:a_pos] + "\n" + content.strip() + "\n" + text[b_pos:]

def main():
    text = INDEX.read_text(encoding="utf-8")
    required = [
        '<div id="header-include"></div>',
        '<div id="footer-include"></div>',
        '<!-- HB_SEO_START -->',
        '<!-- HB_SEO_END -->',
        '<!-- HB_HOME_ADMIN_START -->',
        '<!-- HB_HOME_ADMIN_END -->',
        '/chat.js?v=2',
        '/script.js?v=2'
    ]
    missing = [x for x in required if x not in text]
    if missing:
        raise RuntimeError("Safety stop: current homepage is not the Master Front Page template: " + ", ".join(missing))

    seo = render_seo()
    home = render_home()
    updated = replace_block(text, "<!-- HB_SEO_START -->", "<!-- HB_SEO_END -->", seo, "SEO")
    updated = replace_block(updated, "<!-- HB_HOME_ADMIN_START -->", "<!-- HB_HOME_ADMIN_END -->", home, "homepage")

    if "reviewCount" in updated or "Five-Star Reviews" in updated:
        raise RuntimeError("Safety stop: review counter language detected.")

    INDEX.write_text(updated, encoding="utf-8")
    print("Homepage published safely.")

if __name__ == "__main__":
    main()
