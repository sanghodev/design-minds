import React, { useState } from "react";

export default function HorizontalFilmstripExperiment() {
  const [scrollX, setScrollX] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#141416] text-[#E4E4E6] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">CINEMATIC HORIZONTAL · DAY 021 · 2026-09-22</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">FILMSTRIP PANORAMA</h1>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button onClick={() => setScrollX((prev) => Math.max(prev - 200, 0))} className="px-3 py-1 border border-white/20 hover:border-white">◀ LEFT</button>
          <button onClick={() => setScrollX((prev) => Math.min(prev + 200, 600))} className="px-3 py-1 border border-white/20 hover:border-white">RIGHT ▶</button>
        </div>
      </header>

      {/* Horizontal Rail */}
      <main className="my-auto py-12 overflow-hidden">
        <div 
          className="flex gap-8 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${scrollX}px)` }}
        >
          {["ACT I: THE EXPOSITION", "ACT II: THE CONFLICT", "ACT III: THE APEX", "ACT IV: RESOLUTION"].map((act, i) => (
            <div key={i} className="min-w-[340px] md:min-w-[420px] p-8 bg-[#1C1C20] border border-white/10 rounded-2xl flex flex-col justify-between h-[360px]">
              <span className="font-mono text-xs text-amber-400">FRAME 00{i+1}</span>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tight">{act}</h3>
                <p className="text-xs text-white/60 mt-3 leading-relaxed">
                  Cinematic horizontal travel mimicking 35mm celluloid frames gliding past the projection gate.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 font-mono text-xs text-white/40">
                SCENE REEL DURATION: 24 FPS
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 pt-4 flex justify-between font-mono text-xs text-white/40">
        <span>PANORAMIC FILM STRIP ARCHIVE</span>
        <span>OFFSET: {scrollX}px</span>
      </footer>
    </div>
  );
}
