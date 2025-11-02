import { ReactNode } from 'react';

// Common UI component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Data loading states
export interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter and search
export interface FilterOptions {
  borough?: string;
  lines?: string[];
  amenities?: string[];
  searchQuery?: string;
}

// Geographic data
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Time-related
export interface TimeRange {
  start: Date;
  end: Date;
}

// Data sources attribution
export interface DataSource {
  name: string;
  url?: string;
  description: string;
  lastUpdated?: Date;
  updateFrequency?: string;
}