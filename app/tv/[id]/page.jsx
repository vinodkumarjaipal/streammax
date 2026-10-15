import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchTMDB, getFullLanguageName } from "@/lib/tmdb";
import TvPlayerSection from "@/components/TvPlayerSection";

export default async function TvShowDetailsPage({ params }) {
  const resolvedParams = await params;
  const tvId = resolvedParams?.id;

  if (!tvId) return notFound();

  let show = null;
  try {
    show = await fetchTMDB(`/tv/${tvId}`, "append_to_response=credits");
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    return notFound();
  }

  if (!show || !show.id) return notFound();

  const releaseYear = (show.first_air_date || "").split("-")[0] || "N/A";
  const cast = show.credits?.cast?.slice(0, 10) || [];
  const language = getFullLanguageName(show.original_language);

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-20 pb-16">
      {/* BACKGROUND BACKDROP HEADER */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        {show.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name || "TV Show Backdrop"}
            fill
            priority
            className="object-cover opacity-25 filter blur-sm scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
        
        {/* VIDEO PLAYER WITH SEASON & EPISODE SELECTOR */}
        <TvPlayerSection tvId={show.id} seasons={show.seasons || []} title={show.name} />

        {/* SHOW METADATA SECTION */}
        <div className="mt-10 bg-[#1a1c23] border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8">
          
          {/* POSTER IMAGE */}
          <div className="w-48 sm:w-56 mx-auto md:mx-0 flex-shrink-0">
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-gray-700 shadow-lg">
              {show.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
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

          {/* METADATA INFO */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-gray-400 italic text-sm md:text-base mb-4">
                  "{show.tagline}"
                </p>
              )}

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6 text-xs md:text-sm font-semibold">
                <span className="bg-[#dc2626] text-white px-2.5 py-1 rounded-md shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-1">
                  ⭐ {show.vote_average ? show.vote_average.toFixed(1) : "N/A"}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
                  {releaseYear}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
                  {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700">
                  {show.number_of_episodes} Episodes
                </span>
                <span className="bg-black/60 text-gray-300 px-2.5 py-1 rounded-md border border-gray-700 uppercase">
                  [{language}]
                </span>
              </div>

              {/* Genre Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs font-medium text-gray-300 bg-[#0f1014] px-3 py-1 rounded-full border border-gray-700/80"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Storyplot */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-gray-200 uppercase tracking-wider mb-2 border-l-4 border-[#dc2626] pl-2">
                  Storyline
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {show.overview || "No overview available for this title."}
                </p>
              </div>
            </div>

            {/* CAST & CREW */}
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