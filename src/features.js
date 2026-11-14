import {data,t,esc,icon,$,$$,dialog,show,reduced,config,toast} from './ui.js';
const page=document.body.dataset.page;

function background(){
  const host=$('#backgroundMedia');if(!host||page==='gendut')return; // Gendut <3 punya latar sendiri
  const c=data.background||{};const src=c.src||'';const ext=src.split(/[?#]/)[0].split('.').pop().toLowerCase();
  const saveData=navigator.connection?.saveData;const video=c.type==='video'||(c.type!=='image'&&['mp4','webm','ogv'].includes(ext));
  const fallback=c.poster||'assets/images/backgrounds/stars.svg';
  const addImage=(url)=>{const img=new Image();img.alt='';img.decoding='async';img.src=url;img.onerror=()=>{img.remove();};host.replaceChildren(img);};
  if(!src)return;
  if(video&&!reduced()&&!saveData&&(c.videoOnMobile||matchMedia('(min-width: 769px)').matches)){
    const el=document.createElement('video');el.muted=true;el.loop=true;el.playsInline=true;el.preload='none';el.poster=fallback;
    const start=()=>{el.src=src;el.play().catch(()=>addImage(fallback));};
    el.addEventListener('error',()=>addImage(fallback),{once:true});host.append(el);
    document.addEventListener('visibilitychange',()=>document.hidden?el.pause():el.play().catch(()=>{}));
    if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:2500});else setTimeout(start,800);
  }else addImage((video||((reduced()||saveData)&&ext==='gif'))?fallback:src);
  host.style.opacity=String(Math.min(1,Math.max(0,c.opacity??.7)));
}
function imageFallbacks(){
  const fallback='assets/images/media-unavailable.svg';
  document.addEventListener('error',e=>{const img=e.target;if(img.tagName!=='IMG'||img.closest('.cosmic-background'))return;
    // data-fallback="hide": gambar opsional (sampul guide, foto Gendut <3) diganti placeholder CSS.
    if(img.dataset.fallback==='hide'){img.parentElement.classList.add('is-empty');img.remove();return;}if(img.dataset.fallback)return;img.dataset.fallback='true';img.src=fallback;img.classList.add('media-fallback');},{capture:true});
  $$('img').forEach(img=>{if(img.complete&&img.naturalWidth===0)img.dispatchEvent(new Event('error'));});
}
// Dock pojok bawah (musik di kiri, guestbook di kanan). Awalnya tertutup: hanya tab kecil di tepi layar.
function dock(player, restore, main, onHide) {
  const setHidden = (hidden, moveFocus = true) => {
    restore.classList.toggle('is-tucked', !hidden);
    restore.inert = !hidden;
    restore.setAttribute('aria-expanded', String(!hidden));
    // Pindahkan fokus sebelum menyembunyikan kontrol.
    if (hidden && moveFocus) restore.focus();
    if (hidden) onHide?.();
    player.classList.toggle('disk-hidden', hidden);
    player.inert = hidden;
    player.setAttribute('aria-hidden', String(hidden));
    if (!hidden && moveFocus) main.focus();
  };
  restore.addEventListener('click', () => setHidden(false));
  $$('[data-dock-hide]', player).forEach(button => button.addEventListener('click', () => setHidden(true)));
  setHidden(true, false);
  return setHidden;
}
function music() {
  const player = $('#musicPlayer'), restore = $('#musicRestore'), expand = $('#musicExpand');
  if (!player || !restore || !expand) return;
  const setHidden = dock(player, restore, expand, () => { if (player.classList.contains('expanded')) expand.click(); });
  // Tetap bisa dipanggil melalui Command Palette.
  document.addEventListener('portfolio:music', () => player.classList.contains('disk-hidden') ? setHidden(false) : expand.click());
}
function palette(){
  const commands=[...data.pages.map(p=>({name:t(p.label),hint:p.file,keywords:`${p.id} ${p.label.id} ${p.label.en}`,run:()=>location.assign(p.file)})),{name:t({id:'Buka Guestbook',en:'Open Guestbook'}),hint:'COMMUNITY',keywords:'comment komentar guestbook buku tamu',run:()=>openCommunity('guestbook')},{name:t({id:'Login / Akun',en:'Sign in / Account'}),hint:'GOOGLE · GITHUB',keywords:'login masuk account',run:()=>openCommunity('account')},{name:t({id:'Pemutar musik',en:'Music player'}),hint:'SHOW / HIDE',keywords:'music kaset disk lagu',run:()=>document.dispatchEvent(new Event('portfolio:music'))},{name:'GitHub / Albatany',hint:'EXTERNAL ↗',keywords:'source repositories github',run:()=>location.assign('https://github.com/Albatany')},{name:t({id:'Privasi',en:'Privacy'}),hint:'POLICY',keywords:'privacy privasi',run:()=>location.assign('privacy.html')}];
  const el=dialog('commandPalette','Command palette',`<div class="command-search"><span>⌕</span><input id="commandInput" autocomplete="off" placeholder="${t({id:'Mau ke mana?',en:'Where to next?'})}" role="combobox" aria-expanded="true" aria-controls="commandResults" aria-autocomplete="list"><kbd>ESC</kbd></div><div id="commandResults" role="listbox" aria-label="Commands"></div><div class="command-footer"><span>↑ ↓ ${t({id:'pilih',en:'navigate'})}</span><span>↵ ${t({id:'buka',en:'open'})}</span><span>CTRL / ⌘ K</span></div>`,'command-dialog');
  const input=$('#commandInput');let active=0,filtered=[];
  const draw=()=>{const q=input.value.trim().toLocaleLowerCase();filtered=commands.filter(c=>`${c.name} ${c.keywords}`.toLocaleLowerCase().includes(q));active=Math.min(active,Math.max(0,filtered.length-1));$('#commandResults').innerHTML=filtered.length?filtered.map((c,i)=>`<button type="button" id="command-${i}" role="option" aria-selected="${i===active}" data-command="${i}" tabindex="-1"><span>${esc(c.name)}</span><small>${esc(c.hint)}</small><b>↵</b></button>`).join(''):`<p class="empty-state">${t({id:'Menu tidak ditemukan.',en:'No commands found.'})}</p>`;if(filtered.length)input.setAttribute('aria-activedescendant',`command-${active}`);else input.removeAttribute('aria-activedescendant');};
  const run=i=>{const c=filtered[i];if(c){el.close();c.run();}};
  const open=()=>{show(el);input.value='';active=0;draw();input.focus();};
  $('#commandTrigger')?.addEventListener('click',open);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();el.open?el.close():open();}});
  input.addEventListener('input',()=>{active=0;draw();});
  input.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(filtered.length){active=(active+(e.key==='ArrowDown'?1:-1)+filtered.length)%filtered.length;draw();$(`#command-${active}`)?.scrollIntoView({block:'nearest'});}}else if(e.key==='Enter'){e.preventDefault();run(active);}});
  $('#commandResults').addEventListener('click',e=>{const b=e.target.closest('[data-command]');if(b)run(Number(b.dataset.command));});
}
function projects(){
  if(!$('#projectSearch'))return;let category='all';
  const apply=()=>{const q=$('#projectSearch').value.toLowerCase().trim();let count=0;$$('[data-project]').forEach(el=>{const p=data.projects.find(p=>p.id===el.dataset.project);const match=(category==='all'||p.category===category)&&`${p.title} ${p.subtitle} ${p.technologies.join(' ')} ${t(p.description)}`.toLowerCase().includes(q);el.hidden=!match;if(match)count++;});$('#projectCount').textContent=`${count} / ${data.projects.length} projects`;$('#projectEmpty').hidden=!!count;};
  $('#projectSearch').addEventListener('input',apply);$$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.projectFilter;$$('[data-project-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});apply();}));
  if(!reduced()&&matchMedia('(hover:hover) and (pointer:fine)').matches)$$('.project-preview[data-depth]').forEach(el=>{let raf;el.addEventListener('pointermove',e=>{if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',String((e.clientX-r.left)/r.width));el.style.setProperty('--my',String((e.clientY-r.top)/r.height));});});el.addEventListener('pointerleave',()=>{if(raf)cancelAnimationFrame(raf);el.style.setProperty('--mx','.5');el.style.setProperty('--my','.5');});});
  import('./community.js').then(m=>m.loadReactionCounts()).catch(()=>{});
}
function certificates(){
  const input=$('#certificateSearch');if(!input)return;let collection='all';
  const apply=()=>{let n=0;$$('[data-certificate-tile]').forEach(el=>{const a=data.achievements[+el.dataset.certificateTile];el.hidden=!((collection==='all'||a.collection===collection)&&`${t(a.title)} ${t(a.issuer)} ${a.year}`.toLowerCase().includes(input.value.trim().toLowerCase()));if(!el.hidden)n++;});$('#certificateEmpty').hidden=!!n;};
  input.addEventListener('input',apply);$$('[data-certificate-filter]').forEach(b=>b.addEventListener('click',()=>{collection=b.dataset.certificateFilter;$$('[data-certificate-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});apply();}));
}
function gallery(){
  const el=$('#galleryDialog');if(!el)return;el.setAttribute('aria-label',t({id:'Detail foto',en:'Photo details'}));let filter='all',index=0;let visible=data.gallery.map((_,i)=>i);
  const draw=()=>{const item=data.gallery[visible[index]];if(!item)return;$('#galleryDialogContent').innerHTML=`<figure><div class="gallery-original-image"><img src="${esc(item.image)}" alt="${esc(t(item.title))}"></div><div class="gallery-next-bar"><button data-gallery-prev aria-label="Foto sebelumnya">← ${t({id:'Sebelumnya',en:'Previous'})}</button><span>${index+1} / ${visible.length}</span><button data-gallery-next aria-label="Foto selanjutnya">${t({id:'Selanjutnya',en:'Next'})} →</button></div><figcaption><span>${esc(item.category.toUpperCase())} / ${esc(item.year)}</span><h2>${esc(t(item.title))}</h2><p>${esc(t(item.note))}</p><a class="gallery-original-button" href="${esc(item.image)}" target="_blank" rel="noreferrer">${t({id:'Buka foto asli',en:'Open original'})} ↗</a></figcaption></figure>`;el.scrollTop=0;};
  const move=step=>{index=(index+step+visible.length)%visible.length;draw();};
  $$('[data-gallery-item]').forEach(b=>b.addEventListener('click',()=>{index=visible.indexOf(+b.dataset.galleryItem);draw();show(el);}));
  el.addEventListener('click',e=>{if(e.target.closest('[data-gallery-prev]'))move(-1);if(e.target.closest('[data-gallery-next]'))move(1);});el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  let startX=null;el.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});el.addEventListener('touchend',e=>{if(startX!==null&&Math.abs(e.changedTouches[0].clientX-startX)>60)move(e.changedTouches[0].clientX<startX?1:-1);startX=null;},{passive:true});
  $$('[data-gallery-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.galleryFilter;visible=data.gallery.map((g,i)=>(filter==='all'||g.category===filter)?i:-1).filter(i=>i>=0);$$('[data-gallery-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$$('[data-gallery-item]').forEach(x=>x.classList.toggle('filtered-out',!visible.includes(+x.dataset.galleryItem)));}));
}
function terminal(){
  if(document.body.dataset.page!=='about')return;
  const el=document.createElement('section');el.className='terminal-section';el.setAttribute('aria-label','Interactive terminal');el.innerHTML=`<div class="terminal-top"><span>● ● ●</span><span>albatany@portfolio: ~</span><small>PLAYGROUND</small></div><div id="terminalOutput" role="log" aria-live="polite"><p>Welcome to the archive. Type <b>help</b> to explore.</p></div><form id="terminalForm"><label for="terminalInput">visitor@albatany <b>~ $</b></label><input id="terminalInput" autocomplete="off" spellcheck="false" maxlength="120" aria-label="Terminal command" placeholder="help"><button type="submit" aria-label="Run command">↵</button></form><p class="terminal-note">${t({id:'Playground navigasi. Tidak menjalankan perintah di perangkatmu.',en:'A navigation playground. Commands do not run on your device.'})}</p>`;
  $('.skill-marquee').after(el);let history=[],pos=0;const input=$('#terminalInput');
  const output=text=>{const p=document.createElement('p');p.textContent=text;$('#terminalOutput').append(p);while($('#terminalOutput').children.length>32)$('#terminalOutput').firstElementChild.remove();$('#terminalOutput').scrollTop=$('#terminalOutput').scrollHeight;};
  $('#terminalForm').addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim();if(!raw)return;history.push(raw);pos=history.length;input.value='';output(`$ ${raw}`);const [cmd,arg]=raw.toLowerCase().split(/\s+/);const messages={help:'help · whoami · skills · projects · contact · socials · date · clear · open [page]',whoami:`${data.person.name} / ${data.person.alias}\n${t(data.person.bio)}`,skills:data.skills.join(' · '),projects:data.projects.map(p=>p.title).join(' · '),contact:data.person.email,socials:data.socials.map(s=>`${s.label}: ${s.href}`).join('\n'),date:new Date().toLocaleString()};if(cmd==='clear')$('#terminalOutput').replaceChildren();else if(cmd==='open'){const page=data.pages.find(p=>p.id===arg);page?location.assign(page.file):output('Available pages: '+data.pages.map(p=>p.id).join(', '));}else output(messages[cmd]||'Command not found. Try help.');});
  input.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();pos=Math.max(0,Math.min(history.length,pos+(e.key==='ArrowUp'?-1:1)));input.value=history[pos]||'';}});
}
async function contact(){
  const form=$('#contactForm');if(!form)return;const status=$('#contactStatus'),submit=$('#contactSubmit');let token='',widget,settings,submissionId=crypto.randomUUID();
  const say=text=>status.textContent=text;
  try{settings=await config();if(settings.contactEnabled&&settings.turnstileSiteKey){const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{widget=window.turnstile.render('#contactCaptcha',{sitekey:settings.turnstileSiteKey,theme:'dark',action:'contact',callback:v=>token=v,'expired-callback':()=>token='','error-callback':()=>{token='';say(t({id:'Verifikasi gagal dimuat. Muat ulang atau gunakan email.',en:'Verification unavailable. Reload or use email.'}));}});};script.onerror=()=>say(t({id:'Verifikasi tidak tersedia. Gunakan tautan email.',en:'Verification unavailable. Use the email link.'}));document.head.append(script);}else if(!settings.contactEnabled){say(t({id:'Pengiriman langsung belum aktif. Kamu tetap bisa menghubungi lewat email di bawah.',en:'Direct delivery is not connected yet. You can still use the email link below.'}));submit.disabled=true;}}catch{say(t({id:'Koneksi formulir belum tersedia. Gunakan tautan email.',en:'Form connection unavailable. Use the email link.'}));submit.disabled=true;}
  form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity()||submit.disabled)return;if(!token){say(t({id:'Selesaikan verifikasi terlebih dahulu.',en:'Complete verification first.'}));return;}submit.disabled=true;submit.setAttribute('aria-busy','true');say(t({id:'Mengirim pesan…',en:'Sending your message…'}));try{const values=Object.fromEntries(new FormData(form));const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,token,submissionId}),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok)throw Error(result.message||'Gagal mengirim.');form.reset();submissionId=crypto.randomUUID();say(t({id:'Pesan diterima layanan email. Terima kasih, saya akan membalas lewat email kamu.',en:'The email service accepted your message. Thank you, I’ll reply by email.'}));}catch(e){say(e.name==='TimeoutError'?t({id:'Koneksi terputus. Pengiriman mungkin sudah diproses; jangan langsung mengirim ulang.',en:'Connection timed out. The message may already be processing; avoid immediately resending.'}):e.message);}finally{token='';if(widget!==undefined)window.turnstile?.reset(widget);submit.disabled=false;submit.removeAttribute('aria-busy');}});
}
let communityPromise;
function openCommunity(view){communityPromise ||= import('./community.js');communityPromise.then(m=>m.openCommunity(view)).catch(()=>{communityPromise=null;toast(t({id:'Komunitas belum bisa dimuat. Coba lagi.',en:'Community could not load. Please retry.'}));});}
function communityLauncher(){
  const ring=t({id:'GUESTBOOK · TINGGALKAN JEJAK · ',en:'GUESTBOOK · LEAVE A TRACE · '});
  document.body.insertAdjacentHTML('beforeend',`<div class="guestbook-dock dock dock-right disk-hidden" id="guestbookDock">
    <button id="guestbookLauncher" class="disc-button" type="button" aria-haspopup="dialog" aria-label="${t({id:'Buka guestbook',en:'Open guestbook'})}" title="Guestbook">
      <span class="seal-disc" aria-hidden="true"><svg viewBox="0 0 100 100"><path id="sealRing" fill="none" d="M13 50a37 37 0 1 1 74 0 37 37 0 1 1-74 0"/><text><textPath href="#sealRing" textLength="230">${ring}</textPath></text></svg><i>${icon('pen')}</i></span>
    </button>
    <button class="dock-hide" type="button" data-dock-hide aria-label="${t({id:'Sembunyikan tombol guestbook',en:'Hide the guestbook button'})}" title="${t({id:'Sembunyikan',en:'Hide'})}">›</button>
  </div>
  <button id="guestbookRestore" class="dock-tab dock-right" type="button" aria-label="${t({id:'Tampilkan tombol guestbook',en:'Show the guestbook button'})}" title="Guestbook" aria-controls="guestbookDock" aria-expanded="false">${icon('pen')}</button>`);
  const button=$('#guestbookLauncher');dock($('#guestbookDock'),$('#guestbookRestore'),button);button.addEventListener('click',()=>openCommunity('guestbook'));$$('[data-auth-open]').forEach(b=>b.addEventListener('click',()=>openCommunity('account')));document.addEventListener('click',e=>{const b=e.target.closest('[data-react]');if(b)import('./community.js').then(m=>m.react(b));});if(page==='auth')import('./community.js').then(m=>m.handleCallback()).catch(()=>{$('#authStatus').textContent='Login gagal dimuat. Silakan kembali dan coba lagi.';});else if(sessionStorage.getItem('albatany-auth-session')){import('./community.js').then(m=>m.resumeSession()).catch(()=>{});}}
$$('dialog').forEach(el=>{el.addEventListener('close',()=>{el.classList.remove('open');document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));});});
// Smooth scroll hanya untuk mouse/trackpad. Layar sentuh memakai momentum bawaan browser yang sudah halus.
function smoothScroll(){
  if(reduced()||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  import('lenis').then(({default:Lenis})=>{
    const lenis=new Lenis({autoRaf:true,lerp:.12,prevent:node=>document.body.classList.contains('menu-open')||!!document.querySelector('dialog[open]')||!!node.closest('textarea,#terminalOutput,.music-panel')});
    window.PORTFOLIO_UI.lenis=lenis;document.dispatchEvent(new Event('portfolio:lenis'));
  }).catch(()=>{});
}
imageFallbacks();background();music();palette();projects();certificates();gallery();terminal();communityLauncher();contact();smoothScroll();
if(page==='stats')import('./stats.js').then(m=>m.initStats());
if(page==='about')import('./story.js').then(m=>m.initStory()).catch(()=>{});
if(['guides','papers','devlogs'].includes(page))import('./library.js').then(m=>m.initLibrary()).catch(()=>{});
if(page==='gendut')import('./love.js').then(m=>m.initLove()).catch(()=>{});
