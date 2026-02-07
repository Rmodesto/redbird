import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import "./globals.css";
import { generateSEOMetadata } from "@/lib/seo";
import { generateWebsiteSchema, generateStructuredDataScript } from "@/lib/structured-data";
import ClientLayout from "@/components/ClientLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = generateSEOMetadata({
  title: "Subway Sounds NYC - Real-Time NYC Subway Map, Arrivals & Station Directory",
  description: "Navigate NYC subway with real-time arrivals, interactive subway map, station sounds archive, and comprehensive station information. Your complete NYC transit guide.",
  keywords: [
    "NYC subway real-time",
    "subway platform sounds",
    "MTA train arrivals",
    "New York metro guide",
    "subway station directory",
    "NYC transit map interactive",
    "subway accessibility info",
    "train service alerts NYC",
  ],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const websiteSchema = generateWebsiteSchema();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Subway Sounds" />
        
        {/* Structured Data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredDataScript(websiteSchema)}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* GTM noscript fallback */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <ClientLayout>
          {children}
        </ClientLayout>

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true' && process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Google Tag Manager */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
        )}
      </body>
    </html>
    </ClerkProviderWrapper>
  );
}
