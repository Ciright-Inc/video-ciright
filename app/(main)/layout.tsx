import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="flex h-dvh flex-col overflow-hidden">
          <Topbar />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
