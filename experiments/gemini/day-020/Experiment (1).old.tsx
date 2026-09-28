import React, { useState } from "react";

export default function DarkLuminescenceExperiment() {
  const [activeEdge, setActiveEdge] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">OLED PURITY · DAY 020 · 2026-09-21</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">NEON EDGE MATRIX</h1>
        </div>
        <div className="font-mono text-xs text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>ZERO-LUX CANVAS</span>
        </div>
      </header>

      <main className="my-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Phosphor Pulse", val: "480 nm", desc: "Cyan wireframe traces along card perimeters on hover." },
          { title: "Quantum Well", val: "0.02 lux", desc: "Absolute black backdrop preserving infinite display contrast." },
          { title: "Saccadic Focus", val: "100%", desc: "Directing ocular attention strictly through edge luminescence." }
        ].map((item, i) => (
          <div
            key={i}
            onMouseEnter={() => setActiveEdge(i)}
            onMouseLeave={() => setActiveEdge(null)}
            className={`p-8 bg-[#080808] border transition-all duration-300 cursor-pointer ${
              activeEdge === i ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "border-white/15"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-mono text-xs text-cyan-400">EDGE N°0{i+1}</span>
              <span className="font-mono text-xs opacity-60">{item.val}</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">{item.title}</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">{item.desc}</p>
          </div>
        ))}
      </main>

      <footer className="border-t border-white/10 pt-4 flex justify-between font-mono text-xs opacity-50">
        <span>OLED WIREFRAME MINIMALISM</span>
        <span>EDGE-TRACED TELEMETRY</span>
      </footer>
    </div>
  );
}
