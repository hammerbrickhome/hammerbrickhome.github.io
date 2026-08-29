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

function hammerApplySeo(item) {
  if (!item) return;
  if (item.seoTitle) document.title = item.seoTitle;
  hammerSetMeta("description", item.seoDescription);
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

  const allActiveAreas = data.areas.filter(area => area && area.active !== false);
  if (isDirectory) {
    const heading = document.getElementById("areaDirectoryHeading");
    const intro = document.getElementById("areaDirectoryIntro");
    const grid = document.getElementById("areaDirectoryGrid");
    if (heading && data.heading) heading.textContent = data.heading;
    if (intro && data.intro) intro.textContent = data.intro;
    if (grid) {
      grid.innerHTML = allActiveAreas.map(area => `
        <a class="accent-card" href="${hammerEscape(area.url)}" style="display:block;text-decoration:none;color:inherit;padding:24px;">
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
  const areas = data.areas.filter(area => area && area.active !== false && area.showOnHomepage !== false);
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
    active: area.active !== false && detail.published !== false,
    name: detail.title || area.name,
    heroTitle: detail.heroTitle || detail.title || area.heroTitle,
    heroText: detail.intro || area.heroText,
    sectionTitle: detail.sectionTitle || area.sectionTitle,
    sectionText: detail.sectionText || detail.body || area.sectionText,
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
    const heading = mainSection.querySelector("h2");
    const paragraph = mainSection.querySelector(":scope > div > p");
    const services = mainSection.querySelector(":scope > div > ul.bullets");
    const areaCard = mainSection.querySelector(".accent-card");
    if (heading && area.sectionTitle) heading.textContent = area.sectionTitle;
    if (paragraph && area.sectionText) paragraph.textContent = area.sectionText;
    if (services && Array.isArray(area.featuredServices) && area.featuredServices.length) {
      services.innerHTML = area.featuredServices.map(item => `<li>${hammerEscape(item)}</li>`).join("");
    }
    if (areaCard) {
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
    const heading = cta.querySelector("h2");
    const paragraph = cta.querySelector("p");
    if (heading && area.ctaTitle) heading.textContent = area.ctaTitle;
    if (paragraph && area.ctaText) paragraph.textContent = area.ctaText;
  }
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
  const items = data.items.filter(item => item && item.active !== false);
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
}

function hammerRenderReviewsPage(data) {
  if (hammerSlug() !== "reviews" || !data || !Array.isArray(data.reviews)) return;
  const section = document.querySelector("main .section.content-wrapper");
  if (!section) return;
  const reviews = data.reviews.filter(item => item && item.active !== false);
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
  if (!item || item.active === false) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = item.startDate ? new Date(item.startDate + "T00:00:00") : null;
  const end = item.endDate ? new Date(item.endDate + "T23:59:59") : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) return false;
  if (end && !Number.isNaN(end.getTime()) && now > end) return false;
  return true;
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
  grid.innerHTML = hammerRenderSpecialCards(data.specials.filter(hammerSpecialIsCurrent));
}

function hammerApplyHeaderSettings(data) {
  if (!data) return;

  const wrapper = document.getElementById("header-include");
  const topbar = document.querySelector(".topbar");
  if (wrapper) wrapper.dataset.cmsSticky = data.sticky === false ? "false" : "true";
  if (topbar) {
    topbar.dataset.headerSize = data.size === "compact" ? "compact" : "comfortable";
  }

  const logo = document.querySelector(".brand-logo");
  if (logo) logo.style.display = data.showLogo === false ? "none" : "";
  const tagline = document.querySelector(".brand-sub");
  if (tagline) tagline.style.display = data.showTagline === false ? "none" : "";

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
    item.style.display = data[showField] === false ? "none" : "";
    const label = String(data[labelField] || fallback);
    if (item.matches("a")) item.textContent = label;
    else {
      const button = item.querySelector(".dropbtn");
      if (button) button.textContent = `${label} ▾`;
    }
  });
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
    hammerFetchJson("/site-data/header.json")
  ]).then(([pages, areas, services, homepage, faqs, reviews, specials, areaDetail, header]) => {
    hammerApplyPageControls(pages);
    hammerApplyAreaControls(areas, areaDetail);
    hammerRenderHomeAreas(areas, homepage);
    hammerRenderSignatureServices(services);
    hammerRenderFaqPage(faqs);
    hammerRenderReviewsPage(reviews);
    hammerRenderSpecialsPage(specials);
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

function applyHammerBusinessSettings(data) {
  if (!data) return;

  const dial = normalizeDialNumber(data.phone);
  if (dial) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = "tel:" + dial);
    document.querySelectorAll('a[href^="sms:"]').forEach(a => a.href = "sms:" + dial);
  }
  if (data.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.href = "mailto:" + data.email);
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
        div.innerHTML = "Serving: " + data.serviceAreas.map(x => `<strong>${String(x)}</strong>`).join(" · ");
      }
      if (text.includes("Licensed, Bonded & Insured") && data.epaLabel) {
        div.textContent = `Licensed, Bonded & Insured · ${data.epaLabel}`;
      }
      if (data.footerTagline && text.includes("Luxury Remodeling") && text.includes("Custom Brickwork")) {
        div.textContent = data.footerTagline;
      }
    });

    const licenseSpan = Array.from(footer.querySelectorAll("span")).find(
      s => s.textContent.includes("NYC HIC") || s.textContent.includes("NJ HIC")
    );
    if (licenseSpan) {
      const parts = [];
      if (data.nycHic) parts.push(`NYC HIC #${data.nycHic}`);
      if (data.njHic) parts.push(`NJ HIC #${data.njHic}`);
      licenseSpan.textContent = parts.join(" · ");
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
