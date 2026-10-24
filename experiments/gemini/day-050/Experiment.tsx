"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Slide Rule Architecture Modes ---
type RuleMode = "MANNHEIM_LINEAR" | "CIRCULAR_E6B";

// --- Calculation Presets ---
interface CalculationPreset {
  id: string;
  name: string;
  ko: string;
  factor1: number; // on D scale
  factor2: number; // on C scale
  desc: string;
}

const PRESETS: CalculationPreset[] = [
  {
    id: "apollo",
    name: "Apollo 11 Orbital Escape",
    ko: "아폴로 11호 달 궤도 탈출 속도",
    factor1: 2.8,
    factor2: 3.6,
    desc: "2.8 × 3.6 = 10.08 km/s (Lunar Orbit Injection Calculation)",
  },
  {
    id: "golden_ratio",
    name: "Golden Ratio Dimension (φ)",
    ko: "황금비 조형 비례 산출",
    factor1: 1.618,
    factor2: 2.5,
    desc: "1.618 × 2.5 = 4.045 (Architectural Golden Section)",
  },
  {
    id: "square_power",
    name: "Square Power (D to A Scale)",
    ko: "제곱 및 제곱근 연산 (A척-D척)",
    factor1: 3.0,
    factor2: 3.0,
    desc: "3.0² = 9.0 (Direct Logarithmic Square Mapping)",
  },
  {
    id: "reciprocal",
    name: "Harmonic Reciprocal (CI Scale)",
    ko: "조화 역수 연산 (CI척)",
    factor1: 2.0,
    factor2: 0.5,
    desc: "1 / 2.0 = 0.5 (Direct Inverted Crimson Scale Alignment)",
  },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MasterworkSlideRuleAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Viscous tongue-and-groove slide friction glide sound
  playSlideFriction(velocity: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1150 + Math.min(850, velocity * 15), t);
      filter.Q.setValueAtTime(4.2, t);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(280 + Math.min(220, velocity * 5), t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.038);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.042);
    } catch {}
  }

  // Precision hairline magnetic detent click
  playHairlineSnap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(3400, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.012);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.022);
    } catch {}
  }

  // Clear optical runner glass tap
  playGlassTap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2500, t);
      osc.frequency.exponentialRampToValueAtTime(1250, t + 0.03);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.042);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.048);
    } catch {}
  }

  // Circular bezel ratchet click
  playBezelClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(4200, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.008);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.015);
    } catch {}
  }
}

export default function MasterworkLogarithmicSlideRuleBento() {
  // --- States ---
  const [ruleMode, setRuleMode] = useState<RuleMode>("MANNHEIM_LINEAR");
  const [slideOffset, setSlideOffset] = useState<number>(0); // px offset of moving tongue
  const [cursorX, setCursorX] = useState<number>(240); // px position of optical runner
  const [bezelAngle, setBezelAngle] = useState<number>(45); // degrees for circular mode
  const [activePreset, setActivePreset] = useState<string>("apollo");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingSlide, setIsDraggingSlide] = useState<boolean>(false);
  const [isDraggingCursor, setIsDraggingCursor] = useState<boolean>(false);
  const [isDraggingBezel, setIsDraggingBezel] = useState<boolean>(false);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  // Audio Engine & Refs
  const audioRef = useRef<MasterworkSlideRuleAudio | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bezelRef = useRef<HTMLDivElement | null>(null);
  const lastSnapValRef = useRef<number>(0);

  // Rule Geometry Constants
  const RULE_WIDTH = 640; // px baseline scale width

  useEffect(() => {
    audioRef.current = new MasterworkSlideRuleAudio();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Convert linear pixel X to logarithmic scale value [1.0, 10.0]
  const pxToLogVal = useCallback((px: number, width: number): number => {
    const clamped = Math.max(0, Math.min(width, px));
    const normalized = clamped / width;
    return Math.pow(10, normalized);
  }, []);

  // Convert logarithmic scale value [1.0, 10.0] to linear pixel X
  const logValToPx = useCallback((val: number, width: number): number => {
    const clamped = Math.max(1.0, Math.min(10.0, val));
    return width * Math.log10(clamped);
  }, []);

  // Calculated Values at Cursor Hairline
  const dVal = useMemo(() => {
    const val = pxToLogVal(cursorX, RULE_WIDTH);
    return Math.round(val * 100) / 100;
  }, [cursorX, pxToLogVal]);

  const cVal = useMemo(() => {
    const relX = cursorX - slideOffset;
    if (relX < 0 || relX > RULE_WIDTH) return null;
    const val = pxToLogVal(relX, RULE_WIDTH);
    return Math.round(val * 100) / 100;
  }, [cursorX, slideOffset, pxToLogVal]);

  const ciVal = useMemo(() => {
    if (!cVal) return null;
    return Math.round((10 / cVal) * 100) / 100;
  }, [cVal]);

  const aVal = useMemo(() => {
    return Math.round(dVal * dVal * 10) / 10;
  }, [dVal]);

  const kVal = useMemo(() => {
    return Math.round(dVal * dVal * dVal * 10) / 10;
  }, [dVal]);

  const calculatedProduct = useMemo(() => {
    if (cVal === null) return dVal;
    return Math.round(dVal * cVal * 10) / 10;
  }, [dVal, cVal]);

  // Proximity Hairline Magnetic Snap
  useEffect(() => {
    const majorValues = [1.0, 2.0, 3.0, 3.1415, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
    const nearest = majorValues.find((v) => Math.abs(dVal - v) < 0.05);
    if (nearest && nearest !== lastSnapValRef.current) {
      audioRef.current?.playHairlineSnap();
      lastSnapValRef.current = nearest;
    }
  }, [dVal]);

  // Dynamic Variable Typography based on calculated magnitude
  const dynamicTypography = useMemo(() => {
    const factor = Math.min(1.0, Math.max(0.0, (calculatedProduct - 1) / 50));
    const wght = Math.round(250 + factor * 600);
    const wdth = Math.round(75 + factor * 50);
    return { wght, wdth };
  }, [calculatedProduct]);

  // --- Pointer Dragging Handlers ---
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialOffset: number; initialCursor: number; initialAngle: number } | null>(null);

  // Drag Central Slide (Tongue)
  const handleSlidePointerDown = (e: React.PointerEvent) => {
    setIsDraggingSlide(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffset: slideOffset,
      initialCursor: cursorX,
      initialAngle: bezelAngle,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSlidePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSlide || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const nextOffset = Math.max(-220, Math.min(220, dragStartRef.current.initialOffset + dx));

    const vel = Math.abs(nextOffset - slideOffset);
    if (vel > 2) {
      audioRef.current?.playSlideFriction(vel);
    }
    setSlideOffset(nextOffset);
  };

  const handleSlidePointerUp = (e: React.PointerEvent) => {
    if (isDraggingSlide) {
      setIsDraggingSlide(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Drag Optical Runner Cursor
  const handleCursorPointerDown = (e: React.PointerEvent) => {
    setIsDraggingCursor(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffset: slideOffset,
      initialCursor: cursorX,
      initialAngle: bezelAngle,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    audioRef.current?.playGlassTap();
  };

  const handleCursorPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCursor || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const nextCursor = Math.max(10, Math.min(RULE_WIDTH - 10, dragStartRef.current.initialCursor + dx));

    const vel = Math.abs(nextCursor - cursorX);
    if (vel > 1.5) {
      audioRef.current?.playSlideFriction(vel);
    }
    setCursorX(nextCursor);
  };

  const handleCursorPointerUp = (e: React.PointerEvent) => {
    if (isDraggingCursor) {
      setIsDraggingCursor(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Drag Circular Slide Rule Bezel
  const handleBezelPointerDown = (e: React.PointerEvent) => {
    setIsDraggingBezel(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialOffset: slideOffset,
      initialCursor: cursorX,
      initialAngle: bezelAngle,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBezelPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBezel || !bezelRef.current) return;
    const rect = bezelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;

    const delta = Math.abs(deg - bezelAngle);
    if (delta > 3) {
      audioRef.current?.playBezelClick();
    }
    setBezelAngle(deg);
  };

  const handleBezelPointerUp = (e: React.PointerEvent) => {
    if (isDraggingBezel) {
      setIsDraggingBezel(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Apply Calculation Preset
  const applyPreset = (preset: CalculationPreset) => {
    setActivePreset(preset.id);
    audioRef.current?.playGlassTap();

    const targetSlide = logValToPx(preset.factor1, RULE_WIDTH);
    const targetCursor = Math.min(RULE_WIDTH - 10, targetSlide + logValToPx(preset.factor2, RULE_WIDTH));

    setSlideOffset(targetSlide);
    setCursorX(targetCursor);
  };

  const toggleRuleMode = () => {
    audioRef.current?.playGlassTap();
    setRuleMode((prev) => (prev === "MANNHEIM_LINEAR" ? "CIRCULAR_E6B" : "MANNHEIM_LINEAR"));
  };

  // Keyboard Navigation Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        const targetVal = Math.round(dVal);
        const snappedPx = logValToPx(targetVal, RULE_WIDTH);
        setCursorX(snappedPx);
        audioRef.current?.playHairlineSnap();
      } else if (e.code === "KeyC") {
        e.preventDefault();
        setKeyHint("C");
        toggleRuleMode();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setKeyHint("LEFT");
        setCursorX((prev) => Math.max(10, prev - 2));
        audioRef.current?.playSlideFriction(3);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setKeyHint("RIGHT");
        setCursorX((prev) => Math.min(RULE_WIDTH - 10, prev + 2));
        audioRef.current?.playSlideFriction(3);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setKeyHint("UP");
        setSlideOffset((prev) => Math.min(220, prev + 4));
        audioRef.current?.playSlideFriction(5);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setKeyHint("DOWN");
        setSlideOffset((prev) => Math.max(-220, prev - 4));
        audioRef.current?.playSlideFriction(5);
      } else if (e.key === "1") {
        applyPreset(PRESETS[0]);
      } else if (e.key === "2") {
        applyPreset(PRESETS[1]);
      } else if (e.key === "3") {
        applyPreset(PRESETS[2]);
      } else if (e.key === "4") {
        applyPreset(PRESETS[3]);
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };

    const handleKeyUp = () => setKeyHint(null);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dVal, logValToPx, RULE_WIDTH]);

  // Logarithmic Scale Marks Generator Helper
  const renderLogScaleMarks = (width: number, isCrimson = false, isSquare = false) => {
    const marks = [];
    const maxVal = isSquare ? 100 : 10;
    const majorSteps = isSquare
      ? [1, 2, 4, 9, 16, 25, 36, 49, 64, 81, 100]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (let v = 1; v <= maxVal; v += isSquare ? 5 : 0.2) {
      const px = width * (Math.log10(v) / Math.log10(maxVal));
      const isMajor = majorSteps.some((m) => Math.abs(m - v) < (isSquare ? 1.0 : 0.05));
      marks.push(
        <div
          key={v}
          className={`absolute bottom-0 w-px ${
            isMajor
              ? isCrimson
                ? "h-4 bg-[#dc2626] font-bold"
                : "h-4 bg-[#0f1117] font-bold"
              : "h-2 bg-[#94a3b8]"
          }`}
          style={{ left: `${px}px` }}
        >
          {isMajor && (
            <span
              className={`absolute -top-3.5 -translate-x-1/2 text-[9px] font-mono select-none ${
                isCrimson ? "text-[#dc2626] font-extrabold" : "text-[#0f1117] font-bold"
              }`}
            >
              {Math.round(v)}
            </span>
          )}
        </div>
      );
    }
    return marks;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c12] text-[#e2e5eb] font-sans antialiased selection:bg-[#ef4444] selection:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss Header Console (Braun ET55 / Wim Crouwel Lineage) */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b202c] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#ef4444] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            Day 050 Milestone · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Logarithmic Slide Rule & Optical Hairline Cursor Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            만하임(Mannheim) 정밀 계산척, 네이피어 로그 눈금 연산($C 	imes D$), 2배 광학 돋보기 루페, 그리고 스위스 정밀-에디토리얼 건축
          </p>
        </div>

        {/* Global Mechanical & Mathematical Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#11141c] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181d28] hover:bg-[#252d3d] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">MODE: </span>
            <span className="text-[#ff6b35] font-bold">
              {ruleMode === "MANNHEIM_LINEAR" ? "MANNHEIM LINEAR" : "CIRCULAR E6B"}
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">D BASELINE: </span>
            <span className="text-[#00f0ff] font-bold">{dVal}</span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">PRODUCT: </span>
            <span className="text-[#ef4444] font-bold">{calculatedProduct}</span>
          </div>
        </div>
      </header>

      {/* Historical Calculation Preset Selector Rail */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        {PRESETS.map((p) => {
          const isSelected = p.id === activePreset;
          return (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#161a25] border-[#ef4444] shadow-lg shadow-[#ef4444]/10"
                  : "bg-[#0b0d13] border-[#1d222e] hover:border-[#2d3444] hover:bg-[#10131a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#94a3b8] truncate">{p.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-[#ef4444] text-white font-bold" : "text-[#64748b]"}`}>
                  PRESET
                </span>
              </div>
              <div className="text-xs font-bold text-[#f8f9fa] mt-1">{p.ko}</div>
              <div className="text-[11px] text-[#71717a] mt-0.5 font-mono truncate">{p.desc}</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Precision Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: Mannheim Precision Slide Rule Deck (8 cols) */}
        <section
          ref={containerRef}
          className="lg:col-span-8 bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none"
        >
          <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              01 // {ruleMode === "MANNHEIM_LINEAR" ? "Mannheim 10" Precision Slide Rule (Faber-Castell 2/83N)" : "E6B Circular Flight Computer (Navitimer Bezel)"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRuleMode}
                className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1d2332] text-[#00f0ff] hover:bg-[#283247] border border-[#00f0ff]/30 transition-all"
              >
                SWITCH TO {ruleMode === "MANNHEIM_LINEAR" ? "CIRCULAR E6B [C]" : "MANNHEIM LINEAR [C]"}
              </button>
            </div>
          </div>

          {/* Slide Rule Chassis Viewport */}
          {ruleMode === "MANNHEIM_LINEAR" ? (
            <div className="relative py-8 flex items-center justify-center overflow-hidden">
              <div className="relative w-[640px] bg-[#f4f1ea] rounded-xl border-4 border-[#333d4e] shadow-2xl overflow-hidden text-black font-mono">
                {/* Top Stock: A Scale (Square 1-100) */}
                <div className="h-12 border-b-2 border-[#cbd5e1] px-4 relative flex items-center bg-[#f4f1ea]">
                  <span className="absolute left-1.5 top-1.5 text-[10px] font-extrabold text-[#64748b]">A</span>
                  <div className="relative w-full h-8">
                    {renderLogScaleMarks(590, false, true)}
                  </div>
                </div>

                {/* Central Moving Slide (Tongue: B, CI, C Scales) */}
                <div
                  onPointerDown={handleSlidePointerDown}
                  onPointerMove={handleSlidePointerMove}
                  onPointerUp={handleSlidePointerUp}
                  className="h-24 border-b-2 border-[#cbd5e1] px-4 relative flex flex-col justify-between bg-[#fffefb] cursor-grab active:cursor-grabbing touch-none transition-transform duration-75 shadow-md"
                  style={{ transform: `translateX(${slideOffset}px)` }}
                >
                  <div className="relative w-full h-7">
                    <span className="absolute -left-2.5 top-0 text-[10px] font-extrabold text-[#64748b]">B</span>
                    {renderLogScaleMarks(590, false, true)}
                  </div>

                  <div className="relative w-full h-7 border-t border-dashed border-[#e2e8f0]">
                    <span className="absolute -left-2.5 top-0 text-[10px] font-extrabold text-[#dc2626]">CI</span>
                    {renderLogScaleMarks(590, true, false)}
                  </div>

                  <div className="relative w-full h-7 border-t border-[#cbd5e1]">
                    <span className="absolute -left-2.5 top-0 text-[10px] font-extrabold text-[#0f1117]">C</span>
                    {renderLogScaleMarks(590, false, false)}
                  </div>
                </div>

                {/* Bottom Stock: D Scale (Primary Baseline 1-10) */}
                <div className="h-12 px-4 relative flex items-center bg-[#f4f1ea]">
                  <span className="absolute left-1.5 top-1.5 text-[10px] font-extrabold text-[#0f1117]">D</span>
                  <div className="relative w-full h-8">
                    {renderLogScaleMarks(590, false, false)}
                  </div>
                </div>

                {/* Draggable Optical Runner Cursor with Ultra-Fine Red Hairline */}
                <div
                  onPointerDown={handleCursorPointerDown}
                  onPointerMove={handleCursorPointerMove}
                  onPointerUp={handleCursorPointerUp}
                  className="absolute top-0 bottom-0 w-16 bg-white/20 backdrop-blur-[2px] border-2 border-[#ef4444]/60 rounded-md cursor-ew-resize shadow-2xl z-30 transition-transform duration-75 touch-none flex items-center justify-center"
                  style={{ transform: `translateX(${cursorX - 32}px)` }}
                >
                  <div className="w-[1.5px] h-full bg-[#ef4444] shadow-md shadow-[#ef4444]" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ef4444]" />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ef4444]" />
                </div>
              </div>
            </div>
          ) : (
            /* Circular Slide Rule Mode (E6B / Navitimer Mode) */
            <div className="relative py-6 flex items-center justify-center select-none">
              <div
                ref={bezelRef}
                onPointerDown={handleBezelPointerDown}
                onPointerMove={handleBezelPointerMove}
                onPointerUp={handleBezelPointerUp}
                className="w-[300px] h-[300px] rounded-full bg-[#0d1017] border-4 border-[#333d4e] flex items-center justify-center relative shadow-2xl cursor-grab active:cursor-grabbing touch-none"
              >
                {/* Rotatable Outer Logarithmic Bezel */}
                <div
                  className="absolute inset-2 rounded-full border-2 border-dashed border-[#ffb703]/60 transition-transform duration-75"
                  style={{ transform: `rotate(${bezelAngle}deg)` }}
                >
                  {Array.from({ length: 36 }).map((_, i) => {
                    const deg = i * 10;
                    return (
                      <div
                        key={deg}
                        className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-[146px] pointer-events-none"
                        style={{ transform: `rotate(${deg}deg)` }}
                      >
                        <div className={`w-0.5 ${i % 3 === 0 ? "h-3 bg-[#ffb703]" : "h-1.5 bg-[#4b5563]"}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Inner Stationary Bezel */}
                <div className="w-[190px] h-[190px] rounded-full bg-[#f4f1ea] border-2 border-[#1e2430] flex flex-col items-center justify-center text-black font-mono shadow-inner relative">
                  <div className="text-[10px] text-[#64748b] font-bold">CIRCULAR E6B</div>
                  <div className="text-2xl font-extrabold text-[#ef4444] mt-0.5">{(bezelAngle / 36).toFixed(2)}x</div>
                  <div className="text-[9px] text-[#475569] mt-0.5 font-bold">NAVITIMER RATIO</div>
                  <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#ef4444]" />
                </div>
              </div>
            </div>
          )}

          {/* Optical Magnifying Loupe Viewport (2x Zoom Callout) */}
          <div className="mt-2 bg-[#07090e] border border-[#1e2330] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-pulse" />
              <span className="text-[#94a3b8]">2X OPTICAL LOUPE CALLOUT:</span>
              <span className="text-[#f8f9fa] font-bold">D: {dVal} | C: {cVal ?? "—"}</span>
            </div>
            <div className="text-[#ffb703]">
              HAIRLINE DEV: {((dVal - Math.round(dVal)) * 10).toFixed(2)} mm
            </div>
          </div>

          {/* Slide Rule Controls & Guidance */}
          <div className="mt-4 pt-4 border-t border-[#181c26] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#788599]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>DRAG WHITE SLIDE TONGUE OR RED HAIRLINE CURSOR</span>
            </div>
            <button
              onClick={() => {
                setSlideOffset(0);
                setCursorX(240);
                setBezelAngle(45);
                audioRef.current?.playGlassTap();
              }}
              className="text-[#00f0ff] hover:underline"
            >
              [RESET ZERO ALIGNMENT]
            </button>
          </div>
        </section>

        {/* Cell 2 & 3: Mathematical Telemetry & Kinetic Editorial Stage (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Top: Mathematical Telemetry Card */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                02 // Optical Hairline Telemetry
              </span>
              <span className="text-xs font-mono text-[#ef4444]">
                log(a·b) = log a + log b
              </span>
            </div>

            {/* Scale Value Metrics */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="bg-[#07080a] border border-[#1f2430] p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-[#64748b]">D BASELINE (x₁):</span>
                <span className="text-base font-bold text-[#f8f9fa]">{dVal}</span>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-[#64748b]">C MULTIPLIER (x₂):</span>
                <span className="text-base font-bold text-[#ffb703]">{cVal ?? "OUT OF RANGE"}</span>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-[#64748b]">A SQUARE SCALE:</span>
                <span className="text-base font-bold text-[#00f0ff]">{aVal}</span>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-[#64748b]">K CUBIC SCALE:</span>
                <span className="text-base font-bold text-[#10b981]">{kVal}</span>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-[#dc2626]">CI INVERSE (1/x):</span>
                <span className="text-base font-bold text-[#dc2626]">{ciVal ?? "OFF"}</span>
              </div>
            </div>
          </div>

          {/* Bottom: Swiss Precision-Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ef4444] rounded-full" />
                03 // Wim Crouwel Logarithmic Grid
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicTypography.wght} · wdth: {dynamicTypography.wdth}
              </span>
            </div>

            {/* Kinetic Variable Typography Specimen */}
            <div className="py-4 relative min-h-[130px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: dynamicTypography.wght,
                  color: "#f8f9fa",
                  textShadow: `0 0 20px rgba(239, 68, 68, ${calculatedProduct / 60})`,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ef4444] mb-1.5 uppercase font-semibold">
                  Scale Multiplication: {calculatedProduct}
                </div>
                <h2 className="text-2xl md:text-3xl leading-tight text-[#f8f9fa] tracking-tight">
                  공간의 길이를 더하여 우주를 계산하다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2 max-w-sm mx-auto leading-relaxed">
                  존 네이피어의 로그 척도 위에서 두 눈금이 맞물릴 때, 활자는 계산된 크기에 비례하여 굵기와 자폭을 장엄하게 팽창시킵니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex items-center justify-between font-mono text-xs text-[#788599]">
              <div>
                <span>GRID: </span>
                <span className="text-[#f8f9fa] font-bold">Wim Crouwel (1967)</span>
              </div>
              <div>
                <span>MAGNITUDE: </span>
                <span className="text-[#ef4444] font-bold">{calculatedProduct}x</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Calculation Summary */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="px-5 py-3 rounded-xl bg-[#141822] border border-[#232b3a] font-mono text-xs flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="font-bold text-[#f8f9fa]">FORMULA:</span>
            <span className="text-[#00f0ff]">{dVal}</span>
            <span>×</span>
            <span className="text-[#ffb703]">{cVal ?? "1.0"}</span>
            <span>=</span>
            <span className="text-[#ef4444] font-bold text-sm">{calculatedProduct}</span>
          </div>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL SHORTCUTS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#ef4444] font-bold" : ""}>[SPACE] Snap Integer Node</span>
            <span>·</span>
            <span className={keyHint === "C" ? "text-[#00f0ff] font-bold" : ""}>[C] Mannheim/Circular</span>
            <span>·</span>
            <span className={keyHint === "LEFT" || keyHint === "RIGHT" ? "text-white font-bold" : ""}>[←/→] Nudge Cursor</span>
            <span>·</span>
            <span className={keyHint === "UP" || keyHint === "DOWN" ? "text-white font-bold" : ""}>[↑/↓] Nudge Slide</span>
            <span>·</span>
            <span>[1/2/3/4] Presets</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              applyPreset(PRESETS[0]);
            }}
            className="px-5 py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border bg-[#151924] text-[#8d96a5] border-[#273042] hover:text-white hover:border-[#ef4444]"
          >
            <span>APOLLO 11 PRESET [1]</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
