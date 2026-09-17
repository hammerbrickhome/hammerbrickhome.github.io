/* Preview-only data bridge. The public website always uses its real files. */
(() => {
  'use strict';
  const version=new URLSearchParams(location.search).get('studioPreview');
  if (window.parent === window || !['1','2'].includes(version)) return;
  let draft;
  try {
    const parentPath=window.parent.location.pathname;
    if (window.parent.location.origin !== location.origin || !/^\/admin\/studio(?:\.html)?\/?$/.test(parentPath)) return;
    draft=JSON.parse(sessionStorage.getItem(version==='2'?'hammer-studio-preview-v2':'hammer-studio-preview-v1') || 'null');
  } catch {return;}
  if (!draft || !draft.files) return;
  const originalFetch=window.fetch.bind(window);
  window.fetch=(input,options)=>{
    const url=new URL(typeof input==='string'?input:input.url,location.href);
    const value=draft.files[url.pathname.replace(/^\//,'')];
    if(url.origin===location.origin&&value!==undefined)return Promise.resolve(new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}}));
    return originalFetch(input,options);
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const meta=document.createElement('meta');meta.name='robots';meta.content='noindex,nofollow';document.head.append(meta);
    // Preview actions cannot place calls, submit requests, or navigate away.
    document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();},true);
    document.addEventListener('submit',e=>e.preventDefault(),true);
  });
})();
