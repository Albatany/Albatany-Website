export function json(res,status,payload,cache='no-store'){
  res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control',cache);res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(payload));
}
export function method(req,res,allowed='GET'){if(req.method===allowed)return true;res.setHeader('Allow',allowed);json(res,405,{message:'Method not allowed'});return false;}
export async function remoteJSON(url,options={}){
  const r=await fetch(url,{...options,signal:AbortSignal.timeout(8000)});if(!r.ok){const e=Error('Upstream unavailable');e.status=r.status;throw e;}return r.json();
}
export const publicCache='public, max-age=0, s-maxage=600, stale-while-revalidate=1200';
export const finite=(n,defaultValue=0)=>Number.isFinite(Number(n))?Number(n):defaultValue;
export function validateContact(body={}){
  const name=String(body.name||'').trim(),email=String(body.email||'').trim(),message=String(body.message||'').trim(),token=String(body.token||'');
  if(body.website)return {spam:true};
  if(name.length<2||name.length>80||/[\r\n]/.test(name)||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||message.length>4000||token.length<10||token.length>2048||!/^[a-f0-9-]{36}$/i.test(body.submissionId||''))return {error:true};
  return {name,email,message,token,submissionId:body.submissionId};
}
