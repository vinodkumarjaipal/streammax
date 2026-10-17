import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { fetchTMDB } from "@/lib/tmdb";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { id } = await params;

  if (!id) {
    return { title: "Movie Not Found", robots: { index: false } };
  }

  try {
    const movie = await fetchTMDB(`/movie/${id}`);
    const title = movie.title || "Movie";
    const description =
      movie.overview ||
      `Discover ${title}, including its rating, cast and storyline on StreamMax.`;
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined;

    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(`/movie/${id}`) },
      openGraph: {
        title: `${title} | StreamMax`,
        description,
        type: "video.movie",
        url: absoluteUrl(`/movie/${id}`),
        ...(poster ? { images: [poster] } : {}),
      },
    };
  } catch (error) {
    console.error("Error generating movie metadata:", error);
    return { title: "Movie Details" };
  }
}

// Helper function to format runtime into Hours and Minutes (e.g., 2h 15m)
function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export default async function MoviePage({ params }) {
  // Await params for modern Next.js App Router compatibility
  const resolvedParams = await params;
  const movieId = resolvedParams?.id;

  if (!movieId) return notFound();

  let movie = null;
  try {
    // Fetch movie metadata + credits in a single call
    movie = await fetchTMDB(
      `/movie/${movieId}`,
      "append_to_response=credits"
    );
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return notFound();
  }

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "N/A";
  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-20 pb-16">
      {/* BACKGROUND BACKDROP HEADER */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        {movie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title || "Movie Backdrop"}
            fill
            priority
            className="object-cover opacity-25 filter blur-sm scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
        
        {/* VIDEO PLAYER & STREAMING SECTION */}
        <VideoPlayer movieId={movieId} type="movie" title={movie.title} />

        {/* MOVIE METADATA & DETAILS SECTION */}
        <div className="mt-10 bg-[#1a1c23] border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8">
          
          {/* POSTER IMAGE */}
          <div className="w-48 sm:w-56 mx-auto md:mx-0 flex-shrink-0">
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-gray-700 shadow-lg">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* MOVIE INFO DETAILS */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Title & Tagline */}
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-gray-400 italic text-sm md:text-base mb-4">
                  &quot;{movie.tagline}&quot;
                </p>
              )}

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs md:text-sm font-semibold">
                <span className="bg-[#dc2626] text-white px-2.5 py-1 rounded-md shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-1">
                  ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
                  {releaseYear}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
                  {formatRuntime(movie.runtime)}
                </span>
                <span className="bg-black/60 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700 uppercase">
                  [{movie.original_language}]
                </span>
              </div>

              {/* Genre Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs font-medium text-gray-300 bg-[#0f1014] px-3 py-1 rounded-full border border-gray-700/80"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview / Story Plot */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider mb-2 border-l-4 border-[#dc2626] pl-2">
                  Storyline
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {movie.overview || "No overview available for this title."}
                </p>
              </div>
            </div>

            {/* CAST & CREW SECTION */}
            {cast.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider mb-4 border-l-4 border-[#dc2626] pl-2">
                  Top Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="flex items-center gap-3 bg-[#0f1014] p-2 rounded-lg border border-gray-800"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        {actor.profile_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">
                          {actor.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}