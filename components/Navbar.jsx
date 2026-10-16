"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    setMobileMenuOpen(false);
  }, 0);
  return () => clearTimeout(timer);

  
}, [pathname]);
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies" },
    { name: "TV Shows", href: "/tv" },
    { name: "Anime", href: "/anime" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? "bg-[#0b0c10]/95 backdrop-blur-md shadow-2xl border-b border-gray-800/80 py-3"
          : "bg-gradient-to-b from-[#0b0c10]/95 via-[#0b0c10]/60 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group shrink-0">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:scale-105 transition-transform duration-200">
            STREAM<span className="text-[#dc2626]">MAX</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors duration-200 hover:text-[#dc2626] ${
                  isActive ? "text-[#dc2626] font-bold" : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Search Bar & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="w-48 sm:w-64 md:w-72">
            <SearchBar />
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-200 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f1014] border-b border-gray-800 px-6 py-4 flex flex-col gap-3 shadow-2xl animate-in fade-in duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-base font-semibold transition-colors ${
                  isActive
                    ? "bg-[#dc2626] text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}