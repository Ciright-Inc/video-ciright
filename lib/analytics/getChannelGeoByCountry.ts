import { ChannelGeoMetric } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMissingChannelGeoEventTableError } from "@/lib/prisma-errors";

export type GeoCountryCount = { countryCode: string; count: number };

export type GeoMetricKey = "views" | "likes" | "dislikes" | "viewers" | "subscribers";

const METRIC_MAP: Record<GeoMetricKey, ChannelGeoMetric> = {
  views: ChannelGeoMetric.VIEW,
  likes: ChannelGeoMetric.LIKE,
  dislikes: ChannelGeoMetric.DISLIKE,
  viewers: ChannelGeoMetric.WATCH,
  subscribers: ChannelGeoMetric.SUBSCRIBE,
};

export const GEO_METRIC_KEYS = Object.keys(METRIC_MAP) as GeoMetricKey[];

export type GeoByMetric = Record<GeoMetricKey, GeoCountryCount[]>;

const EMPTY_GEO: GeoByMetric = {
  views: [],
  likes: [],
  dislikes: [],
  viewers: [],
  subscribers: [],
};

export async function getChannelGeoByCountry(channelId: string): Promise<GeoByMetric> {
  try {
    const rows = await prisma.channelGeoEvent.groupBy({
      by: ["metric", "countryCode"],
      where: { channelId },
      _count: { _all: true },
    });

    const result = { ...EMPTY_GEO };

    for (const key of GEO_METRIC_KEYS) {
      const metric = METRIC_MAP[key];
      result[key] = rows
        .filter((r) => r.metric === metric && r.countryCode !== "XX")
        .map((r) => ({
          countryCode: r.countryCode,
          count: r._count._all,
        }))
        .sort((a, b) => b.count - a.count);
    }

    return result;
  } catch (error) {
    if (isMissingChannelGeoEventTableError(error)) {
      return { ...EMPTY_GEO };
    }
    throw error;
  }
}
