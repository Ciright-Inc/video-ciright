"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChannelAnalyticsData } from "@/lib/analytics/getChannelAnalyticsData";
import type { GeoByMetric } from "@/lib/analytics/getChannelGeoByCountry";
import { ProfileGeoMap } from "@/components/profile/ProfileGeoMap";

const chartTooltipProps = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid var(--color-hairline)",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  labelStyle: { color: "var(--color-ink)" },
  itemStyle: { color: "var(--color-body)" },
};

function formatDayLabel(day: string) {
  const [, month, date] = day.split("-");
  return `${month}/${date}`;
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="h-64 w-full min-w-0">{children}</div>
    </div>
  );
}

export function ProfileAnalyticsCharts({
  analytics,
  geoByMetric,
}: {
  analytics: ChannelAnalyticsData;
  geoByMetric: GeoByMetric;
}) {
  const {
    viewsByDay,
    newSubscribersByDay,
    subscriberSummary,
    topVideosByViews,
    topVideosByEngagement,
  } = analytics;

  const subscriberSubtitle =
    subscriberSummary.newInPeriod > 0
      ? `${subscriberSummary.total.toLocaleString()} total · +${subscriberSummary.newInPeriod.toLocaleString()} in last 28 days`
      : `${subscriberSummary.total.toLocaleString()} total · no new subscribers in last 28 days`;

  return (
    <div className="space-y-8">
      <ProfileGeoMap geoByMetric={geoByMetric} />

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard title="Daily views (last 28 days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickFormatter={formatDayLabel}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
              <Tooltip
                {...chartTooltipProps}
                labelFormatter={(day) => String(day)}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Views"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="New subscribers (last 28 days)"
          subtitle={subscriberSubtitle}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={newSubscribersByDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                tickFormatter={formatDayLabel}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
              <Tooltip
                {...chartTooltipProps}
                labelFormatter={(day) => String(day)}
              />
              <Bar
                dataKey="count"
                name="New subscribers"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top videos by views">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topVideosByViews} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="title"
                width={100}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(v) =>
                  String(v).length > 14 ? `${String(v).slice(0, 14)}…` : String(v)
                }
              />
              <Tooltip {...chartTooltipProps} />
              <Bar dataKey="views" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top videos by engagement">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topVideosByEngagement}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="title"
                width={100}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(v) =>
                  String(v).length > 14 ? `${String(v).slice(0, 14)}…` : String(v)
                }
              />
              <Tooltip
                {...chartTooltipProps}
                formatter={(value: number, _name, item) => {
                  const payload = item.payload as {
                    likes: number;
                    views: number;
                  };
                  return [
                    `${value}% (${payload.likes} likes / ${payload.views.toLocaleString()} views)`,
                    "Engagement",
                  ];
                }}
              />
              <Bar
                dataKey="engagementRate"
                name="Engagement"
                fill="var(--color-primary)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
