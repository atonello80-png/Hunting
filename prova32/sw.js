const SHELL='hunting32-shell-v1',TILES='hunting27-ortofoto-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./localita-istria.js'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL);await cache.addAll(ASSETS);
 for(const url of ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css']){
  try{const response=await fetch(url,{mode:'no-cors'});await cache.put(url,response)}catch(e){}
 }
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('hunting27-')||k.startsWith('hunting28-')||k.startsWith('hunting29-'))&&![SHELL,TILES].includes(k)).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 const ortho=url.hostname==='geoportal.dgu.hr'&&url.pathname.includes('/orthophoto_')&&url.searchParams.get('request')?.toLowerCase()==='getmap';
 if(ortho){event.respondWith((async()=>{
  const cache=await caches.open(TILES),saved=await cache.match(request.url);
  if(saved)return saved;
  const response=await fetch(request);
  if(response.ok||response.type==='opaque'){
   try{await cache.put(request.url,response.clone())}catch(e){}
  }
  return response;
 })());return}
 if(url.origin===self.location.origin||url.hostname==='unpkg.com'){
  event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(request)||fetch(request)})());
 }
});
