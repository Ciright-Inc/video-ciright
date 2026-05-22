import { ChannelGeoMetric } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { countryForGeoEvent } from "@/lib/geo/countryForGeoEvent";
import { isMissingChannelGeoEventTableError } from "@/lib/prisma-errors";

export async function recordChannelGeoEvent(
  request: Request,
  channelId: string,
  metric: ChannelGeoMetric,
  userId?: string | null
): Promise<void> {
  const countryCode = await countryForGeoEvent(request, userId);
  if (countryCode === "XX") return;

  try {
    await prisma.channelGeoEvent.create({
      data: { channelId, countryCode, metric },
    });
  } catch (error) {
    if (isMissingChannelGeoEventTableError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[geo-analytics] ChannelGeoEvent table missing — run migration or: npx prisma db push"
        );
      }
      return;
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[geo-analytics] failed to record event:", error);
    }
  }
}
