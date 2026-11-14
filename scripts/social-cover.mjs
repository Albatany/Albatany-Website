import sharp from 'sharp';
import fs from 'node:fs/promises';
import config from '../site.config.mjs';
// Cover untuk embed link (Open Graph), 1600x900. Layout deterministik dari aset yang ada:
// teks dirender dengan font milik situs supaya hasilnya sama di komputer mana pun, termasuk saat build di Vercel.
const fonts={bold:['Helvetica Bold','assets/fonts/Helvetica-Bold.ttf'],regular:['Helvetica','assets/fonts/Helvetica.ttf'],mono:['VCR OSD Mono','assets/fonts/VCR_OSD_MONO.ttf']};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const embed=(buffer,x,y,w,h,extra='')=>`<image href="data:image/png;base64,${buffer.toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
async function text(content,font,size,color,{spacing=0,width}={}){
  const [family,fontfile]=fonts[font];
  const {data,info}=await sharp({text:{text:`<span foreground="${color}" letter_spacing="${Math.round(spacing*1024)}">${content}</span>`,font:`${family} ${size}`,fontfile,rgba:true,dpi:72,...(width?{width,spacing:Math.round(size*.42)}:{})}}).png().toBuffer({resolveWithObject:true});
  return {at:(x,y)=>embed(data,x,y,info.width,info.height),w:info.width,h:info.height};
}
export async function generateSocial(){
  const photo=await sharp(config.sharePortrait).resize(500,600,{fit:'cover',position:'centre'}).png().toBuffer();
  const head=await fs.readFile('assets/images/head.png');
  const [brand,motto,first,last,line,site,bar]=await Promise.all([
    text('ALBATANY','mono',22,'#8fd6ff',{spacing:5}),
    text('PUSH THE LIMITS.','mono',17,'#a3b2bc',{spacing:3}),
    text('Aziz','bold',168,'#e9eef1',{spacing:-7}),
    text('Albatany<span foreground="#ff3b2f">.</span>','bold',168,'#e9eef1',{spacing:-7}),
    text(esc(config.shareLine),'regular',29,'#a3b2bc',{width:660}),
    text(esc(config.url.replace(/^https?:\/\//,'')),'mono',19,'#8fd6ff',{spacing:2}),
    text('portfolio.exe','mono',14,'#a3b2bc',{spacing:2})
  ]);
  // Label kecil yang sama dengan baris tag di halaman Home.
  let chipX=112;const chips=[];
  for(const tag of ['GAME','WEB','SERVER','DESIGN','ETHICAL HACKING']){
    const label=await text(tag,'mono',15,'#c9d6de',{spacing:2}),w=label.w+30;
    chips.push(`<rect x="${chipX}" y="680" width="${w}" height="38" rx="4" fill="#0d1a25" stroke="#91aec4" stroke-opacity=".28"/>${label.at(chipX+15,680+Math.round((38-label.h)/2))}`);
    chipX+=w+10;
  }
  const pixel=(x,y,s,color)=>`<path fill="${color}" d="M${x+s} ${y}h${s}v${s}h${s}v${s}h-${s}v${s}h-${s}v-${s}h-${s}v-${s}h${s}z"/>`; // tanda plus pixel
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs>
  <radialGradient id="glowA" cx="82%" cy="18%" r="62%"><stop stop-color="#8fd6ff" stop-opacity=".3"/><stop offset="1" stop-color="#8fd6ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB" cx="6%" cy="100%" r="55%"><stop stop-color="#ff3b2f" stop-opacity=".2"/><stop offset="1" stop-color="#ff3b2f" stop-opacity="0"/></radialGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><rect x="10" y="10" width="2" height="2" fill="#8fd6ff" fill-opacity=".2"/></pattern>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#07111a"/><stop offset=".62" stop-color="#07111a" stop-opacity=".82"/><stop offset="1" stop-color="#07111a" stop-opacity="0"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
  <clipPath id="screen"><rect x="0" y="34" width="500" height="600"/></clipPath>
</defs>
<rect width="1600" height="900" fill="#07111a"/>
<rect width="1600" height="900" fill="url(#dots)"/>
<rect width="1600" height="900" fill="url(#glowA)"/><rect width="1600" height="900" fill="url(#glowB)"/>
<rect width="1040" height="900" fill="url(#fade)"/>
<path d="M56 56h1488v788H56z" fill="none" stroke="#91aec4" stroke-opacity=".22"/>
<path d="M56 96V56h40M1504 56h40v40M1544 804v40h-40M96 844H56v-40" fill="none" stroke="#8fd6ff" stroke-width="3"/>
<g transform="translate(1010 104) rotate(4 250 317)">
  <rect x="-8" y="6" width="516" height="650" fill="#8fd6ff" opacity=".42" filter="url(#shadow)"/>
  <rect x="22" y="-20" width="500" height="634" fill="none" stroke="#ff3b2f" stroke-width="2" transform="rotate(-7 250 317)"/>
  <rect width="500" height="634" rx="8" fill="#0a141d"/>
  <g clip-path="url(#screen)">${embed(photo,0,34,500,600)}</g>
  <path d="M0 34V8a8 8 0 0 1 8-8h484a8 8 0 0 1 8 8v26z" fill="#0d1a25"/>
  <circle cx="20" cy="17" r="5" fill="#ff3b2f"/><circle cx="38" cy="17" r="5" fill="#e8c886"/><circle cx="56" cy="17" r="5" fill="#77e2a5"/>
  ${bar.at(500-bar.w-16,17-Math.round(bar.h/2))}
  <rect width="500" height="634" rx="8" fill="none" stroke="#8fd6ff" stroke-opacity=".55" stroke-width="1.5"/>
</g>
${pixel(968,92,7,'#8fd6ff')}${pixel(1496,716,9,'#ff3b2f')}${pixel(930,744,5,'#e9eef1')}
${embed(head,112,112,60,60,'image-rendering="pixelated"')}
${brand.at(190,131)}
${motto.at(1488-motto.w,802)}
<rect x="112" y="230" width="56" height="6" fill="#ff3b2f"/>
${first.at(104,262)}
${last.at(104,408)}
${line.at(112,594)}
${chips.join('')}
<path d="M112 764h700" stroke="#91aec4" stroke-opacity=".25"/>
${site.at(112,786)}
</svg>`;
  await fs.writeFile('assets/images/social/og-cover.svg',svg);
  await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile('assets/images/social/og-cover.png');
}
