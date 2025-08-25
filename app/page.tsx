"use client";

import { useState } from "react";
import Link from "next/link";
import StationSearch from "../components/StationSearch";

// MTA line colors mapping
const subwayLines = [
  { id: "1", name: "1", color: "bg-red-600", textColor: "text-white" },
  { id: "2", name: "2", color: "bg-red-600", textColor: "text-white" },
  { id: "3", name: "3", color: "bg-red-600", textColor: "text-white" },
  { id: "4", name: "4", color: "bg-green-600", textColor: "text-white" },
  { id: "5", name: "5", color: "bg-green-600", textColor: "text-white" },
  { id: "6", name: "6", color: "bg-green-600", textColor: "text-white" },
  { id: "7", name: "7", color: "bg-purple-600", textColor: "text-white" },
  { id: "A", name: "A", color: "bg-blue-600", textColor: "text-white" },
  { id: "B", name: "B", color: "bg-orange-500", textColor: "text-white" },
  { id: "C", name: "C", color: "bg-blue-600", textColor: "text-white" },
  { id: "D", name: "D", color: "bg-orange-500", textColor: "text-white" },
  { id: "E", name: "E", color: "bg-blue-600", textColor: "text-white" },
  { id: "F", name: "F", color: "bg-orange-500", textColor: "text-white" },
  { id: "G", name: "G", color: "bg-green-500", textColor: "text-white" },
  { id: "J", name: "J", color: "bg-amber-600", textColor: "text-white" },
  { id: "L", name: "L", color: "bg-gray-500", textColor: "text-white" },
  { id: "M", name: "M", color: "bg-orange-500", textColor: "text-white" },
  { id: "N", name: "N", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Q", name: "Q", color: "bg-yellow-500", textColor: "text-black" },
  { id: "R", name: "R", color: "bg-yellow-500", textColor: "text-black" },
  { id: "S", name: "S", color: "bg-gray-600", textColor: "text-white" },
  { id: "W", name: "W", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Z", name: "Z", color: "bg-amber-600", textColor: "text-white" },
];

const serviceAlerts = [
  {
    type: "delay",
    icon: "🕐",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    message: "DELAYS 5 TRAIN - SIGNAL PROBLEMS"
  },
  {
    type: "service_change",
    icon: "⚠️",
    color: "text-red-600 bg-red-50 border-red-200",
    message: "SERVICE CHANGE 2 TRAIN - WEEKEND SERVICE CHANGE"
  },
  {
    type: "delay",
    icon: "🕐",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    message: "DELAYS 7 TRAIN - EARLIER INCIDENT"
  }
];

const featuredCulture = [
  {
    category: "ART",
    title: "BEST SUBWAY ART INSTALLATIONS",
    description: "Discover the hidden masterpieces in NYC's underground galleries",
    image: "📷"
  },
  {
    category: "CULTURE",
    title: "FILMING LOCATIONS YOU DIDN'T KNOW",
    description: "Famous movie scenes shot in NYC subway stations",
    image: "📷"
  },
  {
    category: "MUSIC",
    title: "LEGENDARY BUSKERS OF THE UNDERGROUND",
    description: "Meet the musicians who make the commute magical",
    image: "📷"
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-black text-white p-2 rounded">
                <span className="text-sm font-bold">🚇</span>
              </div>
              <span className="font-bold text-lg">NYC "SUBWAY" HUB</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-black font-medium">HOME</Link>
              <Link href="/lines" className="text-gray-700 hover:text-black font-medium">LINES</Link>
              <Link href="/stations" className="text-gray-700 hover:text-black font-medium">STATIONS</Link>
              <Link href="/map" className="text-gray-700 hover:text-black font-medium">MAP</Link>
              <Link href="/culture" className="text-gray-700 hover:text-black font-medium">CULTURE</Link>
            </div>
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="SEARCH STATIONS..."
                className="px-4 py-2 border border-gray-300 rounded-lg w-64 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-6xl font-bold mb-6">NYC "SUBWAY" HUB</h1>
          <p className="text-xl mb-10 text-gray-300">YOUR GUIDE TO THE UNDERGROUND</p>
          
          <div className="max-w-2xl mx-auto">
            <StationSearch 
              placeholder="SEARCH STATIONS, LINES, OR NEIGHBORHOODS..."
              className="w-full px-6 py-4 text-black rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Subway Lines Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-4 mb-8">
            {subwayLines.map((line) => (
              <Link
                key={line.id}
                href={`/line/${line.id.toLowerCase()}`}
                className={`${line.color} ${line.textColor} w-12 h-12 flex items-center justify-center font-bold text-lg rounded hover:scale-110 transition-transform cursor-pointer`}
              >
                {line.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Alerts */}
      <section className="py-6 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {serviceAlerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${alert.color}`}
              >
                <span>{alert.icon}</span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white border-2 border-dashed border-gray-300 p-8 rounded-lg">
            <p className="text-gray-500 text-sm">Advertisement Space</p>
          </div>
        </div>
      </section>

      {/* Featured Culture */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">"FEATURED" CULTURE</h2>
            <Link href="/culture" className="text-sm font-bold hover:underline">
              VIEW ALL →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCulture.map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gray-200 aspect-video mb-4 rounded-lg flex items-center justify-center text-4xl group-hover:bg-gray-300 transition-colors">
                  {item.image}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{item.category}</p>
                  <h3 className="text-xl font-bold group-hover:underline">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🏠</span>
            HOME
          </Link>
          <Link href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🚇</span>
            LINES
          </Link>
          <Link href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">📍</span>
            STATIONS
          </Link>
          <Link href="/map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🗺️</span>
            MAP
          </Link>
          <Link href="/culture" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🎨</span>
            CULTURE
          </Link>
        </div>
      </div>
    </div>
  );
}
