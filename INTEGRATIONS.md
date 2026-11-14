# Integrasi layanan

Isi nilai lokal di `.env.local`. Di Vercel, tambahkan environment variable dengan nama yang sama untuk Production dan Preview yang kamu gunakan, lalu redeploy. Jangan menulis token di `content.js` atau `site.config.mjs` karena keduanya berkaitan dengan konten publik.

| Fitur | Variable | Tanpa konfigurasi |
|---|---|---|
| GitHub profil/repository | `GITHUB_USERNAME=Albatany` (default sudah ada) | Menggunakan GitHub public API, dibatasi quota |
| GitHub kontribusi | `GITHUB_TOKEN` | Kalender belum tersedia; profil/repos tetap dicoba |
| Monkeytype | `MONKEYTYPE_USERNAME` | Kartu menampilkan belum tersedia |
| WakaTime | `WAKATIME_API_KEY` | Kartu menampilkan belum tersedia |
| Discord | `DISCORD_USER_ID` | Kartu menampilkan belum tersedia |
| Steam | `STEAM_API_KEY`, `STEAM_ID64` | Kartu menampilkan belum tersedia |
| Login/guestbook/reaksi | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` + SQL + provider OAuth | Tombol login menjelaskan fitur belum aktif |
| Kontak | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `SITE_URL` | Tautan email tetap tersedia |

## 1. Supabase: login, guestbook, reaksi

### Buat database

1. Buat project di https://supabase.com/dashboard.
2. Buka SQL Editor, jalankan seluruh `supabase/schema.sql` sekali. Script transaksional dan dapat dijalankan ulang untuk deklarasi yang sama.
3. Jangan tambahkan schema `private` ke **Exposed schemas**. Schema `public` digunakan untuk fungsi RPC saja; data komunitas tetap berada di `private`.
4. Ambil Project URL dan **publishable key** dari pengaturan API.
5. Isi:

```dotenv
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
```

Legacy `anon` JWT key juga didukung. **Jangan gunakan `service_role` / `sb_secret_…`**; endpoint konfigurasi sengaja menolaknya. Tidak perlu service-role key untuk situs ini.

### URL autentikasi

Di Authentication → URL Configuration:

- Site URL: `https://albatany.vercel.app`
- Redirect allowlist: `https://albatany.vercel.app/auth-callback.html`
- Untuk lokal: `http://localhost:4173/auth-callback.html`
- Jika memakai 127.0.0.1, tambahkan `http://127.0.0.1:4173/auth-callback.html` juga.
- Untuk preview, tambahkan URL deployment preview yang tepat. Hindari wildcard lintas domain yang terlalu luas.

Login memakai **PKCE**, sehingga memulai dan menyelesaikan login harus pada browser/tab yang sama. Session disimpan di sessionStorage dan berlaku selama sesi tab; masuk lagi jika tab/sesi browser baru membutuhkannya.

### Google

1. Di Google Cloud Console / Google Auth Platform, buat project dan konfigurasi Branding/Audience.
2. Pilih External bila pengunjung umum boleh login. Selama mode Testing, hanya test users yang didaftarkan yang bisa login.
3. Buat OAuth Client ID bertipe **Web application**.
4. Authorized JavaScript origins: `https://albatany.vercel.app` dan `http://localhost:4173` untuk lokal.
5. Authorized redirect URI **milik Google** adalah callback dari halaman provider Supabase:

```text
https://PROJECT_REF.supabase.co/auth/v1/callback
```

6. Salin Client ID dan Client Secret ke Authentication → Providers → Google di Supabase, lalu aktifkan.
7. Scope yang diperlukan Supabase: `openid`, email dasar, profil dasar. Jangan tambah Gmail, Drive, Calendar, atau scope lain.
8. Isi tautan homepage dan privacy policy (`https://albatany.vercel.app/privacy.html`) pada konfigurasi branding yang membutuhkannya. Ubah audience ke Production sesuai kebutuhan Google agar pengunjung umum dapat login.

### GitHub

1. Buka GitHub Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: `https://albatany.vercel.app`.
3. Authorization callback URL:

```text
https://PROJECT_REF.supabase.co/auth/v1/callback
```

4. Ambil Client ID dan Client Secret, masukkan ke Authentication → Providers → GitHub di Supabase.
5. Aktifkan provider. Aplikasi tidak meminta scope `repo`, `workflow`, atau akses organisasi tambahan. GitHub/Supabase tetap dapat meminta akses profil/email dasar untuk login.

**Bedakan dua redirect:** provider Google/GitHub → callback Supabase; setelah itu Supabase → `auth-callback.html` di situsmu.

### Uji sebagai pengunjung

1. Buka Guestbook → Login → Google/GitHub.
2. Setelah kembali, buka Akun dan simpan nama samaran 2–24 karakter (huruf, angka, spasi, titik, garis bawah, tanda hubung).
3. Buka Guestbook lagi, tulis pesan 3–500 karakter.
4. Login dari akun lain: tombol hapus hanya muncul pada pesan sendiri. API juga menolak penghapusan milik orang lain meskipun request dimodifikasi.
5. Klik reaksi proyek. Klik jenis lain untuk mengganti; klik jenis yang sama untuk membatalkan. Satu reaksi per akun per proyek.
6. Menu Akun → Hapus kontribusi saya menghapus pesan, reaksi, dan nama samaran. Akun autentikasi tetap ada; penghapusan akun oleh admin dijelaskan di `docs/ARCHITECTURE.md`.

Guestbook membatasi 1 pesan/45 detik dan 10 pesan/hari per akun. Batas reaksi: 700 ms. Penghapusan kontribusi tidak menghapus catatan rate limit. Ini mencegah bypass lewat hapus-kirim berulang; bukan perlindungan sempurna terhadap serangan banyak akun.

## 2. GitHub activity dan popular repositories

1. `GITHUB_USERNAME` default `Albatany`.
2. Buat token dari akunmu lewat GitHub Settings → Developer settings → Personal access tokens. Gunakan fine-grained token dengan masa berlaku pendek dan akses baca minimum untuk informasi publik; public repository read access sudah disediakan GitHub. Tidak perlu akses tulis repository.
3. Simpan token hanya di `GITHUB_TOKEN`. Token ini milik pemilik portfolio dan terpisah dari login pengunjung.
4. Buka `/api/github`: harus menghasilkan `calendar.weeks[].contributionDays[]` agar kalender aktif. Jika `calendar:null`, periksa token, expiry, izin, dan quota. Tidak ada angka kontribusi palsu sebagai fallback.
5. Buka Stats. Sentuh/hover/fokus kotak untuk membaca tanggal dan jumlah kontribusi.

Data repos dipaginasi (100/page, pengaman 20 halaman), fork/private disaring, lalu diurutkan berdasarkan stars → forks → pushed_at. Profil memakai total public repositories dari GitHub. Cache Vercel: 10 menit, stale selama pemutakhiran hingga 20 menit. Grafik memakai tanggal yang dikembalikan GitHub tanpa konversi zona waktu yang menggeser hari. Kontribusi mencerminkan aturan/profil GitHub; kontribusi privat tergantung pengaturan akun/token.

Bila fine-grained token tidak mengembalikan field GraphQL pada konfigurasi akunmu, cek dokumentasi izin terkini. Token classic tanpa scope privat dapat digunakan untuk data publik jika kebijakan akun mengizinkan. Jangan menambahkan scope `repo` penuh hanya untuk menampilkan kalender publik.

## 3. Monkeytype — tanpa API key

1. Login ke https://monkeytype.com dan buka profil publik akunmu.
2. Salin **username**, bukan email dan bukan URL penuh.
3. Isi `MONKEYTYPE_USERNAME=username_kamu`.
4. Restart server lokal atau redeploy Vercel.
5. Buka `/api/monkeytype`, lalu Stats.

Implementasi memakai endpoint publik resmi:

```text
GET https://api.monkeytype.com/users/USERNAME/profile
```

Tidak perlu ApeKey. Kartu menampilkan personal best mode waktu 15/30/60/120 detik, accuracy, bahasa, difficulty, dan modifier jika tersedia, plus jumlah tes dan waktu mengetik. Best dipilih berdasarkan WPM tertinggi pada durasi tersebut; bahasa/modifier dapat berbeda antarkolom dan sengaja dilabeli. Mode yang belum pernah dimainkan tampil `—`, bukan `0 WPM`. Respons dicache 30 menit untuk mengurangi permintaan; dokumentasi endpoint menetapkan batas publik, jadi hindari refresh paksa berulang.

## 4. WakaTime

1. Ambil API key milikmu di https://wakatime.com/settings/account.
2. Isi `WAKATIME_API_KEY`.
3. Pastikan plugin editor WakaTime mengirim aktivitas ke akun tersebut.
4. Endpoint memakai `/api/v1/users/current/stats/all_time` dan hanya meneruskan ringkasan waktu, bahasa, serta OS. Nama proyek/file privat tidak diteruskan.
5. Statistik all-time dapat memerlukan pemrosesan atau bergantung pada ketersediaan data akun. Jika API belum siap, kartu menampilkan unavailable.

## 5. Discord dan Steam

Discord:

1. Aktifkan Developer Mode di Discord, Copy User ID.
2. Isi `DISCORD_USER_ID`.
3. Ikuti instruksi Lanyard di https://github.com/Phineas/lanyard untuk bergabung ke server dan mengaktifkan presence publik.
4. Endpoint hanya menampilkan presence pemilik portfolio; bukan aktivitas pengguna yang login ke situs.

Steam:

1. Dapatkan Web API key melalui https://steamcommunity.com/dev/apikey.
2. Isi `STEAM_API_KEY` dan `STEAM_ID64` (ID numerik 64-bit).
3. Agar game count dan playtime terlihat, pengaturan profile/game details Steam harus publik.
4. Klik “Lihat ringkasan” pada kartu Discord/Steam untuk modal profil kecil.

## 6. Formulir kontak sungguhan

Pengiriman menggunakan Resend, dengan verifikasi server Cloudflare Turnstile. Situs tidak akan menampilkan sukses hanya karena membuka `mailto:`.

1. Buat akun di https://resend.com. Verifikasi domain pengirim sesuai petunjuk DNS mereka.
2. Buat API key dengan izin pengiriman saja. Isi `RESEND_API_KEY`.
3. Isi `CONTACT_FROM_EMAIL`, misalnya `Albatany <hello@domainmu.id>`, dan `CONTACT_TO_EMAIL=aziz929476@gmail.com`.
4. Alamat Gmail pribadi bukan domain pengirim terverifikasi milikmu. Jika menggunakan domain pengujian Resend, ikuti pembatasan recipient testing mereka; jangan menganggapnya siap untuk semua pengunjung.
5. Buat widget Managed di https://dash.cloudflare.com → Turnstile.
6. Tambahkan hostname `albatany.vercel.app`. Tambahkan hostname preview/lokal sesuai lingkungan yang benar-benar kamu gunakan.
7. Isi `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, dan `SITE_URL=https://albatany.vercel.app` (tanpa slash akhir).
8. Restart/redeploy, lalu coba formulir dengan emailmu sendiri. Pesan sukses berarti **diterima layanan email**, bukan bukti sudah dibaca atau pasti masuk inbox; cek delivery status di dashboard Resend.

Validasi terjadi di browser dan server. Backend memeriksa origin, ukuran input, honeypot, token CAPTCHA sekali pakai, hostname, dan action `contact`. Email plain-text mencegah HTML pengguna dieksekusi. Submission ID digunakan sebagai idempotency key Resend. Tidak ada payload/form email yang dicetak ke log aplikasi. Tambahkan rate limiting pada Vercel Firewall jika situs menerima trafik/spam besar.

## Referensi resmi

- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/social-login/auth-github
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/managing-user-data
- https://api.monkeytype.com/docs/
- https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
- https://docs.github.com/en/graphql/guides/forming-calls-with-graphql
- https://wakatime.com/developers
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://resend.com/docs/api-reference/emails/send-email
- https://vercel.com/docs/functions/runtimes/node-js
