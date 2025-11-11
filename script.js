// ==================================================
// Mobile nav toggle
// ==================================================
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if(navToggle && mainNav){
  navToggle.addEventListener('click', ()=> mainNav.classList.toggle('show'));
}

// ==================================================
// Chat bubble
// ==================================================
const chatToggle = document.querySelector('.chat-toggle');
const chatModal = document.querySelector('.chat-modal');
if(chatToggle && chatModal){
  chatToggle.addEventListener('click', ()=>{
    chatModal.style.display = chatModal.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ==================================================
// Service search filter
// ==================================================
function filterServices(){
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card=>{
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}
window.filterServices = filterServices;

// ==================================================
// GALLERY PAGE LOGIC (compareRow + galleryContainer)
// ==================================================
async function loadGalleryPage(files){
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');

  if(compareRow){
    // Old fixed Before/After pairs for gallery page only
    const pairs = [
      {before:'before1.jpg', after:'after1.jpg'},
      {before:'before2.jpg', after:'after2.jpg'},
      {before:'before5.png', after:'after5.png'},
      {before:'before6.png', after:'after6.png'},
      {before:'before-test.png', after:'after-test.png'}
    ];

    pairs.forEach(p=>{
      if(files.includes(p.before) && files.includes(p.after)){
        const wrap = document.createElement('div');
        wrap.className = 'compare-item';

        wrap.innerHTML = `
          <img src="images/${p.before}" alt="Before">
          <img src="images/${p.after}" alt="After">
          <div class="compare-label">Before</div>
          <div class="compare-label right">After</div>
        `;

        compareRow.appendChild(wrap);
      }
    });
  }

  if(galleryContainer){
    files.forEach(name=>{
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = 'images/' + name;
      img.alt = 'Hammer Brick & Home project photo';
      img.addEventListener('click', ()=>openLightbox(img.src));
      galleryContainer.appendChild(img);
    });
  }
}

// ==================================================
// HOMEPAGE BEFORE/AFTER AUTO SYSTEM (ba-grid)
// ==================================================

function buildBeforeAfter(filenameSet, container){

  filenameSet.forEach(pair => {
    const tpl = document.getElementById("ba-card");
    if(!tpl) return;

    const node = tpl.content.cloneNode(true);

    const beforeImg = node.querySelector(".ba-before");
    const afterImg  = node.querySelector(".ba-after");
    const slider    = node.querySelector(".ba-slider");

    beforeImg.src = "images/" + pair.before;
    afterImg.src  = "images/" + pair.after;

    // slider control
    slider.addEventListener("input", e=>{
      node.querySelector(".ba-after-wrap").style.width = e.target.value + "%";
    });

    container.appendChild(node);
  });
}

function loadHomepageBeforeAfter(files){
  const container = document.getElementById("ba-grid");
  const loadMoreBtn = document.getElementById("ba-loadmore");

  if(!container) return; // homepage only

  // auto-detect pairs: something-before.jpg / something-after.jpg
  const beforeFiles = files.filter(f=>f.toLowerCase().includes("before"));
  const afterFiles  = files.filter(f=>f.toLowerCase().includes("after"));

  const pairs = [];

  beforeFiles.forEach(b=>{
    const base = b.toLowerCase().replace("before", "").replace(/\.(jpg|jpeg|png)$/,"");
    const match = afterFiles.find(a => a.toLowerCase().includes(base));
    if(match) pairs.push({before:b, after:match});
  });

  // Shuffle pairs
  const shuffled = pairs.sort(()=>Math.random() - 0.5);

  let index = 0;
  const chunkSize = 6;

  function loadChunk(){
    const slice = shuffled.slice(index, index+chunkSize);
    buildBeforeAfter(slice, container);
    index += chunkSize;
    if(index >= shuffled.length) loadMoreBtn.style.display = "none";
  }

  loadChunk();
  loadMoreBtn.addEventListener("click", loadChunk);
}

// ==================================================
// Master loader (fetch gallery.json once)
// ==================================================
async function loadData(){
  try{
    const res = await fetch('gallery.json', {cache:'no-store'});
    if(!res.ok) return;
    const data = await res.json();
    const files = data.images || [];

    // Run gallery page
    loadGalleryPage(files);

    // Run homepage BA system
    loadHomepageBeforeAfter(files);

  }catch(e){
    console.error("Load error", e);
  }
}

document.addEventListener('DOMContentLoaded', loadData);

// ==================================================
// Lightbox
// ==================================================
function openLightbox(src){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  lightbox.querySelector('img').src = src;
  lightbox.classList.add('show');
}
document.addEventListener('click', (e)=>{
  const lightbox = document.getElementById('lightbox');
  if(lightbox && e.target === lightbox){
    lightbox.classList.remove('show');
  }
});
