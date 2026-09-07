const CACHE="flt-v1.9.3";
const PRECACHE=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).catch(()=>{}));
});

self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const sameOrigin=new URL(e.request.url).origin===self.location.origin;
  e.respondWith(caches.match(e.request).then(hit=>{
    if(hit)return hit;
    const p=fetch(e.request);
    if(!sameOrigin)return p;
    return p.then(res=>{
      if(res.ok){
        const cp=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      }
      return res;
    });
  }));
});
