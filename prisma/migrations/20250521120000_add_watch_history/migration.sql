-- WatchHistory is created in init; this migration is idempotent for legacy DBs (db push without it).
-- Manual repair: npm run db:migrate-watch-history

CREATE TABLE IF NOT EXISTS "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WatchHistory_userId_watchedAt_idx" ON "WatchHistory"("userId", "watchedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "WatchHistory_userId_videoId_key" ON "WatchHistory"("userId", "videoId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WatchHistory_userId_fkey') THEN
    ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WatchHistory_videoId_fkey') THEN
    ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
