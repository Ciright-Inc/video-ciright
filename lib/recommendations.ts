import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RecommendedVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  createdAt: Date;
  channelId: string;
  channelName: string;
  channelHandle: string;
  score: number;
};

const W = {
  TAG_WATCH: 1,
  TAG_LIKE: 2,
  TAG_SAVE: 3,
  TAG_DISLIKE: -3,
  CHANNEL_WATCH: 1,
  SUBSCRIPTION: 15,
  FRESHNESS_MAX: 8,
  WATCHED_PENALTY: -40,
  DISLIKE_PENALTY: -80,
  SHARED_TAG: 4,
  SAME_CHANNEL: 6,
  POPULARITY_LOG: 2,
} as const;

type RecommendedVideoRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  createdAt: Date;
  channelId: string;
  channelName: string;
  channelHandle: string;
  score: number;
};

function mapRow(row: RecommendedVideoRow): RecommendedVideo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    thumbnailUrl: row.thumbnailUrl,
    duration: row.duration,
    views: row.views,
    createdAt: row.createdAt,
    channelId: row.channelId,
    channelName: row.channelName,
    channelHandle: row.channelHandle,
    score: Number(row.score),
  };
}

async function _getHomeFeed(
  userId: string,
  limit: number,
  offset: number
): Promise<RecommendedVideo[]> {
  const rows = await prisma.$queryRaw<RecommendedVideoRow[]>`
    WITH
    user_tag_scores AS (
      SELECT
        vt."tagId",
        SUM(
          ${W.TAG_WATCH}
          + COALESCE(
              CASE WHEN l."value" = 1 THEN ${W.TAG_LIKE}
                   WHEN l."value" = -1 THEN ${W.TAG_DISLIKE}
                   ELSE 0 END,
              0)
          + CASE WHEN sv."videoId" IS NOT NULL THEN ${W.TAG_SAVE} ELSE 0 END
        )::FLOAT AS tag_score
      FROM "WatchHistory" wh
      JOIN "VideoTag" vt ON vt."videoId" = wh."videoId"
      LEFT JOIN "Like" l ON l."userId" = wh."userId" AND l."videoId" = wh."videoId"
      LEFT JOIN "SavedVideo" sv ON sv."userId" = wh."userId" AND sv."videoId" = wh."videoId"
      WHERE wh."userId" = ${userId}
      GROUP BY vt."tagId"
    ),
    user_channel_scores AS (
      SELECT v2."channelId", COUNT(*)::FLOAT AS channel_score
      FROM "WatchHistory" wh
      JOIN "Video" v2 ON v2."id" = wh."videoId"
      WHERE wh."userId" = ${userId}
      GROUP BY v2."channelId"
    ),
    scored AS (
      SELECT
        v."id", v."title", v."description", v."thumbnailUrl", v."duration",
        v."views", v."createdAt", v."channelId",
        c."name" AS "channelName", c."handle" AS "channelHandle",
        (
          COALESCE((
            SELECT SUM(uts."tag_score")
            FROM "VideoTag" vt2
            JOIN user_tag_scores uts ON uts."tagId" = vt2."tagId"
            WHERE vt2."videoId" = v."id"
          ), 0)
          + COALESCE((
            SELECT ucs."channel_score" * ${W.CHANNEL_WATCH}
            FROM user_channel_scores ucs
            WHERE ucs."channelId" = v."channelId"
          ), 0)
          + CASE
              WHEN EXISTS (
                SELECT 1 FROM "Subscription" s
                WHERE s."subscriberId" = ${userId} AND s."channelId" = v."channelId"
              ) THEN ${W.SUBSCRIPTION}
              ELSE 0
            END
          + GREATEST(0,
              ${W.FRESHNESS_MAX}::FLOAT
              * (1 - EXTRACT(EPOCH FROM (NOW() - v."createdAt")) / (30.0 * 86400))
            )
          + CASE
              WHEN EXISTS (
                SELECT 1 FROM "WatchHistory" wh2
                WHERE wh2."userId" = ${userId} AND wh2."videoId" = v."id"
              ) THEN ${W.WATCHED_PENALTY}
              ELSE 0
            END
          + CASE
              WHEN EXISTS (
                SELECT 1 FROM "Like" l2
                WHERE l2."userId" = ${userId} AND l2."videoId" = v."id" AND l2."value" = -1
              ) THEN ${W.DISLIKE_PENALTY}
              ELSE 0
            END
        )::FLOAT AS score
      FROM "Video" v
      JOIN "Channel" c ON c."id" = v."channelId"
      WHERE v."status" = 'READY' AND v."visibility" = 'PUBLIC'
    )
    SELECT * FROM scored ORDER BY score DESC LIMIT ${limit} OFFSET ${offset}
  `;

  return rows.map(mapRow);
}

async function _getRelatedVideosAnon(
  videoId: string,
  limit: number
): Promise<RecommendedVideo[]> {
  const rows = await prisma.$queryRaw<RecommendedVideoRow[]>`
    WITH
    source_tags AS (
      SELECT "tagId" FROM "VideoTag" WHERE "videoId" = ${videoId}
    ),
    source_channel AS (
      SELECT "channelId" FROM "Video" WHERE "id" = ${videoId}
    ),
    scored AS (
      SELECT
        v."id", v."title", v."description", v."thumbnailUrl", v."duration",
        v."views", v."createdAt", v."channelId",
        c."name" AS "channelName", c."handle" AS "channelHandle",
        (
          (
            SELECT COUNT(*)::FLOAT FROM "VideoTag" vt
            WHERE vt."videoId" = v."id"
              AND vt."tagId" IN (SELECT "tagId" FROM source_tags)
          ) * ${W.SHARED_TAG}
          + CASE
              WHEN v."channelId" = (SELECT "channelId" FROM source_channel)
              THEN ${W.SAME_CHANNEL} ELSE 0
            END
          + LN(GREATEST(v."views", 1)) * ${W.POPULARITY_LOG}
        )::FLOAT AS score
      FROM "Video" v
      JOIN "Channel" c ON c."id" = v."channelId"
      WHERE v."id" != ${videoId}
        AND v."status" = 'READY'
        AND v."visibility" = 'PUBLIC'
        AND (
          v."channelId" = (SELECT "channelId" FROM source_channel)
          OR EXISTS (
            SELECT 1 FROM "VideoTag" vt2
            WHERE vt2."videoId" = v."id"
              AND vt2."tagId" IN (SELECT "tagId" FROM source_tags)
          )
        )
    )
    SELECT * FROM scored WHERE score > 0 ORDER BY score DESC LIMIT ${limit}
  `;

  return rows.map(mapRow);
}

async function _getRelatedVideosForUser(
  videoId: string,
  userId: string,
  limit: number
): Promise<RecommendedVideo[]> {
  const rows = await prisma.$queryRaw<RecommendedVideoRow[]>`
    WITH
    source_tags AS (
      SELECT "tagId" FROM "VideoTag" WHERE "videoId" = ${videoId}
    ),
    source_channel AS (
      SELECT "channelId" FROM "Video" WHERE "id" = ${videoId}
    ),
    scored AS (
      SELECT
        v."id", v."title", v."description", v."thumbnailUrl", v."duration",
        v."views", v."createdAt", v."channelId",
        c."name" AS "channelName", c."handle" AS "channelHandle",
        (
          (
            SELECT COUNT(*)::FLOAT FROM "VideoTag" vt
            WHERE vt."videoId" = v."id"
              AND vt."tagId" IN (SELECT "tagId" FROM source_tags)
          ) * ${W.SHARED_TAG}
          + CASE
              WHEN v."channelId" = (SELECT "channelId" FROM source_channel)
              THEN ${W.SAME_CHANNEL} ELSE 0
            END
          + LN(GREATEST(v."views", 1)) * ${W.POPULARITY_LOG}
          + CASE
              WHEN EXISTS (
                SELECT 1 FROM "Like" l
                WHERE l."userId" = ${userId} AND l."videoId" = v."id" AND l."value" = -1
              ) THEN ${W.DISLIKE_PENALTY}
              ELSE 0
            END
        )::FLOAT AS score
      FROM "Video" v
      JOIN "Channel" c ON c."id" = v."channelId"
      WHERE v."id" != ${videoId}
        AND v."status" = 'READY'
        AND v."visibility" = 'PUBLIC'
        AND (
          v."channelId" = (SELECT "channelId" FROM source_channel)
          OR EXISTS (
            SELECT 1 FROM "VideoTag" vt2
            WHERE vt2."videoId" = v."id"
              AND vt2."tagId" IN (SELECT "tagId" FROM source_tags)
          )
        )
    )
    SELECT * FROM scored WHERE score > 0 ORDER BY score DESC LIMIT ${limit}
  `;

  return rows.map(mapRow);
}

export function getHomeFeed(userId: string, limit = 20, offset = 0) {
  return unstable_cache(
    async () => _getHomeFeed(userId, limit, offset),
    [`home-feed-${userId}-${offset}`],
    { tags: [`user-${userId}-feed`], revalidate: 300 }
  )();
}

export function getRelatedVideos(videoId: string, userId?: string, limit = 12) {
  const cacheUserKey = userId ?? "anon";
  const cached = userId
    ? unstable_cache(
        async () => _getRelatedVideosForUser(videoId, userId, limit),
        [`related-${videoId}-${cacheUserKey}`],
        { tags: [`video-${videoId}-related`], revalidate: 600 }
      )
    : unstable_cache(
        async () => _getRelatedVideosAnon(videoId, limit),
        [`related-${videoId}-${cacheUserKey}`],
        { tags: [`video-${videoId}-related`], revalidate: 600 }
      );
  return cached();
}

export function invalidateUserFeed(userId: string) {
  revalidateTag(`user-${userId}-feed`, "default");
}

export function invalidateVideoRelated(videoId: string) {
  revalidateTag(`video-${videoId}-related`, "default");
}
