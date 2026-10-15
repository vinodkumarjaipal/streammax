"use client";

import { useState, useEffect } from "react";
import { fetchTMDB } from "@/lib/tmdb";

/**
 * Dynamic Lightbox Overlay for Trailer Playback
 */
export default function TrailerModal({ isOpen, onClose, mediaId, mediaType = "movie" }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !mediaId) return;

    let isMounted = true;
    setLoading(true);

    async function loadTrailer() {
      try {
        const data = await fetchTMDB(`/${mediaType}/${mediaId}/videos`);
        const videos = data?.results || [];
        // Priority: Official Trailer -> Teaser -> Clip
        const official =
          videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
          videos.find((v) => v.site === "YouTube");

        if (isMounted) {
          setTrailerKey(official ? official.key : null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Trailer fetch error:", e);
        if (isMounted) setLoading(false);
      }
    }

    loadTrailer();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mediaId, mediaType]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#1a1c23] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 text-white font-bold flex items-center justify-center hover:bg-[#dc2626] transition-colors"
        >
          ✕
        </button>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Fetching Trailer...</span>
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
              title="Official Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-gray-400 text-sm">No official trailer available for this title.</div>
          )}
        </div>
      </div>
    </div>
  );
}