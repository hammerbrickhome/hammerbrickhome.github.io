/* Owner Studio: local drafts and file exports only. No repository credentials. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
 const paths=['site-data/homepage.json','site-data/design.json','site-data/projects.json'];
 const titles=['Original Classic','Pomegranate Prestige','Executive Trust','Project Gallery','Cream, Green & Brick','Fourth of July','Winter Midnight','Spring Renewal','Summer Coast','Autumn Hearth','Holiday Evergreen','NYC Blueprint','Architectural Monochrome','Terracotta Studio','Royal Estate','White Architectural Estate','Master Craftsman Gold','NYC Skyline Night','Brownstone Heritage','Garden Residence','Limestone Gallery','Copper Workshop','Coastal House','Architect Paper','Emerald Signature','White Buildings — Full Page','Gold Buildings — Full Page','Champagne Avenue — Full Page','Sapphire City — Full Page','Olive & Limestone — Full Page'];
 const keys=['classic','luxury','leads','portfolio','local','americana','winter','spring','summer','autumn','holiday','blueprint','monochrome','terracotta','royal','ivory-estate','gold-noir','skyline-night','brownstone-craft','garden-estate','stone-gallery','copper-workshop','coastal-house','architect-paper','emerald-signature','ivory-panorama','gold-panorama','champagne-panorama','sapphire-panorama','olive-panorama'];
 const sections={announcement:'Announcement',hero:'Main headline & logo','quick-actions':'Call / text / estimate buttons','service-areas':'Area cards',guarantee:'Your guarantee',process:'How we work',reviews:'Reviews','area-summary':'Service area summary',projects:'Recent projects','before-after':'Before & after',materials:'Materials',membership:'Membership & services',specials:'Specials',tiers:'Estimate tiers',faq:'Common questions'};
 const toggles={announcement:'announcementEnabled','quick-actions':'showHomepageQuickActions','service-areas':'showServiceAreas',guarantee:'showGuarantee',process:'showProcess',reviews:'showReviews','area-summary':'showServiceArea','before-after':'showBeforeAfter',materials:'showPremiumMaterials',membership:'showMembershipServices',specials:'showSpecials',tiers:'showTiers',faq:'showFaq'};
 let files,original,undo=[],redo=[],timer,ready=false,focusToken='',previewScroll=0;
 const assets=new Map(),presetKey='hammer-owner-presets-v1';
 const home=()=>files[paths[0]],design=()=>files[paths[1]],projects=()=>files[paths[2]];
 const label=k=>k.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
 function status(s){$('status').textContent=s;}
 function normalizeOrder(h){return [...new Set([...(Array.isArray(h.customSectionOrder)?h.customSectionOrder:[]),...Object.keys(sections)])].filter(x=>x in sections);}
 function move(h,from,to){const order=normalizeOrder(h),a=order.indexOf(from),b=order.indexOf(to);if(a<0||b<0||a===b)return;order.splice(b,0,order.splice(a,1)[0]);h.customSectionOrder=order;h.customSectionOrderEnabled=true;}
 function checkpoint(){undo.push(clone(files));if(undo.length>40)undo.shift();redo=[];}
 function mutate(fn,rebuild=false){checkpoint();fn();if(rebuild)render();changed();}
 function changed(){renderExports();$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;clearTimeout(timer);timer=setTimeout(preview,650);status('Draft updated. Preview refreshes automatically. Nothing has been published.');}
 function make(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
 function button(text,fn){const b=make('button',text);b.type='button';b.onclick=fn;return b;}
 function field(parent,obj,key,options={}){
  const l=make('label',options.title||label(key));let input;
  if(options.choices){input=make('select');options.choices.forEach(v=>{const o=make('option',v);o.value=v;input.append(o);});}
  else {input=make(options.multiline?'textarea':'input');if(!options.multiline)input.type=typeof obj[key]==='boolean'?'checkbox':typeof obj[key]==='number'?'number':/Color$/.test(key)?'color':'text';}
  input.dataset.field=key;
  if(input.type==='checkbox')input.checked=obj[key]===true;else input.value=Array.isArray(obj[key])?obj[key].join('\n'):obj[key]??'';
  input.onchange=()=>{let value=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;
   if(input.type==='number'&&!Number.isFinite(value)){status('Enter a valid number.');return;}
   if(options.list)value=String(value).split('\n').map(s=>s.trim()).filter(Boolean);
   if(options.url&&value&&!/^\/(?!\/)|^https?:\/\//i.test(value)){status('Use an image path beginning with /images/ or a full https:// URL.');return;}
   mutate(()=>obj[key]=value);
  };l.append(input);parent.append(l);
  if(options.image){const pick=make('input');pick.type='file';pick.accept='image/png,image/jpeg,image/webp';pick.setAttribute('aria-label','Choose file for '+label(key));pick.onchange=()=>{
   const file=pick.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){status('Choose a PNG, JPEG or WebP under 10 MB.');return;}
   const path='/images/owner/'+Date.now()+'-'+file.name.replace(/[^a-z0-9._-]/gi,'-');assets.set(path,{file,url:URL.createObjectURL(file)});mutate(()=>obj[key]=path,true);
  };l.append(pick);}
 }
 function renderSections(){
  const h=home(),list=$('sections');list.replaceChildren();$('customOrder').checked=h.customSectionOrderEnabled===true;$('deviceVisibility').checked=h.sectionVisibilityEnabled===true;
  const order=normalizeOrder(h);
  order.forEach((token,index)=>{
   const li=make('li');li.dataset.token=token;const handle=button('↕',()=>{});handle.className='handle';handle.setAttribute('aria-label','Drag '+sections[token]);li.append(handle,make('strong',sections[token]));
   [-1,1].forEach(delta=>{const b=button(delta<0?'↑':'↓',()=>mutate(()=>move(home(),token,order[index+delta]),true));b.disabled=index+delta<0||index+delta>=order.length;b.setAttribute('aria-label',(delta<0?'Move up ':'Move down ')+sections[token]);li.append(b);});
   if(toggles[token]){const l=make('label','Show');const box=make('input');box.type='checkbox';box.checked=token==='announcement'?h[toggles[token]]===true:h[toggles[token]]!==false;box.onchange=()=>mutate(()=>h[toggles[token]]=box.checked);l.prepend(box);li.append(l);}
   if(token!=='hero')for(const device of ['Desktop','Mobile']){const row=(h.sectionVisibility||[]).find(x=>x.section===token);const l=make('label',device);const box=make('input');box.type='checkbox';box.checked=!row||row['show'+device]!==false;box.onchange=()=>mutate(()=>{h.sectionVisibility=h.sectionVisibility||[];let item=h.sectionVisibility.find(x=>x.section===token);if(!item){item={section:token,showDesktop:true,showMobile:true};h.sectionVisibility.push(item);}item['show'+device]=box.checked;h.sectionVisibilityEnabled=true;$('deviceVisibility').checked=true;});l.prepend(box);li.append(l);}
   handle.onpointerdown=e=>{if(e.button!==0)return;handle.setPointerCapture(e.pointerId);li.classList.add('dragging');let target=token;
    handle.onpointermove=ev=>{const found=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('#sections li');list.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));if(found){target=found.dataset.token;found.classList.add('drop-target');}if(ev.clientY<80)window.scrollBy(0,-18);if(ev.clientY>innerHeight-80)window.scrollBy(0,18);};
    const end=()=>{li.classList.remove('dragging');list.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));handle.onpointermove=null;handle.onpointerup=null;handle.onpointercancel=null;};
    handle.onpointerup=()=>{end();if(target!==token)mutate(()=>move(home(),token,target),true);};handle.onpointercancel=end;
   };
   list.append(li);
  });
 }
 function render(){
  $('theme').value=home().homepageLayout||'classic';renderSections();$('copyFields').replaceChildren();
  Object.entries(home()).forEach(([k,v])=>{if(typeof v==='string'&&k!=='homepageLayout')field($('copyFields'),home(),k,{multiline:/Text|Intro|Note/.test(k)});});
  for(const k of ['trustPills','premiumMaterials'])field($('copyFields'),home(),k,{multiline:true,list:true});
  $('designFields').replaceChildren();const selects={backgroundTarget:['hero','page'],backgroundPosition:['center center','center top','center bottom','left center','right center'],backgroundMobilePosition:['center center','center top','center bottom','left center','right center'],backgroundSize:['cover','contain','auto'],backgroundAttachment:['scroll','fixed'],logoShape:['original','circle','rounded','square'],heroLogoPosition:['default','left','center','right'],headingFont:['theme','serif','sans']};
  Object.keys(design()).forEach(k=>field($('designFields'),design(),k,{choices:selects[k],image:['logoDesktop','logoMobile','heroLogo','backgroundDesktop','backgroundMobile'].includes(k),url:['logoDesktop','logoMobile','heroLogo','backgroundDesktop','backgroundMobile'].includes(k)}));
  $('assets').replaceChildren();for(const [path,item] of assets){const a=make('a','Download image → '+path);a.href=item.url;a.download=path.split('/').pop();$('assets').append(a);}
  $('projectFields').replaceChildren();const data=projects();field($('projectFields'),data,'heading');field($('projectFields'),data,'intro',{multiline:true});
  (data.projects||[]).forEach((p,i)=>{const panel=make('div');panel.className='project-editor';panel.append(make('h3',p.title||'Untitled project — add a real title'));const bar=make('div');bar.className='toolbar';[-1,1].forEach(delta=>{const b=button(delta<0?'↑ Earlier':'↓ Later',()=>mutate(()=>{const list=projects().projects;[list[i],list[i+delta]]=[list[i+delta],list[i]];list.forEach((x,n)=>x.displayOrder=n+1);},true));b.disabled=i+delta<0||i+delta>=data.projects.length;bar.append(b);});panel.append(bar);
   for(const key of ['title','serviceLabel','areaLabel','neighborhood','imageAlt','summary'])field(panel,p,key,{multiline:key==='summary'});
   for(const key of ['coverImage','beforeImage','afterImage'])field(panel,p,key,{image:true,url:true});
   for(const key of ['midProcessImages','additionalImages'])field(panel,p,key,{multiline:true,list:true});
   field(panel,p,'stageDisplay',{choices:['buttons','grid','compare']});field(panel,p,'publishStatus',{choices:['draft','live']});
   for(const key of ['active','featured','showOnHomepage','showInGallery']){if(typeof p[key]!=='boolean')continue;field(panel,p,key);}
   $('projectFields').append(panel);
  });
  $('editor').disabled=false;renderExports();$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;$('restore').disabled=false;
 }
 function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const a=make('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function renderExports(){const changedPaths=paths.filter(p=>JSON.stringify(files[p])!==JSON.stringify(original[p]));$('changes').textContent=changedPaths.length?changedPaths.length+' settings file(s) changed. Download each below.':'No edits yet. The live files remain untouched.';$('exports').replaceChildren();changedPaths.forEach(p=>$('exports').append(button('Download '+p,()=>download(p.split('/').pop()+($('textExport').checked?'.txt':''),files[p]))));}
 function preview(){if(!ready)return;const data=clone(files);function replace(x){if(Array.isArray(x))return x.map(replace);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,replace(v)]));return typeof x==='string'&&assets.has(x)?assets.get(x).url:x;}
  try{try{previewScroll=$('preview').contentWindow.scrollY||0;}catch{}sessionStorage.setItem('hammer-studio-preview-v1',JSON.stringify({files:replace(data)}));$('preview').src='/?studioPreview=1&revision='+Date.now();}catch{status('Browser draft storage is unavailable. Downloads still work, but preview cannot show edits.');}
 }
 function presets(){try{return JSON.parse(localStorage.getItem(presetKey)||'{}');}catch{return {};}}
 function renderPresets(){const s=$('presets');s.replaceChildren();Object.keys(presets()).forEach(k=>{const o=make('option',k);o.value=k;s.append(o);});}
 function valid(bundle){if(!bundle||bundle.format!=='hammer-owner-studio-v1'||!bundle.files)throw Error('Choose an Owner Studio editing backup.');for(const p of paths){const x=bundle.files[p];if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Backup is missing '+p);}const h=bundle.files[paths[0]],d=bundle.files[paths[1]],p=bundle.files[paths[2]];if(!keys.includes(h.homepageLayout)||typeof d.brandingEnabled!=='boolean'||!Array.isArray(p.projects))throw Error('Backup settings are invalid.');return clone(bundle.files);}
 keys.forEach((k,i)=>{const o=make('option',(i+1)+' — '+titles[i]);o.value=k;$('theme').append(o);});
 $('theme').onchange=()=>mutate(()=>home().homepageLayout=$('theme').value);
 $('customOrder').onchange=e=>mutate(()=>{home().customSectionOrder=normalizeOrder(home());home().customSectionOrderEnabled=e.target.checked;});
 $('deviceVisibility').onchange=e=>mutate(()=>home().sectionVisibilityEnabled=e.target.checked);
 $('undo').onclick=()=>{if(!undo.length)return;redo.push(clone(files));files=undo.pop();render();changed();};
 $('redo').onclick=()=>{if(!redo.length)return;undo.push(clone(files));files=redo.pop();render();changed();};
 $('restore').onclick=()=>{if(confirm('Restore the files originally loaded? You can undo this.'))mutate(()=>files=clone(original),true);};
 $('addProject').onclick=()=>mutate(()=>{projects().projects.push({title:'',publishStatus:'draft',active:false,featured:false,showOnHomepage:true,showInGallery:true,displayOrder:projects().projects.length+1});},true);
 $('previewSize').onchange=e=>{$('preview').style.width=e.target.value;};$('refresh').onclick=preview;
 $('preview').onload=()=>{setTimeout(()=>{try{$('preview').contentWindow.scrollTo(0,previewScroll);}catch{}},500);};
 $('backup').onclick=()=>download('hammer-editing-backup.json',{format:'hammer-owner-studio-v1',files});
 $('savePreset').onclick=()=>{const name=$('presetName').value.trim();if(!name)return status('Name your preset first.');const all=presets();if(Object.hasOwn(all,name)&&!confirm('Replace this saved preset?'))return;try{Object.defineProperty(all,name,{value:{format:'hammer-owner-studio-v1',files:clone(files)},enumerable:true,configurable:true,writable:true});localStorage.setItem(presetKey,JSON.stringify(all));renderPresets();status('Preset saved on this device. Download a backup for safekeeping.');}catch{status('Device storage is full or blocked. Download an editing backup instead.');}};
 $('loadPreset').onclick=()=>{try{const next=valid(presets()[$('presets').value]);mutate(()=>files=next,true);}catch(e){status(e.message);}};
 $('deletePreset').onclick=()=>{const name=$('presets').value;if(!name||!confirm('Delete saved preset '+name+'?'))return;const all=presets();delete all[name];try{localStorage.setItem(presetKey,JSON.stringify(all));renderPresets();}catch{status('Device storage is unavailable.');}};
 $('import').onchange=async e=>{try{const next=valid(JSON.parse(await e.target.files[0].text()));if(files)checkpoint();else original=clone(next);files=next;ready=true;render();changed();}catch(err){status(err.message);}};
 window.HammerStudio={move,normalizeOrder,valid};
 Promise.all(paths.map(async p=>{const r=await fetch('/'+p,{cache:'no-store'});if(!r.ok)throw Error('Could not load '+p);return [p,await r.json()];})).then(rows=>{files=Object.fromEntries(rows);original=clone(files);ready=true;render();renderPresets();preview();status('Ready. Drag sections or open an editing group. All edits stay in your draft.');}).catch(e=>status(e.message+'. Open through your website/local server, or import an editing backup.'));
})();
