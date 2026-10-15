import Image from "next/image";
import Link from "next/link";
import { getFullLanguageName } from "@/lib/tmdb";

export default function HeroBanner({ movie }) {
  if (!movie) return null;

  const title = movie.title || movie.name || "Featured Title";
  const isTV = movie.media_type === "tv" || !!movie.first_air_date;
  const releaseYear = (movie.release_date || movie.first_air_date || "").split("-")[0] || "N/A";
  const language = getFullLanguageName(movie.original_language);
  const mediaType = isTV ? "tv" : "movie";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <div className="relative w-full h-[75vh] sm:h-[85vh] bg-[#0f1014] text-white overflow-hidden">
      {/* Background Poster Image */}
      {movie.backdrop_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={title}
          fill
          priority
          className="object-cover object-center opacity-65"
        />
      ) : (
        <div className="w-full h-full bg-[#1a1c23]" />
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/60 to-transparent" />

      {/* Content Block */}
      <div className="absolute bottom-12 sm:bottom-20 left-4 sm:left-12 max-w-2xl z-10 space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          <span className="bg-[#dc2626] text-white px-2.5 py-1 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            ⭐ {rating}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-gray-200 px-2.5 py-1 rounded border border-gray-700">
            {releaseYear}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-gray-200 px-2.5 py-1 rounded border border-gray-700">
            Language: {language}
          </span>
          <span className="bg-black/80 text-[#dc2626] px-2.5 py-1 rounded border border-[#dc2626] uppercase">
            {isTV ? "TV Series" : "Movie"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-md line-clamp-2">
          {title}
        </h1>

        {/* Overview Excerpt */}
        <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
          {movie.overview || "No overview available for this title."}
        </p>

        <div className="pt-2">
          <Link href={`/watch/${mediaType}/${movie.id}`}>
            <button className="bg-[#dc2626] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all duration-300 transform hover:-translate-y-0.5">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}