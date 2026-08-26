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
    allGridPhotos = shuffle(data.galleryGrid || []);
    currentFilteredGrid = allGridPhotos;

    allComparePairs = shuffle(data.galleryPairs || []);
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
        div.innerHTML = "Serving: " + data.serviceAreas.map(x => `<strong>${String(x)}</strong>`).join(" · ");
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

    // Admin V4 public trust/resource links.
    if (!footer.querySelector(".hb-managed-footer-links")) {
      const row = document.createElement("nav");
      row.className = "hb-managed-footer-links";
      row.setAttribute("aria-label", "Customer Resources");
      row.style.cssText = "margin:14px auto 4px;display:flex;justify-content:center;gap:8px 14px;flex-wrap:wrap;font-size:11px;";
      row.innerHTML = `
        <a href="/warranty.html" style="color:#f5d89b;text-decoration:none;">Standards & Warranty</a>
        <a href="/property-managers.html" style="color:#f5d89b;text-decoration:none;">Property Managers</a>
        <a href="/lead-safe.html" style="color:#f5d89b;text-decoration:none;">Lead-Safe</a>
        <a href="/project-preparation.html" style="color:#f5d89b;text-decoration:none;">Project Preparation</a>
        <a href="/privacy.html" style="color:#f5d89b;text-decoration:none;">Privacy</a>
      `;
      footer.appendChild(row);
    }
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
   ADMIN V4 — MANAGED NAVIGATION
   Disabled by default in /site-data/navigation.json.
=============================================================== */

function hbEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function applyHammerManagedNavigation() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  try {
    const res = await fetch("/site-data/navigation.json", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();

    if (!data || data.enableManagedNavigation !== true || !Array.isArray(data.items)) return;

    nav.innerHTML = data.items
      .filter(item => item && item.active !== false)
      .map(item => {
        if (item.type === "dropdown") {
          const children = Array.isArray(item.children)
            ? item.children.filter(child => child && child.active !== false)
            : [];

          return `
            <div class="dropdown">
              <a href="#" class="nav-link dropbtn">${hbEscape(item.label)} ▾</a>
              <div class="dropdown-content">
                ${children.map(child =>
                  `<a href="${hbEscape(child.url || "#")}">${hbEscape(child.label)}</a>`
                ).join("")}
              </div>
            </div>`;
        }

        return `<a${item.highlight ? ' class="nav-call"' : ""} href="${hbEscape(item.url || "#")}">${hbEscape(item.label)}</a>`;
      }).join("");
  } catch (err) {
    console.warn("Managed navigation unavailable; using header.html navigation.", err);
  }
}

/* ============================================================
   ADMIN V4 — CHAT DISPLAY SETTINGS
   Preserves the existing estimator/chatbot logic.
=============================================================== */

async function loadHammerChatDisplaySettings() {
  try {
    const res = await fetch("/site-data/chat.json", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

function applyHammerChatDisplaySettings(data) {
  if (!data) return;

  const apply = () => {
    const fab = document.querySelector(".hb-chat-fab");
    const wrapper = document.querySelector(".hb-chat-wrapper");

    if (data.enabled === false) {
      if (fab) fab.style.display = "none";
      if (wrapper) wrapper.style.display = "none";
      return;
    }

    const fabText = document.querySelector(".hb-fab-text");
    if (fabText && data.fabLabel) fabText.textContent = data.fabLabel;

    const title = document.querySelector(".hb-chat-title h3");
    if (title && data.headerTitle) title.textContent = data.headerTitle;

    const subtitle = document.querySelector(".hb-chat-title span");
    if (subtitle && data.headerSubtitle) subtitle.textContent = data.headerSubtitle;

    const ticker = document.getElementById("hb-ticker");
    if (ticker && data.initialStatus && /Initializing/i.test(ticker.textContent)) {
      ticker.textContent = data.initialStatus;
    }
  };

  apply();

  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const chatSettings = await loadHammerChatDisplaySettings();
  applyHammerChatDisplaySettings(chatSettings);
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
      fetch("/header.html").then(r => r.text()),
      fetch("/footer.html").then(r => r.text())
    ]).then(([header, footer]) => {
      headerEl.innerHTML = header;
      footerEl.innerHTML = footer;
      
      // Admin V4 can optionally replace the menu from navigation.json.
      applyHammerManagedNavigation().finally(() => {
        initHeaderInteractions();
        refreshHammerBusinessSettings();
      });
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
