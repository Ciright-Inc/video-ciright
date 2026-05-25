import { cn } from "@/lib/utils";

type AuthFormPanelProps = {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AuthFormPanel({
  title,
  subtitle,
  children,
  className,
}: AuthFormPanelProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-1 flex-col justify-start overflow-y-auto px-6 pt-0 pb-8 sm:px-10 sm:pb-10 lg:min-h-dvh lg:flex-none lg:justify-center lg:bg-surface-card lg:px-12 lg:py-10 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.16)] xl:px-16 2xl:px-20",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-primary/7 to-transparent lg:block"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col xl:max-w-[460px] 2xl:max-w-[500px]">
        <div className="mb-6 w-fit rounded-full border border-primary/12 bg-primary/6 px-3 py-1 text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Secure access
        </div>

        <header className="mb-8">
          <h2 className="text-4xl leading-tight font-black tracking-[-0.045em] text-ink">
            {title}
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {subtitle}
          </p>
        </header>

        {children}
      </div>
    </section>
  );
}
