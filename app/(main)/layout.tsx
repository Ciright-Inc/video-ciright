// DB-backed pages must render at request time; Railway build has no Postgres access.
export const dynamic = "force-dynamic";

import { MainLayoutShell } from "@/components/layout/MainLayoutShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutShell>{children}</MainLayoutShell>;
}
