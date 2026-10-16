"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const SERVER_BADGES = [
  "Multi-Audio / Hindi",
  "Fast Multi-Lang",
  "High Uptime",
  "Ultra Fast",
];

function buildStreamUrl(serverNumber, type, id, season, episode) {
  const route = type === "tv" ? `${id}/${season}/${episode}` : id;

  switch (serverNumber) {
    case 1:
      return type === "tv"
        ? `https://vidlink.pro/tv/${route}`
        : `https://vidlink.pro/movie/${route}`;
    case 2:
      return type === "tv"
        ? `https://vidsrc.pro/embed/tv/${route}`
        : `https://vidsrc.pro/embed/movie/${route}`;
    case 3:
      return type === "tv"
        ? `https://embed.su/embed/tv/${route}`
        : `https://embed.su/embed/movie/${route}`;
    case 4:
      return type === "tv"
        ? `https://vidsrc.cc/v2/embed/tv/${route}`
        : `https://vidsrc.cc/v2/embed/movie/${route}`;
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
  const [activeServerId, setActiveServerId] = useState("server1");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawId = String(id || tmdbId || "");
  const cleanId = rawId.replace(/^omdb_|^tvmaze_|^mal_/, "");
  const normalizedType = type === "tv" || mediaType === "tv" ? "tv" : "movie";
  const normalizedSeason = Number(season) || 1;
  const normalizedEpisode = Number(episode) || 1;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(true), 0);
    return () => clearTimeout(timer);
  }, [cleanId, normalizedSeason, normalizedEpisode, activeServerId]);

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

  const activeServer =
    servers.find((server) => server.id === activeServerId) || servers[0];

  const downloadMirrors = useMemo(
    () => [
      {
        name: "VidLink Download Gateway",
        desc: "Direct 1080p, 720p and subtitle options",
        url: buildDownloadUrl(
          normalizedType,
          cleanId,
          normalizedSeason,
          normalizedEpisode,
          "primary"
        ),
      },
      {
        name: "VidSrc Pro Download Gateway",
        desc: "High-bandwidth extraction mirror",
        url: buildDownloadUrl(
          normalizedType,
          cleanId,
          normalizedSeason,
          normalizedEpisode,
          "primary"
        ),
      },
      {
        name: "Embed.su Download Gateway",
        desc: "Alternative direct media gateway",
        url: buildDownloadUrl(
          normalizedType,
          cleanId,
          normalizedSeason,
          normalizedEpisode,
          "primary"
        ),
      },
      {
        name: "VidSrc CC Alternative Gateway",
        desc: "Backup download route",
        url: buildDownloadUrl(
          normalizedType,
          cleanId,
          normalizedSeason,
          normalizedEpisode,
          "alternative"
        ),
      },
    ],
    [cleanId, normalizedEpisode, normalizedSeason, normalizedType]
  );

  const handleServerSwitch = useCallback(
    (serverId) => {
      if (serverId !== activeServerId) {
        setIsLoading(true);
        setActiveServerId(serverId);
      }
    },
    [activeServerId]
  );

  const copyCurrentStream = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(activeServer.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [activeServer.url]);

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
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-gray-400">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#ef4444] rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase text-white">
              Connecting to {activeServer.name}...
            </p>
            <p className="text-xs mt-2 text-gray-500 font-medium">
              If stream does not load in 5s, switch to another server below
            </p>
          </div>
        )}

        <iframe
          key={`${activeServer.id}-${cleanId}-${normalizedSeason}-${normalizedEpisode}`}
          src={activeServer.url}
          title={`Stream ${title}`}
          onLoad={() => setIsLoading(false)}
          className={`absolute top-0 left-0 w-full h-full border-0 z-10 bg-transparent transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; clipboard-write; gyroscope"
          allowFullScreen
          referrerPolicy="origin"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 md:p-5 bg-[#12141a]/80 backdrop-blur-xl rounded-2xl border border-gray-800/80 shadow-lg">
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-2 min-w-max">
            {servers.map((server) => {
              const isActive = activeServerId === server.id;

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
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download HD
          </button>

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

      {isDownloadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsDownloadModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#12141a] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#1a1c23]">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">📥</span>
                Download: {title}{" "}
                {normalizedType === "tv"
                  ? `(S${normalizedSeason} E${normalizedEpisode})`
                  : ""}
              </h2>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors bg-gray-800/60 p-1.5 rounded-lg"
                aria-label="Close download modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <p className="text-xs sm:text-sm text-gray-400">
                Choose an available mirror below to download in HD:
              </p>

              {downloadMirrors.map((mirror) => (
                <a
                  key={mirror.name}
                  href={mirror.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center justify-between p-3.5 bg-[#1a1c23] hover:bg-gray-800/80 border border-gray-700 hover:border-emerald-500/60 rounded-xl transition-all group"
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {mirror.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {mirror.desc}
                    </span>
                  </span>
                  <span className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all text-lg font-bold">
                    →
                  </span>
                </a>
              ))}

              <div className="mt-2 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                <span className="text-sm text-emerald-400 mt-0.5">ℹ️</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  If one gateway is unavailable in your region, try another mirror.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
