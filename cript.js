/* ======================================================
   Hammer Brick & Home — Full Script (Auto Version)
   Includes:
   - Reveal animation
   - Search filter
   - Before/After auto sliders
   - Auto Gallery from JSON
   - Lightbox
   - Chat toggle
   ====================================================== */


/* ----------------------------------------------
   1. Reveal Animation
   ---------------------------------------------- */
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


/* ----------------------------------------------
   2. Search Services
   ---------------------------------------------- */
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


/* ----------------------------------------------
   3. Before/After Compare Slider Wiring
   ---------------------------------------------- */
function wireCompare(id) {
  const cmp = document.getElementById(id);
  if (!cmp) return;

  const after = cmp.querySelector('.after');
  const range = cmp.querySelector('input[type=range]');

  range.addEventListener('input', e => {
    const v = e.target.value; // 0..100
    after.style.clipPath = `inset(0 0 0 ${v}%)`;
  });
}


/* ----------------------------------------------
   4. Auto-Generated Before/After Sliders
   ---------------------------------------------- */

const comparePairs = [
  { before: "before1.jpg", after: "after1.jpg" },
  { before: "before2.jpg", after: "after2.jpg" }
    { before: "before-test.png", after: "after-test.png" } // ✅ Add this
];
 
function buildCompareSection() {
  const container = document.getElementById("beforeafter");
  if (!container) return;

  comparePairs.forEach((pair, i) => {
    const id = `cmp${i + 1}`;

    const block = document.createElement("div");
    block.className = "compare panel";
    block.id = id;

    block.innerHTML = `
      <img src="images/${pair.before}" alt="before">
      <img class="after" src="images/${pair.after}" alt="after">
      <input type="range" min="0" max="100" value="50">
    `;

    container.appendChild(block);
    wireCompare(id);
  });
}


/* ----------------------------------------------
   5. Lightbox
   ---------------------------------------------- */
function wireLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg = lb.querySelector('img');

  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lb.classList.add('show');
    });
  });

  lb.addEventListener('click', () => lb.classList.remove('show'));
}


/* ----------------------------------------------
   6. Chat Toggle
   ---------------------------------------------- */
function toggleChat() {
  document.getElementById('chatModal').classList.toggle('show');
}


/* ----------------------------------------------
   7. Auto Gallery (Loads from gallery.json)
   ---------------------------------------------- */
async function buildGallery() {
  const container = document.getElementById("galleryContainer");
  if (!container) return;

  try {
    const res = await fetch("images/gallery.json");
    const images = await res.json();

    images.forEach(src => {
      const img = document.createElement("img");
      img.src = "images/" + src;
      img.alt = "Gallery Photo";
      container.appendChild(img);
    });

    wireLightbox(); // reapply for new images
  } catch (e) {
    console.error("Gallery JSON missing or invalid.", e);
  }
}


/* ----------------------------------------------
   8. Initialize on Load
   ---------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  buildCompareSection();  // ✅ Auto Before/After Sliders
  buildGallery();         // ✅ Auto Gallery
});


