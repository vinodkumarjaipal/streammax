"use client";

import { useState } from "react";
import RealStreamPlayer from "@/components/RealStreamPlayer";

export default function TvPlayerSection({ tvId, seasons = [], title = "Series" }) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const initialSeason = validSeasons.length > 0 ? validSeasons[0].season_number : 1;

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const currentSeasonObj = validSeasons.find(
    (s) => s.season_number === Number(selectedSeason)
  );
  const episodeCount = currentSeasonObj?.episode_count || 12;

  const handleSeasonChange = (e) => {
    const s = Number(e.target.value);
    setSelectedSeason(s);
    setSelectedEpisode(1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* EMBEDDED REAL STREAM PLAYER */}
      <RealStreamPlayer
        tmdbId={tvId}
        mediaType="tv"
        season={selectedSeason}
        episode={selectedEpisode}
        title={title}
      />

      {/* SEASON & EPISODE SELECTOR BAR */}
      <div className="w-full max-w-7xl bg-[#1a1c23] border border-gray-800 p-4 sm:p-5 rounded-2xl my-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Season Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Season:
          </label>
          <select
            value={selectedSeason}
            onChange={handleSeasonChange}
            className="bg-[#0f1014] text-white text-sm font-semibold rounded-xl px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-[#dc2626] w-full md:w-52 cursor-pointer transition-colors"
          >
            {validSeasons.map((s) => (
              <option key={s.id || s.season_number} value={s.season_number}>
                Season {s.season_number} ({s.episode_count || 0} Ep)
              </option>
            ))}
          </select>
        </div>

        {/* Episode Selector Grid */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-2">
            Episodes:
          </span>
          <div className="flex gap-1.5 flex-nowrap">
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => {
              const isActive = selectedEpisode === ep;
              return (
                <button
                  key={ep}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-w-[36px] ${
                    isActive
                      ? "bg-[#dc2626] text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] border border-[#dc2626]"
                      : "bg-[#0f1014] text-gray-300 border border-gray-800 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  E{ep}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}