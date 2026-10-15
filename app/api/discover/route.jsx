import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin") || "all";

    let data = [];

    if (origin === "janime") {
      const res = await fetchTMDB(
        "/discover/tv",
        "with_original_language=ja&with_genres=16&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "tv", media_type: "tv" }));
    } else if (origin === "bollywood") {
      const res = await fetchTMDB(
        "/discover/movie",
        "with_original_language=hi&with_origin_country=IN&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "movie", media_type: "movie" }));
    } else if (origin === "kdrama") {
      const res = await fetchTMDB(
        "/discover/tv",
        "with_original_language=ko&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "tv", media_type: "tv" }));
    } else if (origin === "turkish") {
      const res = await fetchTMDB(
        "/discover/tv",
        "with_original_language=tr&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "tv", media_type: "tv" }));
    } else if (origin === "cdrama") {
      const res = await fetchTMDB(
        "/discover/tv",
        "with_original_language=zh&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "tv", media_type: "tv" }));
    } else if (origin === "hollywood") {
      const res = await fetchTMDB(
        "/discover/movie",
        "with_original_language=en&sort_by=popularity.desc&include_adult=false"
      );
      data = (res?.results || []).map((i) => ({ ...i, mediaType: "movie", media_type: "movie" }));
    } else {
      const res = await fetchTMDB("/trending/all/day");
      data = res?.results || [];
    }

    return NextResponse.json(
      { results: data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[Discover Route Error]:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
