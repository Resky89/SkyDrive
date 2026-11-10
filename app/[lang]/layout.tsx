import { notFound } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n";
import { VALID_LANGS, type Language } from "@/lib/languages";

export function generateStaticParams() {
  return VALID_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!VALID_LANGS.includes(lang as Language)) {
    notFound();
  }

  return (
    <LanguageProvider initialLanguage={lang as Language}>
      {children}
    </LanguageProvider>
  );
}

