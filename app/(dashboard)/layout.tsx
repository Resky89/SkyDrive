import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Particles } from "@/components/ui/particles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden relative">
      {/* Ambient Cloud Lights for Dashboard */}
      <div className="ambient-sky-orb top-[-150px] right-[-50px] w-[500px] h-[500px] bg-sky-500/15 pointer-events-none" />
      <div className="ambient-sky-orb bottom-[-100px] left-[200px] w-[600px] h-[600px] bg-indigo-600/10 pointer-events-none" />
      <Particles quantity={25} ease={80} size={0.5} staticity={60} className="z-0 opacity-40 pointer-events-none" />

      {/* Fixed Left Sidebar (Does not scroll away) */}
      <Sidebar />

      {/* Main App Canvas: Fixed Top AppBar with stable scrolling content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Header />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden scrollbar-stable">
          {children}
        </div>
      </div>
    </div>
  );
}
