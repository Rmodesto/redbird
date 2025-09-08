import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";
import CultureCard from "@/components/CultureCard";

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Culture - Movies, Music, Art & Popular Culture",
  "Explore how NYC subway has shaped popular culture through movies, music, art, literature, and internet culture. From classic films to viral memes, discover the subway's cultural impact.",
  [
    "NYC subway culture",
    "subway in movies",
    "NYC metro songs",
    "subway art photography",
    "New York transit culture",
    "subway memes internet",
    "NYC underground culture",
    "subway literature books",
    "metro pop culture",
    "subway social media",
  ]
);

const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Culture Archive",
  "Comprehensive collection of NYC subway's influence on popular culture, media, and arts",
  "stations",
  150
);

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Culture", url: "/culture" },
]);

interface CultureItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year?: number;
  mediaType: 'movie' | 'song' | 'book' | 'art' | 'meme' | 'game' | 'tv';
  image?: string;
  link?: string;
  featured?: boolean;
}

const culturalContent: CultureItem[] = [
  // Movies & TV
  {
    id: "french-connection",
    category: "Movies",
    title: "The French Connection (1971)",
    description: "Oscar-winning film featuring the famous subway chase scene at Bay Ridge Avenue station.",
    year: 1971,
    mediaType: "movie",
    image: "🎬",
    featured: true
  },
  {
    id: "spider-man-2",
    category: "Movies", 
    title: "Spider-Man 2 (2004)",
    description: "Epic train fight sequence filmed on the R train and elevated tracks in Queens.",
    year: 2004,
    mediaType: "movie",
    image: "🕷️"
  },
  {
    id: "money-train",
    category: "Movies",
    title: "Money Train (1995)",
    description: "Action thriller set entirely within the NYC subway system starring Wesley Snipes and Woody Harrelson.",
    year: 1995,
    mediaType: "movie",
    image: "💰"
  },
  {
    id: "seinfeld-subway",
    category: "TV Shows",
    title: "Seinfeld - The Subway (1992)",
    description: "Classic episode where each character takes a different subway journey across NYC.",
    year: 1992,
    mediaType: "tv",
    image: "📺",
    featured: true
  },

  // Music
  {
    id: "take-a-train",
    category: "Music",
    title: "Take the 'A' Train - Duke Ellington",
    description: "Jazz standard celebrating the A train to Harlem, NYC's unofficial subway anthem.",
    year: 1941,
    mediaType: "song",
    image: "🎷",
    featured: true
  },
  {
    id: "downtown-train",
    category: "Music",
    title: "Downtown Train - Tom Waits",
    description: "Melancholic ballad about late-night subway rides through NYC.",
    year: 1985,
    mediaType: "song",
    image: "🎵"
  },
  {
    id: "subway-joe",
    category: "Music",
    title: "Subway Joe - Joe Bataan",
    description: "Latin soul classic about a subway musician playing for tips.",
    year: 1968,
    mediaType: "song",
    image: "🪗"
  },

  // Art & Photography
  {
    id: "subway-murals",
    category: "Art",
    title: "MTA Arts & Design Murals",
    description: "Over 300 permanent artworks in subway stations, transforming daily commutes into gallery visits.",
    mediaType: "art",
    image: "🎨",
    featured: true
  },
  {
    id: "walker-evans",
    category: "Photography",
    title: "Walker Evans - Subway Portraits",
    description: "Iconic 1938-41 hidden camera photographs of subway passengers, capturing authentic NYC life.",
    year: 1941,
    mediaType: "art",
    image: "📸"
  },
  {
    id: "graffiti-culture",
    category: "Art",
    title: "Subway Graffiti Movement",
    description: "1970s-80s underground art movement that turned subway trains into moving canvases.",
    year: 1970,
    mediaType: "art",
    image: "🖌️"
  },

  // Literature
  {
    id: "colson-whitehead",
    category: "Literature",
    title: "The Colossus of New York",
    description: "Colson Whitehead's essay collection includes 'The Subway', a poetic exploration of underground NYC.",
    year: 2003,
    mediaType: "book",
    image: "📚"
  },
  {
    id: "rats-subway",
    category: "Literature",
    title: "Rats - Robert Sullivan",
    description: "Non-fiction exploration of NYC including extensive subway rat ecosystem documentation.",
    year: 2004,
    mediaType: "book",
    image: "📖"
  },

  // Internet Culture & Memes
  {
    id: "pizza-rat",
    category: "Memes",
    title: "Pizza Rat",
    description: "2015 viral video of rat dragging pizza slice down subway stairs, became global internet sensation.",
    year: 2015,
    mediaType: "meme",
    image: "🍕",
    featured: true
  },
  {
    id: "showtime",
    category: "Memes",
    title: "'Showtime!' Dancers",
    description: "Viral videos of acrobatic subway car performers, spawning countless TikTok recreations.",
    year: 2010,
    mediaType: "meme",
    image: "💃"
  },
  {
    id: "manspreading",
    category: "Social Media",
    title: "Manspreading Movement",
    description: "2014 social media campaign about subway etiquette that went global.",
    year: 2014,
    mediaType: "meme",
    image: "📱"
  },

  // Video Games
  {
    id: "gta-iv-subway",
    category: "Games",
    title: "Grand Theft Auto IV",
    description: "Detailed recreation of NYC subway system allowing players to ride authentic train routes.",
    year: 2008,
    mediaType: "game",
    image: "🎮"
  },
  {
    id: "a-train-games",
    category: "Games", 
    title: "A-Train Series",
    description: "City-building games inspired by NYC transit planning and subway system management.",
    year: 1985,
    mediaType: "game",
    image: "🚊"
  }
];

const categories = [
  { name: "Movies & TV", icon: "🎬", count: culturalContent.filter(item => ['movie', 'tv'].includes(item.mediaType)).length },
  { name: "Music", icon: "🎵", count: culturalContent.filter(item => item.mediaType === 'song').length },
  { name: "Art & Photography", icon: "🎨", count: culturalContent.filter(item => item.mediaType === 'art').length },
  { name: "Literature", icon: "📚", count: culturalContent.filter(item => item.mediaType === 'book').length },
  { name: "Internet Culture", icon: "💻", count: culturalContent.filter(item => item.mediaType === 'meme').length },
  { name: "Video Games", icon: "🎮", count: culturalContent.filter(item => item.mediaType === 'game').length },
];

const featuredItems = culturalContent.filter(item => item.featured);

export default function CulturePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              NYC Subway Culture
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl">
              From iconic movie chase scenes to viral internet memes, the NYC subway has shaped popular culture for over a century. 
              Explore how the world&apos;s busiest transit system became a cultural phenomenon.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                🎬 Featured Movies
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                🎵 Subway Songs
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                🎨 Art & Murals
              </button>
            </div>
          </div>
        </section>

        {/* Culture Stats */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => (
                <div key={category.name} className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-2xl font-bold text-black">{category.count}</div>
                  <div className="text-xs text-gray-600">{category.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Cultural Moments */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Cultural Moments</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <CultureCard
                  key={item.id}
                  category={item.category}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Movies & TV Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                🎬 Movies & Television
              </h2>
              <button className="text-blue-600 hover:text-blue-800 font-semibold">
                View All →
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalContent
                .filter(item => ['movie', 'tv'].includes(item.mediaType))
                .slice(0, 6)
                .map((item) => (
                  <CultureCard
                    key={item.id}
                    category={item.category}
                    title={item.title}
                    description={item.description}
                    image={item.image}
                  />
                ))}
            </div>

            <div className="mt-8 prose prose-lg text-gray-700">
              <p>
                The NYC subway has been the backdrop for countless memorable film and TV moments. 
                From high-octane chase scenes to intimate character moments, the subway&apos;s unique 
                atmosphere has made it a favorite location for storytellers worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Music Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                🎵 Music & Songs
              </h2>
              <button className="text-blue-600 hover:text-blue-800 font-semibold">
                Listen to Playlist →
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalContent
                .filter(item => item.mediaType === 'song')
                .map((item) => (
                  <CultureCard
                    key={item.id}
                    category={item.category}
                    title={item.title}
                    description={item.description}
                    image={item.image}
                  />
                ))}
            </div>

            <div className="mt-8 prose prose-lg text-gray-700">
              <p>
                Music and the subway have been intertwined since Duke Ellington&apos;s &quot;Take the &apos;A&apos; Train&quot; became 
                an unofficial anthem. Street performers, subway musicians, and countless songs celebrating 
                or lamenting subway life have created a rich musical heritage.
              </p>
            </div>
          </div>
        </section>

        {/* Art & Photography Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                🎨 Art & Photography
              </h2>
              <button className="text-blue-600 hover:text-blue-800 font-semibold">
                Virtual Gallery →
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalContent
                .filter(item => item.mediaType === 'art')
                .map((item) => (
                  <CultureCard
                    key={item.id}
                    category={item.category}
                    title={item.title}
                    description={item.description}
                    image={item.image}
                  />
                ))}
            </div>

            <div className="mt-8 prose prose-lg text-gray-700">
              <p>
                From the MTA&apos;s Arts & Design program transforming stations into galleries, to the underground 
                graffiti movement of the 1970s-80s, the subway has been both canvas and subject for 
                countless artists and photographers documenting urban life.
              </p>
            </div>
          </div>
        </section>

        {/* Internet Culture & Memes */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                💻 Internet Culture & Memes
              </h2>
              <button className="text-blue-600 hover:text-blue-800 font-semibold">
                Trending Now →
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalContent
                .filter(item => item.mediaType === 'meme')
                .map((item) => (
                  <CultureCard
                    key={item.id}
                    category={item.category}
                    title={item.title}
                    description={item.description}
                    image={item.image}
                  />
                ))}
            </div>

            <div className="mt-8 prose prose-lg text-gray-700">
              <p>
                The digital age has transformed subway culture, with viral moments like Pizza Rat becoming 
                global phenomena. Social media has amplified both the quirky and serious aspects of subway life, 
                creating new forms of urban folklore.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Cultural Timeline: NYC Subway Through the Decades
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-8">
              {[
                { decade: "1940s", highlight: "Duke Ellington&apos;s &apos;Take the A Train&apos; becomes subway anthem", icon: "🎷" },
                { decade: "1970s", highlight: "Graffiti culture transforms trains into moving art galleries", icon: "🎨" },
                { decade: "1990s", highlight: "Hollywood discovers the subway: Money Train, French Connection", icon: "🎬" },
                { decade: "2000s", highlight: "Spider-Man brings superhero action to the rails", icon: "🕷️" },
                { decade: "2010s", highlight: "Social media era: Showtime dancers and viral moments", icon: "📱" },
                { decade: "2020s", highlight: "TikTok culture and pandemic-era subway stories", icon: "📹" },
              ].map((period) => (
                <div key={period.decade} className="flex items-center gap-6">
                  <div className="text-4xl">{period.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">{period.decade}</h3>
                    <p className="text-gray-300">{period.highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Share Your Subway Culture</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Have a favorite subway movie scene, song, or viral moment? Help us build the most comprehensive 
              archive of NYC subway culture by sharing your discoveries.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                Submit Cultural Item
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Browse Community Picks
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <a href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🏠</span>
              HOME
            </a>
            <a href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🚇</span>
              LINES
            </a>
            <a href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">📍</span>
              STATIONS
            </a>
            <a href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🗺️</span>
              MAP
            </a>
            <a href="/culture" className="flex flex-col items-center py-2 text-xs font-medium text-black">
              <span className="text-lg mb-1">🎭</span>
              CULTURE
            </a>
          </div>
        </div>
      </div>
    </>
  );
}