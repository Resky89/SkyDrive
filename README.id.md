<div align="center">
  <img src="public/SkyDrive1.svg" alt="SkyDrive Logo" width="300" />
  
  <h3>Satu Ruang Kerja. Seluruh Akun Google Drive Anda. Penyimpanan Awan Cerdas & Bebas Langganan.</h3>
  <p><em>One Workspace. All Your Google Drives. Smart Cloud Storage with True Zero-Retention.</em></p>

  <p>
    <a href="README.md">🇬🇧 <strong>Read in English</strong></a> &nbsp;•&nbsp; 
    <strong>Bahasa Indonesia</strong>
  </p>
</div>

---

<div align="center">
  <img src="public/dashboard-dark.webp" alt="SkyDrive Dashboard Preview" width="950" style="border-radius: 14px; box-shadow: 0 16px 40px -10px rgba(0,0,0,0.4);" />
</div>

---

## 💡 Latar Belakang & Masalah yang Diselesaikan

Setiap akun Google gratis mendapatkan jatah penyimpanan awan sebesar **15 GB**. Sebagian besar dari kita memiliki lebih dari satu akun—misalnya akun pribadi, email kerja/kantor, email kampus, dan akun cadangan. Jika Anda memiliki 3 sampai 5 akun, sebenarnya Anda memiliki **45 GB hingga 75 GB+ kuota resmi Google Drive secara cuma-cuma**.

Namun, mengelolanya secara manual sangat merepotkan:
- **Dilema File Besar**: Anda ingin mengunggah video 5.0 GB, tetapi gagal karena ketiga akun Anda masing-masing hanya menyisakan 2.0 GB, padahal jika ditotal Anda masih punya 6.0 GB sisa ruang!
- **Repot Gonta-Ganti Tab**: Anda harus membuka 4 tab browser berbeda dan login ulang berkali-kali hanya untuk mencari satu file lama.
- **Biaya Langganan Mahal**: Terpaksa membayar langganan bulanan Google One hanya karena salah satu akun sudah penuh.
- **Kekhawatiran Privasi**: Layanan agregator cloud biasa sering kali menampung file Anda di hard drive server perantara dan menyimpan daftar nama file pribadi Anda di database mereka.

**SkyDrive hadir sebagai solusi pintar tanpa biaya:**  
Menyatukan semua akun Google Drive Anda menjadi **satu kapasitas penyimpanan lega**, otomatis mengarahkan file ke akun yang masih kosong, dan menyediakan penjelajah file satu pintu dengan jaminan **100% Zero-Retention Privacy**.

---

## ✨ Fitur Utama & Keunggulan SkyDrive

### 1. 🛡️ Zero-Retention Privacy (Privasi Mutlak)
- **0 Byte Data File di Database**: Database server SkyDrive **sama sekali tidak menyimpan nama file, link, thumbnail, ukuran, maupun isi dokumen Anda**.
- **Live Direct Query**: Daftar file dan folder dibaca secara langsung (*live in-memory*) dari Google Drive Anda saat Anda membuka dashboard. Data Anda tetap sepenuhnya milik Anda di Google.

### 2. ⚡ In-Memory Streaming Data Plane (Tanpa Server Perantara)
- File yang Anda unggah langsung mengalir dari peramban (browser) ke server Google Drive via koneksi terenkripsi.
- SkyDrive **tidak pernah menyimpan salinan fisik file di hard drive perantara**. Tidak ada risiko kebocoran file dari server pihak ketiga.

### 3. 🌐 Penggabungan Kuota Otomatis (Unified Virtual Pool)
- Satukan akun gratisan (15 GB/akun), akun Google One (100 GB+), hingga akun kampus/institusi (2 TB+).
- Tampilan meteran kapasitas interaktif yang memperlihatkan total kapasitas gabungan, ruang terpakai, dan sisa ruang bebas secara langsung.

### 4. 🔀 Smart Upload Dispatcher (Unggah Pintar)
Tiga mode alokasi otomatis saat Anda mengunggah file:
- **Paling Luang (Rekomendasi)**: Sistem otomatis mendeteksi sisa ruang di semua akun dan langsung memilih akun Google Drive yang paling lega.
- **Isi Akun Utama Dulu**: Mengisi akun utama Anda terlebih dahulu, lalu otomatis mengalihkan file ke akun cadangan saat akun utama mendekati batas aman.
- **Bagi Rata**: Membagi pengunggahan file secara merata dan bergantian ke setiap akun yang terhubung.

### 5. 📁 Penjelajah File Terpadu & 3 Tab Lingkup Akses
- Kelola semua file dari seluruh akun Google Drive Anda dalam satu antarmuka yang rapi.
- **3 Tab Lingkup Filter**:
  - **Drive Saya (`user`)**: Menampilkan file milik seluruh akun yang terhubung.
  - **Dibagikan kepada Saya (`sharedWithMe`)**: Menampilkan dokumen yang dibagikan orang lain ke salah satu email Anda.
  - **Drive Bersama (`sharedDrive`)**: Menampilkan Google Shared Drives tim/organisasi.
- Fitur lengkap: Unduh langsung, ganti nama (*rename*), pindah folder (*move*), dan hapus massal (*bulk delete*).

### 6. 🔍 Pencarian Satu Pintu
- Tidak perlu lagi menebak-nebak di akun Google mana file lama Anda tersimpan. Ketik nama berkas di kolom pencarian, dan SkyDrive akan langsung menemukannya dari seluruh akun Anda.

### 7. 🔐 Keamanan Kunci Standar Perbankan (AES-256-GCM)
- SkyDrive tidak pernah mengetahui atau meminta kata sandi (*password*) Google Anda. Login dilakukan melalui otorisasi resmi Google OAuth 2.0.
- Kunci token integrasi diamankan dengan enkripsi berlapis `AES-256-GCM`.
- Izin akses dapat Anda putuskan kapan saja hanya dengan 1 klik dari dashboard atau melalui menu Keamanan Akun Google Anda.

### 8. 🌍 Dukungan 5 Bahasa Internasional
- Didukung penuh dalam **Bahasa Indonesia (`/id`)**, **English (`/en`)**, **日本語 (`/ja`)**, **中文 (`/zh`)**, dan **한국어 (`/ko`)**.
- URL halaman otomatis menyesuaikan bahasa dan didukung *Server-Side Rendering (SSR)* cepat tanpa kedipan layar (*flicker*).

---

## 🚀 Cara Kerja (3 Langkah Mudah)

```text
1. Hubungkan Akun Google   ➔   2. Kapasitas Tergabung Otomatis   ➔   3. Upload & Cari di Satu Tempat
   (Otorisasi resmi OAuth)        (Misal: 3 Akun = 45 GB Bebas)           (File langsung masuk ke Google)
```

---

<div align="center">
  <p><strong>SkyDrive</strong> · Diciptakan untuk produktivitas penyimpanan awan multi-akun yang praktis dan aman.</p>
</div>

