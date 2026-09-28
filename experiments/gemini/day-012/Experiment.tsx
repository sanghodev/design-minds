import React, { useState } from "react";

export default function OpticalMoireKinetics() {
  const [angle, setAngle] = useState<number>(15);
  const [pitch, setPitch] = useState<number>(3.5);
  const isRosette = angle === 0 || angle === 30 || angle === 60 || angle === 90;

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="flex justify-between items-start border-b-2 border-black pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E63946]">DAY 012 · 2026-09-13</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">OPTICAL MOIRÉ KINETICS</h1>
          <p className="font-mono text-xs opacity-60 mt-1 max-w-lg">
            Karl Gerstner Programmed Optics. Superimposed AM Halftone Screens. Rotate screen angle to oscillate between sweeping kinetic waves and crystalline rosettes.
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs items-center">
          <div className="flex items-center gap-2">
            <span>ANGLE:</span>
            <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-24 accent-black cursor-pointer" />
            <span className="w-10 text-right font-bold">{angle}°</span>
          </div>
          <div className={`px-2 py-1 border border-black text-[10px] font-bold ${isRosette ? "bg-black text-white" : ""}`}>
            {isRosette ? "ROSETTE LOCK" : "KINETIC WAVE"}
          </div>
        </div>
      </header>

      <main className="relative my-auto flex items-center justify-center py-12">
        <div className="relative w-[340px] md:w-[600px] h-[360px] border-2 border-black bg-white overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Base Halftone Layer */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
            backgroundImage: `radial-gradient(#000 1.2px, transparent 1.2px)`,
            backgroundSize: `${pitch}px ${pitch}px`
          }} />
          
          {/* Rotated Halftone Layer */}
          <div className="absolute inset-[-50%] opacity-40 pointer-events-none transition-transform duration-100 ease-out" style={{
            transform: `rotate(${angle}deg)`,
            backgroundImage: `radial-gradient(#000 1.2px, transparent 1.2px)`,
            backgroundSize: `${pitch}px ${pitch}px`
          }} />

          {/* Typography Intercept */}
          <div className="relative z-10 text-center mix-blend-difference text-white">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">GERSTNER</h2>
            <div className="font-mono text-xs tracking-[0.4em] uppercase mt-2">PROGRAMMED SYSTEM</div>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-black pt-4 flex justify-between font-mono text-xs opacity-60">
        <span>SWISS CONCRETE GRAPHIC SPEC · AM SCREEN INTERFERENCE</span>
        <span>λ = d / (2 sin(θ/2))</span>
      </footer>
    </div>
  );
}
