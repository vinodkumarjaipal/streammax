import { fetchTMDB } from "@/lib/tmdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!tmdbId || !/^\d+$/.test(tmdbId)) {
    return Response.json({ error: "A numeric TMDB ID is required." }, { status: 400 });
  }

  const data = await fetchTMDB(`/${type}/${tmdbId}/external_ids`);
  return Response.json({ imdb_id: data?.imdb_id || null });
}
