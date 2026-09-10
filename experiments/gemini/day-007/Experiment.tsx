"use client";

import React, { useState, useId } from "react";
import Link from "next/link";

interface FilterPreset {
  cyanOffset: { x: number; y: number };
  magentaOffset: { x: number; y: number };
  yellowOffset: { x: number; y: number };
  label: string;
  description: string;
}

const REGISTRATION_PRESETS: FilterPreset[] = [
  {
    cyanOffset: { x: 0, y: 0 },
    magentaOffset: { x: 0, y: 0 },
    yellowOffset: { x: 0, y: 0 },
    label: "Perfect Registration",
    description: "All 3 glassine sheets aligned; subtractive CMY light absorption produces 100% pitch-black composite letterforms."
  },
  {
    cyanOffset: { x: -12, y: -6 },
    magentaOffset: { x: 10, y: 8 },
    yellowOffset: { x: -4, y: 14 },
    label: "Spectral Fringing",
    description: "Slight sheet misregistration; glyph stems split into individual process inks with chromatic edge diffraction."
  },
  {
    cyanOffset: { x: -48, y: -24 },
    magentaOffset: { x: 42, y: 28 },
    yellowOffset: { x: 0, y: 52 },
    label: "Munari Unreadable State",
    description: "Severe displacement; typography dissolves into pure abstract Bauhaus geometric rhythm across translucent tracing leaves."
  }
];

export default function ChromaticGlassineExperiment() {
  const [cyanOffset, setCyanOffset] = useState<{ x: number; y: number }>({ x: -10, y: -5 });
  const [magentaOffset, setMagentaOffset] = useState<{ x: number; y: number }>({ x: 8, y: 6 });
  const [yellowOffset, setYellowOffset] = useState<{ x: number; y: number }>({ x: -3, y: 10 });
  const [lightboxIntensity, setLightboxIntensity] = useState<number>(94);
  const [glassineOpacity, setGlassineOpacity] = useState<number>(85);
  const [activeSheet, setActiveSheet] = useState<"all" | "cyan" | "magenta" | "yellow">("all");
  const [renderMode, setRenderMode] = useState<"process" | "anatomical">("process");
  const [loupeActive, setLoupeActive] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const lightId = useId();
  const opacityId = useId();

  // Subtractive Beer-Lambert composite registration distance
  const misregistrationDelta = Math.sqrt(
    Math.pow(cyanOffset.x, 2) + Math.pow(cyanOffset.y, 2) +
    Math.pow(magentaOffset.x, 2) + Math.pow(magentaOffset.y, 2) +
    Math.pow(yellowOffset.x, 2) + Math.pow(yellowOffset.y, 2)
  );

  const registrationPurity = Math.max(0, Math.round(100 - misregistrationDelta * 1.8)); // 0 to 100%
  const isRegistered = registrationPurity > 92;

  // Direct tactile dragging across the lightbox
  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const dx = e.movementX * 0.45;
      const dy = e.movementY * 0.45;
      if (activeSheet === "all" || activeSheet === "cyan") {
        setCyanOffset((prev) => ({ x: Math.max(-65, Math.min(65, prev.x + dx)), y: Math.max(-65, Math.min(65, prev.y + dy)) }));
      }
      if (activeSheet === "all" || activeSheet === "magenta") {
        setMagentaOffset((prev) => ({ x: Math.max(-65, Math.min(65, prev.x - dx)), y: Math.max(-65, Math.min(65, prev.y - dy)) }));
      }
      if (activeSheet === "all" || activeSheet === "yellow") {
        setYellowOffset((prev) => ({ x: Math.max(-65, Math.min(65, prev.x - dy * 0.5)), y: Math.max(-65, Math.min(65, prev.y + dx * 0.5)) }));
      }
    }
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#e6e4dc] text-[#141311] font-sans antialiased select-none overflow-hidden relative flex flex-col justify-between p-6 sm:p-14 cursor-move touch-none"
    >
      {/* Lightbox Framing & Header */}
      <header className="flex justify-between items-baseline z-30 border-b border-[#cfcab7] pb-4">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-[#706a5b] hover:text-[#141311] transition-colors font-semibold"
          >
            ← Design Minds
          </Link>
          <span className="text-[#a89f8d] font-mono">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#141311] font-bold">
            Noon Mind · Day 007 · Beer-Lambert Glassine Filtration
          </span>
        </div>

        <div className="font-mono text-xs text-[#706a5b] hidden sm:flex items-center gap-6">
          <span>REGISTRATION: <strong className={isRegistered ? "text-[#059669] font-bold" : "text-[#141311]"}>{registrationPurity}%</strong></span>
          <span>OPTICAL QUENCHING: <strong className="text-[#141311]">{isRegistered ? "C+M+Y → K (100%)" : "Filtered Separation"}</strong></span>
          <span>MODE: <strong className="text-[#706a5b] uppercase">{renderMode}</strong></span>
        </div>
      </header>

      {/* Main Light Table Surface (Full-Bleed Direct Manipulation Canvas) */}
      <div
        className="flex-1 flex flex-col justify-center items-center my-auto py-10 relative z-10 text-center transition-all duration-300 rounded-xl"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${lightboxIntensity / 100})`,
          boxShadow: `0 0 ${lightboxIntensity * 0.85}px rgba(255,255,255,0.8), inset 0 0 50px rgba(0,0,0,0.05)`
        }}
      >
        {/* Registration Purity & Loupe Indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#cfcab7] bg-[#faf9f4]/95 backdrop-blur mb-8 font-mono text-xs text-[#706a5b] z-30 shadow-sm">
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: isRegistered ? "#059669" : registrationPurity > 50 ? "#d97706" : "#e11d48"
            }}
          />
          <span className="uppercase tracking-widest text-[11px] font-bold text-[#141311]">
            {isRegistered ? "Subtractive Pitch-Black Composite" : "Subtractive Color Deconstruction"}
          </span>
          <span>·</span>
          <span>{registrationPurity}% Alignment</span>
          {loupeActive && <span className="text-blue-600 font-bold">· 10x Loupe Magnifier</span>}
        </div>

        {/* Stacked Translucent Glassine Typographic Leaves */}
        <div
          className={`relative max-w-5xl w-full h-80 flex justify-center items-center py-8 transition-transform duration-200 ${
            loupeActive ? "scale-150" : "scale-100"
          }`}
        >
          {/* Yellow Glassine Layer (Curved counters & terminal brackets) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 mix-blend-multiply"
            style={{
              transform: `translate(${yellowOffset.x}px, ${yellowOffset.y}px)`,
              opacity: glassineOpacity / 100
            }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl uppercase font-black tracking-tight text-[#ffed00] select-none font-sans">
              {renderMode === "process" ? "Glassine" : "— L A S —"}
            </h1>
          </div>

          {/* Magenta Glassine Layer (Horizontal crossbars & serifs) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 mix-blend-multiply"
            style={{
              transform: `translate(${magentaOffset.x}px, ${magentaOffset.y}px)`,
              opacity: glassineOpacity / 100
            }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl uppercase font-black tracking-tight text-[#e4007f] select-none font-sans">
              {renderMode === "process" ? "Glassine" : "G — — S I —"}
            </h1>
          </div>

          {/* Cyan Glassine Layer (Vertical structural stems) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 mix-blend-multiply"
            style={{
              transform: `translate(${cyanOffset.x}px, ${cyanOffset.y}px)`,
              opacity: glassineOpacity / 100
            }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl uppercase font-black tracking-tight text-[#00a3e0] select-none font-sans">
              {renderMode === "process" ? "Glassine" : "— — — — — N E"}
            </h1>
          </div>
        </div>

        {/* Descriptive Lightbox Text */}
        <p className="mt-4 text-sm sm:text-base text-[#524c3e] max-w-xl mx-auto font-serif italic leading-relaxed z-20">
          "Three sheets of translucent tracing paper float over the light table. When separated, each color carries only a spectral ghost of the word; when registered into physical alignment, subtractive light absorption binds Cyan, Magenta, and Yellow into pitch-black typography."
        </p>

        {/* Direct-Manipulation Cue */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#88806d] mt-4 z-20">
          {isDragging ? "🔍 Aligning Glassine Sheets on Light Table..." : "Drag anywhere across the lightbox to register or displace the translucent color sheets"}
        </p>

        {/* Minimalist Lightbox Control Dock */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 bg-[#eae7dc]/90 border border-[#cfcab7] px-8 py-3 rounded-full backdrop-blur z-30 font-mono text-xs">
          <div className="flex items-center gap-3">
            <label htmlFor={lightId} className="text-[10px] text-[#706a5b] uppercase font-bold tracking-wider">Lightbox (Lux)</label>
            <input
              id={lightId}
              type="range"
              min="20"
              max="100"
              value={lightboxIntensity}
              onChange={(e) => setLightboxIntensity(Number(e.target.value))}
              className="w-24 accent-[#141311] cursor-pointer"
            />
            <span className="font-bold text-[#141311] w-8">{lightboxIntensity}%</span>
          </div>

          <div className="h-4 w-px bg-[#beb5a1]" />

          <div className="flex items-center gap-3">
            <label htmlFor={opacityId} className="text-[10px] text-[#706a5b] uppercase font-bold tracking-wider">Glassine (α)</label>
            <input
              id={opacityId}
              type="range"
              min="40"
              max="100"
              value={glassineOpacity}
              onChange={(e) => setGlassineOpacity(Number(e.target.value))}
              className="w-24 accent-[#141311] cursor-pointer"
            />
            <span className="font-bold text-[#141311] w-8">{glassineOpacity}%</span>
          </div>

          <div className="h-4 w-px bg-[#beb5a1]" />

          {/* Active Sheet Selector */}
          <div className="flex items-center gap-1.5">
            {(["all", "cyan", "magenta", "yellow"] as const).map((sheet) => (
              <button
                key={sheet}
                onClick={() => setActiveSheet(sheet)}
                className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all border ${
                  activeSheet === sheet
                    ? "border-[#141311] bg-[#141311] text-white"
                    : "border-[#beb5a1] bg-transparent text-[#706a5b] hover:text-[#141311]"
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#beb5a1]" />

          {/* Mode Toggles */}
          <button
            onClick={() => setRenderMode(renderMode === "process" ? "anatomical" : "process")}
            className="px-2.5 py-1 rounded text-[10px] uppercase font-bold border border-[#beb5a1] hover:border-[#141311] transition-colors"
          >
            Mode: {renderMode}
          </button>

          <button
            onClick={() => setLoupeActive(!loupeActive)}
            className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
              loupeActive ? "border-blue-600 bg-blue-600 text-white" : "border-[#beb5a1] hover:border-[#141311]"
            }`}
          >
            10x Loupe
          </button>

          <div className="h-4 w-px bg-[#beb5a1]" />

          {/* Presets */}
          <div className="flex items-center gap-2">
            {REGISTRATION_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCyanOffset(p.cyanOffset);
                  setMagentaOffset(p.magentaOffset);
                  setYellowOffset(p.yellowOffset);
                }}
                className="px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all border border-[#beb5a1] bg-transparent text-[#706a5b] hover:text-[#141311] hover:border-[#141311]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Munari & Itten Colophon */}
      <footer className="border-t border-[#cfcab7] pt-4 flex flex-wrap justify-between items-center text-[11px] font-mono text-[#706a5b] z-30">
        <div>BRUNO MUNARI UNREADABLE BOOKS · JOHANNES ITTEN SUBTRACTIVE MIXTURE · BEER-LAMBERT OPTICS</div>
        <div className="tracking-wider">CHAPTER VII: SUBTRACTIVE CHROMATIC FILTRATION & GLASSINE LAYERING</div>
      </footer>
    </main>
  );
}
