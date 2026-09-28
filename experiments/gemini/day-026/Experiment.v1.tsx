import React, { useState, useEffect, useRef } from "react";

type DensityMode = "compact" | "editorial" | "monolithic";
type ActiveModule = "hero" | "telemetry" | "manifesto" | "stream" | "controls";

export default function AdaptiveBentoArchitecture() {
  const [density, setDensity] = useState<DensityMode>("editorial");
  const [focusedModule, setFocusedModule] = useState<ActiveModule>("hero");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [systemHz, setSystemHz] = useState<number>(120);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<"render" | "memory" | "flux">("render");
  const containerRef = useRef<HTMLDivElement>(null);

  // Track cursor position for dynamic specular lighting on 1px borders
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Subtle clock oscillation simulation for telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemHz(prev => 119.8 + Math.sin(Date.now() / 400) * 0.4);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#07080B] text-[#ECECF1] p-6 md:p-12 font-sans select-none overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.035) 0%, transparent 60%)`,
      }}
    >
      {/* Swiss Architectural Masthead */}
      <header className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            <span className="font-mono text-xs tracking-[0.25em] text-[#FF4500] uppercase font-bold">
              DAY 026 · 2026-09-27 · NOON MIND
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-2 font-mono">
            ADAPTIVE BENTO ARCHITECTURE
          </h1>
          <p className="font-mono text-xs text-white/50 tracking-wide mt-1">
            SWISS MODULAR CALCULUS × CSS SUBGRID DYNAMICS × DENSITY HARMONICS
          </p>
        </div>

        {/* Global Density Mode Selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-xl">
          <span className="font-mono text-[10px] text-white/40 px-2 tracking-widest uppercase">
            PACING:
          </span>
          {(["compact", "editorial", "monolithic"] as DensityMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setDensity(mode)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                density === mode
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Main 12-Column Bento Grid Container */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow items-stretch transition-all duration-500">
        
        {/* Module 1: The Monumental Hero Anchor (1.618:1 Golden Bay) */}
        <div
          onClick={() => setFocusedModule("hero")}
          className={`relative rounded-3xl p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between group ${
            focusedModule === "hero"
              ? "md:col-span-8 bg-white/[0.04] border-[#00F0FF]/50 shadow-[0_0_30px_rgba(0,240,255,0.08)]"
              : "md:col-span-7 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
          style={{ minHeight: density === "compact" ? "320px" : density === "editorial" ? "420px" : "500px" }}
        >
          {/* Subtle Chamfer Highlight Line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.04] pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#00F0FF] uppercase font-bold">
                BAY 01 · MONUMENTAL ANCHOR
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                Harmonic Mass & Spatial Gravity
              </h2>
            </div>
            <div className="font-mono text-xs text-white/30 border border-white/10 px-2.5 py-1 rounded-full">
              RATIO 1.618 : 1
            </div>
          </div>

          {/* Kinetic Visual Canvas (Simulated Modular Waveform) */}
          <div className="my-6 space-y-4 z-10">
            <div className="flex items-end gap-1 h-28 w-full border-b border-white/10 pb-2">
              {[45, 60, 30, 85, 95, 70, 40, 80, 65, 90, 100, 75, 50, 88, 92, 60, 82, 98, 70, 85, 45, 65, 80, 95].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-white/10 to-[#00F0FF] rounded-t transition-all duration-300 group-hover:to-[#FF4500]"
                  style={{
                    height: `${(val * (density === "compact" ? 0.7 : 1.0))}%`,
                    opacity: 0.3 + (val / 100) * 0.7,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[11px] text-white/40">
              <span>SPECTRAL SUBGRID BUS: ACTIVE</span>
              <span>NYQUIST FREQ: 96.0 kHz</span>
              <span>STABILITY DELTA: 0.002%</span>
            </div>
          </div>

          <div className="flex justify-between items-end z-10 border-t border-white/10 pt-4 font-mono text-xs">
            <p className="text-white/60 max-w-md text-[11px] leading-relaxed">
              Müller-Brockmann proportioning system dynamically calculates whitespace tension to preserve reading cadence without visual collapse.
            </p>
            <span className="text-[#00F0FF] uppercase font-bold tracking-widest text-[10px]">
              {focusedModule === "hero" ? "● FOCAL LOCK" : "CLICK TO EXPAND"}
            </span>
          </div>
        </div>

        {/* Module 2: Swiss Telemetry Gauge (1:1 Square Quadrant) */}
        <div
          onClick={() => setFocusedModule("telemetry")}
          className={`relative rounded-3xl p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "telemetry"
              ? "md:col-span-4 bg-white/[0.04] border-[#FF4500]/50 shadow-[0_0_30px_rgba(255,69,0,0.08)]"
              : "md:col-span-5 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#FF4500] uppercase font-bold">
              BAY 02 · PRECISION TELEMETRY
            </span>
            <div className="flex gap-1">
              {(["render", "memory", "flux"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTelemetryTab(tab);
                  }}
                  className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded ${
                    activeTelemetryTab === tab
                      ? "bg-[#FF4500] text-black font-bold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Central Telemetry Metric */}
          <div className="my-auto py-4">
            <div className="font-mono text-5xl md:text-6xl font-black tracking-tighter text-[#ECECF1] flex items-baseline gap-2">
              {systemHz.toFixed(1)}
              <span className="text-sm font-normal text-white/40 tracking-widest">FPS</span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-white/50 flex justify-between">
              <span>ZERO-JITTER CLOCK</span>
              <span className="text-[#00F0FF] font-bold">99.98% HARMONIC</span>
            </div>
            {/* Visual Ring Gauge */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF4500] h-full transition-all duration-500"
                style={{ width: `${(systemHz / 120) * 100}%` }}
              />
            </div>
          </div>

          <div className="font-mono text-[10px] text-white/30 border-t border-white/10 pt-3 flex justify-between">
            <span>CONTAINER QUERY: @min-inline: 360px</span>
            <span>LATENCY: 0.8ms</span>
          </div>
        </div>

        {/* Module 3: Monolithic Editorial Manifesto Pillar (1:2 Ratio) */}
        <div
          onClick={() => setFocusedModule("manifesto")}
          className={`relative rounded-3xl p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "manifesto"
              ? "md:col-span-5 bg-white/[0.04] border-white/60"
              : "md:col-span-4 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
        >
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold">
              BAY 03 · THE EDITORIAL PILLAR
            </span>
            <blockquote className="text-xl md:text-2xl font-serif italic text-white/90 leading-snug mt-4">
              “The grid does not restrict freedom; it creates the mathematical foundation upon which genuine invention becomes legible.”
            </blockquote>
          </div>

          <div className="border-t border-white/10 pt-4 mt-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold">
              JOSEF MÜLLER-BROCKMANN
            </span>
            <p className="font-mono text-[10px] text-white/40 mt-1">
              ZÜRICH, 1961 · GESTALTUNGSPROBLEME DES GRAFIKERS
            </p>
          </div>
        </div>

        {/* Module 4: Continuous Temporal Meridian (Panoramic Horizontal Stream) */}
        <div
          onClick={() => setFocusedModule("stream")}
          className={`relative rounded-3xl p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "stream"
              ? "md:col-span-7 bg-white/[0.04] border-[#00F0FF]/50"
              : "md:col-span-8 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#00F0FF] uppercase font-bold">
              BAY 04 · TEMPORAL PANORAMA
            </span>
            <div className="font-mono text-xs text-white/30">
              SUBGRID TRACKS: 8-COL
            </div>
          </div>

          {/* Interactive Responsive Grid Cards within the module */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            {[
              { label: "CHOREOGRAPHY", value: "FLIP V3", color: "#FF4500" },
              { label: "ASPECT RATIO", value: "1 : 1.618", color: "#00F0FF" },
              { label: "SUBGRID ROWS", value: "LOCK 0px", color: "#ECECF1" },
              { label: "OPTICAL CHAMFER", value: "1px RADIAL", color: "#FF4500" },
            ].map((stat, i) => (
              <div key={i} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                <span className="font-mono text-[9px] text-white/40 block tracking-widest">{stat.label}</span>
                <span className="font-mono text-sm md:text-base font-bold text-white mt-1 block" style={{ color: stat.color }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center font-mono text-[10px] text-white/40 border-t border-white/10 pt-4">
            <span>GLOBAL CSS SUBGRID CONSTRAINTS: ZERO-DRIFT</span>
            <span className="text-white/60">AUTONOMOUS DENSITY ADAPTATION</span>
          </div>
        </div>

      </main>

      {/* Swiss Monospaced Technical Colophon */}
      <footer className="mt-8 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[11px] text-white/40">
        <div>
          <span>DESIGN MINDS · GEMINI (NOON MIND) ARCHIVE</span>
          <span className="mx-3 opacity-30">|</span>
          <span>CURRICULUM: AVANT-GARDE VISUAL & WEB ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>COORDINATES: {mousePos.x}px, {mousePos.y}px</span>
          <span className="text-[#00F0FF]">SYSTEM VERDICT: HARMONIC ZERO-DRIFT PASS</span>
        </div>
      </footer>
    </div>
  );
}
