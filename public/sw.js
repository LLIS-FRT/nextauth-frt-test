if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(i,n)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let t={};const r=e=>a(e,c),f={module:{uri:c},exports:t,require:r};s[c]=Promise.all(i.map((e=>f[e]||r(e)))).then((e=>(n(...e),t)))}}define(["./workbox-c2c0676f"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/INhPPanKTZ7i0-5XBXjqz/_buildManifest.js",revision:"3e2d62a10f4d6bf0b92e14aecf7836f4"},{url:"/_next/static/INhPPanKTZ7i0-5XBXjqz/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/0e5ce63c-8ca26eb3bd1c5161.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/1220-4a0a4cca5e7536c4.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/1293-007cd590f70884c3.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/1336-0e475ad5efb3148f.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/13b76428-5a68792917164904.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/1551-47b7bd82a58e60cc.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/2403-a5f955468bfe66fc.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/2662-bc72ddcb3a087328.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/3304-b73f78a692a97f40.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/4080-c7c3af5e5305bbec.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/4124-3e3d0ca715743c61.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/4126-e70b3e3195238d7a.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/5384-3ea02979423d05a7.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/6235-387d02e46c98091b.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/6360-6707aeb4ed84e3ed.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/6809-f96892d94e6a9763.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/6832-320d825ae7c7069f.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/685-f61c15ef073baa07.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/7091-77ef24e348acb6fc.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/768-340f4d02457b960c.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/7776-a18b2f49d8605c3f.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/8174-15da7eca86804bdc.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/8297-f02341817d93c96a.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/8420-53fc0c8d48770d75.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/844-9cf29f3f431d9206.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/8772-fd6675d116854a25.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/8e1d74a4-1dfe86e3c6b79674.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/calendar/page-e8cd07142f85d320.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/layout-368e2e4abc1505f9.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/page-76ce6ec44ed70740.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/reports/%5Bid%5D/page-7f1d25d2c0bb1c28.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/reports/page-8d1e87e1350b499a.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/(normal-navbar)/settings/page-47da95d17e6c015f.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/_not-found/page-59acf81d6f9bcb28.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/admin/client/page-ae453d4cc527a6be.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/admin/layout-217de4c897db7f0d.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/admin/page-ff292a3c3e7eace9.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/admin/server/page-4d9770f1074689f6.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/admin/shift-manager/page-784a3e9e4ef7a97f.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/error/page-cff131684117d04b.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/layout-9949e39ac7f0c734.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/login/page-4a6df7807efecfa3.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/new-password/page-fa329f417bff8a1e.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/new-verification/page-e3453e8e1f2b6410.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/register/page-4fd36f30186343ca.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/auth/reset/page-b3c45e82ca012392.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/app/layout-35efb9ce28e07d2a.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/c15bf2b0-77a7fe2edf0e5bbc.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/e8686b1f-c594221ab8ddfc16.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/ee560e2c-107100b3ada05a29.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/f7333993-ebf1f3c5111f590e.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/fd9d1056-b360a9affe287c61.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/framework-8e0e0f4a6b83a956.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/main-app-535de617d9ff3be7.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/main-bf94e4a317b88723.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/pages/_app-f870474a17b7f2fd.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/pages/_error-c66a4e8afc46f17b.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-335dbb4bac532854.js",revision:"INhPPanKTZ7i0-5XBXjqz"},{url:"/_next/static/css/44491df69b1d0570.css",revision:"44491df69b1d0570"},{url:"/_next/static/css/4836d9950f954ae0.css",revision:"4836d9950f954ae0"},{url:"/_next/static/css/502e1e2d92ea1806.css",revision:"502e1e2d92ea1806"},{url:"/_next/static/media/0484562807a97172-s.p.woff2",revision:"b550bca8934bd86812d1f5e28c9cc1de"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/c3bc380753a8436c-s.woff2",revision:"5a1b7c983a9dc0a87a2ff138e07ae822"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/icons/apple-icon-180.png",revision:"244d44bc37bd63c74b68fc0df4b261cf"},{url:"/icons/apple-splash-1125-2436.jpg",revision:"ceb12bf6677fddc31bfcf610a3e13b82"},{url:"/icons/apple-splash-1136-640.jpg",revision:"dc38fa1beb7a24fe7fe2ee5ba26f24a7"},{url:"/icons/apple-splash-1170-2532.jpg",revision:"3e8028a662d3a31215df6b524e75c6ae"},{url:"/icons/apple-splash-1179-2556.jpg",revision:"af6ea6915e299c798664d2ef2750faa4"},{url:"/icons/apple-splash-1242-2208.jpg",revision:"86bac623064fa60b15769f3363e086ff"},{url:"/icons/apple-splash-1242-2688.jpg",revision:"5716fef0ded1bf707797f33695608957"},{url:"/icons/apple-splash-1284-2778.jpg",revision:"686983ca42e6a8a9f5bfa2d5acc7e9d3"},{url:"/icons/apple-splash-1290-2796.jpg",revision:"daefbc3361a09bf4a077791ba55fb08e"},{url:"/icons/apple-splash-1334-750.jpg",revision:"a96465254e41f391efcd36311f811a4d"},{url:"/icons/apple-splash-1488-2266.jpg",revision:"2f7fc8b117906f5a2be05bc380f27cee"},{url:"/icons/apple-splash-1536-2048.jpg",revision:"4d19a2cc9ab7d71f123110c4ede76e8c"},{url:"/icons/apple-splash-1620-2160.jpg",revision:"0ce2aa155a27a1f5b7e0a8f869c038cb"},{url:"/icons/apple-splash-1640-2360.jpg",revision:"18fc60f1600486816714a2f6ec7d1ae7"},{url:"/icons/apple-splash-1668-2224.jpg",revision:"cb93836c4213ca029dfd0b225e95fc2b"},{url:"/icons/apple-splash-1668-2388.jpg",revision:"9979a78037f15b6ec9255673a1980887"},{url:"/icons/apple-splash-1792-828.jpg",revision:"0b9b18772609d947f9c952f5cbf7aec2"},{url:"/icons/apple-splash-2048-1536.jpg",revision:"c8e972be0883f1215369c8a506b9938b"},{url:"/icons/apple-splash-2048-2732.jpg",revision:"53730c56c3d19010683418da7a1a912b"},{url:"/icons/apple-splash-2160-1620.jpg",revision:"029d2a8c8e8b4e998e81ebabf0f3c571"},{url:"/icons/apple-splash-2208-1242.jpg",revision:"d2afa8404e3a2390c145ef388c890b3b"},{url:"/icons/apple-splash-2224-1668.jpg",revision:"3e9db97290a0a89415fef33b3367f7fc"},{url:"/icons/apple-splash-2266-1488.jpg",revision:"86b5740d82f9341b0a3859a3d65310af"},{url:"/icons/apple-splash-2360-1640.jpg",revision:"decbbd3557219155492bafda3b9384c2"},{url:"/icons/apple-splash-2388-1668.jpg",revision:"1ba527b85f46f999655f1ec8380f4b39"},{url:"/icons/apple-splash-2436-1125.jpg",revision:"8c249afae683990e47d97e0887a958bf"},{url:"/icons/apple-splash-2532-1170.jpg",revision:"bcf01edc7eb015de743dc5b827ffe7aa"},{url:"/icons/apple-splash-2556-1179.jpg",revision:"60d95a2e7711c938a2be7a056078450c"},{url:"/icons/apple-splash-2688-1242.jpg",revision:"b1540251b680b7c4b2d3ffe3eb04cd30"},{url:"/icons/apple-splash-2732-2048.jpg",revision:"98a166fd95c7acb4fa2130b492d85a5c"},{url:"/icons/apple-splash-2778-1284.jpg",revision:"3998bec5442676df66b3f59c5e5443aa"},{url:"/icons/apple-splash-2796-1290.jpg",revision:"0f449cfe164f58276a307387951f391a"},{url:"/icons/apple-splash-640-1136.jpg",revision:"ee54e033446354d8babfb5b9cf9f71f5"},{url:"/icons/apple-splash-750-1334.jpg",revision:"0d89c126bbd79f17147a036fee88ac1b"},{url:"/icons/apple-splash-828-1792.jpg",revision:"8ef790d6940344dbe9ae3cead7acfd1c"},{url:"/icons/manifest-icon-192.maskable.png",revision:"e344662f952e65411e97285ae343f513"},{url:"/icons/manifest-icon-512.maskable.png",revision:"a68c719e4178b8c2ee16f4bb4db855ee"},{url:"/manifest.json",revision:"88d78cad0d1a192187f8af1dbdd6d2cc"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/robots.txt",revision:"1f66cdbfddbd0a5f450259af21853866"},{url:"/screenshots/screenshot-desktop.png",revision:"297255ea442df12520ca9950bf8e29e9"},{url:"/screenshots/screenshot-mobile.png",revision:"fa699bb4cedade8c00387f22e8f52f94"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e,url:{pathname:s}})=>!(!e||s.startsWith("/api/auth/callback")||!s.startsWith("/api/"))),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:a})=>"1"===e.headers.get("RSC")&&"1"===e.headers.get("Next-Router-Prefetch")&&a&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({request:e,url:{pathname:s},sameOrigin:a})=>"1"===e.headers.get("RSC")&&a&&!s.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:{pathname:e},sameOrigin:s})=>s&&!e.startsWith("/api/")),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({sameOrigin:e})=>!e),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
