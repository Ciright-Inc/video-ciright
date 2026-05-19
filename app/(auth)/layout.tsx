export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-[var(--color-gradient-sky-light)] to-canvas p-4">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-hairline bg-surface-card p-8 shadow-[var(--shadow-card)]">
        {children}
      </div>
    </div>
  );
}
