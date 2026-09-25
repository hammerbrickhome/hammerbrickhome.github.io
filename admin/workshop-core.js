/* Owner Workshop 4 — pure validation, image math, ZIP and QR helpers. No network. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HammerWorkshop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const enc = new TextEncoder();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = v => JSON.parse(JSON.stringify(v));
  const slug = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 75);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || 0));
  function safeUrl(value, external = true) {
    if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return false;
    if (/^\/(?!\/)/.test(value)) return !value.split(/[?#]/)[0].split('/').some(p => {try{return ['..','.'].includes(decodeURIComponent(p));}catch{return true;}});
    try { const u = new URL(value); return external && u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
  }
  function safePath(value) {
    return typeof value === 'string' && value.length < 220 && !value.startsWith('/') && !value.includes('\\') && !/[\u0000-\u001f]/.test(value) && !value.split('/').some(p => !p || p === '.' || p === '..');
  }
  function imagePath(value) {
    if (safeUrl(value)) return value;
    if (typeof value === 'string' && !value.includes('/') && /\.(jpe?g|png|webp|avif)$/i.test(value)) return '/images/' + encodeURIComponent(value);
    return '';
  }
  function cropRect(width, height, ratio, x = 50, y = 50) {
    if (!(width > 0 && height > 0 && ratio > 0)) throw Error('Invalid image dimensions.');
    const sw = Math.min(width, height * ratio), sh = sw / ratio;
    return {sx: (width - sw) * clamp(x, 0, 100) / 100, sy: (height - sh) * clamp(y, 0, 100) / 100, sw, sh};
  }
  function outputSize(rect, maxWidth) {
    const width = Math.max(1, Math.floor(Math.min(rect.sw, maxWidth)));
    return {width, height: Math.max(1, Math.round(width * rect.sh / rect.sw))};
  }
  function certificateStatus(record, now = new Date()) {
    if (!record.verified || !record.expiry || !/^\d{4}-\d{2}-\d{2}$/.test(record.expiry)) return 'unverified';
    const end = Date.parse(record.expiry + 'T00:00:00Z');
    if (!Number.isFinite(end) || new Date(end).toISOString().slice(0,10) !== record.expiry) return 'unverified';
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const date = Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const today = Date.parse(date.year+'-'+date.month+'-'+date.day+'T00:00:00Z');
    const days = (end - today) / 86400000;
    return days < 0 ? 'expired' : days <= 30 ? 'expires soon' : 'current';
  }
  function publicCertificates(records, now) {
    return records.filter(r => r.public === true && ['current','expires soon'].includes(certificateStatus(r, now)))
      .map(r => ({label: String(r.label || '').slice(0,150), number: String(r.number || '').slice(0,80), validUntil: r.expiry, ownerVerified: true}));
  }
  function validateConfig(c) {
    const errors = [];
    if (!c || typeof c !== 'object' || Array.isArray(c) || c.version !== 1) return ['Unsupported Workshop settings version.'];
    for (const key of ['projectChooserEnabled','publicTrustEnabled']) if (typeof c[key] !== 'boolean') errors.push(key + ' must be true or false.');
    if (!Array.isArray(c.projectChooserCategories) || c.projectChooserCategories.length > 12 || c.projectChooserCategories.some(x => typeof x !== 'string' || x.length > 60)) errors.push('Invalid project categories.');
    const e = c.emergency;
    if (!e || typeof e.enabled !== 'boolean' || typeof e.autoExpire !== 'boolean') errors.push('Invalid emergency settings.');
    if (e?.enabled && (!e.title?.trim() || !e.message?.trim())) errors.push('Emergency mode needs a title and message.');
    if (e?.linkUrl && !safeUrl(e.linkUrl)) errors.push('Emergency link must be a safe local path or HTTPS address.');
    if (e?.enabled && e.autoExpire && (!e.expiresAt || !Number.isFinite(Date.parse(e.expiresAt)))) errors.push('Choose a valid emergency expiration time.');
    if (!Array.isArray(c.publicTrust) || c.publicTrust.length > 30) errors.push('Invalid public trust records.');
    if (!Array.isArray(c.photoManifest)) errors.push('Invalid photo manifest.');
    if (!c.membership || typeof c.membership.overrideEnabled !== 'boolean' || typeof c.membership.activated !== 'boolean') errors.push('Invalid membership settings.');
    if (c.membership?.overrideEnabled && c.membership.year && !/^\d{4}$/.test(c.membership.year)) errors.push('Membership year must be four digits.');
    if (Array.isArray(c.publicTrust) && c.publicTrust.some(r=>!r || typeof r.label!=='string' || typeof r.ownerVerified!=='boolean' || !/^\d{4}-\d{2}-\d{2}$/.test(r.validUntil || ''))) errors.push('Invalid public trust summary.');
    // Private document fields must never travel through the public settings exporter.
    if (/("(?:documents|document|attachment|passphrase|ciphertext|privateNotes)"\s*:)/i.test(JSON.stringify(c))) errors.push('Private document fields are not allowed in public settings.');
    return errors;
  }
  function projectErrors(p) {
    const out = [];
    for (const k of ['title','summary','imageAlt','storyProblem','storySolution','storyResult']) if (!String(p?.[k] || '').trim()) out.push('Add ' + k.replace(/([A-Z])/g,' $1').toLowerCase() + '.');
    if (!safeUrl(p?.coverImage)) out.push('Choose a safe cover image path.');
    if (!p?.realProjectConfirmed) out.push('Confirm the project details and photographs are genuine.');
    if (!slug(p?.slug || p?.title)) out.push('Add a usable project name.');
    return out;
  }
  function projectPack(p, business, base = 'https://www.hammerbrickhome.com') {
    const errors = projectErrors(p); if (errors.length) throw Error(errors.join(' '));
    const path = 'project-' + slug(p.slug || p.title) + '.html', url = new URL('/' + path, base).href;
    const live = p.active === true && p.publishStatus === 'live';
    const image = (src, alt) => safeUrl(src) ? '<figure><img loading="lazy" src="' + esc(src) + '" alt="' + esc(alt) + '"><figcaption>' + esc(alt) + '</figcaption></figure>' : '';
    const section = (heading, text) => text ? '<section><h2>' + esc(heading) + '</h2><p>' + esc(text) + '</p></section>' : '';
    const location = p.showLocation === false ? '' : [p.neighborhood,p.areaLabel].filter(Boolean).join(', ');
    const schema = {'@context':'https://schema.org','@type':'WebPage','@id':url+'#webpage',url,name:p.seoTitle||p.title,description:p.seoDescription||p.summary,
      mainEntity:{'@type':'CreativeWork',name:p.title,description:p.summary,image:new URL(p.coverImage,base).href,creator:{'@id':base+'/#organization'}}};
    const body = '<h1>' + esc(p.title) + '</h1><p>' + esc([p.serviceLabel,location].filter(Boolean).join(' · ')) + '</p><p>'+esc(p.summary)+'</p>' + image(p.coverImage,p.imageAlt) + section('The problem',p.storyProblem) + image(p.beforeImage,p.beforeAlt||'Before: '+p.imageAlt) + section('Our work',p.storySolution) + (p.midProcessImages||[]).map((x,i)=>image(x,'Work in progress '+(i+1)+': '+p.imageAlt)).join('') + section('The result',p.storyResult) + image(p.afterImage,p.afterAlt||'After: '+p.imageAlt) + section('Materials used',p.materialsUsed) + section('Project timeline',p.timeline) + section('Care instructions',p.careInstructions) + section('Written warranty terms',p.warrantyTerms);
    const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="'+(live?'index,follow':'noindex,follow')+'"><title>'+esc(p.seoTitle||p.title)+' | '+esc(business.businessName)+'</title><meta name="description" content="'+esc(p.seoDescription||p.summary)+'"><link rel="canonical" href="'+esc(url)+'"><meta property="og:title" content="'+esc(p.title)+'"><meta property="og:description" content="'+esc(p.summary)+'"><meta property="og:image" content="'+esc(new URL(p.coverImage,base).href)+'"><script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script><style>'+printStyle()+'</style></head><body><header><a href="/">'+esc(business.businessName)+'</a> · <a href="/gallery.html">Project gallery</a></header><main>'+body+'</main><footer>'+esc(business.phone)+' · <a href="'+esc(base)+'">'+esc(base)+'</a></footer></body></html>';
    const caption = p.title+'\n\n'+p.summary+'\n\n'+(location?location+'\n':'')+url+'\n\n'+business.businessName+' · '+business.phone;
    return {path,url,live,html,body,schema,caption,care:(p.careInstructions||'No project-specific care instructions entered. Confirm manufacturer guidance before giving advice.')};
  }
  function printStyle() {
    return '*{box-sizing:border-box}body{margin:0;background:#fffdf8;color:#162832;font:16px/1.6 system-ui}header,main,footer{max-width:960px;margin:auto;padding:24px}header,footer{border-block:2px solid #ab7926}h1{font:700 clamp(28px,5vw,48px)/1.15 Georgia}h2{font:700 25px Georgia}p{white-space:pre-line;overflow-wrap:anywhere}a{color:#164b45}figure{margin:18px 0;break-inside:avoid}img{max-width:100%;height:auto;max-height:550px;object-fit:contain}figcaption{font-size:13px}.logo{max-width:110px;max-height:110px}svg.qr{width:170px;height:170px;display:block}.brand{color:#846022;text-transform:uppercase;letter-spacing:.1em}.sheet{padding:30px;border:2px solid #ad802b}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}section{margin:26px 0}small{color:#475b67}.print{margin:20px;padding:12px 20px}@page{size:letter;margin:.5in}@media print{body{background:white}header,main,footer{padding:10px}a{color:inherit;text-decoration:none}.print{display:none}h1,h2{break-after:avoid}section{break-inside:avoid}}';
  }
  function crc(bytes) { let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0; }
  function zip(entries) {
    const local=[],central=[],names=new Set();let offset=0;
    if(entries.length>65535)throw Error('Too many ZIP entries.');
    for(const [name,input] of entries){if(!safePath(name)||names.has(name))throw Error('Unsafe or duplicate ZIP path: '+name);names.add(name);const bytes=typeof input==='string'?enc.encode(input):input,n=enc.encode(name),h=new Uint8Array(30+n.length),v=new DataView(h.buffer),sum=crc(bytes);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,0x21,true);v.setUint32(14,sum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,n.length,true);h.set(n,30);local.push(h,bytes);const c=new Uint8Array(46+n.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,0x21,true);cv.setUint32(16,sum,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);c.set(n,46);central.push(c);offset+=h.length+bytes.length;}
    const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,central.reduce((s,c)=>s+c.length,0),true);ev.setUint32(16,offset,true);return new Blob([...local,...central,end],{type:'application/zip'});
  }
  // QR Model 2, version 5-L, byte mode, mask 0. One RS block; max 106 UTF-8 bytes.
  // Fixed version keeps URLs deterministic. Long URLs are rejected, never truncated.
  function qrMatrix(text) {
    const data=enc.encode(text);if(data.length>106)throw Error('QR address is too long (106 UTF-8 bytes maximum). Use a shorter project URL.');
    const bits=[];const add=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1);};add(4,4);add(data.length,8);data.forEach(b=>add(b,8));add(0,Math.min(4,864-bits.length));while(bits.length%8)bits.push(0);
    const words=[];for(let i=0;i<bits.length;i+=8)words.push(bits.slice(i,i+8).reduce((a,b)=>a*2+b,0));for(let i=0;words.length<108;i++)words.push(i%2?0x11:0xec);
    const mul=(a,b)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11d);z^=((b>>>i)&1)*a;}return z;};
    const divisor=Array(26).fill(0);divisor[25]=1;let power=1;for(let i=0;i<26;i++){for(let j=0;j<26;j++){divisor[j]=mul(divisor[j],power);if(j<25)divisor[j]^=divisor[j+1];}power=mul(power,2);}
    const rem=Array(26).fill(0);for(const b of words){const factor=b^rem.shift();rem.push(0);for(let i=0;i<26;i++)rem[i]^=mul(divisor[i],factor);}const stream=[];[...words,...rem].forEach(b=>{for(let i=7;i>=0;i--)stream.push((b>>>i)&1);});
    const n=37,m=Array.from({length:n},()=>Array(n).fill(false)),used=Array.from({length:n},()=>Array(n).fill(false));const set=(x,y,b)=>{if(x>=0&&x<n&&y>=0&&y<n){m[y][x]=!!b;used[y][x]=true;}};
    for(const [cx,cy] of [[3,3],[n-4,3],[3,n-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4);}
    for(let i=8;i<n-8;i++){set(6,i,i%2===0);set(i,6,i%2===0);}for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(30+dx,30+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
    const format=0x77c4,bit=i=>(format>>>i)&1;for(let i=0;i<=5;i++)set(8,i,bit(i));set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));for(let i=9;i<15;i++)set(14-i,8,bit(i));for(let i=0;i<8;i++)set(n-1-i,8,bit(i));for(let i=8;i<15;i++)set(8,n-15+i,bit(i));set(8,n-8,true);
    let k=0;for(let right=n-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<n;vert++){const y=((right+1)&2)===0?n-1-vert:vert;for(let j=0;j<2;j++){const x=right-j;if(!used[y][x])m[y][x]=Boolean((stream[k++]||0)^((x+y)%2===0?1:0));}}}return m;
  }
  function qrSvg(text) {const m=qrMatrix(text),s=m.length+8;return '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+s+' '+s+'" role="img" aria-label="QR code to '+esc(text)+'" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path fill="#071426" d="'+m.flatMap((row,y)=>row.flatMap((b,x)=>b?['M'+(x+4)+','+(y+4)+'h1v1h-1z']:[])).join('')+'"/></svg>';}
  return {esc,clone,slug,clamp,safeUrl,safePath,imagePath,cropRect,outputSize,certificateStatus,publicCertificates,validateConfig,projectErrors,projectPack,printStyle,crc,zip,qrMatrix,qrSvg};
});
