// DOM-level control tests; no network, GitHub writes, or browser required.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element {constructor(){this.children=[];this.checked=false;this.hidden=false;this.style={};this.dataset={};}appendChild(item){this.children.push(item);return item;}append(...items){this.children.push(...items);}replaceChildren(){this.children=[];}setAttribute(){}click(){if(this.onclick)this.onclick();}}
const ids={},document={getElementById:id=>ids[id]||null,createElement:()=>new Element(),createTextNode:t=>t,head:new Element(),body:new Element()};
for(const id of ['load','status','controls','list','order','visibility','reset','export'])ids[id]=new Element();
const context=vm.createContext({document,structuredClone,Blob,URL,setTimeout,fetch:()=>new Promise(()=>{})});
const html=fs.readFileSync('admin/layout.html','utf8');vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
vm.runInContext('load('+fs.readFileSync('site-data/homepage.json','utf8')+')',context);
const original=vm.runInContext('JSON.stringify(original)',context);
const first=vm.runInContext('data.customSectionOrder[0]',context);
ids.list.children[0].children[2].click();assert.equal(vm.runInContext('data.customSectionOrder[1]',context),first);
ids.order.onchange({target:{checked:true}});assert.equal(vm.runInContext('data.customSectionOrderEnabled',context),true);
ids.visibility.onchange({target:{checked:true}});assert.equal(vm.runInContext('data.sectionVisibilityEnabled',context),true);
ids.reset.click();assert.equal(vm.runInContext('JSON.stringify(data)',context),original);
const code=fs.readFileSync('script.js','utf8');const start=code.indexOf('function hammerApplyManualHomepageOrder('),end=code.indexOf('\nfunction hammerApplyHomepageLayout',start);
vm.runInContext('const HAMMER_HOME_SECTION_IDS={reviews:"reviewsSection",hero:"homeHero"};'+code.slice(start,end),context);
vm.runInContext('hammerApplyManualHomepageOrder({sectionVisibilityEnabled:true,sectionVisibility:[{section:"reviews",showMobile:false},{section:"hero",showMobile:false}],customSectionOrderEnabled:false},null)',context);
const style=document.head.children.at(-1);assert(style.textContent.includes('max-width:768px'));assert(!style.textContent.includes('#homeHero'));
console.log('PASS: move sections, toggles, restore, mobile hide, protected hero.');
