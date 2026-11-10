import type { Language } from "@/lib/languages";

interface JsonLdProps {
  language: Language;
}

export function JsonLd({ language }: JsonLdProps) {
  const baseUrl = "https://skydrive.web.id";

  // 1. SoftwareApplication Schema
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SkyDrive",
    operatingSystem: "Web Browser (Chrome, Safari, Firefox, Edge)",
    applicationCategory: "StorageApplication",
    applicationSubCategory: "Cloud Storage Manager",
    url: `${baseUrl}/${language}`,
    image: `${baseUrl}/dashboard-dark.webp`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      language === "id"
        ? "Platform aggregator multi-akun Google Drive dengan smart upload routing dan arsitektur privasi zero-retention."
        : "Multi-account Google Drive aggregator with intelligent upload routing and zero-retention privacy architecture.",
    featureList: [
      "Zero-Retention In-Memory Data Plane",
      "Unified Multi-Account Virtual Storage Pool",
      "Smart Upload Dispatcher (Best Fit, Tiered Spillover, Round Robin)",
      "Cross-Account Global Search & 3-Scope Switcher",
      "AES-256 Encrypted OAuth Token Vault",
    ],
    creator: {
      "@type": "Organization",
      name: "SkyDrive",
      url: baseUrl,
    },
  };

  // 2. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SkyDrive",
    url: baseUrl,
    logo: `${baseUrl}/SkyDrive1.svg`,
    description:
      "Developer of SkyDrive, the smart zero-retention multi-account cloud storage aggregator.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-859-2346-1660",
      contactType: "Customer Support",
      email: "reskyprabowo89@gmail.com",
      areaServed: "Worldwide",
      availableLanguage: ["Indonesian", "English", "Japanese", "Chinese", "Korean"],
    },
    sameAs: ["https://github.com/Resky89/SkyDrive"],
  };

  // 3. WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SkyDrive",
    url: baseUrl,
    inLanguage: [language, "en", "id", "ja", "zh", "ko"],
  };

  // 4. FAQPage Schema for Rich Snippets & AI Citations
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          language === "id"
            ? "Apakah SkyDrive bisa melihat isi file atau foto pribadi saya?"
            : "Can SkyDrive view my personal files or photos?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            language === "id"
              ? "Tidak sama sekali. SkyDrive hanya bertindak sebagai jembatan pengatur. File langsung dikirim secara in-memory antara browser Anda dan Google Cloud Storage. SkyDrive tidak pernah menyimpan salinan file, thumbnail, atau metadata dokumen Anda di database server (Zero-Retention Privacy)."
              : "No. SkyDrive only acts as a management bridge. Files stream directly between your browser and Google Cloud Storage in-memory. SkyDrive never persists your file copies, thumbnails, or document metadata in any server database (True Zero-Retention Privacy).",
        },
      },
      {
        "@type": "Question",
        name:
          language === "id"
            ? "Apakah SkyDrive benar-benar gratis?"
            : "Is SkyDrive really free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            language === "id"
              ? "Ya, 100% gratis. SkyDrive memanfaatkan jatah 15 GB gratis yang diberikan Google pada setiap akun. Menggabungkan 3 akun memberikan Anda 45 GB, dan 5 akun memberikan Anda 75 GB+ kapasitas cloud pool tanpa biaya langganan bulanan."
              : "Yes, 100% free! SkyDrive leverages the 15 GB free storage that Google provides with every account. Connecting 3 accounts gives you 45 GB, and 5 accounts unlocks 75 GB+ of unified cloud storage pool without costly monthly subscriptions.",
        },
      },
      {
        "@type": "Question",
        name:
          language === "id"
            ? "Apa yang terjadi jika salah satu akun Google saya penuh?"
            : "What happens when one of my Google accounts gets full?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            language === "id"
              ? "Sistem Smart Upload Dispatcher SkyDrive otomatis memeriksa sisa kapasitas semua akun dan mengalihkan file baru ke akun Google Drive yang masih memiliki ruang kosong (strategi Best Fit atau Tiered Spillover)."
              : "SkyDrive's Smart Upload Dispatcher automatically checks available headspace across all connected accounts and routes new files to the Google Drive with the most free headroom (using Best Fit or Tiered Spillover strategies).",
        },
      },
      {
        "@type": "Question",
        name:
          language === "id"
            ? "Bisakah saya memutuskan akun Google kapan saja?"
            : "Can I disconnect a Google account anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            language === "id"
              ? "Ya, kapan saja dengan 1 klik. Semua file Anda tetap aman di Google Drive Anda tanpa ada yang terhapus atau berubah."
              : "Yes, anytime with 1 click. All your files remain completely intact in your Google Drive without any changes.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

