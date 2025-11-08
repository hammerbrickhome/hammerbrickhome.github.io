
// Section reveal
const reveal=()=>document.querySelectorAll('.section').forEach(sec=>{
  if(sec.getBoundingClientRect().top < innerHeight-60) sec.classList.add('visible');
});
addEventListener('scroll',reveal,{passive:true}); setTimeout(reveal,100);

// Search services
function filterServices(){
  const q=(document.getElementById('search')?.value||'').toLowerCase();
  document.querySelectorAll('.cat').forEach(cat=>{
    let any=false;
    cat.querySelectorAll('.card').forEach(el=>{
      const show=el.textContent.toLowerCase().includes(q);
      el.style.display = show? 'block':'none';
      if(show) any=true;
    });
    cat.style.display = any || q==='' ? 'block':'none';
  });
}

// Before/After compare
function wireCompare(id){
  const cmp=document.getElementById(id);
  if(!cmp) return;
  const after=cmp.querySelector('.after');
  const range=cmp.querySelector('input[type=range]');
  range.addEventListener('input', e=>{
    const v=e.target.value; // 0..100
    after.style.clipPath = `inset(0 0 0 ${v}%)`;
  });
}

// Lightbox
function wireLightbox(){
  const lb=document.getElementById('lightbox');
  const lbImg=lb.querySelector('img');
  document.querySelectorAll('.gallery img').forEach(img=>{
    img.addEventListener('click',()=>{
      lbImg.src = img.src;
      lb.classList.add('show');
    });
  });
  lb.addEventListener('click',()=>lb.classList.remove('show'));
}

// Chat
function toggleChat(){ document.getElementById('chatModal').classList.toggle('show'); }

document.addEventListener('DOMContentLoaded', ()=>{
  wireCompare('cmp1'); wireCompare('cmp2');
  wireLightbox();
  reveal();
});
