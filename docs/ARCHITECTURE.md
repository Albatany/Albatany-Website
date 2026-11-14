# Arsitektur dan privasi

## Batas komponen

Situs mempertahankan HTML/CSS/JavaScript, tanpa mengganti framework atau memindahkan hosting. Build esbuild hanya mengemas modul fitur; tidak ada framework UI tambahan.

| Komponen | Peran |
|---|---|
| content.js | Sumber konten publik |
| site.js | Renderer halaman dan perilaku inti |
| features.js | Palette, background, galeri, filter, musik, terminal, kontak |
| community.js | UI login, guestbook, reaksi; SDK Supabase dimuat saat diperlukan |
| story.js | GSAP + ScrollTrigger; hanya dimuat di About |
| stats.js | GitHub, Monkeytype, modal ringkasan |
| library.js | Pembaca PDF (pdf.js, dimuat saat PDF dibuka) dan tampilan baca Devlogs; hanya di Guides, Papers, Devlogs |
| love.js | Animasi scroll, partikel, dan lagu tetap; hanya di Gendut <3 |
| api/*.mjs | Proxy pemilik untuk statistik; konfigurasi publik; pengiriman kontak |
| server/http.mjs | Validasi, timeout, respons backend |
| supabase/schema.sql | Storage komunitas dan otorisasi |

`npm run build` menyalin hanya aset publik/HTML ke `dist/`. Dokumentasi, SQL, source backend, package files, `.env`, dan `.vercel` tidak disajikan oleh server statis lokal. Vercel menjalankan API root sebagai serverless functions. Handler lokal sama dengan production sehingga tidak ada implementasi integrasi ganda seperti sebelumnya.

SDK autentikasi dipisah ke chunk dinamis; pengunjung biasa tidak mengunduhnya untuk membaca Home. Modul komunitas ringan dimuat pada Projects untuk counts, tetapi SDK besar hanya saat login/session/guestbook dibutuhkan. GSAP dipisah ke halaman About. Cookie iklan/analytics tidak ditambahkan.

## Aliran login dan data

1. Pengunjung memilih Google/GitHub.
2. Supabase menjalankan OAuth dan PKCE, lalu kembali ke `auth-callback.html`.
3. Client menukar authorization code menjadi session. URL dibersihkan sesudah callback; token provider dihapus sebelum penyimpanan sessionStorage.
4. Database memeriksa `auth.uid()` untuk setiap operasi. Client tidak mengirim `user_id` untuk mengklaim identitas sendiri.
5. Pengunjung memilih alias. Nama, foto, email dari provider tidak otomatis dipakai sebagai profil publik.
6. RPC publik mengembalikan alias/pesan/waktu dan flag `is_owner` untuk sesi pemanggil. Tidak ada UID pengguna, email, provider metadata, daftar orang yang bereaksi, atau token di respons publik.

**Keterbatasan yang perlu dijelaskan jujur:** Supabase Auth menyimpan identitas login, dan administrator proyek dapat melihatnya. Tidak ada janji “pemilik situs tidak mungkin tahu identitas” karena itu tidak sesuai arsitektur Google/GitHub login ini. Kebijakan situs sudah membedakan identitas publik dan akses administrator.

## Penyimpanan dan otorisasi

Tabel `private.community_profiles`, `private.guestbook_entries`, `private.project_reactions`, `private.projects`, dan `private.community_rate_limits` tidak diekspos PostgREST. RLS aktif tanpa grant/policy langsung untuk anon/authenticated. Akses aplikasi hanya melalui RPC SECURITY DEFINER dengan `search_path=''`, validasi input, dan pemeriksaan `auth.uid()` eksplisit.

SECURITY DEFINER sengaja digunakan untuk proyeksi publik tanpa membuka raw table user mapping. Karena fungsi ini berprivilege, modifikasi SQL harus diaudit: jangan mengganti dengan function yang menerima UID caller tanpa memeriksa `auth.uid()`.

- Satu baris reaksi per `(user_id,project_id)`, dilindungi primary key.
- Jenis reaksi hanya `heart`, `fire`, `clap`; slug proyek harus sudah ada.
- Cooldown ditangani di transaksi database dan memakai advisory lock per user, bukan Map RAM yang hilang di fungsi serverless.
- Guestbook ditampilkan sebagai teks ter-escape; HTML/link otomatis tidak dirender.
- Query rate limit tidak dikosongkan oleh fitur hapus kontribusi, mencegah reset batas secara berulang.
- Semua relasi user menggunakan `ON DELETE CASCADE`. Menghapus akun Auth juga menghapus data komunitas dan rate-limit akun tersebut.

## Moderasi tanpa halaman admin publik

Moderasi dilakukan oleh pemilik lewat Supabase SQL Editor/Table Editor. Tidak ada dashboard yang memajang email pengguna pada portfolio.

Lihat pesan untuk dimoderasi:

```sql
select id, body, created_at, hidden
from private.guestbook_entries
order by created_at desc
limit 100;
```

Sembunyikan pesan tertentu setelah memeriksa ID:

```sql
update private.guestbook_entries
set hidden = true
where id = 'UUID-PESAN-YANG-BENAR';
```

Tidak perlu mengubah raw `user_id` atau mencari email untuk memoderasi isi pesan.

Permintaan penghapusan akun:

1. Verifikasi kepemilikan akun pemohon melalui jalur yang sesuai.
2. Di Supabase Authentication → Users, hapus **akun yang sudah terverifikasi**.
3. Foreign key cascade menghapus alias, guestbook, reaksi, dan rate limits terkait.
4. Email kontak yang sudah masuk inbox/Resend perlu ditangani terpisah; tidak berada pada database komunitas.

## Keamanan operasional

- `GITHUB_TOKEN`, WakaTime/Steam keys, Resend key, Turnstile secret tetap di server.
- Public configuration hanya memberi project URL, publishable/anon key, sitekey Turnstile, dan status enabled. Publishable key memang untuk browser; akses data dilindungi database.
- OAuth scope tidak meminta mail inbox/private repositories. Provider tetap memproses email/profil dasar.
- Contact API mengecek origin secara allowlist, CAPTCHA hostname/action, input, batas body, serta idempotency saat pengiriman. Status sukses berarti email provider accepted.
- Security headers meliputi CSP, nosniff, frame-ancestors, referrer policy, permissions policy. CSP hanya mengizinkan script sendiri dan Turnstile. Style inline diperlukan untuk GSAP/progress per-elemen.
- SessionStorage membatasi persistence lintas sesi tab. Seperti aplikasi browser lain, XSS bisa mengakses session; jangan menambahkan script pihak ketiga sembarangan.
- Rate limit akun tidak mencegah pembuatan banyak akun. Aktifkan proteksi provider/Vercel tambahan jika skala trafik menuntutnya.
- Operator layanan dapat memiliki log teknis. Jangan menjanjikan “tidak ada IP/log sama sekali”.

## Keputusan terkait performa

Default background SVG menggantikan video autoplay yang berat. Video opsional tidak dimuat pada reduced motion/data saver dan secara default tidak pada mobile. Pemutar musik tidak preload lagu. Media yang hilang memakai fallback; source tidak otomatis mencari foto pengganti dari internet.

Parallax game hanya menyentuh layer di dalam preview; seluruh kartu tidak ikut miring sehingga tombol dan teks stabil. About menggunakan pin hanya pada layar cukup besar; GSAP matchMedia mengembalikan gaya saat media query berubah.

Tidak ada cache nilai palsu. Kegagalan API menghasilkan keadaan unavailable. Caching CDN berlaku hanya untuk statistik publik, bukan sesi/komentar pribadi.
