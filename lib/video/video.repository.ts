import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface FindManyOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

const videoWithStations = {
  stations: {
    select: {
      stationSlug: true,
      matchType: true,
      confidence: true,
    },
  },
};

export async function findMany({ page, limit, status, search }: FindManyOptions) {
  const where: Prisma.VideoWhereInput = {};

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: videoWithStations,
    }),
    prisma.video.count({ where }),
  ]);
  return { videos, total };
}

export async function findByYoutubeId(youtubeId: string) {
  return prisma.video.findUnique({
    where: { youtubeId },
    include: videoWithStations,
  });
}

export async function findById(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: videoWithStations,
  });
}

export async function findByStationSlug(stationSlug: string) {
  return prisma.video.findMany({
    where: {
      status: 'ACTIVE',
      stations: { some: { stationSlug } },
    },
    include: videoWithStations,
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
    include: videoWithStations,
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
