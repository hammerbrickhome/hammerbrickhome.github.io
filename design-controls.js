/* Optional branding and homepage styling. Disabled controls preserve the original site. */
(() => {
  'use strict';
  const themes = {
    'ivory-estate': {name:'White Architectural Estate',page:'#f8f5ef',card:'#ffffff',text:'#10273b',muted:'#52616c',accent:'#98652d',button:'#10273b',buttonText:'#ffffff',heroText:'#10273b',image:'architecture-white.png',overlay:'#fffaf2',opacity:0.38,composition:'center',radius:4},
    'gold-noir': {name:'Master Craftsman Gold',page:'#090b0e',card:'#14171b',text:'#f4e7c7',muted:'#d3c8b1',accent:'#dfb45c',button:'#dfb45c',buttonText:'#15110b',heroText:'#fff0cf',image:'architecture-dark.png',overlay:'#050607',opacity:0.36,composition:'center',radius:3},
    'skyline-night': {name:'NYC Skyline Night',page:'#081927',card:'#102a3b',text:'#f1f6fa',muted:'#bbd0df',accent:'#6dc5de',button:'#6dc5de',buttonText:'#081927',heroText:'#ffffff',image:'architecture-dark.png',overlay:'#082942',opacity:0.58,composition:'split',radius:26},
    'brownstone-craft': {name:'Brownstone Heritage',page:'#f3e9dc',card:'#fffaf2',text:'#392a22',muted:'#6d574a',accent:'#9b452b',button:'#9b452b',buttonText:'#ffffff',heroText:'#fff8ef',image:'architecture-dark.png',overlay:'#33190e',opacity:0.58,composition:'editorial',radius:3},
    'garden-estate': {name:'Garden Residence',page:'#edf0e6',card:'#fafbf5',text:'#233e32',muted:'#546656',accent:'#546d37',button:'#294e3d',buttonText:'#ffffff',heroText:'#203c30',image:'architecture-white.png',overlay:'#eef4e6',opacity:0.46,composition:'split',radius:32},
    'stone-gallery': {name:'Limestone Gallery',page:'#eae7e0',card:'#faf9f5',text:'#292b2a',muted:'#656864',accent:'#756343',button:'#292b2a',buttonText:'#ffffff',heroText:'#292b2a',image:'architecture-white.png',overlay:'#f6f3eb',opacity:0.53,composition:'editorial',radius:0},
    'copper-workshop': {name:'Copper Workshop',page:'#171c20',card:'#222b30',text:'#f4ece3',muted:'#c7b6a4',accent:'#e0a071',button:'#e0a071',buttonText:'#24170f',heroText:'#fff4e6',image:'architecture-dark.png',overlay:'#22252a',opacity:0.52,composition:'split',radius:8},
    'coastal-house': {name:'Coastal House',page:'#f2f6f5',card:'#ffffff',text:'#143d50',muted:'#4d6b74',accent:'#246e86',button:'#246e86',buttonText:'#ffffff',heroText:'#143d50',image:'architecture-white.png',overlay:'#effbff',opacity:0.48,composition:'center',radius:36},
    'architect-paper': {name:'Architect Paper',page:'#faf9f5',card:'#ffffff',text:'#202b38',muted:'#596675',accent:'#304b71',button:'#304b71',buttonText:'#ffffff',heroText:'#202b38',image:'architecture-white.png',overlay:'#ffffff',opacity:0.65,composition:'editorial',radius:0},
    'emerald-signature': {name:'Emerald Signature',page:'#081f1a',card:'#11332a',text:'#faf4e0',muted:'#c0d1c4',accent:'#d9bd75',button:'#d9bd75',buttonText:'#10291f',heroText:'#fff6de',image:'architecture-dark.png',overlay:'#06291f',opacity:0.54,composition:'center',radius:20}
  };
  const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value)) ? Math.min(max,Math.max(min,Number(value))) : fallback;
  const color=(value,fallback)=>/^#[\da-f]{6}$/i.test(String(value)) ? value : fallback;
  function asset(value) {
    if (!value || typeof value!=='string') return '';
    try { const u=new URL(value,location.origin);return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; }
  }
  const imageCss=value=>value ? 'url('+JSON.stringify(value)+')' : 'none';
  const originalImages=new WeakMap();
  let settings={},currentHome={},ready=false;
  function set(name,value){document.body.style.setProperty('--owner-'+name,String(value));}
  function logo(image,url){
    if(!originalImages.has(image))originalImages.set(image,{src:image.getAttribute('src'),alt:image.getAttribute('alt')});
    const original=originalImages.get(image);const source=url || original.src;
    if(image.getAttribute('src')!==source)image.setAttribute('src',source);
    const alt=settings.brandingEnabled ? (settings.logoAlt || original.alt) : original.alt;
    if(alt!==null)image.setAttribute('alt',alt);
    image.onerror=()=>{image.onerror=null;if(original.src)image.src=original.src;};
  }
  function apply(){
    if(!ready || !document.body)return;
    const d=settings,b=document.body,mobile=matchMedia('(max-width:768px)').matches;
    const home=location.pathname==='/' || location.pathname.endsWith('/index.html');
    const selected=new URLSearchParams(location.search).get('designPreview') || currentHome.homepageLayout;
    const theme=home ? themes[selected] : null;
    b.toggleAttribute('data-owner-branding',d.brandingEnabled===true);
    if(d.brandingEnabled){
      set('logo-width',clamp(d.logoWidthDesktop,28,160,54)+'px');set('logo-width-mobile',clamp(d.logoWidthMobile,28,90,44)+'px');
      set('hero-logo-width',clamp(d.heroLogoWidth,60,360,190)+'px');set('hero-logo-mobile',clamp(d.heroLogoWidthMobile,50,240,120)+'px');
      b.dataset.ownerLogoShape=['original','circle','rounded','square'].includes(d.logoShape)?d.logoShape:'original';
      b.dataset.ownerHeroLogo=d.showHeroLogo===false?'hide':'show';
      b.dataset.ownerLogoPosition=['left','center','right'].includes(d.heroLogoPosition)?d.heroLogoPosition:'default';
    } else {delete b.dataset.ownerLogoShape;delete b.dataset.ownerHeroLogo;delete b.dataset.ownerLogoPosition;}
    document.querySelectorAll('.brand-logo').forEach(img=>logo(img,d.brandingEnabled?asset((mobile&&d.logoMobile)||d.logoDesktop):''));
    document.querySelectorAll('#homeHero .hero-badge img').forEach(img=>logo(img,d.brandingEnabled?asset(d.heroLogo||(mobile&&d.logoMobile)||d.logoDesktop):''));
    // Everything below is homepage-only; inner pages retain their current styling.
    if(!home)return;
    b.toggleAttribute('data-owner-theme',Boolean(theme));
    b.toggleAttribute('data-owner-colors',d.colorsEnabled===true);
    b.toggleAttribute('data-owner-spacing',d.spacingEnabled===true);
    b.toggleAttribute('data-owner-reduced-motion',d.reduceMotion===true);
    const t=theme || themes['ivory-estate'];
    const map={page:'pageColor',card:'cardColor',text:'textColor',muted:'mutedColor',accent:'accentColor',button:'buttonColor',buttonText:'buttonTextColor',heroText:'heroTextColor'};
    Object.entries(map).forEach(([key,field])=>set(key,d.colorsEnabled?color(d[field],t[key]):t[key]));
    if(theme){b.dataset.ownerComposition=t.composition;set('radius',t.radius+'px');}else delete b.dataset.ownerComposition;
    b.dataset.ownerFont=['serif','sans'].includes(d.headingFont)?d.headingFont:'theme';
    if(d.spacingEnabled){set('hero-height',clamp(d.heroHeight,360,950,620)+'px');set('hero-height-mobile',clamp(d.heroHeightMobile,320,850,560)+'px');set('gap',clamp(d.sectionSpacing,20,120,64)+'px');set('radius',clamp(d.cardRadius,0,48,18)+'px');}
    let image=theme?asset('/images/designs/'+theme.image):'',background=theme?t.page:'';
    let overlay=theme?t.overlay:'#071426',opacity=theme?t.opacity:0.55,position='center center',size='cover',attachment='scroll';
    if(d.backgroundEnabled){image=asset((mobile&&d.backgroundMobile)||d.backgroundDesktop);background=color(d.backgroundColor,t.page);overlay=color(d.overlayColor,'#071426');opacity=clamp(d.overlayOpacity,0,95,55)/100;position=(mobile?d.backgroundMobilePosition:d.backgroundPosition)||'center center';size=['cover','contain','auto'].includes(d.backgroundSize)?d.backgroundSize:'cover';attachment=!mobile&&d.backgroundAttachment==='fixed'?'fixed':'scroll';}
    const allowedPositions=['center center','center top','center bottom','left center','right center'];if(!allowedPositions.includes(position))position='center center';
    const target=d.backgroundEnabled&&d.backgroundTarget==='page'?'page':'hero';
    b.toggleAttribute('data-owner-background',Boolean(theme)||d.backgroundEnabled===true);
    b.dataset.ownerBackgroundTarget=target;
    set('image',imageCss(image));set('background',background||t.page);set('overlay',overlay);set('opacity',opacity);set('position',position);set('size',size);set('attachment',attachment);
    const hero=document.getElementById('homeHero');if(hero){let layer=hero.querySelector('.owner-hero-background');if(!layer){layer=document.createElement('div');layer.className='owner-hero-background';layer.setAttribute('aria-hidden','true');hero.prepend(layer);}}
  }
  document.addEventListener('hammer:content-ready',e=>{currentHome=e.detail.homepage||{};apply();});
  matchMedia('(max-width:768px)').addEventListener('change',apply);
  Promise.all([fetch('/site-data/design.json').then(r=>{if(!r.ok)throw Error('Design settings unavailable');return r.json();}),fetch('/site-data/homepage.json').then(r=>r.json())]).then(([d,h])=>{settings=d;currentHome=h;ready=true;apply();}).catch(error=>console.warn('Optional design controls:',error.message));
})();
