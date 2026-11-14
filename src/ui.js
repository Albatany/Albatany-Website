export const data = window.PORTFOLIO_DATA;
export const {t, escapeHTML: esc, icon, pixelHeart, setIntegration, integrationError, fetchSignal, openDialog} = window.PORTFOLIO_UI;
export const $ = (selector, root=document) => root.querySelector(selector);
export const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function dialog(id, label, content, className='') {
  const el=document.createElement('dialog'); el.id=id;el.className=`modal-dialog ${className}`;el.setAttribute('aria-label',label);
  el.innerHTML=`<button class="dialog-close" data-close aria-label="${t({id:'Tutup',en:'Close'})}">×</button>${content}`;
  document.body.append(el);
  el.querySelector('[data-close]').addEventListener('click',()=>el.close());
  el.addEventListener('click',e=>{if(e.target===el){const r=el.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)el.close();}});
  el.addEventListener('close',()=>{el.classList.remove('open');document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));});return el;
}
export function show(el) { $$('dialog[open]').forEach(d=>d.close());el.showModal();el.classList.add('open');document.body.classList.add('dialog-open'); }
let configPromise;
export function config(){return configPromise ||= fetchSignal('/api/config').catch(e=>{configPromise=null;throw e;});}
export function toast(message){let el=$('#toast');if(!el){el=document.createElement('p');el.id='toast';el.setAttribute('role','status');document.body.append(el);}el.textContent=message;el.hidden=false;clearTimeout(el.hideTimer);el.hideTimer=setTimeout(()=>el.hidden=true,4500);}
export function safeURL(value) {try {const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
