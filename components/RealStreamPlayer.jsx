"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImdbId } from "@/lib/ids";
import {
  buildAuthorizedDownloadUrl,
  buildServerConfigs,
} from "@/lib/servers";

function PlayerSkeleton({ message }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-gray-400">
      <div className="w-12 h-12 border-4 border-gray-800 border-t-[#ef4444] rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold tracking-widest uppercase text-white">
        {message}
      </p>
    </div>
  );
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
  const rawId = String(id || tmdbId || "");
  const cleanId = rawId.replace(/^omdb_|^tvmaze_|^mal_/, "");
  const normalizedType =
    type === "tv" || mediaType === "tv" ? "tv" : "movie";
  const normalizedSeason = Number(season) || 1;
  const normalizedEpisode = Number(episode) || 1;

  const [imdbId, setImdbId] = useState(null);
  const [resolvedKey, setResolvedKey] = useState("");
  const [activeServer, setActiveServer] = useState("server1");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (!cleanId) {
      return undefined;
    }

    getImdbId(cleanId, normalizedType).then((resolvedId) => {
      if (!cancelled) {
        setImdbId(resolvedId);
        setResolvedKey(`${normalizedType}:${cleanId}`);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cleanId, normalizedType]);

  const isResolvingId =
    Boolean(cleanId) && resolvedKey !== `${normalizedType}:${cleanId}`;

  const servers = useMemo(
    () =>
      buildServerConfigs({
        tmdbId: cleanId,
        imdbId,
        type: normalizedType,
        season: normalizedSeason,
        episode: normalizedEpisode,
      }),
    [cleanId, imdbId, normalizedEpisode, normalizedSeason, normalizedType]
  );

  const availableServers = useMemo(
    () => servers.filter((server) => server.url),
    [servers]
  );
  const activeServerConfig =
    servers.find((server) => server.id === activeServer) || servers[0];
  const activeServerUrl = activeServerConfig?.url || "";

  const switchToNextServer = useCallback(() => {
    const currentIndex = availableServers.findIndex(
      (server) => server.id === activeServer
    );

    if (availableServers.length < 2 || currentIndex < 0) {
      setHasLoadError(true);
      setIsLoading(false);
      setStatusMessage("Source not available - try another server");
      return;
    }

    const nextServer =
      availableServers[(currentIndex + 1) % availableServers.length];
    setActiveServer(nextServer.id);
    setIsLoading(true);
    setHasLoadError(false);
    setStatusMessage(`Switching to ${nextServer.name}...`);
  }, [activeServer, availableServers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      setHasLoadError(false);
      setStatusMessage("");
      setActiveServer((current) =>
        servers.some((server) => server.id === current && server.url)
          ? current
          : availableServers[0]?.id || "server1"
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [
    availableServers,
    normalizedEpisode,
    normalizedSeason,
    normalizedType,
    servers,
  ]);

  useEffect(() => {
    if (!activeServerUrl || isResolvingId) return undefined;

    timeoutRef.current = setTimeout(() => {
      setStatusMessage(`${activeServerConfig.name} timed out. Trying another source...`);
      switchToNextServer();
    }, 10000);

    return () => clearTimeout(timeoutRef.current);
  }, [activeServerConfig, activeServerUrl, isResolvingId, switchToNextServer]);

  const handleLoaded = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsLoading(false);
    setHasLoadError(false);
    setStatusMessage("");
  }, []);

  const handleIframeError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatusMessage(`${activeServerConfig.name} failed. Trying another source...`);
    switchToNextServer();
  }, [activeServerConfig.name, switchToNextServer]);

  const handleServerSwitch = useCallback(
    (serverId) => {
      const server = servers.find((item) => item.id === serverId);
      if (!server?.url || serverId === activeServer) return;
      clearTimeout(timeoutRef.current);
      setActiveServer(serverId);
      setIsLoading(true);
      setHasLoadError(false);
      setStatusMessage(`Connecting to ${server.name}...`);
    },
    [activeServer, servers]
  );

  const copyCurrentStream = useCallback(() => {
    if (!activeServerUrl || !navigator.clipboard) return;

    navigator.clipboard.writeText(activeServerUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeServerUrl]);

  const handleDownload = useCallback(() => {
    const downloadUrl = buildAuthorizedDownloadUrl({
      tmdbId: cleanId,
      type: normalizedType,
      season: normalizedSeason,
      episode: normalizedEpisode,
    });

    if (!downloadUrl) {
      setStatusMessage("Downloads are not configured for this site.");
      return;
    }

    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  }, [cleanId, normalizedEpisode, normalizedSeason, normalizedType]);

  if (!cleanId) {
    return (
      <div className="w-full aspect-video bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-gray-800 text-gray-400 p-6 shadow-xl">
        <p className="font-semibold">Media ID missing. Unable to initialize player.</p>
      </div>
    );
  }

  if (!isResolvingId && !imdbId && !availableServers.length) {
    return (
      <div className="w-full aspect-video bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-gray-800 text-gray-400 p-6 shadow-xl">
        <p className="font-semibold text-white">Source not available.</p>
        <p className="text-sm mt-2">This title has no configured playback source.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 my-6">
      <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-gray-800">
        {(isResolvingId || isLoading) && (
          <PlayerSkeleton
            message={
              isResolvingId
                ? "Resolving media ID..."
                : `Connecting to ${activeServerConfig?.name || "source"}...`
            }
          />
        )}

        {hasLoadError && !isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-gray-300">
            <p className="font-semibold text-white">Source not available - try another server</p>
            <button
              type="button"
              onClick={switchToNextServer}
              className="mt-4 rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-bold text-white"
            >
              Try another server
            </button>
          </div>
        )}

        {activeServerConfig?.url && !isResolvingId && (
          <iframe
            key={`${activeServerConfig.id}-${cleanId}-${imdbId || "pending"}-${normalizedSeason}-${normalizedEpisode}`}
            src={`/api/embed?url=${encodeURIComponent(activeServerConfig.url)}`}
            title={`Stream ${title}`}
            onLoad={handleLoaded}
            onError={handleIframeError}
            className={`absolute inset-0 h-full w-full border-0 bg-transparent transition-opacity duration-300 ${
              isLoading || isResolvingId ? "opacity-0" : "opacity-100"
            }`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
            loading="lazy"
          />
        )}
      </div>

      {statusMessage && (
        <p role="status" className="text-center text-sm text-amber-300">
          {statusMessage}
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-800/80 bg-[#12141a]/80 p-4 shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full gap-2 overflow-x-auto pb-2 custom-scrollbar lg:pb-0">
          {servers.map((server) => (
            <button
              key={server.id}
              type="button"
              disabled={!server.url}
              onClick={() => handleServerSwitch(server.id)}
              className={`min-w-[130px] rounded-xl border px-4 py-2 transition-all ${
                activeServer === server.id
                  ? "border-[#ef4444] bg-[#ef4444] text-white"
                  : "border-gray-700 bg-[#0f1014] text-gray-300 hover:border-gray-500"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span className="block text-xs font-bold sm:text-sm">{server.name}</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider">
                {server.url ? server.badge : "Not configured"}
              </span>
            </button>
          ))}
        </div>

        <div className="flex w-full shrink-0 items-center gap-3 lg:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 lg:flex-none"
          >
            Download
          </button>
          <button
            type="button"
            onClick={copyCurrentStream}
            disabled={!activeServerUrl}
            className="rounded-xl border border-gray-700 bg-[#0f1014] px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-40"
          >
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
