"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = query.trim().slice(0, 100);
    if (clean) {
      router.push(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        placeholder="Search titles, anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#1a1c23] text-white text-xs sm:text-sm pl-3 sm:pl-4 pr-8 sm:pr-9 py-2 rounded-full border border-gray-700/80 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] transition-all placeholder-gray-500 shadow-inner"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#dc2626] text-xs sm:text-sm transition-colors"
      >
        🔍
      </button>
    </form>
  );
}