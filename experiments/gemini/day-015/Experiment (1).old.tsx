import React, { useState } from "react";

export default function GlassmorphismExperiment() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen bg-gradient-to-br from-[#1A1A24] via-[#0E0E14] to-[#050508] text-white p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      {/* Background Luminescent Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="font-mono text-xs text-purple-400 uppercase tracking-widest">SPATIAL UI · DAY 015 · 2026-09-16</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">FROSTED GLASSMORPHISM</h1>
        </div>
        <div className="font-mono text-xs text-white/50">BACKDROP BLUR: 32px</div>
      </header>

      <main className="relative z-10 my-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Optical Caustics", tag: "REFRACTION", desc: "Simulating light passing through curved semi-translucent glass membranes." },
          { title: "Specular Highlights", tag: "LIGHTING", desc: "Dynamic edge highlights gliding along 1px borders in sync with cursor coordinates." },
          { title: "Multi-Plane Depth", tag: "ELEVATION", desc: "Z-axis hierarchy maintained through variable blur radii and tint opacity." }
        ].map((card, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-white/5 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/40 hover:-translate-y-1.5"
          >
            <span className="text-xs font-mono tracking-widest text-purple-300 uppercase">{card.tag}</span>
            <h3 className="text-2xl font-bold tracking-tight mt-4 mb-2">{card.title}</h3>
            <p className="text-xs text-white/70 leading-relaxed font-light">{card.desc}</p>
          </div>
        ))}
      </main>

      <footer className="relative z-10 border-t border-white/10 pt-4 flex justify-between font-mono text-xs text-white/40">
        <span>SPATIAL COMPUTING VIEWPORT</span>
        <span>PRISTINE OPTICAL DEPTH</span>
      </footer>
    </div>
  );
}
