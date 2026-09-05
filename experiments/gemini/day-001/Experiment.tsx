"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function SolarGrammarExperiment() {
  const [azimuth, setAzimuth] = useState<number>(315);
  const [elevation, setElevation] = useState<number>(28);
  const [reliefDepth, setReliefDepth] = useState<number>(8);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Compute spherical light vector
  const radAz = (azimuth * Math.PI) / 180;
  const radEl = (elevation * Math.PI) / 180;

  const lightX = Math.cos(radEl) * Math.sin(radAz);
  const lightY = -Math.cos(radEl) * Math.cos(radAz);
  const lightZ = Math.sin(radEl);

  // Carved stone shadow displacement
  const shadowDist = Math.tan((90 - elevation) * (Math.PI / 180)) * reliefDepth;
  const sx = -lightX * shadowDist;
  const sy = -lightY * shadowDist;
  const blur = Math.max(1.5, shadowDist * 0.4);
  const shadowAlpha = Math.min(0.95, (90 - elevation) / 90);

  // Trajan chiseled incision highlights & shadows
  const hx = lightX * 1.5;
  const hy = lightY * 1.5;

  return (
    <div className="min-h-screen w-full bg-[#121110] text-[#e6e2da] font-serif antialiased relative overflow-hidden flex flex-col justify-between p-6 sm:p-12 select-none selection:bg-[#c8a97e] selection:text-black">
      {/* Ancient Epigraphic Header */}
      <header className="flex justify-between items-baseline z-20 border-b border-[#2e2a26] pb-4">
        <div className="flex items-baseline gap-4">
          <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-[#8a8278] hover:text-[#c8a97e] transition-colors">
            ← Design Minds
          </Link>
          <span className="text-[#3d3731] font-mono">/</span>
          <span className="text-xs font-mono tracking-widest uppercase text-[#c8a97e]">
            Noon Mind · Day 001 · Lapidary Stele
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#8a8278] hidden sm:block tracking-wider">
          SOLAR ELEVATION: {elevation}° · AZIMUTH: {azimuth}°
        </div>
      </header>

      {/* Main Architectural Monolith Center */}
      <main className="flex-1 flex flex-col justify-center items-center my-auto py-16 relative z-10">
        
        {/* Monolithic Basalt Stone Block */}
        <div
          className="relative max-w-4xl w-full p-10 sm:p-20 rounded-sm border border-[#2b2723] transition-all duration-300"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #1c1a18 0%, #141211 100%)",
            boxShadow: `
              0 30px 60px -12px rgba(0, 0, 0, 0.95),
              inset 0 1px 0 rgba(255, 255, 255, 0.05),
              ${sx * 0.5}px ${sy * 0.5}px ${shadowDist * 2}px rgba(0,0,0,0.8)
            `
          }}
        >
          {/* Ancient Roman Roman Lapidary Inscription */}
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#a89882] mb-8 opacity-80">
              Trajan Specimen · V-Cut Carved Typographic Relief
            </p>

            <h1
              className="text-5xl sm:text-7xl md:text-8xl tracking-[0.12em] uppercase font-serif font-light transition-all duration-150"
              style={{
                color: "#d8d3c8",
                textShadow: `
                  ${hx}px ${hy}px 1px rgba(255, 248, 235, ${Math.max(0.15, lightZ * 0.6)}),
                  ${sx}px ${sy}px ${blur}px rgba(0, 0, 0, ${shadowAlpha}),
                  ${sx * 1.8}px ${sy * 1.8}px ${blur * 2}px rgba(0, 0, 0, ${shadowAlpha * 0.5})
                `
              }}
            >
              Solar Grammar
            </h1>

            <div className="w-16 h-px bg-[#4a4239] mx-auto my-8 opacity-60" />

            <p
              className="text-sm sm:text-lg text-[#9e968a] max-w-xl mx-auto leading-relaxed italic transition-all duration-150 font-serif"
              style={{
                textShadow: `${sx * 0.4}px ${sy * 0.4}px ${blur * 0.6}px rgba(0,0,0,${shadowAlpha * 0.8})`
              }}
            >
              "Stone holds no ink. The carved letter awakens only when the sun descends to cast its shadow across the trench."
            </p>
          </div>
        </div>

        {/* Tactile Solar Wheel Controller */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 bg-[#181614]/80 border border-[#2e2a26] px-8 py-4 rounded-full backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8a8278]">Azimuth</span>
            <input
              type="range"
              min="0"
              max="360"
              value={azimuth}
              onChange={(e) => setAzimuth(Number(e.target.value))}
              className="w-32 accent-[#c8a97e] cursor-pointer"
            />
            <span className="text-xs font-mono text-[#e6e2da] w-8">{azimuth}°</span>
          </div>

          <div className="h-4 w-px bg-[#332e29]" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8a8278]">Altitude</span>
            <input
              type="range"
              min="5"
              max="85"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
              className="w-32 accent-[#c8a97e] cursor-pointer"
            />
            <span className="text-xs font-mono text-[#e6e2da] w-8">{elevation}°</span>
          </div>

          <div className="h-4 w-px bg-[#332e29]" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#8a8278]">Relief</span>
            <input
              type="range"
              min="2"
              max="16"
              value={reliefDepth}
              onChange={(e) => setReliefDepth(Number(e.target.value))}
              className="w-24 accent-[#c8a97e] cursor-pointer"
            />
            <span className="text-xs font-mono text-[#e6e2da] w-8">{reliefDepth}mm</span>
          </div>
        </div>
      </main>

      {/* Stone Pedestal Footer */}
      <footer className="border-t border-[#2e2a26] pt-4 flex flex-wrap justify-between items-center text-[11px] font-mono text-[#6e675f] z-20">
        <div>EPIGRAPHIC BAS-RELIEF SPECIMEN · NATURAL SOLAR SHADOW MAPPING</div>
        <div className="tracking-wider">CHAPTER I: OPTICAL CONSTRAINTS AND THE GENESIS OF TYPE</div>
      </footer>
    </div>
  );
}
