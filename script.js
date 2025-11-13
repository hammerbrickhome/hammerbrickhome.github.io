/* ============================================================
   ✅ HEADER + FOOTER READY HOOKS (works with dynamic include)
=============================================================== */
function initHeaderInteractions() {
  /* --- Mobile nav toggle --- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  /* --- Dropdown (Service Areas) toggle --- */
  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  /* --- Chat bubble toggle --- */
  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

/* --- Run once the header/footer are injected --- */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initHeaderInteractions, 500);
});

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
   ✅ GALLERY PAGE — LOAD gallery.json (galleryGrid + galleryPairs)
=============================================================== */
async function loadGalleryPage() {
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');
  if (!galleryContainer && !compareRow) return;

  // Make centered Load More buttons dynamically
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

  let galleryMore, galleryMoreBtn, compareMore, compareMoreBtn;
  if (galleryContainer) {
    ({ row: galleryMore, btn: galleryMoreBtn } = makeLoadMoreRow('galleryLoadMore'));
    galleryContainer.parentNode.insertBefore(galleryMore, galleryContainer.nextSibling);
  }
  if (compareRow) {
    ({ row: compareMore, btn: compareMoreBtn } = makeLoadMoreRow('compareLoadMore'));
    compareRow.parentNode.insertBefore(compareMore, compareRow.nextSibling);
  }

  let shuffledGrid = [];
  let gridIndex = 0;
  let shuffledPairs = [];
  let pairsIndex = 0;
  const PAGE = 8;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    if (!res.ok) return;

    const data = await res.json();

    // 🔥 NEW JSON structure
    const grid = Array.isArray(data.galleryGrid) ? data.galleryGrid : [];
    const pairs = Array.isArray(data.galleryPairs) ? data.galleryPairs : [];

    shuffledGrid = shuffle(grid);
    shuffledPairs = shuffle(pairs);

    /* ---------------------------
       GRID RENDER
    ---------------------------- */
    function renderMoreGrid() {
      if (!galleryContainer) return;
      const slice = shuffledGrid.slice(gridIndex, gridIndex + PAGE);
      slice.forEach(name => {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = 'images/' + name;
        img.alt = 'Project Photo';
        img.className = 'grid-photo';
        img.onclick = () => openLightbox(img.src);
        galleryContainer.appendChild(img);
      });
      gridIndex += slice.length;
      if (galleryMoreBtn) {
        galleryMoreBtn.style.display = (gridIndex >= shuffledGrid.length) ? 'none' : 'inline-block';
      }
    }


    /* ---------------------------
       BEFORE/AFTER RENDER
    ---------------------------- */
    function buildCompareCard(pair) {
      const wrap = document.createElement('div');
      wrap.className = 'compare-item';

      const beforeImg = document.createElement('img');
      beforeImg.className = 'before-img';
      beforeImg.src = 'images/' + pair.before;

      const afterWrap = document.createElement('div');
      afterWrap.className = 'after-wrap';
      const afterImg = document.createElement('img');
      afterImg.className = 'after-img';
      afterImg.src = 'images/' + pair.after;
      afterWrap.appendChild(afterImg);

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

      wrap.appendChild(beforeImg);
      wrap.appendChild(afterWrap);
      wrap.appendChild(lbBefore);
      wrap.appendChild(lbAfter);
      wrap.appendChild(slider);

      if (pair.label) {
        const caption = document.createElement('div');
        caption.className = 'compare-caption';
        caption.textContent = pair.label;
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
        if (!p.before || !p.after) return;
        compareRow.appendChild(buildCompareCard(p));
      });
      pairsIndex += slice.length;
      if (compareMoreBtn) {
        compareMoreBtn.style.display = (pairsIndex >= shuffledPairs.length) ? 'none' : 'inline-block';
      }
    }

    // First load
    if (galleryContainer) renderMoreGrid();
    if (compareRow) renderMorePairs();

    if (galleryMoreBtn) galleryMoreBtn.addEventListener('click', renderMoreGrid);
    if (compareMoreBtn) compareMoreBtn.addEventListener('click', renderMorePairs);

  } catch (e) {
    console.error('Gallery load error', e);
  }
}


/* ============================================================
   ✅ LIGHTBOX
=============================================================== */
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
   ✅ HOMEPAGE — BEFORE & AFTER FROM gallery.json → homePairs
=============================================================== */
const BA_GRID = document.getElementById('ba-grid');
const BA_LOADMORE = document.getElementById('ba-loadmore');
const BA_TEMPLATE = document.getElementById('ba-card');

let allPairs = [];
let baIndex = 0;

async function loadPairsFromJSON() {
  try {
    const res = await fetch("gallery.json", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();

    // 🔥 Homepage now uses "homePairs"
    return data.homePairs || [];
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





