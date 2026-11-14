// Guides, Papers, Devlogs: pembaca PDF dan tampilan baca entri. Dimuat hanya di tiga halaman itu.
import {data,t,esc,$,$$,dialog,show} from './ui.js';

/* ---------- Pembaca PDF ---------- */
let reader,task,doc,observer,zoom=1;
const host=()=>$('#readerPages');
const note=(message,item)=>{host().innerHTML=`<div class="reader-note"><p>${message}</p>${item?`<a href="${esc(item.pdf)}" target="_blank" rel="noreferrer">${t({id:'Buka file aslinya',en:'Open the original file'})} ↗</a>`:''}</div>`;};
const clearPage=holder=>{holder.renderTask?.cancel();delete holder.dataset.drawn;holder.replaceChildren();};
async function drawPage(holder){
  const width=holder.clientWidth;if(!doc||holder.dataset.drawn===String(width))return;holder.dataset.drawn=String(width);
  const page=await doc.getPage(Number(holder.dataset.number)),base=page.getViewport({scale:1});
  holder.style.aspectRatio=`${base.width}/${base.height}`;
  // Tajam di layar HP tanpa membuat canvas terlalu besar untuk memori.
  const scale=Math.min(width/base.width*Math.min(devicePixelRatio||1,2),Math.sqrt(12e6/(base.width*base.height)));
  const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=viewport.width;canvas.height=viewport.height;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${t({id:'Halaman',en:'Page'})} ${holder.dataset.number}`);
  holder.renderTask?.cancel();holder.replaceChildren(canvas);
  holder.renderTask=page.render({canvas,viewport});holder.renderTask.promise.catch(()=>{}); // dibatalkan saat zoom atau ditutup
}
function countPage(){
  const list=$$('.reader-page',host());if(!list.length)return;
  const middle=host().scrollTop+host().clientHeight/2;let current=1;
  for(const holder of list){if(holder.offsetTop>middle)break;current=holder.dataset.number;}
  $('#readerCount').textContent=`${current} / ${list.length}`;
}
function setZoom(value){
  zoom=Math.min(3,Math.max(.5,value));host().style.setProperty('--zoom',zoom);
  $$('.reader-page[data-drawn]',host()).forEach(drawPage);
}
function closeDocument(){observer?.disconnect();task?.destroy();task=doc=null;host().replaceChildren();}
function makeReader(){
  const tool=(step,sign,label)=>`<button type="button" data-zoom="${step}" aria-label="${label}" title="${label}">${sign}</button>`;
  const original=t({id:'Buka PDF asli di tab baru',en:'Open the original PDF in a new tab'});
  reader=dialog('pdfReader',t({id:'Pembaca PDF',en:'PDF reader'}),`<header class="reader-bar"><h2 id="readerTitle"></h2><output id="readerCount"></output><div class="reader-tools">${tool(-1,'−',t({id:'Perkecil',en:'Zoom out'}))}${tool(1,'+',t({id:'Perbesar',en:'Zoom in'}))}<a id="readerOriginal" target="_blank" rel="noreferrer" aria-label="${original}" title="${original}">↗</a></div></header><div class="reader-pages" id="readerPages" tabindex="0"></div>`,'reader-dialog');
  reader.addEventListener('click',e=>{const button=e.target.closest('[data-zoom]');if(button)setZoom(zoom+Number(button.dataset.zoom)*.25);});
  reader.addEventListener('close',closeDocument);
  host().addEventListener('scroll',countPage,{passive:true});
  let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>setZoom(zoom),200);});
}
async function openReader(item){
  if(!reader)makeReader();
  closeDocument();setZoom(1);
  $('#readerTitle').textContent=t(item.title);$('#readerOriginal').href=item.pdf;$('#readerCount').textContent='';
  note(t({id:'Membuka PDF…',en:'Opening the PDF…'}));show(reader);host().focus();
  let opening;
  try{
    const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc='assets/js/pdf.worker.js';
    opening=task=pdfjs.getDocument({url:item.pdf,useWasm:false,standardFontDataUrl:'assets/pdfjs/standard_fonts/'});
    const loaded=await opening.promise;
    if(task!==opening){opening.destroy();return;} // pembaca ditutup atau PDF lain dibuka saat memuat
    doc=loaded;
    const first=(await doc.getPage(1)).getViewport({scale:1});
    host().innerHTML=Array.from({length:doc.numPages},(_,i)=>`<div class="reader-page" data-number="${i+1}" style="aspect-ratio:${first.width}/${first.height}"></div>`).join('');
    // Halaman digambar saat mendekati layar dan dilepas lagi saat sudah jauh, supaya ringan di HP.
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting?drawPage(entry.target):clearPage(entry.target)),{root:host(),rootMargin:'150% 0px'});
    $$('.reader-page',host()).forEach(holder=>observer.observe(holder));countPage();
  }catch(error){
    if(task!==opening)return;
    if(error?.name==='ResponseException'&&(error.missing||error.status===404))note(t({id:'PDF ini belum diunggah. Silakan mampir lagi nanti.',en:"This PDF hasn't been uploaded yet. Please check back later."}));
    else note(t({id:'PDF belum bisa dibuka. Coba muat ulang halaman, atau buka file aslinya.',en:"The PDF couldn't be opened. Try reloading the page, or open the original file."}),item);
  }
}

/* ---------- Devlogs: format tulisan sederhana ---------- */
const inline=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>');
export function markup(body){
  const out=[];let code=null,lines=[];
  const flush=()=>{
    if(!lines.length)return;const block=lines;lines=[];
    const strip=prefix=>block.every(line=>line.startsWith(prefix))&&block.map(line=>inline(line.slice(prefix.length)));
    const items=strip('- '),quote=strip('> ');
    if(items)out.push(`<ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul>`);
    else if(quote)out.push(`<blockquote>${quote.join(' ')}</blockquote>`);
    else if(block[0].startsWith('## ')){out.push(`<h3>${inline(block[0].slice(3))}</h3>`);lines=block.slice(1);flush();}
    else out.push(`<p>${inline(block.join(' '))}</p>`);
  };
  for(const line of String(body).trim().split('\n')){
    if(/^(~~~|```)/.test(line)){if(code){out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);code=null;}else{flush();code=[];}}
    else if(code)code.push(line);
    else if(line.trim())lines.push(line.trim());
    else flush();
  }
  flush();if(code)out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
  return out.join('');
}
let article;
function openPost(id){
  const post=data.devlogs.find(entry=>entry.id===id);if(!post)return;
  if(!article){article=dialog('devlogDialog','Devlog','<article id="devlogArticle"></article>','article-dialog');article.addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.search));}
  const date=new Date(post.date+'T12:00:00Z').toLocaleDateString(document.documentElement.lang==='id'?'id-ID':'en-US',{dateStyle:'long',timeZone:'UTC'});
  $('#devlogArticle').innerHTML=`<span class="modal-kicker">DEVLOG / ${esc(date)}</span><h2>${esc(t(post.title))}</h2><div class="devlog-body">${markup(t(post.body))}</div>`;
  show(article);article.scrollTop=0;
}

export function initLibrary(){
  document.addEventListener('click',e=>{const button=e.target.closest('[data-read]');if(!button)return;const [collection,index]=button.dataset.read.split(':');openReader(data[collection][Number(index)]);});
  // Tautan entri memakai #id, jadi satu entri bisa dibagikan lewat alamatnya.
  const fromHash=()=>openPost(location.hash.slice(1));
  addEventListener('hashchange',fromHash);fromHash();
}
