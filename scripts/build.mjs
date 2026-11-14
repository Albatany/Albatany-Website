import {build} from 'esbuild';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import config from '../site.config.mjs';
import {generateSocial} from './social-cover.mjs';
const assetVersion = Date.now().toString(36);
const sandbox={window:{}};vm.runInNewContext(await fs.readFile('assets/js/content.js','utf8'),sandbox);const data=sandbox.window.PORTFOLIO_DATA;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await fs.mkdir('assets/images/backgrounds',{recursive:true});
await fs.mkdir('assets/images/social',{recursive:true});
let seed=43;const random=()=>((seed=seed*16807%2147483647)/2147483647);const stars=Array.from({length:100},()=>`<circle cx="${Math.round(random()*1600)}" cy="${Math.round(random()*900)}" r="${(random()*.9+.35).toFixed(2)}" fill="${random()>.5?'#b7d1e5':'#ffffff'}" opacity="${(random()*.55+.1).toFixed(2)}"/>`).join('');
await fs.writeFile('assets/images/backgrounds/stars.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><radialGradient id="g"><stop stop-color="#11283a"/><stop offset="1" stop-color="#020507"/></radialGradient></defs><path fill="url(#g)" d="M0 0h1600v900H0z"/>${stars}</svg>`);
await fs.writeFile('assets/images/media-unavailable.svg','<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><path fill="#0b1721" d="M0 0h800v600H0z"/><g stroke="#2b4354" fill="none"><path d="M40 40h720v520H40z"/><path d="M40 300h720M400 40v520" opacity=".3"/><path d="M365 230h70v60h-70zM376 275l17-19 13 13 11-9 18 20"/></g><g fill="#8fa5b4" font-family="monospace" font-size="16" text-anchor="middle"><text x="400" y="332">VISUAL ARCHIVE</text><text x="400" y="360" font-size="11">Image unavailable</text></g></svg>');
await generateSocial();
const pages=[...data.pages,{id:'privacy',file:'privacy.html',label:{id:'Privasi'}},{id:'auth',file:'auth-callback.html',label:{id:'Login'}}];
for(const p of pages){
  const url=config.url+(p.id==='home'?'/':`/${p.file}`),title=p.id==='home'?config.shareTitle:`${p.label.id} | ${config.name}`;
  const html=`<!doctype html>\n<html lang="id"><head>\n<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>${esc(title)}</title><meta name="description" content="${esc(config.description)}"><meta name="theme-color" content="#07111a">\n
  <link rel="icon" type="image/png" href="assets/images/icon.png">
  <link rel="canonical" href="${esc(url)}">\n<meta property="og:type" content="website"><meta property="og:locale" content="id_ID"><meta property="og:site_name" content="${esc(config.name)}">\n<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(config.description)}"><meta property="og:url" content="${esc(url)}">\n<meta property="og:image" content="${esc(config.url+config.socialImage)}"><meta property="og:image:secure_url" content="${esc(config.url+config.socialImage)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="${config.socialWidth}"><meta property="og:image:height" content="${config.socialHeight}"><meta property="og:image:alt" content="Albatany | Games, systems, digital experiences.">\n<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(config.description)}"><meta name="twitter:image" content="${esc(config.url+config.socialImage)}">\n${p.id==='auth'?'<meta name="robots" content="noindex,nofollow">':''}\n
  <link rel="preload" href="assets/fonts/Helvetica.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="assets/css/site.css?v=${assetVersion}">
  <link rel="stylesheet" href="assets/css/update.css?v=${assetVersion}">
  <link rel="stylesheet" href="assets/css/v6.css?v=${assetVersion}">${p.id==='gendut'?`\n  <link rel="stylesheet" href="assets/css/gendut.css?v=${assetVersion}">`:''}\n
  <script src="assets/js/content.js?v=${assetVersion}" defer></script>
  <script src="assets/js/site.js?v=${assetVersion}" defer></script>
  <script type="module" src="assets/js/features.js?v=${assetVersion}"></script></head>
  \n<body data-page="${p.id}"><div id="pageRoot" tabindex="-1"></div><noscript><main class="page"><h1>${esc(config.name)}</h1><p>${esc(config.description)}</p><p>Aktifkan JavaScript untuk membuka navigasi dan fitur interaktif.</p><a href="mailto:${esc(data.person.email)}">${esc(data.person.email)}</a> · <a href="https://github.com/Albatany">GitHub</a></main></noscript></body></html>\n`;
  await fs.writeFile(p.file,html);
}
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist',{recursive:true});
await fs.cp('assets','dist/assets',{recursive:true,filter:source=>!source.endsWith('README.md')});
for(const p of pages)await fs.copyFile(p.file,`dist/${p.file}`);
// Pembaca PDF (Guides & Papers): worker dan font standar pdf.js disalin apa adanya, dimuat hanya saat PDF dibuka.
await fs.copyFile('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs','dist/assets/js/pdf.worker.js'); // .js supaya semua host mengirim MIME JavaScript
await fs.cp('node_modules/pdfjs-dist/standard_fonts','dist/assets/pdfjs/standard_fonts',{recursive:true});
await build({entryPoints:{features:'src/features.js'},outdir:'dist/assets/js',bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],minify:true,chunkNames:'chunks/[name]-[hash]',legalComments:'linked',logLevel:'info'});
await fs.writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /auth-callback.html\nSitemap: ${config.url}/sitemap.xml\n`);
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p.id!=='auth').map(p=>`<url><loc>${esc(config.url+(p.id==='home'?'/':'/'+p.file))}</loc></url>`).join('')}</urlset>`);
console.log(`Build complete: ${pages.length} pages. Static output: dist/. Server functions: api/.`);
