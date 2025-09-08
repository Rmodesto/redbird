"use client";

import { useState } from "react";
import Link from "next/link";
import StationSearch from "./StationSearch";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-black text-white p-2 rounded">
              <span className="text-sm font-bold">🚇</span>
            </div>
            <span className="font-bold text-lg">NYC &quot;SUBWAY&quot; HUB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-black font-medium">
              HOME
            </Link>
            <Link href="/lines" className="text-gray-700 hover:text-black font-medium">
              LINES
            </Link>
            <Link href="/stations" className="text-gray-700 hover:text-black font-medium">
              STATIONS
            </Link>
            <Link href="/map" className="text-gray-700 hover:text-black font-medium">
              MAP
            </Link>
            <Link href="/culture" className="text-gray-700 hover:text-black font-medium">
              CULTURE
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block w-64">
            <StationSearch />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <StationSearch className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-gray-700 hover:text-black font-medium py-2">
                  HOME
                </Link>
                <Link href="/lines" className="text-gray-700 hover:text-black font-medium py-2">
                  LINES
                </Link>
                <Link href="/stations" className="text-gray-700 hover:text-black font-medium py-2">
                  STATIONS
                </Link>
                <Link href="/map" className="text-gray-700 hover:text-black font-medium py-2">
                  MAP
                </Link>
                <Link href="/culture" className="text-gray-700 hover:text-black font-medium py-2">
                  CULTURE
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}