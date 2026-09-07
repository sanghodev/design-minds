"use client";

import React, { useState, useEffect, useRef, useId } from "react";
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
  const [porosity, setPorosity] = useState<number>(65); // Paper fiber permeability
  const [evaporationRate, setEvaporationRate] = useState<number>(40);
  const [isMoistening, setIsMoistening] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humId = useId();
  const porId = useId();

  // Natural diurnal evaporation loop: moisture gradually decays to baseline
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isMoistening) {
        setHumidity((prev) => {
          if (prev > 52) {
            return Math.max(52, prev - (evaporationRate / 100) * 0.8);
          } else if (prev < 52) {
            return Math.min(52, prev + (evaporationRate / 100) * 0.5);
          }
          return prev;
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [isMoistening, evaporationRate]);

  // Capillary bleed & feathering calculations
  const bleedRadius = Math.max(0, ((humidity - 20) / 80) * (porosity / 100) * 18);
  const strokeInflation = Math.max(0, ((humidity - 30) / 70) * (porosity / 100) * 14);
  const fiberWickOpacity = Math.min(0.85, Math.max(0, (humidity - 35) / 65));
  const dynamicWeight = Math.round(300 + (humidity / 100) * 550);

  // Direct tactile breathing / moistening via pointer drag
  const handlePointerDown = () => setIsMoistening(true);
  const handlePointerUp = () => setIsMoistening(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isMoistening) {
      const delta = (e.movementY < 0 ? -e.movementY : e.movementX) * 0.3;
      setHumidity((prev) => Math.min(99, Math.max(10, prev + delta)));
    }
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#f4f0e6] text-[#1a1715] font-serif antialiased select-none overflow-hidden relative flex flex-col justify-between p-6 sm:p-14 selection:bg-[#2c2621] selection:text-[#f4f0e6]"
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
            className="font-mono text-xs uppercase tracking-widest text-[#786e64] hover:text-[#1a1715] transition-colors"
          >
            ← Design Minds
          </Link>
          <span className="text-[#b8af9f] font-mono">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#2c2621] font-semibold">
            Noon Mind · Day 005 · Atmospheric Hygrometry
          </span>
        </div>

        <div className="font-mono text-xs text-[#786e64] hidden sm:flex items-center gap-6">
          <span>RELATIVE HUMIDITY: <strong className="text-[#1a1715] font-bold">{humidity.toFixed(0)}% RH</strong></span>
          <span>POROSITY: <strong className="text-[#1a1715]">{porosity}%</strong></span>
          <span>BLEED RADIUS: <strong className="text-[#42372d]">{bleedRadius.toFixed(1)}px</strong></span>
        </div>
      </header>

      {/* Main Porous Paper Specimen Center (Full-Bleed Direct Canvas) */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-12 relative z-10 text-center">
        
        {/* Capillary Dew Droplet Indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#d8d1c0] bg-[#fbf9f4]/80 backdrop-blur mb-8 font-mono text-xs text-[#786e64]">
          <span
            className="w-2 h-2 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: humidity > 70 ? "#3b82f6" : humidity > 40 ? "#10b981" : "#f59e0b"
            }}
          />
          <span className="uppercase tracking-widest text-[11px]">
            {humidity > 75 ? "Monsoon Capillary Bleed" : humidity > 35 ? "Equilibrium Substrate" : "Arid Brittleness"}
          </span>
          <span>·</span>
          <span>{humidity.toFixed(0)}% RH</span>
        </div>

        {/* The Capillary Bleeding Typographic Core */}
        <div className="relative max-w-4xl w-full py-6">
          <h1
            className="text-5xl sm:text-7xl md:text-9xl uppercase font-serif tracking-tight transition-all duration-150"
            style={{
              fontWeight: dynamicWeight,
              color: "#181615",
              letterSpacing: `${(0.06 - (strokeInflation * 0.003)).toFixed(3)}em`,
              textShadow: `
                0 0 ${bleedRadius * 0.4}px rgba(24, 22, 21, 0.95),
                0 0 ${bleedRadius}px rgba(66, 55, 45, ${fiberWickOpacity * 0.8}),
                0 0 ${bleedRadius * 2.2}px rgba(85, 70, 58, ${fiberWickOpacity * 0.45})
              `
            }}
          >
            Hygrometry
          </h1>

          <p
            className="mt-8 text-sm sm:text-lg text-[#4a423a] max-w-xl mx-auto leading-relaxed transition-all duration-150 font-serif italic"
            style={{
              textShadow: `0 0 ${bleedRadius * 0.3}px rgba(66, 55, 45, ${fiberWickOpacity * 0.5})`
            }}
          >
            "Porous washi fibers drink the morning mist. In dry air, the hairline serif stands brittle; as humidity descends, capillary suction wicks black sumi ink across organic paper grain."
          </p>
        </div>

        {/* Tactile Direct-Drag Cue */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#8a8074] mt-6">
          {isMoistening ? "💧 Depositing Atmospheric Moisture..." : "Click and drag anywhere to exhale vapor onto the paper substrate"}
        </p>

        {/* Organic Substrate Climate Dial */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 bg-[#eae4d3]/70 border border-[#d8d1c0] px-8 py-3.5 rounded-full backdrop-blur z-20 font-mono text-xs">
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
            <label htmlFor={porId} className="text-[10px] text-[#786e64] uppercase font-bold tracking-wider">Paper Porosity</label>
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
        <div>PAUL KLEE FLUID DYNAMICS · IRMA BOOM TACTILE SUBSTRATE · WASHI FIBER WICKING</div>
        <div className="tracking-wider">CHAPTER V: ATMOSPHERIC HYGROMETRY & POROUS INK BLEED</div>
      </footer>
    </main>
  );
}
