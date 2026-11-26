-- Admin video tagger: review state + manual video→post pins.
-- Additive and non-destructive (new nullable/defaulted columns, new table).

-- AlterTable: Video review state
ALTER TABLE "Video"
  ADD COLUMN "reviewed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewNote" TEXT;

-- CreateIndex
CREATE INDEX "Video_reviewed_idx" ON "Video"("reviewed");

-- CreateTable: manual video→post pins
CREATE TABLE "VideoPost" (
  "id" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VideoPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoPost_videoId_postId_key" ON "VideoPost"("videoId", "postId");
CREATE INDEX "VideoPost_postId_idx" ON "VideoPost"("postId");
CREATE INDEX "VideoPost_videoId_idx" ON "VideoPost"("videoId");

-- AddForeignKey
ALTER TABLE "VideoPost"
  ADD CONSTRAINT "VideoPost_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoPost"
  ADD CONSTRAINT "VideoPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
