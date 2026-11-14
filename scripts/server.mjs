import {createServer} from 'node:http';
import {createReadStream,existsSync,readFileSync,statSync} from 'node:fs';
import {resolve,join,relative,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=resolve('.'),port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
if(!process.env.SKIP_BUILD){const result=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});if(result.status)process.exit(result.status);}
if(!process.env.IGNORE_ENV_FILES){const defined=new Set(Object.keys(process.env));for(const file of ['.env','.env.local']){if(!existsSync(file))continue;for(const line of readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);if(m&&!defined.has(m[1]))process.env[m[1]]=m[2].replace(/^(['"])(.*)\1$/,'$2');}}}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.ttf':'font/ttf','.woff2':'font/woff2','.pdf':'application/pdf','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain'};
const headers=JSON.parse(readFileSync('vercel.json','utf8')).headers[0].headers;
createServer(async(req,res)=>{
  for(const h of headers)res.setHeader(h.key,h.value);
  let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(/^\/api\/[a-z]+$/.test(path)){
    const file=join(root,path+'.mjs');if(!existsSync(file)){res.writeHead(404);res.end();return;}
    try{if(req.method==='POST'){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>12000){res.writeHead(413);res.end();return;}chunks.push(chunk);}req.body=Buffer.concat(chunks).toString('utf8');}const {default:handler}=await import(pathToFileURL(file));await handler(req,res);}catch{if(!res.headersSent){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Service unavailable'}));}}return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  const staticRoot=join(root,'dist'),file=resolve(staticRoot,'.'+(path==='/'?'/index.html':path)),rel=relative(staticRoot,file);
  if(rel.startsWith('..')||rel.split(/[\\/]/).some(p=>p.startsWith('.'))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404 — File not found');return;}
  res.setHeader('Content-Type',types[extname(file).toLowerCase()]||'application/octet-stream');res.setHeader('Cache-Control','no-store');const size=statSync(file).size;
  if(req.headers.range){const m=req.headers.range.match(/^bytes=(\d+)-(\d*)$/);if(m){const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),size-1):size-1;if(start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);return;}}
  res.writeHead(200,{'Content-Length':size,'Accept-Ranges':'bytes'});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
}).listen(port,host,()=>console.log(`Portfolio running locally: http://${host}:${port}`));
