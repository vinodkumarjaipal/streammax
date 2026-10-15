"use client";

import { useState } from "react";

const CATEGORIES = ["All", "Movies", "TV Shows", "Anime", "Asian Dramas"];
const GENRES = ["Action", "Comedy", "Horror", "Romance", "Sci-Fi", "Thriller"];
const LANGUAGES = [
  { label: "English", code: "en" },
  { label: "Hindi", code: "hi" },
  { label: "Korean", code: "ko" },
  { label: "Japanese", code: "ja" },
  { label: "Tamil", code: "ta" },
  { label: "Telugu", code: "te" },
];
const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Latest", value: "primary_release_date.desc" },
];

export default function FilterPanel({ onFilterChange }) {
  const [filters, setFilters] = useState({
    category: "All",
    genre: "",
    language: "",
    sortBy: "popularity.desc",
  });

  const [isOpen, setIsOpen] = useState(true);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (onFilterChange) {
      onFilterChange(updated);
    }
  };

  const handleReset = () => {
    const resetState = {
      category: "All",
      genre: "",
      language: "",
      sortBy: "popularity.desc",
    };
    setFilters(resetState);
    if (onFilterChange) {
      onFilterChange(resetState);
    }
  };

  return (
    <div className="w-full bg-[#1a1c23] border border-gray-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#dc2626] rounded-full"></span>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Filter & Discover
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-gray-400 hover:text-[#dc2626] transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#0f1014] border border-gray-800"
          >
            {isOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-6">
          {/* CATEGORIES BUTTONS */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter("category", cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    filters.category === cat
                      ? "bg-[#dc2626] text-white border-[#dc2626] shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                      : "bg-[#0f1014] text-gray-300 border-gray-800 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* DROPDOWNS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* GENRE DROPDOWN */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">
                Genre
              </label>
              <select
                value={filters.genre}
                onChange={(e) => updateFilter("genre", e.target.value)}
                className="w-full bg-[#0f1014] text-gray-200 text-xs font-medium rounded-lg px-3 py-2.5 border border-gray-800 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] cursor-pointer transition-colors"
              >
                <option value="">All Genres</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* LANGUAGE DROPDOWN */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => updateFilter("language", e.target.value)}
                className="w-full bg-[#0f1014] text-gray-200 text-xs font-medium rounded-lg px-3 py-2.5 border border-gray-800 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] cursor-pointer transition-colors"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT BY DROPDOWN */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="w-full bg-[#0f1014] text-gray-200 text-xs font-medium rounded-lg px-3 py-2.5 border border-gray-800 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] cursor-pointer transition-colors"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}