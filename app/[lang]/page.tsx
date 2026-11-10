import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LandingView } from "@/components/landing/landing-view";

export default async function LocalizedLandingPage() {
  let user = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    user = session?.user ?? null;
  } catch (error) {
    // Graceful fallback: database connection blip won't crash public landing page
    console.warn("Notice: Unable to check session on landing page:", error instanceof Error ? error.message : error);
  }

  return <LandingView user={user} />;
}

