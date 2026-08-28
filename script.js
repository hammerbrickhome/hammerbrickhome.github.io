/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */

function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav && !navToggle.hasAttribute('data-init')) {
    navToggle.setAttribute('data-init', 'true');

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('show');
      }
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
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => dropdown.classList.remove('show'));
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
    allGridPhotos = shuffle((data.galleryGrid || []).filter(photo =>
      photo && photo.active !== false && (typeof photo === "string" || photo.name)
    ));
    currentFilteredGrid = allGridPhotos;

    allComparePairs = shuffle((data.galleryPairs || []).filter(pair =>
      pair && pair.active !== false && pair.before && pair.after
    ));
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

  const footer = document.querySelector(".site-footer");
  if (footer) {
    const copyrightStrong = footer.querySelector("div strong");
    if (copyrightStrong && data.businessName) copyrightStrong.textContent = data.businessName;

    footer.querySelectorAll("div").forEach(div => {
      const text = div.textContent.trim();
      if (text.startsWith("Serving:") && Array.isArray(data.serviceAreas)) {
        div.textContent = "Serving: ";
        data.serviceAreas.forEach((area, index) => {
          if (index) div.appendChild(document.createTextNode(" · "));
          const strong = document.createElement("strong");
          strong.textContent = String(area);
          div.appendChild(strong);
        });
      }
      if (text.includes("Licensed, Bonded & Insured") && data.epaLabel) {
        div.textContent = `Licensed, Bonded & Insured · ${data.epaLabel}`;
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

  if (headerEl || footerEl) {
    Promise.all([
      fetch("/header.html").then(r => r.text()),
      fetch("/footer.html").then(r => r.text())
    ]).then(([header, footer]) => {
      if (headerEl) headerEl.innerHTML = header;
      if (footerEl) footerEl.innerHTML = footer;
      
      // ✅ FIXED: Initialize menu here, once header is in DOM
      initHeaderInteractions();
      refreshHammerBusinessSettings();
    });
  }
});

/* ============================================================
   PAGES CMS — SHARED PAGE CONTENT
   Every renderer keeps the original HTML as a fallback. Content
   changes only after a valid JSON file has loaded successfully.
=============================================================== */

const hammerCmsCache = new Map();

function cmsEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cmsSafeUrl(value, fallback = "#") {
  const url = String(value || "").trim();
  if (/^(\/(?!\/)|#|https:\/\/|mailto:|tel:|sms:)/i.test(url)) return url;
  return fallback;
}

function cmsImageUrl(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (image.startsWith("/")) return image;
  return "/images/" + image.replace(/^images\//, "");
}

function cmsLoadJson(path) {
  if (!hammerCmsCache.has(path)) {
    hammerCmsCache.set(path, fetch(path, { cache: "no-store" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null));
  }
  return hammerCmsCache.get(path);
}

function cmsSpecialIsCurrent(item) {
  if (!item || item.active === false) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = item.startDate ? new Date(item.startDate + "T00:00:00") : null;
  const end = item.endDate ? new Date(item.endDate + "T23:59:59") : null;
  if (start && !Number.isNaN(start.getTime()) && now < start) return false;
  if (end && !Number.isNaN(end.getTime()) && now > end) return false;
  return true;
}

function cmsSpecialCard(item) {
  const accent = /^#[0-9a-f]{3,8}$/i.test(String(item.accentColor || ""))
    ? item.accentColor : "#e7bf63";
  const badgeColor = /^#[0-9a-f]{3,8}$/i.test(String(item.badgeTextColor || ""))
    ? item.badgeTextColor : "#ffffff";
  const features = (Array.isArray(item.features) ? item.features : []).map(feature => {
    const text = cmsEscape(typeof feature === "string" ? feature : feature?.text);
    return `<li>${feature?.bold === true ? `<strong>${text}</strong>` : text}</li>`;
  }).join("");
  const addons = (Array.isArray(item.addons) ? item.addons : []).map(addon =>
    `<li><span>${cmsEscape(addon?.name)}</span> <span class="addon-price">${cmsEscape(addon?.price)}</span></li>`
  ).join("");

  return `<div class="special-card" style="border-top:4px solid ${accent};">
    ${item.badge ? `<div class="special-tag" style="background:${accent};color:${badgeColor};">${cmsEscape(item.badge)}</div>` : ""}
    <h3>${cmsEscape(item.title)}</h3>
    <div class="special-price">${cmsEscape(item.price)}</div>
    <p class="special-desc">${cmsEscape(item.description)}</p>
    ${features ? `<ul class="bullets">${features}</ul>` : ""}
    ${addons ? `<div class="special-addons"><h4>Popular Add-Ons</h4><ul class="addon-list">${addons}</ul></div>` : ""}
    ${item.requirements ? `<div class="special-protection"><strong>Client Requirements:</strong> ${cmsEscape(item.requirements)}</div>` : ""}
    <button type="button" class="btn contact-panel-toggle">${cmsEscape(item.buttonText || "Contact Us")}</button>
  </div>`;
}

async function cmsRenderFaqPage() {
  const list = document.getElementById("cmsFaqPageList");
  if (!list) return;
  const data = await cmsLoadJson("/site-data/faqs.json");
  if (!data || !Array.isArray(data.items)) return;

  const items = data.items.filter(item => item && item.active !== false && item.question && item.answer);
  const groups = new Map();
  items.forEach(item => {
    const category = String(item.category || "General & Pricing");
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  });

  const heading = document.getElementById("cmsFaqPageHeading");
  const intro = document.getElementById("cmsFaqPageIntro");
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.intro) intro.textContent = data.intro;
  list.innerHTML = Array.from(groups.entries()).map(([category, questions]) => `
    <h3 class="faq-category">${cmsEscape(category)}</h3>
    ${questions.map(item => `<div class="faq-item">
      <button class="faq-question" type="button">${cmsEscape(item.question)}<span class="faq-icon">+</span></button>
      <div class="faq-answer"><p>${cmsEscape(item.answer)}</p></div>
    </div>`).join("")}
  `).join("");

  list.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      const answer = button.nextElementSibling;
      answer.style.maxHeight = answer.style.maxHeight ? "" : answer.scrollHeight + "px";
    });
  });
}

async function cmsRenderReviewsPage() {
  const list = document.getElementById("cmsReviewsPageList");
  if (!list) return;
  const data = await cmsLoadJson("/site-data/reviews.json");
  if (!data || !Array.isArray(data.reviews)) return;
  const reviews = data.reviews.filter(item => item && item.active !== false && item.review);
  const heading = document.getElementById("cmsReviewsPageHeading");
  const intro = document.getElementById("cmsReviewsPageIntro");
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.intro) intro.textContent = data.intro;

  list.innerHTML = reviews.map(item => {
    const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
    const initial = String(item.name || "C").trim().charAt(0).toUpperCase();
    return `<article class="review-feature">
      <div class="watermark-icon" aria-hidden="true">“</div>
      <div class="star-row">${"★".repeat(rating)}${"☆".repeat(5 - rating)} <span class="verified-tag">${cmsEscape(item.source || "Google Review")}</span></div>
      <div class="review-text">“${cmsEscape(item.review)}”</div>
      <div class="author-block"><div class="author-initial">${cmsEscape(initial)}</div>
        <div class="author-details"><h4>${cmsEscape(item.name)}</h4><span>${cmsEscape(item.service || "Home Improvement")}</span></div>
      </div>
    </article>`;
  }).join("") + `<div class="reviews-cta">
    <h3 class="shimmer-title" style="font-size:26px;margin-bottom:15px;">Your Turn.</h3>
    <p style="color:var(--muted);max-width:600px;margin:0 auto 25px;">If we have worked together, please share your story.</p>
    <a class="btn gold-btn" href="${cmsSafeUrl(data.reviewUrl, "/contact.html")}" target="_blank" rel="noopener">Write a Google Review</a>
    <div style="margin-top:30px;"><a class="btn ghost" href="/contact.html">Request a Free Estimate</a></div>
  </div>`;
}

async function cmsRenderSpecialsPage() {
  const grid = document.getElementById("cmsSpecialsPageGrid");
  if (!grid) return;
  const data = await cmsLoadJson("/site-data/specials.json");
  if (!data || !Array.isArray(data.specials)) return;
  const items = data.specials.filter(cmsSpecialIsCurrent);
  const hero = document.getElementById("cmsSpecialsPageHero");
  const intro = document.getElementById("cmsSpecialsPageIntro");
  const heading = document.getElementById("cmsSpecialsPageHeading");
  const subheading = document.getElementById("cmsSpecialsPageSubheading");
  const fine = document.getElementById("cmsSpecialsPageFinePrint");
  if (hero && data.heading) hero.textContent = data.heading;
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.subheading) intro.textContent = data.subheading;
  if (subheading && data.subheading) subheading.textContent = data.subheading;
  if (fine && data.finePrint) fine.textContent = data.finePrint;
  grid.innerHTML = items.length ? items.map(cmsSpecialCard).join("")
    : `<p class="cms-empty">No service specials are active right now.</p>`;
}

async function cmsRenderProjectsPage() {
  const grid = document.getElementById("cmsProjectsGrid");
  if (!grid) return;
  const data = await cmsLoadJson("/site-data/projects.json");
  if (!data || !Array.isArray(data.projects)) return;
  const projects = data.projects.filter(item =>
    item && item.active !== false && item.title && item.beforeImage && item.afterImage
  );
  const heading = document.getElementById("cmsProjectsHeading");
  const intro = document.getElementById("cmsProjectsIntro");
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.intro) intro.textContent = data.intro;
  grid.innerHTML = projects.map(item => `<article class="cms-project-card">
    <div class="cms-project-images">
      <figure><img src="${cmsEscape(cmsImageUrl(item.beforeImage))}" alt="${cmsEscape(item.title)} before"><figcaption>Before</figcaption></figure>
      <figure><img src="${cmsEscape(cmsImageUrl(item.afterImage))}" alt="${cmsEscape(item.title)} after"><figcaption>After</figcaption></figure>
    </div>
    <div class="cms-project-copy">
      <p class="cms-project-meta">${cmsEscape(item.service)}${item.location ? ` · ${cmsEscape(item.location)}` : ""}</p>
      <h2>${cmsEscape(item.title)}</h2><p>${cmsEscape(item.summary)}</p>
    </div>
  </article>`).join("");
}

async function cmsRenderServices() {
  const data = await cmsLoadJson("/site-data/services.json");
  if (!data || !Array.isArray(data.services)) return;

  const heading = document.getElementById("cmsServicesPageHeading");
  const intro = document.getElementById("cmsServicesPageIntro");
  if (heading && data.heading) heading.textContent = data.heading;
  if (intro && data.intro) intro.textContent = data.intro;

  const directory = document.getElementById("cmsServicesDirectory");
  if (directory) {
    const groups = new Map();
    data.services.filter(item => item && item.active !== false && item.name).forEach(item => {
      const category = String(item.category || "Other Services");
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });
    directory.innerHTML = Array.from(groups.entries()).map(([category, services]) => `
      <div class="cms-service-group"><h2>${cmsEscape(category)}</h2><div class="service-grid">
        ${services.map(item => `<div class="service-button"><a href="${cmsSafeUrl(item.url, "/contact.html")}">${cmsEscape(item.name)}</a></div>`).join("")}
      </div></div>`).join("");
    directory.hidden = false;
    ["roofing-section", "masonry-section", "remodeling-section", "carpentry-section", "painting-section", "exterior-section", "lead-safe-section"]
      .forEach(id => { const section = document.getElementById(id); if (section) section.hidden = true; });

    const search = document.getElementById("serviceSearch");
    const noResults = document.getElementById("noResults");
    if (search) search.oninput = () => {
      const query = search.value.toLowerCase().trim();
      let visible = 0;
      directory.querySelectorAll(".service-button").forEach(button => {
        const show = button.textContent.toLowerCase().includes(query);
        button.style.display = show ? "flex" : "none";
        if (show) visible += 1;
      });
      if (noResults) noResults.style.display = visible ? "none" : "block";
    };
  }

  const homeGrid = document.getElementById("cmsHomeServices");
  if (homeGrid) {
    const cards = Array.from(homeGrid.querySelectorAll(".glow-card"));
    const homeServices = data.services.filter(item => item && item.active !== false && item.showOnHomepage !== false);
    cards.forEach((card, index) => {
      const item = homeServices[index];
      card.style.display = item ? "" : "none";
      if (!item) return;
      card.href = cmsSafeUrl(item.url, "/services.html");
      const label = card.querySelector("span:last-child");
      if (label) label.textContent = item.name;
    });
  }
}

let hammerChromeData = null;
async function cmsApplyChrome() {
  if (!hammerChromeData) {
    const [navigation, footer, seo] = await Promise.all([
      cmsLoadJson("/site-data/navigation.json"),
      cmsLoadJson("/site-data/footer.json"),
      cmsLoadJson("/site-data/seo.json")
    ]);
    hammerChromeData = { navigation, footer, seo };
  }

  const nav = document.querySelector(".main-nav");
  if (nav && hammerChromeData.navigation?.items) {
    const signature = JSON.stringify(hammerChromeData.navigation.items);
    if (nav.dataset.cmsNavigation !== signature) {
      const links = Array.from(nav.children).filter(child => child.matches("a"));
      const items = hammerChromeData.navigation.items;
      links.forEach((link, index) => {
        const item = items[index];
        link.style.display = item && item.active !== false ? "" : "none";
        if (!item) return;
        const href = cmsSafeUrl(item.url, link.getAttribute("href") || "#");
        if (link.getAttribute("href") !== href) link.setAttribute("href", href);
        if (link.textContent !== item.label) link.textContent = item.label;
      });
      nav.dataset.cmsNavigation = signature;
    }
  }

  const footer = document.querySelector(".site-footer");
  if (footer && hammerChromeData.footer) {
    const quickLinks = footer.querySelector('nav[aria-label="Quick Links"]');
    const items = (hammerChromeData.footer.links || []).filter(item => item && item.active !== false);
    const signature = JSON.stringify(items);
    if (quickLinks && quickLinks.dataset.cmsFooter !== signature) {
      quickLinks.innerHTML = items.map((item, index) =>
        `${index ? '<span style="color:rgba(255,255,255,.3);">|</span>' : ""}<a href="${cmsSafeUrl(item.url, "#")}" style="color:#f5d89b;margin:0 8px;text-decoration:none;font-weight:600;">${cmsEscape(item.label)}</a>`
      ).join("");
      quickLinks.dataset.cmsFooter = signature;
    }
    const tagline = footer.querySelector("div:last-of-type");
    if (tagline && hammerChromeData.footer.tagline && tagline.textContent.trim() !== hammerChromeData.footer.tagline) {
      tagline.textContent = hammerChromeData.footer.tagline;
    }
  }

  const seo = hammerChromeData.seo;
  if (seo) {
    if (!document.querySelector('meta[name="description"]') && seo.defaultDescription) {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = seo.defaultDescription;
      document.head.appendChild(meta);
    }
    if (!document.querySelector('meta[property="og:image"]') && seo.shareImage) {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      meta.content = new URL(cmsImageUrl(seo.shareImage), location.origin).href;
      document.head.appendChild(meta);
    }
  }
}

document.addEventListener("click", event => {
  const trigger = event.target.closest?.(".contact-panel-toggle");
  const panel = document.getElementById("contact-panel");
  if (trigger && panel) panel.style.display = "flex";
});

document.addEventListener("DOMContentLoaded", () => {
  cmsRenderFaqPage();
  cmsRenderReviewsPage();
  cmsRenderSpecialsPage();
  cmsRenderProjectsPage();
  cmsRenderServices();
  cmsApplyChrome();

  let chromeTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(chromeTimer);
    chromeTimer = setTimeout(cmsApplyChrome, 20);
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
