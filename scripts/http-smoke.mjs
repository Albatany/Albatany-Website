import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const port=4187;
const child=spawn(process.execPath,['scripts/server.mjs'],{env:{...process.env,PORT:String(port),SKIP_BUILD:'1',IGNORE_ENV_FILES:'1',WAKATIME_API_KEY:'',DISCORD_USER_ID:'',STEAM_API_KEY:'',STEAM_ID64:'',SUPABASE_URL:'',MONKEYTYPE_USERNAME:'',RESEND_API_KEY:''},stdio:['ignore','pipe','pipe']});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server did not start')),5000);child.stdout.on('data',c=>{if(String(c).includes('Portfolio running')){clearTimeout(timer);resolve();}});child.once('error',reject);});
 const expected=new Map([['/',200],['/about.html',200],['/projects.html',200],['/achievements.html',200],['/gallery.html',200],['/stats.html',200],['/contact.html',200],['/guides.html',200],['/devlogs.html',200],['/papers.html',200],['/gendut.html',200],['/privacy.html',200],['/auth-callback.html',200],['/assets/js/features.js',200],['/assets/css/update.css',200],['/assets/css/v6.css',200],['/assets/css/gendut.css',200],['/assets/js/pdf.worker.js',200],['/assets/images/social/og-cover.png',200],['/robots.txt',200],['/sitemap.xml',200],['/api/config',200],['/api/wakatime',503],['/api/discord',503],['/api/steam',503],['/api/monkeytype',503],['/.env',404],['/.env.local',404],['/supabase/schema.sql',404],['/server/http.mjs',404],['/api/config.mjs',404],['/README.md',404],['/package.json',404]]);
 for(const [path,status]of expected){const r=await fetch(`http://127.0.0.1:${port}${path}`);assert.equal(r.status,status,path);assert.ok(r.headers.get('Content-Security-Policy'));await r.body?.cancel();}
 const c=await fetch(`http://127.0.0.1:${port}/api/config`).then(r=>r.json());assert.equal(c.communityEnabled,false);assert.equal(c.supabasePublishableKey,'');
 const post=await fetch(`http://127.0.0.1:${port}/api/config`,{method:'POST'});assert.equal(post.status,405);
 const range=await fetch(`http://127.0.0.1:${port}/assets/images/social/og-cover.png`,{headers:{Range:'bytes=0-15'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);
 console.log(`HTTP checks passed: ${expected.size} routes + method protection + byte ranges. No live credentials used.`);
}finally{child.kill('SIGTERM');await Promise.race([once(child,'exit'),new Promise(r=>setTimeout(r,1000))]);}
