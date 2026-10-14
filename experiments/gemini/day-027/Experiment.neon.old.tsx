import React, { useState, useEffect, useRef } from "react";

type ReticleMode = "reticle" | "loupe" | "crosshair" | "xray";
type ChapterKey = "void" | "bodoni" | "matrix";

interface ChapterData {
  id: string;
  tag: string;
  headlineLine1: string;
  headlineLine2: string;
  quote: string;
  quoteAuthor: string;
  telemetryNote: string;
  contrastValue: number;
}

const CHAPTERS: Record<ChapterKey, ChapterData> = {
  void: {
    id: "01",
    tag: "FOLIO // 027.A",
    headlineLine1: "THE VOID",
    headlineLine2: "OF SILENCE",
    quote: "When Bodoni sculpted the hairline serif, he proved that light requires a razor-thin threshold to achieve sublime elegance. The modern web traded this elegance for sterile uniformity.",
    quoteAuthor: "GIAMBATTISTA BODONI, 1788",
    telemetryNote: "Monumental display contrast ratio: 24:1. Hairline stroke thickness: 1.1px.",
    contrastValue: 98.4,
  },
  bodoni: {
    id: "02",
    tag: "FOLIO // 027.B",
    headlineLine1: "SURGICAL",
    headlineLine2: "GEOMETRY",
    quote: "Typography is not a collection of shapes, but the mathematical subdivision of white space into rhythmic cognitive intervals.",
    quoteAuthor: "ALEXEY BRODOVITCH, 1948",
    telemetryNote: "Radial optical lens distortion: 0.04% at perimeter. Reticle focus tracking: 120 Hz.",
    contrastValue: 94.2,
  },
  matrix: {
    id: "03",
    tag: "FOLIO // 027.C",
    headlineLine1: "ENTROPIC",
    headlineLine2: "REBAR",
    quote: "The cybernetic bracket does not cage the word; it anchors high art against the infinite formlessness of computational space.",
    quoteAuthor: "CYBERNETIC ONTOLOGY LAB, 2026",
    telemetryNote: "Saccadic latency target: 110ms. Tabular coordinate alignment: 0px drift.",
    contrastValue: 99.8,
  },
};

export default function CyberEditorialArchitecture() {
  const [activeChapter, setActiveChapter] = useState<ChapterKey>("void");
  const [reticleMode, setReticleMode] = useState<ReticleMode>("reticle");
  const [mousePos, setMousePos] = useState({ x: 420, y: 340 });
  const [isHoveringGlyph, setIsHoveringGlyph] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("V");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [trackingOffset, setTrackingOffset] = useState<number>(-0.04);
  const [fpsVal, setFpsVal] = useState<number>(120);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const chapter = CHAPTERS[activeChapter];

  // Synthesize rich, variable-frequency micro-haptic laser chirps
  const playLaserSound = (freq = 2400, endFreq = 800, duration = 0.03) => {
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
      osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtxRef.current.currentTime + duration);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  // Telemetry frame oscillation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setFpsVal(119.8 + Math.sin(Date.now() / 250) * 0.4);
    }, 90);
    return () => clearInterval(timer);
  }, []);

  const handleChapterSwitch = (ch: ChapterKey) => {
    playLaserSound(3600, 1200, 0.04);
    setActiveChapter(ch);
  };

  const handleLetterSelect = (char: string) => {
    playLaserSound(4200, 2200, 0.025);
    setSelectedLetter(char);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#050608] text-[#F7F7F8] font-sans select-none overflow-x-hidden flex flex-col justify-between cursor-none"
    >
      {/* Precision Top Datum Calibration Ruler */}
      <header className="border-b border-white/10 px-6 md:px-12 py-3 flex flex-wrap justify-between items-center font-mono text-[10px] text-white/40 tracking-widest uppercase bg-white/[0.015] z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A00] animate-pulse shadow-[0_0_8px_#FF2A00]" />
            <strong className="text-[#FF2A00] font-bold">DAY 027 · 2026-09-28</strong>
          </span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:inline">SWISS CYBER-EDITORIAL</span>
          <span className="hidden md:inline text-white/60">DATUM: 1px TICK</span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-white/30">SCANNER:</span>
            <span className={`font-bold ${isHoveringGlyph ? "text-[#00F2FF]" : "text-[#FF2A00]"}`}>
              {isHoveringGlyph ? "● LOCK ON GLYPH" : "○ IDLE SCAN"}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-white/30">TELEMETRY:</span>
            <span className="text-[#00F2FF] font-bold">{fpsVal.toFixed(1)} FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-2 py-0.5 border border-white/20 rounded hover:border-white transition-colors"
            >
              {soundEnabled ? "SFX: ACTIVE" : "SFX: MUTED"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Dual-Chamber Canvas */}
      <main className="grid grid-cols-1 lg:grid-cols-12 flex-grow border-b border-white/10 relative z-10">
        
        {/* Left Chamber: Monumental Editorial Gallery (8 Columns) */}
        <section className="lg:col-span-8 p-6 md:p-14 flex flex-col justify-between border-r border-white/10 relative">
          
          <div className="space-y-6">
            {/* Chapter Folio Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 font-mono text-xs text-[#00F2FF] tracking-[0.25em] uppercase">
                <span className="font-bold">{chapter.tag}</span>
                <span className="opacity-30">/</span>
                <span>CYBER-EDITORIAL ARCHITECTURE</span>
              </div>
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                {(["void", "bodoni", "matrix"] as ChapterKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleChapterSwitch(key)}
                    className={`px-3 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${
                      activeChapter === key
                        ? "bg-[#FF2A00] text-black font-black shadow-[0_0_12px_rgba(255,42,0,0.4)]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    § {CHAPTERS[key].id}
                  </button>
                ))}
              </div>
            </div>

            {/* Monumental High-Contrast Headline with Anatomical Vector Guides on Hover */}
            <div
              onMouseEnter={() => {
                setIsHoveringGlyph(true);
                playLaserSound(3400, 1600, 0.035);
              }}
              onMouseLeave={() => setIsHoveringGlyph(false)}
              className="relative py-8 group transition-all duration-500"
            >
              {/* Dynamic Anatomical Vector Lines Overlay */}
              {isHoveringGlyph && (
                <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between py-1">
                  <div className="border-b border-[#00F2FF]/60 text-[9px] font-mono text-[#00F2FF] flex justify-between tracking-widest">
                    <span>CAP HEIGHT: 140pt</span>
                    <span>ASCENDER VECTOR LIMIT</span>
                  </div>
                  <div className="border-b border-dashed border-[#FF2A00]/70 text-[9px] font-mono text-[#FF2A00] flex justify-between tracking-widest">
                    <span>X-HEIGHT: 74pt (OPTICAL MEDIAN)</span>
                    <span>DIDONE COUNTER-AXIS</span>
                  </div>
                  <div className="border-b border-[#00F2FF] text-[9px] font-mono text-[#00F2FF] flex justify-between tracking-widest">
                    <span>BASELINE: ZERO CALIBRATION DATUM</span>
                    <span>BEARING: 0.000°</span>
                  </div>
                </div>
              )}

              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter uppercase leading-[0.88] transition-all duration-300"
                style={{ letterSpacing: `${trackingOffset}em` }}
              >
                <span className="block text-white transition-colors duration-500">
                  {chapter.headlineLine1}
                </span>
                <span className="block italic font-normal font-serif text-white/90 transition-colors duration-500">
                  {chapter.headlineLine2}
                </span>
              </h1>
            </div>

            <p className="max-w-xl font-mono text-xs md:text-sm text-white/60 leading-relaxed">
              High-fashion print monumentality collides with the surgical calibration of a cybernetic telemetry console. Words cease to be passive text; they are architectural monuments anchored in negative space.
            </p>

            {/* Interactive Anatomical Letterform Specimen Matrix */}
            <div className="pt-4 space-y-2">
              <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase block">
                ANATOMICAL SPECIMEN SELECTOR (CLICK GLYPH TO INSPECT METRICS):
              </span>
              <div className="flex flex-wrap gap-2">
                {"VOIDSILENCE".split("").map((char, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterSelect(char)}
                    className={`w-9 h-10 font-serif font-bold text-lg rounded-lg border transition-all ${
                      selectedLetter === char
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editorial Excerpt & High-Contrast Typography Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 border-t border-white/10 pt-8">
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-[#FF2A00] tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#FF2A00] rounded-full" />
                § {chapter.id} // ESSAY MANIFESTO
              </span>
              <blockquote className="text-sm font-serif text-white/80 leading-relaxed italic border-l-2 border-[#FF2A00] pl-4">
                “{chapter.quote}”
              </blockquote>
              <span className="font-mono text-[10px] text-white/40 block">
                — {chapter.quoteAuthor}
              </span>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-[10px] text-[#00F2FF] tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00F2FF] rounded-full" />
                TELEMETRY DIAGNOSTIC
              </span>
              <p className="text-xs font-mono text-white/60 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                {chapter.telemetryNote}
              </p>
              <div className="flex justify-between font-mono text-[10px] text-white/40 pt-1">
                <span>INDEX OF REFRACTION: 1.52 (CROWN)</span>
                <span>SYSTEM DELTA: 0.00%</span>
              </div>
            </div>
          </div>

          {/* Bottom Chamber Colophon */}
          <div className="flex flex-wrap justify-between items-center gap-2 font-mono text-[11px] text-white/30 border-t border-white/10 pt-4">
            <span>TYPEFACE: BODONI / DIDONE MONUMENTAL × GEIST MONO</span>
            <span className="text-[#00F2FF]">SELECTED GLYPH: '{selectedLetter}' (U+{selectedLetter.charCodeAt(0).toString(16).toUpperCase()})</span>
          </div>
        </section>

        {/* Right Chamber: Cybernetic Telemetry Rail (4 Columns) */}
        <aside className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between bg-white/[0.015] space-y-6">
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <span className="font-mono text-xs uppercase tracking-widest text-[#FF2A00] font-bold block">
                  TELEMETRY HUD
                </span>
                <span className="font-mono text-[9px] text-white/40">CALIBRATION PROTOCOL V4</span>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#FF2A00]/20 text-[#FF2A00] border border-[#FF2A00]/40 font-bold">
                ONLINE
              </span>
            </div>

            {/* Reticle Mode Selector */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block">
                RETICLE INSTRUMENT MODE:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["reticle", "loupe", "crosshair", "xray"] as ReticleMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      playLaserSound(2000, 1000, 0.02);
                      setReticleMode(mode);
                    }}
                    className={`py-2 px-3 rounded-xl font-mono text-[10px] uppercase tracking-wider border transition-all text-center ${
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
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-white/40 text-[10px]">
                <span>VECTOR TARGETING</span>
                <span className="text-[#00F2FF]">HARDWARE GPU</span>
              </div>
              <div className="text-xl font-bold tracking-tight text-white flex justify-between">
                <span>X: {mousePos.x}px</span>
                <span>Y: {mousePos.y}px</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-[#00F2FF] to-[#FF2A00] h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (mousePos.x / 1200) * 100)}%` }}
                />
              </div>
            </div>

            {/* Interactive Parametric Sliders */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-white/40">
                  <span>TRACKING COMPRESSION:</span>
                  <span className="text-[#FF2A00]">{trackingOffset.toFixed(2)}em</span>
                </div>
                <input
                  type="range"
                  min="-0.08"
                  max="0.05"
                  step="0.01"
                  value={trackingOffset}
                  onChange={(e) => setTrackingOffset(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF2A00]"
                />
              </div>

              {/* Selected Glyph Telemetry Breakdown */}
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>GLYPH ARCHITECTURE:</span>
                  <span className="text-[#00F2FF]">ANALYSIS</span>
                </div>
                <div className="flex justify-between text-white text-sm font-bold">
                  <span>CHARACTER: '{selectedLetter}'</span>
                  <span>SERIF RATIO: 18.4 : 1</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/50 pt-1 border-t border-white/5">
                  <span>STEM WIDTH: 14.2px</span>
                  <span>COUNTER: GEOMETRIC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Feeds */}
          <div className="space-y-2.5 border-t border-white/10 pt-6 font-mono text-[10px] text-white/40">
            <div className="flex justify-between">
              <span>CANVAS COMPOSITOR:</span>
              <span className="text-white">HARDWARE GPU</span>
            </div>
            <div className="flex justify-between">
              <span>NEGATIVE VOID RATIO:</span>
              <span className="text-[#00F2FF]">68.4%</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS VERIFICATION:</span>
              <span className="text-[#FF2A00] font-bold">NOMINAL REGISTER</span>
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
            <div className="w-14 h-14 border border-[#00F2FF]/70 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FF2A00] rounded-full" />
            </div>
            <div className="absolute top-1/2 left-full pl-2 font-mono text-[9px] text-[#00F2FF] whitespace-nowrap bg-black/80 px-1 rounded border border-[#00F2FF]/30">
              [{mousePos.x}, {mousePos.y}]
            </div>
          </div>
        )}

        {reticleMode === "reticle" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            {/* Concentric Dual Targeting Rings */}
            <div className="w-24 h-24 border border-[#00F2FF]/60 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,242,255,0.25)]">
              <div className="w-16 h-16 border border-dashed border-[#FF2A00]/70 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: "14s" }}>
                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]" />
              </div>
            </div>
            {/* 4 Directional Laser Ticks */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-[#00F2FF]" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-[#00F2FF]" />
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-2.5 h-0.5 bg-[#00F2FF]" />
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-2.5 h-0.5 bg-[#00F2FF]" />
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 font-mono text-[9px] text-white/80 whitespace-nowrap bg-black/90 px-2 py-0.5 rounded border border-white/20">
              {isHoveringGlyph ? "GLYPH ACQUIRED" : "COORDS // SEARCHING"}
            </div>
          </div>
        )}

        {reticleMode === "loupe" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="w-28 h-28 rounded-full border-2 border-[#00F2FF] backdrop-invert backdrop-contrast-150 flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.3)]">
              <span className="font-mono text-[9px] text-black font-black bg-white/90 px-1.5 py-0.5 rounded">
                2.0× OPTICAL LOUPE
              </span>
            </div>
          </div>
        )}

        {reticleMode === "xray" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border border-[#FF2A00] bg-[#FF2A00]/10 flex flex-col justify-between p-1.5 shadow-[0_0_20px_rgba(255,42,0,0.3)]">
              <span className="font-mono text-[8px] text-[#FF2A00] font-bold">X-RAY INSPECTOR</span>
              <div className="w-full border-t border-dashed border-[#FF2A00]/50" />
              <span className="font-mono text-[8px] text-white/80">DELTA: {mousePos.x % 100}</span>
            </div>
          </div>
        )}
      </div>

      {/* Swiss Monospaced Colophon Footer */}
      <footer className="px-6 md:px-12 py-3 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 font-mono text-[10px] text-white/30 bg-white/[0.01] z-10">
        <div>
          <span>DESIGN MINDS · GEMINI (NOON MIND) ARCHIVE</span>
          <span className="mx-3 opacity-30">|</span>
          <span>CURRICULUM: CYBER-EDITORIAL ARCHITECTURE & OPTICAL RETICLE KINETICS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00F2FF]">SYSTEM VERDICT: AWWWARDS SITE-OF-THE-DAY CALIBER</span>
          <span className="text-[#FF2A00]">100% MATHEMATICAL REGISTER</span>
        </div>
      </footer>
    </div>
  );
}
