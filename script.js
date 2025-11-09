/* ======================================================
   Hammer Brick & Home — Full Script (Auto Version)
   FIXED Before/After Sliders + Auto Gallery + Drift
   ====================================================== */

/* 1) Reveal Animation */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal, .fade-in, .section, .pkg-card")
    .forEach(el => observer.observe(el));
})();

/* 2) Search Services */
function filterServices() {
  const q = (document.getElementById('search')?.value || '').toLowerCase();
  document.querySelectorAll('.cat').forEach(cat => {
    let any = false;
    cat.querySelectorAll('.card').forEach(el => {
      const show = el.textContent.toLowerCase().includes(q);
      el.style.display = show ? 'block' : 'none';
      if (show) any = true;
    });
    cat.style.display = any || q === '' ? 'block' : 'none';
  });
}

/* 3) Before/After slider wiring */
function wireCompare(id) {
  const cmp = document.getElementById(id);
  if (!cmp) return;
  const after = cmp.querySelector('.after');
  const range = cmp.querySelector('input[type=range]');
  range.addEventListener('input', e => {
    const v = e.target.value;
    after.style.clipPath = `inset(0 0 0 ${v}%)`;
  });
}

/* 4) Auto-Generated Before/After pairs (edit names here) */
const comparePairs = [
  { before: "before1.jpg",  after: "after1.jpg"  },
  { before: "before2.jpg",  after: "after2.jpg"  },
  { before: "before-test.png", after: "after-test.png" },
  { before: "before5.png",  after: "after5.png"  },

  // ✅ New ones you add
  { before: "before6.png", after: "after6.png" },
  { before: "before8.png", after: "after8.png" },
  { before: "before9.png", after: "after9.png" }
];

function buildCompareSection() {
  const container = document.getElementById("compareRow");
  if (!container) return;

  comparePairs.forEach((pair, i) => {
    const id = `cmp${i + 1}`;
    const block = document.createElement("div");
    block.className = "compare panel";
    block.id = id;
    block.innerHTML = `
      <div class="cmp-wrap">
        <img src="images/${pair.before}" class="cmp before" alt="before">
        <img src="images/${pair.after}"  class="cmp after"  alt="after">
      </div>
      <input type="range" min="0" max="100" value="50">
    `;
    container.appendChild(block);
    wireCompare(id);
  });
}

/* 5) Lightbox */
function wireLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('img');

  document.querySelectorAll('#gallery .gallery img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lb.classList.add('show');
    });
  });

  lb.addEventListener('click', () => lb.classList.remove('show'));
}

/* 6) Chat Toggle */
function toggleChat() {
  document.getElementById('chatModal').classList.toggle('show');
}
window.toggleChat = toggleChat; // so the inline onclick works

/* 7) Build Gallery from images/gallery.json (no manual JS edits needed) */
async function buildGallery() {
  const container = document.querySelector('#gallery .gallery');
  if (!container) return;

  // Keep any images already in the HTML and avoid duplicates
  const existing = new Set(
    [...container.querySelectorAll('img')].map(i => i.getAttribute('src')?.split('/').pop())
  );

  let files = [];
  try {
    const res = await fetch('images/gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Accept either ["a.jpg","b.jpg"] or {files:[...]}
    if (Array.isArray(data)) files = data;
    else if (Array.isArray(data.images)) files = data.images;

  } catch (e) {
    console.warn('gallery.json missing/invalid; using only static images in HTML.', e);
  }

  files.forEach(name => {
    if (!name) return;
    const clean = name.trim();
    if (existing.has(clean)) return;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = 'images/' + clean;
    img.alt = 'Gallery Photo';
    container.appendChild(img);
  });

  // Rebind lightbox (now that new imgs exist)
  wireLightbox();

  // Start drift after images are in place
  startAutoScroll(container);
}

/* 8) Smooth Auto-Scroll (pauses on hover/touch) */
function startAutoScroll(gal) {
  if (!gal) gal = document.querySelector('#gallery .gallery');
  if (!gal) return;

  let dir = 1;              // 1 = right, -1 = left
  let pause = false;
  const stepPx = 0.35;      // pixels per frame (slow luxury drift)

  const step = () => {
    if (!pause) {
      gal.scrollLeft += stepPx * dir;
      if (gal.scrollLeft + gal.clientWidth >= gal.scrollWidth - 2) dir = -1;
      if (gal.scrollLeft <= 2) dir = 1;
    }
    requestAnimationFrame(step);
  };

  gal.addEventListener('mouseenter', () => pause = true);
  gal.addEventListener('mouseleave', () => pause = false);
  gal.addEventListener('touchstart', () => pause = true, { passive: true });
  gal.addEventListener('touchend',   () => pause = false);

  requestAnimationFrame(step);
}

/* 9) Init on load */
document.addEventListener('DOMContentLoaded', () => {
  buildCompareSection();
  buildGallery(); // this function will call wireLightbox() and startAutoScroll()
});
