'use client';

import { useState, useEffect } from 'react';
import { Station, enrichStationWithLines, validateStationLines } from '@/lib/subway-lines';

export interface StationLinesData {
  lines: string[];
  isLoading: boolean;
  error: string | null;
  validation: {
    isValid: boolean;
    suggestedLines?: string[];
    warnings: string[];
  } | null;
  station: Station | null;
}

export interface UseStationLinesOptions {
  // Whether to fetch station data if not provided
  autoFetch?: boolean;
  // Whether to validate lines against MTA data
  validate?: boolean;
  // Fallback lines if station data is unavailable
  fallbackLines?: string[];
}

export function useStationLines(
  stationIdOrSlug: string,
  providedStation?: Station,
  options: UseStationLinesOptions = {}
): StationLinesData {
  const {
    autoFetch = true,
    validate = true,
    fallbackLines = []
  } = options;

  const [data, setData] = useState<StationLinesData>({
    lines: fallbackLines,
    isLoading: false,
    error: null,
    validation: null,
    station: providedStation || null
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadStationLines() {
      if (!stationIdOrSlug) {
        setData(prev => ({
          ...prev,
          error: 'No station ID provided',
          isLoading: false
        }));
        return;
      }

      setData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        let station = providedStation;

        // Fetch station data if not provided and autoFetch is enabled
        if (!station && autoFetch) {
          const response = await fetch(`/api/stations/${stationIdOrSlug}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch station data: ${response.status}`);
          }
          station = await response.json();
        }

        if (!station) {
          throw new Error('Station data not available');
        }

        if (isCancelled) return;

        // Enrich station with accurate line data
        const enrichedResult = await enrichStationWithLines(station);

        if (isCancelled) return;

        setData({
          lines: enrichedResult.lines,
          isLoading: false,
          error: null,
          validation: validate ? enrichedResult.validation : null,
          station: enrichedResult.station
        });

      } catch (error) {
        if (isCancelled) return;

        console.error('Error loading station lines:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load station lines',
          lines: fallbackLines // Use fallback lines on error
        }));
      }
    }

    loadStationLines();

    return () => {
      isCancelled = true;
    };
  }, [stationIdOrSlug, providedStation, autoFetch, validate, fallbackLines]);

  return data;
}

// Simpler hook for when you just need the lines and already have station data
export function useStationLinesFromStation(station: Station | null): {
  lines: string[];
  validation: ReturnType<typeof validateStationLines> | null;
} {
  const [result, setResult] = useState<{
    lines: string[];
    validation: ReturnType<typeof validateStationLines> | null;
  }>({
    lines: [],
    validation: null
  });

  useEffect(() => {
    async function processStation() {
      if (!station) {
        setResult({ lines: [], validation: null });
        return;
      }

      try {
        const enriched = await enrichStationWithLines(station);
        setResult({
          lines: enriched.lines,
          validation: enriched.validation
        });
      } catch (error) {
        console.error('Error processing station lines:', error);
        setResult({
          lines: station.lines || [],
          validation: null
        });
      }
    }

    processStation();
  }, [station]);

  return result;
}