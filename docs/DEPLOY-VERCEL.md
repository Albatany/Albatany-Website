# Deploy ke project Vercel yang sudah ada

Targetmu: **https://albatany.vercel.app/**. Paket ini tidak memakai hosting baru atau framework baru. API berada di `api/*.mjs`; file publik hasil build berada di `dist/`.

## A. Persiapan

1. Backup folder/repository lama.
2. Ekstrak proyek v5. Salin aset berat dari proyek lama ke path yang sama di `assets/`. Jangan menyalin `.env` lama ke folder publik; jika kunci pernah dibagikan, buat yang baru.
3. Buka terminal **di folder yang berisi `package.json`, `api/`, dan `vercel.json`**, bukan di dalam `dist/`.
4. Periksa Node:

```bash
node --version
npm --version
npm ci
npm run build
npm run check
npm test
npm run test:http
```

Gunakan Node **22.x** di lokal dan Project Settings Vercel. Paket juga kompatibel dengan runtime lebih baru yang mendukung dependency, tetapi 22.x adalah baseline panduan ini. Jangan mengubah `engines` menjadi versi Node yang belum didukung Vercel.

## B. Hubungkan CLI ke project lama

Perintah berikut berlaku di Windows CMD, PowerShell, Linux, dan macOS:

```bash
npm install --global vercel
vercel login
vercel link
```

Pada `vercel link`:

- pilih scope/account tempat website lama berada;
- pilih **Link to existing project**;
- pilih project yang saat ini memiliki domain `albatany.vercel.app`;
- periksa project yang dipilih melalui dashboard Vercel sebelum deploy Production.

Folder `.vercel` akan dibuat ulang oleh CLI. Metadata project dari arsip lama sengaja tidak dibundel agar tidak salah menautkan akun/project.

## C. Pengaturan build

Di Project Settings → Build & Development Settings:

| Pengaturan | Nilai |
|---|---|
| Framework Preset | Other |
| Root Directory | folder yang berisi package.json; biasanya root repository |
| Install Command | `npm ci` atau default npm |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 22.x |

`vercel.json` sudah mendeklarasikan framework, build, output, dan security headers. Hapus override lama di dashboard jika bertentangan. **Jangan menggunakan `vercel dist --prod`**, karena folder itu tidak berisi fungsi API di root proyek.

## D. Environment variables

Cara paling mudah: Project Settings → Environment Variables. Tambahkan nama yang diperlukan dari `.env.example` untuk **Production** dan **Preview**. Isi secret di dashboard, bukan di file JavaScript.

Bisa juga melalui CLI; contoh:

```bash
vercel env add GITHUB_TOKEN production
vercel env add MONKEYTYPE_USERNAME production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_PUBLISHABLE_KEY production
```

CLI akan meminta nilainya. Ulangi untuk variable lain dan lingkungan `preview` bila dibutuhkan. Jangan menempelkan token sebagai bagian perintah yang dapat tersimpan di shell history.

Sudah punya variable di project lama? Periksa/pertahankan variable yang masih benar, ganti kunci yang sudah dibagikan, dan tambah variable baru. Mengubah environment memerlukan deployment baru agar dipakai fungsi yang berjalan.

Untuk mengambil environment Development ke lokal (akan menulis file lokal):

```bash
vercel env pull .env.local
```

Jangan menjalankan perintah itu jika tidak ingin menimpa konfigurasi lokal yang sudah disiapkan; buat backup terlebih dahulu.

## E. Preview dahulu, lalu Production

```bash
vercel
```

Buka URL preview yang dikembalikan CLI. Untuk menguji login di preview, URL callback preview harus ditambahkan ke Supabase Redirect URLs. Untuk kontak, hostname preview harus ditambahkan ke Turnstile. `VERCEL_URL` di backend mengizinkan origin deployment itu secara spesifik.

Periksa:

- navigasi dan ukuran di 360/390 px, tablet, laptop, desktop;
- foto yang dikembalikan tampil; musik dimainkan setelah klik;
- palette Ctrl/Cmd+K; tab Music dan Guestbook tidak bertumpuk;
- Google/GitHub login, logout, satu reaksi per akun, guestbook;
- statistik menunjukkan akunmu, kalender per hari, tooltip sentuh;
- formulir mengirim email ke inbox yang benar;
- contoh validasi diganti/disembunyikan;
- URL thumbnail `/assets/images/social/og-cover.png` dapat diakses publik.

Jika semuanya siap:

```bash
vercel --prod
```

CLI mengembalikan URL deployment dan domain production. Tidak perlu menebak status; tunggu sampai CLI menyatakan deployment siap. Website lama tetap aktif sampai deployment baru berhasil dipromosikan oleh Vercel.

## F. Alternatif melalui GitHub

Jika project Vercel sudah terhubung ke repository, salin source v5 ke checkout repository tersebut tanpa mengganti folder `.git`. Hindari menyalin `node_modules/`, `dist/`, `.env*`, dan `.vercel/`. `.env.example` aman untuk disertakan.

```bash
git status
git add .
git diff --cached --stat
git commit -m "feat: portfolio v5 community, live stats and storytelling"
git push
```

Sebelum commit, pastikan `.env.local`, `.env`, token, dan private keys tidak ikut staging. Push ke production branch yang dikonfigurasi Vercel memicu deployment. Branch lain umumnya menghasilkan preview. Jangan memakai force push.

## G. Troubleshooting

| Masalah | Yang diperiksa |
|---|---|
| Halaman tampil, `/api/*` 404 | Deploy dilakukan dari root proyek, API ikut terupload, Framework Other, output dist |
| Build mencari video/lagu lama | Pastikan skrip validate/build v5 yang dipakai; aset opsional bukan error |
| Callback login 404/mismatch | Dua callback berbeda: provider ke Supabase; Supabase ke `/auth-callback.html` |
| Login Google hanya untuk akun tertentu | Google Audience masih Testing; tambahkan test users atau selesaikan publish app |
| Guestbook “belum berhasil” | SQL sudah dijalankan, RPC public tersedia, key publishable benar, private schema tidak diekspos |
| Reaksi proyek baru gagal | Tambahkan slug proyek ke `private.projects`; lihat EDITING.md |
| Kalender kosong tetapi repos muncul | `GITHUB_TOKEN`, expiry, izin GraphQL, quota |
| Monkeytype kosong | Username publik benar, profil tersedia, mode PB sudah dimainkan |
| Form kontak tidak aktif | Lengkapi seluruh Resend/Turnstile env, domain From terverifikasi |
| Share card lama | Cache aplikasi chat; ubah nama/URL socialImage, rebuild dan redeploy |
| Preview login/form gagal sementara Production baik | Callback/hostname preview belum didaftarkan |

Untuk mengembalikan deployment lama, gunakan rollback deployment di dashboard/CLI Vercel sesuai dokumentasi project. Jangan menghapus database untuk rollback UI.
