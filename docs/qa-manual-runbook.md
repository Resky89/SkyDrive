# SkyDrive QA Manual Verification Runbook

Dokumen ini adalah lembar panduan pengujian mutu manual (*Manual QA Checklist*) untuk skenario yang melibatkan akun Google Drive nyata, autentikasi live, dan transfer file jaringan.

---

## Ringkasan Skenario Pengujian

| ID | Skenario | Kategori | Prioritas | Ekspektasi |
| :--- | :--- | :---: | :---: | :--- |
| **QA-01** | Koneksi Akun Google Pertama | OAuth & Kuota | P0 (Kritis) | Kuota 15 GB terdeteksi di dashboard |
| **QA-02** | Pooling Akun Google Kedua | Multi-Drive Pool | P0 (Kritis) | Kuota total otomatis menjadi 30 GB |
| **QA-03** | Unggah File Cerdas (Direct Upload) | Storage Engine | P0 (Kritis) | File terunggah langsung via URL resumable |
| **QA-04** | Pencarian Multi-Drive (`Cmd+K`) | Search & Files | P1 (Tinggi) | File dari semua akun muncul di 1 hasil |
| **QA-05** | Tampilan Mobile & Bottom Navigation | Responsive UX | P1 (Tinggi) | 5 tab bawah & drawer header berfungsi |
| **QA-06** | Pembaruan Token Otomatis | Keamanan & Auth | P2 (Sedang) | Token expired di-refresh tanpa logout |

---

## Checklist Uji Langkah-demi-Langkah

### [ ] QA-01: Koneksi Akun Google Pertama (OAuth Flow)
1. Buka halaman login di `http://localhost:3000/login` atau `https://skydrive.web.id/login`.
2. Klik tombol **"Masuk dengan Google"**.
3. Pilih akun Google pengujian Anda dan setujui izin akses Google Drive.
4. **Verifikasi:**
   - [ ] Berhasil diarahkan kembali ke `/dashboard`.
   - [ ] Meteran kapasitas menampilkan kuota total minimal 15 GB.
   - [ ] Kartu akun di halaman `/dashboard/accounts` menampilkan email dan status `Aktif`.

---

### [ ] QA-02: Pooling Akun Google Kedua (Multi-Account Aggregation)
1. Buka menu **Akun** (`/dashboard/accounts`).
2. Klik tombol **"Tambah Akun Google Drive"**.
3. Masuk dengan akun Google kedua yang berbeda.
4. Setujui izin akses Google Drive.
5. **Verifikasi:**
   - [ ] Di halaman akun, kini tercantum **2 Akun** dengan kuota masing-masing 15 GB.
   - [ ] Total kuota gabungan di header dan kartu ringkasan berubah menjadi **30 GB**.
   - [ ] Indikator status kedua akun bertuliskan `Aktif`.

---

### [ ] QA-03: Unggah Berkas Resumable Langsung ke Google
1. Klik tombol **Upload** (atau tab tengah di bottom nav mobile).
2. Pilih berkas pengujian (misal: gambar JPG atau berkas PDF 5 MB s/d 20 MB).
3. Biarkan opsi alokasi pada mode **Otomatis (Paling Kosong)**.
4. Klik **Mulai Unggah**.
5. **Verifikasi:**
   - [ ] Network tab di browser menunjukkan request `POST /api/files/initiate-upload` menghasilkan URL `uploadUrl` Google resumable.
   - [ ] Berkas di-stream langsung ke Google (`https://www.googleapis.com/upload/drive/v3/...`).
   - [ ] Progress bar berjalan dari 0% hingga 100% tanpa error memory server.
   - [ ] Berkas muncul di daftar **Penjelajah File** (`/dashboard/files`).

---

### [ ] QA-04: Penjelajah Berkas & Pencarian Global Multi-Drive
1. Buka halaman `/dashboard/files`.
2. Tekan tombol `Cmd+K` (Mac) atau `Ctrl+K` (Windows), atau klik bilah pencarian di header.
3. Ketikkan sebagian nama berkas yang baru saja diunggah.
4. **Verifikasi:**
   - [ ] Berkas ditemukan seketika dengan keterangan akun Google mana yang menampungnya.
   - [ ] Filter akun ("Semua Akun" vs "Akun Tertentu") dapat memfilter daftar berkas secara akurat.

---

### [ ] QA-05: Navigasi Mobile (Layar Smartphone 375px - 414px)
1. Buka aplikasi di smartphone atau buka Chrome DevTools dengan mode *Device Toolbar* (iPhone 14 / 390px).
2. Periksa **Bottom Navigation Bar** di bagian bawah layar:
   - [ ] Tab 1: **Ringkasan** -> Buka `/dashboard`.
   - [ ] Tab 2: **Files** -> Buka `/dashboard/files`.
   - [ ] Tab 3: **Upload** (Tengah) -> Buka `/dashboard/uploads`.
   - [ ] Tab 4: **Akun** -> Buka `/dashboard/accounts`.
   - [ ] Tab 5: **Profil** -> Buka `/dashboard/profile` (tidak buntu, langsung ke halaman profil pengguna).
3. Periksa **Hamburger Menu (≡)** di header kiri atas:
   - [ ] Klik ikon ≡ -> Drawer navigasi sidebar meluncur mulus dari kiri ke kanan.
   - [ ] Drawer tidak terpotong tepi layar.
   - [ ] Klik tanda (X) atau area luar -> Drawer tertutup kembali.

---

### [ ] QA-06: Verifikasi Keamanan CORS & Token Refresh
1. Jalankan test otomatis integrasi:
   ```bash
   npm run test:e2e
   ```
2. Pastikan request OPTIONS dari domain tidak dikenal ditolak dan route dashboard terproteksi saat tanpa session.

