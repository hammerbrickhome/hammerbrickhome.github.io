

/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */
function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => mainNav.classList.toggle('show'));
  }

  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', e => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', evt => {
      if (!dropdown.contains(evt.target)) dropdown.classList.remove('show');
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
   UTIL — Shuffle
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
   GALLERY PAGE — LOAD IMAGES
=============================================================== */
async function loadGalleryPage() {
  const gridContainer = document.getElementById('galleryContainer');
  const baContainer = document.getElementById('compareRow');

  if (!gridContainer && !baContainer) return;

  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    const data = await res.json();

    const grid = shuffle(data.galleryGrid || []);
    const pairs = shuffle(data.galleryPairs || []);

    let gridIndex = 0;
    let pairIndex = 0;
    const BATCH = 8;

    /* ---------------- GRID LOADER ---------------- */
    function loadMoreGrid() {
      const slice = grid.slice(gridIndex, gridIndex + BATCH);
      slice.forEach(name => {
        const img = document.createElement('img');
        img.src = 'images/' + name;
        img.alt = name;
        img.className = 'grid-photo';
        img.onclick = () => openLightbox(img.src);
        gridContainer.appendChild(img);
      });
      gridIndex += slice.length;

      if (gridIndex >= grid.length) {
        document.getElementById('loadMoreGrid').style.display = 'none';
      }
    }

    /* ---------------- BEFORE/AFTER LOADER ---------------- */
    function buildCompareCard(pair) {
      const outer = document.createElement('div');

      const wrap = document.createElement('div');
      wrap.className = 'compare-item fade-in';

      const before = document.createElement('img');
      before.className = 'before-img';
      before.src = 'images/' + pair.before;

      const afterWrap = document.createElement('div');
      afterWrap.className = 'after-wrap';

      const after = document.createElement('img');
      after.className = 'after-img';
      after.src = 'images/' + pair.after;

      afterWrap.appendChild(after);

      const lbL = document.createElement('div');
      lbL.className = 'compare-label';
      lbL.textContent = 'Before';

      const lbR = document.createElement('div');
      lbR.className = 'compare-label right';
      lbR.textContent = 'After';

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
      wrap.appendChild(lbL);
      wrap.appendChild(lbR);
      wrap.appendChild(slider);

      const caption = document.createElement('div');
      caption.className = 'compare-caption';
      caption.textContent = pair.label;

      outer.appendChild(wrap);
      outer.appendChild(caption);

      return outer;
    }

    function loadMorePairs() {
      const slice = pairs.slice(pairIndex, pairIndex + BATCH);
      slice.forEach(p => baContainer.appendChild(buildCompareCard(p)));
      pairIndex += slice.length;

      if (pairIndex >= pairs.length) {
        document.getElementById('loadMoreBA').style.display = 'none';
      }
    }

    /* INITIAL LOAD */
    loadMoreGrid();
    loadMorePairs();

    /* BUTTONS */
    document.getElementById('loadMoreGrid').onclick = loadMoreGrid;
    document.getElementById('loadMoreBA').onclick = loadMorePairs;

  } catch (err) {
    console.log('Gallery load error:', err);
  }
}

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

    document.querySelectorAll('.compare-caption').forEach(cap => {
      const row = cap.parentElement;
      row.style.display = cap.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
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
  if (e.target.id === 'lightbox') {
    document.getElementById('lightbox').classList.remove('show');
  }
});

/* ============================================================
   INIT
=============================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPage();
  initGallerySearch();
});
