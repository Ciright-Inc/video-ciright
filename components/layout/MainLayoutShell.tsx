"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import {
  MainScrollProvider,
  useMainScrollRef,
} from "@/components/providers/MainScrollProvider";
import { SessionExpiryWatcher } from "@/components/auth/SessionExpiryWatcher";
import { NavigationPendingProvider } from "@/components/providers/NavigationPendingProvider";
import { MainContentArea } from "@/components/layout/MainContentArea";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const scrollRef = useMainScrollRef();

  return (
    <SessionProvider>
      <QueryProvider>
        <NavigationPendingProvider>
          <SidebarProvider>
            <MainScrollProvider scrollRef={scrollRef}>
              <div className="flex h-dvh flex-col overflow-hidden">
                <SessionExpiryWatcher />
                <NavigationProgressBar />
                <Topbar />
                <div className="flex min-h-0 flex-1">
                  <Sidebar />
                  <main
                    ref={scrollRef}
                    className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-4"
                  >
                    <MainContentArea>{children}</MainContentArea>
                  </main>
                </div>
                <MobileNav />
              </div>
            </MainScrollProvider>
          </SidebarProvider>
        </NavigationPendingProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
