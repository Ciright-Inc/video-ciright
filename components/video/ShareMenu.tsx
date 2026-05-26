"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getWatchUrl,
  openShareWindow,
  SHARE_CHANNELS,
  type ShareChannel,
} from "@/lib/share";

const PANEL_WIDTH = 340;
const GAP = 8;

const sharePanelClass =
  "overflow-hidden rounded-xl border border-border/80 bg-card font-sans shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] dark:shadow-[0_12px_48px_rgba(0,0,0,0.5)] dark:ring-white/[0.06]";

type SharePlacement = "above" | "below";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function panelVariants(placement: SharePlacement) {
  const slideY = placement === "above" ? 10 : -10;
  const exitY = placement === "above" ? 8 : -8;
  return {
    hidden: { opacity: 0, scale: 0.92, y: slideY },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 26,
        mass: 0.82,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: exitY,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    },
  };
}

const channelGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.06, duration: 0.22, ease: [0.23, 1, 0.32, 1] as const },
  },
};

interface ShareMenuProps {
  videoId: string;
  title: string;
}

export function ShareMenu({ videoId, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const mounted = useIsMounted();
  const shareUrl = useMemo(
    () =>
      mounted ? getWatchUrl(videoId, window.location.origin) : "",
    [mounted, videoId]
  );
  const hasNativeShare =
    mounted && typeof navigator.share === "function";
  const [copied, setCopied] = useState(false);
  const [placement, setPlacement] = useState<SharePlacement>("above");
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ visibility: "hidden" });

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
    const height = panelRect.height || 320;

    let left = rect.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceAbove >= height + GAP || spaceAbove > spaceBelow;
    setPlacement(openAbove ? "above" : "below");

    if (openAbove) {
      setPanelStyle({
        position: "fixed",
        top: Math.max(GAP, rect.top - GAP - height),
        left,
        width,
        zIndex: 10000,
        visibility: "visible",
      });
    } else {
      setPanelStyle({
        position: "fixed",
        top: Math.min(window.innerHeight - height - GAP, rect.bottom + GAP),
        left,
        width,
        zIndex: 10000,
        visibility: "visible",
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const raf = requestAnimationFrame(updatePanelPosition);
    return () => cancelAnimationFrame(raf);
  }, [open, updatePanelPosition, hasNativeShare]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onReposition() {
      updatePanelPosition();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePanelPosition]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [shareUrl]);

  const shareToChannel = useCallback(
    (channel: ShareChannel) => {
      if (!shareUrl) return;
      openShareWindow(channel.getShareUrl({ url: shareUrl, title }));
      setOpen(false);
    },
    [shareUrl, title]
  );

  const shareNative = useCallback(async () => {
    if (!shareUrl || typeof navigator.share !== "function") return;
    try {
      await navigator.share({ title, url: shareUrl });
      setOpen(false);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Could not open share options");
      }
    }
  }, [shareUrl, title]);

  const portal =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close share menu"
              className="fixed inset-0 z-[9999] cursor-default bg-black/20 backdrop-blur-[1px]"
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={reducedMotion ? undefined : backdropVariants}
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="menu"
              aria-label="Share video"
              style={{
                ...panelStyle,
                transformOrigin: placement === "above" ? "bottom right" : "top right",
              }}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={reducedMotion ? undefined : panelVariants(placement)}
              className={sharePanelClass}
            >
              <p className="px-4 pt-3 text-sm font-semibold text-ink">Share</p>

              <div className="flex flex-col gap-2 px-4 py-3">
                <label
                  htmlFor={`share-link-${videoId}`}
                  className="text-xs text-muted-foreground"
                >
                  Video link
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Link2
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      id={`share-link-${videoId}`}
                      type="text"
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.target.select()}
                      className="h-9 w-full truncate rounded-lg border border-border bg-surface-soft pr-3 pl-8 text-xs text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void copyLink()}
                    className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {copied ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      <Copy className="size-4" aria-hidden />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <motion.div
                className="border-t border-border px-4 py-3"
                variants={reducedMotion ? undefined : channelGridVariants}
                initial={reducedMotion ? false : "hidden"}
                animate="visible"
              >
                <p className="mb-2 text-xs text-muted-foreground">Share via</p>
                <div className="grid grid-cols-4 gap-2">
                  {SHARE_CHANNELS.map((channel) => (
                    <ShareChannelButton
                      key={channel.id}
                      channel={channel}
                      onClick={() => shareToChannel(channel)}
                    />
                  ))}
                </div>
              </motion.div>

              {hasNativeShare && (
                <div className="border-t border-border px-4 py-2">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void shareNative()}
                    className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-ink transition-colors hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Share2 className="size-4 text-muted-foreground" aria-hidden />
                    More apps…
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Share"
        aria-expanded={open}
        aria-haspopup="menu"
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={cn(
          "flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-surface-soft px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:size-10 max-sm:rounded-full max-sm:p-0",
          open && "bg-surface-strong"
        )}
      >
        <Share2 className="size-5 shrink-0" aria-hidden />
        <span className="sr-only sm:hidden">Share</span>
        <span className="hidden sm:inline">Share</span>
      </motion.button>

      {portal}
    </div>
  );
}

function ShareChannelButton({
  channel,
  onClick,
}: {
  channel: ShareChannel;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition-colors hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          channelIconClass[channel.id]
        )}
      >
        <ChannelIcon id={channel.id} />
      </span>
      <span className="max-w-full truncate text-[11px] font-medium text-ink">
        {channel.label}
      </span>
    </button>
  );
}

const channelIconClass: Record<string, string> = {
  whatsapp: "bg-[#25D366]/15 text-[#128C7E]",
  gmail: "bg-[#EA4335]/12 text-[#C5221F]",
  facebook: "bg-[#1877F2]/12 text-[#1877F2]",
  x: "bg-foreground/8 text-ink",
  linkedin: "bg-[#0A66C2]/12 text-[#0A66C2]",
  telegram: "bg-[#26A5E4]/12 text-[#229ED9]",
  reddit: "bg-[#FF4500]/12 text-[#FF4500]",
};

function ChannelIcon({ id }: { id: string }) {
  const className = "size-5";
  switch (id) {
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "gmail":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.28 24 3.434 24 5.457z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "telegram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "reddit":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.03 4.87-6.77 4.87-3.74 0-6.77-2.176-6.77-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.188.342.342 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
    default:
      return <Share2 className={className} aria-hidden />;
  }
}
