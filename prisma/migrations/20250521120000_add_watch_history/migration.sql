-- WatchHistory exists in init migration; run this if the DB was created via db push without it.
-- Run as the table owner (usually postgres): npm run db:migrate-watch-history
CREATE TABLE IF NOT EXISTS "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WatchHistory_userId_watchedAt_idx" ON "WatchHistory"("userId", "watchedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "WatchHistory_userId_videoId_key" ON "WatchHistory"("userId", "videoId");

ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
