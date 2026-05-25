-- CreateTable
CREATE TABLE "SavedVideo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedVideo_userId_videoId_key" ON "SavedVideo"("userId", "videoId");

-- CreateIndex
CREATE INDEX "SavedVideo_userId_savedAt_idx" ON "SavedVideo"("userId", "savedAt");

-- AddForeignKey
ALTER TABLE "SavedVideo" ADD CONSTRAINT "SavedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedVideo" ADD CONSTRAINT "SavedVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
