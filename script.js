/* ============================================================
   HEADER + FOOTER INTERACTIONS
=============================================================== */
function initHeaderInteractions() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('show');
    });
  }

  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.querySelector('.dropdown');
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });
    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) dropdown.classList.remove('show');
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
   UTILS
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
   FADE-IN ANIMATIONS
=============================================================== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".fade-in, .fade-up").forEach((el) =>
    fadeObserver.observe(el)
  );
});

/* ============================================================
   LIGHTBOX
=============================================================== */
function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  lightbox.querySelector("img").src = src;
  lightbox.classList.add("show");
}

document.addEventListener("click", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && e.target === lightbox) lightbox.classList.remove("show");
});

/* ============================================================
   GALLERY PAGE LOADER
   (galleryPairs & galleryGrid)
=============================================================== */
async function loadGalleryPage() {
  const compareRow = document.getElementById('compareRow');
  const galleryContainer = document.getElementById('galleryContainer');

  if (!compareRow && !galleryContainer) return;

  try {
    const res = await fetch("gallery.json", { cache: "no-store" });
    const data = await res.json();

    // -------- BEFORE/AFTER --------
    const galleryPairs = shuffle(data.galleryPairs || []);
    let pairIndex = 0;
    const PAIR_BATCH = 8;

    function addMorePairs() {
      const slice = galleryPairs.slice(pairIndex, pairIndex + PAIR_BATCH);
      slice.forEach((pair) => {
        const skeleton = document.createElement("div");
        skeleton.className = "skeleton";
        skeleton.style.height = "260px";
        compareRow.appendChild(skeleton);

        const card = buildCompareCard(pair);
        setTimeout(() => skeleton.replaceWith(card), 300);
      });
      pairIndex += slice.length;
      if (pairIndex >= galleryPairs.length) {
        document.getElementById("loadMoreBA")?.style.setProperty("display","none");
      }
    }

    // -------- PHOTO GRID --------
    const galleryGrid = shuffle(data.galleryGrid || []);
    let gridIndex = 0;
    const GRID_BATCH = 8;

    function addMoreGrid() {
      const slice = galleryGrid.slice(gridIndex, gridIndex + GRID_BATCH);
      slice.forEach((name) => {
        const holder = document.createElement("div");
        holder.className = "skeleton";
        holder.style.height = "180px";
        galleryContainer.appendChild(holder);

        const img = new Image();
        img.src = "images/" + name;
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = name;
        img.onclick = () => openLightbox(img.src);

        img.onload = () => {
          img.classList.add("lazyloaded");
          holder.replaceWith(img);
        };
      });

      gridIndex += slice.length;
      if (gridIndex >= galleryGrid.length) {
        document.getElementById("loadMoreGrid")?.style.setProperty("display","none");
      }
    }

    // Initial Loads
    if (compareRow) addMorePairs();
    if (galleryContainer) addMoreGrid();

    // Button Handlers
    document.getElementById("loadMoreBA")?.addEventListener("click", addMorePairs);
    document.getElementById("loadMoreGrid")?.addEventListener("click", addMoreGrid);

  } catch (e) {
    console.error("Gallery load error", e);
  }
}

function buildCompareCard(pair) {
  const wrapper = document.createElement("div");
  wrapper.className = "compare-item fade-in";

  const before = document.createElement("img");
  before.className = "before-img";
  before.src = "images/" + pair.before;
  before.loading = "lazy";

  const afterWrap = document.createElement("div");
  afterWrap.className = "after-wrap";

  const after = document.createElement("img");
  after.className = "after-img";
  after.src = "images/" + pair.after;
  after.loading = "lazy";

  afterWrap.appendChild(after);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 100;
  slider.value = 50;
  slider.className = "slider-control";
  slider.oninput = () => (afterWrap.style.width = slider.value + "%");

  const lb1 = document.createElement("div");
  lb1.className = "compare-label";
  lb1.textContent = "Before";

  const lb2 = document.createElement("div");
  lb2.className = "compare-label right";
  lb2.textContent = "After";

  wrapper.appendChild(before);
  wrapper.appendChild(afterWrap);
  wrapper.appendChild(lb1);
  wrapper.appendChild(lb2);
  wrapper.appendChild(slider);

  const caption = document.createElement("div");
  caption.className = "compare-caption";
  caption.textContent = pair.label || "";
  const outer = document.createElement("div");
  outer.appendChild(wrapper);
  outer.appendChild(caption);
  return outer;
}

/* ============================================================
   HOMEPAGE – homePairs loader
=============================================================== */
async function initHomepageBA() {
  const grid = document.getElementById("ba-grid");
  if (!grid) return;

  try {
    const res = await fetch("gallery.json", { cache: "no-store" });
    const data = await res.json();
    const pairs = data.homePairs || [];
    let index = 0;
    const BATCH = 6;

    function renderMore() {
      const slice = pairs.slice(index, index + BATCH);
      slice.forEach((pair) => {
        const card = document.getElementById("ba-card").content.cloneNode(true);

        const before = card.querySelector(".ba-before");
        const after = card.querySelector(".ba-after");
        const wrap = card.querySelector(".ba-after-wrap");

        before.src = "images/" + pair.before;
        after.src = "images/" + pair.after;

        before.loading = "lazy";
        after.loading = "lazy";

        before.onload = () => before.classList.add("lazyloaded");
        after.onload = () => after.classList.add("lazyloaded");

        card.querySelector(".ba-caption").textContent = pair.label;
        card.querySelector(".ba-slider").addEventListener("input", (e) => {
          wrap.style.width = e.target.value + "%";
        });

        grid.appendChild(card);
      });

      index += slice.length;
      if (index >= pairs.length) {
        document.getElementById("ba-loadmore")?.style.setProperty("display","none");
      }
    }

    renderMore();
    document.getElementById("ba-loadmore")?.addEventListener("click", renderMore);

  } catch (e) {
    console.error("Homepage BA error", e);
  }
}

/* ============================================================
   MASTER INIT
=============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadGalleryPage();
  initHomepageBA();
});






