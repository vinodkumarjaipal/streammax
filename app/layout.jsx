import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "StreamMax - Watch Movies, TV Shows & Anime in HD",
  description: "Stream and download blockbuster movies, K-Dramas, Bollywood, Hollywood, anime and Turkish series with multi-audio and subtitles.",
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