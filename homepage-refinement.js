/* Homepage refinement: deliberately leaves project galleries and design CSS untouched. */
(() => {
  'use strict';
  async function read(path) {
    try { const r = await fetch(path, {cache: 'no-store'}); if (!r.ok) return {}; return await r.json(); }
    catch (_) { return {}; }
  }
  function text(selector, value) {
    document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
  }
  async function start() {
    const settings = await read('/site-data/homepage.json');
    const visible = settings.membershipVisible === true;
    const active = visible && settings.membershipActive === true;
    const year = /^\d{4}$/.test(String(settings.membershipYear)) ? String(settings.membershipYear) : '2026';
    const soon = settings.membershipComingSoonText || 'Our membership program is coming soon. Entries are not open yet.';
    const style = document.createElement('style');
    style.textContent = `
      #hbHomeMembership[hidden], #hbHomeMembershipEntry[hidden], #hbHomeMembershipSoon[hidden],
      #hbMembershipNotice[hidden], #hbMembershipProgram[hidden] { display:none!important; }
      #hbOwnerPhoto { width:160px; height:160px; max-width:100%; object-fit:cover; border-radius:50%; border:2px solid var(--gold,#cda65b); margin:0 auto 18px; display:block; }
      #hbProjectsMore { text-align:center; margin:24px 0; }
      `;
    document.head.append(style);
    const card = document.getElementById('hbHomeMembership');
    if (card) card.hidden = !visible;
    const entry = document.getElementById('hbHomeMembershipEntry');
    if (entry) entry.hidden = !active;
    const message = document.getElementById('hbHomeMembershipSoon');
    if (message) { message.hidden = active; message.textContent = soon; }
    const program = document.getElementById('hbMembershipProgram');
    if (program) program.hidden = !active;
    const notice = document.getElementById('hbMembershipNotice');
    if (notice) notice.hidden = active;
    text('#hbMembershipMessage', visible ? soon : 'Membership is not currently available.');
    text('#hbHomeMembership .card-number, #hbMembershipProgram .card-number', '•••• •••• •••• ' + year);
    text('#hbHomeMembership .card-status, #hbMembershipProgram .card-status', active ? 'ACTIVE' : 'COMING SOON');
    if (!document.getElementById('homeHero')) return;
    if (settings.luxuryContactEnabled !== false) {
    // Refine the EXISTING contact surface; never add another launcher or pricing tool.
    const contactStyle = document.createElement('style');
    contactStyle.textContent = `
      body.hb-contact-luxury .sticky-quick-btn {background:#142a25;color:#f8efd9;border:1px solid #cfb574;border-radius:50px;padding:15px 23px;min-height:48px;font:600 14px/1.2 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 8px 26px #0003;}
      body.hb-contact-luxury #quick-contact-panel {padding:16px;background:#10221dcc;backdrop-filter:blur(5px);}
      body.hb-contact-luxury #quick-contact-panel .quick-contact-inner {box-sizing:border-box;width:min(100%,510px);max-width:510px;max-height:calc(100dvh - 32px);overflow:auto;background:#faf6ed;color:#20372f;border:1px solid #bfa06a;border-radius:22px;padding:38px 26px 26px;box-shadow:0 24px 80px #0005;position:relative;}
      body.hb-contact-luxury #quick-contact-panel h2 {font:normal clamp(25px,5vw,34px)/1.15 Georgia,serif;color:#20372f;letter-spacing:-.02em;margin:12px 0 20px;}
      body.hb-contact-luxury #quick-contact-panel .hb-home-contact-intro {font:15px/1.65 system-ui,sans-serif;color:#4c5a52;margin-bottom:24px;}
      body.hb-contact-luxury #quick-contact-panel .hb-home-contact-intro strong {display:inline-block;font:normal 28px/1.3 Georgia,serif;color:#20372f;margin-bottom:8px;}
      body.hb-contact-luxury #quick-contact-panel ul {display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0;list-style:none;}
      body.hb-contact-luxury #quick-contact-panel li {margin:0;min-width:0;}
      body.hb-contact-luxury #quick-contact-panel li a {box-sizing:border-box;min-height:52px;border:1px solid #d3c4a7;border-radius:12px;background:#fffdf7;color:#20372f;font:600 14px/1.3 system-ui,sans-serif;padding:14px;text-decoration:none;}
      body.hb-contact-luxury #quick-contact-panel li[data-contact-action="call"] a {background:#20372f;color:#fff7e5;border-color:#20372f;}
      body.hb-contact-luxury #quick-contact-panel .quick-close {position:absolute;color:#20372f;background:#eee5d3;border:0;border-radius:50%;width:38px;height:38px;top:12px;right:12px;font-size:24px;}
      body.hb-contact-luxury #quick-contact-panel a:focus-visible,body.hb-contact-luxury #quick-contact-panel button:focus-visible {outline:3px solid #986b28;outline-offset:3px;}
      body.hb-contact-luxury .hb-contact-signature {font:600 10px/1.6 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;border-top:1px solid #d3c4a7;padding-top:18px;margin-top:22px;color:#76603d;}
      @media(max-width:360px){body.hb-contact-luxury #quick-contact-panel ul{grid-template-columns:1fr;}body.hb-contact-luxury #quick-contact-panel .quick-contact-inner{padding:38px 20px 20px;}}
    `;
    document.head.append(contactStyle);document.body.classList.add('hb-contact-luxury');
    function refineContact() {
      const button=document.querySelector('.sticky-quick-btn');
      // Honor custom CMS labels; upgrade only the existing default labels.
      if(button && ['Contact','💬 Contact'].includes(button.textContent.trim()))button.textContent='Start Your Project';
      const panel=document.querySelector('#quick-contact-panel .quick-contact-inner');
      const heading=panel?.querySelector('h2');
      if(heading && heading.textContent.trim()==='Quick Contact')heading.textContent='Your vision. Our craft.';
      if(panel && !panel.querySelector('.hb-contact-signature')){
        const signature=document.createElement('p');signature.className='hb-contact-signature';
        signature.textContent='Hammer Brick & Home · Pride · Quality · Integrity';panel.append(signature);
      }
    }
    refineContact();new MutationObserver(refineContact).observe(document.body,{childList:true,subtree:true});
    }
    const ownerCard = document.querySelector('#guaranteeSection .accent-card');
    const safeUrl=value=>typeof value==='string' && /^(\/(?!\/)|https:\/\/)/i.test(value.trim()) && !/[\s\\]/.test(value.trim()) ? value.trim() : '';
    const videoUrl=safeUrl(settings.ownerVideoUrl);
    if(ownerCard && videoUrl){
      const link=document.createElement('a');link.id='hbOwnerVideo';link.className='btn ghost';link.href=videoUrl;
      link.textContent=settings.ownerVideoLabel||'Meet Noman — Watch the Introduction';ownerCard.append(link);
    }
    const process=document.getElementById('processSection');
    const cards=Array.isArray(settings.behindFinishCards)?settings.behindFinishCards.filter(c=>c&&c.active!==false&&safeUrl(c.image)&&String(c.title||'').trim()&&String(c.description||'').trim()):[];
    if(process && settings.behindFinishEnabled===true && cards.length){
      const detailStyle=document.createElement('style');detailStyle.textContent=`
        #hbBehindFinish{margin-top:42px;padding-top:30px;border-top:1px solid #bca674}
        #hbBehindFinish .hb-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:22px}
        #hbBehindFinish figure{margin:0;background:#faf8f3;color:#26332f;border:1px solid #c9b68e;border-radius:14px;overflow:hidden}
        #hbBehindFinish img{display:block;width:100%;height:auto;max-height:360px;object-fit:contain}
        #hbBehindFinish figcaption{padding:20px}#hbBehindFinish h3{color:#26332f;margin:0 0 10px}
        #hbBehindFinish p{color:#47574f;line-height:1.7;white-space:pre-line;overflow-wrap:anywhere}
      `;document.head.append(detailStyle);
      const section=document.createElement('div');section.id='hbBehindFinish';
      const heading=document.createElement('h2');heading.textContent=settings.behindFinishTitle||'Behind the Finish';section.append(heading);
      const grid=document.createElement('div');grid.className='hb-detail-grid';
      for(const card of cards){
        const figure=document.createElement('figure'),photo=document.createElement('img'),caption=document.createElement('figcaption'),title=document.createElement('h3'),description=document.createElement('p');
        photo.src=safeUrl(card.image);photo.alt=card.alt||card.title;photo.loading='lazy';photo.decoding='async';
        title.textContent=card.title;description.textContent=card.description;caption.append(title,description);figure.append(photo,caption);grid.append(figure);
      }
      section.append(grid);process.append(section);
    }
    const imagePath = typeof settings.ownerPhoto === 'string' ? settings.ownerPhoto.trim() : '';
    if (ownerCard && /^(\/(?!\/)|https:\/\/)/i.test(imagePath) && !document.getElementById('hbOwnerPhoto')) {
      const photo = document.createElement('img');
      photo.id = 'hbOwnerPhoto'; photo.src = imagePath;
      photo.alt = settings.ownerPhotoAlt || 'Noman, owner of Hammer Brick & Home LLC';
      photo.width = 160; photo.height = 160; photo.loading = 'lazy';
      const placeholder = ownerCard.firstElementChild;
      photo.addEventListener('load', () => { if (placeholder) placeholder.style.display = 'none'; });
      photo.addEventListener('error', () => photo.remove());
      ownerCard.prepend(photo);
    }
    function projectsLink() {
      const section = document.getElementById('cmsProjectsSection');
      if (!section || document.getElementById('hbProjectsMore')) return;
      const more = document.createElement('p'); more.id = 'hbProjectsMore';
      const link = document.createElement('a'); link.className = 'btn ghost';
      link.href = '/gallery.html'; link.textContent = 'View All Projects';
      more.append(link); section.append(more);
    }
    projectsLink();
    const observer = new MutationObserver(projectsLink);
    observer.observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
