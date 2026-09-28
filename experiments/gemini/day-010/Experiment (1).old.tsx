import React, { useState } from "react";

export default function SwissGridExperiment() {
  const [columns, setColumns] = useState<number>(6);
  const [gutter, setGutter] = useState<number>(24);
  const [activePreset, setActivePreset] = useState<string>("asymmetric");

  return (
    <div className="relative min-h-screen bg-[#F4F4F0] text-[#111111] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      {/* Background Swiss Baseline Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: "linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "100% 12px"
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b-2 border-black pb-6 flex justify-between items-start">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase">SWISS STYLE · DAY 010 · 2026-09-11</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mt-2">
            MÜLLER-BROCKMANN
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#E63946] mt-1">
            Reductive Order / Mathematical Asymmetry
          </p>
        </div>

        {/* Grid Controller */}
        <div className="flex gap-4 font-mono text-xs items-center">
          <div className="flex items-center gap-2">
            <span>COLUMNS:</span>
            <button onClick={() => setColumns(4)} className={`px-2 py-1 border border-black ${columns === 4 ? "bg-black text-white" : ""}`}>4</button>
            <button onClick={() => setColumns(6)} className={`px-2 py-1 border border-black ${columns === 6 ? "bg-black text-white" : ""}`}>6</button>
            <button onClick={() => setColumns(12)} className={`px-2 py-1 border border-black ${columns === 12 ? "bg-black text-white" : ""}`}>12</button>
          </div>
          <div className="flex items-center gap-2">
            <span>GUTTER:</span>
            <input type="range" min="8" max="48" value={gutter} onChange={(e) => setGutter(Number(e.target.value))} className="w-20 accent-black cursor-pointer" />
            <span>{gutter}px</span>
          </div>
        </div>
      </header>

      {/* Dynamic Swiss Layout Body */}
      <main className="relative z-10 my-auto py-12">
        <div 
          className="grid transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gutter}px`
          }}
        >
          {/* Asymmetric Dominant Block */}
          <div className="col-span-3 bg-black text-white p-8 flex flex-col justify-between min-h-[360px]">
            <span className="font-mono text-xs text-[#E63946]">MODULE 01 / DOMINANT</span>
            <div>
              <div className="text-5xl md:text-8xl font-black leading-none tracking-tight">1957</div>
              <p className="text-xs font-mono uppercase tracking-wider mt-4 opacity-70">
                The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style.
              </p>
            </div>
          </div>

          {/* Subordinate Clean Columns */}
          <div className="col-span-2 border-t-2 border-black pt-4 flex flex-col justify-between">
            <span className="font-mono text-xs">MODULE 02 / TYPOGRAPHY</span>
            <div className="space-y-4 text-xs font-mono leading-relaxed">
              <p className="font-bold">HELVETICA & AKZIDENZ-GROTESK</p>
              <p className="opacity-70">
                Neutral, objective, non-expressive typography allows the structural architecture of the page to convey meaning.
              </p>
              <div className="h-0.5 bg-[#E63946] w-12" />
            </div>
          </div>

          <div className="col-span-1 border-t-2 border-black pt-4 flex flex-col justify-between">
            <span className="font-mono text-xs">MODULE 03 / RATIO</span>
            <div className="text-xs font-mono space-y-2">
              <div className="text-2xl font-bold">1:1.618</div>
              <div className="opacity-60">GOLDEN RATIO ANCHOR</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/20 pt-4 flex justify-between font-mono text-xs opacity-60">
        <span>SWISS TYPOGRAPHIC INTERNATIONAL ARCHIVE</span>
        <span>NO DECORATION · PURE STRUCTURE</span>
      </footer>
    </div>
  );
}
