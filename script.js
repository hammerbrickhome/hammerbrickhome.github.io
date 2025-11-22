
/* ============================================================
   ✅ HEADER + FOOTER HOOKS (Dynamic load + Menu interactions)
=============================================================== */

function initHeaderInteractions() {
  /* --- Mobile nav toggle --- */
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

  /* --- Dropdown toggle (Pricing + Service Areas) --- */
  document.querySelectorAll('.dropbtn').forEach(btn => {
    const dropdown = btn.closest('.dropdown');

    if (dropdown && !btn.hasAttribute('data-init')) {
      btn.setAttribute('data-init', 'true');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }
  });
}

/* ============================================================
   ✅ SERVICE FILTER (Services Page)
=============================================================== */
function filterServices() {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();

  document.querySelectorAll('.service-grid .card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
window.filterServices = filterServices;

/* ============================================================
   ✅ GALLERY UTILS
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

/* ============================================================
   ✅ FULL GALLERY PAGE LOADER
=============================================================== */
async function loadGalleryPage() {
  if (galleryInitialized) return;
  galleryInitialized = true;

  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');
  const baBtn = document.getElementById('loadMoreBA');
  const gridBtn = document.getElementById('loadMoreGrid');

  if (!galleryContainer && !compareRow) return;

  try {
    const res = await fetch('/gallery.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    const grid = shuffle(data.galleryGrid || []);
    const pairs = shuffle(data.galleryPairs || []);

    const PAGE = 8;
    let gridIndex = 0, pairIndex = 0;

    function makeSkeleton(h) {
      const sk = document.createElement('div');
      sk.className = 'skeleton';
      sk.style.height = h + 'px';
      return sk;
    }

    function buildCompareCard(pair) {
      const card = document.createElement('div');
      card.className = 'ba-card fade-in';

      const frame = document.createElement('div');
      frame.className = 'ba-frame';

      const before = document.createElement('img');
      before.className = 'ba-before';
      before.src = '/images/' + pair.before;
      before.loading = 'lazy';

      const afterWrap = document.createElement('div');
      afterWrap.className = 'ba-after-wrap';

      const after = document.createElement('img');
      after.className = 'ba-after';
      after.src = '/images/' + pair.after;
      after.loading = 'lazy';
      afterWrap.appendChild(after);

      const lbBefore = document.createElement('div');
      lbBefore.className = 'ba-label ba-label-left';
      lbBefore.textContent = 'Before';

      const lbAfter = document.createElement('div');
      lbAfter.className = 'ba-label ba-label-right';
      lbAfter.textContent = 'After';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '100';
      slider.value = '50';
      slider.className = 'ba-slider';
      slider.addEventListener('input', () => {
        afterWrap.style.width = slider.value + '%';
      });

      frame.appendChild(before);
      frame.appendChild(afterWrap);
      frame.appendChild(lbBefore);
      frame.appendChild(lbAfter);
      frame.appendChild(slider);

      const caption = document.createElement('div');
      caption.className = 'ba-caption compare-caption';
      caption.textContent = pair.label || '';

      card.appendChild(frame);
      card.appendChild(caption);

      return card;
    }

    function renderMorePairs() {
      if (!compareRow) return;
      const slice = pairs.slice(pairIndex, pairIndex + PAGE);

      slice.forEach(pair => {
        const sk = makeSkeleton(230);
        compareRow.appendChild(sk);
        const card = buildCompareCard(pair);
        setTimeout(() => sk.replaceWith(card), 220);
      });

      pairIndex += slice.length;
      if (baBtn && pairIndex >= pairs.length) baBtn.style.display = 'none';
    }

    function renderMoreGrid() {
      if (!galleryContainer) return;

      const slice = grid.slice(gridIndex, gridIndex + PAGE);

      slice.forEach(name => {
        const sk = makeSkeleton(180);
        galleryContainer.appendChild(sk);

        const img = new Image();
        img.src = '/images/' + name;
        img.loading = 'lazy';
        img.alt = name;
        img.className = 'grid-photo';
        img.addEventListener('click', () => openLightbox(img.src));
        img.addEventListener('load', () => sk.replaceWith(img));
      });

      gridIndex += slice.length;
      if (gridBtn && gridIndex >= grid.length) gridBtn.style.display = 'none';
    }

    if (compareRow && pairs.length) renderMorePairs();
    if (galleryContainer && grid.length) renderMoreGrid();

    if (baBtn) baBtn.addEventListener('click', renderMorePairs);
    if (gridBtn) gridBtn.addEventListener('click', renderMoreGrid);

  } catch (err) {
    console.error('Gallery load error:', err);
  }
}

/* ============================================================
   ✅ LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  if (img) img.src = src;
  lightbox.classList.add('show');
}

document.addEventListener('click', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && e.target === lightbox) {
    lightbox.classList.remove('show');
  }
});

/* ============================================================
   ✅ GALLERY SEARCH
=============================================================== */
function initGallerySearch() {
  const input = document.getElementById('gallerySearch');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();

    document.querySelectorAll('.grid-photo').forEach(img => {
      img.style.display = img.alt.toLowerCase().includes(q) ? '' : 'none';
    });

    document.querySelectorAll('#compareRow .compare-caption').forEach(cap => {
      const card = cap.closest('.ba-card');
      if (card) card.style.display = cap.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ============================================================
   ✅ HOMEPAGE BEFORE & AFTER (homePairs)
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById('ba-grid');
  const loadMoreBtn = document.getElementById('ba-loadmore');
  const template = document.getElementById('ba-card');

  if (!grid || !template) return;

  const BATCH = 6;
  let index = 0;
  let pairs = [];

  async function loadPairs() {
    try {
      const res = await fetch('/gallery.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return data.homePairs || [];
    } catch {
      return [];
    }
  }

  function renderBatch() {
    const slice = pairs.slice(index, index + BATCH);

    slice.forEach(pair => {
      const card = template.content.cloneNode(true);

      card.querySelector('.ba-before').src = '/images/' + pair.before;
      card.querySelector('.ba-after').src = '/images/' + pair.after;
      card.querySelector('.ba-caption').textContent = pair.label || '';

      const slider = card.querySelector('.ba-slider');
      const wrap = card.querySelector('.ba-after-wrap');

      slider.addEventListener('input', () => {
        wrap.style.width = slider.value + '%';
      });

      grid.appendChild(card);
    });

    index += slice.length;

    if (index >= pairs.length && loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
  }

  pairs = await loadPairs();

  if (!pairs.length) {
    grid.innerHTML = '<p>No before/after projects found.</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  renderBatch();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', renderBatch);
  }
}

/* ============================================================
   ✅ MASTER INITIALIZER
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();

  // Always initialize header interactions
  initHeaderInteractions();
});

/* ============================================================
   ✅ AUTO-LOAD HEADER & FOOTER (Call button removed)
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const headerEl = document.getElementById("header-include");
  const footerEl = document.getElementById("footer-include");

  if (headerEl) {
    Promise.all([
      fetch("/header.html").then(r => r.text()),
      fetch("/footer.html").then(r => r.text())
    ])
    .then(([header, footer]) => {
      headerEl.innerHTML = header;
      footerEl.innerHTML = footer;

      // Year update
      const yr = document.getElementById("yr");
      if (yr) yr.textContent = new Date().getFullYear();

      // Re-init header now that it exists
      initHeaderInteractions();
    })
    .catch(err => console.error("Include load error", err));
  }
});
/* ============================================================
   ⭐ AUTO-INJECT FLOATING CONTACT BUBBLE (GLOBAL)
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Don't add twice
  if (document.getElementById("floating-contact-btn")) return;

  // Create bubble
  const bubble = document.createElement("button");
  bubble.id = "floating-contact-btn";
  bubble.textContent = "💬";
  bubble.setAttribute("aria-label", "Contact Options");
  bubble.className = "contact-float-btn";

  document.body.appendChild(bubble);

  // Toggle Contact Panel (already exists on every page)
  const panel = document.getElementById("contact-panel");

  if (bubble && panel) {
    bubble.addEventListener("click", () => {
      panel.style.display = "block";
      panel.setAttribute("aria-hidden", "false");
    });
  }
});
