# SkyDrive - System & Feature Overview

## 1. System Overview
SkyDrive adalah platform multi-cloud storage aggregator yang memungkinkan pengguna menghubungkan beberapa akun Google Drive dalam satu antarmuka terpadu (Virtual Unified Storage) dengan auto-balancing, cross-account file explorer, dan zero-retention privacy.

- **Stack**: Next.js 16 (Turbopack, App Router), Hono API Backend, Prisma ORM, MySQL, Better Auth, Tailwind CSS.
- **Production URL**: `https://skydrive.web.id`

---

## 2. Key Architecture & Features

### A. Authentication & Account Linking
- Autentikasi sesi menggunakan Better Auth dengan database MySQL.
- Multi-Account Drive linking terenkripsi:
  - Token Google (`accessToken`, `refreshToken`) disimpan terenkripsi menggunakan AES-256-GCM ([`lib/encryption.ts`](file:///d:/projects/SkyDrive/lib/encryption.ts)).
  - OAuth state ditandatangani menggunakan HMAC-SHA256 dengan time-to-live 10 menit dan one-time nonce cookie HTTP-only untuk proteksi CSRF.

### B. Upload Architecture
- **Direct Resumable Upload**: Klien meminta upload session ke `POST /api/files/initiate-upload`, lalu streaming upload biner langsung dari browser ke Google Drive API v3.
- Menghindari RAM buffering di server dan melewati batas payload 4.5 MB Vercel Serverless Functions.
- Algoritma seleksi akun (`largest_available`, `least_used`, `balanced`, `manual`) diatur di [`lib/storage-algorithm.ts`](file:///d:/projects/SkyDrive/lib/storage-algorithm.ts).

### C. Security & Origin Controls
- **CORS**: Whitelist terbatas pada domain resmi (`https://skydrive.web.id`, development `http://localhost:3000`, dan preview Vercel resmi).
- **Zero Hardcoded Secrets**: Secret wajib diatur via environment variable pada environment production.

---

## 3. Automated Testing
Dijalankan menggunakan Vitest (`npm run test`):
- `__tests__/encryption.test.ts`: Enkripsi/dekripsi AES-256-GCM, random IV, tampering rejection.
- `__tests__/storage-algorithm.test.ts`: Logika seleksi penyimpanan, handling kuota, filter akun aktif.
- `__tests__/oauth-state.test.ts`: Validasi HMAC signature, perlindungan tamper payload, expiry state.

---

## 4. Verification Commands
- `npm run test`: Menjalankan seluruh unit test otomatis (15/15 passing).
- `npx next build` / `npm run build`: Memverifikasi TypeScript compile dan pembuatan build produksi.

