<script>
/* ============================================================
   ✅ HEADER + FOOTER READY HOOKS
=============================================================== */
function initHeaderInteractions() {

  // --- Mobile nav toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  // --- Dropdowns (ALL dropdowns) ---
  const list = document.querySelectorAll('.dropdown');

  list.forEach(drop => {
    const btn = drop.querySelector('.dropbtn');
    const menu = drop.querySelector('.dropdown-content');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // close other dropdowns
      list.forEach(d => {
        if (d !== drop) d.classList.remove('show');
      });

      drop.classList.toggle('show');
    });
  });

  // Click outside — close all dropdowns
  document.addEventListener('click', () => {
    list.forEach(d => d.classList.remove('show'));
  });

  // --- Chat bubble toggle ---
  const chatToggle = document.querySelector('.chat-toggle');
  const chatModal = document.querySelector('.chat-modal');
  if (chatToggle && chatModal) {
    chatToggle.addEventListener('click', () => {
      chatModal.style.display =
        chatModal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

/* ============================================================
   RUN HEADER INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initHeaderInteractions, 500);
});

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
   SHUFFLE
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
   GALLERY PAGE
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
    if (!res.ok) return;

    const data = await res.json();

    const grid = shuffle(data.galleryGrid || []);
    const pairs = shuffle(data.galleryPairs || []);

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

      const afterWrap = document.createElement('div');
      afterWrap.className = 'ba-after-wrap';

      const after = document.createElement('img');
      after.className = 'ba-after';
      after.src = '/images/' + pair.after;

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
      const slice = pairs.slice(pairIndex, pairIndex + PAGE);
      slice.forEach(pair => {
        const sk = makeSkeleton(230);
        compareRow.appendChild(sk);
        const card = buildCompareCard(pair);
        setTimeout(() => sk.replaceWith(card), 200);
      });
      pairIndex += slice.length;

      if (baBtn) baBtn.style.display = pairIndex >= pairs.length ? 'none' : 'inline-block';
    }

    function renderMoreGrid() {
      const slice = grid.slice(gridIndex, gridIndex + PAGE);
      slice.forEach(name => {
        const sk = makeSkeleton(180);
        galleryContainer.appendChild(sk);

        const img = new Image();
        img.src = '/images/' + name;
        img.className = 'grid-photo';
        img.addEventListener('load', () => sk.replaceWith(img));
      });
      gridIndex += slice.length;

      if (gridBtn) gridBtn.style.display = gridIndex >= grid.length ? 'none' : 'inline-block';
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
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.querySelector('img').src = src;
  lb.classList.add('show');
}

document.addEventListener('click', e => {
  const lb = document.getElementById('lightbox');
  if (lb && e.target === lb) lb.classList.remove('show');
});

/* ============================================================
   HOMEPAGE BEFORE/AFTER
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById('ba-grid');
  const loadMoreBtn = document.getElementById('ba-loadmore');
  const template = document.getElementById('ba-card');

  if (!grid || !template) return;

  const res = await fetch('/gallery.json', { cache: 'no-store' });
  if (!res.ok) return;

  const data = await res.json();
  const allPairs = data.homePairs || [];

  let index = 0;
  const BATCH = 6;

  function renderNext() {
    const slice = allPairs.slice(index, index + BATCH);
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
    if (loadMoreBtn && index >= allPairs.length) {
      loadMoreBtn.style.display = 'none';
    }
  }

  renderNext();
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', renderNext);
}

/* ============================================================
   MASTER INIT
=============================================================== */
window.addEventListener('load', () => {
  loadGalleryPage();
  initHomepageBA();
  initGallerySearch();
});
</script>
