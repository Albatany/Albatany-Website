# Changelog

## 6.0.0 — 12 November 2026

### Added

- Sub-menu dropdown di bar navigasi: Devlogs di dalam Tentang, Guides dan Papers di dalam Projek, Gendut <3 di dalam Galeri. Menu mobile memakai grup buka-tutup.
- Halaman Guides (rak guide book + pembaca PDF di dalam situs), Devlogs (feed + tampilan baca), dan Papers (badge status yang bisa diklik). Data di `content.js`.
- Halaman Gendut <3 dengan lagu tetap, animasi scroll, dan versi tenang untuk `prefers-reduced-motion`.
- Tombol View More di bawah Projects, bendera bahasa pixel art, tepi layar yang memudar saat scroll, smooth scroll (Lenis) untuk mouse dan trackpad.

### Changed

- Thumbnail project menjadi mockup jendela di atas latar gradient per project (`accent`).
- Kartu kontak memakai logo dan warna tiap platform.
- Dock musik dan guestbook memakai tampilan yang sama dan selalu mulai tertutup.
- Cover embed (Open Graph) didesain ulang dan memakai font situs.
- Teks situs ditulis ulang supaya lebih natural, tanpa mengubah fakta.

### Maintenance

- CSS lama yang tertimpa atau tidak terpakai dihapus; handler scroll tidak lagi menulis variabel CSS yang tidak dipakai.
- Test UI disesuaikan dengan perilaku sekarang dan ditambah untuk fitur baru.

## 5.0.0 — 12 Oktober 2026

### Added

- Google/GitHub OAuth melalui Supabase, PKCE callback, alias pilihan pengguna, logout, hapus kontribusi.
- Guestbook tetap di kanan bawah, penyimpanan persisten, pagination, hapus pesan sendiri, moderasi via SQL.
- Reaksi heart/fire/clap per proyek dengan unique constraint dan rate limit transaksional.
- GitHub public profile, kalender kontribusi harian GraphQL, tooltip touch/hover/focus, popular repositories tersambung API.
- Monkeytype public profile, PB per durasi dan informasi bahasa/modifier.
- Modal profil Discord/Steam.
- Command Palette Ctrl/Cmd+K dengan pencarian dan navigasi keyboard.
- About scrollytelling GSAP pin/scrub dan fallback responsif/reduced motion.
- Terminal interaktif terbatas tanpa eksekusi kode.
- Contact API Resend + Turnstile, status async yang jujur, validation/honeypot/idempotency.
- Privacy page, setup guides Indonesia, schema database, build system, tests.
- Cover sosial 1600×900 yang dapat diregenerasi dari aset asli.

### Changed

- Navbar menjadi bilah mengambang dengan label dan indikator halaman aktif; garis progres scroll dihapus.
- Proyek ditampilkan sebagai grid kompak dengan filter/search; ZT-HAC, Bridge, OfflineBox, ChronoLens ditambahkan.
- GitHub identitas publik diperbarui ke Albatany; konteks biodata lama dipertahankan.
- Parallax dipindahkan ke area visual proyek agar teks/tombol tidak ikut bergerak.
- Pencapaian menjadi koleksi dengan kategori, ID unik, pencarian, tombol validasi opsional dan label demo.
- WakaTime/GitHub diprioritaskan pada Stats, lalu Monkeytype/Discord/Steam.
- Galeri mempunyai next/previous, keyboard dan swipe mengikuti filter aktif; ID duplikat diperbaiki.
- Vinyl lama dipertahankan dengan hide/show seluruh disk, bukan hanya panel.
- Background mendukung gambar/video yang dapat diganti; default SVG, preload video/lagu lebih hemat.
- Contact banner menggunakan pixel mark asli dengan komposisi baru, layout lebih ringkas.
- Metadata valid satu kali per halaman, canonical, sitemap, robots, OG/Twitter Card.
- Local server memakai handler API yang sama dengan Vercel dan hanya menyajikan output publik.

### Fixed

- Duplikasi `id="musicPlayer"` di HTML sumber.
- Klaim `VERIFIED` otomatis pada seluruh sertifikat diganti status upload; demo validasi diberi label jelas.
- Build tidak lagi gagal hanya karena MP4/MP3/foto galeri sengaja tidak disertakan.
- Error audio tidak menyebabkan unhandled play rejection.
- Sensitive `.env` dan metadata `.vercel` dari unggahan tidak dibundel ke hasil.
- Akses keyboard, focus states, dialog, reduced motion, ukuran kartu dan teks di layar kecil.

### Konfigurasi pemilik yang masih diperlukan

- Isi environment variables dan aktifkan provider OAuth.
- Jalankan schema SQL.
- Masukkan username Monkeytype dan token GitHub untuk kalender.
- Pulihkan media yang tidak disertakan.
- Ganti link validasi demo.
- Link CLI ke project Vercel lama, uji preview, lalu deploy production.
