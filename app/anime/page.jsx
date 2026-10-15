import { getAnime } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import Link from "next/link";

export const revalidate = 3600;

export default async function AnimePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams?.page) || 1);
  const animeList = await getAnime(page);

  return (
    <div className="min-h-screen bg-[#0f1014] pt-28 pb-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-2 h-8 bg-[#dc2626] rounded-full"></span>
          <h1 className="text-3xl font-black text-white tracking-tight">Anime Collection</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span>Page {page}</span>
        </div>
      </div>

      {animeList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {animeList.map((anime) => (
              <MovieCard key={anime.id} item={{ ...anime, media_type: "tv" }} />
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {page > 1 && (
              <Link
                href={`/anime?page=${page - 1}`}
                className="px-5 py-2.5 rounded-xl bg-[#1a1c23] hover:bg-gray-800 border border-gray-700 text-white font-bold text-sm transition-colors"
              >
                ← Previous Page
              </Link>
            )}
            <Link
              href={`/anime?page=${page + 1}`}
              className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-lg"
            >
              Next Page →
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>No anime series found at the moment.</p>
        </div>
      )}
    </div>
  );
}