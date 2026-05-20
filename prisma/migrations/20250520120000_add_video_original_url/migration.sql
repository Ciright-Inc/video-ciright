-- Run as the table owner (usually `postgres`) if `prisma db push` fails with "must be owner of table Video":
--   psql "$DATABASE_URL" -c 'ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "originalUrl" TEXT;'
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "originalUrl" TEXT;
