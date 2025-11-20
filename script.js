/* ============================================================
   HEADER INTERACTIONS — WORKS ON DESKTOP + MOBILE
=============================================================== */
function initHeaderInteractions() {
  // --- Mobile navigation toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger document click close
      mainNav.classList.toggle('show');
    });
  }

  // --- Dropdowns: Pricing + Service Areas ---
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropbtn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close all other dropdowns
      dropdowns.forEach(other => {
        if (other !== dd) other.classList.remove('show');
      });

      // Toggle current dropdown (desktop + mobile)
      dd.classList.toggle('show');
    });
  });

  // Close dropdowns when clicking anywhere outside (desktop + mobile)
  document.addEventListener('click', (event) => {
    dropdowns.forEach(dd => {
      if (!dd.contains(event.target)) {
        dd.classList.remove('show');
      }
    });

    // Close mobile nav if click outside
    if (mainNav && !mainNav.contains(event.target) && event.target !== navToggle) {
      mainNav.classList.remove('show');
    }
  });

  // --- Chat bubble toggle ---
  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

/* ============================================================
   SERVICE FILTER
=============================================================== */
function filterServices() {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card => {
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}
window.filterServices = filterServices;

/* ============================================================
   UTIL — SHUFFLE
=============================================================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   GALLERY PAGE (grid + before/after)
=============================================================== */
let galleryInitialized = false;

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
    if (!res.ok) {
      console.error('gallery.json failed to load');
      return;
    }
    const data = await res.json();

    const rawGrid = Array.isArray(data.galleryGrid) ? data.galleryGrid : [];
    const rawPairs = Array.isArray(data.galleryPairs) ? data.galleryPairs : [];

    const grid = shuffle(rawGrid);
    const pairs = shuffle(rawPairs);

    const PAGE = 8;
    let gridIndex = 0;
    let pairIndex = 0;

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
        if (!pair.before || !pair.after) return;

        const sk = makeSkeleton(230);
        compareRow.appendChild(sk);

        const card = buildCompareCard(pair);
        setTimeout(() => {
          sk.replaceWith(card);
        }, 200);
      });

      pairIndex += slice.length;
      if (baBtn) {
        baBtn.style.display =
          pairIndex >= pairs.length ? 'none' : 'inline-block';
      }
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
        img.decoding = 'async';
        img.alt = name;
        img.className = 'grid-photo';
        img.addEventListener('click', () => openLightbox(img.src));
        img.addEventListener('load', () => {
          sk.replaceWith(img);
        });
      });

      gridIndex += slice.length;
      if (gridBtn) {
        gridBtn.style.display =
          gridIndex >= grid.length ? 'none' : 'inline-block';
      }
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
   LIGHTBOX
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
   GALLERY SEARCH
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
      if (!card) return;
      card.style.display = cap.textContent.toLowerCase().includes(q)
        ? ''
        : 'none';
    });
  });
}

/* ============================================================
   HOMEPAGE BEFORE & AFTER
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById('ba-grid');
  const loadMoreBtn = document.getElementById('ba-loadmore');
  const template = document.getElementById('ba-card');

  if (!grid || !template) return;

  let allPairs = [];
  let index = 0;
  const BATCH = 6;

  async function loadPairs() {
    try {
      const res = await fetch('/gallery.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.homePairs) ? data.homePairs : [];
    } catch (e) {
      console.error('homePairs load error', e);
      return [];
    }
  }

  function renderNext() {
    const slice = allPairs.slice(index, index + BATCH);

    slice.forEach(pair => {
      const card = template.content.cloneNode(true);
      const before = card.querySelector('.ba-before');
      const after = card.querySelector('.ba-after');
      const caption = card.querySelector('.ba-caption');
      const slider = card.querySelector('.ba-slider');
      const wrap = card.querySelector('.ba-after-wrap');

      before.src = '/images/' + pair.before;
      after.src = '/images/' + pair.after;
      caption.textContent = pair.label || '';

      slider.addEventListener('input', () => {
        wrap.style.width = slider.value + '%';
      });

      grid.appendChild(card);
    });

    index += slice.length;
    if (loadMoreBtn && index >= allPairs.length) {
      loadMoreBtn.style.display = 'none';
    }
  }

  allPairs = await loadPairs();
  if (!allPairs.length) {
    grid.innerHTML = '<p>No before/after pairs found.</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  renderNext();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', renderNext);
  }
}

/* ============================================================
   MASTER INIT — Runs for EVERY page
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderInteractions();   // 🔑 THIS WAS MISSING BEFORE
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();
});

