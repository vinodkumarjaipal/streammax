"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SERVER_BADGES = [
  "Multi-Audio / Hindi",
  "Fast Multi-Lang",
  "High Uptime",
  "Ultra Fast",
];

function buildStreamUrl(serverNumber, type, id, season, episode) {
  switch (serverNumber) {
    case 1:
      return type === "tv"
        ? `https://player.autoembed.cc/embed/${type}/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/${type}/${id}`;
    case 2:
      return type === "tv"
        ? `https://vidsrc.cc/v2/embed/${type}/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/${type}/${id}`;
    case 3:
      // FIX: Changed &s= to ?s= for proper query param parsing
      return type === "tv"
        ? `https://www.2embed.cc/embedtv/${id}?s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`;
    case 4:
      return type === "tv"
        ? `https://vidsrc.me/embed/${type}?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/${type}?tmdb=${id}`;
    default:
      return "";
  }
}

function buildDownloadUrl(type, id, season, episode, gateway) {
  const route = type === "tv" ? `${id}/${season}/${episode}` : id;

  if (gateway === "alternative") {
    return `https://vidsrc.net/download/${type === "tv" ? "tv" : "movie"}/${route}`;
  }

  return `https://dl.vidsrc.vip/${type === "tv" ? "tv" : "movie"}/${route}`;
}

export default function RealStreamPlayer({
  id,
  type = "movie",
  season = 1,
  episode = 1,
  title = "this title",
  tmdbId,
  mediaType,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const rawId = String(id || tmdbId || "");
  const cleanId = rawId.replace(/^omdb_|^tvmaze_|^mal_/, "");
  const normalizedType = type === "tv" || mediaType === "tv" ? "tv" : "movie";
  const normalizedSeason = Number(season) || 1;
  const normalizedEpisode = Number(episode) || 1;

  const [activeServer, setActiveServer] = useState("server1");

  // FIX: 6-Second Safety Timeout to prevent permanent loading overlay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [cleanId, normalizedSeason, normalizedEpisode, activeServer]);

  const servers = useMemo(
    () =>
      [1, 2, 3, 4].map((serverNumber) => ({
        id: `server${serverNumber}`,
        name: `Server ${serverNumber}`,
        badge: SERVER_BADGES[serverNumber - 1],
        url: buildStreamUrl(
          serverNumber,
          normalizedType,
          cleanId,
          normalizedSeason,
          normalizedEpisode
        ),
      })),
    [cleanId, normalizedEpisode, normalizedSeason, normalizedType]
  );

  const activeServerConfig =
    servers.find((server) => server.id === activeServer) || servers[0];
  const downloadUrl = buildDownloadUrl(
    normalizedType,
    cleanId,
    normalizedSeason,
    normalizedEpisode,
    "primary"
  );

  const handleServerSwitch = useCallback(
    (serverId) => {
      if (serverId !== activeServer) {
        setIsLoading(true);
        setActiveServer(serverId);
      }
    },
    [activeServer]
  );

  const copyCurrentStream = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(activeServerConfig.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [activeServerConfig.url]);

  if (!cleanId) {
    return (
      <div className="w-full aspect-video bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-gray-800 text-gray-400 p-6 shadow-xl">
        <span className="text-3xl mb-2">⚠️</span>
        <p className="font-semibold">
          Media ID missing. Unable to initialize streaming player.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 my-6">
      <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-gray-800 group">
        {/* FIX: Added pointer-events-none so touches go directly to video */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-gray-400 pointer-events-none">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#ef4444] rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase text-white">
              Connecting to {activeServerConfig.name}...
            </p>
            <p className="text-xs mt-2 text-gray-500 font-medium">
              If stream does not load in 5s, switch to another server below
            </p>
          </div>
        )}

        <iframe
          key={`${activeServerConfig.id}-${cleanId}-${normalizedSeason}-${normalizedEpisode}`}
          src={activeServerConfig.url}
          title={`Stream ${title}`}
          onLoad={() => setIsLoading(false)}
          className={`absolute top-0 left-0 w-full h-full border-0 z-10 bg-transparent transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin-when-cross-origin"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 md:p-5 bg-[#12141a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/80 shadow-lg">
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-2 min-w-max">
            {servers.map((server) => {
              const isActive = activeServer === server.id;

              return (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => handleServerSwitch(server.id)}
                  className={`relative flex flex-col items-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[130px] sm:min-w-[145px] ${
                    isActive
                      ? "bg-[#ef4444] border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "bg-[#0f1014] border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-wide ${
                      isActive ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {server.name}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] mt-0.5 font-semibold uppercase tracking-wider ${
                      isActive ? "text-red-100" : "text-gray-500"
                    }`}
                  >
                    {server.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download HD
          </a>

          <button
            type="button"
            onClick={copyCurrentStream}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f1014] hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white font-medium text-xs sm:text-sm transition-colors"
            title="Copy current stream link"
          >
            {copied ? "✓ Copied" : "🔗 Share"}
          </button>
        </div>
      </div>
    </div>
  );
}