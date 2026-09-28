import React, { useState } from "react";

export default function BentoGridExperiment() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const CARDS = [
    { span: "col-span-12 md:col-span-8", title: "Autonomous Core", tag: "AI TELEMETRY", metric: "99.4%", desc: "Neural pipeline synchronized across distributed edge nodes." },
    { span: "col-span-12 md:col-span-4", title: "Spatial Audio", tag: "ACOUSTIC", metric: "48 kHz", desc: "Real-time binaural spatialization." },
    { span: "col-span-12 md:col-span-4", title: "Memory Horizon", tag: "STORAGE", metric: "1.2 TB", desc: "Immutable long-term design memory ledger." },
    { span: "col-span-12 md:col-span-4", title: "Tactile Friction", tag: "PHYSICS", metric: "0.18 μ", desc: "Non-linear gesture velocity damping." },
    { span: "col-span-12 md:col-span-4", title: "Spectral Filter", tag: "OPTICS", metric: "520 nm", desc: "Subtractive chromatic light registration." }
  ];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#ECECEC] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">MODERN UI TRENDS · DAY 011 · 2026-09-12</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">BENTO ARCHITECTURE</h1>
        </div>
        <div className="font-mono text-xs text-white/50">MODULAR CARD MATRIX</div>
      </header>

      <main className="my-auto py-8">
        <div className="grid grid-cols-12 gap-6">
          {CARDS.map((c, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`${c.span} relative p-8 rounded-3xl bg-[#16161A] border transition-all duration-300 cursor-pointer overflow-hidden ${
                hoveredIndex === i ? "border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.15)] -translate-y-1" : "border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">{c.tag}</span>
                <span className="text-2xl font-bold font-mono">{c.metric}</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">{c.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 pt-4 flex justify-between font-mono text-xs text-white/40">
        <span>BENTO BOX MODULAR DESIGN SYSTEM</span>
        <span>EXPANDABLE VIEWPORT UI</span>
      </footer>
    </div>
  );
}
