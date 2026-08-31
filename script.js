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

  // Keep Additional Photos inside the same project viewer when staged photos
  // are enabled. Previously these photos were saved by Pages CMS but hidden.
  const visibleStageImages = new Set(stages.map(stage => stage.image));
  const additionalImages = stages.length && Array.isArray(item.additionalImages)
    ? item.additionalImages.filter(image => image && !visibleStageImages.has(image))
    : [];
  additionalImages.forEach((image, index) => {
    const label = additionalImages.length > 1 ? `More Photo ${index + 1}` : "More Photo";
    stages.push({ image, label, alt: `${fallbackAlt} — ${label}` });
    visibleStageImages.add(image);
  });
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
    .cms-project-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),680px));justify-content:center}
    .cms-stage-viewer{border:1px solid rgba(231,191,99,.24);border-radius:14px;overflow:hidden;background:rgba(5,12,22,.55)}
    .cms-stage-buttons{display:flex;gap:7px;flex-wrap:wrap;padding:10px;background:rgba(5,12,22,.92)}
    .cms-stage-buttons button{appearance:none;border:1px solid rgba(231,191,99,.45);background:transparent;color:#fff;border-radius:999px;padding:8px 13px;font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}
    .cms-stage-buttons button[aria-selected="true"]{background:var(--gold,#c99a2e);border-color:var(--gold,#c99a2e);color:#07111f}
    .cms-stage-panels figure,.cms-stage-grid figure{margin:0;position:relative}
    .cms-stage-panels,.cms-stage-grid{background:#050c16}
    .cms-stage-panels img,.cms-stage-grid img{display:block;width:100%;height:380px;object-fit:contain;background:#050c16}
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
      .cms-stage-panels img,.cms-stage-grid img{height:260px;min-height:0}
      .cms-page-block-image{grid-template-columns:1fr}
      .cms-page-block-image img,.cms-page-block-gallery img{height:auto;min-height:220px}
    }
    @media(max-width:520px){
      .cms-project-grid{grid-template-columns:1fr}
      .cms-stage-buttons{gap:6px;padding:9px}
      .cms-stage-buttons button{padding:7px 10px;font-size:.76rem}
      .cms-stage-panels img,.cms-stage-grid img{height:225px}
    }
  `;
  document.head.appendChild(style);
}

function hammerEnsureHomepageLayoutStyles() {
  if (document.getElementById("cmsHomepageLayoutStyles")) return;
  const style = document.createElement("style");
  style.id = "cmsHomepageLayoutStyles";
  style.textContent = `
    body[data-home-layout]:not([data-home-layout="classic"]){min-height:100%;}
    body[data-home-layout]:not([data-home-layout="classic"]) #main{
      width:100%;max-width:none;margin:0;padding:0;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #main>.gold-divider{display:none}
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell{
      width:min(100%,1380px);margin:0 auto;padding:38px 28px 88px;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>.section,
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>.hb-home-band,
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>#premiumMaterialsSection{
      margin-bottom:72px;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-band{
      display:grid;gap:28px;align-items:start;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-band>.section{margin:0;min-width:0}
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions{
      position:relative;z-index:4;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;
      width:min(100%,1120px);margin:-42px auto 72px;padding:14px;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions a{
      min-height:84px;display:grid;grid-template-columns:38px minmax(0,1fr);grid-template-rows:auto auto;
      column-gap:10px;align-content:center;padding:15px 14px;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions a:hover{transform:translateY(-3px)}
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions span{
      grid-row:1/3;align-self:center;font-size:25px;line-height:1;text-align:center;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions strong{font-size:13px;line-height:1.25}
    body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions small{margin-top:4px;font-size:10px;line-height:1.3;opacity:.72}
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero{
      position:relative;isolation:isolate;overflow:hidden;margin:20px 0 72px!important;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-overlay{display:none}
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content,
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-badge{position:relative;z-index:2}
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content{
      margin:0;padding:0;max-width:none;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content h1{
      font-size:clamp(2.55rem,5.4vw,5.25rem);line-height:.98;letter-spacing:-.045em;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content p{
      max-width:720px;font-size:1.02rem;line-height:1.75;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-actions .btn{
      padding:14px 24px;font-size:.9rem;
    }
    body[data-home-layout]:not([data-home-layout="classic"]) #premiumMaterialsSection{
      margin-top:-38px!important;padding:20px 24px!important;
    }

    /* 2 — REVIEW-FIRST POMEGRANATE SIGNATURE: jewel-red centerpiece with pearl proof cards. */
    body[data-home-layout="luxury"]{
      --bg:#f7f3f2;--bg-alt:#fffdfc;--ink:#242124;--muted:#6f6569;--gold:#a10f3b;--gold-soft:#77102f;
      background:#f7f3f2;color:var(--ink);
    }
    body[data-home-layout="luxury"]::before{
      background:radial-gradient(circle at 50% 4%,rgba(190,18,71,.12),transparent 30rem),radial-gradient(circle at 90% 45%,rgba(161,15,59,.07),transparent 25rem);
      animation:none;
    }
    body[data-home-layout="luxury"] .topbar{background:rgba(30,28,30,.98)!important;border-bottom:4px solid #be1247!important}
    body[data-home-layout="luxury"] .topbar .brand-lockup,
    body[data-home-layout="luxury"] .topbar .main-nav a,
    body[data-home-layout="luxury"] .topbar .dropbtn{color:#fff!important}
    body[data-home-layout="luxury"] .topbar .dropdown-content{background:#242124!important}
    body[data-home-layout="luxury"] .site-footer{background:#211e20;color:#fff;border-color:#be1247}
    body[data-home-layout="luxury"] .hb-home-layout-shell{width:min(100%,1320px);padding-top:28px}
    body[data-home-layout="luxury"] #homeHero{
      min-height:660px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
      padding:78px 70px 64px;border:0;border-radius:38px;text-align:center;
      background:radial-gradient(circle at 50% -20%,#dc315f 0%,#a10f3b 42%,#6f0927 100%);
      box-shadow:0 34px 85px rgba(84,6,31,.28);
    }
    body[data-home-layout="luxury"] #homeHero::before{
      content:"PRIDE  •  QUALITY  •  INTEGRITY";position:absolute;top:27px;left:30px;right:30px;
      color:#ffd8e2;font-size:10px;font-weight:900;letter-spacing:.24em;text-align:center;
    }
    body[data-home-layout="luxury"] #homeHero::after{
      content:"";position:absolute;inset:0;z-index:0;opacity:.26;pointer-events:none;
      background-image:radial-gradient(circle,rgba(255,255,255,.32) 0 2px,transparent 3px);background-size:42px 42px;
      mask-image:linear-gradient(90deg,transparent,black 48%,transparent);
    }
    body[data-home-layout="luxury"] #homeHero .hero-badge{order:-1}
    body[data-home-layout="luxury"] #homeHero .hero-badge img{width:128px;height:128px;border:6px solid #fff;border-radius:50%;box-shadow:0 18px 44px rgba(69,4,24,.34)}
    body[data-home-layout="luxury"] #homeHero .hero-content{max-width:970px;text-align:center}
    body[data-home-layout="luxury"] #homeHero .hero-content h1{
      font-family:Georgia,"Times New Roman",serif;font-weight:500;background:none!important;
      -webkit-text-fill-color:#fff!important;color:#fff!important;filter:none;
    }
    body[data-home-layout="luxury"] #homeHero .hero-content p{max-width:760px;margin-left:auto;margin-right:auto;color:#ffe9ee!important}
    body[data-home-layout="luxury"] #homeHero .hero-actions,
    body[data-home-layout="luxury"] #homeHero .trust-pills{justify-content:center}
    body[data-home-layout="luxury"] #homeHero .trust-pills li{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.40);color:#fff}
    body[data-home-layout="luxury"] .btn{border-radius:999px;background:#a10f3b;color:#fff;box-shadow:none}
    body[data-home-layout="luxury"] .btn.ghost{background:#fff;color:#77102f;border:1px solid #a10f3b}
    body[data-home-layout="luxury"] #homeHero .btn{background:#fff;color:#850c32}
    body[data-home-layout="luxury"] #homeHero .btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.76)}
    body[data-home-layout="luxury"] .hb-home-quick-actions{border:0;border-radius:26px;background:#242124;box-shadow:0 24px 58px rgba(36,33,36,.20)}
    body[data-home-layout="luxury"] .hb-home-quick-actions a{color:#242124;border-radius:19px;background:#fffdfc}
    body[data-home-layout="luxury"] .hb-home-quick-actions a:first-child{color:#fff;background:#be1247}
    body[data-home-layout="luxury"] .hb-home-quick-actions strong{font-family:Georgia,"Times New Roman",serif;font-size:15px}
    body[data-home-layout="luxury"] #premiumMaterialsSection{border:1px solid #e8dcdf!important;border-radius:24px!important;background:#fffdfc!important;box-shadow:0 12px 34px rgba(36,33,36,.05)}
    body[data-home-layout="luxury"] #premiumMaterialsSection p,
    body[data-home-layout="luxury"] #premiumMaterialsSection span{color:#4f4549!important}
    body[data-home-layout="luxury"] .hb-luxury-showcase{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
    body[data-home-layout="luxury"] #before-after,
    body[data-home-layout="luxury"] #cmsProjectsSection,
    body[data-home-layout="luxury"] #membershipServicesSection,
    body[data-home-layout="luxury"] #guaranteeSection,
    body[data-home-layout="luxury"] #tiersSection,
    body[data-home-layout="luxury"] #processSection,
    body[data-home-layout="luxury"] #specialsSection,
    body[data-home-layout="luxury"] #serviceAreaSection,
    body[data-home-layout="luxury"] #reviewsSection{
      padding:36px;border:1px solid #e8dcdf;border-radius:28px;background:#fffdfc;box-shadow:0 16px 42px rgba(36,33,36,.06);
    }
    body[data-home-layout="luxury"] #reviewsSection{border:3px solid #be1247;background:linear-gradient(180deg,#fff,#fff5f7)!important;box-shadow:0 24px 64px rgba(161,15,59,.13)!important}
    body[data-home-layout="luxury"] .section h2{font-family:Georgia,"Times New Roman",serif;font-size:clamp(2rem,4vw,3.45rem);font-weight:500;color:#77102f;text-align:left;text-shadow:none}
    body[data-home-layout="luxury"] .section p,
    body[data-home-layout="luxury"] .section li{color:#6f6569}
    body[data-home-layout="luxury"] .tier-card,
    body[data-home-layout="luxury"] .special-card,
    body[data-home-layout="luxury"] .accent-card,
    body[data-home-layout="luxury"] .process-steps li,
    body[data-home-layout="luxury"] .cms-project-card,
    body[data-home-layout="luxury"] #reviewsSection .review-slide,
    body[data-home-layout="luxury"] .faq-section,
    body[data-home-layout="luxury"] .faq-section details{color:#242124;border-radius:22px!important;background:#fff!important;border-color:#e8dcdf!important;box-shadow:0 12px 30px rgba(36,33,36,.06)!important}
    body[data-home-layout="luxury"] .special-card h3,
    body[data-home-layout="luxury"] .tier-card h3,
    body[data-home-layout="luxury"] .special-price,
    body[data-home-layout="luxury"] .faq-section summary,
    body[data-home-layout="luxury"] #reviewsSection h2,
    body[data-home-layout="luxury"] #reviewsSection .review-quote,
    body[data-home-layout="luxury"] #reviewsSection .review-note,
    body[data-home-layout="luxury"] #reviewsSection .review-service,
    body[data-home-layout="luxury"] .cms-project-content h3{color:#77102f!important;-webkit-text-fill-color:#77102f!important;text-shadow:none!important}
    body[data-home-layout="luxury"] #reviewsSection .review-trust-copy,
    body[data-home-layout="luxury"] #reviewsSection .review-scroll-hint,
    body[data-home-layout="luxury"] #reviewsSection .review-trust-strip{color:#6f6569!important}
    body[data-home-layout="luxury"] #reviewsSection .review-trust-strip strong,
    body[data-home-layout="luxury"] #guaranteeSignature,
    body[data-home-layout="luxury"] #membershipServicesSection .services-glow-container>h3,
    body[data-home-layout="luxury"] #membershipServicesSection .trust-content>div>div:first-child h3{color:#77102f!important}
    body[data-home-layout="luxury"] .ba-card{background:#fff!important;border-color:#e8dcdf!important;box-shadow:0 14px 34px rgba(36,33,36,.08)!important}
    body[data-home-layout="luxury"] .ba-caption{background:#fff!important;color:#77102f!important;border-color:#e8dcdf!important;text-shadow:none}
    body[data-home-layout="luxury"] .cms-stage-viewer{border-color:#e8dcdf;background:#fff}
    body[data-home-layout="luxury"] .cms-stage-buttons{background:#f6e9ed}
    body[data-home-layout="luxury"] .cms-stage-buttons button{color:#77102f;border-color:#be7b91}
    body[data-home-layout="luxury"] .cms-stage-panels,
    body[data-home-layout="luxury"] .cms-stage-grid,
    body[data-home-layout="luxury"] .cms-stage-panels img,
    body[data-home-layout="luxury"] .cms-stage-grid img{background:#eee9e7}
    /* 3 — CALL-FIRST APPLE CLEAN: quiet white space, graphite type and electric-blue actions. */
    body[data-home-layout="leads"]{
      --bg:#f5f5f7;--bg-alt:#ffffff;--ink:#1d1d1f;--muted:#6e6e73;--gold:#0071e3;--gold-soft:#1d1d1f;
      background:#f5f5f7;color:var(--ink);
    }
    body[data-home-layout="leads"]::before{display:none}
    body[data-home-layout="leads"] .topbar{
      background:rgba(255,255,255,.88)!important;border-bottom:1px solid rgba(0,0,0,.10)!important;
      box-shadow:0 8px 28px rgba(0,0,0,.06)!important;backdrop-filter:saturate(180%) blur(22px);
    }
    body[data-home-layout="leads"] .topbar .brand-lockup,
    body[data-home-layout="leads"] .topbar .main-nav a,
    body[data-home-layout="leads"] .topbar .dropbtn{color:#1d1d1f!important}
    body[data-home-layout="leads"] .topbar .dropdown-content{background:rgba(255,255,255,.98)!important;border:1px solid #d2d2d7!important}
    body[data-home-layout="leads"] .topbar .dropdown-content a{color:#1d1d1f!important}
    body[data-home-layout="leads"] .site-footer{background:#1d1d1f;color:#f5f5f7;border-color:#0071e3}
    body[data-home-layout="leads"] .hb-home-layout-shell{width:min(100%,1320px);padding-top:30px}
    body[data-home-layout="leads"] #homeHero{
      min-height:620px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(250px,.55fr);align-items:center;gap:70px;
      padding:92px 78px;border:0;border-radius:48px;background:linear-gradient(145deg,#fff 0%,#fff 54%,#edf5ff 100%);
      box-shadow:0 30px 80px rgba(0,0,0,.08);
    }
    body[data-home-layout="leads"] #homeHero::before{
      content:"Simple planning. Exceptional craftsmanship.";position:absolute;top:38px;left:78px;color:#0071e3;
      font-size:12px;font-weight:750;letter-spacing:.04em;
    }
    body[data-home-layout="leads"] #homeHero::after{
      content:"";position:absolute;right:-100px;bottom:-210px;width:520px;height:520px;z-index:0;border-radius:50%;
      background:radial-gradient(circle,#69aefa 0%,#0071e3 54%,#0057b7 100%);opacity:.13;pointer-events:none;
    }
    body[data-home-layout="leads"] #homeHero .hero-content h1{
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif;font-weight:750;background:none!important;
      -webkit-text-fill-color:#1d1d1f!important;color:#1d1d1f!important;filter:none;letter-spacing:-.055em;
    }
    body[data-home-layout="leads"] #homeHero .hero-content p{color:#6e6e73!important;font-size:1.08rem}
    body[data-home-layout="leads"] #homeHero .hero-actions,
    body[data-home-layout="leads"] #homeHero .trust-pills{justify-content:flex-start}
    body[data-home-layout="leads"] #homeHero .hero-badge img{
      width:270px;height:270px;border-radius:34%;border:10px solid rgba(255,255,255,.92);box-shadow:0 28px 65px rgba(0,76,154,.18);
    }
    body[data-home-layout="leads"] #homeHero .btn{background:#0071e3;color:#fff;box-shadow:none;border-radius:999px}
    body[data-home-layout="leads"] #homeHero .btn.ghost{background:transparent;color:#0071e3;border:1px solid #0071e3}
    body[data-home-layout="leads"] #homeHero .trust-pills li{background:#f5f5f7;border-color:#d2d2d7;color:#1d1d1f}
    body[data-home-layout="leads"] .hb-home-quick-actions{
      border:0;border-radius:32px;background:rgba(255,255,255,.96);box-shadow:0 20px 55px rgba(0,0,0,.09);
    }
    body[data-home-layout="leads"] .hb-home-quick-actions a{color:#1d1d1f;border-radius:22px;background:#f5f5f7}
    body[data-home-layout="leads"] .hb-home-quick-actions a:first-child{color:#fff;background:#0071e3}
    body[data-home-layout="leads"] .hb-home-quick-actions strong{font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;font-weight:750}
    body[data-home-layout="leads"] #premiumMaterialsSection{
      background:#fff!important;border:0!important;border-radius:28px!important;box-shadow:0 12px 36px rgba(0,0,0,.05);
    }
    body[data-home-layout="leads"] #premiumMaterialsSection p,
    body[data-home-layout="leads"] #premiumMaterialsSection span{color:#515154!important}
    body[data-home-layout="leads"] .hb-leads-conversion{grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr)}
    body[data-home-layout="leads"] .hb-leads-conversion #guaranteeSection{grid-template-columns:1fr!important}
    body[data-home-layout="leads"] .hb-leads-conversion #specialsGrid{grid-template-columns:1fr}
    body[data-home-layout="leads"] .section h2{
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif;
      font-size:clamp(2rem,3.5vw,3.35rem);font-weight:750;color:#1d1d1f;text-shadow:none;letter-spacing:-.045em;
    }
    body[data-home-layout="leads"] .section p,
    body[data-home-layout="leads"] .section li{color:#6e6e73}
    body[data-home-layout="leads"] .special-card,
    body[data-home-layout="leads"] .tier-card,
    body[data-home-layout="leads"] .accent-card,
    body[data-home-layout="leads"] .process-steps li,
    body[data-home-layout="leads"] .cms-project-card,
    body[data-home-layout="leads"] #reviewsSection,
    body[data-home-layout="leads"] #reviewsSection .review-slide,
    body[data-home-layout="leads"] .faq-section,
    body[data-home-layout="leads"] .faq-section details{
      color:#1d1d1f;background:#fff!important;border:0!important;border-radius:28px!important;
      box-shadow:0 14px 42px rgba(0,0,0,.06)!important;
    }
    body[data-home-layout="leads"] #specialsSection,
    body[data-home-layout="leads"] #guaranteeSection,
    body[data-home-layout="leads"] #tiersSection,
    body[data-home-layout="leads"] #cmsProjectsSection,
    body[data-home-layout="leads"] #before-after,
    body[data-home-layout="leads"] #membershipServicesSection,
    body[data-home-layout="leads"] #serviceAreaSection{
      padding:38px;background:#fff;border:0;border-radius:32px;box-shadow:0 14px 42px rgba(0,0,0,.05);
    }
    body[data-home-layout="leads"] .special-card h3,
    body[data-home-layout="leads"] .tier-card h3,
    body[data-home-layout="leads"] .special-price,
    body[data-home-layout="leads"] .faq-section summary,
    body[data-home-layout="leads"] #reviewsSection h2,
    body[data-home-layout="leads"] #reviewsSection .review-quote,
    body[data-home-layout="leads"] #reviewsSection .review-note,
    body[data-home-layout="leads"] #reviewsSection .review-service,
    body[data-home-layout="leads"] .cms-project-content h3{color:#1d1d1f!important;-webkit-text-fill-color:#1d1d1f!important;text-shadow:none!important}
    body[data-home-layout="leads"] #reviewsSection .review-trust-copy,
    body[data-home-layout="leads"] #reviewsSection .review-scroll-hint,
    body[data-home-layout="leads"] #reviewsSection .review-trust-strip,
    body[data-home-layout="leads"] .faq-section details p{color:#6e6e73!important}
    body[data-home-layout="leads"] #reviewsSection .review-trust-strip strong,
    body[data-home-layout="leads"] #guaranteeSignature,
    body[data-home-layout="leads"] #membershipServicesSection .services-glow-container>h3,
    body[data-home-layout="leads"] #membershipServicesSection .trust-content>div>div:first-child h3{color:#1d1d1f!important}
    body[data-home-layout="leads"] .ba-card{background:#fff!important;border:0!important;border-radius:28px!important;box-shadow:0 14px 42px rgba(0,0,0,.07)!important}
    body[data-home-layout="leads"] .ba-caption{background:#fff!important;color:#1d1d1f!important;border-color:#e5e5ea!important;text-shadow:none}
    body[data-home-layout="leads"] .cms-stage-viewer{border-color:#e5e5ea;background:#fff;border-radius:26px}
    body[data-home-layout="leads"] .cms-stage-buttons{background:#f5f5f7}
    body[data-home-layout="leads"] .cms-stage-buttons button{color:#0071e3;border-color:#8fc5fa;border-radius:999px}
    body[data-home-layout="leads"] .cms-stage-buttons button[aria-selected="true"]{background:#0071e3;border-color:#0071e3;color:#fff}
    body[data-home-layout="leads"] .cms-stage-panels,
    body[data-home-layout="leads"] .cms-stage-grid,
    body[data-home-layout="leads"] .cms-stage-panels img,
    body[data-home-layout="leads"] .cms-stage-grid img{background:#e8e8ed}
    body[data-home-layout="leads"] .addon-list,
    body[data-home-layout="leads"] .special-card .bullets li{color:#6e6e73!important}
    body[data-home-layout="leads"] .btn{background:#0071e3;color:#fff;border-radius:999px;box-shadow:none}
    body[data-home-layout="leads"] .btn.ghost{background:#fff;color:#0071e3;border:1px solid #0071e3}
    body[data-home-layout="leads"] .special-protection,
    body[data-home-layout="leads"] #membershipServicesSection [style*="background:#0a0f18"]{background:#f5f5f7!important;color:#515154!important}

    /* 4 — PROJECT-FIRST CINEMATIC: midnight gallery, warm sand and sunset-orange focus. */
    body[data-home-layout="portfolio"]{
      --bg:#0b1019;--bg-alt:#151c28;--ink:#f1dfc3;--muted:#b9ad9b;--gold:#ff6b2c;--gold-soft:#f1dfc3;
      background:#0b1019;color:var(--ink);
    }
    body[data-home-layout="portfolio"]::before{
      background:radial-gradient(circle at 86% 8%,rgba(255,107,44,.16),transparent 32rem),radial-gradient(circle at 10% 45%,rgba(64,93,139,.14),transparent 34rem);
      animation:none;z-index:-1;
    }
    body[data-home-layout="portfolio"] .topbar{background:rgba(8,12,19,.92)!important;border-bottom:1px solid rgba(241,223,195,.22)!important;backdrop-filter:blur(18px)}
    body[data-home-layout="portfolio"] .topbar .brand-lockup,
    body[data-home-layout="portfolio"] .topbar .main-nav a,
    body[data-home-layout="portfolio"] .topbar .dropbtn{color:#f7ead7!important}
    body[data-home-layout="portfolio"] .topbar .dropdown-content{background:#111824!important;border:1px solid rgba(241,223,195,.2)!important}
    body[data-home-layout="portfolio"] .site-footer{background:#070a10;color:#f1dfc3;border-color:#ff6b2c}
    body[data-home-layout="portfolio"] .hb-home-layout-shell{width:min(100%,1480px);padding-top:30px}
    body[data-home-layout="portfolio"] #homeHero{
      min-height:670px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.45fr);align-items:end;gap:58px;
      padding:104px 76px 76px;border:1px solid rgba(241,223,195,.18);border-radius:8px;
      background:radial-gradient(circle at 88% 20%,rgba(255,107,44,.34),transparent 26%),linear-gradient(125deg,#090d14 0%,#111a28 62%,#1f1820 100%);
      box-shadow:0 34px 90px rgba(0,0,0,.42);
    }
    body[data-home-layout="portfolio"] #homeHero::before{
      content:"REAL WORK  /  REAL PROGRESS  /  LASTING RESULTS";position:absolute;top:38px;left:76px;
      color:#ff8e5e;font:800 10px/1.2 Arial,Helvetica,sans-serif;letter-spacing:.24em;
    }
    body[data-home-layout="portfolio"] #homeHero::after{
      content:"";position:absolute;left:76px;bottom:43px;width:74px;height:4px;z-index:1;background:#ff6b2c;border-radius:99px;
    }
    body[data-home-layout="portfolio"] #homeHero .hero-content h1{
      max-width:920px;font-family:Arial,Helvetica,sans-serif;font-weight:850;text-transform:none;background:none!important;
      -webkit-text-fill-color:#f7ead7!important;color:#f7ead7!important;filter:none;letter-spacing:-.055em;
    }
    body[data-home-layout="portfolio"] #homeHero .hero-content p{color:#c9bdab!important;max-width:680px}
    body[data-home-layout="portfolio"] #homeHero .hero-actions,
    body[data-home-layout="portfolio"] #homeHero .trust-pills{justify-content:flex-start}
    body[data-home-layout="portfolio"] #homeHero .trust-pills li{background:rgba(241,223,195,.08);border-color:rgba(241,223,195,.28);color:#f7ead7}
    body[data-home-layout="portfolio"] #homeHero .hero-badge img{
      width:245px;height:300px;object-fit:cover;border:1px solid rgba(241,223,195,.38);border-radius:120px 120px 10px 10px;box-shadow:0 30px 70px rgba(0,0,0,.42);
    }
    body[data-home-layout="portfolio"] .btn{border-radius:999px;background:#ff6b2c;color:#10151e;text-transform:none;letter-spacing:0;box-shadow:none}
    body[data-home-layout="portfolio"] .btn.ghost{background:#f1dfc3;color:#111824;border:1px solid #f1dfc3}
    body[data-home-layout="portfolio"] #homeHero .btn.ghost{background:transparent;color:#f1dfc3;border-color:#f1dfc3}
    body[data-home-layout="portfolio"] .hb-home-quick-actions{border:1px solid rgba(241,223,195,.22);border-radius:8px;background:#111824;box-shadow:0 24px 64px rgba(0,0,0,.34)}
    body[data-home-layout="portfolio"] .hb-home-quick-actions a{color:#f1dfc3;border:1px solid rgba(241,223,195,.18);border-radius:6px;background:#182231}
    body[data-home-layout="portfolio"] .hb-home-quick-actions a:first-child{color:#111824;background:#ff6b2c;border-color:#ff6b2c}
    body[data-home-layout="portfolio"] .hb-home-quick-actions strong{font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:.06em}
    body[data-home-layout="portfolio"] .section h2{
      color:#f1dfc3;font:800 clamp(2rem,3.8vw,3.8rem)/1.02 Arial,Helvetica,sans-serif;
      text-transform:none;letter-spacing:-.05em;text-shadow:none;
    }
    body[data-home-layout="portfolio"] .section p,
    body[data-home-layout="portfolio"] .section li{color:#b9ad9b}
    body[data-home-layout="portfolio"] #premiumMaterialsSection{border:1px solid rgba(241,223,195,.20)!important;border-radius:8px!important;background:#151c28!important}
    body[data-home-layout="portfolio"] #premiumMaterialsSection p,
    body[data-home-layout="portfolio"] #premiumMaterialsSection span{color:#d5c7b3!important}
    body[data-home-layout="portfolio"] .hb-portfolio-stage{grid-template-columns:1fr;gap:30px}
    body[data-home-layout="portfolio"] .hb-portfolio-details{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:24px}
    body[data-home-layout="portfolio"] .hb-portfolio-details #membershipServicesSection{grid-template-columns:1fr}
    body[data-home-layout="portfolio"] #before-after,
    body[data-home-layout="portfolio"] #cmsProjectsSection,
    body[data-home-layout="portfolio"] #processSection,
    body[data-home-layout="portfolio"] #membershipServicesSection,
    body[data-home-layout="portfolio"] #tiersSection,
    body[data-home-layout="portfolio"] #specialsSection,
    body[data-home-layout="portfolio"] #guaranteeSection,
    body[data-home-layout="portfolio"] #serviceAreaSection{
      padding:42px;border:1px solid rgba(241,223,195,.18);border-radius:8px;background:#121925;box-shadow:0 24px 70px rgba(0,0,0,.22);
    }
    body[data-home-layout="portfolio"] #reviewsSection{
      padding:42px;border:1px solid rgba(255,107,44,.52);border-radius:8px;background:#151c28!important;box-shadow:0 24px 70px rgba(0,0,0,.26)!important;
    }
    body[data-home-layout="portfolio"] #reviewsSection .review-trust-header h2{color:#ff8e5e!important}
    body[data-home-layout="portfolio"] #reviewsSection .review-eyebrow,
    body[data-home-layout="portfolio"] #reviewsSection .review-trust-copy,
    body[data-home-layout="portfolio"] #reviewsSection .review-scroll-hint,
    body[data-home-layout="portfolio"] #reviewsSection .review-trust-strip{color:#b9ad9b!important}
    body[data-home-layout="portfolio"] #reviewsSection .review-trust-strip strong{color:#f7ead7!important}
    body[data-home-layout="portfolio"] .hb-portfolio-stage .ba-grid,
    body[data-home-layout="portfolio"] .hb-portfolio-stage .cms-project-grid{grid-template-columns:1fr!important;gap:18px!important}
    body[data-home-layout="portfolio"] .hb-portfolio-stage .ba-frame{aspect-ratio:16/10}
    body[data-home-layout="portfolio"] .tier-card,
    body[data-home-layout="portfolio"] .special-card,
    body[data-home-layout="portfolio"] .accent-card,
    body[data-home-layout="portfolio"] .process-steps li,
    body[data-home-layout="portfolio"] .cms-project-card,
    body[data-home-layout="portfolio"] #reviewsSection .review-slide,
    body[data-home-layout="portfolio"] .faq-section,
    body[data-home-layout="portfolio"] .faq-section details{
      color:#f1dfc3;border-radius:8px!important;background:#182231!important;border:1px solid rgba(241,223,195,.17)!important;box-shadow:0 16px 46px rgba(0,0,0,.20)!important;
    }
    body[data-home-layout="portfolio"] .special-card h3,
    body[data-home-layout="portfolio"] .tier-card h3,
    body[data-home-layout="portfolio"] .special-price,
    body[data-home-layout="portfolio"] .faq-section summary,
    body[data-home-layout="portfolio"] #reviewsSection .review-quote,
    body[data-home-layout="portfolio"] #reviewsSection .review-note,
    body[data-home-layout="portfolio"] #reviewsSection .review-service,
    body[data-home-layout="portfolio"] .cms-project-content h3{color:#f1dfc3!important;-webkit-text-fill-color:#f1dfc3!important;text-shadow:none!important}
    body[data-home-layout="portfolio"] #guaranteeSignature,
    body[data-home-layout="portfolio"] #membershipServicesSection .services-glow-container>h3,
    body[data-home-layout="portfolio"] #membershipServicesSection .trust-content>div>div:first-child h3{color:#f1dfc3!important}
    body[data-home-layout="portfolio"] .ba-card{background:#182231!important;border:1px solid rgba(241,223,195,.18)!important;box-shadow:0 20px 56px rgba(0,0,0,.28)!important}
    body[data-home-layout="portfolio"] .ba-caption{background:#182231!important;color:#f1dfc3!important;border-color:rgba(241,223,195,.18)!important;text-shadow:none}
    body[data-home-layout="portfolio"] .cms-stage-viewer{border:1px solid rgba(241,223,195,.22);border-radius:8px;background:#0d131e}
    body[data-home-layout="portfolio"] .cms-stage-buttons{background:#0d131e}
    body[data-home-layout="portfolio"] .cms-stage-buttons button{border-radius:999px;border-color:#6e5b4d;color:#f1dfc3}
    body[data-home-layout="portfolio"] .cms-stage-buttons button[aria-selected="true"]{background:#ff6b2c;border-color:#ff6b2c;color:#10151e}
    body[data-home-layout="portfolio"] .cms-stage-panels,
    body[data-home-layout="portfolio"] .cms-stage-grid,
    body[data-home-layout="portfolio"] .cms-stage-panels img,
    body[data-home-layout="portfolio"] .cms-stage-grid img{background:#080c12}
    body[data-home-layout="portfolio"] .addon-list,
    body[data-home-layout="portfolio"] .special-card .bullets li,
    body[data-home-layout="portfolio"] .faq-section details p{color:#b9ad9b!important}
    body[data-home-layout="portfolio"] .special-protection,
    body[data-home-layout="portfolio"] #membershipServicesSection [style*="background:#0a0f18"]{background:#0d131e!important;color:#b9ad9b!important}

    /* 5 — LOCAL-FIRST NEIGHBORHOOD: service areas first, with cream, forest green and brick. */
    body[data-home-layout="local"]{
      --bg:#f4ecdf;--bg-alt:#fffaf1;--ink:#26362e;--muted:#637067;--gold:#a44932;--gold-soft:#245346;
      background:#f4ecdf;color:var(--ink);
    }
    body[data-home-layout="local"]::before{
      background:radial-gradient(circle at 8% 8%,rgba(164,73,50,.08),transparent 32rem),radial-gradient(circle at 92% 28%,rgba(36,83,70,.09),transparent 30rem);
      animation:none;
    }
    body[data-home-layout="local"] .topbar{
      background:rgba(29,66,56,.98)!important;border-bottom:3px solid #d7b679!important;
    }
    body[data-home-layout="local"] .topbar .brand-lockup,
    body[data-home-layout="local"] .topbar .main-nav a,
    body[data-home-layout="local"] .topbar .dropbtn{color:#fffaf1!important}
    body[data-home-layout="local"] .topbar .dropdown-content{background:#1d4238!important}
    body[data-home-layout="local"] .site-footer{background:#1d4238;color:#f4ecdf;border-color:#d7b679}
    body[data-home-layout="local"] .hb-home-layout-shell{width:min(100%,1200px)}
    body[data-home-layout="local"] #homeHero{
      min-height:535px;display:grid;grid-template-columns:minmax(0,1fr) 255px;align-items:center;gap:48px;
      padding:64px;border:0;border-radius:42px 10px 42px 10px;
      background:#245346;box-shadow:0 24px 60px rgba(38,54,46,.18);
    }
    body[data-home-layout="local"] #homeHero::before{
      content:"LOCAL CRAFTSMANSHIP • NEIGHBOR-FOCUSED SERVICE";position:absolute;top:28px;left:64px;
      color:#e7cf9f;font-size:10px;font-weight:900;letter-spacing:.16em;
    }
    body[data-home-layout="local"] #homeHero .hero-content h1{
      font-family:Georgia,"Times New Roman",serif;background:none!important;-webkit-text-fill-color:#fffaf1!important;color:#fffaf1!important;filter:none;
    }
    body[data-home-layout="local"] #homeHero .hero-content p{color:#e5eee9!important}
    body[data-home-layout="local"] #homeHero .hero-actions,
    body[data-home-layout="local"] #homeHero .trust-pills{justify-content:flex-start}
    body[data-home-layout="local"] #homeHero .hero-badge img{
      width:235px;height:235px;border-radius:38% 62% 55% 45%;border:8px solid #f4ecdf;box-shadow:0 20px 45px rgba(0,0,0,.22);
    }
    body[data-home-layout="local"] #homeHero .btn{background:#d7b679;color:#20372f;box-shadow:none}
    body[data-home-layout="local"] #homeHero .btn.ghost{background:transparent;color:#fffaf1;border:1px solid #fffaf1}
    body[data-home-layout="local"] #homeHero .trust-pills li{background:rgba(255,250,241,.10);border-color:rgba(255,250,241,.34);color:#fffaf1}
    body[data-home-layout="local"] .hb-home-quick-actions{
      border:1px solid #ded1bd;border-radius:24px;background:#fffaf1;box-shadow:0 18px 45px rgba(62,54,42,.12);
    }
    body[data-home-layout="local"] .hb-home-quick-actions a{color:#245346;border-radius:18px;background:#f3e9da}
    body[data-home-layout="local"] .hb-home-quick-actions a:first-child{color:#fff;background:#a44932}
    body[data-home-layout="local"] .hb-home-quick-actions strong{font-family:Georgia,"Times New Roman",serif;font-size:15px}
    body[data-home-layout="local"] #premiumMaterialsSection{background:#fffaf1!important;border:1px solid #ded1bd!important;border-radius:24px!important}
    body[data-home-layout="local"] #premiumMaterialsSection p,
    body[data-home-layout="local"] #premiumMaterialsSection span{color:#36554a!important}
    body[data-home-layout="local"] .hb-local-opening{grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);gap:28px}
    body[data-home-layout="local"] .hb-local-opening #guaranteeSection{grid-template-columns:1fr}
    body[data-home-layout="local"] .hb-local-opening .process-steps{grid-template-columns:1fr}
    body[data-home-layout="local"] .section h2{
      font-family:Georgia,"Times New Roman",serif;font-size:clamp(2rem,3.8vw,3.25rem);color:#245346;text-shadow:none;
    }
    body[data-home-layout="local"] .section p,
    body[data-home-layout="local"] .section li{color:#637067}
    body[data-home-layout="local"] #guaranteeSection,
    body[data-home-layout="local"] #processSection,
    body[data-home-layout="local"] #reviewsSection,
    body[data-home-layout="local"] #cmsServiceAreasSection,
    body[data-home-layout="local"] #serviceAreaSection,
    body[data-home-layout="local"] #cmsProjectsSection,
    body[data-home-layout="local"] #before-after,
    body[data-home-layout="local"] #membershipServicesSection,
    body[data-home-layout="local"] #specialsSection,
    body[data-home-layout="local"] #tiersSection{
      padding:32px;border:1px solid #ded1bd;border-radius:28px;background:#fffaf1;box-shadow:0 16px 42px rgba(62,54,42,.08);
    }
    body[data-home-layout="local"] .special-card,
    body[data-home-layout="local"] .tier-card,
    body[data-home-layout="local"] .accent-card,
    body[data-home-layout="local"] .process-steps li,
    body[data-home-layout="local"] .cms-project-card,
    body[data-home-layout="local"] #reviewsSection .review-slide,
    body[data-home-layout="local"] .faq-section,
    body[data-home-layout="local"] .faq-section details{
      color:#26362e;background:#fffaf1!important;border:1px solid #ded1bd!important;border-radius:22px!important;
      box-shadow:0 12px 32px rgba(62,54,42,.07)!important;
    }
    body[data-home-layout="local"] .special-card h3,
    body[data-home-layout="local"] .tier-card h3,
    body[data-home-layout="local"] .special-price,
    body[data-home-layout="local"] .faq-section summary,
    body[data-home-layout="local"] #reviewsSection h2,
    body[data-home-layout="local"] #reviewsSection .review-quote,
    body[data-home-layout="local"] #reviewsSection .review-note,
    body[data-home-layout="local"] #reviewsSection .review-service,
    body[data-home-layout="local"] .cms-project-content h3{color:#245346!important;-webkit-text-fill-color:#245346!important;text-shadow:none!important}
    body[data-home-layout="local"] #reviewsSection .review-trust-copy,
    body[data-home-layout="local"] #reviewsSection .review-scroll-hint,
    body[data-home-layout="local"] #reviewsSection .review-trust-strip,
    body[data-home-layout="local"] .faq-section details p{color:#637067!important}
    body[data-home-layout="local"] #reviewsSection .review-trust-strip strong,
    body[data-home-layout="local"] #guaranteeSignature,
    body[data-home-layout="local"] #membershipServicesSection .services-glow-container>h3,
    body[data-home-layout="local"] #membershipServicesSection .trust-content>div>div:first-child h3{color:#245346!important}
    body[data-home-layout="local"] .ba-card{background:#fffaf1!important;border-color:#d7c6ad!important;box-shadow:0 14px 36px rgba(62,54,42,.10)!important}
    body[data-home-layout="local"] .ba-caption{background:#fffaf1!important;color:#245346!important;border-color:#d7c6ad!important;text-shadow:none}
    body[data-home-layout="local"] .cms-stage-viewer{border-color:#d7c6ad;background:#fffaf1}
    body[data-home-layout="local"] .cms-stage-buttons{background:#efe3d1}
    body[data-home-layout="local"] .cms-stage-buttons button{color:#245346;border-color:#8aa095}
    body[data-home-layout="local"] .cms-stage-panels,
    body[data-home-layout="local"] .cms-stage-grid,
    body[data-home-layout="local"] .cms-stage-panels img,
    body[data-home-layout="local"] .cms-stage-grid img{background:#e9dfd0}
    body[data-home-layout="local"] .addon-list,
    body[data-home-layout="local"] .special-card .bullets li{color:#637067!important}
    body[data-home-layout="local"] .btn{background:#a44932;color:#fff;border-radius:999px;box-shadow:none}
    body[data-home-layout="local"] .btn.ghost{background:#fffaf1;color:#245346;border:1px solid #245346}
    body[data-home-layout="local"] .special-protection,
    body[data-home-layout="local"] #membershipServicesSection [style*="background:#0a0f18"]{background:#f0e5d5!important;color:#59675f!important}
    body[data-home-layout="local"] #serviceAreaSection{margin-top:0!important}

    @media(max-width:1050px){
      body[data-home-layout="luxury"] .hb-luxury-showcase,
      body[data-home-layout="leads"] .hb-leads-conversion,
      body[data-home-layout="portfolio"] .hb-portfolio-stage,
      body[data-home-layout="portfolio"] .hb-portfolio-details,
      body[data-home-layout="local"] .hb-local-opening{grid-template-columns:1fr}
      body[data-home-layout="luxury"] .hb-luxury-showcase>#before-after,
      body[data-home-layout="luxury"] .hb-luxury-showcase>#cmsProjectsSection{width:100%;margin-left:0}
    }
    @media(max-width:900px){
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell{padding:24px 16px 64px}
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:-24px}
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>.section,
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>.hb-home-band,
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell>#premiumMaterialsSection{margin-bottom:46px}
      body[data-home-layout="luxury"] #homeHero,
      body[data-home-layout="leads"] #homeHero,
      body[data-home-layout="portfolio"] #homeHero,
      body[data-home-layout="local"] #homeHero{
        min-height:0;grid-template-columns:1fr;padding:58px 32px 38px;
      }
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content{text-align:center}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-actions,
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .trust-pills{justify-content:center}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-badge{justify-self:center}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-badge img{width:165px;height:165px}
      body[data-home-layout]:not([data-home-layout="classic"]) #membershipServicesSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #guaranteeSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #serviceAreaSection>div{grid-template-columns:1fr!important}
      body[data-home-layout="luxury"] #homeHero::before,
      body[data-home-layout="portfolio"] #homeHero::before,
      body[data-home-layout="local"] #homeHero::before{left:32px;right:32px;text-align:center}
    }
    @media(max-width:560px){
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-layout-shell{padding:18px 10px 50px}
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions{grid-template-columns:1fr;gap:8px;margin:0 auto 42px;padding:10px}
      body[data-home-layout]:not([data-home-layout="classic"]) .hb-home-quick-actions a{min-height:68px}
      body[data-home-layout="luxury"] .hb-home-quick-actions a{border-right:0;border-bottom:1px solid rgba(202,169,107,.28)}
      body[data-home-layout="luxury"] .hb-home-quick-actions a:last-child{border-bottom:0}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero{margin:10px 0 42px!important;padding:54px 18px 28px;border-radius:16px}
      body[data-home-layout="luxury"] #homeHero,
      body[data-home-layout="portfolio"] #homeHero{border-radius:0}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-content h1{font-size:clamp(2rem,11vw,3.15rem)}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero .hero-actions .btn{width:100%;text-align:center}
      body[data-home-layout]:not([data-home-layout="classic"]) #homeHero::before{top:18px;left:18px;right:18px;font-size:8px}
      body[data-home-layout]:not([data-home-layout="classic"]) #before-after,
      body[data-home-layout]:not([data-home-layout="classic"]) #cmsProjectsSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #reviewsSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #membershipServicesSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #guaranteeSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #processSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #specialsSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #tiersSection,
      body[data-home-layout]:not([data-home-layout="classic"]) #serviceAreaSection{padding:22px 15px}
      body[data-home-layout]:not([data-home-layout="classic"]) .ba-grid{grid-template-columns:1fr!important;gap:18px!important}
    }

    /* Every alternate layout has its own phone design. These rules come last
       so the site's original mobile rules cannot turn them back into Classic. */
    @media(max-width:900px){
      body[data-home-layout="luxury"] .topbar .main-nav{background:#242124!important;border-bottom-color:#be1247!important}
      body[data-home-layout="luxury"] .topbar .nav-toggle{color:#ffd8e2!important}
      body[data-home-layout="leads"] .topbar .main-nav{background:#fff!important;border-bottom-color:#d2d2d7!important}
      body[data-home-layout="leads"] .topbar .nav-toggle{color:#0071e3!important}
      body[data-home-layout="portfolio"] .topbar .main-nav{background:#0b1019!important;border-bottom-color:#ff6b2c!important}
      body[data-home-layout="portfolio"] .topbar .nav-toggle{color:#ff8e5e!important}
      body[data-home-layout="local"] .topbar .main-nav{background:#1d4238!important;border-bottom-color:#d7b679!important}
      body[data-home-layout="local"] .topbar .nav-toggle{color:#d7b679!important}

      /* 2 — Pomegranate Signature mobile: centered jewel hero and a compact proof dashboard. */
      body[data-home-layout="luxury"] .hb-home-layout-shell{padding:8px 11px 54px!important}
      body[data-home-layout="luxury"] #homeHero{
        display:flex!important;flex-direction:column;align-items:center;justify-content:center;min-height:560px;margin:8px 0 30px!important;
        padding:68px 20px 31px!important;border-radius:28px!important;text-align:center!important;
        background:radial-gradient(circle at 50% -16%,#dc315f 0%,#a10f3b 47%,#6f0927 100%)!important;
      }
      body[data-home-layout="luxury"] #homeHero::before{top:22px!important;left:18px!important;right:18px!important;text-align:center!important;line-height:1.45}
      body[data-home-layout="luxury"] #homeHero::after{inset:0!important;width:auto;height:auto;opacity:.18}
      body[data-home-layout="luxury"] #homeHero .hero-content{text-align:center!important}
      body[data-home-layout="luxury"] #homeHero .hero-actions,
      body[data-home-layout="luxury"] #homeHero .trust-pills{justify-content:center!important}
      body[data-home-layout="luxury"] #homeHero .hero-badge{position:relative!important;top:auto;right:auto;order:-1;margin:0 0 18px}
      body[data-home-layout="luxury"] #homeHero .hero-badge img{width:104px!important;height:104px!important;border-width:5px}
      body[data-home-layout="luxury"] .hb-home-quick-actions{
        display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px;margin:0 0 42px!important;padding:9px!important;
        border:0;border-radius:22px;background:#242124;box-shadow:0 18px 44px rgba(36,33,36,.18);
      }
      body[data-home-layout="luxury"] .hb-home-quick-actions a{min-height:88px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;padding:12px;border:0}
      body[data-home-layout="luxury"] .hb-home-quick-actions a:first-child{grid-column:1/-1;min-height:70px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto}
      body[data-home-layout="luxury"] .hb-home-quick-actions a span{grid-row:auto;text-align:left;font-size:22px}
      body[data-home-layout="luxury"] .hb-home-quick-actions a:first-child span{grid-row:1/3}
      body[data-home-layout="luxury"] #reviewsSection{padding:24px 14px!important;border-radius:28px!important}
      body[data-home-layout="luxury"] #reviewsSection .review-carousel-container{padding-left:34px;padding-right:34px}
      body[data-home-layout="luxury"] #before-after,
      body[data-home-layout="luxury"] #cmsProjectsSection,
      body[data-home-layout="luxury"] #membershipServicesSection,
      body[data-home-layout="luxury"] #guaranteeSection,
      body[data-home-layout="luxury"] #tiersSection,
      body[data-home-layout="luxury"] #processSection,
      body[data-home-layout="luxury"] #specialsSection,
      body[data-home-layout="luxury"] #serviceAreaSection{padding:22px 16px;border-radius:22px}
      body[data-home-layout="luxury"] .section h2{text-align:left;font-size:clamp(1.9rem,9vw,2.65rem)}

      /* 3 — Apple Clean mobile: generous white space and an unmistakable blue call path. */
      body[data-home-layout="leads"] .hb-home-layout-shell{padding:8px 10px 54px!important}
      body[data-home-layout="leads"] #homeHero{
        display:flex!important;flex-direction:column;align-items:center;min-height:0;margin:8px 0 28px!important;padding:72px 21px 31px!important;
        border-radius:30px!important;background:linear-gradient(155deg,#fff 0%,#fff 67%,#edf5ff 100%)!important;box-shadow:0 18px 55px rgba(0,0,0,.08);
      }
      body[data-home-layout="leads"] #homeHero::before{top:24px!important;left:21px!important;right:21px!important;text-align:center!important}
      body[data-home-layout="leads"] #homeHero::after{right:-145px;bottom:-175px;width:330px;height:330px;opacity:.10}
      body[data-home-layout="leads"] #homeHero .hero-content{text-align:center!important}
      body[data-home-layout="leads"] #homeHero .hero-actions,
      body[data-home-layout="leads"] #homeHero .trust-pills{justify-content:center!important}
      body[data-home-layout="leads"] #homeHero .hero-badge{position:relative!important;justify-self:center;order:-1;margin:0 0 24px}
      body[data-home-layout="leads"] #homeHero .hero-badge img{width:118px!important;height:118px!important;border-width:6px;border-radius:30%}
      body[data-home-layout="leads"] .hb-home-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px;margin:0 0 42px!important;padding:9px!important;border-radius:24px}
      body[data-home-layout="leads"] .hb-home-quick-actions a{min-height:88px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;padding:12px}
      body[data-home-layout="leads"] .hb-home-quick-actions a:first-child{grid-column:1/-1;min-height:70px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto}
      body[data-home-layout="leads"] .hb-home-quick-actions a span{grid-row:auto;font-size:22px;text-align:left}
      body[data-home-layout="leads"] .hb-home-quick-actions a:first-child span{grid-row:1/3}
      body[data-home-layout="leads"] #specialsSection,
      body[data-home-layout="leads"] #guaranteeSection,
      body[data-home-layout="leads"] #tiersSection,
      body[data-home-layout="leads"] #cmsProjectsSection,
      body[data-home-layout="leads"] #before-after,
      body[data-home-layout="leads"] #membershipServicesSection,
      body[data-home-layout="leads"] #serviceAreaSection{padding:22px 16px;border-radius:22px}
      body[data-home-layout="leads"] .section h2{font-size:clamp(1.9rem,8.5vw,2.65rem)}

      /* 4 — Cinematic mobile: midnight storytelling with compact, correctly sized project proof. */
      body[data-home-layout="portfolio"] .hb-home-layout-shell{padding:8px 8px 52px!important}
      body[data-home-layout="portfolio"] #homeHero{
        display:block!important;min-height:555px;margin:8px 0 30px!important;padding:76px 19px 145px!important;
        border-width:1px!important;border-radius:8px!important;
        background:radial-gradient(circle at 92% 10%,rgba(255,107,44,.34),transparent 28%),linear-gradient(145deg,#090d14,#172131)!important;
        box-shadow:0 22px 60px rgba(0,0,0,.40);
      }
      body[data-home-layout="portfolio"] #homeHero::before{top:24px!important;left:19px!important;right:19px!important;text-align:left!important;line-height:1.45}
      body[data-home-layout="portfolio"] #homeHero::after{left:19px;bottom:25px;width:52px;height:3px}
      body[data-home-layout="portfolio"] #homeHero .hero-content{text-align:left!important}
      body[data-home-layout="portfolio"] #homeHero .hero-actions,
      body[data-home-layout="portfolio"] #homeHero .trust-pills{justify-content:flex-start!important}
      body[data-home-layout="portfolio"] #homeHero .hero-badge{position:absolute!important;right:20px;bottom:25px}
      body[data-home-layout="portfolio"] #homeHero .hero-badge img{width:92px!important;height:112px!important;border-width:1px;border-radius:46px 46px 6px 6px;box-shadow:0 14px 34px rgba(0,0,0,.36)}
      body[data-home-layout="portfolio"] .hb-home-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px;margin:0 0 40px!important;padding:8px!important;box-shadow:0 18px 50px rgba(0,0,0,.30)}
      body[data-home-layout="portfolio"] .hb-home-quick-actions a{min-height:88px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;padding:12px}
      body[data-home-layout="portfolio"] .hb-home-quick-actions a:first-child{grid-column:1/-1;min-height:68px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto}
      body[data-home-layout="portfolio"] .hb-home-quick-actions a span{grid-row:auto;text-align:left;font-size:21px}
      body[data-home-layout="portfolio"] .hb-home-quick-actions a:first-child span{grid-row:1/3}
      body[data-home-layout="portfolio"] .hb-portfolio-stage,
      body[data-home-layout="portfolio"] .hb-portfolio-details{grid-template-columns:1fr!important;gap:18px}
      body[data-home-layout="portfolio"] #before-after,
      body[data-home-layout="portfolio"] #cmsProjectsSection,
      body[data-home-layout="portfolio"] #processSection,
      body[data-home-layout="portfolio"] #membershipServicesSection,
      body[data-home-layout="portfolio"] #reviewsSection,
      body[data-home-layout="portfolio"] #tiersSection,
      body[data-home-layout="portfolio"] #specialsSection,
      body[data-home-layout="portfolio"] #guaranteeSection,
      body[data-home-layout="portfolio"] #serviceAreaSection{padding:22px 14px!important;border-width:1px;border-radius:8px}
      body[data-home-layout="portfolio"] .section h2{font-size:clamp(1.9rem,9vw,2.7rem)}
      body[data-home-layout="portfolio"] .cms-stage-panels img,
      body[data-home-layout="portfolio"] .cms-stage-grid img{height:230px;object-fit:cover}

      /* 5 — Keep the cream/green/brick design, but make it unmistakable on phones. */
      body[data-home-layout="local"] .hb-home-layout-shell{padding:8px 10px 54px!important}
      body[data-home-layout="local"] #homeHero{
        display:grid!important;grid-template-columns:1fr!important;min-height:0;margin:8px 0 30px!important;padding:72px 20px 30px!important;
        border-radius:30px 8px 30px 8px!important;background:#245346!important;
      }
      body[data-home-layout="local"] #homeHero::before{top:23px!important;left:20px!important;right:20px!important;text-align:left!important;line-height:1.4}
      body[data-home-layout="local"] #homeHero .hero-content{text-align:left!important}
      body[data-home-layout="local"] #homeHero .hero-actions,
      body[data-home-layout="local"] #homeHero .trust-pills{justify-content:flex-start!important}
      body[data-home-layout="local"] #homeHero .hero-badge{position:relative!important;justify-self:center;margin-top:24px}
      body[data-home-layout="local"] #homeHero .hero-badge img{width:125px!important;height:125px!important;border-width:6px}
      body[data-home-layout="local"] .hb-home-quick-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px;margin:0 0 42px!important;padding:9px!important}
      body[data-home-layout="local"] .hb-home-quick-actions a{min-height:84px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;padding:12px}
      body[data-home-layout="local"] .hb-home-quick-actions a:first-child{grid-column:1/-1;min-height:70px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto}
      body[data-home-layout="local"] .hb-home-quick-actions a span{grid-row:auto;text-align:left;font-size:21px}
      body[data-home-layout="local"] .hb-home-quick-actions a:first-child span{grid-row:1/3}
      body[data-home-layout="local"] #guaranteeSection,
      body[data-home-layout="local"] #processSection,
      body[data-home-layout="local"] #reviewsSection,
      body[data-home-layout="local"] #cmsServiceAreasSection,
      body[data-home-layout="local"] #serviceAreaSection,
      body[data-home-layout="local"] #cmsProjectsSection,
      body[data-home-layout="local"] #before-after,
      body[data-home-layout="local"] #membershipServicesSection,
      body[data-home-layout="local"] #specialsSection,
      body[data-home-layout="local"] #tiersSection{padding:22px 15px;border-radius:22px}
    }
  `;
  document.head.appendChild(style);
}

function hammerApplyHomepageLayout(homepage) {
  if (hammerSlug() !== "home") return;
  const main = document.getElementById("main");
  if (!main) return;

  const allowedLayouts = new Set(["classic", "luxury", "leads", "portfolio", "local"]);
  const requestedLayout = String((homepage && homepage.homepageLayout) || "classic").trim().toLowerCase();
  const layout = allowedLayouts.has(requestedLayout) ? requestedLayout : "classic";
  hammerEnsureHomepageLayoutStyles();
  document.body.dataset.homeLayout = layout;
  main.dataset.homeLayout = layout;

  if (layout === "classic" || document.getElementById("cmsHomepageLayoutShell")) return;

  let quickActions = document.getElementById("cmsHomepageQuickActions");
  if (!quickActions) {
    quickActions = document.createElement("nav");
    quickActions.id = "cmsHomepageQuickActions";
    quickActions.className = "hb-home-quick-actions";
    quickActions.setAttribute("aria-label", "Quick contact options");
    quickActions.innerHTML = `
      <a href="tel:+19295955300"><span aria-hidden="true">☎</span><strong>Call for a Fast Estimate</strong><small>Speak directly with our team</small></a>
      <a href="sms:+19295955300"><span aria-hidden="true">▣</span><strong>Text Project Photos</strong><small>Send pictures from your phone</small></a>
      <a href="/project-estimator.html"><span aria-hidden="true">✓</span><strong>Start an Online Estimate</strong><small>Tell us about the work</small></a>
      <a href="#reviewsSection"><span aria-hidden="true">★</span><strong>Read Customer Reviews</strong><small>See real homeowner feedback</small></a>`;
    main.appendChild(quickActions);
    if (typeof refreshHammerBusinessSettings === "function") refreshHammerBusinessSettings();
  }

  const layoutPlans = {
    luxury: [
      "adminAnnouncement", "homeHero", "cmsHomepageQuickActions", "reviewsSection", "premiumMaterialsSection",
      { className: "hb-luxury-showcase", ids: ["before-after", "cmsProjectsSection"] },
      { className: "hb-luxury-story", ids: ["membershipServicesSection", "guaranteeSection"] },
      "tiersSection", "processSection", "specialsSection", "cmsServiceAreasSection",
      "serviceAreaSection", "faqSection"
    ],
    leads: [
      "adminAnnouncement", "homeHero", "cmsHomepageQuickActions",
      { className: "hb-leads-conversion", ids: ["specialsSection", "guaranteeSection"] },
      "reviewsSection", "premiumMaterialsSection", "tiersSection", "cmsProjectsSection", "processSection",
      "before-after", "membershipServicesSection", "cmsServiceAreasSection",
      "serviceAreaSection", "faqSection"
    ],
    portfolio: [
      "adminAnnouncement", "homeHero", "cmsHomepageQuickActions",
      { className: "hb-portfolio-stage", ids: ["before-after", "cmsProjectsSection"] },
      "reviewsSection", "premiumMaterialsSection",
      { className: "hb-portfolio-details", ids: ["processSection", "membershipServicesSection"] },
      "tiersSection", "specialsSection", "guaranteeSection", "cmsServiceAreasSection",
      "serviceAreaSection", "faqSection"
    ],
    local: [
      "adminAnnouncement", "homeHero", "cmsHomepageQuickActions", "cmsServiceAreasSection",
      { className: "hb-local-opening", ids: ["guaranteeSection", "processSection"] },
      "reviewsSection", "serviceAreaSection", "cmsProjectsSection",
      "before-after", "premiumMaterialsSection", "membershipServicesSection",
      "specialsSection", "tiersSection", "faqSection"
    ]
  };

  const shell = document.createElement("div");
  shell.id = "cmsHomepageLayoutShell";
  shell.className = `hb-home-layout-shell hb-home-layout-${layout}`;
  shell.dataset.homeLayout = layout;
  main.appendChild(shell);

  layoutPlans[layout].forEach(item => {
    if (typeof item === "string") {
      const section = document.getElementById(item);
      if (section) shell.appendChild(section);
      return;
    }
    const band = document.createElement("div");
    band.className = `hb-home-band ${item.className}`;
    item.ids.forEach(id => {
      const section = document.getElementById(id);
      if (section) band.appendChild(section);
    });
    if (band.children.length) shell.appendChild(band);
  });
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
    hammerApplyHomepageLayout(homepage);
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
