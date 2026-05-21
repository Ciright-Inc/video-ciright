import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="flex h-dvh flex-col overflow-hidden">
          <SessionExpiryWatcher />
          <Topbar />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-4">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
