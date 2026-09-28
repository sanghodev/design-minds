import React, { useState, useEffect, useRef } from "react";

type DensityMode = "compact" | "editorial" | "monolithic";
type ActiveModule = "hero" | "telemetry" | "manifesto" | "stream";

export default function AdaptiveBentoArchitecture() {
  const [density, setDensity] = useState<DensityMode>("editorial");
  const [focusedModule, setFocusedModule] = useState<ActiveModule>("hero");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [systemHz, setSystemHz] = useState<number>(120);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<"render" | "memory" | "flux">("render");
  
  // Refined Interactive Controls for Senior Art Direction
  const [showGridGuides, setShowGridGuides] = useState<boolean>(false);
  const [cornerRadius, setCornerRadius] = useState<number>(20);
  const [gutterSize, setGutterSize] = useState<number>(20);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize subtle, organic micro-haptic click feedback
  const playHapticSound = (freq = 880, duration = 0.02) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch {
      // AudioContext not permitted or supported
    }
  };

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
      setSystemHz(119.8 + Math.sin(Date.now() / 350) * 0.4);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const handleModuleClick = (mod: ActiveModule) => {
    playHapticSound(focusedModule === mod ? 440 : 1200, 0.03);
    setFocusedModule(mod);
  };

  const handleDensityChange = (d: DensityMode) => {
    playHapticSound(1760, 0.04);
    setDensity(d);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#07080B] text-[#ECECF1] p-6 md:p-12 font-sans select-none overflow-x-hidden flex flex-col justify-between"
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.04) 0%, transparent 65%)`,
      }}
    >
      {/* Visual Architectural Grid Guides (Toggleable Swiss Overlay) */}
      {showGridGuides && (
        <div className="absolute inset-0 pointer-events-none z-0 px-6 md:px-12 py-6 flex gap-x-4 md:gap-x-6 opacity-15">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 h-full border-x border-[#FF4500]/60 flex justify-center">
              <span className="font-mono text-[9px] text-[#FF4500] mt-2">C{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Swiss Architectural Masthead */}
      <header className="relative z-10 border-b border-white/10 pb-6 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] shadow-[0_0_8px_#FF4500]" />
            <span className="font-mono text-xs tracking-[0.25em] text-[#FF4500] uppercase font-bold">
              DAY 026 · 2026-09-27 · MASTER ARCHITECTURE
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-2 font-mono">
            ADAPTIVE BENTO ARCHITECTURE
          </h1>
          <p className="font-mono text-xs text-white/50 tracking-wide mt-1">
            SWISS MODULAR CALCULUS × CSS SUBGRID DYNAMICS × DENSITY HARMONICS
          </p>
        </div>

        {/* Global Toolbar: Density Modes & Studio Diagnostics */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
          {/* Pacing Modes */}
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <span className="font-mono text-[10px] text-white/40 px-2 tracking-widest uppercase">
              PACING:
            </span>
            {(["compact", "editorial", "monolithic"] as DensityMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleDensityChange(mode)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                  density === mode
                    ? "bg-white text-black font-bold shadow-md scale-105"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Swiss Grid Blueprint Toggle */}
          <button
            onClick={() => {
              playHapticSound(900, 0.02);
              setShowGridGuides(!showGridGuides);
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
              showGridGuides
                ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500] font-bold"
                : "border-white/10 text-white/50 hover:border-white/30"
            }`}
          >
            {showGridGuides ? "GRID: ON" : "GRID: OFF"}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-2.5 py-1.5 rounded-xl font-mono text-xs uppercase border border-white/10 text-white/50 hover:border-white/30"
          >
            {soundEnabled ? "SFX: ON" : "SFX: MUTED"}
          </button>
        </div>
      </header>

      {/* Main 12-Column Adaptive Bento Grid */}
      <main
        className="relative z-10 grid grid-cols-1 md:grid-cols-12 flex-grow items-stretch transition-all duration-500"
        style={{ gap: `${gutterSize}px` }}
      >
        {/* Module 1: The Monumental Hero Anchor (1.618:1 Golden Ratio Bay) */}
        <div
          onClick={() => handleModuleClick("hero")}
          className={`relative p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between group ${
            focusedModule === "hero"
              ? "md:col-span-8 bg-white/[0.04] border-[#00F0FF]/50 shadow-[0_0_35px_rgba(0,240,255,0.08)]"
              : "md:col-span-7 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
          style={{
            borderRadius: `${cornerRadius}px`,
            minHeight: density === "compact" ? "340px" : density === "editorial" ? "420px" : "480px",
          }}
        >
          {/* Subtle Chamfer Highlight Line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.03] pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#00F0FF] uppercase font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                BAY 01 · MONUMENTAL ANCHOR
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mt-1">
                Harmonic Mass & Spatial Gravity
              </h2>
            </div>
            <div className="font-mono text-xs text-white/40 border border-white/10 px-3 py-1 rounded-full bg-white/5">
              RATIO 1.618 : 1
            </div>
          </div>

          {/* Kinetic Visual Canvas (Simulated Multi-Scale Modular Waveform) */}
          <div className="my-6 space-y-4 z-10">
            <div className="flex items-end gap-1.5 h-32 w-full border-b border-white/10 pb-2">
              {[45, 60, 30, 85, 95, 70, 40, 80, 65, 90, 100, 75, 50, 88, 92, 60, 82, 98, 70, 85, 45, 65, 80, 95].map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-white/10 via-[#00F0FF]/40 to-[#00F0FF] rounded-t transition-all duration-300 group-hover:to-[#FF4500]"
                  style={{
                    height: `${val * (density === "compact" ? 0.65 : density === "editorial" ? 0.95 : 1.15)}%`,
                    opacity: 0.35 + (val / 100) * 0.65,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[11px] text-white/40">
              <span>SPECTRAL SUBGRID BUS: ACTIVE</span>
              <span>NYQUIST FREQ: 96.0 kHz</span>
              <span className="text-[#00F0FF]">STABILITY DELTA: 0.002%</span>
            </div>
          </div>

          <div className="flex justify-between items-end z-10 border-t border-white/10 pt-4 font-mono text-xs">
            <p className="text-white/60 max-w-md text-[11px] leading-relaxed">
              Müller-Brockmann proportioning system dynamically calculates whitespace tension to preserve reading cadence without visual collapse.
            </p>
            <span className="text-[#00F0FF] uppercase font-bold tracking-widest text-[10px] bg-[#00F0FF]/10 px-2.5 py-1 rounded-lg border border-[#00F0FF]/30">
              {focusedModule === "hero" ? "● FOCAL LOCK" : "CLICK TO EXPAND"}
            </span>
          </div>
        </div>

        {/* Module 2: Swiss Telemetry Gauge (1:1 Square Quadrant) */}
        <div
          onClick={() => handleModuleClick("telemetry")}
          className={`relative p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "telemetry"
              ? "md:col-span-4 bg-white/[0.04] border-[#FF4500]/50 shadow-[0_0_35px_rgba(255,69,0,0.08)]"
              : "md:col-span-5 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#FF4500] uppercase font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
              BAY 02 · PRECISION TELEMETRY
            </span>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {(["render", "memory", "flux"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHapticSound(1400, 0.02);
                    setActiveTelemetryTab(tab);
                  }}
                  className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded transition-colors ${
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
            {/* Visual Ring Progress Gauge */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00F0FF] to-[#FF4500] h-full transition-all duration-300"
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
          onClick={() => handleModuleClick("manifesto")}
          className={`relative p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "manifesto"
              ? "md:col-span-5 bg-white/[0.04] border-white/60 shadow-xl"
              : "md:col-span-4 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              BAY 03 · THE EDITORIAL PILLAR
            </span>
            <blockquote className="text-xl md:text-2xl font-serif italic text-white/90 leading-snug mt-6">
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
          onClick={() => handleModuleClick("stream")}
          className={`relative p-8 border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between ${
            focusedModule === "stream"
              ? "md:col-span-7 bg-white/[0.04] border-[#00F0FF]/50 shadow-[0_0_35px_rgba(0,240,255,0.08)]"
              : "md:col-span-8 bg-white/[0.02] border-white/10 hover:border-white/30"
          }`}
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#00F0FF] uppercase font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
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

          {/* Radius & Gutter Live Sliders for Real-time Spatial Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-white/40">
                <span>MODULE RADIUS:</span>
                <span>{cornerRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF4500]"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-white/40">
                <span>GRID GUTTER:</span>
                <span>{gutterSize}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={gutterSize}
                onChange={(e) => setGutterSize(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Swiss Monospaced Technical Colophon */}
      <footer className="relative z-10 mt-8 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[11px] text-white/40">
        <div>
          <span>DESIGN MINDS · GEMINI (NOON MIND) ARCHIVE</span>
          <span className="mx-3 opacity-30">|</span>
          <span>CURRICULUM: AVANT-GARDE VISUAL & WEB ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CURSOR: {mousePos.x}px, {mousePos.y}px</span>
          <span className="text-[#00F0FF]">SYSTEM VERDICT: AWWWARDS SITE-OF-THE-DAY CALIBER</span>
        </div>
      </footer>
    </div>
  );
}
