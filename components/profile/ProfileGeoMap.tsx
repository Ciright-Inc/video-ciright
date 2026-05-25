"use client";

import { useEffect, useMemo, useState } from "react";
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

const METRIC_OPTIONS: { value: GeoMetricKey; label: string }[] = [
  { value: "views", label: "Views" },
  { value: "likes", label: "Likes" },
  { value: "dislikes", label: "Dislikes" },
  { value: "viewers", label: "Viewers" },
  { value: "subscribers", label: "Subscribers" },
];

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

export function ProfileGeoMap({ geoByMetric }: { geoByMetric: GeoByMetric }) {
  const [metric, setMetric] = useState<GeoMetricKey>("views");
  const [hovered, setHovered] = useState<{
    id: string;
    name: string | null;
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
  const topCountries = rows.slice(0, 8);

  const metricLabel =
    METRIC_OPTIONS.find((o) => o.value === metric)?.label ?? metric;

  useEffect(() => {
    void fetch(GEO_URL)
      .then((r) => r.json())
      .then((data: Topology) => setTopology(data))
      .catch(() => setTopology(null));
  }, []);

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
        <Select
          value={metric}
          onValueChange={(v) => setMetric(v as GeoMetricKey)}
        >
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Metric" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {METRIC_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
        <div className="relative min-h-[280px] w-full min-w-0">
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
                        onMouseEnter={() => setHovered({ id, name })}
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
                className="h-2 flex-1 max-w-[140px] rounded-full"
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
              className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm"
              role="status"
            >
              <span className="font-medium text-ink">{hovered.name}</span>
              <span className="text-secondary-foreground">
                {" "}
                · {hoveredCount.toLocaleString()} {metricLabel.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink">Top countries</p>
          {totalCount === 0 ? (
            <p className="text-xs text-secondary-foreground">
              No {metricLabel.toLowerCase()} by country yet. Data appears as
              viewers interact with your channel.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {topCountries.map((row) => (
                <li
                  key={row.countryCode}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate text-ink">
                    {row.countryCode === "XX"
                      ? "Unknown"
                      : (countryNames.of(row.countryCode) ?? row.countryCode)}
                  </span>
                  <span className="shrink-0 tabular-nums text-secondary-foreground">
                    {row.count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
