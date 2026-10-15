/**
 * StreamMax Unified Multi-API Data Aggregation Engine
 * High-performance, fault-tolerant data architecture combining TMDB, OMDb, TVmaze, and Jikan.
 */

import { TMDB_KEYS } from "./tmdb";

// ============================================================================
// CONFIGURATION & ENVIRONMENT KEYS
// ============================================================================

const OMDB_KEY = (process.env.OMDB_API_KEY || "8e4e5ba9").trim().replace(/^["']|["']$/g, "");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_BASE_URL = "https://www.omdbapi.com";
const TVMAZE_BASE_URL = "https://api.tvmaze.com";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// ============================================================================
// ROTATING FETCH & UTILITY HELPERS
// ============================================================================

let keyIdx = 0;
function getTmdbKey() {
  if (!TMDB_KEYS || TMDB_KEYS.length === 0) return "2cada65d0ee08aa1b49b8ddd5e0bbdad";
  return TMDB_KEYS[keyIdx % TMDB_KEYS.length];
}

function rotateKey() {
  if (TMDB_KEYS && TMDB_KEYS.length > 1) {
    keyIdx = (keyIdx + 1) % TMDB_KEYS.length;
  }
}

/**
 * Universal safe fetcher wrapped in a try/catch with timeout and Next.js revalidation cache
 */
async function safeFetch(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`[API HTTP ${response.status}] at ${url}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      console.warn(`[API Timeout]: ${url} timed out`);
    } else {
      console.error(`[API Network Exception]: Failed to fetch ${url}`, error.message);
    }
    return null;
  }
}

/**
 * TMDB Fetch Engine with automatic Key Rotation
 */
async function fetchTMDBWithRotation(endpoint, paramsStr = "") {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const maxAttempts = Math.min(3, TMDB_KEYS.length || 1);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getTmdbKey();
    try {
      const url = new URL(`${TMDB_BASE_URL}${cleanEndpoint}`);
      url.searchParams.set("api_key", key);

      if (paramsStr) {
        const customParams = new URLSearchParams(paramsStr.replace(/^\?/, ""));
        customParams.forEach((value, k) => url.searchParams.set(k, value));
      }

      const data = await safeFetch(url.toString(), {}, 8000);
      if (data && (data.results || data.id)) return data;

      rotateKey();
    } catch (err) {
      rotateKey();
    }
  }

  return null;
}

// ============================================================================
// STANDARDIZED SCHEMA NORMALIZERS
// ============================================================================

export function normalizeTMDB(item, defaultType = "movie") {
  if (!item || !item.id) return null;
  const mediaType = item.media_type || (item.title ? "movie" : "tv") || defaultType;
  const releaseDate = item.release_date || item.first_air_date || "";

  return {
    id: String(item.id),
    tmdbId: item.id,
    title: item.title || item.name || "Untitled",
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    poster_path: item.poster_path || null,
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
    backdrop_path: item.backdrop_path || null,
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    vote_average: item.vote_average || 0,
    releaseDate,
    release_date: releaseDate,
    first_air_date: releaseDate,
    mediaType: mediaType === "anime" ? "tv" : mediaType,
    media_type: mediaType === "anime" ? "tv" : mediaType,
    overview: item.overview || "No overview available.",
    originalLanguage: item.original_language ? item.original_language.toLowerCase() : "en",
    original_language: item.original_language || "en",
  };
}

export function normalizeTVmaze(item) {
  const show = item.show || item;
  if (!show || !show.id) return null;

  return {
    id: `tvmaze_${show.id}`,
    tmdbId: show.externals?.thetvdb || null,
    title: show.name || "Untitled Show",
    poster: show.image?.original || show.image?.medium || null,
    poster_path: show.image?.medium || null,
    backdrop: show.image?.original || null,
    backdrop_path: show.image?.original || null,
    rating: show.rating?.average ? Number(show.rating.average.toFixed(1)) : 0,
    vote_average: show.rating?.average || 0,
    releaseDate: show.premiered || "",
    release_date: show.premiered || "",
    first_air_date: show.premiered || "",
    mediaType: "tv",
    media_type: "tv",
    overview: show.summary ? show.summary.replace(/<[^>]*>?/gm, "") : "No summary available.",
    originalLanguage: show.language ? show.language.substring(0, 2).toLowerCase() : "en",
    original_language: show.language ? show.language.substring(0, 2).toLowerCase() : "en",
  };
}

export function normalizeJikan(item) {
  if (!item || !item.mal_id) return null;

  const poster = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null;
  const releaseDate = item.aired?.from ? item.aired.from.split("T")[0] : "";

  return {
    id: `mal_${item.mal_id}`,
    tmdbId: null,
    title: item.title_english || item.title || "Untitled Anime",
    poster,
    poster_path: poster,
    backdrop: poster,
    backdrop_path: poster,
    rating: item.score ? Number(item.score.toFixed(1)) : 0,
    vote_average: item.score || 0,
    releaseDate,
    release_date: releaseDate,
    first_air_date: releaseDate,
    mediaType: "tv",
    media_type: "tv",
    overview: item.synopsis || "No synopsis available.",
    originalLanguage: "ja",
    original_language: "ja",
  };
}

export function normalizeOMDb(item) {
  if (!item || !item.imdbID) return null;

  const poster = item.Poster && item.Poster !== "N/A" ? item.Poster : null;
  const rating = item.imdbRating && item.imdbRating !== "N/A" ? Number(parseFloat(item.imdbRating).toFixed(1)) : 0;
  const releaseDate = item.Released && item.Released !== "N/A" ? item.Released : item.Year || "";
  const mediaType = item.Type === "series" ? "tv" : "movie";

  return {
    id: `omdb_${item.imdbID}`,
    tmdbId: item.imdbID,
    imdbId: item.imdbID,
    title: item.Title || "Untitled",
    poster,
    poster_path: poster,
    backdrop: poster,
    backdrop_path: poster,
    rating,
    vote_average: rating,
    releaseDate,
    release_date: releaseDate,
    first_air_date: releaseDate,
    mediaType,
    media_type: mediaType,
    overview: item.Plot && item.Plot !== "N/A" ? item.Plot : "No synopsis available.",
    originalLanguage: "en",
    original_language: "en",
  };
}

/**
 * Deduplicate items by title and mediaType
 */
export function deduplicateResults(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || !item.title) return false;
    const key = `${item.title.toLowerCase().trim()}_${item.mediaType || item.media_type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// CORE EXPORTED API FUNCTIONS
// ============================================================================

/**
 * Unified Fault-Tolerant Search Engine across all providers (TMDB, TVmaze, Jikan, OMDb)
 */
export async function searchGlobalContent(query) {
  if (!query || typeof query !== "string" || !query.trim()) return [];

  // Input Sanitization: Trim and truncate query to prevent abuse
  const cleanQuery = encodeURIComponent(query.trim().slice(0, 100));

  try {
    // 1. Primary Search via TMDB
    const tmdbData = await fetchTMDBWithRotation("/search/multi", `query=${cleanQuery}&include_adult=false`);
    
    let tmdbResults = [];
    if (tmdbData?.results && Array.isArray(tmdbData.results)) {
      tmdbResults = tmdbData.results
        .filter((item) => {
          if (!item || item.media_type === "person") return false;
          // Filter out documentaries/shorts if unplayable
          if (item.genre_ids && item.genre_ids.includes(99)) return false;
          if (item.video === true) return false;
          return true;
        })
        .map((item) => normalizeTMDB(item))
        .filter(Boolean);
    }

    // If TMDB provided good results (at least 3 items), return them deduplicated
    if (tmdbResults.length >= 3) {
      return deduplicateResults(tmdbResults);
    }

    // 2. Multi-Provider Fallback (TVmaze + Jikan + OMDb)
    const [tvmazeRes, jikanRes, omdbRes] = await Promise.allSettled([
      safeFetch(`${TVMAZE_BASE_URL}/search/shows?q=${cleanQuery}`),
      safeFetch(`${JIKAN_BASE_URL}/anime?q=${cleanQuery}&limit=6`),
      OMDB_KEY ? safeFetch(`${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&s=${cleanQuery}`) : Promise.resolve(null),
    ]);

    const tvmazeItems = (tvmazeRes.status === "fulfilled" && Array.isArray(tvmazeRes.value))
      ? tvmazeRes.value.map(normalizeTVmaze)
      : [];

    const jikanItems = (jikanRes.status === "fulfilled" && Array.isArray(jikanRes.value?.data))
      ? jikanRes.value.data.map(normalizeJikan)
      : [];

    const omdbItems = (omdbRes.status === "fulfilled" && Array.isArray(omdbRes.value?.Search))
      ? omdbRes.value.Search.map(normalizeOMDb)
      : [];

    const combined = [
      ...tmdbResults,
      ...tvmazeItems,
      ...jikanItems,
      ...omdbItems,
    ].filter(Boolean);

    return deduplicateResults(combined);
  } catch (error) {
    console.error("[Multi-API Search Exception]:", error);
    return [];
  }
}

/**
 * Hybrid Worldwide Trending Feed
 */
export async function getGlobalTrending() {
  const [tmdbTrending, jikanTop] = await Promise.allSettled([
    fetchTMDBWithRotation("/trending/all/day"),
    safeFetch(`${JIKAN_BASE_URL}/top/anime?limit=6`),
  ]);

  const tmdbItems = (tmdbTrending.status === "fulfilled" && tmdbTrending.value?.results)
    ? tmdbTrending.value.results.map((item) => normalizeTMDB(item)).filter(Boolean)
    : [];

  const animeItems = (jikanTop.status === "fulfilled" && jikanTop.value?.data)
    ? jikanTop.value.data.map(normalizeJikan).filter(Boolean)
    : [];

  const combined = [];
  const maxLen = Math.max(tmdbItems.length, animeItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (tmdbItems[i]) combined.push(tmdbItems[i]);
    if (i % 3 === 0 && animeItems[i / 3]) combined.push(animeItems[i / 3]);
  }

  return deduplicateResults(combined);
}

/**
 * Details Fetcher with OMDb IMDb score enrichment
 */
export async function getItemDetails(id, mediaType = "movie") {
  if (!id) return null;

  // Handle Anime (Jikan)
  if (String(id).startsWith("mal_")) {
    const malId = String(id).replace("mal_", "");
    const animeRes = await safeFetch(`${JIKAN_BASE_URL}/anime/${malId}`);
    return normalizeJikan(animeRes?.data);
  }

  // Handle TVmaze
  if (String(id).startsWith("tvmaze_")) {
    const tvmazeId = String(id).replace("tvmaze_", "");
    const showRes = await safeFetch(`${TVMAZE_BASE_URL}/shows/${tvmazeId}`);
    return normalizeTVmaze(showRes);
  }

  // Handle OMDb
  if (String(id).startsWith("omdb_")) {
    const imdbId = String(id).replace("omdb_", "");
    if (OMDB_KEY) {
      const omdbRes = await safeFetch(`${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&i=${imdbId}&plot=full`);
      if (omdbRes) return normalizeOMDb(omdbRes);
    }
  }

  // Standard TMDB details
  const targetType = mediaType === "anime" ? "tv" : mediaType;
  const tmdbDetails = await fetchTMDBWithRotation(
    `/${targetType}/${id}`,
    "append_to_response=credits,recommendations,similar,external_ids,videos"
  );

  if (!tmdbDetails || !tmdbDetails.id) return null;

  const baseObject = normalizeTMDB(tmdbDetails, targetType);
  const imdbId = tmdbDetails.external_ids?.imdb_id;

  let omdbExtra = {};
  if (imdbId && OMDB_KEY) {
    const omdbRes = await safeFetch(`${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&i=${imdbId}`);
    if (omdbRes && omdbRes.Response === "True") {
      omdbExtra = {
        imdbRating: omdbRes.imdbRating !== "N/A" ? omdbRes.imdbRating : null,
        rated: omdbRes.Rated !== "N/A" ? omdbRes.Rated : null,
        awards: omdbRes.Awards !== "N/A" ? omdbRes.Awards : null,
      };
    }
  }

  return {
    ...baseObject,
    ...omdbExtra,
    genres: tmdbDetails.genres || [],
    seasons: tmdbDetails.seasons || [],
    runtime: tmdbDetails.runtime || null,
    number_of_seasons: tmdbDetails.number_of_seasons || 1,
    number_of_episodes: tmdbDetails.number_of_episodes || 1,
    cast: tmdbDetails.credits?.cast?.slice(0, 12) || [],
    videos: tmdbDetails.videos?.results || [],
    recommendations: (tmdbDetails.recommendations?.results || [])
      .map((item) => normalizeTMDB(item))
      .filter(Boolean),
  };
}