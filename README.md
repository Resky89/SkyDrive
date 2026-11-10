# ☁️ SkyDrive

> **One Workspace. All Your Google Drives. Smarter Storage.**

SkyDrive is a unified cloud storage management platform engineered to connect, monitor, and aggregate **multiple Google Drive accounts** into a single cohesive virtual storage pool.

Instead of switching between multiple Google accounts in separate browser tabs or paying for extra cloud storage, SkyDrive provides a centralized management layer with intelligent upload distribution, global cross-drive search, and quota balancing.

---

## 🚀 Key Features

- **Unified Virtual Storage Volume**: Combines free 15 GB quotas across multiple connected Google Drive accounts into a single visible storage pool (e.g., 3 accounts = 45 GB).
- **Smart Upload Allocation**: Automatically detects remaining free space and routes file uploads to whichever Google Drive account has room available.
- **Zero-Exposure In-Memory Data Plane**: File binaries stream directly between the client browser and Google Drive API v3 via HTTP backpressure. Zero bytes of user file content are stored on intermediate servers.
- **Cryptographic Token Enclave**: All OAuth 2.0 access and refresh tokens are encrypted at rest using authenticated `AES-256-GCM` with unique initialization vectors.
- **Cross-Account File Explorer**: Search, inspect, download, and organize files across all linked drives within a single interface, featuring global keyboard navigation (⌘K).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router & Turbopack)](https://nextjs.org)
- **Frontend**: [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion)
- **Icons & Primitives**: [Lucide React](https://lucide.dev), [Radix UI](https://www.radix-ui.com)
- **API & Routing**: [Hono](https://hono.dev) with Zod validation
- **Database & ORM**: MySQL, [Prisma ORM](https://www.prisma.io)
- **Authentication**: [Better Auth](https://better-auth.com) + Google OAuth 2.0
- **Cloud Storage Integration**: Google Drive API v3 (`googleapis`, `google-auth-library`)

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 20+
- MySQL database
- Google Cloud Console Project with Google Drive API enabled (OAuth consent screen in "In production" status)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Resky89/SkyDrive.git
cd SkyDrive
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/skydrive"

# Application Security
BETTER_AUTH_SECRET="your-better-auth-secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="your-32-byte-hex-encryption-key-64-hex-chars"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Model

- **Minimal Permissions**: SkyDrive requests standard Google Drive scopes, strictly limited to managing connected drives.
- **Zero File Retention**: We never store file payloads on our servers. Files stream directly to Google Cloud Storage.
- **Revocable Access**: Permissions can be revoked at any time directly through your Google Account Security Dashboard.

---

## 📄 License

This project is licensed under the MIT License.
