-- CreateEnum
CREATE TYPE "ChannelGeoMetric" AS ENUM ('VIEW', 'LIKE', 'DISLIKE', 'WATCH', 'SUBSCRIBE');

-- CreateTable
CREATE TABLE "ChannelGeoEvent" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "metric" "ChannelGeoMetric" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelGeoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChannelGeoEvent_channelId_metric_countryCode_idx" ON "ChannelGeoEvent"("channelId", "metric", "countryCode");

-- CreateIndex
CREATE INDEX "ChannelGeoEvent_channelId_createdAt_idx" ON "ChannelGeoEvent"("channelId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChannelGeoEvent" ADD CONSTRAINT "ChannelGeoEvent_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
