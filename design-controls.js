/* Optional branding and homepage styling. Disabled controls preserve the original site. */
(() => {
  'use strict';
  const themes = {
    'ivory-estate': {name:'White Architectural Estate',page:'#f8f5ef',card:'#ffffff',text:'#10273b',muted:'#52616c',accent:'#98652d',button:'#10273b',buttonText:'#ffffff',heroText:'#10273b',image:'architecture-white.png',overlay:'#fffaf2',opacity:0.38,composition:'center',radius:4},
    'gold-noir': {name:'Master Craftsman Gold',page:'#090b0e',card:'#14171b',text:'#f4e7c7',muted:'#d3c8b1',accent:'#dfb45c',button:'#dfb45c',buttonText:'#15110b',heroText:'#fff0cf',image:'architecture-dark.png',overlay:'#050607',opacity:0.36,composition:'center',radius:3},
    "skyline-night": {"name": "Cobalt Grid", "page": "#ecf1f8", "card": "#ffffff", "text": "#10264a", "muted": "#435774", "accent": "#174bd6", "button": "#174bd6", "buttonText": "#ffffff", "heroText": "#10264a", "image": "new-collection/18-cobalt.png", "overlay": "#ecf1f8", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "cobalt"},
    "brownstone-craft": {"name": "Brooklyn Brick Journal", "page": "#f1e5d4", "card": "#fff8eb", "text": "#402b24", "muted": "#685147", "accent": "#843c29", "button": "#843c29", "buttonText": "#ffffff", "heroText": "#402b24", "image": "new-collection/19-brooklyn.png", "overlay": "#f1e5d4", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "journal"},
    "garden-estate": {"name": "Cedar Courtyard", "page": "#e9eee1", "card": "#f8f9f0", "text": "#283e2d", "muted": "#526348", "accent": "#3e6244", "button": "#3e6244", "buttonText": "#ffffff", "heroText": "#283e2d", "image": "new-collection/20-cedar.png", "overlay": "#e9eee1", "opacity": 0.62, "composition": "split", "radius": 28, "fullPage": true, "collection": "courtyard"},
    "stone-gallery": {"name": "Travertine Atelier", "page": "#eae2d5", "card": "#fffaf0", "text": "#433a2d", "muted": "#695e4e", "accent": "#716041", "button": "#433a2d", "buttonText": "#ffffff", "heroText": "#433a2d", "image": "new-collection/21-travertine.png", "overlay": "#eae2d5", "opacity": 0.62, "composition": "split", "radius": 2, "fullPage": true, "collection": "atelier"},
    "copper-workshop": {"name": "Concrete Signal", "page": "#181c1c", "card": "#242a29", "text": "#f0f3e8", "muted": "#c3cbbd", "accent": "#d2ed4c", "button": "#d2ed4c", "buttonText": "#1b2515", "heroText": "#f0f3e8", "image": "new-collection/22-concrete.png", "overlay": "#181c1c", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "signal"},
    "coastal-house": {"name": "Harbor House", "page": "#e7f0ee", "card": "#fafffc", "text": "#113b44", "muted": "#49676e", "accent": "#126d78", "button": "#126d78", "buttonText": "#ffffff", "heroText": "#113b44", "image": "new-collection/23-harbor.png", "overlay": "#e7f0ee", "opacity": 0.62, "composition": "split", "radius": 12, "fullPage": true, "collection": "harbor"},
    "architect-paper": {"name": "Blueprint Workshop", "page": "#071e3b", "card": "#102d4c", "text": "#f2f9ff", "muted": "#b7d3e5", "accent": "#7ad7ee", "button": "#7ad7ee", "buttonText": "#06243d", "heroText": "#f2f9ff", "image": "new-collection/24-blueprint.png", "overlay": "#071e3b", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "workshop"},
    "emerald-signature": {"name": "Walnut Residence", "page": "#ede2d2", "card": "#fff6e8", "text": "#432e21", "muted": "#705845", "accent": "#8d522d", "button": "#744126", "buttonText": "#ffffff", "heroText": "#432e21", "image": "new-collection/25-walnut.png", "overlay": "#ede2d2", "opacity": 0.62, "composition": "split", "radius": 8, "fullPage": true, "collection": "walnut"},
    "ivory-panorama": {"name": "Monochrome Monument", "page": "#ededeb", "card": "#ffffff", "text": "#141719", "muted": "#4b5053", "accent": "#25292c", "button": "#151819", "buttonText": "#ffffff", "heroText": "#141719", "image": "new-collection/26-monument.png", "overlay": "#ededeb", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "monument"},
    "gold-panorama": {"name": "Terracotta Arcade", "page": "#ecd8bc", "card": "#fff3df", "text": "#4d2d21", "muted": "#755341", "accent": "#a43e1e", "button": "#a43e1e", "buttonText": "#ffffff", "heroText": "#4d2d21", "image": "new-collection/27-arcade.png", "overlay": "#ecd8bc", "opacity": 0.62, "composition": "split", "radius": 24, "fullPage": true, "collection": "arcade"},
    "champagne-panorama": {"name": "Slate & Rain", "page": "#101b25", "card": "#1d2b39", "text": "#f3f7fc", "muted": "#c0d0df", "accent": "#aac7e2", "button": "#aac7e2", "buttonText": "#142337", "heroText": "#f3f7fc", "image": "new-collection/28-slate.png", "overlay": "#101b25", "opacity": 0.62, "composition": "split", "radius": 2, "fullPage": true, "collection": "slate"},
    "sapphire-panorama": {"name": "Mosaic House", "page": "#dcefed", "card": "#f5fffc", "text": "#133d3a", "muted": "#476d66", "accent": "#116b67", "button": "#116b67", "buttonText": "#ffffff", "heroText": "#133d3a", "image": "new-collection/29-mosaic.png", "overlay": "#dcefed", "opacity": 0.62, "composition": "split", "radius": 18, "fullPage": true, "collection": "mosaic"},
    "olive-panorama": {"name": "Copperline Loft", "page": "#271c1a", "card": "#382822", "text": "#fff0da", "muted": "#d6c0ad", "accent": "#e6a774", "button": "#e6a774", "buttonText": "#382216", "heroText": "#fff0da", "image": "new-collection/30-copper.png", "overlay": "#271c1a", "opacity": 0.62, "composition": "split", "radius": 0, "fullPage": true, "collection": "loft"},
  };
  const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value)) ? Math.min(max,Math.max(min,Number(value))) : fallback;
  const color=(value,fallback)=>/^#[\da-f]{6}$/i.test(String(value)) ? value : fallback;
  function asset(value) {
    if (!value || typeof value!=='string') return '';
    try { const u=new URL(value,location.origin);const preview=window.parent!==window&&new URLSearchParams(location.search).has('studioPreview');return /^https?:$/.test(u.protocol)||(preview&&u.protocol==='blob:'&&u.origin===location.origin) ? u.href : ''; } catch { return ''; }
  }
  const imageCss=value=>value ? 'url('+JSON.stringify(value)+')' : 'none';
  const originalImages=new WeakMap();
  let settings={},currentHome={},ready=false;
  function set(name,value){document.body.style.setProperty('--owner-'+name,String(value));}
  function applySectionBackgrounds(d,mobile){
    let style=document.getElementById('ownerSectionBackgrounds');
    if(!style){style=document.createElement('style');style.id='ownerSectionBackgrounds';document.head.append(style);}
    if(d.sectionBackgroundsEnabled!==true||!Array.isArray(d.sectionBackgrounds)){style.textContent='';return;}
    const ids={announcement:'adminAnnouncement',hero:'homeHero','quick-actions':'cmsHomepageQuickActions','service-areas':'cmsServiceAreasSection',guarantee:'guaranteeSection',process:'processSection',reviews:'reviewsSection','area-summary':'serviceAreaSection',projects:'cmsProjectsSection','before-after':'before-after',materials:'premiumMaterialsSection',membership:'membershipServicesSection',specials:'specialsSection',tiers:'tiersSection',faq:'faqSection'};
    const allowedPositions=['center center','center top','center bottom','left center','right center'];
    const rules=[];
    d.sectionBackgrounds.filter(item=>item&&item.enabled===true&&ids[item.section]).forEach(item=>{
      const id=ids[item.section],image=asset((mobile&&item.mobileImage)||item.desktopImage),position=(mobile?item.mobilePosition:item.position)||'center center';
      const size=(mobile?item.mobileSize:item.size)||'cover',overlay=color(item.overlayColor,'#071426'),opacity=clamp(item.overlayOpacity,0,95,35)/100,background=color(item.color,'#ffffff');
      const safePosition=allowedPositions.includes(position)?position:'center center',safeSize=['cover','contain','auto'].includes(size)?size:'cover';
      rules.push(`#${id}{background-color:${background}!important;background-image:linear-gradient(color-mix(in srgb,${overlay} ${opacity*100}%,transparent),color-mix(in srgb,${overlay} ${opacity*100}%,transparent))${image?','+imageCss(image):''}!important;background-position:${safePosition}!important;background-size:${safeSize}!important;background-repeat:no-repeat!important}`);
      if(item.section==='hero')rules.push('#homeHero>.owner-hero-background{display:none!important}');
    });
    style.textContent=rules.join('\n');
  }
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
    if(theme&&theme.collection)b.dataset.ownerCollection=theme.collection;else delete b.dataset.ownerCollection;
    const colorMode=['theme','light','dark','custom'].includes(d.colorMode)?d.colorMode:(d.colorsEnabled===true?'custom':'theme');
    const modeColors=colorMode==='light'?{page:'#f7f3eb',card:'#ffffff',text:'#102438',muted:'#52616c',accent:'#98652d',button:'#102438',buttonText:'#ffffff',heroText:'#102438'}:colorMode==='dark'?{page:'#080b10',card:'#121923',text:'#f7ead0',muted:'#c9c0b2',accent:'#dfb45c',button:'#dfb45c',buttonText:'#15110b',heroText:'#fff1d2'}:null;
    b.toggleAttribute('data-owner-colors',colorMode!=='theme'||d.colorsEnabled===true);
    b.toggleAttribute('data-owner-spacing',d.spacingEnabled===true);
    b.toggleAttribute('data-owner-reduced-motion',d.reduceMotion===true);
    const t=theme || themes['ivory-estate'];
    const map={page:'pageColor',card:'cardColor',text:'textColor',muted:'mutedColor',accent:'accentColor',button:'buttonColor',buttonText:'buttonTextColor',heroText:'heroTextColor'};
    Object.entries(map).forEach(([key,field])=>set(key,modeColors?modeColors[key]:(colorMode==='custom'||d.colorsEnabled===true)?color(d[field],t[key]):t[key]));
    if(theme){b.dataset.ownerComposition=t.composition;set('radius',t.radius+'px');}else delete b.dataset.ownerComposition;
    b.dataset.ownerFont=['serif','sans'].includes(d.headingFont)?d.headingFont:'theme';
    if(d.spacingEnabled){set('hero-height',clamp(d.heroHeight,360,950,620)+'px');set('hero-height-mobile',clamp(d.heroHeightMobile,320,850,560)+'px');set('gap',clamp(d.sectionSpacing,20,120,64)+'px');set('radius',clamp(d.cardRadius,0,48,18)+'px');}
    let image=theme?asset('/images/designs/'+theme.image):'',background=theme?t.page:'';
    let overlay=theme?t.overlay:'#071426',opacity=theme?t.opacity:0.55,position='center center',size='cover',attachment='scroll',blur=0;
    if(d.backgroundEnabled){image=asset((mobile&&d.backgroundMobile)||d.backgroundDesktop);background=color(d.backgroundColor,t.page);overlay=color(d.overlayColor,'#071426');opacity=clamp(d.overlayOpacity,0,95,55)/100;position=(mobile?d.backgroundMobilePosition:d.backgroundPosition)||'center center';const requestedSize=mobile?(d.backgroundSizeMobile||d.backgroundSize):d.backgroundSize;size=['cover','contain','auto'].includes(requestedSize)?requestedSize:'cover';attachment=!mobile&&d.backgroundAttachment==='fixed'?'fixed':'scroll';blur=clamp(mobile?d.backgroundBlurMobile:d.backgroundBlur,0,20,0);}
    const allowedPositions=['center center','center top','center bottom','left center','right center'];if(!allowedPositions.includes(position))position='center center';
    const target=d.backgroundEnabled ? (d.backgroundTarget==='page'?'page':'hero') : (theme&&theme.fullPage?'page':'hero');
    b.toggleAttribute('data-owner-panorama',target==='page'&&(Boolean(theme)||d.backgroundEnabled===true));
    b.toggleAttribute('data-owner-background',Boolean(theme)||d.backgroundEnabled===true);
    b.dataset.ownerBackgroundTarget=target;
    set('image',imageCss(image));set('background',background||t.page);set('overlay',overlay);set('opacity',opacity);set('position',position);set('size',size);set('attachment',attachment);set('blur',blur+'px');
    const hero=document.getElementById('homeHero');if(hero){let layer=hero.querySelector('.owner-hero-background');if(!layer){layer=document.createElement('div');layer.className='owner-hero-background';layer.setAttribute('aria-hidden','true');hero.prepend(layer);}
      let picture=hero.querySelector('.owner-collection-image');
      if(theme&&theme.collection){
        if(!picture){picture=document.createElement('figure');picture.className='owner-collection-image';const img=document.createElement('img');img.alt='';img.width=1536;img.height=1024;img.decoding='async';const caption=document.createElement('figcaption');caption.textContent='Architectural concept artwork';picture.append(img,caption);hero.append(picture);}
        picture.hidden=!image;const img=picture.querySelector('img');if(image&&img.getAttribute('src')!==image)img.src=image;
      } else if(picture)picture.remove();
    }
    applySectionBackgrounds(d,mobile);
  }
  document.addEventListener('hammer:content-ready',e=>{currentHome=e.detail.homepage||{};apply();});
  matchMedia('(max-width:768px)').addEventListener('change',apply);
  Promise.all([fetch('/site-data/design.json').then(r=>{if(!r.ok)throw Error('Design settings unavailable');return r.json();}),fetch('/site-data/homepage.json').then(r=>r.json())]).then(([d,h])=>{settings=d;currentHome=h;ready=true;apply();}).catch(error=>console.warn('Optional design controls:',error.message));
})();
