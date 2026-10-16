import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "StreamMax - Watch Movies, TV Shows & Anime in HD",
  description: "Stream and download blockbuster movies, K-Dramas, Bollywood, Hollywood, anime and Turkish series with multi-audio and subtitles.",
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
        <footer className="border-t border-gray-800/80 bg-[#07080b] py-10 px-4 sm:px-8 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-bold text-gray-400">
              STREAM<span className="text-[#dc2626]">MAX</span> © {new Date().getFullYear()}
            </span>
            <p className="max-w-md">
              StreamMax does not host files on its servers. All videos and metadata are provided by third-party services.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}