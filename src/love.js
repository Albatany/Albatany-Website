// Halaman Gendut <3: animasi saat scroll, hati dan kelopak yang melayang, dan lagu tetap halaman ini.
import {t,$,$$,reduced,pixelHeart} from './ui.js';

export function initLove(){
  const body=document.body,audio=$('#audioPlayer'),toggle=$('#loveSong'),hint=$('#loveSongHint'),songLine=hint.textContent;

  // Foto dan kalimat muncul saat masuk layar.
  const seen=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-seen');seen.unobserve(entry.target);}}),{threshold:.22});
  $$('[data-love]').forEach(section=>seen.observe(section));

  // Partikel dibatasi supaya tetap ringan di HP, dan dilewati kalau pengunjung meminta gerak dikurangi.
  if(!reduced()){
    const random=(min,max)=>(min+Math.random()*(max-min)).toFixed(1);
    $('.love-sky').innerHTML=Array.from({length:matchMedia('(max-width:700px)').matches?9:16},(_,i)=>
      `<i class="${i%3?'love-heart':'love-petal'}" style="--x:${random(2,98)}%;--size:${random(9,22)}px;--time:${random(15,28)}s;--delay:-${random(0,28)}s;--sway:${random(-50,50)}px;--turn:${i%3?random(-18,18):random(-200,200)}deg">${i%3?pixelHeart:''}</i>`).join('');
  }

  // Lagu: coba putar begitu halaman dibuka. Kalau browser menahannya, tombol putar diberi tanda yang jelas.
  const say=text=>{hint.textContent=text;};
  const sync=()=>{
    const playing=!audio.paused;
    body.classList.toggle('song-playing',playing);toggle.setAttribute('aria-pressed',String(playing));
    $('span',toggle).textContent=playing?t({id:'Jeda lagunya',en:'Pause the song'}):t({id:'Putar lagunya',en:'Play the song'});
    if(playing){body.classList.remove('song-waiting');say(songLine);}
  };
  const play=()=>audio.play().catch(error=>{
    if(error.name!=='NotAllowedError')return;
    body.classList.add('song-waiting');say(t({id:'Browser menahan lagunya. Tekan tombol putar untuk mulai.',en:'Your browser is holding the song back. Press play to start it.'}));
  });
  audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
  audio.addEventListener('error',()=>{body.classList.remove('song-waiting');say(t({id:'File lagunya belum diunggah.',en:"The song file hasn't been uploaded yet."}));});
  toggle.addEventListener('click',()=>audio.paused?play():audio.pause());
  // Interaksi pertama di halaman ikut memulai lagu kalau tadi ditahan browser.
  document.addEventListener('click',event=>{if(body.classList.contains('song-waiting')&&!event.target.closest('#loveSong,.music-player'))play();},{once:true});
  play();
}
