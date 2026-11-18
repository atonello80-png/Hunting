const SHELL='chiarano-test-shell-v2',TILES='chiarano-test-ortofoto-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./localita-test.js','./confine-test.js','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL);await cache.addAll(ASSETS);
 for(const url of ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css']){
  try{const response=await fetch(url,{mode:'no-cors'});await cache.put(url,response)}catch(e){}
 }
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 const ortho=url.hostname==='geoportale.agea.gov.it'&&url.pathname.includes('/Ortofoto_AgEA_2024/ImageServer/tile/');
 if(ortho){event.respondWith((async()=>{
  const cache=await caches.open(TILES),saved=await cache.match(request.url);
  if(saved)return saved;
  const response=await fetch(request);
  return response;
 })());return}
 if(url.origin===self.location.origin||url.hostname==='unpkg.com'){
  event.respondWith((async()=>{const cache=await caches.open(SHELL);return await cache.match(request)||fetch(request)})());
 }
});
