<div align="center">
  <img src="public/SkyDrive1.svg" alt="SkyDrive Logo" width="300" />
  
  <h3>One Workspace. All Your Google Drives. Smart Cloud Storage with True Zero-Retention.</h3>
  <p><em>Satu Ruang Kerja. Seluruh Akun Google Drive Anda. Penyimpanan Awan Cerdas & Bebas Langganan.</em></p>

  <p>
    <strong>English</strong> &nbsp;•&nbsp; 
    <a href="README.id.md">🇮🇩 <strong>Baca dalam Bahasa Indonesia</strong></a>
  </p>
</div>

---

<div align="center">
  <img src="public/dashboard-dark.webp" alt="SkyDrive Dashboard Preview" width="950" style="border-radius: 14px; box-shadow: 0 16px 40px -10px rgba(0,0,0,0.4);" />
</div>

---

## 💡 Background & The Problem Solved

Every standard Google account comes with **15 GB of free cloud storage**. Most users maintain 3 to 5 separate Google accounts across personal, university, work, and secondary emails—representing **45 GB to 75 GB+ of official free cloud quota**.

However, managing multiple accounts manually causes constant friction:
- **Quota Fragmentation**: You want to upload a 5.0 GB video, but it fails because each of your 3 accounts only has 2.0 GB left—even though your total combined free space is 6.0 GB!
- **Tab Fatigue & Context Switching**: Hunting for an old document requires jumping between multiple browser tabs and logging in and out repeatedly.
- **Costly Subscriptions**: Paying for monthly cloud plans simply because one single account reached its 15 GB ceiling.
- **Privacy Trade-offs**: Conventional third-party cloud aggregators store copies of your files on their intermediate disks and index personal document metadata in external databases.

**SkyDrive eliminates these limitations without subscription costs:**  
It aggregates all your Google Drive accounts into a **single, unified virtual storage pool**, routes uploads automatically to the drive with available headroom, and searches files across all accounts from one unified dashboard—built with **True Zero-Retention Privacy**.

---

## ✨ Core Features & Highlights

### 1. 🛡️ True Zero-Retention Privacy
- **0 Bytes of File Metadata in Server Database**: SkyDrive **never stores your file names, file sizes, thumbnails, links, or folder paths in any database**.
- **Live In-Memory Direct Sync**: Your file trees and documents are queried in real time directly from the Google Drive API v3 when you access the dashboard. Your files remain 100% yours on Google.

### 2. ⚡ In-Memory Streaming Data Plane (Zero Intermediate Storage)
- File uploads and downloads stream in-memory directly between your browser and Google Cloud Storage via backpressure-controlled pipelines.
- SkyDrive **never writes user file binaries to intermediate server disks**. There is zero risk of data residue or file leaks on third-party hardware.

### 3. 🌐 Unified Virtual Storage Pool
- Seamlessly combine free accounts (15 GB each), Google One tiers (100 GB+), or Google Workspace / Edu accounts (2 TB+).
- Visual interactive storage gauge showing real-time combined pool capacity, total space used, and leftover headroom.

### 4. 🔀 Smart Upload Dispatcher
Three intelligent routing strategies when you upload:
- **Best Fit (Recommended)**: Automatically checks available space across all linked accounts and routes files to the Google Drive with the most headroom.
- **Tiered Spillover**: Fills your primary drive up to a safe threshold (85%), then smoothly spills new uploads over to your secondary backup drives.
- **Round Robin**: Balances file uploads evenly across all connected accounts.

### 5. 📁 Unified File Explorer & 3-Scope Switcher
- View and manage files across all your Google Drive accounts in one fluid, high-performance table.
- **3 Scope Filters**:
  - **My Drive (`user`)**: Personal files owned by your connected accounts.
  - **Shared with Me (`sharedWithMe`)**: Files shared to any of your emails by collaborators.
  - **Shared Drives (`sharedDrive`)**: Institutional and team shared drives.
- Complete operations: In-browser streaming download, renaming, moving across folders, and multi-file bulk deletion.

### 6. 🔍 Single-Door Global Search
- Stop guessing which Google account contains your file. Type the filename in the search bar, and SkyDrive finds it across all your linked drives in milliseconds.

### 7. 🔐 Bank-Grade AES-256-GCM Token Encryption
- SkyDrive never asks for or sees your Google password. Authentication is handled via official Google OAuth 2.0.
- OAuth access and refresh keys are encrypted at rest using authenticated `AES-256-GCM` with unique initialization vectors (IV).
- Revoke access anytime with 1 click directly from the dashboard or through [myaccount.google.com](https://myaccount.google.com/permissions).

### 8. 🌍 First-Class 5-Language Localization
- Available in **English (`/en`)**, **Indonesian (`/id`)**, **Japanese (`/ja`)**, **Chinese (`/zh`)**, and **Korean (`/ko`)**.
- Clean URL routing with automatic browser language detection and instant Server-Side Rendering (SSR).

---

## 🚀 How It Works (3 Simple Steps)

```text
1. Link Your Google Accounts   ➔   2. Storage Pools Automatically   ➔   3. Upload & Search in One Place
    (Official Google OAuth)           (e.g., 3 Accounts = 45 GB Free)          (Files stored safely on Google)
```

---

<div align="center">
  <p><strong>SkyDrive</strong> · Built for seamless multi-account cloud productivity.</p>
</div>
