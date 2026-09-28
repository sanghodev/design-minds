import React, { useState } from "react";

export default function FluidClampExperiment() {
  const [simWidth, setSimWidth] = useState<number>(100);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111111] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="border-b border-black/10 pb-4 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs text-rose-500 uppercase tracking-widest">FLUID CSS · DAY 024 · 2026-09-25</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">FLUID CLAMP MATRIX</h1>
        </div>
        <div className="flex gap-2 items-center font-mono text-xs">
          <span>VIEWPORT SIM:</span>
          <input
            type="range"
            min="40"
            max="100"
            value={simWidth}
            onChange={(e) => setSimWidth(Number(e.target.value))}
            className="w-24 accent-rose-500 cursor-pointer"
          />
          <span>{simWidth}%</span>
        </div>
      </header>

      {/* Simulated Responsive Container */}
      <main className="my-auto py-8 transition-all duration-300 mx-auto" style={{ width: `${simWidth}%` }}>
        <div className="border-2 border-black/20 p-8 rounded-2xl bg-white shadow-sm space-y-6">
          <span className="font-mono text-xs font-bold text-rose-500">MATHEMATICAL LINEAR INTERPOLATION</span>
          <h2 style={{ fontSize: `clamp(1.5rem, ${simWidth * 0.05}rem, 4.5rem)` }} className="font-black uppercase tracking-tight leading-none">
            CONTINUOUS HARMONY
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-black/70 font-light max-w-2xl">
            No jarring layout jumps. As the viewport narrows or expands, the clamp calculation automatically recalculates typography, margins, and gutters in continuous equilibrium.
          </p>
        </div>
      </main>

      <footer className="border-t border-black/10 pt-4 flex justify-between font-mono text-xs text-black/40">
        <span>CSS CLAMP(MIN, VAL, MAX) COMPUTATION</span>
        <span>BREAKPOINTLESS UI</span>
      </footer>
    </div>
  );
}
