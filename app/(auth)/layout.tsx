import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthPageShell>
      <AuthMarketingPanel />
      {children}
    </AuthPageShell>
  );
}
