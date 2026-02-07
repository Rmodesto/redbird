import { z } from 'zod';

// =============================================================================
// Shared Schemas
// =============================================================================

const VALID_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z',
] as const;

const BOROUGHS = [
  'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
] as const;

export const lineId = z.enum(VALID_LINES);
export const borough = z.enum(BOROUGHS);
export const limit = z.coerce.number().int().min(1).max(100).default(50);
export const radius = z.coerce.number().min(0.01).max(10).default(0.25);
export const latitude = z.coerce.number().min(40.4).max(41.0);
export const longitude = z.coerce.number().min(-74.3).max(-73.6);
export const nonEmptyString = z.string().min(1);

// =============================================================================
// Route-Specific Schemas
// =============================================================================

export const nearestStationsQuery = z.object({
  lat: latitude,
  lon: longitude,
  limit: z.coerce.number().int().min(1).max(100).default(5),
  lines: z.string().optional(),
});

export const nearestStationsBody = z.object({
  address: z.string().min(1, 'Address is required').max(500),
});

export const stationStatsQuery = z.object({
  station: nonEmptyString,
  radius: radius,
});

export const stationStatsBody = z.object({
  stationIds: z.array(z.string().min(1)).min(1).max(50),
  radius: radius.optional(),
});

export const contactForm = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address').max(320),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(5000),
});

export const stationsQuery = z.object({
  search: z.string().max(200).optional(),
  borough: z.string().optional(),
  line: z.string().optional(),
  limit: limit,
});

export const subwayStationsQuery = z.object({
  lines: z.string().optional(),
  borough: z.string().optional(),
});

export const subwayTrainsBody = z.object({
  trainId: z.string().min(1),
  coordinates: z.tuple([longitude, latitude]),
});

export const subwayTrainsQuery = z.object({
  lines: z.string().optional(),
});
