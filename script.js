/* ---------------------------
   ✅ Mobile nav toggle
---------------------------- */
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('show');
  });
}

/* ---------------------------
   ✅ Chat bubble toggle
---------------------------- */
const chatToggle = document.querySelector('.chat-toggle');
const chatModal = document.querySelector('.chat-modal');

if (chatToggle && chatModal) {
  chatToggle.addEventListener('click', () => {
    chatModal.style.display =
      chatModal.style.display === 'flex' ? 'none' : 'flex';
  });
}

/* ---------------------------
   ✅ Service Filter
---------------------------- */
function filterServices() {
  const q =
    (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card => {
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}
window.filterServices = filterServices;

/* ============================================================
   ✅ UTIL: shuffle and chunk
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
   ✅ GALLERY PAGE — LOAD gallery.json (separate Grid & Pairs)
   - Shows 8 initially for each
   - Centered gold "Load 8 more" buttons
   - Golden slider + labels + golden bold captions
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');
  if (!galleryContainer && !compareRow) return;

  // Create "Load More" rows (centered) without editing your HTML
  const makeLoadMoreRow = (id) => {
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

  // Insert the button rows right after each grid
  let galleryMore, galleryMoreBtn, compareMore, compareMoreBtn;
  if (galleryContainer) {
    ({ row: galleryMore, btn: galleryMoreBtn } = makeLoadMoreRow('galleryLoadMore'));
    galleryContainer.parentNode.insertBefore(galleryMore, galleryContainer.nextSibling);
  }
  if (compareRow) {
    ({ row: compareMore, btn: compareMoreBtn } = makeLoadMoreRow('compareLoadMore'));
    compareRow.parentNode.insertBefore(compareMore, compareRow.nextSibling);
  }

  // State for pagination
  let shuffledGrid = [];
  let gridIndex = 0;
  let shuffledPairs = [];
  let pairsIndex = 0;
  const PAGE = 8;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();
    const grid = Array.isArray(data.grid) ? data.grid : (Array.isArray(data.images) ? data.images : []);
    const pairs = Array.isArray(data.pairs) ? data.pairs : [];

    // Shuffle so it's “random 8”
    shuffledGrid = shuffle(grid);
    shuffledPairs = shuffle(pairs);

    /* =========================
       PHOTO GRID RENDER
    ==========================*/
    function renderMoreGrid() {
      if (!galleryContainer) return;
      const slice = shuffledGrid.slice(gridIndex, gridIndex + PAGE);
      slice.forEach(name => {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = 'images/' + name;
        img.alt = 'Hammer Brick & Home project photo';
        img.addEventListener('click', () => openLightbox(img.src));
        galleryContainer.appendChild(img);
      });
      gridIndex += slice.length;

      if (galleryMoreBtn) {
        galleryMoreBtn.style.display = (gridIndex >= shuffledGrid.length) ? 'none' : 'inline-block';
      }
    }

    /* =========================
       BEFORE/AFTER RENDER (slider)
    ==========================*/
    function buildCompareCard(pair) {
      // Wrapper
      const wrap = document.createElement('div');
      wrap.className = 'compare-item';

      // Before image
      const beforeImg = document.createElement('img');
      beforeImg.className = 'before-img';
      beforeImg.src = 'images/' + pair.before;
      beforeImg.alt = (pair.label ? pair.label + ' — ' : '') + 'Before';

      // After wrap + image (starts 50%)
      const afterWrap = document.createElement('div');
      afterWrap.className = 'after-wrap';
      const afterImg = document.createElement('img');
      afterImg.className = 'after-img';
      afterImg.src = 'images/' + pair.after;
      afterImg.alt = (pair.label ? pair.label + ' — ' : '') + 'After';
      afterWrap.appendChild(afterImg);

      // Labels
      const lbBefore = document.createElement('div');
      lbBefore.className = 'compare-label';
      lbBefore.textContent = 'Before';
      const lbAfter = document.createElement('div');
      lbAfter.className = 'compare-label right';
      lbAfter.textContent = 'After';

      // Slider (gold)
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '100';
      slider.value = '50';
      slider.className = 'slider-control';
      slider.addEventListener('input', () => {
        afterWrap.style.width = slider.value + '%';
      });

      wrap.appendChild(beforeImg);
      wrap.appendChild(afterWrap);
      wrap.appendChild(lbBefore);
      wrap.appendChild(lbAfter);
      wrap.appendChild(slider);

      // Golden caption below (centered & bold)
      if (pair.label) {
        const caption = document.createElement('div');
        caption.className = 'compare-caption';
        caption.textContent = pair.label;
        // put caption after card
        const outer = document.createElement('div');
        outer.appendChild(wrap);
        outer.appendChild(caption);
        return outer;
      }

      return wrap;
    }

    function renderMorePairs() {
      if (!compareRow) return;
      const slice = shuffledPairs.slice(pairsIndex, pairsIndex + PAGE);
      slice.forEach(p => {
        if (!p || !p.before || !p.after) return;
        compareRow.appendChild(buildCompareCard(p));
      });
      pairsIndex += slice.length;

      if (compareMoreBtn) {
        compareMoreBtn.style.display = (pairsIndex >= shuffledPairs.length) ? 'none' : 'inline-block';
      }
    }

    // Initial 8 load each (if present)
    if (galleryContainer) renderMoreGrid();
    if (compareRow) renderMorePairs();

    // Button handlers
    if (galleryMoreBtn) galleryMoreBtn.addEventListener('click', renderMoreGrid);
    if (compareMoreBtn) compareMoreBtn.addEventListener('click', renderMorePairs);

    // If no data, hide buttons cleanly
    if (galleryMoreBtn && shuffledGrid.length <= PAGE) galleryMoreBtn.style.display = 'none';
    if (compareMoreBtn && shuffledPairs.length <= PAGE) compareMoreBtn.style.display = 'none';

  } catch (e) {
    console.error('Gallery load error', e);
  }
}

/* ---------------------------
   ✅ Lightbox
---------------------------- */
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.querySelector('img').src = src;
  lightbox.classList.add('show');
}

document.addEventListener('click', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && e.target === lightbox) {
    lightbox.classList.remove('show');
  }
});

/* ============================================================
   ✅ HOMEPAGE — BEFORE & AFTER FROM images.json ONLY
   (unchanged)
=============================================================== */
const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');

let allPairs = [];
let baIndex = 0;

async function loadPairsFromJSON() {
  try {
    const res = await fetch("images.json", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pairs || [];
  } catch (e) {
    console.error("JSON load error", e);
    return [];
  }
}

function renderNextSix() {
  if (!BA_GRID) return;
  const slice = allPairs.slice(baIndex, baIndex + 6);
  slice.forEach(pair => {
    const card = BA_TEMPLATE.content.cloneNode(true);
    card.querySelector('.ba-before').src = "images/" + pair.before;
    card.querySelector('.ba-after').src  = "images/" + pair.after;
    card.querySelector('.ba-caption').textContent = pair.label || "";
    const slider = card.querySelector('.ba-slider');
    slider.addEventListener('input', () => {
      card.querySelector('.ba-after-wrap').style.width = slider.value + '%';
    });
    BA_GRID.appendChild(card);
  });
  baIndex += slice.length;
  if (BA_LOADMORE && baIndex >= allPairs.length) BA_LOADMORE.style.display = "none";
}

async function initHomepageBA() {
  if (!BA_GRID) return;
  allPairs = await loadPairsFromJSON();
  if (allPairs.length === 0) {
    BA_GRID.innerHTML = "<p>No before/after pairs found.</p>";
    if (BA_LOADMORE) BA_LOADMORE.style.display = "none";
    return;
  }
  renderNextSix();
  if (BA_LOADMORE) BA_LOADMORE.addEventListener("click", renderNextSix);
}

/* ============================================================
   ✅ MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
});




