if(!self.define){let e,t={};const s=(s,a)=>(s=new URL(s+".js",a).href,t[s]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=t,document.head.appendChild(e)}else e=s,importScripts(s),t()})).then((()=>{let e=t[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(a,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(t[n])return;let i={};const r=e=>s(e,n),u={module:{uri:n},exports:i,require:r};t[n]=Promise.all(a.map((e=>u[e]||r(e)))).then((e=>(c(...e),i)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"3933a5bfe7442d23a2c3a71ec1b6517b"},{url:"/_next/static/1LXct28eQgKjh8OHgaNLt/_buildManifest.js",revision:"b222cbf4d8e1f47e27a8925222733e53"},{url:"/_next/static/1LXct28eQgKjh8OHgaNLt/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0e5ce63c-35cb5e50a860438b.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/1220-36c788f68b3f5946.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/1336-0fc1de3327e19786.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/13b76428-2766062259657f3c.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/2342-fce120b2a4d241a1.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/2514-f876dd95b29c0a57.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/2894-06b18b07bf18c34d.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/3304-58c279050e679835.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/3561-59c86c4d5a758386.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/4080-73a4625f536b65d8.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/4124-23b5294a16a29d7e.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/5384-8c481e192b7042ab.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/6360-700d8cac26192696.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/685-a5c98b44cf91568b.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/7023-586cf577b4c64447.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/7091-811e32f0d047b381.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/7097-ae0e5ce4ed709abd.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/768-c936602aad459a22.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/7776-80570fc00f7c8095.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/8297-f488b61e2b179ca2.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/8420-fe0c3d7f47e3fb00.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/8666-c220c32a7037b97e.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/8e1d74a4-9ea998d839ec199a.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/9222-5d2ad67556625a53.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/9418-267f535f18265be9.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/9630-c2e738b7c445c07a.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/aaea2bcf-c7ee2359f9f99c29.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/calendar/page-c97b41834cc7a0b1.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/layout-9b15aae3f1e9fbd6.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/page-540e5496060f4e64.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/reports/%5Bid%5D/page-26e9979000253334.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/reports/page-b6af87846a5f6c97.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/(normal-navbar)/settings/page-3357f88225aa9560.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/_not-found/page-e2686463e0579713.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/admin/client/page-95987cae4cb2ad55.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/admin/layout-f87e22c506f08e9e.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/admin/page-caa4bc3ca1a93cd2.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/admin/server/page-b7c077c329ddf492.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/admin/shift-manager/page-fe019afe683a39a5.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/error/page-f27b4df2b732bd85.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/layout-0948f2b6f006e13d.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/login/page-0c98b56c809167a3.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/new-password/page-5e3ae863201c1db7.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/new-verification/page-286289ba3c65531b.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/register/page-fff974bc84058d92.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/auth/reset/page-c1c0881f1aff7c3d.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/app/layout-04e763d953100b19.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/c15bf2b0-c5f2ab0c4ce668d5.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/ee560e2c-861fb7fb6769eb33.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/f7333993-de9ed6ced4939c46.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/fd9d1056-0d4cb290b2ca54d0.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/framework-a63c59c368572696.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/main-app-a42a611e2cb8655f.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/main-f2830f89c74d9bc8.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/pages/_app-00b74eae5e8dab51.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/pages/_error-c72a1f77a3c0be1b.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-71b60490a566b320.js",revision:"1LXct28eQgKjh8OHgaNLt"},{url:"/_next/static/css/88fcc69dcc7a7860.css",revision:"88fcc69dcc7a7860"},{url:"/_next/static/css/b26f3cb99e3cf977.css",revision:"b26f3cb99e3cf977"},{url:"/_next/static/media/0484562807a97172-s.p.woff2",revision:"b550bca8934bd86812d1f5e28c9cc1de"},{url:"/_next/static/media/0a03a6d30c07af2e-s.woff2",revision:"79da53ebaf3308c806394df4882b343d"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/manifest.json",revision:"713d15134957264654b9a180c21e424e"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/robots.txt",revision:"1f66cdbfddbd0a5f450259af21853866"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:t,event:s,state:a})=>t&&"opaqueredirect"===t.type?new Response(t.body,{status:200,statusText:"OK",headers:t.headers}):t}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const t=e.pathname;return!t.startsWith("/api/auth/")&&!!t.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));