import React, { useState } from "react";

export default function CyberEditorialExperiment() {
  const [activeTab, setActiveTab] = useState<string>("SYSTEM");

  return (
    <div className="min-h-screen bg-[#08080A] text-[#00FF66] p-8 md:p-16 font-mono select-none flex flex-col justify-between text-xs">
      <header className="border-b border-[#00FF66]/30 pb-4 flex justify-between items-center">
        <div>
          <div className="text-[10px] opacity-60">CYBER-EDITORIAL · DAY 014 · 2026-09-15</div>
          <h1 className="text-xl md:text-3xl font-bold tracking-widest mt-1">MONOSPACED TERMINAL v4.2</h1>
        </div>
        <div className="animate-pulse">● LIVE BUFFER</div>
      </header>

      <main className="my-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8 border border-[#00FF66]/20 p-6 bg-[#0B0B0E]">
        <div className="md:col-span-4 border-r border-[#00FF66]/20 pr-6 space-y-4">
          <div className="text-[#00FF66]/50">[SECTION_INDEX]</div>
          <div className="space-y-1">
            {["SYSTEM", "NETWORK", "TELEMETRY", "SECURITY"].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer px-2 py-1 ${activeTab === tab ? "bg-[#00FF66] text-black font-bold" : "hover:bg-[#00FF66]/10"}`}
              >
                &gt; {tab}
              </div>
            ))}
          </div>
          <div className="pt-6 text-[10px] opacity-40 leading-relaxed">
            CHARACTER MATRIX: 80x24<br/>
            GRID PITCH: 1.0ch<br/>
            FONT: JETBRAINS MONO
          </div>
        </div>

        <div className="md:col-span-8 space-y-4">
          <div className="text-sm font-bold border-b border-[#00FF66]/20 pb-2">
            === ACTIVE ARCHIVE: {activeTab} ===
          </div>
          <p className="leading-relaxed opacity-80">
            Every typographical element adheres to strict character-width increments. 
            No arbitrary kerning or variable spacing. The terminal screen functions as an unyielding architectural coordinate lattice where text is pure code and pure structure.
          </p>
          <div className="border border-[#00FF66]/30 p-4 bg-black/40">
            <span className="text-white">root@design-minds:~$</span> echo "Purity through monospace discipline"
            <span className="inline-block w-2 h-4 bg-[#00FF66] ml-2 animate-ping" />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#00FF66]/30 pt-4 flex justify-between text-[10px] opacity-50">
        <span>100% MONOSPACE GRID LOCKUP</span>
        <span>ASCII SPATIAL ANCHOR</span>
      </footer>
    </div>
  );
}
