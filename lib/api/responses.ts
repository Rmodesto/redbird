/**
 * Standardized API Response Utilities
 *
 * Use these helpers for consistent API responses across all routes.
 */

import { NextResponse } from 'next/server';

// =============================================================================
// Response Types
// =============================================================================

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    cached?: boolean;
  };
}

// =============================================================================
// Error Response Helpers
// =============================================================================

/**
 * Create a standardized error response
 *
 * @param message - Error message to return to client
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code for client-side handling
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code },
    { status }
  );
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(message: string = 'Bad Request'): NextResponse<ApiErrorResponse> {
  return apiError(message, 400, 'BAD_REQUEST');
}

/**
 * Create a 404 Not Found response
 */
export function notFound(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return apiError(message, 404, 'NOT_FOUND');
}

/**
 * Create a 500 Internal Server Error response
 */
export function serverError(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return apiError(message, 500, 'INTERNAL_ERROR');
}

// =============================================================================
// Success Response Helpers
// =============================================================================

/**
 * Create a standardized success response
 *
 * @param data - Response data
 * @param headers - Optional response headers (e.g., cache control)
 */
export function apiSuccess<T>(
  data: T,
  headers?: HeadersInit
): NextResponse<T> {
  return NextResponse.json(data, { headers });
}

/**
 * Create a success response with cache headers
 *
 * @param data - Response data
 * @param maxAge - Cache max-age in seconds
 * @param staleWhileRevalidate - Stale-while-revalidate time in seconds
 */
export function apiSuccessWithCache<T>(
  data: T,
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400
): NextResponse<T> {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}

/**
 * Create a success response with no-cache headers (for real-time data)
 */
export function apiSuccessNoCache<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// =============================================================================
// Cache Header Presets
// =============================================================================

export const CACHE_HEADERS = {
  /**
   * For real-time data (arrivals, live positions)
   */
  REALTIME: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },

  /**
   * For semi-static data (station stats - 5 min)
   */
  SHORT: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },

  /**
   * For mostly static data (station list - 1 hour)
   */
  MEDIUM: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },

  /**
   * For static data (line info - 1 day)
   */
  LONG: {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  },
} as const;
