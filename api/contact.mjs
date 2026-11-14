import {json,method,validateContact} from '../server/http.mjs';
export default async function handler(req,res){
  if(!method(req,res,'POST'))return;
  const {RESEND_API_KEY,CONTACT_FROM_EMAIL,CONTACT_TO_EMAIL,TURNSTILE_SECRET_KEY}=process.env;
  if(!RESEND_API_KEY||!CONTACT_FROM_EMAIL||!CONTACT_TO_EMAIL||!TURNSTILE_SECRET_KEY)return json(res,503,{message:'Pengiriman langsung belum aktif. Gunakan tautan email.'});
  const allowed=new Set([process.env.SITE_URL||'https://albatany.vercel.app',...(process.env.VERCEL_URL?[`https://${process.env.VERCEL_URL}`]:[]),...(process.env.NODE_ENV!=='production'&&!process.env.VERCEL?['http://localhost:4173','http://127.0.0.1:4173']:[])]);
  const origin=req.headers.origin;
  if(!allowed.has(origin))return json(res,403,{message:'Origin tidak diizinkan.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{message:'Content type tidak didukung.'});
  let body;try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!body||JSON.stringify(body).length>10000)throw Error();}catch{return json(res,400,{message:'Permintaan tidak valid.'});}
  const value=validateContact(body);if(value.spam)return json(res,400,{message:'Permintaan tidak valid.'});if(value.error)return json(res,400,{message:'Periksa nama, email, pesan, dan verifikasi.'});
  try{
    const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:TURNSTILE_SECRET_KEY,response:value.token}),signal:AbortSignal.timeout(8000)}).then(r=>r.json());
    if(!verification.success||verification.action!=='contact'||verification.hostname!==new URL(origin).hostname)return json(res,400,{message:'Verifikasi kedaluwarsa atau tidak valid. Silakan ulangi.'});
    const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`portfolio-contact/${value.submissionId}`},body:JSON.stringify({from:CONTACT_FROM_EMAIL,to:[CONTACT_TO_EMAIL],reply_to:value.email,subject:`Portfolio message from ${value.name}`,text:`Name: ${value.name}\nReply to: ${value.email}\n\n${value.message}`}),signal:AbortSignal.timeout(8000)});
    if(!result.ok)return json(res,502,{message:'Layanan email belum menerima pesan. Silakan coba lagi atau gunakan email.'});
    json(res,200,{accepted:true,message:'Pesan diterima layanan email.'});
  }catch{json(res,504,{message:'Koneksi layanan terputus. Pesan mungkin sedang diproses; periksa sebelum mengirim ulang.'});}
}
