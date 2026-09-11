"use client";

import React, { useState, useId } from "react";
import Link from "next/link";

interface FieldPreset {
  magnetX: number;
  magnetY: number;
  intensity: number;
  polarity: "dipole" | "monopole-N" | "monopole-S";
  label: string;
  description: string;
}

const FIELD_PRESETS: FieldPreset[] = [
  {
    magnetX: 50,
    magnetY: 26,
    intensity: 80,
    polarity: "dipole",
    label: "Zenith Dipole",
    description: "Symmetrical dipole flux field; typographic stems erupt into vertical Rosensweig spikes along curved magnetic force lines."
  },
  {
    magnetX: 16,
    magnetY: 54,
    intensity: 92,
    polarity: "monopole-N",
    label: "Lateral North Shear",
    description: "Intense asymmetric field; letters shear toward the left pole, character spines curving along radial magnetic flux vectors."
  },
  {
    magnetX: 50,
    magnetY: 50,
    intensity: 22,
    polarity: "dipole",
    label: "Sub-Critical Fluid",
    description: "Field intensity below critical Rosensweig threshold (Bc); ferrofluid relaxes into smooth, viscous black obsidian letterforms."
  }
];

export default function FerromagneticFluxExperiment() {
  const [magnetPos, setMagnetPos] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const [fieldStrength, setFieldStrength] = useState<number>(78); // Gauss %
  const [polarity, setPolarity] = useState<"dipole" | "monopole-N" | "monopole-S">("dipole");
  const [viscosityDamping, setViscosityDamping] = useState<number>(65);
  const [showFluxLines, setShowFluxLines] = useState<boolean>(true);
  const [isDraggingMagnet, setIsDraggingMagnet] = useState<boolean>(false);

  const strengthId = useId();
  const viscId = useId();

  // Vector calculation from typography center (50%, 50%) to the actuator magnet
  const dx = magnetPos.x - 50;
  const dy = magnetPos.y - 50;
  const distance = Math.max(8, Math.sqrt(dx * dx + dy * dy));

  // Cowley & Rosensweig Normal-Field Instability Threshold:
  // Spikes erupt only when magnetic field B exceeds the critical threshold Bc (~35 Gauss)
  const isRosensweigActive = fieldStrength > 35;
  const spikeAmplitude = isRosensweigActive
    ? Math.min(36, ((fieldStrength - 35) / 65) * (65 / distance) * 26)
    : 0;

  // Dipole flux shear vectors
  const fluxShearX = (dx / distance) * (fieldStrength / 100) * 20;
  const fluxShearY = (dy / distance) * (fieldStrength / 100) * 20;

  // Critical Rosensweig peak wavelength lambda_c (mm)
  const criticalWavelength = isRosensweigActive
    ? Math.max(3.2, 12 - (fieldStrength / 100) * 7.5)
    : 0;

  // Direct tactile dragging of the Neodymium Magnet
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingMagnet(true);
    updateMagnetPos(e);
  };

  const handlePointerUp = () => setIsDraggingMagnet(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingMagnet) {
      updateMagnetPos(e);
    }
  };

  const updateMagnetPos = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100));
    setMagnetPos({ x, y });
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#040609] text-[#e2e8f0] font-sans antialiased select-none overflow-hidden relative flex flex-col justify-between p-6 sm:p-14 touch-none cursor-crosshair"
      style={{
        backgroundImage: `
          radial-gradient(circle at ${magnetPos.x}% ${magnetPos.y}%, rgba(0, 240, 255, 0.09) 0%, transparent 68%),
          radial-gradient(#1e293b 0.75px, transparent 0.75px)
        `,
        backgroundSize: "100% 100%, 32px 32px"
      }}
    >
      {/* Faraday Laboratory Header */}
      <header className="flex justify-between items-baseline z-30 border-b border-[#1e293b] pb-4">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-[#94a3b8] hover:text-[#00f0ff] transition-colors font-semibold"
          >
            ← Design Minds
          </Link>
          <span className="text-[#334155] font-mono">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#00f0ff] font-bold">
            Noon Mind · Day 008 · Cowley-Rosensweig Ferroflux
          </span>
        </div>

        <div className="font-mono text-xs text-[#94a3b8] hidden sm:flex items-center gap-6">
          <span>FLUX (B): <strong className={isRosensweigActive ? "text-[#00f0ff] font-bold" : "text-white"}>{fieldStrength} Gauss</strong></span>
          <span>SPIKE HEIGHT: <strong className="text-[#38bdf8]">{spikeAmplitude.toFixed(1)}px</strong></span>
          <span>WAVELENGTH (λ): <strong className="text-[#38bdf8]">{criticalWavelength > 0 ? `${criticalWavelength.toFixed(1)}mm` : "—"}</strong></span>
          <span>POLARITY: <strong className="text-amber-400 uppercase">{polarity}</strong></span>
        </div>
      </header>

      {/* Faraday Magnetic Flux Line Curves (Background Vector Field) */}
      {showFluxLines && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fluxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[-60, -40, -20, 0, 20, 40, 60].map((offset) => (
            <path
              key={offset}
              d={`M ${magnetPos.x} ${magnetPos.y} Q ${50 + offset} 50 50 ${85 + Math.abs(offset) * 0.2}`}
              fill="none"
              stroke="url(#fluxGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
          ))}
        </svg>
      )}

      {/* Floating Neodymium Magnet Actuator Indicator */}
      <div
        className="absolute w-12 h-12 rounded-full border-2 border-[#00f0ff] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-40 transition-transform duration-75 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.45)]"
        style={{
          left: `${magnetPos.x}%`,
          top: `${magnetPos.y}%`,
          backgroundColor: polarity === "monopole-N" ? "rgba(239, 68, 68, 0.25)" : polarity === "monopole-S" ? "rgba(59, 130, 246, 0.25)" : "rgba(0, 240, 255, 0.18)"
        }}
      >
        <span className="font-mono text-[9px] font-black tracking-tighter text-[#00f0ff]">
          {polarity === "monopole-N" ? "NORTH" : polarity === "monopole-S" ? "SOUTH" : "DIPOLE"}
        </span>
      </div>

      {/* Main Ferromagnetic Fluid Stage (Full-Bleed Direct Manipulation Canvas) */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-10 relative z-10 text-center">
        
        {/* Rosensweig Instability Status Pill */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#1e293b] bg-[#090d16]/95 backdrop-blur mb-8 font-mono text-xs text-[#94a3b8] z-20 shadow-sm">
          <span
            className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: isRosensweigActive ? "#00f0ff" : "#64748b",
              boxShadow: isRosensweigActive ? "0 0 12px #00f0ff" : "none"
            }}
          />
          <span className="uppercase tracking-widest text-[11px] font-bold text-white">
            {isRosensweigActive ? "Rosensweig Normal-Field Instability" : "Sub-Critical Viscous Equilibrium"}
          </span>
          <span>·</span>
          <span>{fieldStrength}% Field Density</span>
          {showFluxLines && <span className="text-[#38bdf8] font-semibold">· Flux Field Grid</span>}
        </div>

        {/* The Spiking Ferromagnetic Typographic Core */}
        <div className="relative max-w-5xl w-full py-8">
          <h1
            className="text-5xl sm:text-7xl md:text-9xl uppercase font-black tracking-tight select-none transition-all duration-100 ease-out font-sans"
            style={{
              color: "#0f172a",
              transform: `translate(${fluxShearX}px, ${fluxShearY}px) skew(${fluxShearX * 0.4}deg, ${fluxShearY * 0.2}deg)`,
              textShadow: isRosensweigActive
                ? `
                  0 0 1px #00f0ff,
                  ${(dx / distance) * spikeAmplitude}px ${(dy / distance) * spikeAmplitude}px ${spikeAmplitude * 0.85}px rgba(0, 240, 255, 0.75),
                  ${-(dx / distance) * (spikeAmplitude * 0.45)}px ${-(dy / distance) * (spikeAmplitude * 0.45)}px 10px rgba(15, 23, 42, 0.98),
                  0 0 35px rgba(0, 240, 255, 0.3)
                `
                : "0 0 25px rgba(15, 23, 42, 0.85)"
            }}
          >
            Ferroflux
          </h1>

          <p className="mt-8 text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto font-serif italic leading-relaxed z-20">
            "Colloidal iron nanoparticles suspended in carrier fluid. In zero magnetic field, the letters rest as liquid obsidian; sweep the neodymium actuator overhead, and the stroke spines polarize along curved flux lines, erupting into crystalline Rosensweig spikes."
          </p>
        </div>

        {/* Direct-Manipulation Cue */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#64748b] mt-4 z-20">
          {isDraggingMagnet ? "⚡ Modulating Neodymium Magnetic Field..." : "Drag anywhere across the stage to sweep the magnetic actuator over the ferrofluid typography"}
        </p>

        {/* Minimalist Induction Stage Dock */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 bg-[#090d16]/90 border border-[#1e293b] px-8 py-3 rounded-full backdrop-blur z-30 font-mono text-xs">
          <div className="flex items-center gap-3">
            <label htmlFor={strengthId} className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Field (Gauss)</label>
            <input
              id={strengthId}
              type="range"
              min="0"
              max="100"
              value={fieldStrength}
              onChange={(e) => setFieldStrength(Number(e.target.value))}
              className="w-28 accent-[#00f0ff] cursor-pointer"
            />
            <span className="font-bold text-[#00f0ff] w-8">{fieldStrength}%</span>
          </div>

          <div className="h-4 w-px bg-[#334155]" />

          <div className="flex items-center gap-3">
            <label htmlFor={viscId} className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Viscosity (η)</label>
            <input
              id={viscId}
              type="range"
              min="20"
              max="95"
              value={viscosityDamping}
              onChange={(e) => setViscosityDamping(Number(e.target.value))}
              className="w-24 accent-[#00f0ff] cursor-pointer"
            />
            <span className="font-bold text-white w-8">{viscosityDamping}%</span>
          </div>

          <div className="h-4 w-px bg-[#334155]" />

          <button
            onClick={() => setPolarity(polarity === "dipole" ? "monopole-N" : polarity === "monopole-N" ? "monopole-S" : "dipole")}
            className="px-3 py-1 rounded text-[10px] uppercase font-bold border border-[#334155] hover:border-[#00f0ff] transition-colors text-[#00f0ff]"
          >
            Pole: {polarity}
          </button>

          <button
            onClick={() => setShowFluxLines(!showFluxLines)}
            className={`px-3 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
              showFluxLines ? "border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]" : "border-[#334155] text-[#94a3b8]"
            }`}
          >
            Flux Lines
          </button>

          <div className="h-4 w-px bg-[#334155]" />

          <div className="flex items-center gap-2">
            {FIELD_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setMagnetPos({ x: p.magnetX, y: p.magnetY });
                  setFieldStrength(p.intensity);
                  setPolarity(p.polarity);
                }}
                className="px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all border border-[#334155] bg-transparent text-[#94a3b8] hover:text-[#00f0ff] hover:border-[#00f0ff]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Faraday & Crouwel Colophon */}
      <footer className="border-t border-[#1e293b] pt-4 flex flex-wrap justify-between items-center text-[11px] font-mono text-[#64748b] z-30">
        <div>MICHAEL FARADAY MAGNETIC FLUX · WIM CROUWEL VECTOR MATRICES · COWLEY-ROSENSWEIG INSTABILITY</div>
        <div className="tracking-wider">CHAPTER VIII: FERROMAGNETIC FLUX & MAGNETO-OPTICAL VECTORING</div>
      </footer>
    </main>
  );
}
