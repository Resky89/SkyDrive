import { Sidebar } from "@/components/sidebar";
import { Particles } from "@/components/ui/particles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden relative">
      {/* Ambient Cloud Lights for Dashboard */}
      <div className="ambient-sky-orb top-[-150px] right-[-50px] w-[500px] h-[500px] bg-sky-500/15 pointer-events-none" />
      <div className="ambient-sky-orb bottom-[-100px] left-[200px] w-[600px] h-[600px] bg-indigo-600/10 pointer-events-none" />
      <Particles quantity={25} ease={80} size={0.5} staticity={60} className="z-0 opacity-40 pointer-events-none" />

      {/* Fixed Left Sidebar (Does not scroll away) */}
      <Sidebar />

      {/* Main App Canvas: Scroll container with sticky App Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative z-10">
        {children}
      </div>
    </div>
  );
}
