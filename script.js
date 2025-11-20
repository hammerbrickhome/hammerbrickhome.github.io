console.log("HEADER JS LOADED");

/* ============================================================
   ✅ HEADER + FOOTER READY HOOKS (works with dynamic include)
=============================================================== */
function initHeaderInteractions() {

  /* -------------------------------
     MOBILE NAV TOGGLE
  -------------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav   = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');

      // Close dropdowns when mobile menu is toggled
      document.querySelectorAll('.dropdown')
        .forEach(d => d.classList.remove('show'));
    });
  }

  /* -------------------------------
     CLICK-BASED DROPDOWNS (ALL)
  -------------------------------- */
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(drop => {
    const btn = drop.querySelector('.dropbtn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close others first
      dropdowns.forEach(d => {
        if (d !== drop) d.classList.remove('show');
      });

      // Toggle clicked dropdown
      drop.classList.toggle('show');
    });
  });

  /* -------------------------------
     CLOSE ALL ON OUTSIDE CLICK
  -------------------------------- */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(d => d.classList.remove('show'));
    }
  });


  /* -------------------------------
     CHAT BUBBLE TOGGLE
  -------------------------------- */
  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal  = document.querySelector('.chat-modal');

  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

/* Load interactions after DOM ready */
document.addEventListener('DOMContentLoaded', initHeaderInteractions);



/* ============================================================
   ✅ SERVICE FILTER (Services page)
=============================================================== */
function filterServices() {
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();

  document.querySelectorAll('.service-grid .card').forEach(card => {
    const match = card.textContent.toLowerCase().includes(q);
    card.style.display = match ? '' : 'none';
  });
}
window.filterServices = filterServices;


/* ============================================================
   ✅ UTIL: shuffle
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
   ✅ GALLERY PAGE — galleryPairs + galleryGrid
=============================================================== */
let galleryInitialized = false;

async function loadGalleryPage() {
  if (galleryInitialized) return;
  galleryInitialized = true;

  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow       = document.getElementById('compareRow');
  const baBtn            = document.getElementById('loadMoreBA');
  const gridBtn          = document.getElementById('loadMoreGrid');

  if (!galleryContainer && !compareRow) return;

  try {
    const res = await fetch('/gallery.json', { cache: 'no-store' });
    if (!res.ok) {
      console.error('gallery.json failed to load');
      return;
    }

    const data     = await res.json();
    const rawGrid  = Array.isArray(data.galleryGrid)  ? data.galleryGrid  : [];
    const rawPairs = Array.isArray(data.galleryPairs) ? data.galleryPairs : [];

    const grid  = shuffle(rawGrid);
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
      const card  = document.createElement('div');
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
      slider.min  = '0';
      slider.max  = '100';
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
      const slice = pairs.slice(pairIndex, pairIndex + PAGE);

      slice.forEach(pair => {
        if (!pair.before || !pair.after) return;

        const sk = makeSkeleton(230);
        compareRow.appendChild(sk);

        const card = buildCompareCard(pair);

        setTimeout(() => sk.replaceWith(card), 220);
      });

      pairIndex += slice.length;
      if (baBtn) {
        baBtn.style.display = pairIndex >= pairs.length ? 'none' : 'inline-block';
      }
    }

    function renderMoreGrid() {
      const slice = grid.slice(gridIndex, gridIndex + PAGE);

      slice.forEach(name => {
        const sk = makeSkeleton(180);
        galleryContainer.appendChild(sk);

        const img = new Image();
        img.src      = '/images/' + name;
        img.loading  = 'lazy';
        img.decoding = 'async';
        img.alt      = name;
        img.className = 'grid-photo';

        img.addEventListener('click', () => openLightbox(img.src));

        img.addEventListener('load', () => {
          img.classList.add('lazyloaded');
          sk.replaceWith(img);
        });
      });

      gridIndex += slice.length;

      if (gridBtn) {
        gridBtn.style.display = gridIndex >= grid.length ? 'none' : 'inline-block';
      }
    }

    if (compareRow && pairs.length) renderMorePairs();
    if (galleryContainer && grid.length) renderMoreGrid();

    if (baBtn)  baBtn.addEventListener('click', renderMorePairs);
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
      if (!card) return;

      card.style.display =
        cap.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}


/* ============================================================
   ✅ HOMEPAGE — BEFORE & AFTER
=============================================================== */
async function initHomepageBA() {
  const grid       = document.getElementById('ba-grid');
  const loadMoreBtn = document.getElementById('ba-loadmore');
  const template   = document.getElementById('ba-card');

  if (!grid || !template) return;

  let allPairs = [];
  let index    = 0;
  const BATCH  = 6;

  async function loadPairsFromJSON() {
    try {
      const res = await fetch('/gallery.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.homePairs) ? data.homePairs : [];
    } catch {
      return [];
    }
  }

  function renderNextSix() {
    const slice = allPairs.slice(index, index + BATCH);

    slice.forEach(pair => {
      const card    = template.content.cloneNode(true);
      const before  = card.querySelector('.ba-before');
      const after   = card.querySelector('.ba-after');
      const caption = card.querySelector('.ba-caption');
      const slider  = card.querySelector('.ba-slider');
      const wrap    = card.querySelector('.ba-after-wrap');

      before.src      = '/images/' + pair.before;
      after.src       = '/images/' + pair.after;
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

  allPairs = await loadPairsFromJSON();

  if (!allPairs.length) {
    grid.innerHTML = '<p>No before/after pairs found.</p>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  renderNextSix();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', renderNextSix);
  }
}


/* ============================================================
   ✅ MASTER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();
});


