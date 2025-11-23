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
function buildCompare(pair) {
  const card = document.createElement("div");
  card.className = "ba-card fade-in";

  const frame = document.createElement("div");
  frame.className = "ba-frame";

  const before = document.createElement("img");
  before.src = "/images/" + pair.before;
  before.className = "ba-before";

  const afterWrap = document.createElement("div");
  afterWrap.className = "ba-after-wrap";

  const after = document.createElement("img");
  after.src = "/images/" + pair.after;
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
    img.src = "/images/" + imgName;
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
  initHeaderInteractions();
  
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
   AUTO-INCLUDE HEADER & FOOTER
=============================================================== */
// NOTE: This section was moved to after the main DOMContentLoaded listener 
// to ensure initHeaderInteractions is called after the header elements exist.

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
      // initHeaderInteractions() is now called in the master DOMContentLoaded listener
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
