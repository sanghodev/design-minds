import React, { useState } from "react";

export default function AnamorphicProjection() {
  const [pitch, setPitch] = useState<number>(75);
  const [yaw, setYaw] = useState<number>(0);

  // Exact singularity threshold: pitch == 0 && yaw == 0
  const coherence = Math.max(0, 1 - (Math.abs(pitch) / 75 + Math.abs(yaw) / 60));

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-[#E0E0EA] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="flex justify-between items-start border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">DAY 011 · 2026-09-12</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1 text-white">
            ANAMORPHIC PROJECTION
          </h1>
          <p className="text-xs text-white/50 mt-2 max-w-lg font-mono">
            Holbein Perspective Distortion. Letters are stretched across 3D space into abstract ribbons. Adjust angle to find the Anamorphic Singularity.
          </p>
        </div>

        <div className="flex gap-6 font-mono text-xs items-center">
          <div>
            <span>COHERENCE: </span>
            <span className={`font-bold ${coherence > 0.85 ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}>
              {(coherence * 100).toFixed(0)}%
            </span>
          </div>
          <button onClick={() => { setPitch(0); setYaw(0); }} className="px-3 py-1.5 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black transition-colors">
            ALIGN SINGULARITY
          </button>
        </div>
      </header>

      <main className="my-auto py-16 flex items-center justify-center" style={{ perspective: "1000px" }}>
        <div
          className="transition-transform duration-200 ease-out cursor-grab"
          style={{
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) scaleY(${1 + (Math.abs(pitch)/75) * 5})`,
            transformStyle: "preserve-3d"
          }}
        >
          <div className="text-center font-black tracking-tighter uppercase leading-none" style={{
            fontSize: "clamp(3rem, 10vw, 8rem)",
            letterSpacing: coherence > 0.8 ? "0.02em" : "0.5em",
            color: coherence > 0.85 ? "#FFFFFF" : "rgba(255,255,255,0.2)",
            textShadow: coherence > 0.85 ? "0 0 40px rgba(255,255,255,0.8)" : "none"
          }}>
            MORTALIS
          </div>
          <div className="font-mono text-xs tracking-[0.5em] text-amber-400 mt-4 opacity-70">
            {coherence > 0.85 ? "OPTICAL VANTAGE POINT LOCKED" : "DISTORTED PERSPECTIVE RIBBON"}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 pt-4 flex justify-between font-mono text-xs text-white/40">
        <div className="flex gap-4">
          <span>PITCH: {pitch}°</span>
          <span>YAW: {yaw}°</span>
        </div>
        <span>HOLBEIN 1533 ANAMORPHOSIS CODEX</span>
      </footer>
    </div>
  );
}
