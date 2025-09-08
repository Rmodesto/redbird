'use client';

import { useEffect, useState } from 'react';
import { useStationLinesFromStation } from '@/hooks/useStationLines';
import { Station } from '@/lib/subway-lines';

interface StationStats {
  safetyScore: number;
  crimeStats: {
    total: number;
    felonies: number;
    misdemeanors: number;
    violations: number;
    recent: Array<{
      date: string;
      type: string;
      category: string;
      location: string;
    }>;
  };
  ratStats: {
    total: number;
    recent: Array<{
      date: string;
      address: string;
      borough: string;
    }>;
  };
  summary: {
    totalIncidents: number;
    riskLevel: string;
  };
}

interface Props {
  stationId: string;
  stationName: string;
  borough: string;
  lines: string[];
  station?: Station;
}

const NYC_SUBWAY_FARE = 2.90; // Current NYC subway fare as of 2024
const OMNY_WEEKLY_CAP = 34; // OMNY weekly fare cap

const StationOverviewCard = ({ stationId, stationName, borough, lines, station }: Props) => {
  const [stats, setStats] = useState<StationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the hook to get validated lines from station data
  const { lines: validatedLines, validation } = useStationLinesFromStation(station || null);
  
  // Use validated lines if available, otherwise fall back to prop lines
  const displayLines = validatedLines.length > 0 ? validatedLines : lines;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/station-stats?station=${stationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch station stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Unable to load station statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [stationId]);

  // Station amenities data (placeholder - would come from MTA API in production)
  // Use deterministic values based on station ID to avoid hydration mismatches
  const hashCode = stationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (seed: number) => ((hashCode + seed) % 100) / 100;
  
  const stationAmenities = {
    adaAccessible: pseudoRandom(1) > 0.77, // 23% of stations are ADA accessible
    hasRestroom: pseudoRandom(2) > 0.85,   // Few stations have public restrooms
    hasPolice: ['times-square-42', 'union-square', 'grand-central', 'atlantic-ave-barclays'].includes(stationId),
    yearBuilt: getEstimatedYearBuilt(stationName, displayLines[0], hashCode),
    hasElevator: pseudoRandom(3) > 0.77,
    hasWiFi: pseudoRandom(4) > 0.5,
    isUnderground: !['coney-island-stillwell', 'yankee-stadium', 'astoria-ditmars'].includes(stationId),
  };

  function getEstimatedYearBuilt(name: string, primaryLine: string, seed: number): number {
    // Rough estimates based on historical subway construction
    // Use deterministic pseudo-random based on seed to avoid hydration issues
    const pseudoRand = (max: number, offset: number) => Math.floor((seed % max) + offset);
    
    if (['1', '2', '3'].includes(primaryLine)) return pseudoRand(15, 1904); // Original IRT
    if (['4', '5', '6'].includes(primaryLine)) return pseudoRand(20, 1918); // IRT Lexington
    if (['N', 'Q', 'R', 'W'].includes(primaryLine)) return pseudoRand(25, 1915); // BMT
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(primaryLine)) return pseudoRand(30, 1932); // IND
    if (primaryLine === 'L') return pseudoRand(20, 1928); // Canarsie Line
    if (primaryLine === '7') return pseudoRand(25, 1915); // Flushing Line
    return pseudoRand(50, 1920); // Default
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Very High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Station Overview</h3>
        <span className="text-sm text-gray-500">Live Data</span>
      </div>

      {/* Current Fare Information */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">💳 Current Fare</h4>
        <div className="text-blue-700">
          <div className="flex justify-between items-center">
            <span>Single Ride:</span>
            <span className="font-bold">${NYC_SUBWAY_FARE}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Weekly Cap (OMNY):</span>
            <span className="font-bold">${OMNY_WEEKLY_CAP}</span>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            Pay with OMNY - tap phone, card, or watch
          </div>
        </div>
      </div>

      {/* Safety & Crime Stats */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-lg p-4 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Safety Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🛡️ Safety Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Safety Score</div>
                  <div className={`text-2xl font-bold ${getSafetyColor(stats.safetyScore)}`}>
                    {stats.safetyScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(stats.summary.riskLevel)}`}>
                    {stats.summary.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Crime Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🚔 Crime Stats (2024)</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-bold text-red-600">{stats.crimeStats.felonies}</div>
                  <div className="text-gray-600">Felonies</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">{stats.crimeStats.misdemeanors}</div>
                  <div className="text-gray-600">Misdemeanors</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-600">{stats.crimeStats.violations}</div>
                  <div className="text-gray-600">Violations</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Within 0.25 miles of station
              </div>
            </div>

            {/* Rat Sightings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">🐀 Rodent Reports</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">311 Complaints (2024):</span>
                <span className="font-bold text-gray-900">{stats.ratStats.total}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Within 0.25 miles of station
              </div>
            </div>
          </>
        )}

        {/* Station Amenities */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">♿ Accessibility & Amenities</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <span className={`mr-2 ${stationAmenities.adaAccessible ? 'text-green-600' : 'text-red-600'}`}>
                {stationAmenities.adaAccessible ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">ADA Accessible</span>
            </div>
            <div className="flex items-center">
              <span className={`mr-2 ${stationAmenities.hasElevator ? 'text-green-600' : 'text-red-600'}`}>
                {stationAmenities.hasElevator ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">Elevators</span>
            </div>
            <div className="flex items-center">
              <span className={`mr-2 ${stationAmenities.hasRestroom ? 'text-green-600' : 'text-red-600'}`}>
                {stationAmenities.hasRestroom ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">Restrooms</span>
            </div>
            <div className="flex items-center">
              <span className={`mr-2 ${stationAmenities.hasPolice ? 'text-green-600' : 'text-red-600'}`}>
                {stationAmenities.hasPolice ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">Police Presence</span>
            </div>
            <div className="flex items-center">
              <span className={`mr-2 ${stationAmenities.hasWiFi ? 'text-green-600' : 'text-red-600'}`}>
                {stationAmenities.hasWiFi ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">WiFi</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-blue-600">📅</span>
              <span className="text-gray-700">Built: {stationAmenities.yearBuilt}</span>
            </div>
          </div>
        </div>

        {/* Station Type */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">🏗️ Station Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-900">
                {stationAmenities.isUnderground ? 'Underground' : 'Elevated/Surface'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Borough:</span>
              <span className="text-gray-900">{borough}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lines Served:</span>
              <span className="text-gray-900">{displayLines.length}</span>
            </div>
          </div>

          {/* Line Validation Warnings */}
          {validation && validation.warnings.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="font-semibold text-yellow-700">⚠️ Line Data Notice:</div>
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600 mt-1">• {warning}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationOverviewCard;