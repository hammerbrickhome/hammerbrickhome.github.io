
// Limit image sizes for faster delivery
function limitImageSizes(){
  document.querySelectorAll('img').forEach(img=>{
    if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    img.setAttribute('fetchpriority','low');
  });
}

// Build gallery from gallery.json (keeps file names; you can upload into /images)
async function buildGallery(){
  const grid = document.getElementById('galleryContainer');
  if(!grid) return;
  try{
    const res = await fetch('gallery.json');
    const data = await res.json();
    const items = (data.images || data || []).filter(x=>/\.(png|jpg|jpeg|webp)$/i.test(x));
    items.forEach(name=>{
      const el = document.createElement('img');
      el.src = `images/${name}`;
      el.alt = name.split('.')[0].replace(/[-_]/g,' ');
      el.width = 480; el.height = 320;
      el.loading = 'lazy';
      el.addEventListener('click', ()=> openLightbox(el.src));
      grid.appendChild(el);
    });
  }catch(e){ console.warn('Gallery skipped', e); }
}

// Make pairs for before/after from names like before1.jpg & after1.jpg
async function buildBeforeAfter(){
  const wrap = document.getElementById('compareRow');
  if(!wrap) return;
  try{
    const res = await fetch('gallery.json');
    const data = await res.json();
    const names = (data.images || data || []).filter(x=>/\.(png|jpg|jpeg|webp)$/i.test(x));

    const before = names.filter(n=>/^before\d+/i.test(n));
    const set = new Set(names);
    const pairs = [];
    before.forEach(b=>{
      const idx = (b.match(/\d+/)||[''])[0];
      const a1 = `after${idx}.jpg`, a2 = `after${idx}.png`, a3 = `after${idx}.jpeg`;
      const match = [a1,a2,a3].find(x=>set.has(x));
      if(match){ pairs.push([b, match]); }
    });

    pairs.slice(0,6).forEach(([b,a])=>{
      const cmp = document.createElement('div');
      cmp.className = 'compare';
      cmp.innerHTML = `
        <div class="cmp-wrap">
          <img class="cmp" src="images/${b}" alt="before ${b}" loading="lazy">
          <img class="cmp after" src="images/${a}" alt="after ${a}" loading="lazy">
        </div>
        <input type="range" min="0" max="100" value="50" oninput="this.previousElementSibling.querySelector('.after').style.clipPath = 'inset(0 0 0 ' + (100-this.value) + '%)'">`;
      wrap.appendChild(cmp);
    });
  }catch(e){ console.warn('Before/After skipped', e); }
}

function openLightbox(src){
  let lb = document.getElementById('lightbox');
  if(!lb){
    lb = document.createElement('div');
    lb.id='lightbox'; lb.className='lightbox';
    lb.innerHTML = '<img alt="preview">';
    document.body.appendChild(lb);
  }
  lb.querySelector('img').src = src;
  lb.classList.add('show');
  lb.addEventListener('click', ()=> lb.classList.remove('show'), {once:true});
}

// Simple chat toggle if present
function toggleChat(){
  const modal = document.getElementById('chatModal');
  if(modal) modal.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', ()=>{
  limitImageSizes();
  buildGallery();
  buildBeforeAfter();
});
