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

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const scrollRef = useMainScrollRef();

  return (
    <SessionProvider>
      <QueryProvider>
        <SidebarProvider>
          <MainScrollProvider scrollRef={scrollRef}>
            <div className="flex h-dvh flex-col overflow-hidden">
              <SessionExpiryWatcher />
              <Topbar />
              <div className="flex min-h-0 flex-1">
                <Sidebar />
                <main
                  ref={scrollRef}
                  className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-4"
                >
                  {children}
                </main>
              </div>
              <MobileNav />
            </div>
          </MainScrollProvider>
        </SidebarProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
