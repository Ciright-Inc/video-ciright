"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
}

const SEEK_STEP = 10;
const CONTROLS_HIDE_MS = 3000;
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function formatPlaybackSpeed(rate: number) {
  return rate === 1 ? "1x" : `${rate}x`;
}

type SeekFlash = { side: "left" | "right"; seconds: number; id: number };
type SourceStatus = "loading" | "ready" | "error";

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const loadIdRef = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef(0);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const [sourceStatus, setSourceStatus] = useState<SourceStatus>(
    src ? "loading" : "error"
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seekFlashes, setSeekFlashes] = useState<SeekFlash[]>([]);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, CONTROLS_HIDE_MS);
  }, []);

  const flashSeek = useCallback((side: "left" | "right", seconds: number) => {
    const id = Date.now();
    setSeekFlashes((prev) => [...prev, { side, seconds, id }]);
    setTimeout(() => {
      setSeekFlashes((prev) => prev.filter((f) => f.id !== id));
    }, 700);
  }, []);

  const seekBy = useCallback(
    (delta: number, side?: "left" | "right") => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
      video.currentTime = next;
      if (side) flashSeek(side, Math.abs(delta));
      revealControls();
    },
    [flashSeek, revealControls]
  );

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || sourceStatus !== "ready") return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      setSourceStatus("error");
    }
    revealControls();
  }, [revealControls, sourceStatus]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    revealControls();
  }, [revealControls]);

  const setSpeed = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (video) video.playbackRate = rate;
      setPlaybackRate(rate);
      setSpeedMenuOpen(false);
      revealControls();
    },
    [revealControls]
  );

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
    revealControls();
  }, [revealControls]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const video = videoRef.current;
      const bar = progressRef.current;
      if (!video || !bar || !video.duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      video.currentTime = ratio * video.duration;
      revealControls();
    },
    [revealControls]
  );

  const handleSurfaceClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeft = x < rect.width / 2;
      const now = Date.now();

      if (now - lastClickRef.current < 300) {
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        seekBy(isLeft ? -SEEK_STEP : SEEK_STEP, isLeft ? "left" : "right");
        lastClickRef.current = 0;
        return;
      }

      lastClickRef.current = now;
      clickTimerRef.current = setTimeout(() => {
        togglePlay();
        clickTimerRef.current = null;
      }, 280);
    },
    [seekBy, togglePlay]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src?.trim()) {
      setSourceStatus("error");
      return;
    }

    const loadId = ++loadIdRef.current;
    setSourceStatus("loading");
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const isCurrent = () => loadIdRef.current === loadId;

    const markReady = () => {
      if (isCurrent()) setSourceStatus("ready");
    };

    const markError = () => {
      if (isCurrent()) setSourceStatus("error");
    };

    const isHls = /\.m3u8($|\?)/i.test(src);

    if (isHls) {
      void import("hls.js").then(({ default: Hls }) => {
        if (!isCurrent()) return;

        if (Hls.isSupported()) {
          hlsRef.current?.destroy();
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, markReady);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) markError();
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", markReady, { once: true });
          video.addEventListener("error", markError, { once: true });
        } else {
          markError();
        }
      });
    } else {
      const onCanPlay = () => markReady();
      const onError = () => markError();

      video.src = src;
      video.load();
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("error", onError);

      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        markReady();
      }

      return () => {
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("error", onError);
        video.pause();
      };
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      setShowControls(true);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const end = video.buffered.end(video.buffered.length - 1);
        setBuffered((end / (video.duration || 1)) * 100);
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "j":
          e.preventDefault();
          seekBy(-SEEK_STEP);
          break;
        case "l":
          e.preventDefault();
          seekBy(SEEK_STEP);
          break;
        case "arrowleft":
          e.preventDefault();
          seekBy(e.shiftKey ? -5 : -SEEK_STEP);
          break;
        case "arrowright":
          e.preventDefault();
          seekBy(e.shiftKey ? 5 : SEEK_STEP);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          void toggleFullscreen();
          break;
        case "arrowup":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [seekBy, toggleFullscreen, toggleMute, togglePlay]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!speedMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        speedMenuRef.current &&
        !speedMenuRef.current.contains(e.target as Node)
      ) {
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [speedMenuOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = playbackRate;
  }, [playbackRate, src]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group/player relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-surface-dark"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        className="h-full w-full cursor-pointer"
        onClick={handleSurfaceClick}
      />

      {sourceStatus === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface-dark/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-on-dark/30 border-t-on-dark" />
        </div>
      )}

      {sourceStatus === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-dark/90 px-4 text-center">
          <p className="text-sm font-medium text-on-dark">Unable to play this video</p>
          <p className="text-xs text-on-dark-soft">
            The format may be unsupported or the source is unavailable.
          </p>
        </div>
      )}

      {seekFlashes.map((flash) => (
        <div
          key={flash.id}
          className={cn(
            "pointer-events-none absolute inset-y-0 flex w-1/2 items-center justify-center",
            flash.side === "left" ? "left-0" : "right-0",
            "opacity-90"
          )}
        >
          <div className="flex items-center gap-2 rounded-full bg-surface-dark/70 px-5 py-3 text-2xl font-medium text-on-dark backdrop-blur-sm">
            {flash.side === "left" ? (
              <RewindIcon />
            ) : (
              <ForwardIcon />
            )}
            <span>{flash.seconds} seconds</span>
          </div>
        </div>
      ))}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-12 transition-opacity duration-200",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="pointer-events-auto px-3 pb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={progressRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
            className="group/progress relative mb-2 h-1 cursor-pointer rounded-full bg-white/30 transition-[height] hover:h-1.5"
            onClick={handleProgressClick}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") seekBy(-5);
              if (e.key === "ArrowRight") seekBy(5);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/40"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover/progress:opacity-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          <div className="flex items-center gap-2 text-on-dark">
            <button
              type="button"
              onClick={() => void togglePlay()}
              disabled={sourceStatus !== "ready"}
              className="rounded-full p-1.5 hover:bg-white/10 disabled:opacity-40"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-1.5 hover:bg-white/10"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                const video = videoRef.current;
                if (!video) return;
                video.volume = v;
                video.muted = v === 0;
              }}
              style={
                {
                  "--volume-percent": `${(muted ? 0 : volume) * 100}%`,
                } as React.CSSProperties
              }
              className="player-volume hidden w-20 sm:block"
              aria-label="Volume"
            />

            <span className="ml-1 text-xs tabular-nums">
              {formatDuration(Math.floor(currentTime))} /{" "}
              {formatDuration(Math.floor(duration))}
            </span>

            <span className="flex-1" />

            <PlaybackSpeedMenu
              ref={speedMenuRef}
              open={speedMenuOpen}
              playbackRate={playbackRate}
              disabled={sourceStatus !== "ready"}
              onToggle={() => setSpeedMenuOpen((o) => !o)}
              onSelect={setSpeed}
            />

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="rounded-full p-1.5 hover:bg-white/10"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </div>
      </div>

      {!playing && sourceStatus === "ready" && (
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-dark/60 text-on-dark backdrop-blur-sm transition-transform hover:scale-105"
          aria-label="Play"
        >
          <PlayIcon className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}

const PlaybackSpeedMenu = forwardRef<
  HTMLDivElement,
  {
    open: boolean;
    playbackRate: number;
    disabled?: boolean;
    onToggle: () => void;
    onSelect: (rate: number) => void;
  }
>(function PlaybackSpeedMenu(
  { open, playbackRate, disabled, onToggle, onSelect },
  ref
) {
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "min-w-9 rounded-full px-2 py-1.5 text-xs font-medium tabular-nums transition-colors duration-200",
          "hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark",
          "disabled:opacity-40",
          open && "bg-white/15"
        )}
        aria-label="Playback speed"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {formatPlaybackSpeed(playbackRate)}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Playback speed"
          className="absolute bottom-full right-0 mb-2 min-w-22 overflow-hidden rounded-md border border-hairline bg-canvas py-1 text-ink shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
        >
          {PLAYBACK_SPEEDS.map((rate) => {
            const selected = rate === playbackRate;
            return (
              <li key={rate} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onSelect(rate)}
                  className={cn(
                    "block min-h-9 w-full px-3 py-2 text-left text-xs tabular-nums text-ink transition-colors duration-150",
                    "hover:bg-surface-strong focus-visible:bg-surface-strong focus-visible:outline-none",
                    selected && "bg-surface-soft font-semibold"
                  )}
                >
                  {rate === 1 ? "Normal" : formatPlaybackSpeed(rate)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
  );
}

function RewindIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
    </svg>
  );
}
