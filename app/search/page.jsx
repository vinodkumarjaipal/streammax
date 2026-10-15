"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// FILTER CONFIGURATIONS
const ORIGIN_FILTERS = [
  { id: "all", label: "All Origins", flag: "🌐" },
  { id: "bollywood", label: "Bollywood", flag: "🇮🇳", lang: "hi" },
  { id: "kdrama", label: "K-Drama", flag: "🇰🇷", lang: "ko" },
  { id: "janime", label: "J-Anime", flag: "🇯🇵", lang: "ja", genre: "16" },
  { id: "cdrama", label: "Chinese Drama", flag: "🇨🇳", lang: "zh" },
  { id: "hollywood", label: "Hollywood", flag: "🇺🇸", lang: "en" },
  { id: "turkish", label: "Turkish Dizi", flag: "🇹🇷", lang: "tr" },
];

const AUDIO_FILTERS = [
  { id: "all", label: "All Audio Tracks", icon: "🎧" },
  { id: "hindi", label: "Hindi Dubbed", icon: "🎙️" },
  { id: "multi", label: "Multi-Audio Available", icon: "🔊" },
  { id: "subbed", label: "Original with Subs", icon: "💬" },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialOrigin = searchParams.get("origin") || "all";
  const initialAudio = searchParams.get("audio") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [selectedOrigin, setSelectedOrigin] = useState(initialOrigin);
  const [selectedAudio, setSelectedAudio] = useState(initialAudio);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTipBanner, setShowTipBanner] = useState(true);

  // Sync state to URL params cleanly
  const updateURLParams = useCallback(
    (newQuery, newOrigin, newAudio) => {
      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newOrigin !== "all") params.set("origin", newOrigin);
      if (newAudio !== "all") params.set("audio", newAudio);

      const queryString = params.toString();
      router.push(`/search${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Perform content discovery or search through secure backend routes
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let data = [];

      if (query.trim()) {
        let searchQuery = query.trim();
        if (selectedAudio === "hindi" && !searchQuery.toLowerCase().includes("hindi")) {
          searchQuery = `${searchQuery} Hindi`;
        }

        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          data = json.results || [];
        }
      } else {
        // Securely discover content from the backend API route
        const res = await fetch(`/api/discover?origin=${encodeURIComponent(selectedOrigin)}`);
        if (res.ok) {
          const json = await res.json();
          data = json.results || [];
        }
      }

      // Client-side filtering by origin language if origin filter is set
      const originConfig = ORIGIN_FILTERS.find((f) => f.id === selectedOrigin);
      if (originConfig && originConfig.lang) {
        const filteredByOrigin = data.filter((item) => {
          const itemLang = item.originalLanguage || item.original_language || "";
          return itemLang.toLowerCase() === originConfig.lang;
        });
        data = filteredByOrigin.length > 0 ? filteredByOrigin : data;
      }

      setResults(data);
    } catch (err) {
      console.error("[Search Engine Exception]:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedOrigin, selectedAudio]);

  // Trigger search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [performSearch]);

  const handleOriginChange = (originId) => {
    setSelectedOrigin(originId);
    updateURLParams(query, originId, selectedAudio);
  };

  const handleAudioChange = (audioId) => {
    setSelectedAudio(audioId);
    updateURLParams(query, selectedOrigin, audioId);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    updateURLParams(value, selectedOrigin, selectedAudio);
  };

  const getAudioBadgeText = () => {
    if (selectedAudio === "hindi") return "Hindi Dubbed";
    if (selectedAudio === "multi") return "Multi-Audio";
    if (selectedAudio === "subbed") return "Subtitled";
    return "Multi-Audio Available";
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 pt-24 pb-24 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* PAGE HEADER & SEARCH BAR */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Global Search <span className="text-[#dc2626]">& Discover</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            Find blockbuster movies, K-dramas, anime, and series from all around the world in your preferred audio language.
          </p>

          {/* SEARCH INPUT FIELD */}
          <div className="relative w-full max-w-3xl mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search movies, TV series, anime, dramas..."
              className="w-full pl-12 pr-10 py-4 bg-[#1a1c23] border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] transition-all text-base md:text-lg shadow-2xl"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  updateURLParams("", selectedOrigin, selectedAudio);
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                aria-label="Clear query"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* GLOBAL VIEWER TIP BANNER */}
        {showTipBanner && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-950/40 via-[#1a1c23] to-[#12141a] border border-[#dc2626]/30 p-4 md:p-5 rounded-2xl shadow-xl flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="text-2xl sm:text-3xl shrink-0">🌍</span>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                <strong className="text-white font-bold">Global Viewer?</strong> Many of our international shows feature{" "}
                <span className="text-[#dc2626] font-semibold">Multi-Audio & Dubbed tracks</span>. Just play the video, click the{" "}
                <span className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-white text-xs font-mono">CC</span> or{" "}
                <span className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-white text-xs font-mono">⚙️ Gear</span> icon inside the player, or switch streaming servers.
              </p>
            </div>
            <button
              onClick={() => setShowTipBanner(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg bg-black/20 shrink-0"
              aria-label="Close tip"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* SMART GLOBAL FILTER SYSTEM */}
        <div className="space-y-5 bg-[#12141a] border border-gray-800/80 p-5 md:p-6 rounded-2xl shadow-xl">
          
          {/* FILTER SECTION 1: CONTENT ORIGIN CHIPS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <span>📍</span> Content Origin
              </span>
              {selectedOrigin !== "all" && (
                <button
                  onClick={() => handleOriginChange("all")}
                  className="text-xs text-[#dc2626] hover:underline font-medium"
                >
                  Reset Origin
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {ORIGIN_FILTERS.map((filter) => {
                const isActive = selectedOrigin === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleOriginChange(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all duration-200 ${
                      isActive
                        ? "bg-[#dc2626] text-white border-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                        : "bg-[#1a1c23] text-gray-300 border-gray-800 hover:border-gray-600 hover:bg-gray-800"
                    }`}
                  >
                    <span>{filter.flag}</span>
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-800/60" />

          {/* FILTER SECTION 2: AUDIO / DUB SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <span>🎧</span> Audio & Dubbing Preferences
              </span>
              {selectedAudio !== "all" && (
                <button
                  onClick={() => handleAudioChange("all")}
                  className="text-xs text-[#dc2626] hover:underline font-medium"
                >
                  Reset Audio
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AUDIO_FILTERS.map((audio) => {
                const isActive = selectedAudio === audio.id;
                return (
                  <button
                    key={audio.id}
                    onClick={() => handleAudioChange(audio.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                      isActive
                        ? "bg-white text-black font-bold border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-[#1a1c23] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    <span>{audio.icon}</span>
                    <span className="truncate">{audio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ACTIVE FILTER STATUS BAR */}
        <div className="flex items-center justify-between pt-2 border-b border-gray-800/60 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-300">
              {isLoading ? "Searching catalog..." : `${results.length} titles found`}
            </span>
            {selectedOrigin !== "all" && (
              <span className="bg-[#1a1c23] border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">
                Origin: {ORIGIN_FILTERS.find((f) => f.id === selectedOrigin)?.label}
              </span>
            )}
            {selectedAudio !== "all" && (
              <span className="bg-[#dc2626]/20 border border-[#dc2626]/40 text-[#dc2626] text-xs px-2.5 py-1 rounded-full font-medium">
                Audio: {AUDIO_FILTERS.find((f) => f.id === selectedAudio)?.label}
              </span>
            )}
          </div>
        </div>

        {/* RESULTS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-[#1a1c23] aspect-[2/3] rounded-2xl border border-gray-800" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item) => {
              const title = item.title || item.name || "Untitled";
              const rawPoster = item.poster || item.poster_path;
              const poster = rawPoster
                ? (rawPoster.startsWith("http") ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster}`)
                : null;
              const mediaType = item.mediaType || item.media_type || (item.title ? "movie" : "tv");
              const id = item.id || item.tmdbId;
              const rating = item.rating || item.vote_average ? Number(item.rating || item.vote_average).toFixed(1) : null;

              return (
                <Link
                  key={`${id}_${mediaType}`}
                  href={`/watch/${mediaType}/${id}`}
                  className="group relative bg-[#12141a] border border-gray-800/80 hover:border-gray-600 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] w-full bg-[#1a1c23] overflow-hidden">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-gray-500 font-medium">
                        🎬 No Poster
                      </div>
                    )}

                    {/* Dynamic Audio Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-black/80 backdrop-blur-md border border-gray-700 text-[#dc2626] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
                        {getAudioBadgeText()}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    {rating > 0 && (
                      <div className="absolute top-2 right-2 z-10 bg-black/80 backdrop-blur-md text-yellow-400 border border-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <span>★</span>
                        <span>{rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="p-3 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#12141a] to-[#0b0c10]">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#dc2626] transition-colors line-clamp-1">
                      {title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium mt-1">
                      <span className="uppercase">{mediaType}</span>
                      <span>Multi-Audio</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-[#12141a] rounded-3xl border border-gray-800 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center text-3xl mb-4">
              🔍
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Matching Titles Found</h3>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              We couldn't find anything matching your exact filter combination. Try resetting your origin or audio filter to explore more global titles.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedOrigin("all");
                setSelectedAudio("all");
                updateURLParams("", "all", "all");
              }}
              className="px-6 py-2.5 bg-[#dc2626] hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-gray-400">
          <div className="w-10 h-10 border-4 border-gray-800 border-t-[#dc2626] rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}