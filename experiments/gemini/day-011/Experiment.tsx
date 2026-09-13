"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TrojanHorseExperiment() {
  const [soldierCount, setSoldierCount] = useState<number>(40); // 10 to 50 hoplites
  const [elapsedHours, setElapsedHours] = useState<number>(6.5); // 0 to 18 hours inside Troy
  const [ventilationOpen, setVentilationOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"xray" | "timber" | "stress" | "gallery">("xray");

  // Biophysical & Structural Calculations
  const armorLoadKg = soldierCount * 103; // ~103kg per hoplite with bronze panoply & weapons
  const horseWeightKg = 18500; // Mount Ida fir structural truss
  const totalLoadKg = armorLoadKg + horseWeightKg;

  // Timber Stress Ratio on legs (Safety factor threshold = 1.0)
  const legTimberStress = Math.min(1.4, ((totalLoadKg / 22620) * 0.85));
  const isStructuralOverload = legTimberStress > 0.95;

  // Hypoxia calculation in 38.4m^3 chamber:
  const o2DepletionRate = ventilationOpen ? (soldierCount * 12) : (soldierCount * 38);
  const remainingO2Percent = Math.max(8.0, 20.9 - (elapsedHours * o2DepletionRate) / 2400);
  const isHypoxic = remainingO2Percent < 14.0;
  const isFatal = remainingO2Percent < 10.0;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0d12] text-[#e6edf3] font-mono select-none relative flex flex-col justify-between p-6 sm:p-10">
      {/* Background Engineering Papyrus Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #30363d 1px, transparent 1px),
            linear-gradient(to bottom, #30363d 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Technical Framing Header */}
      <header className="flex justify-between items-start z-30 border-b border-[#30363d] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-[#f59e0b] text-black hover:bg-white transition-colors"
            >
              ← DM-011 // TROY FORENSICS
            </Link>
            <span className="text-[#8b949e] text-xs font-bold tracking-widest">
              HOMER ODYSSEY BK.VIII · FORENSIC ARCHAEOLOGY
            </span>
          </div>
          <p className="text-[11px] text-[#7d8590] mt-1.5 max-w-xl font-sans">
            Investigating the structural feasibility, hypoxia kinetics, and Scaean Gate breach of the 40 concealed Greek hoplites inside the Trojan Horse.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          {(["xray", "timber", "stress", "gallery"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded border ${
                viewMode === mode
                  ? "bg-[#f59e0b] text-black border-[#f59e0b]"
                  : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white"
              }`}
            >
              {mode === "gallery" ? "🖼️ Media Gallery" : `${mode} view`}
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Stage */}
      {viewMode === "gallery" ? (
        /* Cinematic Media Gallery Mode */
        <div className="flex-1 flex flex-col justify-center items-center my-auto relative z-20 w-full max-w-5xl mx-auto overflow-y-auto py-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#f59e0b] tracking-wider uppercase">
              Forensic Visual &amp; Motion Assets (Plate 1-4 &amp; 4K Video)
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Rendered cinematic stills, anatomical cross-sections, and slow-motion video integrated into the research dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-[#f59e0b] font-bold uppercase">Plate 01 // Cinematic Still</span>
              <h3 className="text-sm font-bold text-white">Timber Monolith Outside Troy</h3>
              <p className="text-[11px] text-[#8b949e]">
                11-meter Mount Ida fir wooden structure standing outside the Scaean Gate at twilight.
              </p>
              <span className="text-[9px] text-[#58a6ff] block font-mono">assets/plate-01.jpeg (865 KB)</span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-[#f59e0b] font-bold uppercase">Plate 02 // Cutaway Cross-Section</span>
              <h3 className="text-sm font-bold text-white">Internal Phalanx Abdominal Bay</h3>
              <p className="text-[11px] text-[#8b949e]">
                Anatomical Da Vinci cross-section showing 40 hoplites, access hatch, and nostril slit.
              </p>
              <span className="text-[9px] text-[#58a6ff] block font-mono">assets/plate-02.jfif (197 KB)</span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-[#f59e0b] font-bold uppercase">Video 01 // 24fps 4K Motion</span>
              <h3 className="text-sm font-bold text-white">The Breached Gate &amp; Hidden Breath</h3>
              <p className="text-[11px] text-[#8b949e]">
                Cinematic tracking shot pushing through timber planks into the silent, breathless hull.
              </p>
              <span className="text-[9px] text-[#58a6ff] block font-mono">assets/video-01.mp4 (6.1 MB)</span>
            </div>
          </div>

          <button
            onClick={() => setViewMode("xray")}
            className="mt-8 px-6 py-2.5 bg-[#f59e0b] text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-white transition-colors"
          >
            ← Return to Interactive Blueprint Simulator
          </button>
        </div>
      ) : (
        /* Blueprint SVG Stage */
        <div className="flex-1 flex justify-center items-center my-auto relative z-20 w-full max-w-6xl mx-auto">
          <svg viewBox="0 0 1000 620" className="w-full h-auto max-h-[68vh] drop-shadow-2xl">
            <defs>
              <radialGradient id="chamberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#10b981"} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ground Platform & Trojan Cobblestone Wheels */}
            <line x1="80" y1="570" x2="920" y2="570" stroke="#30363d" strokeWidth="3" />
            <circle cx="270" cy="540" r="28" fill="#161b22" stroke="#d97706" strokeWidth="3" />
            <circle cx="270" cy="540" r="6" fill="#f59e0b" />
            <circle cx="730" cy="540" r="28" fill="#161b22" stroke="#d97706" strokeWidth="3" />
            <circle cx="730" cy="540" r="6" fill="#f59e0b" />

            {/* Horse Timber Truss Outer Silhouette */}
            <path
              d="M 250 540 L 260 380 L 300 330 L 380 320 L 410 260 L 460 180 L 510 100 L 560 70 L 630 85 L 650 140 L 600 210 L 590 320 L 700 340 L 740 380 L 760 540 L 710 540 L 700 420 L 650 380 L 350 380 L 300 420 L 290 540 Z"
              fill={viewMode === "timber" ? "#1b222d" : "#11161d"}
              stroke={viewMode === "stress" ? (isStructuralOverload ? "#ef4444" : "#f59e0b") : "#8b949e"}
              strokeWidth={viewMode === "stress" ? 4 : 2.5}
              strokeLinejoin="round"
            />

            {/* Internal Abdominal Cavity (Hoplite Chamber) */}
            <path
              d="M 380 370 L 380 330 L 420 290 L 560 290 L 570 370 Z"
              fill="url(#chamberGlow)"
              stroke={isHypoxic ? "#ef4444" : "#f59e0b"}
              strokeWidth="2"
              strokeDasharray={ventilationOpen ? "none" : "5,3"}
            />

            {/* Concealed Nostril Micro-Ventilation Slit Callout */}
            <circle cx="630" cy="85" r="4" fill={ventilationOpen ? "#10b981" : "#ef4444"} />
            <line x1="630" y1="85" x2="710" y2="50" stroke="#58a6ff" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="720" y="55" fill="#58a6ff" fontSize="11" fontWeight="bold">
              NOSTRIL APERTURE (4.5 cm²): {ventilationOpen ? "OPEN (22.4 L/min)" : "OCCLUDED (0 L/min)"}
            </text>

            {/* 40 Hoplites crouched inside chamber (X-Ray Mode) */}
            {viewMode === "xray" && (
              <g id="soldiers" fill={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#38bdf8"}>
                {Array.from({ length: soldierCount }).map((_, idx) => {
                  const cols = 10;
                  const row = Math.floor(idx / cols);
                  const col = idx % cols;
                  const cx = 400 + col * 16;
                  const cy = 310 + row * 15;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      className="transition-all duration-300"
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            )}

            {/* Metric Annotations */}
            <text x="500" y="270" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              CHAMBER VOLUME: 38.4 m³ · PAYLOAD: {soldierCount} HOPLITES ({(armorLoadKg / 1000).toFixed(1)}T)
            </text>

            {/* Biometric Status Overlay */}
            <text x="500" y="440" fill={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#10b981"} fontSize="14" fontWeight="bold" textAnchor="middle">
              {isFatal
                ? "CRITICAL ASPHYXIATION: O₂ DEPLETED BELOW SURVIVAL THRESHOLD"
                : isHypoxic
                ? "WARNING: ACUTE HYPOXIA DETECTED (CONFUSION / IMPAIRED REFLEX)"
                : "BIO-HOMEOSTASIS STABLE: AEROBIC METABOLISM NORMAL"}
            </text>
          </svg>
        </div>
      )}

      {/* Forensic Control & Telemetry Instrument Panel */}
      <footer className="z-30 border-t border-[#30363d] pt-4 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-xs">
        
        {/* Soldier Payload Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[#8b949e]">
            <span>HOPLITE PAYLOAD</span>
            <strong className="text-white">{soldierCount} MEN</strong>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={soldierCount}
            onChange={(e) => setSoldierCount(Number(e.target.value))}
            className="w-full accent-[#f59e0b] cursor-pointer"
          />
          <div className="text-[10px] text-[#7d8590]">TOTAL MASS: {(totalLoadKg / 1000).toFixed(1)} TONNES</div>
        </div>

        {/* Elapsed Time Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[#8b949e]">
            <span>INCUBATION TIME</span>
            <strong className="text-white">{elapsedHours.toFixed(1)} HOURS</strong>
          </div>
          <input
            type="range"
            min="0.5"
            max="18"
            step="0.5"
            value={elapsedHours}
            onChange={(e) => setElapsedHours(Number(e.target.value))}
            className="w-full accent-[#f59e0b] cursor-pointer"
          />
          <div className="text-[10px] text-[#7d8590]">TROY FEAST COMMENCED: 12.0H TIMELINE</div>
        </div>

        {/* Ventilation Toggle */}
        <div className="space-y-1.5">
          <span className="text-[#8b949e] block">NOSTRIL VENTILATION</span>
          <button
            onClick={() => setVentilationOpen(!ventilationOpen)}
            className={`w-full py-2 font-bold uppercase rounded border transition-colors ${
              ventilationOpen
                ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]"
                : "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]"
            }`}
          >
            {ventilationOpen ? "SLIT OPEN (22.4 L/MIN)" : "SLIT SEALED (HYPOXIC)"}
          </button>
        </div>

        {/* Real-time O2 Readout */}
        <div className="bg-[#161b22] border border-[#30363d] p-3 rounded space-y-1">
          <div className="text-[10px] text-[#8b949e] uppercase font-bold">ATMOSPHERIC O₂ LEVEL</div>
          <div className={`text-xl font-black ${isFatal ? "text-[#ef4444]" : isHypoxic ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
            {remainingO2Percent.toFixed(1)}% <span className="text-xs font-normal text-[#8b949e]">/ 20.9%</span>
          </div>
          <div className="text-[10px] text-[#7d8590]">
            SCAEAN GATE: 3.2m / HORSE: 4.1m (WALL BREACH REQ.)
          </div>
        </div>
      </footer>
    </div>
  );
}
