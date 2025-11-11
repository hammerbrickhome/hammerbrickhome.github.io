
// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if(navToggle && mainNav){
  navToggle.addEventListener('click', ()=> mainNav.classList.toggle('show'));
}

// Chat bubble
const chatToggle = document.querySelector('.chat-toggle');
const chatModal = document.querySelector('.chat-modal');
if(chatToggle && chatModal){
  chatToggle.addEventListener('click', ()=>{
    chatModal.style.display = chatModal.style.display === 'flex' ? 'none' : 'flex';
  });
}

// Service search filter
function filterServices(){
  const q = (document.getElementById('serviceSearch')?.value || '').toLowerCase();
  document.querySelectorAll('.service-grid .card').forEach(card=>{
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}
window.filterServices = filterServices;

// Gallery & before/after from gallery.json
async function loadGallery(){
  const galleryContainer = document.getElementById('galleryContainer');
  const compareRow = document.getElementById('compareRow');
  if(!galleryContainer && !compareRow) return;
  try{
    const res = await fetch('gallery.json', {cache:'no-store'});
    if(!res.ok) return;
    const data = await res.json();
    const files = data.images || [];

    const pairs = [
      {before:'before1.jpg', after:'after1.jpg'},
      {before:'before2.jpg', after:'after2.jpg'},
      {before:'before5.png', after:'after5.png'},
      {before:'before6.png', after:'after6.png'},
      {before:'before-test.png', after:'after-test.png'}
    ];

    if(compareRow){
      pairs.forEach(p=>{
        if(files.includes(p.before) && files.includes(p.after)){
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
          wrap.appendChild(b); wrap.appendChild(a); wrap.appendChild(lb1); wrap.appendChild(lb2);
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
  }catch(e){
    console.error('Gallery load error', e);
  }
}
function openLightbox(src){
  const lightbox = document.getElementById('lightbox');
  if(!lightbox) return;
  const img = lightbox.querySelector('img');
  img.src = src;
  lightbox.classList.add('show');
}
document.addEventListener('click', (e)=>{
  const lightbox = document.getElementById('lightbox');
  if(lightbox && e.target === lightbox){ lightbox.classList.remove('show'); }
});
document.addEventListener('DOMContentLoaded', loadGallery);
