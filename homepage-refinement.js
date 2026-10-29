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
    const [settings,business] = await Promise.all([read('/site-data/homepage.json'),read('/site-data/business.json')]);
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
    // Generate the contact locally; no visitor information is collected or sent.
    const cardEscape=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
    const cardPhone=String(business.phone||'929-595-5300');
    const cardDigits=cardPhone.replace(/\D/g,'');
    const cardDial=/^\d{10}$/.test(cardDigits)?'+1'+cardDigits:/^1\d{10}$/.test(cardDigits)?'+'+cardDigits:'';
    const cardNotes=settings.ownerContactNotes||'Masonry and brickwork; bathroom and kitchen remodeling; roofing; waterproofing; windows and doors; repairs and renovations. Serving NYC and New Jersey. Contact Noman to arrange a free in-person estimate.';
    const cardLines=['BEGIN:VCARD','VERSION:3.0','N:;Noman;;;','FN:'+cardEscape('Noman — '+(business.businessName||'Hammer Brick & Home LLC')),'ORG:'+cardEscape(business.businessName||'Hammer Brick & Home LLC'),'TITLE:'+cardEscape(settings.ownerContactCardTitle||'Owner / Home Improvement Contractor')];
    if(cardDial)cardLines.push('TEL;TYPE=WORK,VOICE:'+cardDial);
    if(business.email)cardLines.push('EMAIL;TYPE=WORK:'+cardEscape(business.email));
    if(business.website)cardLines.push('URL:'+cardEscape(business.website));
    const credentials=[business.nycHic?'NYC HIC #'+business.nycHic:'',business.njHic?'NJ HIC #'+business.njHic:''].filter(Boolean).join('; ');
    cardLines.push('NOTE:'+cardEscape(cardNotes+(credentials?'\n'+credentials:'')),'END:VCARD');
    // Fold long lines at UTF-8 boundaries for contact-app compatibility.
    const encoder=new TextEncoder();
    const fold=line=>{let result='',part='';for(const ch of line){if(encoder.encode(part+ch).length>74){result+=part+'\r\n';part=' ';}part+=ch;}return result+part;};
    const cardUrl=URL.createObjectURL(new Blob([cardLines.map(fold).join('\r\n')+'\r\n'],{type:'text/vcard;charset=utf-8'}));
    function addContactTools(){
      const panel=document.querySelector('#quick-contact-panel .quick-contact-inner');
      if(!panel||panel.querySelector('.hb-save-contact-tools')||settings.ownerSaveContactEnabled===false)return;
      const box=document.createElement('div');box.className='hb-save-contact-tools';
      const save=document.createElement('a');save.href=cardUrl;save.download='Noman-Hammer-Brick-Home.vcf';save.textContent='Save Noman’s Contact';
      const hint=document.createElement('p');hint.textContent='Keep my number, business details and services handy for your next project.';
      const status=document.createElement('p');status.setAttribute('role','status');status.className='hb-copy-status';
      box.append(save);
      if(cardDial){const copy=document.createElement('button');copy.type='button';copy.textContent='Copy Number';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(cardPhone);status.textContent='Number copied: '+cardPhone;}catch(_){status.textContent='Copy this number: '+cardPhone;}});box.append(copy);}
      box.append(hint,status);panel.append(box);
    }
    const saveStyle=document.createElement('style');saveStyle.textContent=`
      #quick-contact-panel .hb-save-contact-tools{border-top:1px solid #c8b88e;margin-top:18px;padding-top:18px;display:flex;flex-wrap:wrap;gap:10px}
      #quick-contact-panel .hb-save-contact-tools a,#quick-contact-panel .hb-save-contact-tools button{box-sizing:border-box;min-height:44px;display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;border:1px solid #af8f4a;border-radius:10px;background:#f7eed8;color:#233c31;font:600 14px/1.4 system-ui;text-decoration:none;cursor:pointer}
      #quick-contact-panel .hb-save-contact-tools p{flex:1 0 100%;font:13px/1.5 system-ui;color:inherit;margin:0;overflow-wrap:anywhere}
      #quick-contact-panel .hb-save-contact-tools a:focus-visible,#quick-contact-panel .hb-save-contact-tools button:focus-visible{outline:3px solid #9d712e;outline-offset:3px}
    `;document.head.append(saveStyle);addContactTools();new MutationObserver(addContactTools).observe(document.body,{childList:true,subtree:true});
    if (settings.luxuryContactEnabled !== false) {
    // Refine the EXISTING contact surface; never add another launcher or pricing tool.
    const contactStyle = document.createElement('style');
    contactStyle.textContent = `
      body.hb-contact-luxury .sticky-quick-btn {background:#142a25;color:#f8efd9;border:1px solid #cfb574;border-radius:50px;padding:15px 23px;min-height:48px;font:600 14px/1.2 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 8px 26px #0003;}
      body.hb-contact-luxury #quick-contact-panel {padding:16px;background:#10221dcc;backdrop-filter:blur(5px);z-index:100000!important;}
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
      if(button && ['Contact','💬 Contact','Start Your Project'].includes(button.textContent.trim()))button.textContent=settings.ownerContactButtonText||'Talk to Noman';
      const panel=document.querySelector('#quick-contact-panel .quick-contact-inner');
      const heading=panel?.querySelector('h2');
      if(heading && ['Quick Contact','Your vision. Our craft.'].includes(heading.textContent.trim()))heading.textContent=settings.ownerContactHeading||'Talk to Noman — Owner';
      if(panel){
        let note=panel.querySelector('.hb-owner-welcome');
        if(!note){note=document.createElement('p');note.className='hb-owner-welcome';note.textContent=settings.ownerContactIntro||'I’m Noman, owner of Hammer Brick & Home. Tell me what needs fixing or what you’d like to improve. Let’s arrange a free in-person estimate.';heading?.after(note);}
        for(const [action,oldLabel,newLabel] of [['call','Call Now','Call Noman'],['text','Text Us','Text Noman']]){
          const label=panel.querySelector(`[data-contact-action="${action}"] a span:nth-child(2)`);
          if(label?.textContent===oldLabel)label.textContent=newLabel;
        }
      }
      if(panel && !panel.querySelector('.hb-contact-signature')){
        const signature=document.createElement('p');signature.className='hb-contact-signature';
        signature.textContent='Hammer Brick & Home · Pride · Quality · Integrity';panel.append(signature);
      }
    }
    refineContact();new MutationObserver(refineContact).observe(document.body,{childList:true,subtree:true});
    }
    // A contained, pausable ribbon: never changes hero columns or photo layouts.
    const ribbonStyle=document.createElement('style');
    ribbonStyle.textContent=`
      .hb-owner-welcome{font:15px/1.65 system-ui,sans-serif!important;color:#43564d!important;margin:0 0 18px!important}
      #hbOwnerRibbon{box-sizing:border-box;max-width:100%;min-width:0;margin:0 0 28px;padding:12px;border:1px solid #c8ac70;border-radius:14px;background:linear-gradient(110deg,#f9f3e5,#fffdf7,#eee0be);color:#2b4036;display:flex;align-items:center;gap:12px;box-shadow:0 5px 18px #0001}
      #hbOwnerRibbon .hb-ribbon-window{overflow:hidden;flex:1;min-width:0}
      #hbOwnerRibbon .hb-ribbon-track{display:flex;width:max-content;animation:hbOwnerScroll var(--hb-ribbon-duration,36s) linear infinite}
      #hbOwnerRibbon .hb-ribbon-group{display:flex;align-items:center;flex-shrink:0;gap:28px;padding-right:28px;font:600 13px/1.5 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap}
      #hbOwnerRibbon .hb-ribbon-group span::after{content:' ✦';color:#927032;margin-left:28px}
      #hbOwnerRibbon button{flex-shrink:0;width:42px;height:42px;border:1px solid #bfa06a;border-radius:50%;background:#fffcf4;color:#304639;font:18px system-ui;cursor:pointer}
      #hbOwnerRibbon button:focus-visible,#hbOwnerRibbon a:focus-visible{outline:3px solid #7b591d;outline-offset:3px}
      #hbOwnerRibbon .hb-ribbon-actions{display:flex;flex-shrink:0;gap:8px;align-items:center}
      #hbOwnerRibbon .hb-ribbon-actions a{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 16px;border:1px solid #a88b50;border-radius:10px;background:#203c31;color:#fff8e9;font:600 13px/1.3 system-ui,sans-serif;text-decoration:none;white-space:nowrap}
      #hbOwnerRibbon .hb-ribbon-actions a:last-child{background:#fffaf0;color:#203c31}
      @media(max-width:600px){#hbOwnerRibbon{flex-wrap:wrap;gap:8px}#hbOwnerRibbon .hb-ribbon-window{flex-basis:calc(100% - 54px)}#hbOwnerRibbon .hb-ribbon-actions{flex:1 0 100%}#hbOwnerRibbon .hb-ribbon-actions a{flex:1}}
      #hbOwnerRibbon:hover .hb-ribbon-track,#hbOwnerRibbon:focus-within .hb-ribbon-track,#hbOwnerRibbon[data-paused] .hb-ribbon-track{animation-play-state:paused}
      #hbOwnerRibbon[data-static] .hb-ribbon-track{animation:none;width:100%}
      #hbOwnerRibbon[data-static] .hb-ribbon-group{white-space:normal;flex-wrap:wrap;gap:8px;padding:0}
      #hbOwnerRibbon[data-static] .hb-ribbon-copy,#hbOwnerRibbon[data-static] button{display:none}
      @keyframes hbOwnerScroll{to{transform:translateX(-50%)}}
      @media(prefers-reduced-motion:reduce){#hbOwnerRibbon .hb-ribbon-track{animation:none;width:100%}#hbOwnerRibbon .hb-ribbon-group{white-space:normal;flex-wrap:wrap;gap:8px;padding:0}#hbOwnerRibbon .hb-ribbon-copy,#hbOwnerRibbon button{display:none}}
    `;document.head.append(ribbonStyle);
    if(settings.ownerRibbonEnabled!==false){
      const rawPhone=String(business.phone||'929-595-5300');
      const digits=rawPhone.replace(/\D/g,'');
      const validPhone=/^\d{10}$/.test(digits)||/^1\d{10}$/.test(digits);
      const dial=validPhone?'+'+(digits.length===10?'1':'')+digits:'';
      const displayPhone=validPhone?rawPhone:'929-595-5300';
      const defaults=['Free in-person estimates • No obligation','Small repairs to full renovations','Serving NYC & New Jersey'];
      const items=Array.isArray(settings.ownerRibbonMessages)?settings.ownerRibbonMessages.map(x=>typeof x==='string'?x:x?.text).filter(x=>typeof x==='string'&&x.trim()).slice(0,8):defaults;
      if(items.length){
        if(validPhone)items.unshift('Speak directly with Noman — Owner • Call or text '+displayPhone);
        const ribbon=document.createElement('aside');ribbon.id='hbOwnerRibbon';ribbon.setAttribute('aria-label','Working with Hammer Brick & Home');
        const windowEl=document.createElement('div'),track=document.createElement('div'),group=document.createElement('div');
        windowEl.className='hb-ribbon-window';track.className='hb-ribbon-track';group.className='hb-ribbon-group';
        items.forEach(value=>{const span=document.createElement('span');span.textContent=value;group.append(span)});
        const clone=group.cloneNode(true);clone.classList.add('hb-ribbon-copy');clone.setAttribute('aria-hidden','true');track.append(group,clone);windowEl.append(track);
        const pause=document.createElement('button');pause.type='button';pause.textContent='Ⅱ';pause.setAttribute('aria-label','Pause scrolling messages');pause.setAttribute('aria-pressed','false');
        pause.addEventListener('click',()=>{const paused=ribbon.toggleAttribute('data-paused');pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume scrolling messages':'Pause scrolling messages')});
        const seconds=Number(settings.ownerRibbonSeconds);ribbon.style.setProperty('--hb-ribbon-duration',(Number.isFinite(seconds)&&seconds>=15&&seconds<=90?seconds:36)+'s');
        if(settings.ownerRibbonMotion===false)ribbon.setAttribute('data-static','');
        const actions=document.createElement('div');actions.className='hb-ribbon-actions';
        for(const [kind,enabled,label] of [['tel',business.showContactCall!==false,'Call Noman'],['sms',business.showContactText!==false,'Text Noman']]){
          if(!enabled||!dial)continue;
          const link=document.createElement('a');link.href=kind+':'+dial;link.textContent=label;
          link.setAttribute('aria-label',label+' at '+displayPhone);actions.append(link);
        }
        ribbon.append(windowEl,pause);if(actions.childElementCount)ribbon.append(actions);
        document.getElementById('homeHero').after(ribbon);
      }
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


