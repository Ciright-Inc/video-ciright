-- Grants for legacy app role `ciright` when notification tables are owned by ciright_video_user.
-- Safe to re-run. Run as table owner or superuser:
--   psql "$DATABASE_URL" -f scripts/db-grant-notification-tables.sql

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "Notification" TO ciright;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "NotificationActor" TO ciright;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "CommentLike" TO ciright;
