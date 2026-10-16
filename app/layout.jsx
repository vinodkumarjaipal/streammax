import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://streammax-official.vercel.app"),
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
    canonical: "./",
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
        <footer className="border-t border-gray-800/80 bg-[#07080b] py-10 px-4 sm:px-8 text-center text-xs text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-bold text-gray-300">
              STREAM<span className="text-[#dc2626]">MAX</span> © {new Date().getFullYear()}
            </span>
            <p className="max-w-md text-gray-400">
              StreamMax does not host files on its servers. All videos and metadata are provided by third-party services.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}