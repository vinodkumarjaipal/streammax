"use client";

import { useRef } from "react";
import MovieCard from "@/components/MovieCard";

export default function ContentRow({ title, items = [] }) {
  const rowRef = useRef(null);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-3 my-8 px-4 sm:px-8 lg:px-16 relative group/row">
      {/* Row Title */}
      <div className="flex items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#dc2626] rounded-full"></span>
          {title}
        </h2>
      </div>

      {/* Row Wrapper */}
      <div className="relative">
        {/* Left Scroll Trigger */}
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer text-xl"
        >
          ❮
        </button>

        {/* Scrollable Cards Container */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-4 px-12 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {items.map((item) => (
            <div key={`${item.id}-${item.media_type || "item"}`} className="flex-shrink-0 w-36 sm:w-44 md:w-48">
              <MovieCard item={item} />
            </div>
          ))}
        </div>

        {/* Right Scroll Trigger */}
        <button
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer text-xl"
        >
          ❯
        </button>
      </div>
    </div>
  );
}