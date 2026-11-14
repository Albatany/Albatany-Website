import {json,method} from '../server/http.mjs';
export default function handler(req,res){
  if(!method(req,res))return;
  const url=process.env.SUPABASE_URL?.trim()||'',key=process.env.SUPABASE_PUBLISHABLE_KEY?.trim()||'';
  let publicKeySafe=key.startsWith('sb_publishable_');
  if(key.startsWith('eyJ'))try{publicKeySafe=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{}
  const enabled=/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)&&publicKeySafe;
  json(res,200,{communityEnabled:enabled,supabaseUrl:enabled?url:'',supabasePublishableKey:enabled?key:'',contactEnabled:!!(process.env.RESEND_API_KEY&&process.env.CONTACT_FROM_EMAIL&&process.env.CONTACT_TO_EMAIL&&process.env.TURNSTILE_SECRET_KEY&&process.env.TURNSTILE_SITE_KEY),turnstileSiteKey:process.env.TURNSTILE_SITE_KEY||''});
}
