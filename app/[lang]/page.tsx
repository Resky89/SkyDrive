import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LandingView } from "@/components/landing/landing-view";
import { JsonLd } from "@/components/seo/json-ld";
import { VALID_LANGS, type Language } from "@/lib/languages";

interface PageProps {
  params: Promise<{ lang: string }>;
}

const META_TRANSLATIONS: Record<
  Language,
  {
    title: string;
    description: string;
    ogTitle: string;
    ogDesc: string;
    keywords: string[];
  }
> = {
  id: {
    title: "Gabung Akun Google Drive Jadi Satu Pool | SkyDrive",
    description:
      "Gabung akun Google Drive Anda jadi satu storage pool terpadu. Nikmati upload pintar dan privasi zero-retention tanpa biaya langganan. Coba gratis sekarang.",
    ogTitle: "SkyDrive · Satukan Semua Google Drive Jadi Satu Cloud Storage Pintar",
    ogDesc:
      "Kumpulkan kuota 15 GB gratis dari banyak akun Google Drive menjadi 45 GB hingga 100 GB+ penyimpanan terpadu dengan upload pintar.",
    keywords: [
      "gabung akun google drive",
      "satukan google drive",
      "multi akun google drive",
      "penyimpanan cloud gratis",
      "google drive pool",
      "smart upload cloud",
      "zero retention privacy",
    ],
  },
  en: {
    title: "Merge Multiple Google Drives Into One Pool | SkyDrive",
    description:
      "Merge multiple Google Drive accounts into one virtual storage pool. Smart upload routing with true zero-retention privacy. Connect your drives for free.",
    ogTitle: "SkyDrive · One Workspace for All Your Google Drives",
    ogDesc:
      "Aggregate multiple 15 GB quotas into 45 GB to 100 GB+ of unified cloud storage. Smart upload routing, global file search, zero subscription costs.",
    keywords: [
      "merge google drives",
      "multi account google drive",
      "combine google storage",
      "cloud storage aggregator",
      "virtual drive pool",
      "smart upload dispatcher",
      "zero retention cloud storage",
    ],
  },
  ja: {
    title: "複数のGoogleドライブをひとつに統合 | SkyDrive",
    description:
      "複数のGoogleアカウントを統合して1つの仮想大容量クラウドプールに。スマートアップロードとゼロ保持プライバシーで安全に管理。今すぐ無料でお試しください。",
    ogTitle: "SkyDrive · すべてのGoogleドライブをひとつのワークスペースに",
    ogDesc:
      "複数の15GB無料枠を合算して45GB〜100GB+の大容量仮想クラウドを構築。月額課金なしでスマートにファイルを自動振分保存。",
    keywords: [
      "Googleドライブ統合",
      "複数アカウント管理",
      "無料クラウドストレージ",
      "ストレージアグリゲーター",
      "ゼロデータ保持",
    ],
  },
  zh: {
    title: "合并多个 Google 云端硬盘空间 | SkyDrive",
    description:
      "将多个 Google Drive 账号聚合为一个统一的虚拟云存储池。支持智能上传分流与零数据留存隐私架构，免受月费困扰。立即免费开始体验。",
    ogTitle: "SkyDrive · 将多个 Google 云端硬盘合并为一个智能工作区",
    ogDesc:
      "聚合多个 15 GB 免费空间，轻松打造 45 GB 至 100 GB+ 虚拟大容量存储池。智能分流路由，零中间留存绝对安全。",
    keywords: [
      "合并Google网盘",
      "多账号云存储整合",
      "免费云盘聚合器",
      "智能上传分流",
      "零数据留存隐私",
    ],
  },
  ko: {
    title: "여러 Google 드라이브를 하나의 풀로 통합 | SkyDrive",
    description:
      "여러 개의 Google 계정을 하나의 가상 통합 스토리지 풀로 병합하세요. 스마트 업로드 라우팅과 제로 리텐션 프라이버시를 무료로 경험해 보세요.",
    ogTitle: "SkyDrive · 모든 Google 드라이브를 하나의 워크스페이스로 통합",
    ogDesc:
      "각 계정의 무료 15 GB를 결합하여 45 GB ~ 100 GB+ 통합 클라우드 풀 생성. 스마트 업로드 자동 분기 저장 및 제로 리텐션 보안.",
    keywords: [
      "구글 드라이브 통합",
      "다중 계정 스토리지 관리",
      "무료 클라우드 풀",
      "스마트 업로드 라우터",
      "제로 리텐션 보안",
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const validLang = (VALID_LANGS.includes(lang as Language) ? lang : "id") as Language;
  const meta = META_TRANSLATIONS[validLang];
  const baseUrl = "https://skydrive.web.id";

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `${baseUrl}/${validLang}`,
      languages: {
        "id-ID": `${baseUrl}/id`,
        "en-US": `${baseUrl}/en`,
        "ja-JP": `${baseUrl}/ja`,
        "zh-CN": `${baseUrl}/zh`,
        "ko-KR": `${baseUrl}/ko`,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${validLang}`,
      siteName: "SkyDrive",
      locale:
        validLang === "id"
          ? "id_ID"
          : validLang === "ja"
          ? "ja_JP"
          : validLang === "zh"
          ? "zh_CN"
          : validLang === "ko"
          ? "ko_KR"
          : "en_US",
      type: "website",
      images: [
        {
          url: "/dashboard-dark.webp",
          width: 1200,
          height: 630,
          alt: "SkyDrive Virtual Cloud Dashboard",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/dashboard-dark.webp"],
    },
  };
}

export default async function LocalizedLandingPage({ params }: PageProps) {
  const { lang } = await params;
  const validLang = (VALID_LANGS.includes(lang as Language) ? lang : "id") as Language;

  let user = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    user = session?.user ?? null;
  } catch (error) {
    // Graceful fallback: database connection blip won't crash public landing page
    console.warn("Notice: Unable to check session on landing page:", error instanceof Error ? error.message : error);
  }

  return (
    <>
      <JsonLd language={validLang} />
      <LandingView user={user} />
    </>
  );
}
