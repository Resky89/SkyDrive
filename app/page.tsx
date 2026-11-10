import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { VALID_LANGS, type Language } from "@/lib/languages";

export default async function RootPage() {
  const cookieStore = await cookies();
  const rawCookieLang = cookieStore.get("skydrive_lang")?.value;

  if (rawCookieLang && VALID_LANGS.includes(rawCookieLang as Language)) {
    redirect(`/${rawCookieLang}`);
  }

  const reqHeaders = await headers();
  const acceptLang = reqHeaders.get("accept-language")?.toLowerCase() || "";
  let targetLang = "id";

  if (acceptLang.startsWith("en")) targetLang = "en";
  else if (acceptLang.startsWith("ja")) targetLang = "ja";
  else if (acceptLang.startsWith("zh")) targetLang = "zh";
  else if (acceptLang.startsWith("ko")) targetLang = "ko";

  redirect(`/${targetLang}`);
}
