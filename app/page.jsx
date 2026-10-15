import Image from "next/image";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import {
  getGlobalTrending,
  getHollywoodBlockbusters,
  getKoreanDramas,
  getTurkishSeries,
  getSpanishHits,
  getBollywoodMovies,
  getIndianSeries,
  getJapaneseAnime,
} from "@/lib/tmdb";

export const revalidate = 3600;

export default async function Home() {
  // Fetch all global content in parallel with resilient error fallbacks
  const [
    trending,
    hollywood,
    kdramas,
    turkish,
    spanish,
    bollywood,
    indianTv,
    anime,
  ] = await Promise.all([
    getGlobalTrending().catch(() => []),
    getHollywoodBlockbusters().catch(() => []),
    getKoreanDramas().catch(() => []),
    getTurkishSeries().catch(() => []),
    getSpanishHits("tv").catch(() => []),
    getBollywoodMovies().catch(() => []),
    getIndianSeries().catch(() => []),
    getJapaneseAnime().catch(() => []),
  ]);

  // Select a hero item from trending that has a backdrop image
  const heroPool = (trending || []).filter((item) => item.backdrop_path);
  const heroItem = heroPool.length > 0 
    ? heroPool[Math.floor(Math.random() * heroPool.length)] 
    : (trending && trending[0] ? trending[0] : null);

  const heroMediaType = heroItem?.media_type || (heroItem?.title ? "movie" : "tv");
  const heroTitle = heroItem?.title || heroItem?.name || "Featured Title";
  const heroOverview = heroItem?.overview || "Stream and download the latest global blockbuster hits.";

  return (
    <main className="min-h-screen bg-[#0b0c10] text-gray-200 overflow-x-hidden pb-20">
      
      {/* HERO BANNER SECTION */}
      {heroItem && (
        <div className="relative w-full h-[65vh] sm:h-[80vh] md:h-[88vh] mb-8 md:mb-12">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={`https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`}
              alt={heroTitle}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Vignette / Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/30 to-transparent z-10" />

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end px-4 sm:px-8 md:px-12 lg:px-16 pb-16 md:pb-24 w-full md:w-3/4 lg:w-1/2">
            <span className="text-[#dc2626] font-black tracking-[0.2em] text-xs sm:text-sm mb-2 uppercase drop-shadow-md">
              StreamMax Exclusive
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl line-clamp-2">
              {heroTitle}
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-6 sm:mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed font-medium drop-shadow-lg max-w-2xl">
              {heroOverview}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href={`/watch/${heroMediaType}/${heroItem.id}`}
                className="flex items-center gap-2 bg-[#dc2626] hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M4 4l12 6-12 6z" />
                </svg>
                Watch Now
              </Link>
              <Link
                href={`/${heroMediaType === "tv" ? "tv" : "movie"}/${heroItem.id}`}
                className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600/50 backdrop-blur-md px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT ROWS */}
      <div className="relative z-20 -mt-6 sm:-mt-12">
        <ContentRow 
          title="Trending Worldwide" 
          badge="Multi-Audio" 
          items={trending} 
        />
        
        <ContentRow 
          title="Blockbuster Hollywood" 
          badge="English / Dubbed" 
          items={hollywood} 
        />

        <ContentRow 
          title="K-Dramas & Asian Hits" 
          badge="Hindi Dubbed / Subbed" 
          items={kdramas} 
        />

        <ContentRow 
          title="Turkish Masterpieces" 
          badge="Urdu / Hindi Dubbed" 
          items={turkish} 
        />

        <ContentRow 
          title="Spanish & European Thrillers" 
          badge="Multi-Audio" 
          items={spanish} 
        />

        <ContentRow 
          title="Bollywood Blockbusters" 
          badge="Hindi" 
          items={bollywood} 
        />

        <ContentRow 
          title="Indian Web Series" 
          badge="Hindi" 
          items={indianTv} 
        />

        <ContentRow 
          title="Anime World" 
          badge="Dubbed / Subbed" 
          items={anime} 
        />
      </div>

    </main>
  );
}