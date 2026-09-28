import React, { useState, useEffect } from "react";

export default function ScrollSpatialChoreography() {
  const [scrollY, setScrollY] = useState<number>(0);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string>("01");

  const ITEMS = [
    { id: "01", title: "Kinetic Masthead", category: "TEMPORAL TYPOGRAPHY", color: "#FF3366", depth: 1.2 },
    { id: "02", title: "Asymmetric Void", category: "SPATIAL ARCHITECTURE", color: "#33CC99", depth: 1.8 },
    { id: "03", title: "Haptic Spring", category: "NEURO-PHYSICS", color: "#FFCC00", depth: 2.4 },
    { id: "04", title: "Caustic Refraction", category: "OPTICAL COMPUTING", color: "#9933FF", depth: 3.0 }
  ];

  return (
    <div className="relative min-h-screen bg-[#08080C] text-[#F0F0F5] p-8 md:p-16 font-sans select-none overflow-x-hidden">
      {/* Dynamic Camera Rail Indicator */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08080C]/80 backdrop-blur-xl border-b border-white/10 px-8 py-5 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#FF3366]">DAY 010 · 2026-09-11</span>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">SPATIAL CHOREOGRAPHY</h1>
        </div>
        <div className="flex gap-4 font-mono text-xs items-center">
          <span>MODE:</span>
          <button
            onClick={() => setActiveView(activeView === "list" ? "detail" : "list")}
            className="px-3 py-1.5 border border-white/30 rounded hover:border-white transition-colors uppercase"
          >
            {activeView === "list" ? "EXPAND VIEW TRANSITION" : "RETURN TO GRID"}
          </button>
        </div>
      </header>

      {/* Main Choreographed Viewport */}
      <main className="pt-28 pb-20 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 py-8">
          <div className="inline-block px-3 py-1 rounded-full border border-white/20 font-mono text-xs text-white/60 uppercase">
            CSS animation-timeline · View Transitions API
          </div>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase max-w-3xl mx-auto leading-none">
            The Continuous Camera Track
          </h2>
          <p className="font-mono text-xs text-white/50 max-w-lg mx-auto leading-relaxed">
            Elements retain persistent 3D spatial coordinates across view transitions, eliminating the jarring fragmentation of discrete pages.
          </p>
        </div>

        {/* Persistent Spatial Morphing Cards */}
        <div className={`grid gap-8 transition-all duration-700 ease-out ${
          activeView === "list" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}>
          {ITEMS.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => { setSelectedId(item.id); setActiveView("detail"); }}
                className={`relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                  activeView === "detail" && !isSelected
                    ? "opacity-30 scale-95 border-white/5"
                    : "border-white/15 bg-white/5 hover:border-white/40 shadow-2xl"
                }`}
                style={{
                  transform: activeView === "detail" && isSelected ? "scale(1.02)" : "scale(1)"
                }}
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-xs tracking-widest opacity-50 uppercase">{item.category}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed max-w-md">
                  Choreographed motion vector bound to GPU compositing pipeline. Zero layout recalculation overhead.
                </p>
                <div className="mt-8 pt-4 border-t border-white/10 flex justify-between font-mono text-xs opacity-40">
                  <span>PERSISTENT ID: {item.id}</span>
                  <span>VELOCITY COHERENCE: 100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-white/10 pt-6 flex justify-between font-mono text-xs opacity-40">
        <span>SPATIAL CHOREOGRAPHY ENGINE</span>
        <span>ZERO-PAGE BREAK TRANSITION SPEC</span>
      </footer>
    </div>
  );
}
