import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <div className="flex h-dvh flex-col overflow-hidden">
          <SessionExpiryWatcher />
          <Topbar />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
