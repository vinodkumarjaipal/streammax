import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RealStreamPlayer from "@/components/RealStreamPlayer";
import TvPlayerSection from "@/components/TvPlayerSection";
import MovieCard from "@/components/MovieCard";
import { getItemDetails } from "@/lib/api";
import { getMediaDetails, getFullLanguageName } from "@/lib/tmdb";

// Dynamic Dynamic Metadata for Search Engines
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { type = "movie", id } = resolvedParams || {};

  if (!id) return { title: "Title Not Found" };

  let mediaData = null;
  try {
    mediaData = await getItemDetails(id, type);
  } catch (err) {
    // Ignore error for fallback
  }

  if (!mediaData && !isNaN(id)) {
    try {
      mediaData = await getMediaDetails(id, type);
    } catch (err) {
      // Ignore fallback error
    }
  }

  if (!mediaData) {
    return { title: "Title Not Found" };
  }

  const title = mediaData.title || mediaData.name || "Watch Stream";
  const overview = mediaData.overview
    ? mediaData.overview.slice(0, 160)
    : `Stream ${title} in HD with multi-audio and subtitles on StreamMax.`;
  const poster = mediaData.poster || (mediaData.poster_path ? `https://image.tmdb.org/t/p/w500${mediaData.poster_path}` : null);

  return {
    title: `${title} - Watch Free in HD`,
    description: overview,
    openGraph: {
      title: `${title} | StreamMax`,
      description: overview,
      images: poster ? [{ url: poster }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | StreamMax`,
      description: overview,
      images: poster ? [poster] : [],
    },
  };
}

export default async function WatchPage({ params }) {
  const resolvedParams = await params;
  const { type = "movie", id } = resolvedParams || {};

  if (!id) return notFound();

  let mediaData = null;

  try {
    // 1. Try unified multi-api details fetcher first
    mediaData = await getItemDetails(id, type);
  } catch (err) {
    console.error("[Watch Page API fetch error]:", err);
  }

  // Fallback to standard TMDB details if needed
  if (!mediaData && !isNaN(id)) {
    try {
      const tmdbFallback = await getMediaDetails(id, type);
      if (tmdbFallback) {
        mediaData = {
          id: String(tmdbFallback.id),
          tmdbId: tmdbFallback.id,
          title: tmdbFallback.title || tmdbFallback.name || "Untitled",
          overview: tmdbFallback.overview || "",
          poster: tmdbFallback.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbFallback.poster_path}` : null,
          backdrop: tmdbFallback.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbFallback.backdrop_path}` : null,
          rating: tmdbFallback.vote_average ? Number(tmdbFallback.vote_average.toFixed(1)) : 0,
          releaseDate: tmdbFallback.release_date || tmdbFallback.first_air_date || "",
          mediaType: type,
          seasons: tmdbFallback.seasons || [],
          genres: tmdbFallback.genres || [],
          cast: tmdbFallback.credits?.cast?.slice(0, 10) || [],
          recommendations: tmdbFallback.recommendations?.results || [],
          originalLanguage: tmdbFallback.original_language || "en",
        };
      }
    } catch (fallbackErr) {
      console.error("[Watch Page TMDB Fallback error]:", fallbackErr);
    }
  }

  if (!mediaData) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-4">🎬</span>
        <h1 className="text-2xl font-bold mb-2">Title Not Found</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          We couldn&apos;t load media details for this item. It might have been removed or the ID is invalid.
        </p>
        <Link
          href="/"
          className="bg-[#dc2626] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const title = mediaData.title || mediaData.name || "Featured Title";
  const isTV = type === "tv" || mediaData.mediaType === "tv" || Boolean(mediaData.seasons && mediaData.seasons.length > 0);
  const releaseYear = (mediaData.releaseDate || mediaData.release_date || "").split("-")[0] || "N/A";
  const rating = mediaData.rating || mediaData.vote_average ? Number(mediaData.rating || mediaData.vote_average).toFixed(1) : "N/A";
  const language = getFullLanguageName(mediaData.originalLanguage || mediaData.original_language);
  const seasons = mediaData.seasons || [];

  // Structured Data / Rich Snippets Schema for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isTV ? "TVSeries" : "Movie",
    name: title,
    description: mediaData.overview || "",
    image: mediaData.poster ? [mediaData.poster] : [],
    datePublished: mediaData.releaseDate || mediaData.release_date || undefined,
    aggregateRating:
      rating !== "N/A"
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            bestRating: "10",
            worstRating: "1",
            ratingCount: 100,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-16">
      {/* Google Rich Snippets JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP NAVIGATION BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span> Back to Catalog
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 px-2.5 py-1 rounded-md uppercase">
              {isTV ? "TV Series" : "Movie"}
            </span>
            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
              HD / Multi-Audio
            </span>
          </div>
        </div>

        {/* TITLE & QUICK STATS */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              ★ {rating}
            </span>
            <span>•</span>
            <span>{releaseYear}</span>
            <span>•</span>
            <span>Language: {language}</span>
            {mediaData.imdbRating && (
              <>
                <span>•</span>
                <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold text-xs">
                  IMDb {mediaData.imdbRating}
                </span>
              </>
            )}
          </div>
        </div>

        {/* STREAMING VIDEO PLAYER & CONTROLS */}
        <div className="w-full">
          {isTV && seasons.length > 0 ? (
            <TvPlayerSection
              tvId={mediaData.tmdbId || id}
              seasons={seasons}
              title={title}
            />
          ) : (
            <RealStreamPlayer
              tmdbId={mediaData.tmdbId || id}
              mediaType={isTV ? "tv" : "movie"}
              title={title}
            />
          )}
        </div>

        {/* DETAILS & STORYLINE CARD */}
        <div className="bg-[#1a1c23] border border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Poster */}
          {mediaData.poster && (
            <div className="w-36 sm:w-48 mx-auto md:mx-0 flex-shrink-0">
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                <Image
                  src={mediaData.poster}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                Storyline
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {mediaData.overview || "No detailed synopsis available for this title."}
              </p>
            </div>

            {/* Genres */}
            {mediaData.genres && mediaData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {mediaData.genres.map((genre, idx) => (
                  <span
                    key={genre.id || idx}
                    className="text-xs font-semibold text-gray-300 bg-[#0f1014] px-3 py-1 rounded-full border border-gray-700"
                  >
                    {genre.name || genre}
                  </span>
                ))}
              </div>
            )}

            {/* Cast preview */}
            {mediaData.cast && mediaData.cast.length > 0 && (
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Starring Cast
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                  {mediaData.cast.map((c, i) => (
                    <span key={i} className="bg-[#0f1014] px-2.5 py-1 rounded-lg border border-gray-800">
                      {c.name} {c.character ? `(${c.character})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIMILAR RECOMMENDATIONS */}
        {mediaData.recommendations && mediaData.recommendations.length > 0 && (
          <div className="pt-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#dc2626] rounded-full"></span>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaData.recommendations.slice(0, 6).map((rec) => (
                <MovieCard key={rec.id} item={rec} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}