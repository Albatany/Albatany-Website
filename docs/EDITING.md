# Panduan edit dan menambah konten

Data utama ada di **`assets/js/content.js`**. Struktur berbahasa dua memakai `{ id: "Indonesia", en: "English" }`. Simpan UTF-8, pertahankan tanda koma dan kutip yang benar. Setelah edit, jalankan `npm run build` dan `npm run check`. Restart `npm run dev` jika server sedang berjalan.

## 1. Biodata, tautan, dan bahasa

Edit `person`, `experience`, `skills`, dan `socials` di `content.js`. Isi biodata lama dipertahankan; lokasi saat ini masih **Bandung** sesuai sumbermu. Jika ingin mengubah lokasi, perbarui juga teks lokasi pada Home/Contact/footer di `assets/js/site.js` dan koordinat dekoratif banner Contact.

`socials` memuat `{icon,label,value,href,tone}`. GitHub sekarang mengarah ke `Albatany`. Teks role/pengalaman tidak dinaikkan menjadi “senior” secara otomatis; portfolio menampilkan pengalaman yang benar-benar ada.

## 2. Tambah proyek

Tambahkan satu objek di array `projects`. Contoh berikut template, ganti semua nilai yang relevan:

```js
{
  id: "my-new-project",        // unik, huruf kecil + angka + tanda hubung
  index: "11",
  year: "2026",
  status: "ACTIVE",           // atau ARCHIVED
  category: "tools",          // all/games/tools/security/web/archive adalah filter UI
  preview: "image",
  image: "assets/images/project-my-new-project.webp",
  title: "My New Project",
  subtitle: "A short, concrete purpose",
  source: "https://github.com/Albatany/My-New-Project",
  demo: "",                   // kosong = tidak ada demo publik
  description: {
    id: "Jelaskan masalah yang diselesaikan dan fitur utamanya.",
    en: "Explain the problem it solves and its main features."
  },
  technologies: ["Rust", "React"],
  facts: []
}
```

- Gambar preview dianjurkan 1280×720 atau 1600×900, WebP/JPG terkompresi.
- `preview: "terminal"` menghasilkan kartu identitas proyek dari kode, tanpa screenshot. Glyph khusus per proyek ditentukan pada `projectScreens.terminal` di `site.js`. Proyek `preview: "image"` yang `image`-nya kosong juga memakai tampilan ini.
- `preview: "memory"` dan `"pathways"` menggunakan aset layer pixel art yang sudah ada. Pertahankan ukuran kanvas/alignment yang sama untuk semua layer agar parallax tidak bergeser.
- Urutan objek adalah urutan tampilan. Atur ulang `index` bila mengubah urutan.
- Untuk menambah kategori baru, edit daftar filter di fungsi `renderProjects()` pada `site.js`; pencarian otomatis mencakup judul, subtitle, deskripsi, teknologi.
- Jangan mengganti `id` proyek yang sudah menerima reaksi tanpa migrasi database; reaksi dihubungkan ke ID tersebut.

### Aktifkan reaksi proyek baru

Jalankan SQL ini di Supabase, dengan ID persis sama:

```sql
insert into private.projects(id)
values ('my-new-project')
on conflict do nothing;
```

Tambahkan juga ID itu ke daftar seed `supabase/schema.sql` agar setup baru mendapatkan proyek tersebut. Jika hanya menambah kartu tanpa SQL, situs tetap tampil tetapi reaksi untuk slug baru ditolak oleh database.

Untuk menyembunyikan proyek, hapus objek dari konten. Menghapus baris `private.projects` akan menghapus reaksi terkait melalui cascade; lakukan hanya jika memang ingin menghapus datanya.

## 3. Tambah galeri

Simpan foto di `assets/images/gallery/`, lalu tambahkan:

```js
{
  id: "campus-event-2027",   // unik
  category: "campus",       // music / campus / projects / life / school
  year: "2027",
  image: "assets/images/gallery/campus-event-2027.webp",
  position: "center",       // atau "50% 35%"
  title: { id: "Sebuah Hari di Kampus", en: "A Day on Campus" },
  note: { id: "Cerita singkat di balik foto.", en: "A short story behind the photo." }
}
```

Next/Previous mengikuti urutan array dan kategori aktif, lalu kembali ke awal setelah foto terakhir. Keyboard ←/→ dan swipe juga tersedia. Gambar hilang menampilkan placeholder tanpa mengganti path asli di data; setelah file dikembalikan, gambar asli tampil lagi.

Gunakan nama file konsisten (huruf kecil/tanda hubung disarankan). Vercel/Linux peka kapital: `Gambar 4.JPEG` berbeda dari `gambar 4.jpeg`. Path lama sengaja dipertahankan agar kamu tinggal menyalin aset kembali.

## 4. Tambah pencapaian dan tombol Cek Validasi

Simpan preview gambar ke `assets/images/certificates/` dan PDF ke `assets/certificate/`. Tambahkan:

```js
{
  id: "certificate-new-course",  // harus unik
  year: "2027",
  collection: "Cloud & Systems",
  credential: "NOMOR-RESMI-SERTIFIKAT",
  placeholder: false,
  image: "assets/images/certificates/new-course.webp",
  pdf: "assets/certificate/new-course.pdf",
  title: { id: "Nama Pelatihan", en: "Course Title" },
  issuer: { id: "Nama Penerbit", en: "Issuer Name" },
  description: { id: "Konteks dan durasi pelatihan.", en: "Training context and duration." },
  validationUrl: "https://issuer.example/verify/YOUR-CREDENTIAL",
  validationDemo: false
}
```

- `validationUrl: ""` → tombol **tidak muncul**.
- `validationUrl: "https://..."` → tombol tampil di kartu dan detail.
- `validationDemo: true` → label **DEMO LINK**, supaya contoh tidak disalahartikan sebagai validasi resmi.
- Contoh yang sudah dipasang berada pada sertifikat pertama dan menuju `https://example.com/verify/replace-with-official-url`. Itu sengaja placeholder, bukan bukti sah.
- `placeholder` menjelaskan status aset, bukan verifikasi otomatis. Situs tidak mengklaim telah memeriksa keaslian sertifikat hanya karena ada gambar/PDF.
- Kategori koleksi otomatis dibaca dari `collection`. Penambahan nama koleksi langsung menambah filter.
- Jika tidak punya PDF, gunakan `pdf: ""` dan `image` akan ditampilkan di detail. Bila ada PDF, modal memprioritaskan PDF dengan tautan buka asli.

## 5. Background gambar atau video

Ubah objek `background` di `content.js`:

```js
background: {
  src: "assets/images/backgrounds/my-background.webp",
  poster: "assets/images/backgrounds/stars.svg",
  type: "auto",             // auto / image / video
  videoOnMobile: false,
  opacity: 0.7
}
```

Contoh video:

```js
background: {
  src: "assets/video/stars-loop.mp4",
  poster: "assets/images/backgrounds/my-poster.webp",
  type: "auto",
  videoOnMobile: false,
  opacity: 0.65
}
```

- `auto` mengenali `.mp4`, `.webm`, `.ogv`; ekstensi lain diperlakukan sebagai gambar yang didukung browser.
- Untuk URL video tanpa ekstensi yang jelas, isi `type: "video"`.
- GIF tampil melalui elemen gambar. PNG/JPG/JPEG/WebP/AVIF/SVG juga bisa.
- Jika prefers-reduced-motion atau Save-Data aktif, video dan GIF menggunakan poster statis. Mobile memakai poster untuk video ketika `videoOnMobile:false`.
- Video memakai `preload="none"`, muted, playsinline; dimulai setelah waktu idle dan berhenti saat tab disembunyikan. Kegagalan video memakai poster.
- Default v5 adalah SVG bintang kecil; `stars-loop.mp4` tidak lagi otomatis diunduh.
- Ukuran media tetap menentukan bandwidth. GIF sering lebih berat daripada video; mengganti MP4 menjadi GIF tidak otomatis membuat situs lebih ringan.
- Untuk mengatur gelap/terang overlay, edit `--background-darkness` di CSS. Atur satu hal dahulu lalu lihat hasilnya.

Opsional dengan FFmpeg terpasang (contoh, jalankan pada salinan aset):

```bash
ffmpeg -i stars-original.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 30 -preset slow -movflags +faststart assets/video/stars-loop.mp4
```

Ambil frame poster statis untuk perangkat yang tidak memutar video. Jangan menaruh video puluhan megabyte sebagai default bila pengunjung banyak menggunakan data seluler.

## 6. Musik, disk, dan visibilitas

Edit array `music`:

```js
{ title: "Song Title", artist: "Artist", src: "assets/music/song-title.mp3" }
```

- Tambahkan file aslinya; empat lagu sumber belum disertakan di paket ini.
- Pemutaran membutuhkan interaksi pengunjung sesuai kebijakan browser.
- Disk musik (kiri bawah) dan tombol guestbook (kanan bawah) selalu mulai dalam keadaan tertutup: hanya tab kecil di tepi layar. Klik tab untuk memunculkannya.
- Panah kecil di samping disk, atau tombol Sembunyikan pada panel musik, mengembalikannya ke tab. Menyembunyikan disk tidak menghentikan lagu yang sedang diputar.
- Tampilan keduanya ada di `assets/css/v6.css` bagian "Dock musik dan guestbook".
- Pastikan kamu memiliki hak penggunaan/distribusi musik untuk website publik.

## 7. Storytelling About dan terminal

Edit array `story` untuk judul, label, dan paragraf tiap bab. Default empat bab. Jaga jumlah bab tetap empat jika tidak mengubah durasi timeline di `src/story.js` (durasi layer terakhir saat ini empat unit).

- `src/story.js`: GSAP timeline, pinning, scrub `.7`, panjang scroll `2.8 × tinggi layar`.
- `assets/css/update.css`: scene, posisi pixel head, chapter, breakpoint.
- Animasi aktif pada viewport lebar minimal 900 px, tinggi minimal 640 px, tanpa prefers-reduced-motion.
- Layar lain menampilkan semua cerita sebagai konten biasa. Tidak ada scroll hijacking di ponsel.
- Untuk mengganti avatar, gunakan sprite milikmu pada `.story-avatar` di `site.js`.

Perintah terminal berada pada fungsi `terminal()` di `src/features.js`. Terminal ini parser perintah terbatas, bukan shell nyata, tidak memakai `eval`, dan tidak menjalankan kode pengguna.

## 8. Command Palette

Daftar halaman diambil otomatis dari `pages`. Aksi tambahan ada dalam fungsi `palette()` di `src/features.js`. Setiap command memiliki `name`, `hint`, `keywords`, dan fungsi `run`. Semua hasil dapat dicari dengan nama ID/English.

Shortcut: Ctrl+K (Windows/Linux), Cmd+K (Mac), ↑/↓, Enter, Escape. Tombol navbar berguna di layar sentuh.

## 9. Thumbnail social 16:9

Default: `assets/images/social/og-cover.png`, **1600×900**, PNG. Foto sumber: `assets/images/profile-hero.webp`; pixel mark: `assets/images/head.png`.

### Ganti foto/teks melalui kode

1. Edit `site.config.mjs`:

```js
sharePortrait: 'assets/images/profile-about.webp',
shareLine: 'Games. Systems. Digital experiences.',
shareTitle: 'Aziz Albatany — Push the limits.'
```

2. Ubah layout/judul visual jika perlu di `scripts/social-cover.mjs`; ukuran 1600×900 dipertahankan.
3. Jalankan `npm run build`. Script memakai foto asli dan layout SVG yang konsisten; tidak mengubah wajah atau menggambar ulang fotomu.
4. Periksa `assets/images/social/og-cover.png`, lalu deploy ulang.

### Pakai desain Canva sendiri

1. Export PNG **1600×900** (16:9), teks singkat, aman dari tepian.
2. Simpan misalnya `assets/images/social/my-cover-v2.png`.
3. Ubah `socialImage` di `site.config.mjs` menjadi `/assets/images/social/my-cover-v2.png`. `socialWidth`/`socialHeight` tetap 1600/900.
4. `npm run build` tetap membuat default `og-cover.png`, tetapi metadata akan memakai file pilihanmu.
5. Ganti `url` pada config hanya jika domain production berubah; itu dipakai canonical, OG URL, robots, sitemap.

Meta Open Graph dibuat pada HTML setiap halaman (bisa dibaca crawler tanpa menjalankan JS). WhatsApp, Discord, dan platform lain dapat menyimpan cache atau memotong gambar sesuai UI mereka. Untuk pembaruan yang tidak muncul, gunakan nama file versi baru dan redeploy. Instagram tidak selalu menampilkan rich preview untuk semua tempat berbagi tautan; metadata tidak bisa memaksa perilaku aplikasinya.

## 10. Perubahan tampilan

Mulai dari `assets/css/v6.css` (dropdown, bendera, dock, thumbnail project, kontak, Guides/Devlogs/Papers) atau `assets/css/update.css`. `assets/css/gendut.css` hanya dimuat di halaman Gendut <3. `site.css` adalah fondasi lama agar identitas tetap dipertahankan. Token utama tetap `--void`, `--paper`, `--signal`, `--red`, dan font VCR/Helvetica. Hindari menambah override berulang di banyak tempat: kelompokkan di selector fitur yang sesuai, lalu uji breakpoint 360, 390, 768, 1024, 1440 px.

## 11. Sub-menu, Guides, Devlogs, Papers, dan Gendut <3

Semua data ada di `assets/js/content.js`. Komponen tidak perlu diubah.

> EN: all of the data below lives in `assets/js/content.js`. You never need to touch the components.

### Sub-menu di bar navigasi

Halaman yang punya `"parent"` di array `pages` muncul sebagai sub-menu di dalam item induknya (bukan item baru di bar). Opsi pertama dropdown selalu halaman induk itu sendiri. `"hint"` adalah teks kecil di bawah nama menu.

```js
{ "id": "guides", "file": "guides.html", "parent": "projects",
  "label": { "id": "Guides", "en": "Guides" },
  "hint": { "id": "Guide book buatan saya", "en": "Guide books I wrote" } }
```

### Guides (guide book)

1. Taruh PDF di `assets/guides/`, misalnya `assets/guides/panduan-unity.pdf`.
2. Tambah satu entri di bagian `GUIDES`:

```js
{
  "id": "panduan-unity",            // unik
  "year": "2026", "tag": "Game Dev",
  "accent": "#8fd6ff",              // warna sampul otomatis
  "cover": "",                      // opsional: path gambar sampul sendiri
  "pdf": "assets/guides/panduan-unity.pdf",
  "title": { "id": "Judul", "en": "Title" },
  "description": { "id": "Ringkasan singkat.", "en": "Short summary." }
}
```

Kalau file PDF belum ada, pembaca menampilkan keterangan "PDF ini belum diunggah" dan tidak error. Hapus baris `"placeholder": true` pada entri contoh supaya label CONTOH hilang, atau hapus entrinya.

> EN: put the PDF in `assets/guides/` and add one entry. A missing PDF shows a friendly note. Remove `"placeholder": true` to drop the SAMPLE label.

### Devlogs

Tambah satu blok di bagian `DEVLOGS`. Urutan di file bebas; halaman selalu menampilkan tanggal terbaru di atas.

```js
{
  "id": "judul-singkat",            // unik, dipakai sebagai alamat: devlogs.html#judul-singkat
  "date": "2026-11-20",             // format YYYY-MM-DD
  "tags": ["Unity"],
  "title": { "id": "Judul", "en": "Title" },
  "excerpt": { "id": "Cuplikan satu kalimat.", "en": "One-sentence teaser." },
  "body": {
    "id": `Paragraf pertama.

## Judul bagian

- butir satu
- butir dua`,
    "en": `First paragraph.`
  }
}
```

Format `body` (pisahkan blok dengan satu baris kosong): `## Judul bagian`, `- butir`, `> kutipan`, `**tebal**`, `[teks](https://tautan)`, dan `~~~` di baris sendiri untuk membuka dan menutup blok kode. `body` ditulis di antara backtick, jadi backtick dan `${` di dalam teks perlu ditulis `` \` `` dan `\${`.

> EN: copy one block, edit it, and the page sorts by date. Body supports headings, lists, quotes, bold, links, and `~~~` code blocks.

### Papers

1. Taruh PDF di `assets/papers/`.
2. Tambah satu entri di bagian `PAPERS`:

```js
{
  "id": "judul-paper", "date": "2026-09-01",
  "published": true,                // sudah dipublikasikan untuk umum?
  "issued": false,                  // sudah diterbitkan resmi (jurnal, prosiding)?
  "pdf": "assets/papers/judul-paper.pdf",   // kosongkan "" kalau belum ada file
  "kind": { "id": "Penelitian", "en": "Research" },
  "venue": { "id": "Nama jurnal", "en": "Journal name" },         // opsional
  "statusNote": { "id": "Sedang direview.", "en": "Under review." }, // opsional
  "title": { "id": "Judul", "en": "Title" },
  "abstract": { "id": "Ringkasan.", "en": "Summary." }
}
```

`published` dan `issued` menentukan dua badge status. Pengunjung bisa mengklik badge untuk membaca keterangannya; `venue` dan `statusNote` ikut muncul di badge penerbitan.

### Gendut <3

- Foto: taruh di `assets/images/gendut/` (`foto-01.jpg` sampai `foto-13.jpg`), atau ubah `"src"` tiap foto di bagian `GENDUT <3`. Foto potret 4:5 paling pas. Selama foto belum ada, bingkainya menampilkan placeholder hati.
- Kalimat: ubah `"text"` tiap scene, `"lead"`, `"promise"`, `"quote"`, dan `"closing"`.
- Tata letak mengikuti jumlah foto dalam satu scene: 1 foto = polaroid, 2 foto = tumpukan, 3 foto atau lebih = deretan.
- Lagu: taruh di `assets/music/gendut/lagu-kita.mp3` dan isi `love.song.title` serta `love.song.artist`. Halaman ini hanya memutar lagu itu; musik biasa dijeda selama pengunjung di sini dan kembali ke keadaan semula saat keluar.

> EN: photos go in `assets/images/gendut/`, the song in `assets/music/gendut/`. Layout follows the number of photos per scene. This page plays only its own song.

### Thumbnail project

Tiap project punya `"accent"` (warna hex) untuk latar gradient thumbnail-nya. Gambar di `"image"` tetap dipakai sebagai isi jendela.
