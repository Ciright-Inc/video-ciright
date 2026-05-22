-- Notify channel owners when new users subscribe (batched per channel).

DO $$ BEGIN
  ALTER TYPE "NotificationType" ADD VALUE 'CHANNEL_NEW_SUBSCRIBER';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
