"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

/**
 * Ultimate Multi-Server Video Player for StreamMax
 * Equipped with 6 resilient commercial streaming sources, multi-link download engine, and auto-fallback routing.
 */
export default function RealStreamPlayer({
  tmdbId,
  mediaType = "movie",
  season = 1,
  episode = 1,
  title = "this title",
}) {
  const [activeServerId, setActiveServerId] = useState("server1");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clean ID if prepended with prefix (omdb_tt..., tvmaze_..., mal_...)
  const rawId = String(tmdbId || "");
  const cleanId = rawId.replace(/^omdb_|^tvmaze_|^mal_/, "");
  const isImdb = cleanId.startsWith("tt");
  const isEpisodic = mediaType === "tv" || mediaType === "anime";

// Reset loading state when target media changes
useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(true);
  }, 0);
  return () => clearTimeout(timer);
}, [cleanId, season, episode, activeServerId]);
  // Dynamically generate high-uptime server URLs
  const servers = useMemo(() => {
    return [
      {
        id: "server1",
        name: "Server 1",
        badge: "Multi-Audio / Hindi",
        url: !isEpisodic
          ? `https://embed.smashystream.com/playere.php?${isImdb ? `imdb=${cleanId}` : `tmdb=${cleanId}`}`
          : `https://embed.smashystream.com/playere.php?${isImdb ? `imdb=${cleanId}` : `tmdb=${cleanId}`}&season=${season}&episode=${episode}`,
      },
      {
        id: "server2",
        name: "Server 2",
        badge: "Fast Multi-Lang",
        url: !isEpisodic
          ? `https://multiembed.mov/directstream.php?video_id=${cleanId}${isImdb ? "" : "&tmdb=1"}`
          : `https://multiembed.mov/directstream.php?video_id=${cleanId}${isImdb ? "" : "&tmdb=1"}&s=${season}&e=${episode}`,
      },
      {
        id: "server3",
        name: "Server 3",
        badge: "High Uptime",
        url: !isEpisodic
          ? `https://www.2embed.cc/embed/${cleanId}`
          : `https://www.2embed.cc/embedtv/${cleanId}&s=${season}&e=${episode}`,
      },
      {
        id: "server4",
        name: "Server 4",
        badge: "Ultra Fast",
        url: !isEpisodic
          ? `https://vidsrc.pro/embed/movie/${cleanId}`
          : `https://vidsrc.pro/embed/tv/${cleanId}/${season}/${episode}`,
      },
      {
        id: "server5",
        name: "Server 5",
        badge: "Global Fallback",
        url: !isEpisodic
          ? `https://vidsrc.me/embed/movie?${isImdb ? `imdb=${cleanId}` : `tmdb=${cleanId}`}`
          : `https://vidsrc.me/embed/tv?${isImdb ? `imdb=${cleanId}` : `tmdb=${cleanId}`}&season=${season}&episode=${episode}`,
      },
      {
        id: "server6",
        name: "Server 6",
        badge: "AutoEmbed HD",
        url: !isEpisodic
          ? `https://autoembed.co/movie/tmdb/${cleanId}`
          : `https://autoembed.co/tv/tmdb/${cleanId}-${season}-${episode}`,
      },
    ];
  }, [cleanId, isImdb, isEpisodic, season, episode]);

  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];

  const handleServerSwitch = useCallback((serverId) => {
    if (activeServerId !== serverId) {
      setIsLoading(true);
      setActiveServerId(serverId);
    }
  }, [activeServerId]);

  // Multi-Link Download Options
  const downloadMirrors = useMemo(() => {
    return [
      {
        name: "Fast Cloud Mirror (Multi-Quality)",
        desc: "Direct 1080p, 720p, 480p and subtitle options",
        url: !isEpisodic
          ? `https://embed.smashystream.com/download.php?tmdb=${cleanId}`
          : `https://embed.smashystream.com/download.php?tmdb=${cleanId}&season=${season}&episode=${episode}`,
      },
      {
        name: "VidSrc High Speed Portal",
        desc: "Instant download links with high bandwidth",
        url: `https://dl.vidsrc.vip/${isEpisodic ? "tv" : "movie"}/${cleanId}${isEpisodic ? `/${season}/${episode}` : ""}`,
      },
      {
        name: "MultiEmbed Direct Stream Mirror",
        desc: "Open direct player stream and right-click Save Video",
        url: `https://multiembed.mov/directstream.php?video_id=${cleanId}${isImdb ? "" : "&tmdb=1"}${isEpisodic ? `&s=${season}&e=${episode}` : ""}`,
      },
    ];
  }, [cleanId, isImdb, isEpisodic, season, episode]);

  const copyCurrentStream = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(activeServer.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!cleanId) {
    return (
      <div className="w-full aspect-video bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-gray-800 text-gray-400 p-6 shadow-xl">
        <span className="text-3xl mb-2">⚠️</span>
        <p className="font-semibold">Media ID missing. Unable to initialize streaming player.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 my-6">
      
      {/* 16:9 RESPONSIVE VIDEO CONTAINER */}
      <div className="relative w-full aspect-video bg-[#0b0c10] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-gray-800 group">
        
        {/* Loading State Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-gray-400">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#dc2626] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            <p className="text-sm font-bold tracking-widest uppercase text-white">
              Connecting to {activeServer.name}...
            </p>
            <p className="text-xs mt-2 text-gray-500 font-medium">
              If stream doesn&apos;t load in 5s, switch to another server below
            </p>
          </div>
        )}

        {/* Security Sandboxed Iframe */}
        <iframe
          key={`${activeServer.id}-${cleanId}-${season}-${episode}`}
          src={activeServer.url}
          title="StreamMax Ultra Player"
          onLoad={() => setIsLoading(false)}
          className={`absolute inset-0 w-full h-full border-0 z-10 bg-transparent transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="origin"
        />
      </div>

      {/* SERVER SELECTION & DOWNLOAD BAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 md:p-5 bg-[#1a1c23]/80 backdrop-blur-xl rounded-2xl border border-gray-800/80 shadow-lg">
        
        {/* Server Selectors */}
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
          <div className="flex items-center gap-2 min-w-max">
            {servers.map((server) => {
              const isActive = activeServerId === server.id;
              return (
                <button
                  key={server.id}
                  onClick={() => handleServerSwitch(server.id)}
                  className={`relative flex flex-col items-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[130px] sm:min-w-[145px] ${
                    isActive
                      ? "bg-[#dc2626] border-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                      : "bg-[#0f1014] border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-bold tracking-wide ${isActive ? "text-white" : "text-gray-300"}`}>
                    {server.name}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] mt-0.5 font-semibold uppercase tracking-wider ${isActive ? "text-red-100" : "text-gray-500"}`}>
                    {server.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download HD
          </button>

          <button
            onClick={copyCurrentStream}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f1014] hover:bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white font-medium text-xs sm:text-sm transition-colors"
            title="Copy current stream link"
          >
            {copied ? "✓ Copied" : "🔗 Share"}
          </button>
        </div>
      </div>

      {/* DOWNLOAD MODAL */}
      {isDownloadModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsDownloadModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#12141a] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#1a1c23]">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#dc2626]">📥</span>
                Download: {title} {isEpisodic ? `(S${season} E${episode})` : ""}
              </h3>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors bg-gray-800/60 p-1.5 rounded-lg"
                aria-label="Close download modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-3">
              <p className="text-xs sm:text-sm text-gray-400">
                Choose an available mirror below to download in 1080p / 720p HD:
              </p>

              {downloadMirrors.map((mirror, index) => (
                <a
                  key={index}
                  href={mirror.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-[#1a1c23] hover:bg-gray-800/80 border border-gray-700 hover:border-[#dc2626]/60 rounded-xl transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-[#dc2626] transition-colors">
                      {mirror.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {mirror.desc}
                    </span>
                  </div>
                  <span className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all text-lg font-bold">
                    →
                  </span>
                </a>
              ))}

              <div className="mt-2 p-3 bg-red-950/20 border border-[#dc2626]/30 rounded-xl flex items-start gap-2.5">
                <span className="text-sm text-[#dc2626] mt-0.5">ℹ️</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Downloads are hosted by verified cloud delivery mirrors. If a download mirror is slow in your region, try Mirror 2 or 3.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}