// Culture page content types
export interface CultureItem {
  id: string;
  category: CultureCategory;
  title: string;
  description: string;
  year: number;
  mediaType: MediaType;
  image?: string;
  featured?: boolean;
  tags?: string[];
  externalUrl?: string;
  subwayReferences?: SubwayReference[];
}

export type CultureCategory = 
  | 'Movies'
  | 'Music'
  | 'Art'
  | 'Literature'
  | 'Internet Culture'
  | 'Video Games';

export type MediaType = 
  | 'movie'
  | 'tv-show'
  | 'song'
  | 'album'
  | 'book'
  | 'artwork'
  | 'meme'
  | 'video-game'
  | 'documentary';

export interface SubwayReference {
  station?: string;
  line?: string[];
  description: string;
  significance: 'major' | 'minor' | 'background';
}

export interface CultureTimeline {
  decade: string;
  highlight: string;
  items: CultureItem[];
  icon?: string;
}

export interface CultureStats {
  totalItems: number;
  byCategory: Record<CultureCategory, number>;
  byDecade: Record<string, number>;
  featuredCount: number;
}

export interface CulturePageData {
  items: CultureItem[];
  categories: CultureCategory[];
  timeline: CultureTimeline[];
  stats: CultureStats;
  featured: CultureItem[];
}