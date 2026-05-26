import { BellIcon, PlayIcon, SparklesIcon, ThumbsUpIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { productName } from "@/themes/theme.config";

function AuthBrandHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 lg:bg-white lg:shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
          <Logo size={30} />
        </span>
        <span className="truncate text-lg font-bold tracking-tight text-ink lg:text-inherit">
          {productName}
        </span>
      </div>
      <span className="hidden shrink-0 rounded-full border border-primary/12 bg-primary/6 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-primary uppercase backdrop-blur sm:inline lg:border-white/15 lg:bg-white/10 lg:text-white/70">
        Studio
      </span>
    </div>
  );
}

export function AuthMarketingPanel() {
  return (
    <aside className="relative flex shrink-0 flex-col overflow-hidden px-6 pt-6 pb-2 text-ink lg:min-h-dvh lg:px-8 lg:pt-8 lg:pb-8 lg:text-white xl:px-12 xl:pt-10 xl:pb-10 2xl:px-16">
      {/* Decorative background orbs — desktop only */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 right-8 hidden h-64 w-64 rounded-full border border-white/8 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-16 hidden h-72 w-72 rounded-full bg-white/8 blur-3xl lg:block"
      />

      {/* ── Top bar — visible on all screen sizes ── */}
      <AuthBrandHeader className="relative z-10 lg:mb-8 xl:mb-10" />

      {/* ── Headline & mockup — desktop only ── */}
      <div className="relative z-10 hidden min-h-0 flex-1 flex-col lg:flex">
        <div className="mb-4 shrink-0 xl:mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur xl:mb-4">
          <SparklesIcon className="size-3.5 text-white" />
          Built for creators, teams, and viewers
        </div>
        <h1 className="text-4xl leading-[1.02] font-black tracking-[-0.05em] text-balance xl:text-5xl 2xl:text-6xl">
          Watch sharper.
          <br />
          Create faster.
          <br />
          <span className="text-white/55">Share everywhere.</span>
        </h1>
      </div>

        <p className="mb-6 max-w-md shrink-0 text-[15px] leading-7 text-white/65 xl:mb-8 xl:text-base xl:leading-8">
          Manage your video library, keep your audience moving, and publish with a
          workflow that feels fast from the first click.
        </p>

        {/* ── Dashboard mockup — capped height, centred ── */}
        <div className="flex min-h-0 flex-1 items-center">
          <div className="w-full max-w-[520px]">
          {/* Outer glass frame */}
          <div className="relative rounded-[24px] border border-white/15 bg-white/10 p-3 shadow-[0_24px_72px_rgba(0,0,0,0.26)] backdrop-blur-2xl xl:rounded-[28px] xl:p-3.5">
            {/* Inner white card */}
            <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(150deg,rgba(255,255,255,0.96),rgba(232,238,248,0.88))] p-3.5 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] xl:rounded-[22px] xl:p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-14 -right-10 size-48 rounded-full bg-primary/8"
              />

              {/* Card header */}
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] text-primary uppercase">
                    Live workspace
                  </p>
                  <h2 className="mt-0.5 text-base font-black tracking-tight xl:text-lg">
                    Creator dashboard
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
                  <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" />
                  Online
                </div>
              </div>

              {/* Video thumbnail */}
              <div className="relative mb-3 h-44 overflow-hidden rounded-[14px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_20%),linear-gradient(135deg,var(--color-primary),var(--color-surface-dark))] xl:h-52 xl:rounded-[18px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/50 to-transparent"
                />
                <div className="absolute top-3 left-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  Featured upload
                </div>
                {/* Play button centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-[0_16px_40px_rgba(0,0,0,0.3)] motion-safe:animate-pulse xl:size-14"
                  >
                    <PlayIcon className="ml-1 size-5 fill-current xl:size-6" />
                  </div>
                </div>
                {/* Bottom progress bar */}
                <div className="absolute right-3 bottom-3 left-3">
                  <div className="mb-1.5 flex items-end justify-between text-white">
                    <span className="text-xs font-bold">Brand launch cut</span>
                    <span className="font-mono text-[11px] text-white/70">
                      03:18
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[44%] rounded-full bg-white motion-safe:animate-[auth-progress_3s_ease-in-out_infinite_alternate]" />
                  </div>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid shrink-0 grid-cols-3 gap-2">
                <Metric label="Views" value="1.8M" />
                <Metric label="Watch time" value="42k hr" />
                <Metric label="Shares" value="+28%" />
              </div>
            </div>

            {/* Floating badges — kept inside the glass frame so nothing overflows */}
            <FloatingBadge className="-top-4 -right-4">
              <BellIcon className="size-4 text-primary" />
            </FloatingBadge>
            <FloatingBadge className="top-1/3 -left-4 motion-safe:[animation-delay:1s]">
              <ThumbsUpIcon className="size-4 text-primary" />
            </FloatingBadge>
          </div>
        </div>
      </div>
      </div>
    </aside>
  );
}

function FloatingBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute flex size-10 items-center justify-center rounded-xl border border-white/50 bg-white/95 shadow-[0_12px_32px_rgba(0,0,0,0.16)] motion-safe:animate-[auth-float_3s_ease-in-out_infinite]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary/7 px-2.5 py-2">
      <span className="block text-sm font-black tracking-tight text-primary xl:text-base">
        {value}
      </span>
      <span className="mt-0.5 block text-[10px] font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
