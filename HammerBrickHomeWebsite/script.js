/* ======================================================
   Hammer Brick & Home — Full Merged Script (Final)
   Includes:
   - Your old functions (search, compare, lightbox, chat)
   - New reveal-on-scroll + pricing card animations
   ====================================================== */


/* ----------------------------------------------
   1. Reveal Animation (NEW UPGRADED)
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
   2. Search Services (YOUR ORIGINAL)
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
   3. Before/After Compare Slider (YOUR ORIGINAL)
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
   4. Lightbox (YOUR ORIGINAL)
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
   5. Chat Toggle (YOUR ORIGINAL)
   ---------------------------------------------- */
function toggleChat() {
  document.getElementById('chatModal').classList.toggle('show');
}


/* ----------------------------------------------
   6. Init on Load (MERGED)
   ---------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  wireCompare('cmp1');
  wireCompare('cmp2');
  wireLightbox();
});