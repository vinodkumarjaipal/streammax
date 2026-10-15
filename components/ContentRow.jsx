"use client";

import { useRef } from "react";
import MovieCard from "@/components/MovieCard";

export default function ContentRow({ title, items = [], badge }) {
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
    <div className="space-y-3 my-8 px-4 sm:px-8 lg:px-12 relative group/row">
      {/* Row Title & Badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#dc2626] rounded-full"></span>
          {title}
        </h2>
        {badge && (
          <span className="bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      {/* Row Wrapper */}
      <div className="relative">
        {/* Left Scroll Trigger */}
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-20 bg-black/70 hover:bg-black/90 text-white px-3 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-r-xl cursor-pointer text-xl"
        >
          ❮
        </button>

        {/* Scrollable Cards Container */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-4 px-1 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
          className="absolute right-0 top-0 bottom-0 z-20 bg-black/70 hover:bg-black/90 text-white px-3 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-l-xl cursor-pointer text-xl"
        >
          ❯
        </button>
      </div>
    </div>
  );
}