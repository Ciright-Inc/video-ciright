import { ChannelGeoMetric } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { countryFromRequest } from "@/lib/geo/countryFromRequest";
import { isMissingChannelGeoEventTableError } from "@/lib/prisma-errors";

export async function recordChannelGeoEvent(
  request: Request,
  channelId: string,
  metric: ChannelGeoMetric
): Promise<void> {
  const countryCode = countryFromRequest(request);
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
