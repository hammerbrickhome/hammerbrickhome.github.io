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
   ✅ GALLERY PAGE — LOAD gallery.json (UNCHANGED)
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

    /* ✅ GALLERY PAGE — BEFORE/AFTER STATIC PAIRS */
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
   ✅ Supports BOTH hyphens AND underscores
   ✅ Supports numbered AND non-numbered filenames
=============================================================== */
const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');

let allPairs = [];
let baIndex = 0;

/* ✅ Allowed prefixes for your contractor work */
const PREFIXES = [
  "job", "paver", "masonry", "sidewalk", "stoop", "kitchen",
  "bath", "yard", "home", "project", "deck", "reno", "stone",
  "cement", "repair", "bwall", "point", "flag", "concrete"
];

/* ✅ Generate list of possible file names */
function generatePossibleNames() {
  const names = [];
  const endings = ["-before", "_before", "-after", "_after"];
  const exts = [".jpg", ".jpeg", ".png"];

  PREFIXES.forEach(pre => {
    /* ✅ Non-numbered (repair_before.png) */
    endings.forEach(end => {
      exts.forEach(ext => {
        names.push(`${pre}${end}${ext}`);
      });
    });

    /* ✅ Numbered (repair1_before.png) */
    for (let i = 1; i <= 200; i++) {
      endings.forEach(end => {
        exts.forEach(ext => {
          names.push(`${pre}${i}${end}${ext}`);
        });
      });
    }
  });

  return names;
}

/* ✅ Detect which files actually exist */
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

/* ✅ Normalize naming (underscore → hyphen) */
function normalizeName(name) {
  return name
    .replace("_before", "-before")
    .replace("_after", "-after");
}

/* ✅ Build usable BEFORE/AFTER pairs */
function buildPairs(files) {
  const norm = files.map(f => normalizeName(f));
  const pairs = [];

  norm.forEach(file => {
    if (file.includes("-before")) {
      const after = file.replace("-before", "-after");

      if (norm.includes(after)) {
        const realBefore = files[norm.indexOf(file)];
        const realAfter = files[norm.indexOf(after)];

        pairs.push({ before: realBefore, after: realAfter });
      }
    }
  });

  return pairs;
}

/* ✅ Shuffle pairs randomly */
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

    const caption = pair.before
      .replace(/[-_](before|after).*$/i, "")
      .replace(/[0-9]+$/, "");

    card.querySelector('.ba-caption').textContent = caption;

    const slider = card.querySelector('.ba-slider');
    slider.addEventListener('input', () => {
      card.querySelector('.ba-after-wrap').style.width = slider.value + '%';
    });

    BA_GRID.appendChild(card);
  });

  baIndex += slice.length;

  if (baIndex >= allPairs.length) BA_LOADMORE.style.display = "none";
}

/* ✅ Initialize homepage before/after */
async function initHomepageBA() {
  if (!BA_GRID) return;

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
   ✅ MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
});

