-- Idempotent repair for legacy DBs (app user may lack CREATE on public).
-- Full setup (grant + migrate): npm run db:setup-notifications
-- Migrate only (after grant): npm run db:migrate-notifications

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM (
    'VIDEO_LIKE',
    'VIDEO_DISLIKE',
    'COMMENT_LIKE',
    'COMMENT_DISLIKE',
    'COMMENT_REPLY',
    'SUBSCRIPTION_NEW_VIDEO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "readAt" TIMESTAMP(3),
    "actorCount" INTEGER NOT NULL DEFAULT 1,
    "latestActorId" TEXT,
    "videoId" TEXT,
    "commentId" TEXT,
    "channelId" TEXT,
    "targetVideoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NotificationActor" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,

    CONSTRAINT "NotificationActor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommentLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_recipientId_readAt_updatedAt_idx"
  ON "Notification"("recipientId", "readAt", "updatedAt" DESC);

CREATE INDEX IF NOT EXISTS "Notification_recipientId_type_videoId_idx"
  ON "Notification"("recipientId", "type", "videoId");

CREATE INDEX IF NOT EXISTS "Notification_recipientId_type_commentId_idx"
  ON "Notification"("recipientId", "type", "commentId");

CREATE INDEX IF NOT EXISTS "Notification_recipientId_type_channelId_idx"
  ON "Notification"("recipientId", "type", "channelId");

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationActor_notificationId_actorId_key"
  ON "NotificationActor"("notificationId", "actorId");

CREATE UNIQUE INDEX IF NOT EXISTS "CommentLike_userId_commentId_key"
  ON "CommentLike"("userId", "commentId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_recipientId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey"
      FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_latestActorId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_latestActorId_fkey"
      FOREIGN KEY ("latestActorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_videoId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_videoId_fkey"
      FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_commentId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey"
      FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_channelId_fkey') THEN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_channelId_fkey"
      FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'NotificationActor_notificationId_fkey') THEN
    ALTER TABLE "NotificationActor" ADD CONSTRAINT "NotificationActor_notificationId_fkey"
      FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'NotificationActor_actorId_fkey') THEN
    ALTER TABLE "NotificationActor" ADD CONSTRAINT "NotificationActor_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CommentLike_userId_fkey') THEN
    ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CommentLike_commentId_fkey') THEN
    ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey"
      FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
