"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ClassicalSource {
  author: string;
  source: string;
  men: number;
  feasibility: "Plausible" | "Borderline" | "Fatal (Hypoxia)";
  note: string;
}

const CLASSICAL_SOURCES: ClassicalSource[] = [
  { author: "Virgil", source: "Aeneid Book II", men: 9, feasibility: "Plausible", note: "Lowest payload; abundant oxygen (>18% at 12h); structural timber stress minimal." },
  { author: "Hyginus", source: "Fabulae 108", men: 23, feasibility: "Plausible", note: "Optimal tactical balance; survival threshold sustained with minimal micro-ventilation." },
  { author: "Quintus Smyrnaeus", source: "Posthomerica XII", men: 30, feasibility: "Borderline", note: "30 named champions; O2 drops to 14.2% at 8h; acute tactical lethargy." },
  { author: "Apollodorus", source: "Epitome 5.14", men: 50, feasibility: "Fatal (Hypoxia)", note: "Severe overcrowding; catastrophic hypercapnia (CO2 > 6%) causes fatal asphyxiation within 4.5h." }
];

interface GreekChampion {
  name: string;
  greek: string;
  role: string;
  armorKg: number;
  pulseBpm: number;
}

const HEROES: GreekChampion[] = [
  { name: "Odysseus", greek: "ΟΔΥΣΣΕΥΣ", role: "Tactical Commander", armorKg: 38, pulseBpm: 92 },
  { name: "Menelaus", greek: "ΜΕΝΕΛΑΟΣ", role: "Spartan King", armorKg: 44, pulseBpm: 104 },
  { name: "Neoptolemus", greek: "ΝΕΟΠΤΟΛΕΜΟΣ", role: "Son of Achilles", armorKg: 42, pulseBpm: 118 },
  { name: "Diomedes", greek: "ΔΙΟΜΗΔΗΣ", role: "Argive Champion", armorKg: 46, pulseBpm: 88 },
  { name: "Epeius", greek: "ΕΠΕΙΟΣ", role: "Master Architect", armorKg: 34, pulseBpm: 126 }
];

export default function TrojanHorseForensicExperiment() {
  const [selectedSourceIdx, setSelectedSourceIdx] = useState<number>(1); // Default Hyginus (23 men)
  const [soldierCount, setSoldierCount] = useState<number>(23);
  const [elapsedHours, setElapsedHours] = useState<number>(7.5);
  const [nostrilVentOpen, setNostrilVentOpen] = useState<boolean>(true);
  const [layer, setLayer] = useState<"timber" | "xray" | "stress">("xray");
  const [selectedHero, setSelectedHero] = useState<GreekChampion | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize soldier count when preset changes
  const applySource = (idx: number) => {
    setSelectedSourceIdx(idx);
    setSoldierCount(CLASSICAL_SOURCES[idx].men);
  };

  // Structural & Forensic Physics Calculations
  const timberMassKg = 18500; // 42 m^3 of Mount Ida Silver Fir (Abies alba, 440 kg/m^3)
  const hopliteMassKg = soldierCount * (75 + 35); // 75kg body + 35kg bronze armor/panoply
  const grossVehicleMassKg = timberMassKg + hopliteMassKg;
  const rollingWeightTonnes = (grossVehicleMassKg / 1000).toFixed(1);

  // Rolling friction on cobblestones (mu = 0.08)
  const dragForceKiloNewtons = ((grossVehicleMassKg * 9.81 * 0.08) / 1000).toFixed(1);
  const haulersRequired = Math.ceil((Number(dragForceKiloNewtons) * 1000) / 180); // ~180N continuous pulling force per Trojan citizen

  // Internal Volume = 38.4 m^3 = 38,400 L
  // Adult resting VO2 = 0.30 L/min = 18 L/hr per hoplite
  // High adrenaline/fear multiplier = 1.35x -> 24.3 L/hr per hoplite
  const effectiveO2ConsumptionPerHour = soldierCount * 24.3;
  const totalVentilationInflowPerHour = nostrilVentOpen ? 480 : 0; // 4.5 cm^2 nostril micro-slit inflow (liters/hr)
  const netO2LossPerHour = Math.max(0, effectiveO2ConsumptionPerHour - totalVentilationInflowPerHour * 0.209);

  // Initial O2 Volume = 38,400 * 0.209 = 8,025 L
  const remainingO2Volume = Math.max(0, 8025 - netO2LossPerHour * elapsedHours);
  const currentO2Percent = Math.max(6.5, (remainingO2Volume / 38400) * 100);

  // CO2 accumulation (toxic threshold at 5.0%)
  const co2VolumeGenerated = (effectiveO2ConsumptionPerHour * 0.85) * elapsedHours;
  const currentCO2Percent = Math.min(9.5, (co2VolumeGenerated / 38400) * 100 * (nostrilVentOpen ? 0.45 : 1.0));

  const isCriticalHypoxia = currentO2Percent < 14.0 || currentCO2Percent > 5.0;
  const isFatal = currentO2Percent < 10.0 || currentCO2Percent > 7.0;

  // Real-time respiratory gas canvas particle animation inside chamber
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = 460);
    const h = (canvas.height = 240);

    const particleCount = 140;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Gas particles color coded: O2 (emerald/cyan) vs CO2 (toxic amber/crimson)
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isFatal ? "rgba(239, 68, 68, 0.75)" : isCriticalHypoxia ? "rgba(245, 158, 11, 0.7)" : "rgba(56, 189, 248, 0.65)";
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isCriticalHypoxia, isFatal]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#07090e] text-[#e6edf3] font-mono select-none flex flex-col justify-between p-6 sm:p-10 relative">
      {/* Background Cartographic Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(#30363d 1px, transparent 1px),
            linear-gradient(to right, rgba(48,54,61,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 140px 140px"
        }}
      />

      {/* Top Archaeological Header & Classical Corpus Nav */}
      <header className="z-30 border-b border-[#21262d] pb-4 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-[#d97706] text-black hover:bg-white transition-colors"
            >
              ← DESIGN MINDS // ARCHAEOMETRY
            </Link>
            <span className="text-[#8b949e] text-xs font-bold tracking-widest">
              HOMER · VIRGIL · HYGINUS // FORENSIC TIMBER ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#f0f6fc] tracking-tight mt-1 font-bold">
            The Trojan Horse: Forensic Structural Anatomy &amp; The Oxygen Clock
          </h1>
          <p className="text-xs text-[#8b949e] font-sans mt-0.5">
            Biomechanical verification of enclosed respiratory hypoxia and wheel friction in the 38.4 m³ fir wood chamber.
          </p>
        </div>

        {/* Layer & Mode Selector */}
        <div className="flex items-center gap-2">
          {(["timber", "xray", "stress"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setLayer(m)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all border ${
                layer === m
                  ? "border-[#d97706] bg-[#d97706] text-black"
                  : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"
              }`}
            >
              {m} layer
            </button>
          ))}
        </div>
      </header>

      {/* Central Forensic Workspace (Main Interactive Cross-Section) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4 z-20 items-center max-w-7xl mx-auto w-full">
        
        {/* Left Interactive Blueprint Canvas (Colossal Trojan Horse Cross-Section) */}
        <div className="lg:col-span-8 bg-[#0d1117] border border-[#30363d] p-6 rounded-xl relative shadow-2xl flex flex-col justify-between min-h-[460px]">
          
          <div className="flex justify-between items-center border-b border-[#21262d] pb-2 text-[11px] text-[#8b949e]">
            <span>STRUCTURAL SCALE: 1:50 · MOUNT IDA FIR TRUSS</span>
            <span className={isFatal ? "text-red-500 font-bold" : isCriticalHypoxia ? "text-amber-500 font-bold" : "text-emerald-400 font-bold"}>
              STATUS: {isFatal ? "LETHAL ASPHYXIATION" : isCriticalHypoxia ? "ACUTE HYPOXIA (<14% O₂)" : "AEROBIC EQUILIBRIUM"}
            </span>
          </div>

          {/* SVG Structural Architecture */}
          <div className="relative my-auto flex justify-center items-center py-4">
            <svg viewBox="0 0 900 480" className="w-full h-auto max-h-[42vh]">
              <defs>
                <pattern id="timberHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#30363d" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* Ground & Wheel Rollers */}
              <line x1="60" y1="440" x2="840" y2="440" stroke="#30363d" strokeWidth="2.5" />
              
              {/* Massive 1.8m Timber Wheels */}
              <circle cx="230" cy="410" r="32" fill="#161b22" stroke="#d97706" strokeWidth="4" />
              <circle cx="230" cy="410" r="8" fill="#f59e0b" />
              <circle cx="680" cy="410" r="32" fill="#161b22" stroke="#d97706" strokeWidth="4" />
              <circle cx="680" cy="410" r="8" fill="#f59e0b" />

              {/* Equine Timber Skeleton */}
              <path
                d="M 210 410 L 220 270 L 260 220 L 330 210 L 360 160 L 410 90 L 460 40 L 520 50 L 540 100 L 500 170 L 490 270 L 610 280 L 650 310 L 670 410 L 620 410 L 610 330 L 560 300 L 310 300 L 260 330 L 250 410 Z"
                fill={layer === "timber" ? "#161b22" : "url(#timberHatch)"}
                stroke={layer === "stress" ? (soldierCount > 35 ? "#ef4444" : "#f59e0b") : "#8b949e"}
                strokeWidth={layer === "stress" ? 3.5 : 2}
                strokeLinejoin="round"
              />

              {/* Concealed Nostril Micro-Aperture (4.5 cm2) */}
              <circle cx="520" cy="50" r="4" fill={nostrilVentOpen ? "#10b981" : "#ef4444"} />
              <line x1="520" y1="50" x2="580" y2="25" stroke="#58a6ff" strokeWidth="1" strokeDasharray="3,2" />
              <text x="590" y="28" fill="#58a6ff" fontSize="10" fontWeight="bold">
                NOSTRIL VENT: {nostrilVentOpen ? "4.5 cm² OPEN" : "SEALED"}
              </text>

              {/* Internal Abdominal Chamber (38.4 m3) */}
              <rect
                x="330"
                y="220"
                width="240"
                height="85"
                fill={isFatal ? "rgba(239, 68, 68, 0.15)" : isCriticalHypoxia ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.1)"}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                rx="4"
              />

              {/* Hoplite Matrix Grid in X-Ray Mode */}
              {layer === "xray" && (
                <g id="hopliteMatrix">
                  {Array.from({ length: soldierCount }).map((_, i) => {
                    const cols = 12;
                    const r = Math.floor(i / cols);
                    const c = i % cols;
                    const cx = 345 + c * 18;
                    const cy = 238 + r * 22;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill={isFatal ? "#ef4444" : isCriticalHypoxia ? "#f59e0b" : "#38bdf8"}
                        className="transition-all duration-200"
                        opacity={0.9}
                      />
                    );
                  })}
                </g>
              )}

              {/* Dimension Callouts */}
              <text x="450" y="195" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
                CHAMBER VOLUME: 38.4 m³ · {soldierCount} HOPLITES ON BOARD
              </text>
            </svg>

            {/* Canvas Respiratory Particle Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute pointer-events-none opacity-40 mix-blend-screen"
              style={{ left: "36%", top: "45%", width: "27%", height: "18%" }}
            />
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#21262d] pt-3 text-[11px]">
            <div>
              <span className="text-[#8b949e] block">GROSS MASS:</span>
              <strong className="text-white">{rollingWeightTonnes} TONNES</strong>
            </div>
            <div>
              <span className="text-[#8b949e] block">HAUL FORCE (μ=0.08):</span>
              <strong className="text-[#f59e0b]">{dragForceKiloNewtons} kN</strong>
            </div>
            <div>
              <span className="text-[#8b949e] block">TROJAN HAULERS:</span>
              <strong className="text-white">{haulersRequired} CITIZENS</strong>
            </div>
            <div>
              <span className="text-[#8b949e] block">SCAEAN GATE BREACH:</span>
              <strong className="text-[#58a6ff]">REQ. (+0.9m BREACH)</strong>
            </div>
          </div>
        </div>

        {/* Right Forensic Dossier & Biophysical Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Classical Literary Forensic Discrepancy Matrix */}
          <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl">
            <h2 className="text-xs uppercase font-bold text-[#f59e0b] tracking-wider mb-2">
              CLASSICAL CORPUS // PAYLOAD DISCREPANCY
            </h2>
            <div className="space-y-2 text-xs">
              {CLASSICAL_SOURCES.map((s, idx) => (
                <button
                  key={s.author}
                  onClick={() => applySource(idx)}
                  className={`w-full text-left p-2 rounded border transition-all ${
                    selectedSourceIdx === idx
                      ? "border-[#d97706] bg-[#161b22]"
                      : "border-[#21262d] bg-transparent hover:border-[#30363d]"
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-white">{s.author} ({s.men} Hoplites)</span>
                    <span className={s.feasibility === "Fatal (Hypoxia)" ? "text-red-400" : s.feasibility === "Borderline" ? "text-amber-400" : "text-emerald-400"}>
                      {s.feasibility}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8b949e] mt-1 font-sans leading-tight">{s.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chamber Atmospheric O2 / CO2 Gauge */}
          <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#8b949e] uppercase">BIOMETRIC ATMOSPHERE</span>
              <span className="text-[10px] text-[#7d8590]">{elapsedHours.toFixed(1)}H INSIDE TROY</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#161b22] p-2.5 rounded border border-[#21262d]">
                <span className="text-[10px] text-[#8b949e] block font-bold">OXYGEN (O₂)</span>
                <span className={`text-xl font-black ${isFatal ? "text-red-500" : isCriticalHypoxia ? "text-amber-400" : "text-emerald-400"}`}>
                  {currentO2Percent.toFixed(1)}%
                </span>
                <span className="text-[9px] text-[#7d8590] block">NORMAL: 20.9% · CRIT &lt;14%</span>
              </div>

              <div className="bg-[#161b22] p-2.5 rounded border border-[#21262d]">
                <span className="text-[10px] text-[#8b949e] block font-bold">CARBON DIOXIDE</span>
                <span className={`text-xl font-black ${currentCO2Percent > 5.0 ? "text-red-400" : "text-white"}`}>
                  {currentCO2Percent.toFixed(1)}%
                </span>
                <span className="text-[9px] text-[#7d8590] block">TOXIC &gt;5.0%</span>
              </div>
            </div>

            {/* Nostril Micro-Ventilation Aperture Switch */}
            <button
              onClick={() => setNostrilVentOpen(!nostrilVentOpen)}
              className={`w-full py-2 rounded text-xs font-bold uppercase border transition-all ${
                nostrilVentOpen
                  ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                  : "border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444]"
              }`}
            >
              NOSTRIL VENTILATION: {nostrilVentOpen ? "OPEN (4.5 cm² SLIT)" : "SEALED (ZERO INFLOW)"}
            </button>
          </div>

          {/* Named Greek Champions (Interactive Roster) */}
          <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl">
            <h3 className="text-xs uppercase font-bold text-[#8b949e] mb-2">
              HOMERIC HERO ROSTER ({HEROES.length} CHAMPIONS)
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {HEROES.map((h) => (
                <button
                  key={h.name}
                  onClick={() => setSelectedHero(h)}
                  className={`p-1.5 rounded border text-center transition-all ${
                    selectedHero?.name === h.name
                      ? "border-[#d97706] bg-[#d97706]/20 text-[#f59e0b]"
                      : "border-[#21262d] bg-[#161b22] text-[#8b949e] hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold block">{h.name}</span>
                  <span className="text-[8px] text-[#7d8590] block">{h.greek}</span>
                </button>
              ))}
            </div>

            {selectedHero && (
              <div className="mt-2.5 p-2 bg-[#161b22] rounded border border-[#30363d] text-[11px] text-[#c9d1d9] flex justify-between items-center">
                <div>
                  <strong className="text-[#f59e0b]">{selectedHero.name} ({selectedHero.greek})</strong>
                  <span className="text-[#8b949e] block text-[10px]">{selectedHero.role} · Bronze Armor {selectedHero.armorKg}kg</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-400">{selectedHero.pulseBpm} BPM</span>
                  <span className="text-[9px] text-[#7d8590] block">ADRENALINE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Forensic Timeline Scrubber */}
      <footer className="z-30 border-t border-[#21262d] pt-3 flex flex-wrap justify-between items-center text-xs gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <span className="text-[#8b949e] font-bold shrink-0">INCUBATION CLOCK:</span>
          <input
            type="range"
            min="0.5"
            max="16.0"
            step="0.5"
            value={elapsedHours}
            onChange={(e) => setElapsedHours(Number(e.target.value))}
            className="w-full accent-[#d97706] cursor-pointer"
          />
          <span className="text-[#f59e0b] font-bold shrink-0">{elapsedHours.toFixed(1)} HOURS</span>
        </div>

        <div className="text-[11px] text-[#8b949e] text-right font-sans">
          <span>SCHLIEMANN 1873 EXCAVATION: SCAEAN GATE (3.2m) &lt; HORSE BASE (4.1m) · CITY WALL BREACH VERIFIED</span>
        </div>
      </footer>
    </main>
  );
}
