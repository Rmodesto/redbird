import { Metadata } from "next";
import Link from "next/link";
import { generateSEOMetadata, generateFAQSchema } from "@/lib/seo";
import { generateCollectionPageSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";
import {
  HeroSection,
  ServiceAlertsSection,
  SubwayLinesGrid,
  FeaturedStationsGrid,
  FeatureCards,
  SystemStats,
  SEOContentSection
} from "@/components/home";

export const metadata: Metadata = generateSEOMetadata({
  title: "Subway Sounds NYC - Real-Time NYC Subway Directory, Map & Train Arrivals",
  description: "Navigate NYC subway with real-time train arrivals, interactive subway map, station sounds, and comprehensive directory. Track all 27 lines across 472 stations in Manhattan, Brooklyn, Queens & Bronx.",
  keywords: [
    "NYC subway real-time",
    "subway sounds New York",
    "MTA train tracker",
    "NYC metro map interactive",
    "subway station finder",
    "train arrivals NYC live",
    "Manhattan subway guide",
    "Brooklyn train stations",
    "Queens subway map",
    "Bronx metro stations",
  ],
  canonical: "/",
});

// MTA line colors mapping
const subwayLines = [
  { id: "1", name: "1", color: "bg-red-600", textColor: "text-white" },
  { id: "2", name: "2", color: "bg-red-600", textColor: "text-white" },
  { id: "3", name: "3", color: "bg-red-600", textColor: "text-white" },
  { id: "4", name: "4", color: "bg-green-600", textColor: "text-white" },
  { id: "5", name: "5", color: "bg-green-600", textColor: "text-white" },
  { id: "6", name: "6", color: "bg-green-600", textColor: "text-white" },
  { id: "7", name: "7", color: "bg-purple-600", textColor: "text-white" },
  { id: "A", name: "A", color: "bg-blue-600", textColor: "text-white" },
  { id: "B", name: "B", color: "bg-orange-500", textColor: "text-white" },
  { id: "C", name: "C", color: "bg-blue-600", textColor: "text-white" },
  { id: "D", name: "D", color: "bg-orange-500", textColor: "text-white" },
  { id: "E", name: "E", color: "bg-blue-600", textColor: "text-white" },
  { id: "F", name: "F", color: "bg-orange-500", textColor: "text-white" },
  { id: "G", name: "G", color: "bg-green-500", textColor: "text-white" },
  { id: "J", name: "J", color: "bg-amber-600", textColor: "text-white" },
  { id: "L", name: "L", color: "bg-gray-500", textColor: "text-white" },
  { id: "M", name: "M", color: "bg-orange-500", textColor: "text-white" },
  { id: "N", name: "N", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Q", name: "Q", color: "bg-yellow-500", textColor: "text-black" },
  { id: "R", name: "R", color: "bg-yellow-500", textColor: "text-black" },
  { id: "S", name: "S", color: "bg-gray-600", textColor: "text-white" },
  { id: "W", name: "W", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Z", name: "Z", color: "bg-amber-600", textColor: "text-white" },
];

// Generate structured data
const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Directory",
  "Complete directory of New York City subway stations with real-time arrivals",
  "stations",
  472
);

const faqSchema = generateFAQSchema([
  {
    question: "How do I track real-time NYC subway arrivals?",
    answer: "Use our station search to find any NYC subway station and view real-time train arrivals updated every 30 seconds directly from MTA data feeds."
  },
  {
    question: "What are NYC subway sounds?",
    answer: "NYC subway sounds include platform announcements, door chimes, train arrivals, and station ambiance. Our archive features authentic recordings from all 472 stations."
  },
  {
    question: "How many subway lines are in NYC?",
    answer: "The NYC subway system has 27 lines (including shuttles) operating across 472 stations in Manhattan, Brooklyn, Queens, and the Bronx."
  },
  {
    question: "Where can I find an interactive NYC subway map?",
    answer: "Our interactive subway map shows all lines, stations, and real-time service updates. Click on any station for arrivals and platform information."
  }
]);

export default function HomePage() {
  const serviceAlerts = [
    {
      type: "delay" as const,
      icon: "🕐",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      message: "DELAYS on 5 Train - Signal Problems at 125 St"
    },
    {
      type: "service_change" as const,
      icon: "⚠️",
      color: "text-red-600 bg-red-50 border-red-200",
      message: "Weekend Service: 2 Train running on 5 line in Brooklyn"
    },
  ];

  const popularStations = [
    { name: "Times Square-42 St", lines: ["N", "Q", "R", "W", "S", "1", "2", "3", "7"], slug: "times-sq-42-st" },
    { name: "Grand Central-42 St", lines: ["4", "5", "6", "7", "S"], slug: "grand-central-42-st" },
    { name: "Union Square-14 St", lines: ["4", "5", "6", "N", "Q", "R", "W", "L"], slug: "14-st-union-sq" },
    { name: "34 St-Herald Sq", lines: ["B", "D", "F", "M", "N", "Q", "R", "W"], slug: "34-st-herald-sq" },
    { name: "Fulton St", lines: ["2", "3", "4", "5", "A", "C", "J", "Z"], slug: "fulton-st-2345acjz" },
    { name: "Atlantic Av-Barclays Ctr", lines: ["B", "Q", "D", "N", "R", "W", "2", "3", "4", "5"], slug: "atlantic-av-barclays-ctr" },
  ];

  const featureCards = [
    {
      href: "/subway-map",
      icon: "🗺️",
      title: "Interactive Subway Map",
      description: "Navigate all 27 lines with our real-time interactive map showing live train positions and service alerts.",
      linkText: "Open Map",
      gradient: "bg-gradient-to-br from-green-50 to-green-100",
      textColor: "text-green-700 hover:text-green-900"
    },
    {
      href: "/subway-sounds",
      icon: "🔊", 
      title: "Subway Sounds Archive",
      description: "Listen to authentic NYC subway sounds including announcements, door chimes, and station ambiance.",
      linkText: "Listen Now",
      gradient: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      textColor: "text-yellow-700 hover:text-yellow-900"
    },
    {
      href: "/real-time",
      icon: "⏱️",
      title: "Real-Time Arrivals", 
      description: "Track live train arrivals at any station with updates every 30 seconds from official MTA feeds.",
      linkText: "Track Trains",
      gradient: "bg-gradient-to-br from-green-50 to-green-100",
      textColor: "text-green-700 hover:text-green-900"
    }
  ];

  const systemStats = [
    { value: "472", label: "Stations" },
    { value: "27", label: "Lines" },
    { value: "5M+", label: "Daily Riders" },
    { value: "24/7", label: "Service" }
  ];

  const seoContent = [
    {
      title: "Real-Time Train Tracking",
      content: "Our platform provides live train arrivals updated every 30 seconds directly from MTA data feeds. Track any train, view platform-specific arrivals, and get instant service alerts for delays and changes."
    },
    {
      title: "Authentic Subway Sounds", 
      content: "Experience the unique acoustic signature of NYC&apos;s underground with our extensive subway sounds archive. From the iconic &quot;stand clear of the closing doors&quot; announcement to the rumble of approaching trains, we&apos;ve captured the authentic sounds that define New York&apos;s transit experience."
    },
    {
      title: "Interactive Subway Map",
      content: "Our interactive map makes journey planning simple. Click any station for detailed information, view real-time train positions, check accessibility features, and discover nearby attractions. Whether you&apos;re a daily commuter or first-time visitor, our map helps you navigate NYC like a local."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(faqSchema)}
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <HeroSection />
        
        <ServiceAlertsSection alerts={serviceAlerts} />
        
        <SubwayLinesGrid lines={subwayLines} />
        
        <FeaturedStationsGrid stations={popularStations} />
        
        <FeatureCards features={featureCards} />
        
        <SEOContentSection
          content={[
            {
              title: "",
              content: "Navigate the New York City Subway system with confidence using our comprehensive directory. With 472 stations across 27 lines spanning Manhattan, Brooklyn, Queens, and the Bronx, the NYC subway is one of the world's largest rapid transit systems."
            },
            ...seoContent
          ]}
        />
        
        <SystemStats stats={systemStats} />

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-xs font-medium text-black">
              <span className="text-lg mb-1">🏠</span>
              HOME
            </Link>
            <Link href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">L</span>
              LINES
            </Link>
            <Link href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">📍</span>
              STATIONS
            </Link>
            <Link href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🗺️</span>
              MAP
            </Link>
            <Link href="/subway-sounds" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🔊</span>
              SOUNDS
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}