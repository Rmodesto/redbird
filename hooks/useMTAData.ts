import { useState, useEffect } from 'react';
import { Station, TrainArrival, ServiceAlert, LineInfo } from '@/lib/services/mta-data-service';

interface UseStationDataReturn {
  station: Station | null;
  lineInfo: LineInfo[];
  nearbyStations: Station[];
  loading: boolean;
  error: string | null;
}

interface UseArrivalsReturn {
  arrivals: TrainArrival[];
  alerts: ServiceAlert[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface UseLineDataReturn {
  line: LineInfo | null;
  stations: Station[];
  alerts: ServiceAlert[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch station data
 */
export function useStationData(stationId: string): UseStationDataReturn {
  const [station, setStation] = useState<Station | null>(null);
  const [lineInfo, setLineInfo] = useState<LineInfo[]>([]);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    const fetchStationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/stations/${stationId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch station: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStation(data.station);
        setLineInfo(data.lineInfo || []);
        setNearbyStations(data.nearbyStations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch station data');
      } finally {
        setLoading(false);
      }
    };

    fetchStationData();
  }, [stationId]);

  return { station, lineInfo, nearbyStations, loading, error };
}

/**
 * Hook to fetch train arrivals with auto-refresh
 */
export function useTrainArrivals(
  stationId: string,
  refreshInterval = 30000 // Default 30 seconds
): UseArrivalsReturn {
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArrivals = async () => {
    if (!stationId) return;

    try {
      setError(null);
      
      const response = await fetch(`/api/stations/${stationId}/arrivals`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch arrivals: ${response.statusText}`);
      }
      
      const data = await response.json();
      setArrivals(data.arrivals || []);
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch arrivals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    
    // Set up auto-refresh
    const interval = setInterval(fetchArrivals, refreshInterval);
    
    return () => clearInterval(interval);
  }, [stationId, refreshInterval]);

  return { 
    arrivals, 
    alerts, 
    loading, 
    error, 
    refresh: fetchArrivals 
  };
}

/**
 * Hook to fetch line data
 */
export function useLineData(line: string): UseLineDataReturn {
  const [lineData, setLineData] = useState<LineInfo | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!line) return;

    const fetchLineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/lines/${line}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch line: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLineData(data.line);
        setStations(data.stations || []);
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch line data');
      } finally {
        setLoading(false);
      }
    };

    fetchLineData();
  }, [line]);

  return { line: lineData, stations, alerts, loading, error };
}

/**
 * Hook to search stations
 */
export function useStationSearch(query: string, limit = 10) {
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          search: query,
          limit: limit.toString()
        });
        
        const response = await fetch(`/api/stations?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to search stations');
        }
        
        const data = await response.json();
        setResults(data.stations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(searchStations, 300);
    return () => clearTimeout(timer);
  }, [query, limit]);

  return { results, loading, error };
}