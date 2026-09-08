"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";

interface ClimatePreset {
  rh: number;
  label: string;
  description: string;
}

const CLIMATE_PRESETS: ClimatePreset[] = [
  { rh: 14, label: "Atacama Arid", description: "Extreme dryness; ink remains brittle, razor-sharp hairlines with zero capillary absorption." },
  { rh: 52, label: "Temperate Studio", description: "Balanced equilibrium; crisp letterforms with subtle fibrous edge softening." },
  { rh: 84, label: "Kyoto Monsoon", description: "High atmospheric moisture; deep capillary wicking, ink feathering into paper grain." },
  { rh: 98, label: "Saturated Deluge", description: "Complete fiber saturation; counters flood and serifs dissolve into organic wash pools." }
];

export default function AtmosphericHygrometryExperiment() {
  const [humidity, setHumidity] = useState<number>(52);
  const [porosity, setPorosity] = useState<number>(65); // Paper fiber pore radius parameter (r)
  const [evaporationRate, setEvaporationRate] = useState<number>(45);
  const [isMoistening, setIsMoistening] = useState<boolean>(false);
  const [fiberOrientation, setFiberOrientation] = useState<"isotropic" | "directional">("directional");

  const humId = useId();
  const porId = useId();

  // Natural diurnal evaporation loop: moisture gradually decays to baseline equilibrium (50% RH)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isMoistening) {
        setHumidity((prev) => {
          if (prev > 50) {
            return Math.max(50, prev - (evaporationRate / 100) * 0.7);
          } else if (prev < 50) {
            return Math.min(50, prev + (evaporationRate / 100) * 0.4);
          }
          return prev;
        });
      }
    }, 90);
    return () => clearInterval(timer);
  }, [isMoistening, evaporationRate]);

  // Lucas-Washburn Capillary Penetration Model: L = sqrt((gamma * r * cos(theta) * t) / (2 * eta))
  // Normalized as a function of Relative Humidity and Substrate Porosity
  const lucasWashburnFactor = Math.sqrt(Math.max(0, (humidity - 18) / 82) * (porosity / 100));
  const bleedRadius = lucasWashburnFactor * 22;
  const strokeInflation = lucasWashburnFactor * 16;
  const wetSheen = Math.max(0, (humidity - 55) / 45); // Surface glisten before evaporation
  const dynamicWeight = Math.round(300 + lucasWashburnFactor * 580);

  // Directional anisotropic fiber wicking vectors
  const spreadX = fiberOrientation === "directional" ? bleedRadius * 1.35 : bleedRadius;
  const spreadY = fiberOrientation === "directional" ? bleedRadius * 0.75 : bleedRadius;

  // Direct tactile breathing / moistening via pointer drag
  const handlePointerDown = () => setIsMoistening(true);
  const handlePointerUp = () => setIsMoistening(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isMoistening) {
      const delta = (Math.abs(e.movementX) + Math.abs(e.movementY)) * 0.4;
      setHumidity((prev) => Math.min(99, Math.max(10, prev + delta)));
    }
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#f4f0e6] text-[#1a1715] font-serif antialiased select-none overflow-hidden relative flex flex-col justify-between p-6 sm:p-14 selection:bg-[#2c2621] selection:text-[#f4f0e6] cursor-crosshair touch-none"
      style={{
        backgroundImage: `
          radial-gradient(#d8d1c0 0.75px, transparent 0.75px),
          radial-gradient(#e4ded0 0.75px, #f4f0e6 0.75px)
        `,
        backgroundSize: "28px 28px, 14px 14px"
      }}
    >
      {/* Editorial Watermark Header */}
      <header className="flex justify-between items-baseline z-20 border-b border-[#d8d1c0] pb-4">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-[#786e64] hover:text-[#1a1715] transition-colors font-semibold"
          >
            ← Design Minds
          </Link>
          <span className="text-[#b8af9f] font-mono">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#2c2621] font-bold">
            Noon Mind · Day 005 · Lucas-Washburn Capillary Specimen
          </span>
        </div>

        <div className="font-mono text-xs text-[#786e64] hidden sm:flex items-center gap-6">
          <span>RH: <strong className="text-[#1a1715] font-bold">{humidity.toFixed(0)}%</strong></span>
          <span>LUCAS-WASHBURN (L): <strong className="text-[#1a1715]">{bleedRadius.toFixed(1)}px</strong></span>
          <span>SUBSTRATE: <strong className="text-[#42372d] uppercase">{fiberOrientation} washi</strong></span>
        </div>
      </header>

      {/* Main Porous Paper Specimen Center (Full-Bleed Direct Canvas) */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-12 relative z-10 text-center">
        
        {/* Capillary Dew Droplet Status Indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#d8d1c0] bg-[#fbf9f4]/85 backdrop-blur mb-8 font-mono text-xs text-[#786e64]">
          <span
            className="w-2 h-2 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: humidity > 75 ? "#2563eb" : humidity > 40 ? "#059669" : "#d97706"
            }}
          />
          <span className="uppercase tracking-widest text-[11px] font-bold text-[#1a1715]">
            {humidity > 85 ? "Counter Flooding (Deluge Threshold)" : humidity > 40 ? "Capillary Equilibrium" : "Brittle Vector Acuity"}
          </span>
          <span>·</span>
          <span>{humidity.toFixed(0)}% RH</span>
          {wetSheen > 0.1 && (
            <span className="text-blue-600 animate-pulse font-semibold">· Wet Sheen {(wetSheen * 100).toFixed(0)}%</span>
          )}
        </div>

        {/* The Capillary Bleeding Typographic Core */}
        <div className="relative max-w-5xl w-full py-6">
          <h1
            className="text-5xl sm:text-7xl md:text-9xl uppercase font-serif tracking-tight transition-all duration-150"
            style={{
              fontWeight: dynamicWeight,
              color: "#161413",
              letterSpacing: `${(0.05 - (strokeInflation * 0.002)).toFixed(3)}em`,
              textShadow: `
                0 0 ${spreadX * 0.2}px rgba(22, 20, 19, 0.98),
                0 0 ${spreadX}px rgba(66, 55, 45, ${lucasWashburnFactor * 0.85}),
                0 0 ${spreadX * 2}px rgba(85, 70, 58, ${lucasWashburnFactor * 0.45})
              `
            }}
          >
            Hygrometry
          </h1>

          <p
            className="mt-8 text-sm sm:text-lg text-[#4a423a] max-w-xl mx-auto leading-relaxed transition-all duration-150 font-serif italic"
            style={{
              textShadow: `0 0 ${spreadX * 0.3}px rgba(66, 55, 45, ${lucasWashburnFactor * 0.6})`
            }}
          >
            "Handmade washi fibers drink the morning mist. In arid air, the hairline serif stands brittle; as relative humidity descends, Lucas-Washburn capillary suction wicks black sumi ink across organic paper grain."
          </p>
        </div>

        {/* Tactile Direct-Drag Cue */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#8a8074] mt-6">
          {isMoistening ? "💧 Exhaling Moisture onto Substrate..." : "Click and drag anywhere to breathe atmospheric moisture across the paper fibers"}
        </p>

        {/* Organic Substrate Climate Dial */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 bg-[#eae4d3]/80 border border-[#d8d1c0] px-8 py-3.5 rounded-full backdrop-blur z-20 font-mono text-xs">
          <div className="flex items-center gap-3">
            <label htmlFor={humId} className="text-[10px] text-[#786e64] uppercase font-bold tracking-wider">Moisture (RH)</label>
            <input
              id={humId}
              type="range"
              min="10"
              max="99"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-32 accent-[#2c2621] cursor-pointer"
            />
            <span className="font-bold text-[#1a1715] w-10">{humidity.toFixed(0)}%</span>
          </div>

          <div className="h-4 w-px bg-[#c8c0af]" />

          <div className="flex items-center gap-3">
            <label htmlFor={porId} className="text-[10px] text-[#786e64] uppercase font-bold tracking-wider">Fiber Porosity (r)</label>
            <input
              id={porId}
              type="range"
              min="20"
              max="95"
              value={porosity}
              onChange={(e) => setPorosity(Number(e.target.value))}
              className="w-24 accent-[#2c2621] cursor-pointer"
            />
            <span className="font-bold text-[#1a1715] w-8">{porosity}%</span>
          </div>

          <div className="h-4 w-px bg-[#c8c0af]" />

          <button
            onClick={() => setFiberOrientation(fiberOrientation === "directional" ? "isotropic" : "directional")}
            className="px-3 py-1 rounded text-[10px] uppercase font-bold border border-[#c8c0af] hover:border-[#2c2621] transition-colors"
          >
            Fibers: {fiberOrientation}
          </button>

          <div className="h-4 w-px bg-[#c8c0af]" />

          <div className="flex items-center gap-2">
            {CLIMATE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setHumidity(p.rh)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all border ${
                  Math.abs(humidity - p.rh) < 6
                    ? "border-[#2c2621] bg-[#2c2621] text-[#f4f0e6]"
                    : "border-[#c8c0af] bg-transparent text-[#786e64] hover:text-[#1a1715]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Papermaker's Deckle Colophon */}
      <footer className="border-t border-[#d8d1c0] pt-4 flex flex-wrap justify-between items-center text-[11px] font-mono text-[#786e64] z-20">
        <div>LUCAS-WASHBURN CAPILLARY EQUATION · PAUL KLEE FLUIDITY · IRMA BOOM TACTILITY</div>
        <div className="tracking-wider">CHAPTER V: ATMOSPHERIC HYGROMETRY & POROUS INK BLEED</div>
      </footer>
    </main>
  );
}
