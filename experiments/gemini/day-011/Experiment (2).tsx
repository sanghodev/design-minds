"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TrojanHorseExperiment() {
  const [soldierCount, setSoldierCount] = useState<number>(40); // 10 to 50 hoplites
  const [elapsedHours, setElapsedHours] = useState<number>(6.5); // 0 to 18 hours inside Troy
  const [ventilationOpen, setVentilationOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"xray" | "timber" | "stress">("xray");

  // Biophysical & Structural Calculations
  const armorLoadKg = soldierCount * 103; // ~103kg per hoplite with bronze panoply & weapons
  const horseWeightKg = 18500; // Mount Ida fir structural truss
  const totalLoadKg = armorLoadKg + horseWeightKg;

  // Timber Stress Ratio on legs (Safety factor threshold = 1.0)
  const legTimberStress = Math.min(1.4, ((totalLoadKg / 22620) * 0.85));
  const isStructuralOverload = legTimberStress > 0.95;

  // Hypoxia calculation in 38.4m^3 chamber:
  // Base air volume = 38,400 liters. O2 = ~8,025 liters.
  // 40 men consume 840 L/hr.
  const o2DepletionRate = ventilationOpen ? (soldierCount * 12) : (soldierCount * 38);
  const remainingO2Percent = Math.max(8.0, 20.9 - (elapsedHours * o2DepletionRate) / 2400);
  const isHypoxic = remainingO2Percent < 14.0;
  const isFatal = remainingO2Percent < 10.0;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0e17] text-[#e6edf3] font-mono select-none relative flex flex-col justify-between p-6 sm:p-10">
      {/* Background Engineering Blueprint Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      />

      {/* Top Technical Framing Header */}
      <header className="flex justify-between items-start z-30 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-[#f59e0b] text-black hover:bg-white transition-colors"
            >
              ← DM-011 // TROY FORENSICS
            </Link>
            <span className="text-[#8b949e] text-xs font-bold tracking-widest">
              HOMER ODYSSEY BK.VIII · STRUCTURAL BIOPHYSICS
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-1.5 max-w-xl font-sans">
            Forensic engineering reconstruction of the Trojan Horse: timber load vectors, 40-hoplite payload volume, and enclosed respiratory hypoxia kinetics.
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          {(["xray", "timber", "stress"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded border ${
                viewMode === mode
                  ? "bg-[#f59e0b] text-black border-[#f59e0b]"
                  : "bg-[#111827] text-[#8b949e] border-[#1e293b] hover:text-white"
              }`}
            >
              {mode} view
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Trojan Horse Stage (Anatomical Equine Blueprint) */}
      <div className="flex-1 flex justify-center items-center my-auto relative z-20 w-full max-w-6xl mx-auto">
        <svg viewBox="0 0 1200 800" className="w-full h-auto max-h-[68vh] drop-shadow-2xl">
          <defs>
            <linearGradient id="woodPlankExp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3d2b1f"/>
              <stop offset="50%" stopColor="#543d2b"/>
              <stop offset="100%" stopColor="#2d1f16"/>
            </linearGradient>
            <radialGradient id="interiorGlowExp" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#10b981"} stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ground Line */}
          <line x1="80" y1="730" x2="1120" y2="730" stroke="#334155" strokeWidth="3" />

          {/* TAIL: Twisted Hemp Cable */}
          <path d="M 230 420 C 190 450, 160 530, 175 610 C 180 640, 200 660, 205 630 C 210 580, 220 510, 250 460 Z" 
                fill="#332419" stroke="#523a28" strokeWidth="2"/>

          {/* REAR LEGS (Background) */}
          <path d="M 330 450 L 305 570 L 290 680 L 270 710 L 330 710 L 345 650 L 360 560 L 375 460 Z" 
                fill="#251a12" stroke="#3d2b1f" strokeWidth="1.5"/>

          {/* FRONT FORELEGS (Background) */}
          <path d="M 820 450 L 805 560 L 800 660 L 780 710 L 840 710 L 850 650 L 855 550 L 870 450 Z" 
                fill="#251a12" stroke="#3d2b1f" strokeWidth="1.5"/>

          {/* REAR HIND LEGS (Foreground - Hock & Stifle) */}
          <path d="M 270 420 C 240 470, 260 550, 245 610 C 235 650, 230 690, 220 715 L 295 715 C 310 685, 315 645, 325 610 C 340 555, 355 490, 340 420 Z" 
                fill="#4a3525" 
                stroke={viewMode === "stress" ? (isStructuralOverload ? "#ef4444" : "#f59e0b") : "#e6edf3"} 
                strokeWidth={viewMode === "stress" ? 4 : 2}/>
          <line x1="250" y1="520" x2="335" y2="500" stroke="#f59e0b" strokeWidth="2"/>
          <line x1="240" y1="620" x2="320" y2="610" stroke="#f59e0b" strokeWidth="2"/>

          {/* FRONT FORELEGS (Foreground - Pillars) */}
          <path d="M 745 430 C 750 490, 755 550, 750 610 L 740 715 L 815 715 C 820 670, 825 610, 825 550 C 825 490, 815 440, 805 410 Z" 
                fill="#4a3525" 
                stroke={viewMode === "stress" ? (isStructuralOverload ? "#ef4444" : "#f59e0b") : "#e6edf3"} 
                strokeWidth={viewMode === "stress" ? 4 : 2}/>
          <line x1="750" y1="510" x2="825" y2="510" stroke="#f59e0b" strokeWidth="2"/>
          <line x1="745" y1="620" x2="820" y2="620" stroke="#f59e0b" strokeWidth="2"/>

          {/* HORSE TORSO & BARREL (Majestic Equine Body Silhouette) */}
          <path d="M 260 410 
                   C 240 340, 280 260, 360 240 
                   C 450 220, 560 230, 680 200 
                   C 710 150, 750 110, 800 85 
                   C 830 70, 870 65, 900 80 
                   C 930 95, 955 130, 970 170 
                   C 985 210, 970 240, 930 260 
                   C 890 280, 850 270, 820 310 
                   C 800 340, 830 390, 840 430 
                   C 790 460, 720 470, 650 470 
                   C 520 470, 420 480, 350 460 
                   C 290 440, 270 425, 260 410 Z" 
                fill={viewMode === "timber" ? "url(#woodPlankExp)" : "#151d28"} 
                stroke="#e6edf3" strokeWidth="3.5" strokeLinejoin="round"/>

          {/* HEAD & CREST: Ears, Mane, Muzzle */}
          <polygon points="870,65 890,20 910,65" fill="#543d2b" stroke="#e6edf3" strokeWidth="2"/>
          <path d="M 970 170 C 990 190, 1005 215, 995 235 C 985 255, 955 265, 930 260 L 890 240" fill="none" stroke="#e6edf3" strokeWidth="2.5"/>
          
          {/* Nostril Micro-Ventilation Slit (Green/Red indicator) */}
          <ellipse cx="985" cy="215" rx="5" ry="9" transform="rotate(-25 985 215)" 
                   fill={ventilationOpen ? "#10b981" : "#ef4444"} 
                   stroke={ventilationOpen ? "#34d399" : "#f87171"} strokeWidth="2"/>

          {/* Segmented Mane */}
          <path d="M 720 200 L 740 160 L 760 190 L 780 140 L 805 170 L 825 120 L 850 150 L 870 85" 
                fill="none" stroke="#f59e0b" strokeWidth="3"/>

          {/* Eye Plaque */}
          <circle cx="915" cy="140" r="8" fill="#111827" stroke="#f59e0b" strokeWidth="2"/>

          {/* CUTAWAY: HOPLITE COMPARTMENT */}
          <rect x="370" y="290" width="370" height="150" rx="8" fill="#0f172a" stroke={isHypoxic ? "#ef4444" : "#f59e0b"} strokeWidth="2.5" strokeDasharray="6 3"/>
          <rect x="370" y="290" width="370" height="150" rx="8" fill="url(#interiorGlowExp)"/>
          
          {/* Keel & Trapdoor */}
          <rect x="360" y="435" width="390" height="12" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5"/>
          <rect x="520" y="435" width="70" height="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2"/>

          {/* Hoplites Matrix (X-Ray Mode) */}
          {viewMode === "xray" && (
            <g id="hoplite-grid" fill={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#38bdf8"}>
              {Array.from({ length: soldierCount }).map((_, idx) => {
                const cols = 10;
                const row = Math.floor(idx / cols);
                const col = idx % cols;
                const cx = 400 + col * 35;
                const cy = 320 + row * 28;
                return (
                  <circle key={idx} cx={cx} cy={cy} r="6" className="transition-all duration-300" opacity={0.9} />
                );
              })}
            </g>
          )}

          {/* Spoked Wheels */}
          <g transform="translate(255, 715)">
            <circle cx="0" cy="0" r="44" fill="#1e293b" stroke="#d97706" strokeWidth="6"/>
            <circle cx="0" cy="0" r="36" fill="#0f172a" stroke="#78350f" strokeWidth="2"/>
            <circle cx="0" cy="0" r="12" fill="#d97706"/>
            <line x1="-36" y1="0" x2="36" y2="0" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="0" y1="-36" x2="0" y2="36" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="-25" y1="-25" x2="25" y2="25" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="-25" y1="25" x2="25" y2="-25" stroke="#94a3b8" strokeWidth="2.5"/>
          </g>

          <g transform="translate(780, 715)">
            <circle cx="0" cy="0" r="44" fill="#1e293b" stroke="#d97706" strokeWidth="6"/>
            <circle cx="0" cy="0" r="36" fill="#0f172a" stroke="#78350f" strokeWidth="2"/>
            <circle cx="0" cy="0" r="12" fill="#d97706"/>
            <line x1="-36" y1="0" x2="36" y2="0" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="0" y1="-36" x2="0" y2="36" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="-25" y1="-25" x2="25" y2="25" stroke="#94a3b8" strokeWidth="2.5"/>
            <line x1="-25" y1="25" x2="25" y2="-25" stroke="#94a3b8" strokeWidth="2.5"/>
          </g>

          {/* Callout Labels */}
          <line x1="985" y1="215" x2="1060" y2="180" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3"/>
          <text x="1070" y="185" fill="#34d399" fontSize="11" fontWeight="bold">
            NOSTRIL SLIT: {ventilationOpen ? "OPEN (22.4 L/min)" : "OCCLUDED (0 L/min)"}
          </text>

          <text x="555" y="270" fill="#f59e0b" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            CHAMBER VOLUME: 38.4 m³ · PAYLOAD: {soldierCount} HOPLITES ({(armorLoadKg / 1000).toFixed(1)} TONNES)
          </text>

          <text x="555" y="475" fill={isFatal ? "#ef4444" : isHypoxic ? "#f59e0b" : "#10b981"} fontSize="13" fontWeight="bold" textAnchor="middle">
            {isFatal
              ? "FATAL ASPHYXIATION: O₂ DEPLETED BELOW 10% (COMBAT COLLAPSE)"
              : isHypoxic
              ? "WARNING: HYPOXIA DETECTED (IMPAIRED REFLEX & CONFUSION)"
              : "BIO-EQUILIBRIUM NOMINAL: AEROBIC READINESS MAINTAINED"}
          </text>
        </svg>
      </div>

      {/* Forensic Control & Telemetry Instrument Panel */}
      <footer className="z-30 border-t border-[#1e293b] pt-4 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-xs">
        
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
          <div className="text-[10px] text-[#64748b]">TOTAL LOAD: {(totalLoadKg / 1000).toFixed(1)} TONNES</div>
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
          <div className="text-[10px] text-[#64748b]">TROY BANQUET COMMENCED: 12.0H TIMELINE</div>
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
            {ventilationOpen ? "SLIT OPEN (22.4 L/MIN)" : "SLIT SEALED (FATAL)"}
          </button>
        </div>

        {/* Real-time O2 Readout */}
        <div className="bg-[#111827] border border-[#1e293b] p-3 rounded space-y-1">
          <div className="text-[10px] text-[#8b949e] uppercase font-bold">ATMOSPHERIC O₂ CONCENTRATION</div>
          <div className={`text-xl font-black ${isFatal ? "text-[#ef4444]" : isHypoxic ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
            {remainingO2Percent.toFixed(1)}% <span className="text-xs font-normal text-[#8b949e]">/ 20.9%</span>
          </div>
          <div className="text-[10px] text-[#64748b]">
            SCAEAN GATE: 3.2m / HORSE TRACK: 4.1m (BREACH VERIFIED)
          </div>
        </div>
      </footer>
    </div>
  );
}
