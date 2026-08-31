/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */

function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const topbar = document.querySelector('.topbar');

  const updateStickyHeader = () => {
    const currentTopbar = document.querySelector('.topbar');
    if (currentTopbar) currentTopbar.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  if (!window.__hammerHeaderScrollInit) {
    window.__hammerHeaderScrollInit = true;
    window.addEventListener('scroll', updateStickyHeader, { passive: true });
  }
  if (topbar) updateStickyHeader();

  const closeMenu = () => {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.dropdown.show').forEach(item => {
      item.classList.remove('show');
      item.querySelector('.dropbtn')?.setAttribute('aria-expanded', 'false');
    });
  };

  if (navToggle && mainNav && !navToggle.hasAttribute('data-init')) {
    navToggle.setAttribute('data-init', 'true');

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', mainNav.classList.contains('show') ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    mainNav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && !link.classList.contains('dropbtn')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* Dropdowns */
  document.querySelectorAll('.dropbtn').forEach(btn => {
    const dropdown = btn.closest('.dropdown');

    if (dropdown && !btn.hasAttribute('data-init')) {
      btn.setAttribute('data-init', 'true');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.dropdown.show').forEach(item => {
          if (item !== dropdown) {
            item.classList.remove('show');
            item.querySelector('.dropbtn')?.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('show');
        btn.setAttribute('aria-expanded', dropdown.classList.contains('show') ? 'true' : 'false');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/* ============================================================
   SERVICE FILTER
=============================================================== */
window.filterServices = function () {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? "" : "none";
  });
};

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  const img = lightbox.querySelector("img");
  img.src = src;
  lightbox.classList.add("show");
}
document.addEventListener("click", e => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && e.target === lightbox) lightbox.classList.remove("show");
});

/* ============================================================
   GALLERY FILTERING & RENDERING LOGIC
   (Updated to handle filtering and 'Load More' for both sections)
=============================================================== */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let galleryInitialized = false;

// Global state variables for filtering and loading
let allGridPhotos = [];         // Stores the full list of Photo Grid items
let currentFilteredGrid = [];   // Stores the currently filtered list for the grid
let gridIndex = 0;              // Current index for "Load More Grid"

let allComparePairs = [];       // Stores the full list of Before & After pairs
let currentFilteredPairs = [];  // Stores the currently filtered list for B&A
let pairIndex = 0;              // Current index for "Load More B&A"

const PAGE_SIZE = 8;            // Items to load per batch


function makeSkeleton(h) {
  const sk = document.createElement("div");
  sk.className = "skeleton";
  sk.style.height = h + "px";
  return sk;
}

// NOTE: This function is preserved from your original code, but modified slightly.
function galleryImagePath(value) {
  if (!value) return "";
  return value.startsWith("/") ? value : "/images/" + value;
}

function buildCompare(pair) {
  const card = document.createElement("div");
  card.className = "ba-card fade-in";

  const frame = document.createElement("div");
  frame.className = "ba-frame";

  const before = document.createElement("img");
  before.src = galleryImagePath(pair.before);
  before.className = "ba-before";

  const afterWrap = document.createElement("div");
  afterWrap.className = "ba-after-wrap";

  const after = document.createElement("img");
  after.src = galleryImagePath(pair.after);
  after.className = "ba-after";
  afterWrap.appendChild(after);

  const slider = document.createElement("input");
  slider.className = "ba-slider";
  slider.type = "range";
  slider.min = 0;
  slider.max = 100;
  slider.value = 50;

  slider.addEventListener("input", () => {
    afterWrap.style.width = slider.value + "%";
  });

  const caption = document.createElement("div");
  caption.className = "ba-caption";
  caption.textContent = pair.label || "";

  frame.appendChild(before);
  frame.appendChild(afterWrap);
  frame.appendChild(slider);
  card.appendChild(frame);
  card.appendChild(caption);

  return card;
}


/**
 * Renders photos into the gallery grid, supporting loading and filtering.
 */
function renderGallery(photos, append = false) {
  const container = document.getElementById("galleryContainer");
  const loadMoreBtn = document.getElementById("loadMoreGrid");
  if (!container || !loadMoreBtn) return;

  if (!append) container.innerHTML = "";

  const start = append ? gridIndex : 0;
  const end = Math.min(start + PAGE_SIZE, photos.length);
  const slice = photos.slice(start, end);

  slice.forEach(photo => {
    // If galleryGrid is still an array of strings, use 'photo' directly
    // If galleryGrid is an array of objects (recommended), use 'photo.name'
    const imgName = typeof photo === 'string' ? photo : photo.name;
    
    const img = document.createElement("img");
    img.src = galleryImagePath(imgName);
    img.className = "grid-photo fade-in";
    img.addEventListener("click", () => openLightbox(img.src));
    container.appendChild(img);
  });

  gridIndex = end;

  loadMoreBtn.style.display = (gridIndex < photos.length) ? 'inline-block' : 'none';
  loadMoreBtn.textContent = `Load ${Math.min(PAGE_SIZE, photos.length - gridIndex)} More`;
}

/**
 * Renders the Before & After pairs into the compare row, supporting loading and filtering.
 */
function renderComparePairs(pairs, append = false) {
  const container = document.getElementById("compareRow");
  const loadMoreBtn = document.getElementById("loadMoreBA");
  if (!container || !loadMoreBtn) return;

  if (!append) container.innerHTML = "";

  const start = append ? pairIndex : 0;
  const end = Math.min(start + PAGE_SIZE, pairs.length);
  const slice = pairs.slice(start, end);

  slice.forEach(pair => {
    container.appendChild(buildCompare(pair));
  });

  pairIndex = end;

  loadMoreBtn.style.display = (pairIndex < pairs.length) ? 'inline-block' : 'none';
  loadMoreBtn.textContent = `Load ${Math.min(PAGE_SIZE, pairs.length - pairIndex)} More`;
}


/**
 * Filters the entire gallery (Grid and B&A) based on the search input value.
 */
function filterGallery() {
  const searchTerm = (document.getElementById('gallerySearch')?.value || '').trim().toLowerCase();
  
  if (searchTerm === "") {
    // If search is empty, reset to show all photos/pairs
    currentFilteredGrid = allGridPhotos;
    currentFilteredPairs = allComparePairs;
  } else {
    // 1. Filter the PHOTO GRID
    currentFilteredGrid = allGridPhotos.filter(photo => {
      // Check filename if it's a string, or name property if it's an object
      const name = typeof photo === 'string' ? photo : photo.name;
      
      // Check tags if available (assuming object structure is implemented)
      const tags = (typeof photo === 'object' && photo.tags) ? photo.tags.join(' ') : '';
      
      const searchData = (name + " " + tags).toLowerCase();
      return searchData.includes(searchTerm);
    });

    // 2. Filter the COMPARE PAIRS
    currentFilteredPairs = allComparePairs.filter(pair => {
      // Search B&A label and tags (assuming tags property is implemented in JSON)
      const tags = pair.tags ? pair.tags.join(' ') : '';
      const searchData = (pair.label + " " + tags).toLowerCase();
      return searchData.includes(searchTerm);
    });
  }

  // Reset index and render the filtered lists
  gridIndex = 0;
  pairIndex = 0;
  renderGallery(currentFilteredGrid);
  renderComparePairs(currentFilteredPairs);
}


async function loadGalleryPage() {
  if (galleryInitialized) return;
  galleryInitialized = true;

  const galleryContainer = document.getElementById("galleryContainer");
  const compareRow = document.getElementById("compareRow");

  if (!galleryContainer && !compareRow) return;

  try {
    const res = await fetch("/gallery.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    
    // ⭐ UPDATED: Store and set initial data globally
    allGridPhotos = shuffle((data.galleryGrid || []).filter(item => item && item.active !== false));
    currentFilteredGrid = allGridPhotos;

    allComparePairs = shuffle((data.galleryPairs || []).filter(item => item && item.active !== false));
    currentFilteredPairs = allComparePairs;

    /* Compare pairs */
    if (compareRow && allComparePairs.length) {
      renderComparePairs(currentFilteredPairs);
    }

    /* Grid gallery */
    if (galleryContainer && allGridPhotos.length) {
      renderGallery(currentFilteredGrid);
    }
  } catch (err) {
    console.error("Gallery Error:", err);
  }
}

/* ============================================================
   EVENT LISTENERS for Search and Load More
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Call master initialization functions
  loadGalleryPage();
  
  // ❌ REMOVED: initHeaderInteractions(); 
  // (It was moved to the header fetch logic below to fix the mobile menu bug)
  
  const searchInput = document.getElementById("gallerySearch");
  const loadMoreGridBtn = document.getElementById("loadMoreGrid");
  const loadMoreBABtn = document.getElementById("loadMoreBA");

  // 1. Attach the main filtering function to the search input
  if (searchInput) {
    searchInput.addEventListener("input", filterGallery);
  }

  // 2. Attach the "Load More" event for the Photo Grid
  if (loadMoreGridBtn) {
    loadMoreGridBtn.addEventListener("click", () => {
      // Load the next batch of the *currently filtered* photos
      renderGallery(currentFilteredGrid, true); // Pass 'true' to append
    });
  }
  
  // 3. Attach the "Load More" event for the Before & After Section
  if (loadMoreBABtn) {
    loadMoreBABtn.addEventListener("click", () => {
      // Load the next batch of the *currently filtered* pairs
      renderComparePairs(currentFilteredPairs, true); // Pass 'true' to append
    });
  }
});

/* ============================================================
   PAGES CMS — SITE-WIDE CONTENT CONTROLS
   Static HTML remains as a safe fallback if a JSON file is unavailable.
=============================================================== */

const hammerContentCache = new Map();

function hammerFetchJson(path) {
  if (!hammerContentCache.has(path)) {
    hammerContentCache.set(path, fetch(path, { cache: "no-store" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null));
  }
  return hammerContentCache.get(path);
}

function hammerEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hammerContentIsLive(item, startField = "publishStart", endField = "publishEnd") {
  if (!item || item.active === false) return false;
  const status = String(item.publishStatus || "live").toLowerCase();
  if (status === "draft" || status === "archived") return false;

  const now = new Date();
  const startValue = item[startField];
  const endValue = item[endField];
  if (status === "scheduled" && !startValue) return false;
  const start = startValue ? new Date(`${startValue}T00:00:00`) : null;
  const end = endValue ? new Date(`${endValue}T23:59:59`) : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) return false;
  if (end && !Number.isNaN(end.getTime()) && now > end) return false;
  return true;
}

function hammerProjectStages(item, fallbackAlt) {
  if (item.photoType === "single") return [];
  const stages = [];
  const beforeLabel = item.beforeLabel || "Before";
  const progressLabel = item.progressLabel || "In Progress";
  const afterLabel = item.afterLabel || "After";
  if (item.beforeImage) stages.push({ image: item.beforeImage, label: beforeLabel, alt: `${fallbackAlt} — ${beforeLabel}` });
  const progressImages = item.photoType === "before-after" ? [] : (Array.isArray(item.midProcessImages) ? item.midProcessImages : []);
  progressImages.filter(Boolean).forEach((image, index, all) => {
    const label = all.length > 1 ? `${progressLabel} ${index + 1}` : progressLabel;
    stages.push({ image, label, alt: `${fallbackAlt} — ${label}` });
  });
  if (item.afterImage) stages.push({ image: item.afterImage, label: afterLabel, alt: `${fallbackAlt} — ${afterLabel}` });
  return stages;
}

let hammerStageViewerId = 0;

function hammerRenderStageViewer(item, fallbackAlt) {
  const stages = hammerProjectStages(item, fallbackAlt);
  if (!stages.length) return "";
  if (item.stageDisplay === "grid" || stages.length === 1) {
    return `<div class="cms-stage-grid">${stages.map(stage => `
      <figure><img src="${hammerEscape(stage.image)}" alt="${hammerEscape(stage.alt)}" loading="lazy"><span>${hammerEscape(stage.label)}</span></figure>`).join("")}</div>`;
  }

  const viewerId = `cmsStageViewer${++hammerStageViewerId}`;
  return `<div class="cms-stage-viewer" data-cms-stage-viewer>
    <div class="cms-stage-buttons" role="tablist" aria-label="Project photo stages">
      ${stages.map((stage, index) => `<button type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-controls="${viewerId}Panel${index}" data-cms-stage-button="${index}">${hammerEscape(stage.label)}</button>`).join("")}
    </div>
    <div class="cms-stage-panels">
      ${stages.map((stage, index) => `<figure id="${viewerId}Panel${index}" role="tabpanel" data-cms-stage-panel="${index}"${index === 0 ? "" : " hidden"}><img src="${hammerEscape(stage.image)}" alt="${hammerEscape(stage.alt)}" loading="lazy"><figcaption>${hammerEscape(stage.label)}</figcaption></figure>`).join("")}
    </div>
  </div>`;
}

function hammerBindStageViewers(scope = document) {
  scope.querySelectorAll("[data-cms-stage-viewer]").forEach(viewer => {
    if (viewer.dataset.cmsStageReady === "true") return;
    viewer.dataset.cmsStageReady = "true";
    const buttons = Array.from(viewer.querySelectorAll("[data-cms-stage-button]"));
    const panels = Array.from(viewer.querySelectorAll("[data-cms-stage-panel]"));
    buttons.forEach(button => button.addEventListener("click", () => {
      const selected = button.dataset.cmsStageButton;
      buttons.forEach(item => item.setAttribute("aria-selected", item === button ? "true" : "false"));
      panels.forEach(panel => { panel.hidden = panel.dataset.cmsStagePanel !== selected; });
    }));
  });
}

function hammerSafeMarkdown(value) {
  const inline = text => hammerEscape(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
  const lines = String(value || "").replace(/\r/g, "").split("\n");
  const output = [];
  let inList = false;
  const closeList = () => {
    if (inList) output.push("</ul>");
    inList = false;
  };
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      return;
    }
    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      if (!inList) output.push('<ul class="bullets">');
      inList = true;
      output.push(`<li>${inline(listItem[1])}</li>`);
      return;
    }
    closeList();
    if (/^###\s+/.test(trimmed)) output.push(`<h3>${inline(trimmed.replace(/^###\s+/, ""))}</h3>`);
    else if (/^##\s+/.test(trimmed)) output.push(`<h2>${inline(trimmed.replace(/^##\s+/, ""))}</h2>`);
    else output.push(`<p>${inline(trimmed)}</p>`);
  });
  closeList();
  return output.join("");
}

function hammerPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

function hammerSlug() {
  const path = hammerPath();
  if (path === "/" || path === "/index.html") return "home";
  return path.split("/").pop().replace(/\.html$/i, "");
}

function hammerSetMeta(name, value) {
  if (!value) return;
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = value;
}

function hammerSetPropertyMeta(property, value) {
  if (!value) return;
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.content = value;
}

function hammerEnsureAdminStyles() {
  if (document.getElementById("cmsAdminPowerStyles")) return;
  const style = document.createElement("style");
  style.id = "cmsAdminPowerStyles";
  style.textContent = `
    #header-include[data-cms-sticky="true"]{position:sticky;top:0;z-index:10000}
    #header-include[data-cms-sticky="false"]{position:static}
    .topbar[data-cms-background="solid"]{background:#0a1728!important;backdrop-filter:none!important}
    .topbar[data-cms-background="dark"]{background:#05080d!important;backdrop-filter:none!important}
    .topbar[data-cms-background="gold"]{background:linear-gradient(135deg,#1a1408,#44300d)!important}
    [data-cms-desktop-visible="false"]{display:none!important}
    .cms-site-announcement{background:#c99a2e;color:#07111f;padding:9px 18px;text-align:center;font-weight:700}
    .cms-site-announcement a{color:#07111f;margin-left:12px;text-decoration:underline;font-weight:800}
    .cms-page-hero-image,.cms-area-hero-image{margin:24px auto 0;max-width:1050px}
    .cms-page-hero-image img,.cms-area-hero-image img{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:18px}
    .cms-page-hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}
    .cms-page-final-cta{text-align:center}
    .cms-page-blocks{display:grid;gap:22px}
    .cms-page-block{padding:28px;border-radius:16px}
    .cms-page-block[data-style="accent"]{border:1px solid rgba(231,191,99,.35);background:rgba(231,191,99,.07)}
    .cms-page-block[data-style="dark"]{background:#07111f;color:#fff}
    .cms-page-block-image{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;align-items:center}
    .cms-page-block-image img,.cms-page-block-gallery img{display:block;width:100%;height:300px;object-fit:cover;border-radius:12px}
    .cms-page-block-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
    .cms-area-card-image{width:100%;height:150px;object-fit:cover;border-radius:12px;margin-bottom:14px}
    .cms-area-gallery-grid[data-layout="large"]{grid-template-columns:1fr!important}
    .cms-area-gallery-grid[data-layout="large"] img{max-height:680px;object-fit:cover}
    .cms-area-before-after{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .cms-area-before-after figure{margin:0;position:relative}
    .cms-area-before-after img{width:100%;height:280px;object-fit:cover;border-radius:12px}
    .cms-area-before-after span{position:absolute;left:10px;bottom:10px;background:rgba(4,10,18,.82);color:#fff;padding:5px 8px;border-radius:6px;font-size:.78rem;font-weight:800}
    .cms-stage-viewer{border:1px solid rgba(231,191,99,.24);border-radius:14px;overflow:hidden;background:rgba(5,12,22,.55)}
    .cms-stage-buttons{display:flex;gap:7px;flex-wrap:wrap;padding:10px;background:rgba(5,12,22,.92)}
    .cms-stage-buttons button{appearance:none;border:1px solid rgba(231,191,99,.45);background:transparent;color:#fff;border-radius:999px;padding:8px 13px;font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}
    .cms-stage-buttons button[aria-selected="true"]{background:var(--gold,#c99a2e);border-color:var(--gold,#c99a2e);color:#07111f}
    .cms-stage-panels figure,.cms-stage-grid figure{margin:0;position:relative}
    .cms-stage-panels img,.cms-stage-grid img{display:block;width:100%;height:310px;object-fit:cover}
    .cms-stage-panels figcaption,.cms-stage-grid span{position:absolute;left:10px;bottom:10px;background:rgba(4,10,18,.86);color:#fff;padding:6px 9px;border-radius:6px;font-size:.78rem;font-weight:800}
    .cms-stage-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px}
    .cms-area-faqs .faq-item{max-width:900px;margin:0 auto 10px}
    .cms-project-date{font-size:.82rem;color:var(--muted,#a9b4c3);margin-top:4px}
    .cms-project-review{margin-top:14px;padding:12px 14px;border-left:3px solid var(--gold,#c99a2e);font-style:italic}
    .cms-project-cta{display:inline-block;margin-top:14px}
    @media(max-width:900px){
      [data-cms-mobile-visible="false"]{display:none!important}
      [data-cms-mobile-visible="true"]{display:block!important}
      .cms-area-before-after{grid-template-columns:1fr}
      .cms-area-before-after img{height:auto}
      .cms-stage-panels img,.cms-stage-grid img{height:auto;min-height:220px}
      .cms-page-block-image{grid-template-columns:1fr}
      .cms-page-block-image img,.cms-page-block-gallery img{height:auto;min-height:220px}
    }
  `;
  document.head.appendChild(style);
}

function hammerApplySeo(item) {
  if (!item) return;
  if (item.seoTitle) document.title = item.seoTitle;
  hammerSetMeta("description", item.seoDescription);
  hammerSetPropertyMeta("og:title", item.socialTitle || item.seoTitle);
  hammerSetPropertyMeta("og:description", item.socialDescription || item.seoDescription);
  hammerSetMeta("twitter:title", item.socialTitle || item.seoTitle);
  hammerSetMeta("twitter:description", item.socialDescription || item.seoDescription);
  if (item.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(item.canonicalUrl, window.location.origin).href;
  }
  if (item.socialImage) {
    const imageUrl = new URL(item.socialImage, window.location.origin).href;
    hammerSetPropertyMeta("og:image", imageUrl);
    hammerSetMeta("twitter:card", "summary_large_image");
    hammerSetMeta("twitter:image", imageUrl);
  }
  if (item.active === false || item.published === false || item.allowIndexing === false) {
    hammerSetMeta("robots", "noindex, nofollow");
  }

  const schemaType = item.structuredDataType;
  let schema = document.getElementById("cmsPageStructuredData");
  if (schemaType === "none") {
    if (schema) schema.remove();
  } else if (schemaType === "service" || schemaType === "area") {
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "cmsPageStructuredData";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: item.heroTitle || item.menuLabel || item.title || item.name,
      description: item.seoDescription || item.heroText || item.intro || "",
      url: window.location.href,
      areaServed: schemaType === "area" ? (item.title || item.name || item.menuLabel || "") : undefined
    });
  }
}

function hammerApplyHero(item) {
  if (!item) return;
  const hero = document.querySelector("main .hero");
  if (!hero) return;
  hero.style.display = item.showHero === false ? "none" : "";
  const title = hero.querySelector("h1");
  const text = hero.querySelector(".hero-content > p, p");
  if (title && item.heroTitle) title.textContent = item.heroTitle;
  if (text && item.heroText) text.textContent = item.heroText;

  let figure = document.getElementById("cmsPageHeroImage");
  const usesAreaHeroControl = ["staten-island", "brooklyn", "queens", "manhattan", "bronx", "new-jersey"].includes(item.slug);
  if (item.heroImage && !usesAreaHeroControl) {
    if (!figure) {
      figure = document.createElement("figure");
      figure.id = "cmsPageHeroImage";
      figure.className = "cms-page-hero-image";
      hero.appendChild(figure);
    }
    figure.style.display = "";
    figure.innerHTML = `<img src="${hammerEscape(item.heroImage)}" alt="${hammerEscape(item.heroImageAlt || item.heroTitle || "Page photo")}" loading="eager">`;
  } else if (figure) {
    figure.style.display = "none";
  }

  let actions = document.getElementById("cmsPageHeroActions");
  const buttons = [];
  if (item.primaryButtonText) buttons.push(`<a class="btn" href="${hammerEscape(item.primaryButtonUrl || "/contact.html")}">${hammerEscape(item.primaryButtonText)}</a>`);
  if (item.secondaryButtonText) buttons.push(`<a class="btn ghost" href="${hammerEscape(item.secondaryButtonUrl || "/contact.html")}">${hammerEscape(item.secondaryButtonText)}</a>`);
  if (buttons.length) {
    if (!actions) {
      actions = document.createElement("div");
      actions.id = "cmsPageHeroActions";
      actions.className = "cms-page-hero-actions";
      const content = hero.querySelector(".hero-content") || hero;
      content.appendChild(actions);
    }
    actions.style.display = "";
    actions.innerHTML = buttons.join("");
  } else if (actions) {
    actions.style.display = "none";
  }
}

function hammerApplyFinalCta(item) {
  const main = document.querySelector("main");
  if (!main || !item) return;
  let section = document.getElementById("cmsPageFinalCta");
  if (!item.showFinalCta) {
    if (section) section.style.display = "none";
    return;
  }
  if (!section) {
    section = document.createElement("section");
    section.id = "cmsPageFinalCta";
    section.className = "section note-box fade-up cms-page-final-cta";
    main.appendChild(section);
  }
  const buttons = [];
  if (item.showCallButton !== false) buttons.push(`<a class="btn" href="tel:+19295955300">${hammerEscape(item.callButtonText || "Call Now")}</a>`);
  if (item.showTextButton !== false) buttons.push(`<a class="btn ghost" href="sms:+19295955300">${hammerEscape(item.textButtonText || "Text Photos")}</a>`);
  if (item.showEstimateButton !== false) buttons.push(`<a class="btn ghost" href="/contact.html">${hammerEscape(item.estimateButtonText || "Free Estimate")}</a>`);
  section.style.display = "";
  section.innerHTML = `
    ${item.finalCtaHeading ? `<h2>${hammerEscape(item.finalCtaHeading)}</h2>` : ""}
    ${item.finalCtaText ? `<p>${hammerEscape(item.finalCtaText)}</p>` : ""}
    ${buttons.length ? `<div class="cta-actions">${buttons.join("")}</div>` : ""}`;
}

function hammerApplyCustomSection(item) {
  if (!item) return;
  let section = document.getElementById("cmsPageExtraSection");
  if (!item.showCustomSection) {
    if (section) section.style.display = "none";
    return;
  }
  if (!section) {
    const hero = document.querySelector("main .hero");
    if (!hero || !hero.parentNode) return;
    section = document.createElement("section");
    section.id = "cmsPageExtraSection";
    section.className = "section note-box fade-up";
    hero.parentNode.insertBefore(section, hero.nextSibling);
  }
  section.style.display = "";
  section.innerHTML = `
    ${item.sectionHeading ? `<h2>${hammerEscape(item.sectionHeading)}</h2>` : ""}
    ${item.sectionText ? `<p>${hammerEscape(item.sectionText)}</p>` : ""}
    ${item.buttonText ? `<div class="cta-actions"><a class="btn" href="${hammerEscape(item.buttonUrl || "/contact.html")}">${hammerEscape(item.buttonText)}</a></div>` : ""}`;
}

function hammerApplyPageBlocks(item) {
  const main = document.querySelector("main");
  if (!main || !item) return;
  let container = document.getElementById("cmsPageBlocks");
  const blocks = Array.isArray(item.contentBlocks)
    ? hammerSortByDisplayOrder(item.contentBlocks.filter(block => block && block.active !== false))
    : [];
  if (!blocks.length) {
    if (container) container.style.display = "none";
    return;
  }
  if (!container) {
    container = document.createElement("section");
    container.id = "cmsPageBlocks";
    container.className = "section cms-page-blocks fade-up";
  }
  const finalCta = document.getElementById("cmsPageFinalCta");
  main.insertBefore(container, finalCta || null);
  container.style.display = "";
  container.innerHTML = blocks.map(block => {
    const heading = block.heading ? `<h2>${hammerEscape(block.heading)}</h2>` : "";
    const text = block.text ? `<div>${hammerSafeMarkdown(block.text)}</div>` : "";
    const button = block.buttonText ? `<div class="cta-actions"><a class="btn${block.blockType === "cta" ? "" : " ghost"}" href="${hammerEscape(block.buttonUrl || "/contact.html")}">${hammerEscape(block.buttonText)}</a></div>` : "";
    const style = ["accent", "dark"].includes(block.backgroundStyle) ? block.backgroundStyle : "standard";
    if (block.blockType === "image" && block.image) {
      return `<article class="cms-page-block cms-page-block-image" data-style="${style}">
        <img src="${hammerEscape(block.image)}" alt="${hammerEscape(block.imageAlt || block.heading || "Project photo")}" loading="lazy">
        <div>${heading}${text}${button}</div>
      </article>`;
    }
    if (block.blockType === "photo-grid") {
      const images = Array.isArray(block.images) ? block.images.filter(Boolean) : [];
      return `<article class="cms-page-block" data-style="${style}">${heading}${text}
        ${images.length ? `<div class="cms-page-block-gallery">${images.map((image, index) => `<img src="${hammerEscape(image)}" alt="${hammerEscape(`${block.imageAlt || block.heading || "Project photo"}${images.length > 1 ? ` ${index + 1}` : ""}`)}" loading="lazy">`).join("")}</div>` : ""}
        ${button}</article>`;
    }
    return `<article class="cms-page-block${block.blockType === "cta" ? " cms-page-final-cta" : ""}" data-style="${style}">${heading}${text}${button}</article>`;
  }).join("");
}

function hammerLinkPath(anchor) {
  try {
    return new URL(anchor.href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
  } catch (_) {
    return "";
  }
}

function hammerApplyPageControls(data) {
  if (!data || !Array.isArray(data.pages)) return;

  const pagesByUrl = new Map();
  data.pages.forEach(page => {
    if (!page || !page.url) return;
    const normalized = page.url.replace(/\/+$/, "") || "/";
    pagesByUrl.set(normalized, page);
  });

  const current = data.pages.find(page => page && page.slug === hammerSlug());
  if (current) {
    hammerApplySeo(current);
    hammerApplyHero(current);
    hammerApplyCustomSection(current);
    hammerApplyPageBlocks(current);
    hammerApplyFinalCta(current);
    if (current.active === false) {
      hammerSetMeta("robots", "noindex, nofollow");
      document.body.dataset.cmsPageActive = "false";
    }
  }

  const areaDirectory = data.pages.find(page => page && page.slug === "areas");
  const mainNav = document.querySelector(".main-nav");
  if (mainNav && areaDirectory && areaDirectory.active !== false && areaDirectory.showInNavigation !== false) {
    let areaDirectoryLink = mainNav.querySelector('a[href="/areas.html"]');
    if (!areaDirectoryLink) {
      areaDirectoryLink = document.createElement("a");
      areaDirectoryLink.href = "/areas.html";
      const areaDropdown = Array.from(mainNav.querySelectorAll(".dropdown")).find(dropdown =>
        dropdown.querySelector('a[href="/brooklyn.html"]')
      );
      mainNav.insertBefore(areaDirectoryLink, areaDropdown || mainNav.lastElementChild);
    }
    areaDirectoryLink.textContent = areaDirectory.menuLabel || "Service Areas";
  }

  document.querySelectorAll(".main-nav a[href], .site-footer nav a[href]").forEach(anchor => {
    const rawHref = anchor.getAttribute("href") || "";
    if (anchor.classList.contains("dropbtn") || rawHref.startsWith("#")) return;
    const page = pagesByUrl.get(hammerLinkPath(anchor));
    if (!page) return;
    anchor.style.display = (page.active === false || page.showInNavigation === false) ? "none" : "";
    if (page.menuLabel) anchor.textContent = page.menuLabel;
  });

  if (mainNav) {
    Array.from(mainNav.children).forEach((item, originalIndex) => {
      const links = item.matches("a[href]") ? [item] : Array.from(item.querySelectorAll("a[href]"));
      const orders = links.map(link => pagesByUrl.get(hammerLinkPath(link)))
        .filter(Boolean)
        .map(page => Number(page.navigationOrder))
        .filter(Number.isFinite);
      item.style.order = String(orders.length ? Math.min(...orders) : 10000 + originalIndex);
    });
  }
}

function hammerAreaIcon(slug) {
  const icons = {
    "staten-island": "🏡",
    "brooklyn": "🏙️",
    "queens": "🧱",
    "manhattan": "🏢",
    "bronx": "🏗️",
    "new-jersey": "🌳"
  };
  return icons[slug] || "📍";
}

function hammerRenderHomeAreas(data, homepage) {
  const isHome = hammerSlug() === "home";
  const isDirectory = hammerSlug() === "areas";
  if ((!isHome && !isDirectory) || !data || !Array.isArray(data.areas)) return;

  const allActiveAreas = hammerSortByDisplayOrder(data.areas.filter(area => area && area.active !== false));
  if (isDirectory) {
    const heading = document.getElementById("areaDirectoryHeading");
    const intro = document.getElementById("areaDirectoryIntro");
    const grid = document.getElementById("areaDirectoryGrid");
    if (heading && data.heading) heading.textContent = data.heading;
    if (intro && data.intro) intro.textContent = data.intro;
    if (grid) {
      grid.innerHTML = allActiveAreas.map(area => `
        <a class="accent-card" href="${hammerEscape(area.url)}" style="display:block;text-decoration:none;color:inherit;padding:24px;">
          ${area.cardImage ? `<img class="cms-area-card-image" src="${hammerEscape(area.cardImage)}" alt="${hammerEscape(area.cardImageAlt || area.name || "Service area")}" loading="lazy">` : ""}
          <div style="font-size:28px;margin-bottom:8px;">${hammerAreaIcon(area.slug)}</div>
          <h2 style="color:var(--gold-soft);margin-bottom:8px;">${hammerEscape(area.name)}</h2>
          <p style="color:var(--muted);margin-bottom:12px;">${hammerEscape(area.cardText)}</p>
          <span style="color:var(--gold);font-weight:700;">View local services →</span>
        </a>`).join("");
    }
    return;
  }

  let section = document.getElementById("cmsServiceAreasSection");
  if (!section) {
    section = document.createElement("section");
    section.id = "cmsServiceAreasSection";
    section.className = "section fade-up";
    section.style.marginTop = "50px";
    const mapSection = document.getElementById("serviceAreaSection");
    const main = document.getElementById("main") || document.querySelector("main");
    if (mapSection && mapSection.parentNode) mapSection.parentNode.insertBefore(section, mapSection);
    else if (main) main.appendChild(section);
  }

  section.style.display = homepage && homepage.showServiceAreas === false ? "none" : "";
  const areas = hammerSortByDisplayOrder(data.areas.filter(area => area && area.active !== false && area.showOnHomepage !== false));
  const heading = (homepage && homepage.serviceAreasHeading) || data.heading || "Areas We Serve";
  const intro = (homepage && homepage.serviceAreasIntro) || data.intro || "";

  section.innerHTML = `
    <div style="text-align:center;max-width:780px;margin:0 auto 26px;">
      <h2>${hammerEscape(heading)}</h2>
      <p style="color:var(--muted);">${hammerEscape(intro)}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;">
      ${areas.map(area => `
        <a class="accent-card" href="${hammerEscape(area.url)}" style="display:block;text-decoration:none;color:inherit;padding:22px;">
          ${area.cardImage ? `<img class="cms-area-card-image" src="${hammerEscape(area.cardImage)}" alt="${hammerEscape(area.cardImageAlt || area.name || "Service area")}" loading="lazy">` : ""}
          <div style="font-size:25px;margin-bottom:8px;">${hammerAreaIcon(area.slug)}</div>
          <h3 style="color:var(--gold-soft);margin-bottom:8px;">${hammerEscape(area.name)}</h3>
          <p style="color:var(--muted);margin:0 0 12px;">${hammerEscape(area.cardText)}</p>
          <span style="color:var(--gold);font-weight:700;">View ${hammerEscape(area.name)} services →</span>
        </a>`).join("")}
    </div>`;
}

function hammerMergeAreaDetail(area, detail) {
  if (!area || !detail || detail.slug !== area.slug) return area;
  return {
    ...area,
    ...detail,
    active: area.active !== false && detail.published !== false,
    name: detail.title || area.name,
    heroTitle: detail.heroTitle || detail.title || area.heroTitle,
    heroText: detail.intro || area.heroText,
    sectionTitle: detail.sectionTitle || area.sectionTitle,
    sectionText: detail.sectionText || area.sectionText,
    featuredServices: Array.isArray(detail.featuredServices) && detail.featuredServices.length ? detail.featuredServices : area.featuredServices,
    neighborhoods: Array.isArray(detail.neighborhoods) && detail.neighborhoods.length ? detail.neighborhoods : area.neighborhoods,
    ctaTitle: detail.ctaTitle || area.ctaTitle,
    ctaText: detail.ctaText || area.ctaText,
    seoTitle: detail.seoTitle || area.seoTitle,
    seoDescription: detail.seoDescription || area.seoDescription
  };
}

function hammerCurrentAreaDetail() {
  const areaSlugs = new Set(["staten-island", "brooklyn", "queens", "manhattan", "bronx", "new-jersey"]);
  const slug = hammerSlug();
  return areaSlugs.has(slug) ? hammerFetchJson(`/content/areas/${slug}.json`) : Promise.resolve(null);
}

function hammerApplyAreaControls(data, detail) {
  if (!data || !Array.isArray(data.areas)) return;

  const activeAreas = data.areas.filter(area => area && area.active !== false);
  const areaByUrl = new Map(activeAreas.map(area => [(area.url || "").replace(/\/+$/, ""), area]));

  document.querySelectorAll(".main-nav .dropdown-content a[href]").forEach(anchor => {
    const area = areaByUrl.get(hammerLinkPath(anchor));
    const knownArea = data.areas.find(item => item && (item.url || "").replace(/\/+$/, "") === hammerLinkPath(anchor));
    if (knownArea) anchor.style.display = knownArea.active === false ? "none" : "";
    if (area && area.name) anchor.textContent = area.name;
  });

  const area = hammerMergeAreaDetail(data.areas.find(item => item && item.slug === hammerSlug()), detail);
  if (!area) return;
  hammerApplySeo(area);
  hammerApplyHero(area);
  if (area.active === false) hammerSetMeta("robots", "noindex, nofollow");

  const mainSection = document.querySelector("main .section.split");
  if (mainSection) {
    mainSection.style.display = area.showMainSection === false ? "none" : "";
    const heading = mainSection.querySelector("h2");
    const paragraph = mainSection.querySelector(":scope > div > p");
    const services = mainSection.querySelector(":scope > div > ul.bullets");
    const areaCard = mainSection.querySelector(".accent-card");
    if (heading && area.sectionTitle) heading.textContent = area.sectionTitle;
    if (paragraph && area.sectionText) paragraph.textContent = area.sectionText;
    if (services && Array.isArray(area.featuredServices) && area.featuredServices.length) {
      services.innerHTML = area.featuredServices.map(item => `<li>${hammerEscape(item)}</li>`).join("");
    }
    if (services) services.style.display = area.showFeaturedServices === false ? "none" : "";
    if (areaCard) {
      areaCard.style.display = area.showNeighborhoods === false ? "none" : "";
      const areaCardHeading = areaCard.querySelector("h3");
      const areaCardList = areaCard.querySelector("ul.bullets");
      if (areaCardHeading) areaCardHeading.textContent = "Neighborhoods We Serve";
      if (areaCardList && Array.isArray(area.neighborhoods) && area.neighborhoods.length) {
        areaCardList.innerHTML = area.neighborhoods.map(item => `<li>${hammerEscape(item)}</li>`).join("");
      }
    }
  }

  const cta = document.querySelector("main .section.note-box");
  if (cta) {
    cta.style.display = area.showCta === false ? "none" : "";
    const heading = cta.querySelector("h2");
    const paragraph = cta.querySelector("p");
    const button = cta.querySelector(".cta-actions .btn.ghost") || cta.querySelector(".cta-actions .btn:last-child");
    if (heading && area.ctaTitle) heading.textContent = area.ctaTitle;
    if (paragraph && area.ctaText) paragraph.textContent = area.ctaText;
    if (button && area.ctaButtonText) button.textContent = area.ctaButtonText;
    if (button && area.ctaButtonUrl) button.href = area.ctaButtonUrl;

    let actions = cta.querySelector(".cta-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "cta-actions";
      cta.appendChild(actions);
    }
    actions.querySelectorAll("[data-cms-area-button]").forEach(item => item.remove());
    const dial = normalizeDialNumber(area.areaPhone) || "+19295955300";
    const addButton = (type, href, label, ghost = true) => {
      const link = document.createElement("a");
      link.className = ghost ? "btn ghost" : "btn";
      link.dataset.cmsAreaButton = type;
      link.href = href;
      link.textContent = label;
      if (type === "call" || type === "text") link.dataset.cmsAreaPhone = "true";
      actions.appendChild(link);
    };
    if (area.showCallButton === true) addButton("call", `tel:${dial}`, area.callButtonText || "Call Now", false);
    if (area.showTextButton === true) {
      const message = area.textMessage ? `?&body=${encodeURIComponent(area.textMessage)}` : "";
      addButton("text", `sms:${dial}${message}`, area.textButtonText || "Text Photos");
    }
    if (area.showEstimateButton === true) addButton("estimate", "/contact.html", area.estimateButtonText || "Free Estimate");
    if (area.showEstimatorButton === true) addButton("estimator", "/project-estimator.html", area.estimatorButtonText || "Try Project Estimator");
  }
}

function hammerSortByDisplayOrder(items) {
  return [...items].sort((a, b) => (Number(a.displayOrder) || 9999) - (Number(b.displayOrder) || 9999));
}

function hammerItemMatchesArea(item, areaSlug) {
  if (!item || !areaSlug) return false;
  if (!item.areaSlug || item.areaSlug === "all" || item.areaSlug === areaSlug) return true;
  return Array.isArray(item.areaSlugs) && item.areaSlugs.includes(areaSlug);
}

function hammerRenderAreaExtras(area, reviewsData, specialsData, faqsData) {
  if (!area || area.slug !== hammerSlug()) return;
  const main = document.querySelector("main");
  if (!main) return;

  const hero = main.querySelector(".hero");
  let heroImage = document.getElementById("cmsAreaHeroImage");
  if (area.showHeroImage && area.heroImage && hero) {
    if (!heroImage) {
      heroImage = document.createElement("figure");
      heroImage.id = "cmsAreaHeroImage";
      heroImage.className = "cms-area-hero-image";
      hero.appendChild(heroImage);
    }
    heroImage.style.display = "";
    heroImage.innerHTML = `<img src="${hammerEscape(area.heroImage)}" alt="${hammerEscape(area.heroImageAlt || area.heroTitle || area.name || "Local project")}" loading="eager">`;
  } else if (heroImage) {
    heroImage.style.display = "none";
  }

  let bodySection = document.getElementById("cmsAreaBodySection");
  if (area.showBody !== false && area.body && String(area.body).trim()) {
    if (!bodySection) {
      bodySection = document.createElement("section");
      bodySection.id = "cmsAreaBodySection";
      bodySection.className = "section fade-up cms-area-body";
      const mainSection = main.querySelector(".section.split");
      if (mainSection && mainSection.parentNode) mainSection.parentNode.insertBefore(bodySection, mainSection.nextSibling);
      else main.appendChild(bodySection);
    }
    bodySection.style.display = "";
    bodySection.innerHTML = hammerSafeMarkdown(area.body);
  } else if (bodySection) {
    bodySection.style.display = "none";
  }

  let galleryGrid = main.querySelector(".gallery-grid, .cms-area-gallery-grid");
  let gallerySection = galleryGrid && galleryGrid.closest("section");
  const validGalleryImages = Array.isArray(area.galleryImages)
    ? area.galleryImages.filter(item => item && item.active !== false && (
      item.image || item.beforeImage || item.afterImage || (Array.isArray(item.midProcessImages) && item.midProcessImages.some(Boolean))
    ))
    : [];
  const maximum = Number(area.maxGalleryPhotos);
  const galleryImages = hammerSortByDisplayOrder(validGalleryImages).slice(0, maximum > 0 ? maximum : validGalleryImages.length);
  if (area.showAreaGallery && galleryImages.length) {
    if (!gallerySection) {
      gallerySection = document.createElement("section");
      gallerySection.className = "section fade-up";
      gallerySection.dataset.cmsAreaGallery = "true";
      gallerySection.innerHTML = `<div class="cms-section-heading"><h2></h2><p></p></div><div class="gallery-grid cms-area-gallery-grid"></div>`;
      const ctaAnchor = main.querySelector(".section.note-box") || main.querySelector(".micro-summary");
      main.insertBefore(gallerySection, ctaAnchor || null);
      galleryGrid = gallerySection.querySelector(".cms-area-gallery-grid");
    }
    gallerySection.dataset.cmsAreaGallery = "true";
    gallerySection.style.display = "";
    galleryGrid.classList.add("cms-area-gallery-grid");
    galleryGrid.dataset.layout = area.galleryLayout || "grid";
    const heading = gallerySection.querySelector("h2");
    const intro = gallerySection.querySelector("h2 + p, .cms-section-heading p");
    if (heading) heading.textContent = area.galleryHeading || `${area.name || "Local"} Project Photos`;
    if (intro) {
      intro.textContent = area.galleryIntro || "";
      intro.style.display = area.galleryIntro ? "" : "none";
    }
    galleryGrid.innerHTML = galleryImages.map(item => {
      const alt = item.alt || item.caption || area.name || "Completed project";
      const isPair = item.photoType === "before-after" || (!item.image && item.beforeImage && item.afterImage);
      const isProgress = item.photoType === "progress" || (Array.isArray(item.midProcessImages) && item.midProcessImages.some(Boolean));
      if (isProgress || (isPair && item.stageDisplay === "buttons")) {
        return `<article class="cms-area-gallery-card">
          ${hammerRenderStageViewer(item, alt)}
          ${item.caption ? `<p>${hammerEscape(item.caption)}</p>` : ""}
        </article>`;
      }
      if (isPair && item.beforeImage && item.afterImage) {
        return `<article class="cms-area-gallery-card">
          <div class="cms-area-before-after">
            <figure><img src="${hammerEscape(item.beforeImage)}" alt="${hammerEscape(`${alt} before`)}" loading="lazy"><span>Before</span></figure>
            <figure><img src="${hammerEscape(item.afterImage)}" alt="${hammerEscape(`${alt} after`)}" loading="lazy"><span>After</span></figure>
          </div>${item.caption ? `<p>${hammerEscape(item.caption)}</p>` : ""}
        </article>`;
      }
      return `<figure class="cms-area-gallery-card">
        <img src="${hammerEscape(item.image || item.afterImage || item.beforeImage)}" alt="${hammerEscape(alt)}" loading="lazy">
        ${item.caption ? `<figcaption>${hammerEscape(item.caption)}</figcaption>` : ""}
      </figure>`;
    }).join("");
    hammerBindStageViewers(galleryGrid);
  } else if (gallerySection && (gallerySection.dataset.cmsAreaGallery === "true" || area.showAreaGallery === false)) {
    gallerySection.style.display = "none";
  }

  const cta = main.querySelector(".section.note-box");
  const insertBefore = cta || main.querySelector(".micro-summary") || null;

  let reviewSection = document.getElementById("cmsAreaReviewsSection");
  const localReviews = reviewsData && Array.isArray(reviewsData.reviews)
    ? hammerSortByDisplayOrder(reviewsData.reviews.filter(item => hammerContentIsLive(item) && item.showOnAreaPages === true && hammerItemMatchesArea(item, area.slug)))
    : [];
  if (area.showLocalReviews && localReviews.length) {
    if (!reviewSection) {
      reviewSection = document.createElement("section");
      reviewSection.id = "cmsAreaReviewsSection";
      reviewSection.className = "section fade-up cms-area-reviews";
      main.insertBefore(reviewSection, insertBefore);
    }
    reviewSection.style.display = "";
    reviewSection.innerHTML = `
      <div class="cms-section-heading"><h2>${hammerEscape(area.reviewsHeading || `What ${area.name || "Local"} Customers Say`)}</h2></div>
      <div class="cms-area-review-grid">${localReviews.map(item => `
        <article class="cms-area-review-card">
          <div class="star-row">${"★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}</div>
          <p>“${hammerEscape(item.review)}”</p>
          <strong>${hammerEscape(item.name || "Customer")}</strong>
          ${item.service ? `<span>${hammerEscape(item.service)}</span>` : ""}
        </article>`).join("")}</div>`;
  } else if (reviewSection) {
    reviewSection.style.display = "none";
  }

  let specialsSection = document.getElementById("cmsAreaSpecialsSection");
  const localSpecials = specialsData && Array.isArray(specialsData.specials)
    ? hammerSortByDisplayOrder(specialsData.specials.filter(item => hammerSpecialIsCurrent(item) && item.showOnAreaPages === true && hammerItemMatchesArea(item, area.slug)))
    : [];
  if (area.showAreaSpecials && localSpecials.length) {
    if (!specialsSection) {
      specialsSection = document.createElement("section");
      specialsSection.id = "cmsAreaSpecialsSection";
      specialsSection.className = "section fade-up cms-area-specials";
      main.insertBefore(specialsSection, insertBefore);
    }
    specialsSection.style.display = "";
    specialsSection.innerHTML = `
      <div class="cms-section-heading"><h2>${hammerEscape(area.specialsHeading || `${area.name || "Local"} Specials`)}</h2></div>
      <div class="specials-grid">${hammerRenderSpecialCards(localSpecials)}</div>`;
  } else if (specialsSection) {
    specialsSection.style.display = "none";
  }

  let faqsSection = document.getElementById("cmsAreaFaqsSection");
  const localFaqs = faqsData && Array.isArray(faqsData.items)
    ? hammerSortByDisplayOrder(faqsData.items.filter(item => hammerContentIsLive(item) && item.showOnAreaPages === true && hammerItemMatchesArea(item, area.slug)))
    : [];
  if (area.showAreaFaqs && localFaqs.length) {
    if (!faqsSection) {
      faqsSection = document.createElement("section");
      faqsSection.id = "cmsAreaFaqsSection";
      faqsSection.className = "section fade-up cms-area-faqs";
      main.insertBefore(faqsSection, insertBefore);
    }
    faqsSection.style.display = "";
    faqsSection.innerHTML = `
      <div class="cms-section-heading"><h2>${hammerEscape(area.faqsHeading || `${area.name || "Local"} Common Questions`)}</h2></div>
      <div class="faq-container">${localFaqs.map(item => `
        <div class="faq-item">
          <button class="faq-question" type="button">${hammerEscape(item.question)}<span class="faq-icon">+</span></button>
          <div class="faq-answer"><p>${hammerEscape(item.answer)}</p></div>
        </div>`).join("")}</div>`;
    faqsSection.querySelectorAll(".faq-question").forEach(button => button.addEventListener("click", () => {
      button.classList.toggle("active");
      const answer = button.nextElementSibling;
      if (answer) answer.style.maxHeight = button.classList.contains("active") ? `${answer.scrollHeight}px` : null;
    }));
    let faqSchema = document.getElementById("cmsAreaFaqStructuredData");
    if (!faqSchema) {
      faqSchema = document.createElement("script");
      faqSchema.id = "cmsAreaFaqStructuredData";
      faqSchema.type = "application/ld+json";
      document.head.appendChild(faqSchema);
    }
    faqSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: localFaqs.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer }
      }))
    });
  } else if (faqsSection) {
    faqsSection.style.display = "none";
    const faqSchema = document.getElementById("cmsAreaFaqStructuredData");
    if (faqSchema) faqSchema.remove();
  }
}

function hammerApplyAreaSectionOrder(area) {
  if (!area || !Array.isArray(area.sectionOrder) || !area.sectionOrder.length) return;
  const main = document.querySelector("main");
  if (!main) return;
  const gallery = main.querySelector('[data-cms-area-gallery="true"]');
  const sections = {
    main: main.querySelector(".section.split"),
    body: document.getElementById("cmsAreaBodySection"),
    gallery,
    projects: document.getElementById("cmsProjectsSection"),
    reviews: document.getElementById("cmsAreaReviewsSection"),
    specials: document.getElementById("cmsAreaSpecialsSection"),
    faqs: document.getElementById("cmsAreaFaqsSection"),
    cta: main.querySelector(".section.note-box")
  };
  const anchor = main.querySelector(".micro-summary");
  area.sectionOrder.map(value => String(value || "").trim().toLowerCase()).forEach(key => {
    const section = sections[key];
    if (section && section.parentNode === main) main.insertBefore(section, anchor || null);
  });
}

function hammerProjectMatchesPage(project, slug) {
  if (!hammerContentIsLive(project)) return false;
  if (slug === "home") return project.showOnHomepage === true;
  if (slug === "gallery") return project.showInGallery !== false;
  if (["staten-island", "brooklyn", "queens", "manhattan", "bronx", "new-jersey"].includes(slug)) {
    return project.showOnAreaPage !== false && (project.areaSlug === slug || (Array.isArray(project.areaSlugs) && project.areaSlugs.includes(slug)));
  }
  return project.showOnServicePage !== false && (project.serviceSlug === slug || (Array.isArray(project.serviceSlugs) && project.serviceSlugs.includes(slug)));
}

function hammerRenderProjects(data, currentArea) {
  if (!data || !Array.isArray(data.projects)) return;
  const main = document.querySelector("main");
  if (!main) return;
  const slug = hammerSlug();
  if (currentArea && currentArea.slug === slug && currentArea.showProjects === false) {
    const existing = document.getElementById("cmsProjectsSection");
    if (existing) existing.style.display = "none";
    return;
  }
  const projects = hammerSortByDisplayOrder(data.projects.filter(project => hammerProjectMatchesPage(project, slug)));
  let section = document.getElementById("cmsProjectsSection");
  if (!projects.length) {
    if (section) section.style.display = "none";
    return;
  }

  if (!section) {
    section = document.createElement("section");
    section.id = "cmsProjectsSection";
    section.className = "section fade-up cms-projects-section";
    let anchor = null;
    if (slug === "home") anchor = document.getElementById("serviceAreaSection");
    else if (["staten-island", "brooklyn", "queens", "manhattan", "bronx", "new-jersey"].includes(slug)) anchor = main.querySelector(".section.note-box");
    else anchor = main.querySelector(".faq-section") || main.querySelector(".micro-summary");
    const parent = anchor && anchor.parentNode ? anchor.parentNode : main;
    parent.insertBefore(section, anchor || null);
  }

  section.style.display = "";
  section.innerHTML = `
    <div class="cms-section-heading">
      <h2>${hammerEscape((currentArea && currentArea.projectsHeading) || data.heading || "Recent Projects")}</h2>
      ${data.intro ? `<p>${hammerEscape(data.intro)}</p>` : ""}
    </div>
    <div class="cms-project-grid">${projects.map(project => {
      const stages = hammerProjectStages(project, project.imageAlt || project.title || "Completed project");
      const loosePhotos = [project.coverImage, ...(Array.isArray(project.additionalImages) ? project.additionalImages : [])].filter(Boolean);
      const location = [project.neighborhood, project.areaLabel].filter(Boolean).join(", ");
      const alt = project.imageAlt || project.title || "Completed project";
      const photoMarkup = stages.length
        ? hammerRenderStageViewer(project, alt)
        : (loosePhotos.length ? `<div class="cms-project-images">${loosePhotos.map((photo, index) => `<figure><img src="${hammerEscape(photo)}" alt="${hammerEscape(`${alt}${loosePhotos.length > 1 ? ` — photo ${index + 1}` : ""}`)}" loading="lazy"></figure>`).join("")}</div>` : "");
      return `<article class="cms-project-card${project.featured ? " is-featured" : ""}">
        ${project.featured ? `<span class="cms-project-badge">Featured Project</span>` : ""}
        ${photoMarkup}
        <div class="cms-project-content">
          <h3>${hammerEscape(project.title)}</h3>
          ${project.showProjectDate === true && project.projectDate ? `<p class="cms-project-date">${hammerEscape(project.projectDate)}</p>` : ""}
          ${project.showLocation !== false && (location || project.serviceLabel) ? `<p class="cms-project-meta">${hammerEscape([project.serviceLabel, location].filter(Boolean).join(" · "))}</p>` : ""}
          ${project.showSummary !== false && project.summary ? `<p>${hammerEscape(project.summary)}</p>` : ""}
          ${project.showReview !== false && project.reviewQuote ? `<blockquote class="cms-project-review">“${hammerEscape(project.reviewQuote)}”${project.reviewName ? `<footer>— ${hammerEscape(project.reviewName)}</footer>` : ""}</blockquote>` : ""}
          ${project.showCta !== false && project.ctaText ? `<a class="btn ghost cms-project-cta" href="${hammerEscape(project.ctaUrl || "/contact.html")}">${hammerEscape(project.ctaText)}</a>` : ""}
        </div>
      </article>`;
    }).join("")}</div>`;
  hammerBindStageViewers(section);
}

function hammerRenderDownloads(data) {
  if (hammerSlug() !== "downloads" || !data || !Array.isArray(data.downloads)) return;
  const main = document.querySelector("main");
  const grid = main && main.querySelector(".downloads-grid");
  if (!main || !grid) return;
  const hero = main.querySelector(".hero");
  const title = hero && hero.querySelector("h1");
  const intro = hero && hero.querySelector(".hero-content > p");
  if (title && data.heading) title.textContent = data.heading;
  if (intro && data.intro) intro.textContent = data.intro;

  const items = hammerSortByDisplayOrder(data.downloads.filter(item => item && item.active !== false && item.file));
  grid.innerHTML = items.map(item => `<article class="download-card${item.featured ? " is-featured" : ""}">
    ${item.badge ? `<span class="badge-popular">${hammerEscape(item.badge)}</span>` : ""}
    <div class="doc-icon">${hammerEscape(item.icon || "📄")}</div>
    <h3>${hammerEscape(item.title)}</h3>
    <p>${hammerEscape(item.description)}</p>
    <a class="download-btn" download href="${hammerEscape(item.file)}">📥 ${hammerEscape(item.buttonText || "Download PDF")}</a>
  </article>`).join("");
}

function hammerRenderSignatureServices(data) {
  if (hammerSlug() !== "home" || !data || !Array.isArray(data.services)) return;
  const container = document.querySelector(".services-glow-container");
  const grid = container && container.querySelector(".glow-grid");
  if (!container || !grid) return;
  const heading = container.querySelector("h3");
  if (heading && data.heading) heading.textContent = data.heading;
  const services = data.services.filter(service => service && service.active !== false && service.showOnHomepage !== false);
  grid.innerHTML = services.map((service, index) => {
    const styles = ["gold", "white", "blue", "cyan", "green", "red"];
    const style = styles.includes(service.style) ? service.style : (index % 2 ? "gold" : "white");
    return `<a class="glow-card style-${style}" href="${hammerEscape(service.url || "/services.html")}">
      <span class="glow-icon" aria-hidden="true">◆</span><span>${hammerEscape(service.title)}</span>
    </a>`;
  }).join("");
}

function hammerRenderFaqPage(data) {
  if (hammerSlug() !== "faq" || !data || !Array.isArray(data.items)) return;
  const container = document.querySelector(".faq-container");
  if (!container) return;
  const items = [...data.items].filter(hammerContentIsLive).sort((a, b) => {
    const categoryDifference = (Number(a.categoryOrder) || 9999) - (Number(b.categoryOrder) || 9999);
    return categoryDifference || (Number(a.displayOrder) || 9999) - (Number(b.displayOrder) || 9999);
  });
  const groups = new Map();
  items.forEach(item => {
    const category = item.category || "General";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  });
  container.innerHTML = Array.from(groups.entries()).map(([category, group]) => `
    <h3 class="faq-category">${hammerEscape(category)}</h3>
    ${group.map(item => `
      <div class="faq-item">
        <button class="faq-question" type="button">${hammerEscape(item.question)}<span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>${hammerEscape(item.answer)}</p></div>
      </div>`).join("")}`).join("");
  container.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      const answer = button.nextElementSibling;
      if (answer) answer.style.maxHeight = button.classList.contains("active") ? answer.scrollHeight + "px" : null;
    });
  });
  let schema = document.getElementById("cmsFaqStructuredData");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "cmsFaqStructuredData";
    schema.type = "application/ld+json";
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  });
}

function hammerRenderReviewsPage(data) {
  if (hammerSlug() !== "reviews" || !data || !Array.isArray(data.reviews)) return;
  const section = document.querySelector("main .section.content-wrapper");
  if (!section) return;
  const reviews = [...data.reviews]
    .filter(item => hammerContentIsLive(item) && item.showOnReviewPage !== false)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (Number(a.displayOrder) || 9999) - (Number(b.displayOrder) || 9999));
  section.innerHTML = `
    <div id="cmsReviewsPage">
      <div style="text-align:center;max-width:760px;margin:0 auto 30px;">
        ${data.eyebrow ? `<p class="review-eyebrow">${hammerEscape(data.eyebrow)}</p>` : ""}
        ${data.heading ? `<h2>${hammerEscape(data.heading)}</h2>` : ""}
      </div>
      ${reviews.map(item => `
        <article class="review-feature">
          <div class="watermark-icon">“</div>
          <div class="star-row">${"★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))} <span class="verified-tag">${hammerEscape(item.source || "Customer Review")}</span></div>
          <div class="review-text">“${hammerEscape(item.review)}”</div>
          <div class="author-block">
            <div class="author-initial">${hammerEscape(String(item.name || "C").charAt(0).toUpperCase())}</div>
            <div class="author-details"><h4>${hammerEscape(item.name)}</h4><span>${hammerEscape(item.service || "Home Improvement")}</span></div>
          </div>
        </article>`).join("")}
      <div class="reviews-cta">
        <h3 class="shimmer-title" style="font-size:26px;margin-bottom:15px;">Share Your Experience</h3>
        <a class="btn gold-btn" href="${hammerEscape(data.reviewUrl || "/contact.html")}" target="_blank" rel="noopener">Write a Google Review</a>
      </div>
    </div>`;
}

function hammerSpecialIsCurrent(item) {
  return hammerContentIsLive(item, "startDate", "endDate");
}

function hammerRenderSpecialCards(items) {
  return items.map(item => {
    const accent = /^#[0-9a-f]{3,8}$/i.test(item.accentColor || "") ? item.accentColor : "#e7bf63";
    const badgeText = /^#[0-9a-f]{3,8}$/i.test(item.badgeTextColor || "") ? item.badgeTextColor : "#ffffff";
    const features = Array.isArray(item.features) ? item.features : [];
    const addons = Array.isArray(item.addons) ? item.addons : [];
    return `<article class="special-card" style="border-top:4px solid ${accent};">
      <div class="special-tag" style="background:${accent};color:${badgeText};">${hammerEscape(item.badge || "Special")}</div>
      <h3>${hammerEscape(item.title)}</h3>
      <div class="special-price">${hammerEscape(item.price)}</div>
      <p class="special-desc">${hammerEscape(item.description)}</p>
      <ul class="bullets">${features.map(feature => `<li>${feature.bold ? "<strong>" : ""}${hammerEscape(feature.text)}${feature.bold ? "</strong>" : ""}</li>`).join("")}</ul>
      ${addons.length ? `<div class="special-addons"><h4>Popular Add-Ons</h4><ul class="addon-list">${addons.map(addon => `<li><span>${hammerEscape(addon.name)}</span><span class="addon-price">${hammerEscape(addon.price)}</span></li>`).join("")}</ul></div>` : ""}
      ${item.requirements ? `<div class="special-protection"><strong>Client Requirements:</strong> ${hammerEscape(item.requirements)}</div>` : ""}
      <a class="btn" href="/contact.html">${hammerEscape(item.buttonText || "Ask About This Special")}</a>
    </article>`;
  }).join("");
}

function hammerRenderSpecialsPage(data) {
  if (hammerSlug() !== "monthly-specials" || !data || !Array.isArray(data.specials)) return;
  const grid = document.querySelector("main .specials-grid");
  if (!grid) return;
  const section = grid.closest("section");
  const heading = section && section.querySelector("h2");
  const intro = section && section.querySelector("h2 + p");
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.subheading) intro.textContent = data.subheading;
  const visibleSpecials = [...data.specials]
    .filter(hammerSpecialIsCurrent)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (Number(a.displayOrder) || 9999) - (Number(b.displayOrder) || 9999));
  grid.innerHTML = hammerRenderSpecialCards(visibleSpecials);
}

function hammerApplyHeaderSettings(data) {
  if (!data) return;
  hammerEnsureAdminStyles();

  const wrapper = document.getElementById("header-include");
  const topbar = document.querySelector(".topbar");
  if (wrapper) wrapper.dataset.cmsSticky = data.sticky === false ? "false" : "true";
  if (topbar) {
    topbar.dataset.headerSize = data.size === "compact" ? "compact" : "comfortable";
    topbar.dataset.cmsBackground = ["solid", "dark", "gold"].includes(data.backgroundStyle) ? data.backgroundStyle : "glass";
  }

  const mobile = data.mobile && typeof data.mobile === "object" ? data.mobile : {};
  const logo = document.querySelector(".brand-logo");
  if (logo) {
    logo.style.display = "";
    logo.dataset.cmsDesktopVisible = data.showLogo === false ? "false" : "true";
    logo.dataset.cmsMobileVisible = (typeof mobile.showLogo === "boolean" ? mobile.showLogo : data.showLogo !== false) ? "true" : "false";
  }
  const tagline = document.querySelector(".brand-sub");
  if (tagline) {
    tagline.style.display = "";
    tagline.dataset.cmsDesktopVisible = data.showTagline === false ? "false" : "true";
    tagline.dataset.cmsMobileVisible = (typeof mobile.showTagline === "boolean" ? mobile.showTagline : data.showTagline !== false) ? "true" : "false";
  }

  const controls = {
    home: ["showHome", "homeLabel", "Home"],
    services: ["showServices", "servicesLabel", "What We Do"],
    portfolio: ["showPortfolio", "portfolioLabel", "Portfolio"],
    reviews: ["showReviews", "reviewsLabel", "Client Reviews"],
    pricing: ["showPricing", "pricingLabel", "Pricing & Estimates"],
    specials: ["showSpecials", "specialsLabel", "Seasonal Offers"],
    more: ["showMore", "moreLabel", "More"],
    areas: ["showAreas", "areasLabel", "Service Areas"],
    contact: ["showContact", "contactLabel", "Get in Touch"]
  };

  Object.entries(controls).forEach(([key, [showField, labelField, fallback]]) => {
    const item = document.querySelector(`[data-nav-item="${key}"]`);
    if (!item) return;
    item.style.display = "";
    const desktopVisible = data[showField] !== false;
    item.dataset.cmsDesktopVisible = desktopVisible ? "true" : "false";
    item.dataset.cmsMobileVisible = (typeof mobile[showField] === "boolean" ? mobile[showField] : desktopVisible) ? "true" : "false";
    const label = String(data[labelField] || fallback);
    if (item.matches("a")) item.textContent = label;
    else {
      const button = item.querySelector(".dropbtn");
      if (button) button.textContent = `${label} ▾`;
    }
  });

  const mainNav = document.querySelector(".main-nav");
  const shortcuts = {
    call: {
      showField: "showPhoneShortcut",
      labelField: "phoneShortcutLabel",
      fallback: "Call",
      href: "tel:+19295955300"
    },
    text: {
      showField: "showTextShortcut",
      labelField: "textShortcutLabel",
      fallback: "Text",
      href: "sms:+19295955300"
    },
    estimate: {
      showField: "showEstimateShortcut",
      labelField: "estimateShortcutLabel",
      fallback: "Free Estimate",
      href: "/project-estimator.html"
    }
  };

  if (mainNav) {
    Object.entries(shortcuts).forEach(([key, settings]) => {
      const desktopVisible = data[settings.showField] === true;
      const mobileVisible = mobile[settings.showField] === true;
      let link = mainNav.querySelector(`[data-cms-header-shortcut="${key}"]`);
      if (!link && (desktopVisible || mobileVisible)) {
        link = document.createElement("a");
        link.dataset.cmsHeaderShortcut = key;
        link.dataset.navItem = key;
        mainNav.appendChild(link);
      }
      if (!link) return;
      link.href = settings.href;
      link.textContent = String(data[settings.labelField] || settings.fallback);
      link.dataset.cmsDesktopVisible = desktopVisible ? "true" : "false";
      link.dataset.cmsMobileVisible = mobileVisible ? "true" : "false";
    });

    const preferredOrder = Array.isArray(data.navigationOrder) ? data.navigationOrder : [];
    Array.from(mainNav.children).forEach((item, index) => {
      const key = item.dataset.navItem || item.querySelector("[data-nav-item]")?.dataset.navItem || item.querySelector("[data-cms-header-shortcut]")?.dataset.cmsHeaderShortcut;
      const position = preferredOrder.indexOf(key);
      if (position >= 0) item.style.order = String(position);
      else if (preferredOrder.length) item.style.order = String(preferredOrder.length + index);
    });
  }
}

function refreshHammerContentControls() {
  return Promise.all([
    hammerFetchJson("/site-data/pages.json"),
    hammerFetchJson("/site-data/areas.json"),
    hammerFetchJson("/site-data/services.json"),
    hammerFetchJson("/site-data/homepage.json"),
    hammerFetchJson("/site-data/faqs.json"),
    hammerFetchJson("/site-data/reviews.json"),
    hammerFetchJson("/site-data/specials.json"),
    hammerCurrentAreaDetail(),
    hammerFetchJson("/site-data/header.json"),
    hammerFetchJson("/site-data/projects.json"),
    hammerFetchJson("/site-data/downloads.json")
  ]).then(([pages, areas, services, homepage, faqs, reviews, specials, areaDetail, header, projects, downloads]) => {
    hammerApplyPageControls(pages);
    hammerApplyAreaControls(areas, areaDetail);
    const currentArea = areas && Array.isArray(areas.areas)
      ? hammerMergeAreaDetail(areas.areas.find(item => item && item.slug === hammerSlug()), areaDetail)
      : null;
    hammerRenderAreaExtras(currentArea, reviews, specials, faqs);
    hammerRenderHomeAreas(areas, homepage);
    hammerRenderSignatureServices(services);
    hammerRenderFaqPage(faqs);
    hammerRenderReviewsPage(reviews);
    hammerRenderSpecialsPage(specials);
    hammerRenderProjects(projects, currentArea);
    hammerApplyAreaSectionOrder(currentArea);
    hammerRenderDownloads(downloads);
    hammerApplyHeaderSettings(header);
  });
}

document.addEventListener("DOMContentLoaded", refreshHammerContentControls);

document.addEventListener("DOMContentLoaded", () => {
  const includes = [document.getElementById("header-include"), document.getElementById("footer-include")].filter(Boolean);
  if (!includes.length || typeof MutationObserver === "undefined") return;
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      Promise.all([
        hammerFetchJson("/site-data/pages.json"),
        hammerFetchJson("/site-data/areas.json"),
        loadHammerBusinessSettings(),
        hammerCurrentAreaDetail(),
        hammerFetchJson("/site-data/header.json")
      ]).then(([pages, areas, business, areaDetail, header]) => {
        hammerApplyPageControls(pages);
        hammerApplyAreaControls(areas, areaDetail);
        applyHammerBusinessSettings(business);
        hammerApplyHeaderSettings(header);
        initHeaderInteractions();
      });
    });
  });
  includes.forEach(element => observer.observe(element, { childList: true }));
});


/* ============================================================
   HAMMER BRICK PUBLIC BUSINESS SETTINGS
   One public JSON file controls phone/email/header/footer details.
=============================================================== */

let hammerBusinessSettingsPromise = null;

function normalizeDialNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? "+1" + digits : "+" + digits;
}

function loadHammerBusinessSettings() {
  if (!hammerBusinessSettingsPromise) {
    hammerBusinessSettingsPromise = fetch("/site-data/business.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }
  return hammerBusinessSettingsPromise;
}

function hammerInstallAnalytics(data) {
  const gaId = String(data.googleAnalyticsId || "").trim().toUpperCase();
  if (/^G-[A-Z0-9]+$/.test(gaId) && !document.getElementById("cmsGoogleAnalytics")) {
    const external = document.createElement("script");
    external.id = "cmsGoogleAnalytics";
    external.async = true;
    external.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(external);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }

  const clarityId = String(data.clarityId || "").trim().toLowerCase();
  if (/^[a-z0-9]+$/.test(clarityId) && !clarityId.includes("your") && !document.getElementById("cmsMicrosoftClarity")) {
    const clarity = document.createElement("script");
    clarity.id = "cmsMicrosoftClarity";
    clarity.async = true;
    clarity.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`;
    document.head.appendChild(clarity);
  }
}

function hammerRememberLeadSource(data) {
  if (data.captureUtmSource === false) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const source = {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || ""
    };
    if (source.source || source.medium || source.campaign) {
      sessionStorage.setItem("hammerLeadSource", JSON.stringify(source));
    }
  } catch (_) {
    // Browsing still works if storage is unavailable.
  }
}

let hammerLastLeadEvent = { type: "", time: 0 };

function hammerTrackLeadClick(type) {
  const body = document.body;
  if (!body || body.dataset.cmsLeadTracking !== "true") return;
  if (type === "call" && body.dataset.cmsTrackCall !== "true") return;
  if (type === "text" && body.dataset.cmsTrackText !== "true") return;
  if (["estimate", "email"].includes(type) && body.dataset.cmsTrackEstimate !== "true") return;
  const now = Date.now();
  if (hammerLastLeadEvent.type === type && now - hammerLastLeadEvent.time < 1000) return;
  hammerLastLeadEvent = { type, time: now };

  let source = {};
  try { source = JSON.parse(sessionStorage.getItem("hammerLeadSource") || "{}"); } catch (_) { source = {}; }
  const details = {
    lead_type: type,
    page_path: window.location.pathname,
    lead_source: source.source || "direct",
    lead_medium: source.medium || "",
    lead_campaign: source.campaign || ""
  };
  if (typeof window.gtag === "function") window.gtag("event", "generate_lead", details);
  if (typeof window.clarity === "function") window.clarity("event", `lead_${type}`);
}

function hammerRenderSitewideAnnouncement(data) {
  let announcement = document.getElementById("cmsSitewideAnnouncement");
  const enabled = data.sitewideAnnouncementEnabled === true && String(data.sitewideAnnouncementText || "").trim();
  if (!enabled) {
    if (announcement) announcement.style.display = "none";
    return;
  }
  if (!announcement) {
    announcement = document.createElement("div");
    announcement.id = "cmsSitewideAnnouncement";
    announcement.className = "cms-site-announcement";
    const header = document.getElementById("header-include");
    if (header && header.parentNode) header.parentNode.insertBefore(announcement, header.nextSibling);
    else document.body.insertBefore(announcement, document.body.firstChild);
  }
  announcement.style.display = "";
  announcement.innerHTML = `${hammerEscape(data.sitewideAnnouncementText)}${data.sitewideAnnouncementButtonText ? ` <a href="${hammerEscape(data.sitewideAnnouncementButtonUrl || "/contact.html")}">${hammerEscape(data.sitewideAnnouncementButtonText)}</a>` : ""}`;
}

function applyHammerBusinessSettings(data) {
  if (!data) return;
  hammerEnsureAdminStyles();
  hammerInstallAnalytics(data);
  hammerRenderSitewideAnnouncement(data);
  hammerRememberLeadSource(data);
  document.body.dataset.cmsLeadTracking = data.leadTrackingEnabled === false ? "false" : "true";
  document.body.dataset.cmsTrackCall = data.trackCallClicks === false ? "false" : "true";
  document.body.dataset.cmsTrackText = data.trackTextClicks === false ? "false" : "true";
  document.body.dataset.cmsTrackEstimate = data.trackEstimateClicks === false ? "false" : "true";

  const dial = normalizeDialNumber(data.phone);
  if (dial) {
    document.querySelectorAll('a[href^="tel:"]:not([data-cms-area-phone])').forEach(a => a.href = "tel:" + dial);
    document.querySelectorAll('a[href^="sms:"]:not([data-cms-area-phone])').forEach(a => a.href = "sms:" + dial);
  }
  if (data.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.href = "mailto:" + data.email);
  }

  if (data.googleReviewsUrl) {
    const reviewLinks = [
      document.getElementById("googleReviewsLink"),
      ...document.querySelectorAll(".reviews-cta a")
    ].filter(Boolean);
    reviewLinks.forEach(link => link.href = data.googleReviewsUrl);
  }

  const brandName = document.querySelector(".brand-name");
  if (brandName && data.businessName) brandName.textContent = data.businessName;

  const brandSub = document.querySelector(".brand-sub");
  if (brandSub && data.headerTagline) brandSub.textContent = data.headerTagline;

  const stickyContact = document.querySelector(".sticky-quick-btn");
  if (stickyContact) stickyContact.style.display = data.showStickyContact === false ? "none" : "";

  const quickHeading = document.querySelector("#quick-contact-panel h2");
  if (quickHeading && data.contactPanelHeading) quickHeading.textContent = data.contactPanelHeading;

  const footer = document.querySelector(".site-footer");
  if (footer) {
    const footerQuickLinks = footer.querySelector('nav[aria-label="Quick Links"]');
    if (footerQuickLinks) footerQuickLinks.style.display = data.showFooterQuickLinks === false ? "none" : "";

    const footerSocials = footer.querySelector(".social-links");
    if (footerSocials) footerSocials.style.display = data.showSocialLinks === false ? "none" : "flex";

    const copyrightStrong = footer.querySelector("div strong");
    if (copyrightStrong && data.businessName) copyrightStrong.textContent = data.businessName;

    footer.querySelectorAll("div").forEach(div => {
      const text = div.textContent.trim();
      if (text.startsWith("Serving:") && Array.isArray(data.serviceAreas)) {
        div.dataset.cmsFooterSection = "service-areas";
        div.innerHTML = "Serving: " + data.serviceAreas.map(x => `<strong>${String(x)}</strong>`).join(" · ");
      }
      if (text.includes("Licensed, Bonded & Insured") && data.epaLabel) {
        div.dataset.cmsFooterSection = "licenses";
        div.textContent = `Licensed, Bonded & Insured · ${data.epaLabel}`;
      }
      if (data.footerTagline && text.includes("Luxury Remodeling") && text.includes("Custom Brickwork")) {
        div.dataset.cmsFooterSection = "tagline";
        div.textContent = data.footerTagline;
      }
    });

    const serviceAreas = footer.querySelector('[data-cms-footer-section="service-areas"]');
    if (serviceAreas) serviceAreas.style.display = data.showFooterServiceAreas === false ? "none" : "";
    const footerTagline = footer.querySelector('[data-cms-footer-section="tagline"]');
    if (footerTagline) footerTagline.style.display = data.showFooterTagline === false ? "none" : "";
    const footerLicenseLine = footer.querySelector('[data-cms-footer-section="licenses"]');
    if (footerLicenseLine) footerLicenseLine.style.display = data.showFooterLicenses === false ? "none" : "";

    const licenseSpan = Array.from(footer.querySelectorAll("span")).find(
      s => s.textContent.includes("NYC HIC") || s.textContent.includes("NJ HIC")
    );
    if (licenseSpan) {
      const parts = [];
      if (data.nycHic) parts.push(`NYC HIC #${data.nycHic}`);
      if (data.njHic) parts.push(`NJ HIC #${data.njHic}`);
      licenseSpan.textContent = parts.join(" · ");
      licenseSpan.style.display = data.showFooterLicenses === false ? "none" : "";
    }

    const socialMap = {
      "Facebook": data.facebook,
      "Instagram": data.instagram,
      "YouTube": data.youtube
    };
    Object.entries(socialMap).forEach(([label, url]) => {
      const a = footer.querySelector(`a[aria-label="${label}"]`);
      if (a && url) a.href = url;
    });
  }

  // Update homepage trust wording where the existing IDs/classes are present.
  const home = document.getElementById("main");
  if (home) {
    document.querySelectorAll(".trust-pills li").forEach(li => {
      if (data.nycHic && li.textContent.includes("HIC #")) {
        li.textContent = li.textContent.replace(/HIC\s*#\s*\d+/i, `HIC #${data.nycHic}`);
      }
      if (data.epaLabel && /EPA Lead-Safe/i.test(li.textContent)) {
        li.textContent = data.epaLabel + (li.textContent.includes("Pre-1978") ? " (Pre-1978 Homes)" : "");
      }
    });
  }
}

function refreshHammerBusinessSettings() {
  return loadHammerBusinessSettings().then(applyHammerBusinessSettings);
}

document.addEventListener("DOMContentLoaded", refreshHammerBusinessSettings);

document.addEventListener("click", event => {
  const link = event.target.closest("a[href], button");
  if (!link) return;
  const href = String(link.getAttribute("href") || "").toLowerCase();
  const label = String(link.textContent || "").toLowerCase();
  if (href.startsWith("tel:")) hammerTrackLeadClick("call");
  else if (href.startsWith("sms:")) hammerTrackLeadClick("text");
  else if (href.startsWith("mailto:")) hammerTrackLeadClick("email");
  else if (href.includes("contact.html") || href.includes("project-estimator.html") || /estimate|contact|book/.test(label)) hammerTrackLeadClick("estimate");
});

document.addEventListener("submit", event => {
  if (event.target && event.target.matches("form")) hammerTrackLeadClick("estimate");
});


/* ============================================================
   AUTO-INCLUDE HEADER & FOOTER
   (Fixed: Initializes Menu AFTER Header loads)
=============================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const headerEl = document.getElementById("header-include");
  const footerEl = document.getElementById("footer-include");

  if (headerEl) {
    Promise.all([
      fetch("/header.html", { cache: "no-store" }).then(r => r.text()),
      fetch("/footer.html", { cache: "no-store" }).then(r => r.text())
    ]).then(([header, footer]) => {
      headerEl.innerHTML = header;
      footerEl.innerHTML = footer;
      
      // ✅ FIXED: Initialize menu here, once header is in DOM
      initHeaderInteractions();
      refreshHammerBusinessSettings();
      refreshHammerContentControls();
    });
  }
});

/* ============================================================
   ⭐ FINAL VERSION — ONLY GLOBAL STICKY CONTACT BUTTON
=============================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(".sticky-quick-btn")) {

    // Sticky Button
    const sticky = document.createElement("button");
    sticky.className = "sticky-quick-btn";
    sticky.innerHTML = "💬 Contact";
    sticky.style.zIndex = "99999";
    document.body.appendChild(sticky);

    // Contact Panel
    const panel = document.createElement("div");
    panel.id = "quick-contact-panel";
    panel.className = "quick-contact-panel";
    panel.style.display = "none";
    panel.style.zIndex = "99998";

    panel.innerHTML = `
      <div class="quick-contact-inner">
        <button class="quick-close">×</button>
        <h2>Quick Contact</h2>
        <ul>
          <li><a href="tel:+19295955300">📞 Call Now</a></li>
          <li><a href="sms:+19295955300">💬 Text Us</a></li>
          <li><a href="mailto:hammerbrickhome@gmail.com">✉️ Email Us</a></li>
          <li><a href="/project-estimator.html">🧮 Free Estimate</a></li>
          <li><a href="/contact.html">📝 Contact Form</a></li>
          <li><a href="sms:+19295955300">📷 Send Photos</a></li>
        </ul>
      </div>
    `;

    document.body.appendChild(panel);
    refreshHammerBusinessSettings();

    /* Open panel ONLY this one */
    sticky.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.style.display = "flex";
    });

    /* Close */
    panel.addEventListener("click", (e) => {
      if (e.target === panel) panel.style.display = "none";
    });

    panel.querySelector(".quick-close").addEventListener("click", () => {
      panel.style.display = "none";
    });
  }
});
