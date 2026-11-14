import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import sharp from 'sharp';
const errors=[],warnings=[];const context={window:{}};vm.runInNewContext(readFileSync('assets/js/content.js','utf8'),context);const d=context.window.PORTFOLIO_DATA;
for(const collection of ['projects','achievements','gallery','guides','devlogs','papers']){const ids=d[collection].map(x=>x.id);if(new Set(ids).size!==ids.length)errors.push(`Duplicate IDs in ${collection}`);}
const scripts=['assets/js/content.js','assets/js/site.js',...['src','api','server','scripts'].flatMap(dir=>readdirSync(dir).filter(n=>/\.m?js$/.test(n)).map(n=>`${dir}/${n}`))];
for(const file of scripts){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status)errors.push(`${file}: ${r.stderr}`);}
for(const page of [...d.pages.map(p=>p.file),'privacy.html','auth-callback.html']){const html=readFileSync(`dist/${page}`,'utf8');if((html.match(/name="description"/g)||[]).length!==1)errors.push(`${page}: duplicate description`);if(!html.includes('og:image:width" content="1600"')||!html.includes('og:image:height" content="900"'))errors.push(`${page}: incorrect share ratio`);if(html.includes('<aside id="musicPlayer"'))errors.push(`${page}: duplicate music player`);}
const required=['assets/images/profile-hero.webp','assets/images/head.png','assets/css/update.css','src/features.js','supabase/schema.sql','vercel.json','.env.example'];for(const f of required)if(!existsSync(f))errors.push(`Missing ${f}`);
for(const media of [...d.gallery.map(g=>g.image),...d.music.map(m=>m.src),d.background.src])if(media&&!existsSync(media))warnings.push(media);
const walk=dir=>readdirSync(dir).flatMap(name=>{const p=`${dir}/${name}`;return statSync(p).isDirectory()?walk(p):[p];});
for(const file of walk('dist'))if(/(^|\/)(\.env|\.vercel|node_modules|schema\.sql)/.test(file))errors.push(`Private file included in public output: ${file}`);
const image=await sharp('assets/images/social/og-cover.png').metadata();if(image.width!==1600||image.height!==900)errors.push('OG image must be 1600x900');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Validation passed: ${scripts.length} scripts, ${d.pages.length+2} page shells, unique content IDs, 16:9 metadata, private output boundaries.`);
console.log(`${warnings.length} intentionally omitted media files use fallbacks. Restore their original paths to show/play them.`);
