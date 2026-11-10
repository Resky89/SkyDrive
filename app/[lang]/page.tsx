import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LandingView } from "@/components/landing/landing-view";

export default async function LocalizedLandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return <LandingView user={user} />;
}

