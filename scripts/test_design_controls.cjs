// Non-browser DOM regression tests for the optional design extension.
const fs=require('fs'),assert=require('assert');
const {JSDOM}=require(process.env.HAMMER_JSDOM_PATH || 'jsdom');
const code=fs.readFileSync('design-controls.js','utf8');
const defaults=JSON.parse(fs.readFileSync('site-data/design.json','utf8'));
async function run(settings={},layout='local',mobile=false,path='/'){
 const dom=new JSDOM('<body><img class="brand-logo" src="/original.png"><section id="homeHero"><div class="hero-badge"><img src="/hero.png"></div></section></body>',{url:'https://www.hammerbrickhome.com'+path,runScripts:'outside-only'});
 dom.window.matchMedia=()=>({matches:mobile,addEventListener(){}});
 dom.window.fetch=async url=>({ok:true,json:async()=>url.includes('design.json')?{...defaults,...settings}:{homepageLayout:layout}});
 dom.window.eval(code);await new Promise(resolve=>setImmediate(resolve));return dom;
}
(async()=>{
 let d=await run();assert(!d.window.document.body.hasAttribute('data-owner-theme'));assert(!d.window.document.body.hasAttribute('data-owner-branding'));assert.equal(d.window.document.querySelector('img').getAttribute('src'),'/original.png');d.window.close();
 const themes=['ivory-estate','gold-noir','skyline-night','brownstone-craft','garden-estate','stone-gallery','copper-workshop','coastal-house','architect-paper','emerald-signature'];
 for(const t of themes){d=await run({},t);assert(d.window.document.body.hasAttribute('data-owner-theme'),t);assert(d.window.document.body.style.getPropertyValue('--owner-image').includes('architecture-'));assert.equal(d.window.document.querySelectorAll('.owner-hero-background').length,1);d.window.close();}
 for(const mobile of [false,true]){d=await run({brandingEnabled:true,logoDesktop:'/desktop.png',logoMobile:'/mobile.png',logoWidthDesktop:999,backgroundEnabled:true,backgroundDesktop:'/wide.jpg',backgroundMobile:'/phone.jpg',overlayOpacity:999},'local',mobile);const b=d.window.document.body;assert(d.window.document.querySelector('img').src.endsWith(mobile?'mobile.png':'desktop.png'));assert(b.style.getPropertyValue('--owner-image').includes(mobile?'phone.jpg':'wide.jpg'));assert.equal(b.style.getPropertyValue('--owner-logo-width'),'160px');assert.equal(b.style.getPropertyValue('--owner-opacity'),'0.95');d.window.document.querySelector('img').onerror();assert(d.window.document.querySelector('img').src.endsWith('original.png'));d.window.close();}
 d=await run({brandingEnabled:true,logoDesktop:'javascript:alert(1)',colorsEnabled:true,pageColor:'invalid'});assert(d.window.document.querySelector('img').src.endsWith('original.png'));assert.equal(d.window.document.body.style.getPropertyValue('--owner-page'),'#f8f5ef');d.window.close();
 d=await run({backgroundEnabled:true},'gold-noir',false,'/services.html');assert(!d.window.document.body.hasAttribute('data-owner-theme'));assert(!d.window.document.body.hasAttribute('data-owner-background'));d.window.close();
 console.log('PASS: 10 themes, default preservation, desktop/mobile logos and backgrounds, fallback, input bounds, and inner-page isolation.');
})().catch(e=>{console.error(e);process.exit(1);});
