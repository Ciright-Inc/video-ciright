import {
  ChannelGeoMetric,
  PrismaClient,
  VideoStatus,
  Visibility,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { isMissingChannelGeoEventTableError } from "../lib/prisma-errors";

const prisma = new PrismaClient();

const SAMPLE_VIDEOS = [
  {
    title: "Building a YouTube Clone with Next.js 15",
    description:
      "A full walkthrough of scaffolding a video platform with App Router, Prisma, and PostgreSQL.",
    thumbnailUrl: "https://picsum.photos/seed/vid1/640/360",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: 596,
    views: 12450,
    tags: ["nextjs", "tutorial", "webdev"],
  },
  {
    title: "PostgreSQL Full-Text Search in 10 Minutes",
    description: "Learn how to add tsvector indexes and search videos by title and description.",
    thumbnailUrl: "https://picsum.photos/seed/vid2/640/360",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    duration: 653,
    views: 8320,
    tags: ["postgresql", "database"],
  },
  {
    title: "Theme Systems with CSS Variables",
    description: "Switch entire site themes from a single config file using build-time CSS generation.",
    thumbnailUrl: "https://picsum.photos/seed/vid3/640/360",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 15,
    views: 4210,
    tags: ["css", "design"],
  },
  {
    title: "NextAuth v5 Setup Guide",
    description: "Credentials and Google OAuth with the Prisma adapter in Next.js App Router.",
    thumbnailUrl: "https://picsum.photos/seed/vid4/640/360",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: 15,
    views: 15600,
    tags: ["auth", "nextjs"],
  },
  {
    title: "HLS Streaming — Phase 2 Preview",
    description: "Placeholder for future HLS transcoding pipeline. Player detects .m3u8 manifests.",
    thumbnailUrl: "https://picsum.photos/seed/vid5/640/360",
    videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    duration: 634,
    views: 2890,
    tags: ["streaming", "hls"],
    isLive: false,
  },
  {
    title: "Creator Studio Walkthrough",
    description: "Manage your videos, edit visibility, and track view counts from the studio dashboard.",
    thumbnailUrl: "https://picsum.photos/seed/vid6/640/360",
    videoUrl: "https://download.samplelib.com/mp4/sample-5s.mp4",
    duration: 60,
    views: 3100,
    tags: ["creator", "studio"],
  },
  {
    title: "Responsive Sidebar Layout Patterns",
    description: "Collapsible sidebar with mobile bottom nav using React context and CSS variables.",
    thumbnailUrl: "https://picsum.photos/seed/vid7/640/360",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 15,
    views: 1980,
    tags: ["ui", "layout"],
  },
  {
    title: "Live Chat Architecture (Coming Soon)",
    description: "Phase 3 stub — WebSocket live chat alongside the video player.",
    thumbnailUrl: "https://picsum.photos/seed/vid8/640/360",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: 15,
    views: 750,
    tags: ["websocket", "live"],
    isLive: true,
  },
];

const SEED_GEO_COUNTRIES = ["US", "GB", "IN", "BR", "DE", "JP", "CA", "AU"] as const;

const SEED_GEO_COUNTS: Record<ChannelGeoMetric, readonly number[]> = {
  [ChannelGeoMetric.VIEW]: [120, 85, 72, 48, 40, 35, 22, 18],
  [ChannelGeoMetric.LIKE]: [28, 20, 18, 12, 10, 9, 6, 5],
  [ChannelGeoMetric.DISLIKE]: [5, 3, 4, 2, 2, 1, 1, 1],
  [ChannelGeoMetric.WATCH]: [45, 32, 28, 18, 15, 14, 9, 7],
  [ChannelGeoMetric.SUBSCRIBE]: [10, 7, 8, 5, 4, 5, 3, 2],
};

async function clearGeoEventsIfPresent() {
  try {
    await prisma.channelGeoEvent.deleteMany();
  } catch (error) {
    if (!isMissingChannelGeoEventTableError(error)) {
      throw error;
    }
  }
}

async function seedGeoEvents(channelId: string) {
  const geoEvents: {
    channelId: string;
    countryCode: string;
    metric: ChannelGeoMetric;
  }[] = [];

  for (const metric of Object.values(ChannelGeoMetric)) {
    const counts = SEED_GEO_COUNTS[metric];
    SEED_GEO_COUNTRIES.forEach((countryCode, i) => {
      const n = counts[i] ?? 1;
      for (let j = 0; j < n; j++) {
        geoEvents.push({ channelId, countryCode, metric });
      }
    });
  }

  try {
    await prisma.channelGeoEvent.createMany({ data: geoEvents });
  } catch (error) {
    if (isMissingChannelGeoEventTableError(error)) {
      console.warn(
        "  Skipped geo analytics seed — run: npm run db:setup-geo-events"
      );
      return;
    }
    throw error;
  }
}

async function main() {
  await clearGeoEventsIfPresent();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.videoTag.deleteMany();
  await prisma.video.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Creator",
      countryCode: "US",
      passwordHash,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      channel: {
        create: {
          handle: "alicecreates",
          name: "Alice Creates",
          description: "Tech tutorials and web development content.",
          avatarUrl: null,
          bannerUrl: "https://picsum.photos/seed/alice-banner/1280/320",
        },
      },
    },
    include: { channel: true },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Streams",
      countryCode: "GB",
      passwordHash,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      channel: {
        create: {
          handle: "bobstreams",
          name: "Bob Streams",
          description: "Live coding and database deep dives.",
          avatarUrl: null,
          bannerUrl: "https://picsum.photos/seed/bob-banner/1280/320",
        },
      },
    },
    include: { channel: true },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      name: "Carol Design",
      countryCode: "IN",
      passwordHash,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
      channel: {
        create: {
          handle: "caroldesign",
          name: "Carol Design",
          description: "UI/UX, themes, and frontend craft.",
          avatarUrl: null,
          bannerUrl: "https://picsum.photos/seed/carol-banner/1280/320",
        },
      },
    },
    include: { channel: true },
  });

  const channels = [alice.channel!, bob.channel!, carol.channel!];

  for (let i = 0; i < SAMPLE_VIDEOS.length; i++) {
    const sample = SAMPLE_VIDEOS[i];
    const channel = channels[i % channels.length];

    const tagRecords = await Promise.all(
      sample.tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
      )
    );

    await prisma.video.create({
      data: {
        title: sample.title,
        description: sample.description,
        thumbnailUrl: sample.thumbnailUrl,
        videoUrl: sample.videoUrl,
        duration: sample.duration,
        views: sample.views,
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC,
        isLive: sample.isLive ?? false,
        channelId: channel.id,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
    });
  }

  const videos = await prisma.video.findMany();

  await prisma.subscription.create({
    data: { subscriberId: carol.id, channelId: alice.channel!.id },
  });
  await prisma.subscription.create({
    data: { subscriberId: bob.id, channelId: alice.channel!.id },
  });

  await prisma.comment.create({
    data: {
      body: "Great tutorial! Very clear explanation of the App Router patterns.",
      authorId: bob.id,
      videoId: videos[0].id,
    },
  });
  await prisma.comment.create({
    data: {
      body: "When is Phase 2 HLS streaming coming?",
      authorId: carol.id,
      videoId: videos[0].id,
    },
  });
  await prisma.comment.create({
    data: {
      body: "The tsvector approach is much faster than ILIKE for large datasets.",
      authorId: alice.id,
      videoId: videos[1].id,
    },
  });

  await prisma.like.create({ data: { userId: bob.id, videoId: videos[0].id, value: 1 } });
  await prisma.like.create({ data: { userId: carol.id, videoId: videos[0].id, value: 1 } });
  await prisma.like.create({ data: { userId: alice.id, videoId: videos[3].id, value: 1 } });
  await prisma.like.create({ data: { userId: bob.id, videoId: videos[3].id, value: -1 } });

  await seedGeoEvents(alice.channel!.id);

  console.log("Seed complete:");
  console.log("  Users: alice@example.com, bob@example.com, carol@example.com");
  console.log("  Password: password123");
  console.log(`  Videos: ${videos.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
