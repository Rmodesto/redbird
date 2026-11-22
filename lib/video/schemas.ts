import { z } from 'zod';

export const videoListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['ACTIVE', 'HIDDEN']).optional(),
  search: z.string().optional(),
});

export const videoSyncBody = z.object({
  channelId: z.string().min(1, 'Channel ID is required'),
});

export const videoTagBody = z.object({
  videoId: z.string().min(1),
  stationSlug: z.string().min(1),
});

export type VideoListQuery = z.infer<typeof videoListQuery>;
export type VideoSyncBody = z.infer<typeof videoSyncBody>;
export type VideoTagBody = z.infer<typeof videoTagBody>;
