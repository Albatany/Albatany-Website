# Hasil verifikasi dan batasnya

## Yang sudah dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | Lulus; 9 halaman, bundle modular, thumbnail, sitemap, robots |
| `npm run check` | Lulus; syntax JS, ID konten unik, metadata 16:9, file privat tidak berada di output publik |
| `npm test` | 12 test lulus; API, database SQL, dan interaksi DOM |
| `npm run test:http` | 26 rute, proteksi metode, header keamanan, dan byte-range media lulus |
| Gambar sosial | PNG 1600×900 dirender dan ditinjau; foto/aset sumber asli |
| Aset opsional | 15 path galeri/musik yang tidak ada dicatat; bukan kegagalan build |

Cakupan test API: konfigurasi tidak membocorkan privileged key; data Monkeytype yang kosong tetap kosong; ranking GitHub dan angka per hari; validasi contact; origin dan CAPTCHA diperiksa sebelum pengiriman.

Cakupan SQL: dijalankan pada mesin PostgreSQL-compatible PGlite dengan role anon/authenticated dan simulasi `auth.uid()`. Akses raw private table ditolak, pengguna tidak bisa menghapus pesan orang lain, identitas tidak ada di output publik, cooldown tidak dapat direset dengan hapus data, reaksi tetap unik, penghapusan kontribusi hanya memengaruhi pemilik.

Cakupan DOM: semua halaman utama, duplicate IDs, Command Palette keyboard/search/Enter, hide/restore disk, pencarian proyek, tombol validasi opsional, next/previous galeri mengikuti filter, serta terminal yang memperlakukan input sebagai teks.

## Yang belum diverifikasi langsung

- **Tidak ada browser visual QA** pada lingkungan pengerjaan ini karena fasilitas kontrol browser yang sesuai tidak tersedia. Test DOM tidak memverifikasi geometri/rendering nyata, pinning ScrollTrigger, dan tampilan Safari/Chrome/Firefox. Layout responsif diimplementasikan, tetapi tetap perlu smoke check pada perangkat nyata.
- **OAuth production belum dicoba**: tidak memakai/membuat kredensial Google, GitHub OAuth, atau project Supabase milikmu. Test database bukan bukti redirect provider sudah benar pada akun produksi.
- **Tidak mengirim email sungguhan**: adapter contact diuji dengan respons provider yang disimulasikan. Delivery nyata memerlukan konfigurasi Resend dan Turnstile.
- **API statistik privat belum diuji dengan kuncimu**: implementasi mengikuti endpoint layanan dan payload yang diuji. Kunci lama dari arsip tidak digunakan; WakaTime/Steam/kalender GitHub perlu diuji setelah kunci baru dipasang.
- **Tidak ada deployment production dilakukan**. `vercel.json`, build output, dan handler disiapkan, tetapi keberhasilan deploy ke akunmu baru dapat dikonfirmasi setelah Vercel CLI menjalankan deployment.
- **Tidak mengklaim skor Lighthouse atau Core Web Vitals tertentu**; ukuran asetmu setelah dikembalikan ikut menentukan performa.

## Smoke check sebelum `vercel --prod`

1. Tambahkan variable, jalankan SQL, aktifkan OAuth dan callback sesuai INTEGRATIONS.md.
2. `vercel` untuk preview; daftarkan callback/hostname preview bila menguji login/form di sana.
3. Periksa Home, Projects, Achievements, Gallery, Stats, Contact, About pada lebar 360/390, 768, 1024, 1440 px.
4. Uji keyboard tanpa mouse: Tab, Ctrl/Cmd+K, panah, Enter, Escape. Buka dan tutup galeri/modal, lalu pastikan halaman bisa di-scroll lagi.
5. Uji reduced-motion dari pengaturan OS/browser; About harus tetap menampilkan seluruh bab tanpa pin.
6. Login dengan akun A dan B: nama samaran terpisah, hapus pesan sendiri, reaksi tidak ganda.
7. Uji contact dan periksa delivery status/inbox. Sukses UI berarti provider menerima request.
8. Pastikan contoh validasi sudah diganti/disembunyikan; pulihkan aset lama yang ingin ditampilkan.
9. Periksa `/assets/images/social/og-cover.png` dan preview share pada aplikasi tujuan.
10. Jalankan `vercel --prod` dari root project yang sudah ditautkan ke project lama.
