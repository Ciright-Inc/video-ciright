import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthPageShell>
      <div className="flex min-h-0 flex-1 flex-col bg-surface-card lg:contents">
        <AuthMarketingPanel />
        {children}
      </div>
    </AuthPageShell>
  );
}
