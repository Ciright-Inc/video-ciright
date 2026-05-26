"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  EyeIcon,
  GlobeIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CountryFlag } from "@/components/geo/CountryFlag";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";
import type { Topology } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { alpha2ToNumeric } from "@/lib/geo/alpha2ToNumeric";
import type { GeoByMetric, GeoMetricKey } from "@/lib/analytics/getChannelGeoByCountry";

const GEO_URL = "/geo/countries-110m.json";
/** Max rows shown in the sidebar; list scrolls if layout height is exceeded. */
const TOP_COUNTRIES_LIMIT = 8;

function clampTooltipPosition(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
) {
  const pad = 8;
  const offsetX = 14;
  const tooltipWidth = 200;
  const tooltipHeight = 40;

  const left = Math.min(
    Math.max(x + offsetX, pad),
    Math.max(pad, containerWidth - tooltipWidth - pad)
  );
  const top = Math.min(
    Math.max(y - tooltipHeight - 10, pad),
    Math.max(pad, containerHeight - tooltipHeight - pad)
  );

  return { left, top };
}

const METRIC_OPTIONS: {
  value: GeoMetricKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "views", label: "Views", icon: EyeIcon },
  { value: "likes", label: "Likes", icon: ThumbsUpIcon },
  { value: "dislikes", label: "Dislikes", icon: ThumbsDownIcon },
  { value: "viewers", label: "Viewers", icon: UsersIcon },
  { value: "subscribers", label: "Subscribers", icon: UserPlusIcon },
];

function getMetricOption(value: string | null | undefined) {
  return METRIC_OPTIONS.find((option) => option.value === value);
}

function MetricOptionLabel({
  icon: Icon,
  label,
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary [&_svg]:size-3.5",
          compact ? "size-7" : "size-8"
        )}
      >
        <Icon />
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
    </span>
  );
}

function geographyNumericId(geo: Feature<Geometry>): string {
  const raw = geo.id;
  if (raw == null || raw === "") return "";
  const s = String(raw);
  return /^\d+$/.test(s) ? s.padStart(3, "0") : s;
}

function buildCountByNumericId(
  rows: { countryCode: string; count: number }[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const numericId = alpha2ToNumeric(row.countryCode);
    if (!numericId) continue;
    map.set(numericId, (map.get(numericId) ?? 0) + row.count);
  }
  return map;
}

function countryFill(count: number, max: number): string {
  if (max <= 0 || count <= 0) return "var(--color-border)";
  const mix = Math.round((0.35 + (count / max) * 0.65) * 100);
  return `color-mix(in srgb, var(--color-primary) ${mix}%, var(--color-border))`;
}

function resolveCountryLabel(
  countryCode: string,
  countryNames: Intl.DisplayNames
): string {
  if (countryCode === "XX") return "Unknown";
  return countryNames.of(countryCode) ?? countryCode;
}

const topCountryListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const topCountryItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const },
  },
  exit: {
    opacity: 0,
    x: 8,
    transition: { duration: 0.16, ease: "easeIn" as const },
  },
};

const topCountriesPanelVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.16, ease: "easeIn" as const },
  },
};

type TopCountriesPanelProps = {
  countries: { countryCode: string; count: number }[];
  totalCount: number;
  metricLabel: string;
  countryNames: Intl.DisplayNames;
};

function TopCountriesPanel({
  countries,
  totalCount,
  metricLabel,
  countryNames,
}: TopCountriesPanelProps) {
  const reducedMotion = useReducedMotion();
  const metricKey = metricLabel.toLowerCase();

  if (totalCount === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/80 bg-surface-soft/50 px-4 py-8 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <GlobeIcon className="size-5" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink">
            No {metricKey} by country yet
          </p>
          <p className="text-xs leading-relaxed text-secondary-foreground">
            Data appears as viewers interact with your channel.
          </p>
        </div>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <ul className="flex flex-col gap-2">
        {countries.map((row) => {
          const label = resolveCountryLabel(row.countryCode, countryNames);
          const share =
            totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;

          return (
            <li
              key={row.countryCode}
              className="rounded-lg border border-border/70 bg-surface-soft/60 p-2.5 shadow-sm"
            >
              <TopCountryRow
                countryCode={row.countryCode}
                label={label}
                count={row.count}
                share={share}
                animateBar={false}
                index={0}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <motion.ul
      className="flex flex-col gap-2"
      variants={topCountryListVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {countries.map((row, index) => {
        const label = resolveCountryLabel(row.countryCode, countryNames);
        const share =
          totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;

        return (
          <motion.li
            key={row.countryCode}
            className="rounded-lg border border-border/70 bg-surface-soft/60 p-2.5 shadow-sm"
            variants={topCountryItemVariants}
            layout="position"
          >
            <TopCountryRow
              countryCode={row.countryCode}
              label={label}
              count={row.count}
              share={share}
              animateBar
              index={index}
            />
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

function TopCountryRow({
  countryCode,
  label,
  count,
  share,
  animateBar,
  index,
}: {
  countryCode: string;
  label: string;
  count: number;
  share: number;
  animateBar: boolean;
  index: number;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface"
        aria-hidden
      >
        <CountryFlag code={countryCode} size="md" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium leading-snug text-ink">
            {label}
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-semibold tabular-nums text-ink">
              {count.toLocaleString()}
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {share}%
            </span>
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/70"
          role="presentation"
          aria-hidden
        >
          {animateBar ? (
            <motion.div
              className="h-full rounded-full bg-primary/75"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: share / 100 }}
              transition={{
                delay: index * 0.045 + 0.1,
                duration: 0.35,
                ease: [0.23, 1, 0.32, 1],
              }}
              style={{ transformOrigin: "left center", width: "100%" }}
            />
          ) : (
            <div
              className="h-full rounded-full bg-primary/75"
              style={{ width: `${share}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileGeoMap({ geoByMetric }: { geoByMetric: GeoByMetric }) {
  const reducedMotion = useReducedMotion();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [metric, setMetric] = useState<GeoMetricKey>("views");
  const [hovered, setHovered] = useState<{
    id: string;
    name: string | null;
    x: number;
    y: number;
  } | null>(null);
  const [topology, setTopology] = useState<Topology | null>(null);

  const countryNames = useMemo(
    () => new Intl.DisplayNames(["en"], { type: "region" }),
    []
  );

  const rows = geoByMetric[metric];
  const countById = useMemo(() => buildCountByNumericId(rows), [rows]);
  const maxCount = useMemo(
    () => Math.max(0, ...Array.from(countById.values())),
    [countById]
  );
  const totalCount = useMemo(
    () => rows.reduce((sum, r) => sum + r.count, 0),
    [rows]
  );
  const topCountries = rows.slice(0, TOP_COUNTRIES_LIMIT);

  const selectedMetric = getMetricOption(metric);
  const metricLabel = selectedMetric?.label ?? metric;

  useEffect(() => {
    void fetch(GEO_URL)
      .then((r) => r.json())
      .then((data: Topology) => setTopology(data))
      .catch(() => setTopology(null));
  }, []);

  const updateTooltipFromEvent = useCallback(
    (event: ReactMouseEvent, id: string, name: string | null) => {
      const rect = mapContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { left, top } = clampTooltipPosition(
        x,
        y,
        rect.width,
        rect.height
      );

      setHovered({ id, name, x: left, y: top });
    },
    []
  );

  const hoveredCount = hovered ? (countById.get(hovered.id) ?? 0) : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Audience by country</h2>
          <p className="mt-0.5 text-xs text-secondary-foreground">
            Countries are shaded by activity (profile country; anonymous viewers
            estimated from IP). Darker = more {metricLabel.toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            id="geo-metric-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Metric
          </span>
          <Select
            value={metric}
            onValueChange={(v) => v && setMetric(v as GeoMetricKey)}
          >
            <SelectTrigger
              aria-labelledby="geo-metric-label"
              className="h-10 min-h-10 min-w-46 gap-2 border-border/70 bg-surface-soft/70 px-3 shadow-none hover:bg-surface-soft data-popup-open:bg-surface-soft data-[size=default]:h-10 dark:bg-input/20"
            >
              <SelectValue placeholder="Choose metric">
                {selectedMetric ? (
                  <MetricOptionLabel
                    icon={selectedMetric.icon}
                    label={selectedMetric.label}
                    compact
                  />
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="end"
              alignItemWithTrigger={false}
              sideOffset={6}
              className="min-w-52 p-1"
            >
              {METRIC_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="min-h-10 py-2 pr-9 pl-1.5"
                >
                  <MetricOptionLabel icon={opt.icon} label={opt.label} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(240px,280px)] lg:items-start">
        <div
          ref={mapContainerRef}
          className="relative min-h-[280px] w-full min-w-0"
        >
          {!topology ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading map…
            </div>
          ) : (
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{ scale: 140 }}
              className="h-auto w-full"
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={topology}>
                {({ geographies }) =>
                  geographies.map((geo, index) => {
                    const id = geographyNumericId(geo);
                    const count = countById.get(id) ?? 0;
                    const isHovered = hovered?.id === id;
                    const name =
                      (geo.properties?.name as string | undefined) ?? null;
                    return (
                      <Geography
                        key={`${id}-${index}`}
                        geography={geo}
                        onMouseEnter={(event) =>
                          updateTooltipFromEvent(event, id, name)
                        }
                        onMouseMove={(event) =>
                          updateTooltipFromEvent(event, id, name)
                        }
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          default: {
                            fill: countryFill(count, maxCount),
                            stroke: "var(--color-canvas)",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: id ? "pointer" : "default",
                          },
                          hover: {
                            fill:
                              count > 0
                                ? "var(--color-primary)"
                                : "color-mix(in srgb, var(--color-primary) 30%, var(--color-border))",
                            stroke: "var(--color-primary)",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          pressed: { outline: "none" },
                        }}
                        className={cn(
                          "transition-[fill,stroke] duration-150 motion-reduce:transition-none",
                          isHovered && "brightness-110"
                        )}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          )}

          {totalCount > 0 && (
            <div
              className="mt-2 flex items-center gap-2 text-[10px] text-secondary-foreground"
              aria-hidden
            >
              <span>Less</span>
              <div
                className="h-2 max-w-[140px] flex-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--color-border), var(--color-primary))",
                }}
              />
              <span>More</span>
            </div>
          )}

          {hovered?.name != null && hoveredCount != null && (
            <div
              className="pointer-events-none absolute z-10 max-w-[200px] rounded-md border border-border/80 bg-white px-2.5 py-1.5 text-xs text-ink shadow-lg ring-1 ring-black/5 dark:border-border dark:bg-white dark:text-zinc-900"
              role="status"
              style={{ left: hovered.x, top: hovered.y }}
            >
              <span className="font-medium">{hovered.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {hoveredCount.toLocaleString()} {metricLabel.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <aside className="flex min-h-0 min-w-0 flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[min(32rem,calc(100dvh-7rem))]">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Top countries</p>
            {totalCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium tabular-nums text-primary">
                {topCountries.length}
                {rows.length > topCountries.length
                  ? ` of ${rows.length}`
                  : ""}
              </span>
            )}
          </div>
          <div
            className={cn(
              "min-h-0",
              totalCount > 0 &&
                "lg:overflow-y-auto lg:overscroll-contain lg:pr-0.5 lg:scrollbar-gutter-stable"
            )}
          >
            {reducedMotion ? (
              <TopCountriesPanel
                countries={topCountries}
                totalCount={totalCount}
                metricLabel={metricLabel}
                countryNames={countryNames}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={metric}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={topCountriesPanelVariants}
                >
                  <TopCountriesPanel
                    countries={topCountries}
                    totalCount={totalCount}
                    metricLabel={metricLabel}
                    countryNames={countryNames}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
