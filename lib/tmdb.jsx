/**
 * StreamMax TMDB Engine - Global Mega-Streaming Edition
 * Enterprise-grade resilience with multi-key rotation, timeout handling, and comprehensive fallbacks.
 */

const BASE_URL = "https://api.themoviedb.org/3";

// Key rotation pool for high-availability
const RAW_KEYS = [
  process.env.TMDB_KEY_1,
  process.env.TMDB_KEY_2,
  process.env.TMDB_API_KEY,
  process.env.NEXT_PUBLIC_TMDB_KEY_1,
  process.env.NEXT_PUBLIC_TMDB_KEY_2,
  process.env.NEXT_PUBLIC_TM_DB_KEY_1,
  process.env.NEXT_PUBLIC_TMDB_API_KEY,
  "2cada65d0ee08aa1b49b8ddd5e0bbdad", // Verified reliable fallback key
  "9d3775384f4c3fd4a2891662c0f1e26d",
];

export const TMDB_KEYS = RAW_KEYS
  .map((k) => k?.trim().replace(/^["']|["']$/g, ""))
  .filter((k) => k && k.length >= 20 && !k.includes("aapki_"));

let activeKeyIndex = 0;

function getActiveKey() {
  if (TMDB_KEYS.length === 0) return "";
  return TMDB_KEYS[activeKeyIndex % TMDB_KEYS.length];
}

function rotateKey() {
  if (TMDB_KEYS.length > 1) {
    activeKeyIndex = (activeKeyIndex + 1) % TMDB_KEYS.length;
    console.warn(`[TMDB Rotation]: Switched to key index ${activeKeyIndex}`);
  }
}

/**
 * ISO 639-1 Language Code Mapping Dictionary
 */
export const LANGUAGE_NAME_MAP = {
  en: "English", hi: "Hindi", ko: "Korean", ja: "Japanese", 
  es: "Spanish", tr: "Turkish", zh: "Mandarin", fr: "French", 
  de: "German", it: "Italian", pt: "Portuguese", ru: "Russian",
  te: "Telugu", ta: "Tamil", ml: "Malayalam", ar: "Arabic",
  th: "Thai", vi: "Vietnamese", id: "Indonesian", ur: "Urdu",
};

export function getFullLanguageName(code) {
  if (!code) return "Unknown";
  const normalized = String(code).trim().toLowerCase();
  return LANGUAGE_NAME_MAP[normalized] || normalized.toUpperCase();
}

/**
 * Central safe fetcher for TMDB with auto-timeout and key rotation
 */
async function fetchFromTMDB(endpoint, params = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Try available keys if a call encounters rate-limiting or auth failure
  const maxAttempts = Math.min(3, TMDB_KEYS.length || 1);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = getActiveKey();
    if (!key) {
      console.warn("[TMDB Warning]: No API key configured.");
      return { results: [] };
    }

    try {
      const url = new URL(`${BASE_URL}${cleanEndpoint}`);
      url.searchParams.set("api_key", key);

      if (typeof params === "string") {
        const cleanParams = params.replace(/^\?/, "");
        const parsed = new URLSearchParams(cleanParams);
        parsed.forEach((val, k) => url.searchParams.set(k, val));
      } else if (params && typeof params === "object") {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            url.searchParams.set(k, String(v));
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429 || response.status === 401) {
        console.warn(`[TMDB RateLimit/Auth ${response.status}]: Rotating key and retrying...`);
        rotateKey();
        continue;
      }

      if (!response.ok) {
        console.error(`[TMDB HTTP Error ${response.status}] at "${endpoint}"`);
        return { results: [] };
      }

      const data = await response.json();
      return data || { results: [] };
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(`[TMDB Timeout]: Request to ${endpoint} timed out after 8s`);
      } else {
        console.error(`[TMDB Network Exception] on "${endpoint}":`, error.message);
      }
      rotateKey();
    }
  }

  return { results: [] };
}

export async function fetchTMDB(endpoint, params = "") {
  return await fetchFromTMDB(endpoint, params);
}

// ============================================================================
// CONTENT CATEGORIES
// ============================================================================

/** 1. Global Trending */
export async function getGlobalTrending(page = 1) {
  const data = await fetchFromTMDB("/trending/all/day", { page });
  return data?.results || [];
}

export async function getTrending(page = 1) {
  return await getGlobalTrending(page);
}

/** 2. Hollywood Blockbusters */
export async function getHollywoodBlockbusters(page = 1) {
  const data = await fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "en",
    sort_by: "revenue.desc",
    "vote_count.gte": 2000,
    include_adult: false,
  });
  return data?.results || [];
}

/** 3. Korean Dramas */
export async function getKoreanDramas(page = 1) {
  const data = await fetchFromTMDB("/discover/tv", {
    page,
    with_original_language: "ko",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

/** 4. Turkish Series */
export async function getTurkishSeries(page = 1) {
  const data = await fetchFromTMDB("/discover/tv", {
    page,
    with_original_language: "tr",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

/** 5. Spanish Hits */
export async function getSpanishHits(type = "tv", page = 1) {
  const endpoint = type === "movie" ? "/discover/movie" : "/discover/tv";
  const data = await fetchFromTMDB(endpoint, {
    page,
    with_original_language: "es",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

/** 6A. Bollywood Movies */
export async function getBollywoodMovies(page = 1) {
  const data = await fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "hi",
    with_origin_country: "IN",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

/** 6B. Indian Web Series */
export async function getIndianSeries(page = 1) {
  const data = await fetchFromTMDB("/discover/tv", {
    page,
    with_original_language: "hi",
    with_origin_country: "IN",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

/** 7. Japanese Anime & Collection (Supports both naming conventions) */
export async function getJapaneseAnime(page = 1) {
  const data = await fetchFromTMDB("/discover/tv", {
    page,
    with_original_language: "ja",
    with_genres: "16",
    sort_by: "popularity.desc",
    include_adult: false,
  });
  return data?.results || [];
}

// Aliases for compatibility across pages
export const getAnime = getJapaneseAnime;

/** 8. General Movie & TV Feeds */
export async function getMovies(page = 1, extraParams = "") {
  let params = { page, sort_by: "popularity.desc", include_adult: false };
  if (typeof extraParams === "string" && extraParams) {
    const parsed = new URLSearchParams(extraParams);
    parsed.forEach((val, k) => { params[k] = val; });
  } else if (typeof extraParams === "object") {
    params = { ...params, ...extraParams };
  }
  const data = await fetchFromTMDB("/discover/movie", params);
  return data?.results || [];
}

export async function getTvShows(page = 1, extraParams = "") {
  let params = { page, sort_by: "popularity.desc", include_adult: false };
  if (typeof extraParams === "string" && extraParams) {
    const parsed = new URLSearchParams(extraParams);
    parsed.forEach((val, k) => { params[k] = val; });
  } else if (typeof extraParams === "object") {
    params = { ...params, ...extraParams };
  }
  const data = await fetchFromTMDB("/discover/tv", params);
  return data?.results || [];
}

export async function getPopularMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/popular", { page });
  return data?.results || [];
}

export async function getTopRatedMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/top_rated", { page });
  return data?.results || [];
}

export async function getUpcomingMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/upcoming", { page });
  return data?.results || [];
}

export async function getNowPlayingMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/now_playing", { page });
  return data?.results || [];
}

export async function getPopularTV(page = 1) {
  const data = await fetchFromTMDB("/tv/popular", { page });
  return data?.results || [];
}

export async function getTopRatedTV(page = 1) {
  const data = await fetchFromTMDB("/tv/top_rated", { page });
  return data?.results || [];
}

// ============================================================================
// DETAILS & SEARCH
// ============================================================================

export async function getMovieDetails(id) {
  if (!id) return null;
  return await fetchFromTMDB(`/movie/${id}`, {
    append_to_response: "credits,videos,recommendations,similar",
  });
}

export async function getTVDetails(id) {
  if (!id) return null;
  return await fetchFromTMDB(`/tv/${id}`, {
    append_to_response: "credits,videos,recommendations,similar",
  });
}

export async function getMediaDetails(id, type = "movie") {
  if (!id) return null;
  const endpoint = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
  return await fetchFromTMDB(endpoint, {
    append_to_response: "credits,videos,recommendations,similar",
  });
}

export async function searchMulti(query, page = 1) {
  if (!query || !query.trim()) return { results: [] };
  return await fetchFromTMDB("/search/multi", {
    query: query.trim(),
    page,
    include_adult: false,
  });
}

export async function discoverMovies(params = {}) {
  return await fetchFromTMDB("/discover/movie", params);
}

export async function discoverTV(params = {}) {
  return await fetchFromTMDB("/discover/tv", params);
}