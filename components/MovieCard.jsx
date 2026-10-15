import Link from "next/link";
import Image from "next/image";

export default function MovieCard({ item }) {
  if (!item) return null;

  const id = item.id || item.tmdbId || item.imdbId;
  const title = item.title || item.name || "Untitled";
  const mediaType = item.media_type || item.mediaType || (item.title ? "movie" : "tv");
  
  // Multi-API poster handling (TMDB / OMDb / TVmaze / Jikan)
  const rawPoster = item.poster || item.poster_path;
  const imageUrl = rawPoster
    ? rawPoster.startsWith("http")
      ? rawPoster
      : `https://image.tmdb.org/t/p/w500${rawPoster}`
    : null;
  
  const voteCount = item.vote_count || 0;
  const originalLang = (item.original_language || item.originalLanguage || "en").toLowerCase();
  const genreIds = item.genre_ids || [];

  // Determine Origin Pill Data
  const getOriginData = (lang) => {
    switch (lang) {
      case "ko": return { label: "K-Drama", flag: "🇰🇷" };
      case "hi": return { label: "Bollywood", flag: "🇮🇳" };
      case "ja": return { label: "Anime", flag: "🇯🇵" };
      case "zh": return { label: "C-Drama", flag: "🇨🇳" };
      case "en": return { label: "Hollywood", flag: "🇺🇸" };
      case "tr": return { label: "Turkish", flag: "🇹🇷" };
      case "es": return { label: "Spanish", flag: "🇪🇸" };
      case "fr": return { label: "French", flag: "🇫🇷" };
      default: return { label: "International", flag: "🌍" };
    }
  };

  const origin = getOriginData(originalLang);

  // Business Logic for Multi-Audio Badge
  const isHighlyPopular = voteCount > 1000;
  const isAnime = originalLang === "ja" && genreIds.includes(16);
  const isKDrama = originalLang === "ko";
  const isHollywood = originalLang === "en";
  const showMultiAudioBadge = isHighlyPopular || isAnime || isKDrama || isHollywood;

  return (
    <Link
      href={`/watch/${mediaType}/${id}`}
      className="group relative flex flex-col w-full aspect-[2/3] bg-[#12141a] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_rgba(220,38,38,0.4)] hover:ring-1 hover:ring-red-900/50"
    >
      {/* Poster Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#1a1c23] text-gray-400 text-xs font-semibold">
          <span className="text-2xl mb-1">🎬</span>
          <span className="line-clamp-2">{title}</span>
        </div>
      )}

      {/* Dynamic Badge System (Top Left) */}
      <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-20">
        {showMultiAudioBadge && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_0_12px_rgba(220,38,38,0.6)] text-white">
            <span className="text-xs">🎙️</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              {isHighlyPopular && !isAnime && !isKDrama ? "🌐 Dubbed" : "Multi-Audio"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <span className="text-[10px]">{origin.flag}</span>
          <span className="text-[8px] sm:text-[9px] font-bold text-gray-200 uppercase tracking-widest">
            {origin.label}
          </span>
        </div>
      </div>

      {/* Base Gradient for Title Legibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Persistent Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20 transition-transform duration-300 group-hover:-translate-y-8">
        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md">
          {title}
        </h3>
      </div>

      {/* Hover Reveal Overlay (Glassmorphism) */}
      <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2 mb-2">
            {title}
          </h3>
          
          <div className="inline-flex items-center gap-1.5 bg-[#dc2626]/20 border border-[#dc2626]/50 rounded-lg p-1.5 backdrop-blur-md w-full">
            <span className="text-[#dc2626] text-xs">▶</span>
            <p className="text-[10px] sm:text-xs text-red-100 font-semibold leading-tight">
              Watch & Download HD
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}