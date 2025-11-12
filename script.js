/* ============================================================
   ✅ Mobile Nav Toggle + Auto-Close
=============================================================== */
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
  document.querySelectorAll('.main-nav a').forEach(link =>
    link.addEventListener('click', () => mainNav.classList.remove('show'))
  );
}

/* ============================================================
   ✅ Chat Bubble Toggle (Esc closes)
=============================================================== */
const chatToggle = document.querySelector('.chat-toggle');
const chatModal = document.querySelector('.chat-modal');
if (chatToggle && chatModal) {
  chatToggle.addEventListener('click', () => {
    chatModal.style.display = chatModal.style.display === 'flex' ? 'none' : 'flex';
  });
  chatToggle.addEventListener('keydown', e => {
    if (e.key === 'Escape') chatModal.style.display = 'none';
  });
}

/* ============================================================
   ✅ Service Filter
=============================================================== */
function filterServices() {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card, .service-grid .service-button')
    .forEach(card => (card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none'));
}
window.filterServices = filterServices;

/* ============================================================
   ✅ Utility: Shuffle Array
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
   ✅ Gallery Page Loader
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');
  if (!galleryContainer && !compareRow) return;

  const makeLoadMoreRow = id => {
    const row = document.createElement('div');
    row.className = 'loadmore-row';
    const btn = document.createElement('button');
    btn.className = 'gold-btn';
    btn.id = id;
    btn.type = 'button';
    btn.textContent = 'Load 8 more';
    row.appendChild(btn);
    return { row, btn };
  };

  let galleryMoreBtn, compareMoreBtn;
  if (galleryContainer) {
    const { row, btn } = makeLoadMoreRow('galleryLoadMore');
    galleryContainer.after(row);
    galleryMoreBtn = btn;
  }
  if (compareRow) {
    const { row, btn } = makeLoadMoreRow('compareLoadMore');
    compareRow.after(row);
    compareMoreBtn = btn;
  }

  let shuffledGrid = [], gridIndex = 0, shuffledPairs = [], pairsIndex = 0;
  const PAGE = 8;

  try {
    const res = await fetch('gallery.json', { cache: 'force-cache' });
    if (!res.ok) return;
    const data = await res.json();
    const grid = Array.isArray(data.grid) ? data.grid : data.images || [];
    const pairs = Array.isArray(data.pairs) ? data.pairs : [];

    shuffledGrid = shuffle(grid);
    shuffledPairs = shuffle(pairs);

    function renderMoreGrid() {
      const slice = shuffledGrid.slice(gridIndex, gridIndex + PAGE);
      slice.forEach(name => {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = 'images/' + name;
        img.alt = 'Hammer Brick & Home project photo';
        img.onerror = () => (img.src = 'images/fallback.jpg');
        img.addEventListener('click', () => openLightbox(img.src));
        galleryContainer.appendChild(img);
      });
      gridIndex += slice.length;
      if (galleryMoreBtn && gridIndex >= shuffledGrid.length) galleryMoreBtn.style.display = 'none';
    }

    function buildCompareCard(pair) {
      const wrap = document.createElement('div');
      wrap.className = 'compare-item';

      const beforeImg = document.createElement('img');
      beforeImg.className = 'before-img';
      beforeImg.src = 'images/' + pair.before;
      beforeImg.alt = (pair.label || 'Project') + ' — Before';
      beforeImg.onerror = () => (beforeImg.src = 'images/fallback.jpg');

      const afterWrap = document.createElement('div');
      afterWrap.className = 'after-wrap';
      const afterImg = document.createElement('img');
      afterImg.className = 'after-img';
      afterImg.src = 'images/' + pair.after;
      afterImg.alt = (pair.label || 'Project') + ' — After';
      afterImg.onerror = () => (afterImg.src = 'images/fallback.jpg');
      afterWrap.appendChild(afterImg);

      const lbBefore = Object.assign(document.createElement('div'), { className: 'compare-label', textContent: 'Before' });
      const lbAfter = Object.assign(document.createElement('div'), { className: 'compare-label right', textContent: 'After' });

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0; slider.max = 100; slider.value = 50;
      slider.className = 'slider-control';
      slider.addEventListener('input', () => (afterWrap.style.width = slider.value + '%'));

      wrap.append(beforeImg, afterWrap, lbBefore, lbAfter, slider);
      if (pair.label) {
        const caption = document.createElement('div');
        caption.className = 'compare-caption';
        caption.textContent = pair.label;
        const outer = document.createElement('div');
        outer.append(wrap, caption);
        return outer;
      }
      return wrap;
    }

    function renderMorePairs() {
      const slice = shuffledPairs.slice(pairsIndex, pairsIndex + PAGE);
      slice.forEach(p => p?.before && p?.after && compareRow.append(buildCompareCard(p)));
      pairsIndex += slice.length;
      if (compareMoreBtn && pairsIndex >= shuffledPairs.length) compareMoreBtn.style.display = 'none';
    }

    if (galleryContainer) renderMoreGrid();
    if (compareRow) renderMorePairs();

    galleryMoreBtn?.addEventListener('click', renderMoreGrid);
    compareMoreBtn?.addEventListener('click', renderMorePairs);
  } catch (e) {
    console.error('Gallery load error', e);
  }
}

/* ============================================================
   ✅ Lightbox (scroll-lock)
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.querySelector('img').src = src;
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden';
}
document.addEventListener('click', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && e.target === lightbox) {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   ✅ Homepage Before/After loader
=============================================================== */
const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');
let allPairs = [], baIndex = 0;

async function loadPairsFromJSON() {
  try {
    const res = await fetch('images.json', { cache: 'force-cache' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pairs || [];
  } catch {
    return [];
  }
}
function renderNextSix() {
  if (!BA_GRID) return;
  const slice = allPairs.slice(baIndex, baIndex + 6);
  slice.forEach(pair => {
    const card = BA_TEMPLATE.content.cloneNode(true);
    card.querySelector('.ba-before').src = 'images/' + pair.before;
    card.querySelector('.ba-after').src = 'images/' + pair.after;
    card.querySelector('.ba-caption').textContent = pair.label || '';
    const slider = card.querySelector('.ba-slider');
    slider.addEventListener('input', () =>
      card.querySelector('.ba-after-wrap').style.width = slider.value + '%'
    );
    BA_GRID.appendChild(card);
  });
  baIndex += slice.length;
  if (BA_LOADMORE && baIndex >= allPairs.length) BA_LOADMORE.style.display = 'none';
}
async function initHomepageBA() {
  if (!BA_GRID) return;
  allPairs = await loadPairsFromJSON();
  if (allPairs.length === 0) {
    BA_GRID.innerHTML = '<p>No before/after pairs found.</p>';
    if (BA_LOADMORE) BA_LOADMORE.style.display = 'none';
    return;
  }
  renderNextSix();
  BA_LOADMORE?.addEventListener('click', renderNextSix);
}

/* ============================================================
   ✅ Init
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
});






