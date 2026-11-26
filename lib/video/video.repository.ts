import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/** Tag-review state, derived from `reviewed` + whether any station is attached. */
export type TagState = 'untagged' | 'needs_review' | 'tagged' | 'skipped';

export interface FindManyOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  tagState?: TagState;
}

// One include → Prisma batches the relations in a single extra query each
// (no per-row N+1). Posts carry only the pin ids the detail pane needs.
const videoWithRelations = {
  stations: {
    select: {
      stationSlug: true,
      matchType: true,
      confidence: true,
    },
  },
  posts: {
    select: {
      postId: true,
      position: true,
    },
  },
};

/** Relation/where fragment for each tag-review state. */
function tagStateWhere(state: TagState): Prisma.VideoWhereInput {
  switch (state) {
    case 'untagged':
      return { reviewed: false, stations: { none: {} } };
    case 'needs_review':
      return { reviewed: false, stations: { some: {} } };
    case 'tagged':
      return { reviewed: true, stations: { some: {} } };
    case 'skipped':
      return { reviewed: true, stations: { none: {} } };
  }
}

function buildWhere({ status, search, tagState }: Pick<FindManyOptions, 'status' | 'search' | 'tagState'>) {
  const where: Prisma.VideoWhereInput = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (tagState) Object.assign(where, tagStateWhere(tagState));
  return where;
}

export async function findMany({ page, limit, status, search, tagState }: FindManyOptions) {
  const where = buildWhere({ status, search, tagState });

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: videoWithRelations,
    }),
    prisma.video.count({ where }),
  ]);
  return { videos, total };
}

/**
 * Library counts for the tagger header. Four parallel COUNTs + the last-sync
 * timestamp — constant query count regardless of library size (no N+1).
 */
export async function getStats() {
  const [total, untagged, needsReview, tagged, lastSync] = await Promise.all([
    prisma.video.count(),
    prisma.video.count({ where: tagStateWhere('untagged') }),
    prisma.video.count({ where: tagStateWhere('needs_review') }),
    prisma.video.count({ where: tagStateWhere('tagged') }),
    prisma.video.aggregate({ _max: { syncedAt: true } }),
  ]);
  return { total, untagged, needsReview, tagged, lastSyncedAt: lastSync._max.syncedAt };
}

/**
 * Replace a video's station tags with the given set as MANUAL and mark it
 * reviewed. One transaction (deleteMany + createMany + update) — not a write
 * per station.
 */
export async function saveStationTags(videoId: string, stationSlugs: string[]) {
  const unique = Array.from(new Set(stationSlugs));
  await prisma.$transaction([
    prisma.videoStation.deleteMany({ where: { videoId } }),
    ...(unique.length
      ? [
          prisma.videoStation.createMany({
            data: unique.map((stationSlug) => ({ videoId, stationSlug, matchType: 'MANUAL', confidence: 1.0 })),
            skipDuplicates: true,
          }),
        ]
      : []),
    prisma.video.update({ where: { id: videoId }, data: { reviewed: true, reviewedAt: new Date() } }),
  ]);
}

/** Mark reviewed with no stations (the tagger's SKIP). Clears any auto tags. */
export async function skipVideo(videoId: string, note?: string) {
  await prisma.$transaction([
    prisma.videoStation.deleteMany({ where: { videoId } }),
    prisma.video.update({
      where: { id: videoId },
      data: { reviewed: true, reviewedAt: new Date(), reviewNote: note ?? null },
    }),
  ]);
}

/** Return a video to the queue (reviewed = false). */
export async function resetReview(videoId: string) {
  return prisma.video.update({ where: { id: videoId }, data: { reviewed: false, reviewedAt: null } });
}

export async function pinToPost(videoId: string, postId: string) {
  return prisma.videoPost.upsert({
    where: { videoId_postId: { videoId, postId } },
    create: { videoId, postId },
    update: {},
  });
}

export async function unpinFromPost(videoId: string, postId: string) {
  return prisma.videoPost.deleteMany({ where: { videoId, postId } });
}

export async function findByYoutubeId(youtubeId: string) {
  return prisma.video.findUnique({
    where: { youtubeId },
    include: videoWithRelations,
  });
}

export async function findById(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: videoWithRelations,
  });
}

export async function findByStationSlug(stationSlug: string) {
  return prisma.video.findMany({
    where: {
      status: 'ACTIVE',
      stations: { some: { stationSlug } },
    },
    include: videoWithRelations,
    orderBy: { publishedAt: 'desc' },
  });
}

export async function upsertFromYouTube(data: {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: Date | null;
  duration: string | null;
  tags: string;
}) {
  return prisma.video.upsert({
    where: { youtubeId: data.youtubeId },
    create: { ...data, syncedAt: new Date() },
    update: {
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      tags: data.tags,
      syncedAt: new Date(),
    },
    include: videoWithRelations,
  });
}

export async function setStationAssociations(
  videoId: string,
  associations: { stationSlug: string; matchType: string; confidence: number }[],
) {
  // Delete existing auto associations, keep manual ones
  await prisma.videoStation.deleteMany({
    where: { videoId, matchType: 'AUTO' },
  });

  for (const assoc of associations) {
    await prisma.videoStation.upsert({
      where: {
        videoId_stationSlug: { videoId, stationSlug: assoc.stationSlug },
      },
      create: { videoId, ...assoc },
      update: { matchType: assoc.matchType, confidence: assoc.confidence },
    });
  }
}

export async function addManualAssociation(videoId: string, stationSlug: string) {
  return prisma.videoStation.upsert({
    where: {
      videoId_stationSlug: { videoId, stationSlug },
    },
    create: { videoId, stationSlug, matchType: 'MANUAL', confidence: 1.0 },
    update: { matchType: 'MANUAL', confidence: 1.0 },
  });
}

export async function removeAssociation(videoId: string, stationSlug: string) {
  return prisma.videoStation.deleteMany({
    where: { videoId, stationSlug },
  });
}
