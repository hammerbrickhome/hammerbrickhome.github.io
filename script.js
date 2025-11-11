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
   ✅ GALLERY PAGE — LOAD gallery.json
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');

  if (!galleryContainer && !compareRow) return;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const files = data.images || [];

    if (compareRow) {
      const pairs = [
        { before: 'before1.jpg', after: 'after1.jpg' },
        { before: 'before2.jpg', after: 'after2.jpg' },
        { before: 'before5.png', after: 'after5.png' },
        { before: 'before6.png', after: 'after6.png' },
        { before: 'before-test.png', after: 'after-test.png' }
      ];

      pairs.forEach(p => {
        if (files.includes(p.before) && files.includes(p.after)) {
          const wrap = document.createElement('div');
          wrap.className = 'compare-item';

          const b = document.createElement('img');
          b.src = 'images/' + p.before;

          const a = document.createElement('img');
          a.src = 'images/' + p.after;

          const lb1 = document.createElement('div');
          lb1.className = 'compare-label';
          lb1.textContent = 'Before';

          const lb2 = document.createElement('div');
          lb2.className = 'compare-label right';
          lb2.textContent = 'After';

          wrap.appendChild(b);
          wrap.appendChild(a);
          wrap.appendChild(lb1);
          wrap.appendChild(lb2);
          compareRow.appendChild(wrap);
        }
      });
    }

    if (galleryContainer) {
      files.forEach(name => {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = 'images/' + name;
        img.alt = 'Hammer Brick & Home project photo';
        img.addEventListener('click', () => openLightbox(img.src));
        galleryContainer.appendChild(img);
      });
    }
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
=============================================================== */

const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');

let allPairs = [];
let baIndex = 0;

/* ✅ Load pairs from images.json */
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

/* ✅ Render 6 cards */
function renderNextSix() {
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
  if (baIndex >= allPairs.length) BA_LOADMORE.style.display = "none";
}

/* ✅ Initialize homepage */
async function initHomepageBA() {
  if (!BA_GRID) return;

  allPairs = await loadPairsFromJSON();

  if (allPairs.length === 0) {
    BA_GRID.innerHTML = "<p>No before/after pairs found.</p>";
    BA_LOADMORE.style.display = "none";
    return;
  }

  renderNextSix();
  BA_LOADMORE.addEventListener("click", renderNextSix);
}

/* ============================================================
   ✅ MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
});

