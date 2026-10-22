import "./globals.css";
import Navbar from "@/components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteUrl } from "@/lib/site";

const googleAnalyticsId = "G-LM5DSDRX2F";

export const metadata = {
  metadataBase: new URL(siteUrl),
  referrer: "no-referrer",
  title: {
    default: "StreamMax - Watch Movies, TV Shows & Anime in HD",
    template: "%s | StreamMax",
  },
  description: "Stream and download blockbuster movies, K-Dramas, Bollywood, Hollywood, anime and Turkish series with multi-audio and subtitles.",
  keywords: ["movies", "tv shows", "anime", "k-drama", "streaming", "watch free movies", "streammax"],
  authors: [{ name: "StreamMax Team" }],
  creator: "StreamMax",
  publisher: "StreamMax",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "StreamMax - Watch Movies, TV Shows & Anime in HD",
    description: "Stream and download blockbuster movies, K-Dramas, Bollywood, Hollywood, anime and Turkish series.",
    url: "https://streammax.vercel.app",
    siteName: "StreamMax",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamMax - Watch Movies, TV Shows & Anime in HD",
    description: "Stream and download blockbuster movies, K-Dramas, Bollywood, Hollywood, anime and Turkish series.",
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0c10] text-gray-100 min-h-screen font-sans selection:bg-[#dc2626] selection:text-white">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        
      {/* FOOTER */}
<footer className="border-t border-gray-800/80 bg-[#07080b] py-10 px-4 sm:px-8 text-center text-xs text-gray-300">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
      <span className="font-bold text-gray-200">
        STREAM<span className="text-[#ef4444]">MAX</span> © {new Date().getFullYear()}
      </span>
      <span className="hidden sm:inline text-gray-600">•</span>
      <span className="text-gray-300 font-medium">
        Made with <span className="text-[#ef4444]">❤️</span> by <span className="text-white font-semibold">V K JaiPal</span>
      </span>
    </div>

    <p className="max-w-md text-gray-300 leading-relaxed">
      StreamMax does not host files on its servers. All videos and metadata are provided by third-party services.
    </p>
  </div>
</footer>
        {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
      </body>
    </html>
  );
}