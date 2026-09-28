import React, { useState } from "react";

export default function VignelliUnigridExperiment() {
  const [gridRatio, setGridRatio] = useState<string>("4x3");

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="border-b-2 border-black pb-4 flex justify-between items-start">
        <div>
          <span className="font-mono text-xs tracking-widest uppercase">VIGNELLI UNIGRID · DAY 023 · 2026-09-24</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mt-1">THE UNIGRID</h1>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          {["4x3", "6x4", "8x6"].map((ratio) => (
            <button
              key={ratio}
              onClick={() => setGridRatio(ratio)}
              className={`px-3 py-1 border border-black ${gridRatio === ratio ? "bg-black text-white" : ""}`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </header>

      <main className="my-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-b-2 border-black py-8">
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold">01 / GEOMETRIC LOGIC</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">STANDARDIZED MODULES</h3>
          <p className="text-xs leading-relaxed text-black/70">
            A comprehensive system developed for the National Park Service to unify hundreds of disparate publications.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-mono font-bold">02 / TYPOGRAPHIC CANON</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">HELVETICA PURITY</h3>
          <p className="text-xs leading-relaxed text-black/70">
            Four sizes of one typeface. Contrast is achieved not by changing fonts, but through dramatic scale jumps.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-mono font-bold">03 / BLACK BAND</div>
          <h3 className="text-2xl font-bold uppercase tracking-tight">UNYIELDING HEADER</h3>
          <p className="text-xs leading-relaxed text-black/70">
            The prominent black band running across the top anchors the entire information hierarchy.
          </p>
        </div>

        <div className="bg-black text-white p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-white/50">VIGNELLI MAXIM</div>
          <div className="text-lg font-bold leading-tight uppercase">
            "IF YOU CAN DESIGN ONE THING, YOU CAN DESIGN EVERYTHING."
          </div>
        </div>
      </main>

      <footer className="pt-4 flex justify-between font-mono text-xs text-black/50">
        <span>MASSIMO & LELLA VIGNELLI ARCHIVE</span>
        <span>MODULAR PURITY</span>
      </footer>
    </div>
  );
}
