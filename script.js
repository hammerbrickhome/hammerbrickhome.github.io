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
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card => {
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}
window.filterServices = filterServices;

/* ============================================================
   ✅ GALLERY PAGE — LOAD gallery.json (UNCHANGED)
   This ONLY runs on gallery.html because #galleryContainer exists
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');

  if (!galleryContainer && !compareRow) return; // not on gallery page

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const files = data.images || [];

    /* ✅ BEFORE/AFTER ON GALLERY PAGE ONLY */
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

    /* ✅ REGULAR GALLERY IMAGES */
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
   ✅ HOMEPAGE — AUTO BEFORE & AFTER
=============================================================== */
const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');

let allPairs = [];
let baIndex = 0;

/* ✅ Generate list of possible before/after filenames */
function generatePossibleNames() {
  const prefixes = [
    "job", "paver", "masonry", "sidewalk", "stoop", "kitchen",
    "bath", "yard", "home", "project", "deck", "reno", "stone",
    "cement", "repair", "bwall", "point", "flag", "concrete"
  ];

  let names = [];
  for (let i = 1; i <= 200; i++) {
    prefixes.forEach(pre => {
      names.push(`${pre}${i}-before.jpg`);
      names.push(`${pre}${i}-after.jpg`);
      names.push(`${pre}${i}-before.png`);
      names.push(`${pre}${i}-after.png`);
      names.push(`${pre}${i}-before.jpeg`);
      names.push(`${pre}${i}-after.jpeg`);
    });
  }
  return names;
}

/* ✅ Fetch image list by brute request ping (fast + reliable) */
async function detectImages() {
  const candidates = generatePossibleNames();
  const found = [];

  const checks = candidates.map(async file => {
    try {
      const res = await fetch(`images/${file}`, { method: 'HEAD' });
      if (res.ok) found.push(file);
    } catch (e) {}
  });

  await Promise.all(checks);
  return found;
}

/* ✅ Convert found files into usable before/after pairs */
function buildPairs(files) {
  const pairs = [];

  files.forEach(file => {
    if (file.includes("-before")) {
      const after = file.replace("-before", "-after");
      if (files.includes(after)) {
        pairs.push({ before: file, after: after });
      }
    }
  });

  return pairs;
}

/* ✅ Shuffle array */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* ✅ Render 6 cards at a time */
function renderNextSix() {
  const slice = allPairs.slice(baIndex, baIndex + 6);

  slice.forEach(pair => {
    const card = BA_TEMPLATE.content.cloneNode(true);
    card.querySelector('.ba-before').src = 'images/' + pair.before;
    card.querySelector('.ba-after').src = 'images/' + pair.after;

    const caption = pair.before.split('-before')[0];
    card.querySelector('.ba-caption').textContent = caption.replace(/[\d]+$/, "");

    const frame = card.querySelector('.ba-frame');
    const slider = card.querySelector('.ba-slider');

    slider.addEventListener('input', () => {
      card.querySelector('.ba-after-wrap').style.width = slider.value + '%';
    });

    BA_GRID.appendChild(card);
  });

  baIndex += slice.length;

  if (baIndex >= allPairs.length) {
    BA_LOADMORE.style.display = "none";
  }
}

/* ✅ Homepage initializer */
async function initHomepageBA() {
  if (!BA_GRID) return; // Not homepage

  const files = await detectImages();
  allPairs = shuffle(buildPairs(files));

  if (allPairs.length === 0) {
    BA_GRID.innerHTML = "<p>No before/after pairs detected.</p>";
    BA_LOADMORE.style.display = "none";
    return;
  }

  renderNextSix();
  BA_LOADMORE.addEventListener("click", renderNextSix);
}

/* ============================================================
   ✅ MASTER INIT — Runs both systems as needed
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();     // gallery page only
  initHomepageBA();      // homepage only
});

