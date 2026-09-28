import React, { useState } from "react";

export default function AntiDesignExperiment() {
  const [scattered, setScattered] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#111111] text-[#E0E0E0] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="border-b border-white/20 pb-4 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs text-yellow-400 uppercase tracking-widest">ANTI-DESIGN · DAY 018 · 2026-09-19</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">DECONSTRUCTION</h1>
        </div>
        <button
          onClick={() => setScattered(!scattered)}
          className="font-mono text-xs px-4 py-2 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold uppercase transition-colors"
        >
          {scattered ? "RE-ASSEMBLE" : "SCATTER GLYPHS"}
        </button>
      </header>

      <main className="my-auto py-12 relative min-h-[300px] flex items-center justify-center">
        <div className={`transition-all duration-700 flex flex-wrap gap-4 text-5xl md:text-8xl font-black uppercase ${
          scattered ? "space-x-12 rotate-3" : ""
        }`}>
          <span className={scattered ? "-translate-y-8 rotate-12 text-[#FF0055]" : ""}>BREAK</span>
          <span className={scattered ? "translate-y-12 -rotate-6 text-[#00FFFF]" : ""}>THE</span>
          <span className={scattered ? "translate-x-16 rotate-45 text-yellow-400" : ""}>RULES</span>
        </div>
      </main>

      <footer className="border-t border-white/20 pt-4 flex justify-between font-mono text-xs text-white/40">
        <span>RAY GUN / DAVID CARSON LEGACY</span>
        <span>UNTETHERED TYPOGRAPHY</span>
      </footer>
    </div>
  );
}
