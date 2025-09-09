export interface SubwayLineColors {
  bg: string;
  text: string;
  name: string;
}

export const SUBWAY_LINE_COLORS: Record<string, SubwayLineColors> = {
  // IRT Lines (numbered trains)
  '1': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Local' },
  '2': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Express' },
  '3': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Express' },
  '4': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Express' },
  '5': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Express' },
  '6': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Local' },
  '7': { bg: 'bg-purple-600', text: 'text-white', name: 'Flushing Express/Local' },
  
  // BMT/IND Lines (lettered trains)
  'A': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Express' },
  'C': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Local' },
  'E': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Local' },
  'B': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Express' },
  'D': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Express' },
  'F': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Local' },
  'M': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Local' },
  'N': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Express' },
  'Q': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Express' },
  'R': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Local' },
  'W': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Local' },
  'J': { bg: 'bg-amber-700', text: 'text-white', name: 'Jamaica Line' },
  'Z': { bg: 'bg-amber-700', text: 'text-white', name: 'Jamaica Express' },
  'L': { bg: 'bg-gray-500', text: 'text-white', name: '14th St-Canarsie' },
  'G': { bg: 'bg-lime-500', text: 'text-black', name: 'Brooklyn-Queens Crosstown' },
  'S': { bg: 'bg-gray-600', text: 'text-white', name: 'Shuttle' },
};

export function getSubwayLineColor(line: string): SubwayLineColors {
  return SUBWAY_LINE_COLORS[line.toUpperCase()] || { 
    bg: 'bg-gray-400', 
    text: 'text-white', 
    name: 'Unknown Line' 
  };
}

export function getSubwayLineColorClasses(line: string): string {
  const colors = getSubwayLineColor(line);
  return `${colors.bg} ${colors.text}`;
}