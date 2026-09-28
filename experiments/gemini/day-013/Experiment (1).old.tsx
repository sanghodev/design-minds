import React, { useState } from "react";

export default function NeoBrutalismExperiment() {
  const [clicked, setClicked] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FFF066] text-black p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="flex justify-between items-center border-4 border-black p-6 bg-white shadow-[6px_6px_0px_#000]">
        <div>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">NEO-BRUTALISM · DAY 013 · 2026-09-14</span>
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tight">RAW CONTRAST</h1>
        </div>
        <div className="font-mono font-bold text-sm bg-[#FF6B6B] px-3 py-1 border-2 border-black shadow-[3px_3px_0px_#000]">
          ZERO BLUR SHADOWS
        </div>
      </header>

      <main className="my-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#4D96FF] border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
          <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-black">POST-DIGITAL</span>
          <h2 className="text-3xl font-black uppercase mt-4 mb-2">BOLD GEOMETRY</h2>
          <p className="font-mono text-xs font-medium leading-relaxed">
            Rejection of corporate pastel gradients. Sharp 90-degree corners, unapologetic black ink boundaries.
          </p>
        </div>

        <div className="bg-[#6BCB77] border-4 border-black p-8 shadow-[8px_8px_0px_#000] flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-black">TACTILITY</span>
            <h2 className="text-3xl font-black uppercase mt-4 mb-2">HARD STROKES</h2>
          </div>
          <button
            onClick={() => setClicked(!clicked)}
            className={`font-mono font-black text-sm uppercase py-4 border-3 border-black bg-white transition-all ${
              clicked ? "translate-x-1.5 translate-y-1.5 shadow-[0px_0px_0px_#000]" : "shadow-[6px_6px_0px_#000]"
            }`}
          >
            {clicked ? "PRESSED!" : "CLICK FOR TACTILE SNAP"}
          </button>
        </div>

        <div className="bg-[#FFD93D] border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
          <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-black">HIERARCHY</span>
          <h2 className="text-3xl font-black uppercase mt-4 mb-2">RAW METRICS</h2>
          <div className="font-mono text-4xl font-black mt-6">4px BORDER</div>
          <div className="font-mono text-sm mt-1">6px HARD SHADOW</div>
        </div>
      </main>

      <footer className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_#000] flex justify-between font-mono text-xs font-bold">
        <span>NEO-BRUTALIST WEB SPEC</span>
        <span>HIGH VOLTAGE AESTHETICS</span>
      </footer>
    </div>
  );
}
