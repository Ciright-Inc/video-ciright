"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import type { Topology } from "topojson-specification";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
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

type CountryFeature = GeoJSON.Feature<Geometry, { name?: string }>;

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

function fillOpacity(count: number, max: number): number {
  if (max <= 0 || count <= 0) return 0.06;
  return 0.1 + (count / max) * 0.75;
}

function markerRadius(count: number, max: number): number {
  if (max <= 0 || count <= 0) return 0;
  return 3 + (count / max) * 14;
}

export function ProfileGeoMap({ geoByMetric }: { geoByMetric: GeoByMetric }) {
  const [metric, setMetric] = useState<GeoMetricKey>("views");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  const geoFeatures = useMemo(() => {
    if (!topology?.objects?.countries) return null;
    const collection = feature(
      topology,
      topology.objects.countries as Topology["objects"][string]
    ) as FeatureCollection;
    return collection.features as CountryFeature[];
  }, [topology]);

  const hotspots = useMemo(() => {
    if (!geoFeatures) return [];
    return geoFeatures
      .map((geo) => {
        const id = String(geo.id ?? "");
        const count = countById.get(id) ?? 0;
        if (count <= 0) return null;
        const [lng, lat] = geoCentroid(geo);
        return { id, count, coordinates: [lng, lat] as [number, number] };
      })
      .filter(Boolean) as {
      id: string;
      count: number;
      coordinates: [number, number];
    }[];
  }, [geoFeatures, countById]);

  const hoveredCount = hoveredId ? (countById.get(hoveredId) ?? 0) : null;
  const hoveredName = useMemo(() => {
    if (!hoveredId || !geoFeatures) return null;
    const geo = geoFeatures.find((g) => String(g.id) === hoveredId);
    return geo?.properties?.name ?? null;
  }, [hoveredId, geoFeatures]);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Audience by country</h2>
          <p className="mt-0.5 text-xs text-body">
            Hotspots show where your channel gets the most activity (from IP or
            CDN country headers at event time).
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
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const id = String(geo.id ?? "");
                    const count = countById.get(id) ?? 0;
                    const isHovered = hoveredId === id;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => setHoveredId(id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                          default: {
                            fill: "var(--color-border)",
                            stroke: "var(--color-canvas)",
                            strokeWidth: 0.4,
                            outline: "none",
                          },
                          hover: {
                            fill: "color-mix(in srgb, var(--color-primary) 55%, var(--color-border))",
                            stroke: "var(--color-primary)",
                            strokeWidth: 0.6,
                            outline: "none",
                          },
                          pressed: { outline: "none" },
                        }}
                        fill={
                          count > 0
                            ? `color-mix(in srgb, var(--color-primary) ${Math.round(fillOpacity(count, maxCount) * 100)}%, var(--color-border))`
                            : undefined
                        }
                        className={cn(
                          "transition-[fill] duration-150 motion-reduce:transition-none",
                          isHovered && count > 0 && "brightness-110"
                        )}
                      />
                    );
                  })
                }
              </Geographies>
              {hotspots.map(({ id, count, coordinates }) => (
                <Marker key={id} coordinates={coordinates}>
                  <circle
                    r={markerRadius(count, maxCount)}
                    fill="var(--color-primary)"
                    fillOpacity={0.55}
                    stroke="var(--color-on-primary)"
                    strokeWidth={1}
                    strokeOpacity={0.9}
                    className="pointer-events-none motion-reduce:transition-none"
                  />
                </Marker>
              ))}
            </ComposableMap>
          )}

          {hoveredName != null && hoveredCount != null && (
            <div
              className="pointer-events-none absolute bottom-2 left-2 rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-sm"
              role="status"
            >
              <span className="font-medium text-ink">{hoveredName}</span>
              <span className="text-body">
                {" "}
                · {hoveredCount.toLocaleString()} {metricLabel.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink">Top countries</p>
          {totalCount === 0 ? (
            <p className="text-xs text-body">
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
                  <span className="shrink-0 tabular-nums text-body">
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
