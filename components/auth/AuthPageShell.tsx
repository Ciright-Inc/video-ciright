import Link from "next/link";

type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(208,224,255,0.9),transparent_28%),linear-gradient(135deg,var(--color-surface-dark)_0%,var(--color-primary)_44%,var(--color-gradient-sky-mid)_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[18%] size-[520px] rounded-full bg-white/20 blur-3xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-8 size-[420px] rounded-full bg-(--color-gradient-sky-mid)/40 blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1s]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-size-[80px_80px] mask-[linear-gradient(90deg,black,transparent_72%)]"
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_600px] 2xl:grid-cols-[minmax(0,1fr)_680px]">
        {children}
      </div>

      <footer className="absolute inset-x-6 bottom-5 z-20 hidden flex-wrap items-center justify-between gap-3 text-xs text-white/70 lg:flex">
        <span>© {new Date().getFullYear()} Ciright Video</span>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          <Link href="/" className="font-medium text-white/85 transition hover:text-white">
            Home
          </Link>
          <Link href="/login" className="font-medium text-white/85 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="font-medium text-white/85 transition hover:text-white"
          >
            Register
          </Link>
        </nav>
      </footer>
    </div>
  );
}
