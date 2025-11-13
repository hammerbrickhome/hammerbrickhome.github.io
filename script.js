
/* ============================================================
   HEADER + NAV + CHAT INTERACTIONS
=============================================================== */
function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initHeaderInteractions, 500);
});

/* ============================================================
   SERVICE FILTER (Services page)
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
   UTILITIES
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
   FADE-IN ON SCROLL
=============================================================== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in, .fade-up').forEach(el => {
    fadeObserver.observe(el);
  });
});

/* ============================================================
   LIGHTBOX (Gallery)
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  if (img) img.src = src;
  lightbox.classList.add('show');
}

document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  if (e.target === lightbox) {
    lightbox.classList.remove('show');
  }
});

/* ============================================================
   GALLERY PAGE — galleryPairs + galleryGrid
=============================================================== */
async function loadGalleryPage() {
  const compareRow = document.getElementById('compareRow');
  const galleryContainer = document.getElementById('galleryContainer');

  if (!compareRow && !galleryContainer) return;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load gallery.json');
    const data = await res.json();

    const galleryPairs = shuffle(Array.isArray(data.galleryPairs) ? data.galleryPairs : []);
    const galleryGrid = shuffle(Array.isArray(data.galleryGrid) ? data.galleryGrid : []);

    let pairIndex = 0;
    const PAIR_BATCH = 8;
    function addMorePairs() {
      if (!compareRow) return;
      const slice = galleryPairs.slice(pairIndex, pairIndex + PAIR_BATCH);
      slice.forEach(pair => {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        skeleton.style.height = '260px';
        compareRow.appendChild(skeleton);

        const card = buildCompareCard(pair);
        setTimeout(() => skeleton.replaceWith(card), 200);
      });
      pairIndex += slice.length;
      if (pairIndex >= galleryPairs.length) {
        const btn = document.getElementById('loadMoreBA');
        if (btn) btn.style.display = 'none';
      }
    }

    let gridIndex = 0;
    const GRID_BATCH = 8;
    function addMoreGrid() {
      if (!galleryContainer) return;
      const slice = galleryGrid.slice(gridIndex, gridIndex + GRID_BATCH);
      slice.forEach(name => {
        const holder = document.createElement('div');
        holder.className = 'skeleton';
        holder.style.height = '180px';
        galleryContainer.appendChild(holder);

        const img = new Image();
        img.src = 'images/' + name;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = name;
        img.addEventListener('click', () => openLightbox(img.src));
        img.addEventListener('load', () => {
          img.classList.add('lazyloaded');
          holder.replaceWith(img);
        });
      });
      gridIndex += slice.length;
      if (gridIndex >= galleryGrid.length) {
        const btn = document.getElementById('loadMoreGrid');
        if (btn) btn.style.display = 'none';
      }
    }

    if (compareRow) addMorePairs();
    if (galleryContainer) addMoreGrid();

    const morePairsBtn = document.getElementById('loadMoreBA');
    if (morePairsBtn) morePairsBtn.addEventListener('click', addMorePairs);
    const moreGridBtn = document.getElementById('loadMoreGrid');
    if (moreGridBtn) moreGridBtn.addEventListener('click', addMoreGrid);

  } catch (err) {
    console.error('Gallery load error:', err);
  }
}

function buildCompareCard(pair) {
  const outer = document.createElement('div');

  const wrap = document.createElement('div');
  wrap.className = 'compare-item fade-in';

  const before = document.createElement('img');
  before.className = 'before-img';
  before.src = 'images/' + pair.before;
  before.loading = 'lazy';

  const afterWrap = document.createElement('div');
  afterWrap.className = 'after-wrap';

  const after = document.createElement('img');
  after.className = 'after-img';
  after.src = 'images/' + pair.after;
  after.loading = 'lazy';

  afterWrap.appendChild(after);

  const lbBefore = document.createElement('div');
  lbBefore.className = 'compare-label';
  lbBefore.textContent = 'Before';

  const lbAfter = document.createElement('div');
  lbAfter.className = 'compare-label right';
  lbAfter.textContent = 'After';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.className = 'slider-control';
  slider.addEventListener('input', () => {
    afterWrap.style.width = slider.value + '%';
  });

  wrap.appendChild(before);
  wrap.appendChild(afterWrap);
  wrap.appendChild(lbBefore);
  wrap.appendChild(lbAfter);
  wrap.appendChild(slider);

  const caption = document.createElement('div');
  caption.className = 'compare-caption';
  caption.textContent = pair.label || '';

  outer.appendChild(wrap);
  outer.appendChild(caption);
  return outer;
}

/* ============================================================
   GALLERY SEARCH FILTER
=============================================================== */
function initGallerySearch() {
  const input = document.getElementById('gallerySearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll('#galleryContainer img').forEach(img => {
      const text = (img.alt || '').toLowerCase();
      img.style.display = text.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('#compareRow .compare-caption').forEach(cap => {
      const text = cap.textContent.toLowerCase();
      const card = cap.parentElement;
      if (!card) return;
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* ============================================================
   HOMEPAGE – homePairs from gallery.json
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById('ba-grid');
  const template = document.getElementById('ba-card');
  const loadMoreBtn = document.getElementById('ba-loadmore');
  if (!grid || !template) return;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load gallery.json');
    const data = await res.json();
    const pairs = Array.isArray(data.homePairs) ? data.homePairs : [];
    let index = 0;
    const BATCH = 6;

    function renderMore() {
      const slice = pairs.slice(index, index + BATCH);
      slice.forEach(pair => {
        const card = template.content.cloneNode(true);
        const before = card.querySelector('.ba-before');
        const after = card.querySelector('.ba-after');
        const wrap = card.querySelector('.ba-after-wrap');
        const caption = card.querySelector('.ba-caption');
        const slider = card.querySelector('.ba-slider');

        before.src = 'images/' + pair.before;
        before.loading = 'lazy';
        after.src = 'images/' + pair.after;
        after.loading = 'lazy';
        caption.textContent = pair.label || '';

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

    renderMore();
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', renderMore);
  } catch (err) {
    console.error('Homepage BA error:', err);
  }
}

/* ============================================================
   MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();
});
