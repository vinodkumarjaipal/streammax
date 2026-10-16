"use client";

const imdbIdCache = new Map();

export async function getImdbId(tmdbId, type = "movie") {
  const normalizedId = String(tmdbId || "").trim();
  const normalizedType = type === "tv" ? "tv" : "movie";

  if (!normalizedId) return null;

  const cacheKey = `${normalizedType}:${normalizedId}`;
  if (imdbIdCache.has(cacheKey)) {
    return imdbIdCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `/api/tmdb/external-ids?tmdbId=${encodeURIComponent(
        normalizedId
      )}&type=${normalizedType}`,
      { cache: "force-cache" }
    );

    if (!response.ok) {
      throw new Error(`IMDb ID request failed with status ${response.status}`);
    }

    const data = await response.json();
    const imdbId = data.imdb_id || null;
    imdbIdCache.set(cacheKey, imdbId);
    return imdbId;
  } catch (error) {
    console.error("[IMDb ID Resolution]", error);
    return null;
  }
}
