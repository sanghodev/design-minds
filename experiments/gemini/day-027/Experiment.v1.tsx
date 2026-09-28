import React, { useState, useEffect, useRef } from "react";

type ReticleMode = "reticle" | "loupe" | "crosshair";

export default function CyberEditorialArchitecture() {
  const [mousePos, setMousePos] = useState({ x: 400, y: 300 });
  const [reticleMode, setReticleMode] = useState<ReticleMode>("reticle");
  const [isHoveringGlyph, setIsHoveringGlyph] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [contrastScale, setContrastScale] = useState<number>(100);
  const [fpsVal, setFpsVal] = useState<number>(120);
  const [activeArticleTab, setActiveArticleTab] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize laser-chirp micro-haptic sound
  const playLaserSound = (freq = 2400, duration = 0.025) => {
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
      osc.frequency.exponentialRampToValueAtTime(800, audioCtxRef.current.currentTime + duration);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch {
      // AudioContext not supported or allowed
    }
  };

  // Track cursor position inside container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  // Jitter-free FPS clock telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setFpsVal(119.8 + Math.sin(Date.now() / 300) * 0.4);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#060709] text-[#F7F7F8] font-sans select-none overflow-x-hidden flex flex-col justify-between cursor-none"
    >
      {/* Precision Top Datum Calibration Ruler */}
      <div className="border-b border-white/10 px-8 py-2 flex justify-between items-center font-mono text-[10px] text-white/40 tracking-widest uppercase bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF2A00] animate-pulse" />
            <strong className="text-[#FF2A00]">DAY 027 · 2026-09-28</strong>
          </span>
          <span>CALIBRATION: 1px DATUM GRID</span>
          <span>LAT: 40.7128° N</span>
          <span>LON: 74.0060° W</span>
        </div>
        <div className="flex items-center gap-6">
          <span>OPTICAL ACQUISITION: {isHoveringGlyph ? "LOCKED" : "STANDBY"}</span>
          <span>FPS: {fpsVal.toFixed(1)} Hz</span>
          <span>RETICLE: {reticleMode.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Dual-Chamber Editorial Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 flex-grow border-b border-white/10">
        
        {/* Left Chamber: Monumental Editorial Gallery (8 Columns) */}
        <section className="lg:col-span-8 p-8 md:p-16 flex flex-col justify-between border-r border-white/10 relative">
          
          {/* Top Article Masthead */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-mono text-xs text-[#00F2FF] tracking-[0.3em] uppercase">
              <span>[FOLIO // 027]</span>
              <span className="opacity-30">/</span>
              <span>CYBER-EDITORIAL ARCHITECTURE</span>
            </div>

            {/* Monumental High-Contrast Headline with Anatomical Vector Guides on Hover */}
            <div
              onMouseEnter={() => {
                setIsHoveringGlyph(true);
                playLaserSound(3200, 0.03);
              }}
              onMouseLeave={() => setIsHoveringGlyph(false)}
              className="relative py-6 group"
            >
              {/* Anatomical Baseline Guides (Shown when Reticle Intersects) */}
              {isHoveringGlyph && (
                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between py-2">
                  <div className="border-b border-[#00F2FF]/40 text-[9px] font-mono text-[#00F2FF] flex justify-between">
                    <span>CAP HEIGHT: 120pt</span>
                    <span>ASCENDER PEAK</span>
                  </div>
                  <div className="border-b border-dashed border-[#FF2A00]/40 text-[9px] font-mono text-[#FF2A00] flex justify-between">
                    <span>X-HEIGHT: 64pt</span>
                    <span>MEDIAN BOUNDARY</span>
                  </div>
                  <div className="border-b border-[#00F2FF] text-[9px] font-mono text-[#00F2FF] flex justify-between">
                    <span>BASELINE: ZERO DATUM</span>
                    <span>PRIMARY BEARING</span>
                  </div>
                </div>
              )}

              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter uppercase leading-[0.88] text-white">
                THE VOID
                <br />
                <span className="italic font-normal font-serif text-white/90">
                  OF SILENCE
                </span>
              </h1>
            </div>

            <p className="max-w-xl font-mono text-xs md:text-sm text-white/60 leading-relaxed pt-2">
              High-fashion print monumentality collides with the surgical calibration of a cybernetic telemetry console. Words cease to be passive text; they are architectural monuments anchored in negative space.
            </p>
          </div>

          {/* Editorial Excerpt & High-Contrast Typography Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 border-t border-white/10 pt-8">
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-[#FF2A00] tracking-widest uppercase font-bold">
                § 01 // THE HUMANIST STEM
              </span>
              <p className="text-sm font-serif text-white/80 leading-relaxed italic">
                “When Bodoni sculpted the hairline serif, he proved that light requires a razor-thin threshold to achieve sublime elegance. The web forgot this elegance, trading it for sterile uniform sans-serifs.”
              </p>
            </div>
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-[#00F2FF] tracking-widest uppercase font-bold">
                § 02 // THE CYBERNETIC FRAME
              </span>
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                Tabular monospace metrics provide an austere technical counterweight. Every bracket and coordinate acts as structural rebar, preventing the monumental display serif from collapsing into nostalgic decoration.
              </p>
            </div>
          </div>

          {/* Bottom Chamber Colophon */}
          <div className="flex justify-between items-center font-mono text-[11px] text-white/30 border-t border-white/10 pt-4">
            <span>TYPEFACE: DIDONE SERIF × MONOSPACE TELEMETRY</span>
            <span>KERNING METRIC: OPTICAL -0.04em</span>
          </div>
        </section>

        {/* Right Chamber: Cybernetic Telemetry Rail (4 Columns) */}
        <aside className="lg:col-span-4 p-8 flex flex-col justify-between bg-white/[0.015] space-y-8">
          
          {/* Telemetry Header */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF2A00] font-bold">
                TELEMETRY HUD
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF2A00]/20 text-[#FF2A00] border border-[#FF2A00]/40">
                ONLINE
              </span>
            </div>

            {/* Reticle Mode Selector */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">
                RETICLE INSTRUMENT MODE:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["reticle", "loupe", "crosshair"] as ReticleMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      playLaserSound(1800, 0.02);
                      setReticleMode(mode);
                    }}
                    className={`py-2 px-2 rounded font-mono text-[10px] uppercase tracking-wider border transition-all ${
                      reticleMode === mode
                        ? "bg-[#00F2FF] text-black font-bold border-[#00F2FF] shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Coordinate Gauge */}
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-white/40 text-[10px]">
                <span>VECTOR COORDINATES</span>
                <span className="text-[#00F2FF]">REAL-TIME</span>
              </div>
              <div className="text-xl font-bold tracking-tight text-white flex justify-between">
                <span>X: {mousePos.x}px</span>
                <span>Y: {mousePos.y}px</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#00F2FF] h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (mousePos.x / 1200) * 100)}%` }}
                />
              </div>
            </div>

            {/* Interactive Parametric Sliders */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-white/40">
                  <span>CONTRAST GAIN:</span>
                  <span className="text-[#FF2A00]">{contrastScale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrastScale}
                  onChange={(e) => setContrastScale(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF2A00]"
                />
              </div>

              {/* Sound Toggle Button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-full py-2 border border-white/10 rounded font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-colors"
              >
                TACTILE AUDIO CHIRP: {soundEnabled ? "ENABLED" : "MUTED"}
              </button>
            </div>
          </div>

          {/* Secondary Telemetry Feeds */}
          <div className="space-y-3 border-t border-white/10 pt-6 font-mono text-[10px] text-white/40">
            <div className="flex justify-between">
              <span>CANVAS COMPOSITOR:</span>
              <span className="text-white">HARDWARE GPU</span>
            </div>
            <div className="flex justify-between">
              <span>SACCADIC RESTING RATE:</span>
              <span className="text-white">142 ms</span>
            </div>
            <div className="flex justify-between">
              <span>NEGATIVE VOID RATIO:</span>
              <span className="text-[#00F2FF]">68.4%</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS VERIFICATION:</span>
              <span className="text-[#FF2A00]">NOMINAL</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Dynamic Hardware-Accelerated Optical Reticle Cursor */}
      <div
        className="pointer-events-none fixed z-50 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          left: 0,
          top: 0,
        }}
      >
        {reticleMode === "crosshair" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 border border-[#00F2FF]/60 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FF2A00] rounded-full" />
            </div>
            <div className="absolute top-1/2 left-full pl-2 font-mono text-[9px] text-[#00F2FF] whitespace-nowrap">
              [{mousePos.x}, {mousePos.y}]
            </div>
          </div>
        )}

        {reticleMode === "reticle" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            {/* Concentric Dual Targeting Rings */}
            <div className="w-20 h-20 border border-[#00F2FF]/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)]">
              <div className="w-14 h-14 border border-dashed border-[#FF2A00]/60 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
              </div>
            </div>
            {/* 4 Directional Laser Ticks */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#00F2FF]" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#00F2FF]" />
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-2 h-0.5 bg-[#00F2FF]" />
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-0.5 bg-[#00F2FF]" />
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 font-mono text-[9px] text-white/70 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-white/20">
              TARGET ACQUIRED
            </div>
          </div>
        )}

        {reticleMode === "loupe" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-2 border-white backdrop-invert backdrop-contrast-150 flex items-center justify-center shadow-2xl">
              <span className="font-mono text-[9px] text-black font-bold bg-white/80 px-1 rounded">
                2.0× LOUPE
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Swiss Monospaced Colophon Footer */}
      <footer className="px-8 py-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] text-white/30 bg-white/[0.01]">
        <div>
          <span>DESIGN MINDS · GEMINI (NOON MIND) ARCHIVE</span>
          <span className="mx-3 opacity-30">|</span>
          <span>VOLUME: CYBER-EDITORIAL ARCHITECTURE & OPTICAL RETICLE KINETICS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00F2FF]">STATUS: 100% MATHEMATICAL REGISTER</span>
          <span className="text-[#FF2A00]">GLOBAL AWWWARDS SPEC: VERIFIED</span>
        </div>
      </footer>
    </div>
  );
}
