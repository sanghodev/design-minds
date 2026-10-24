"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- High-Fidelity Web Audio Physical Sound Synthesizer for Mechanical Typewriter ---
class MasterworkTypewriterAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Steel Typebar Slap onto Hard Rubber Platen & Paper (with key angle pitch variation)
  playTypebarStrike(force = 1.0, pitchMod = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. High crisp impact transient (paper fiber crush & steel type face)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime((3200 + Math.random() * 400) * pitchMod, t);
      noiseFilter.Q.setValueAtTime(3.8, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.32 * force, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.02);

      // 2. Heavy mechanical thud (rubber platen cylinder core & chassis resonance)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(185 * pitchMod, t);
      osc.frequency.exponentialRampToValueAtTime(42 * pitchMod, t + 0.038);

      oscGain.gain.setValueAtTime(0.42 * force, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.042);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    } catch {}
  }

  // Starwheel Escapement Ratchet Tick (1 pitch tooth release)
  playEscapementTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime + 0.014; // delayed right after typebar strike

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(4800, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.009);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.011);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.013);
    } catch {}
  }

  // Right Margin Warning Bell (Pure resonant brass chime at column 58)
  playMarginBell() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Primary brass bell chime: ~2093Hz (C7)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2093, t);

      gain1.gain.setValueAtTime(0.38, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.9);

      // High harmonic overtone: ~4186Hz
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(4186, t);

      gain2.gain.setValueAtTime(0.2, t);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.5);
    } catch {}
  }

  // Carriage Return Zip & Line-Feed Ratchet (Swish + Clatter + Platen Feed)
  playCarriageReturn() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Multi-tooth zip ratchet sound
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const clickTime = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(1200 + i * 85, clickTime);
          osc.frequency.exponentialRampToValueAtTime(380, clickTime + 0.008);

          gain.gain.setValueAtTime(0.16, clickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.01);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(clickTime);
          osc.stop(clickTime + 0.012);
        }, i * 26);
      }

      // Heavy terminal stop thud (carriage hitting left margin stop)
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const stopTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, stopTime);
        osc.frequency.exponentialRampToValueAtTime(28, stopTime + 0.065);

        gain.gain.setValueAtTime(0.48, stopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.075);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(stopTime);
        osc.stop(stopTime + 0.085);
      }, 280);
    } catch {}
  }

  // Platen Knob Manual Line Roll Detent Click
  playPlatenRoll() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.015);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.025);
    } catch {}
  }
}

// --- Keyboard Row Layouts for Interactive On-Screen Round Keycaps ---
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "-"]
];

// All alphabetical keys mapped to radial segment angles (-50° to +50°)
const ALL_KEYS = KEYBOARD_ROWS.flat();
const KEY_ANGLES: { [key: string]: number } = {};
ALL_KEYS.forEach((k, idx) => {
  KEY_ANGLES[k] = -48 + (idx / (ALL_KEYS.length - 1)) * 96;
});

interface TypedChar {
  char: string;
  color: "black" | "red" | "stencil";
  weight: number;
  rotation: number;
}

export default function MechanicalTypewriterBentoExperiment() {
  // --- States ---
  const [lines, setLines] = useState<TypedChar[][]>([
    [
      { char: "O", color: "red", weight: 800, rotation: -0.4 },
      { char: "L", color: "red", weight: 800, rotation: 0.3 },
      { char: "I", color: "red", weight: 800, rotation: -0.2 },
      { char: "V", color: "red", weight: 800, rotation: 0.1 },
      { char: "E", color: "red", weight: 800, rotation: -0.3 },
      { char: "T", color: "red", weight: 800, rotation: 0.4 },
      { char: "T", color: "red", weight: 800, rotation: -0.1 },
      { char: "I", color: "red", weight: 800, rotation: 0.2 },
      { char: " ", color: "black", weight: 400, rotation: 0 },
      { char: "V", color: "black", weight: 700, rotation: -0.2 },
      { char: "A", color: "black", weight: 700, rotation: 0.1 },
      { char: "L", color: "black", weight: 700, rotation: -0.3 },
      { char: "E", color: "black", weight: 700, rotation: 0.2 },
      { char: "N", color: "black", weight: 700, rotation: -0.1 },
      { char: "T", color: "black", weight: 700, rotation: 0.3 },
      { char: "I", color: "black", weight: 700, rotation: -0.2 },
      { char: "N", color: "black", weight: 700, rotation: 0.1 },
      { char: "E", color: "black", weight: 700, rotation: -0.1 },
      { char: " ", color: "black", weight: 400, rotation: 0 },
      { char: "1", color: "red", weight: 700, rotation: 0.2 },
      { char: "9", color: "red", weight: 700, rotation: -0.3 },
      { char: "6", color: "red", weight: 700, rotation: 0.1 },
      { char: "9", color: "red", weight: 700, rotation: -0.2 },
    ]
  ]);
  const [currentCol, setCurrentCol] = useState<number>(23);
  const [ribbonColor, setRibbonColor] = useState<"black" | "red" | "stencil">("black");
  const [touchPressure, setTouchPressure] = useState<number>(600); // 300 (Light), 600 (Normal), 900 (Heavy)
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [struckAngle, setStruckAngle] = useState<number>(0);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [isReturningCarriage, setIsReturningCarriage] = useState<boolean>(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(53);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [platenRotation, setPlatenRotation] = useState<number>(0);

  // Auto-Demonstration Playback State
  const [isAutoTyping, setIsAutoTyping] = useState<boolean>(false);
  const autoTypeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Engine
  const audioRef = useRef<MasterworkTypewriterAudioEngine | null>(null);

  useEffect(() => {
    audioRef.current = new MasterworkTypewriterAudioEngine();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Perform Carriage Return (Line Feed + Sweep to Column 0)
  const performCarriageReturn = useCallback(() => {
    audioRef.current?.playCarriageReturn();
    setIsReturningCarriage(true);
    setPlatenRotation((prev) => prev + 36);

    setTimeout(() => {
      setLines((prev) => {
        if (prev.length >= 7) {
          return [...prev.slice(1), []]; // scroll paper up
        }
        return [...prev, []];
      });
      setCurrentCol(0);
      setIsReturningCarriage(false);
    }, 280);
  }, []);

  // Manual Platen Roll Up/Down
  const rollPlaten = useCallback((direction: "up" | "down") => {
    audioRef.current?.playPlatenRoll();
    setPlatenRotation((prev) => prev + (direction === "up" ? 24 : -24));
    if (direction === "up") {
      setLines((prev) => [...prev, []]);
      setCurrentCol(0);
    }
  }, []);

  // Type a Character with Physics & Acoustics
  const typeCharacter = useCallback((rawChar: string) => {
    const char = rawChar.toUpperCase();
    setActiveKey(char);
    setIsStriking(true);

    const angle = KEY_ANGLES[char] !== undefined ? KEY_ANGLES[char] : 0;
    setStruckAngle(angle);

    // Audio acoustic feedback with position pitch modulation
    const forceFactor = touchPressure / 600;
    const pitchMod = 0.9 + Math.abs(angle / 100) * 0.25;
    audioRef.current?.playTypebarStrike(forceFactor, pitchMod);
    audioRef.current?.playEscapementTick();

    // Check margin bell at column 58-62
    if (currentCol === 58) {
      audioRef.current?.playMarginBell();
    }

    // Dynamic rotation jitter (±0.4 deg) for genuine mechanical lead typebar imprint
    const rotation = (Math.random() - 0.5) * 0.8;
    const typed: TypedChar = {
      char,
      color: ribbonColor,
      weight: touchPressure,
      rotation,
    };

    setLines((prev) => {
      const copy = [...prev];
      const curRow = copy[copy.length - 1] || [];
      copy[copy.length - 1] = [...curRow, typed];
      return copy;
    });

    setCurrentCol((prev) => prev + 1);
    setTotalKeystrokes((prev) => prev + 1);

    // Reset strike animation state
    setTimeout(() => {
      setIsStriking(false);
      setActiveKey(null);
    }, 95);
  }, [currentCol, ribbonColor, touchPressure]);

  // Handle Backspace (Carriage Backspace Pawl)
  const handleBackspace = useCallback(() => {
    if (currentCol > 0) {
      setLines((prev) => {
        const copy = [...prev];
        const curRow = copy[copy.length - 1] || [];
        if (curRow.length > 0) {
          copy[copy.length - 1] = curRow.slice(0, -1);
        }
        return copy;
      });
      setCurrentCol((prev) => Math.max(0, prev - 1));
      audioRef.current?.playEscapementTick();
    }
  }, [currentCol]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Enter") {
        e.preventDefault();
        performCarriageReturn();
      } else if (e.code === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.code === "Space") {
        e.preventDefault();
        typeCharacter(" ");
      } else if (e.key.length === 1) {
        e.preventDefault();
        typeCharacter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typeCharacter, performCarriageReturn, handleBackspace]);

  // Auto-Typing Demonstration Mode
  const toggleAutoTyping = useCallback(() => {
    if (isAutoTyping) {
      if (autoTypeTimerRef.current) clearInterval(autoTypeTimerRef.current);
      setIsAutoTyping(false);
      return;
    }

    const textToType = "MASSIMO VIGNELLI UNIGRID: DISCIPLINE, INTEGRITY, RESTRAINT. BEAUTY FLOWS FROM SYSTEMATIC RIGOR.";
    let charIdx = 0;
    performCarriageReturn();

    setIsAutoTyping(true);
    autoTypeTimerRef.current = setInterval(() => {
      if (charIdx < textToType.length) {
        const char = textToType[charIdx];
        typeCharacter(char);
        charIdx++;
      } else {
        if (autoTypeTimerRef.current) clearInterval(autoTypeTimerRef.current);
        setIsAutoTyping(false);
      }
    }, 110);
  }, [isAutoTyping, performCarriageReturn, typeCharacter]);

  // Preset Inserter
  const loadPreset = (type: "vignelli" | "sottsass" | "clear") => {
    if (isAutoTyping && autoTypeTimerRef.current) {
      clearInterval(autoTypeTimerRef.current);
      setIsAutoTyping(false);
    }

    if (type === "clear") {
      setLines([[]]);
      setCurrentCol(0);
      return;
    }

    performCarriageReturn();
    setTimeout(() => {
      const sampleText = type === "vignelli"
        ? "DESIGN IS ONE. IF YOU CAN DESIGN ONE THING, YOU CAN DESIGN EVERYTHING. DISCIPLINE, NOT FANTASY."
        : "VALENTINE IS RED LIKE A POPPY, UNAPOLOGETIC, BRIGHT AND WILD. AN INSTRUMENT FOR POETS AND DREAMERS.";
      
      const newChars: TypedChar[] = sampleText.split("").map((c, i) => ({
        char: c,
        color: i % 2 === 0 ? "black" : (type === "sottsass" ? "red" : "black"),
        weight: 600,
        rotation: (Math.random() - 0.5) * 0.6,
      }));

      setLines([newChars]);
      setCurrentCol(newChars.length);
      audioRef.current?.playTypebarStrike(1.2);
    }, 320);
  };

  // Kinetic carriage offset (px) for horizontal translation:
  // Each character shifts carriage by -11px, creating the physical moving platen sensation
  const carriageTranslationX = useMemo(() => {
    if (isReturningCarriage) return 0;
    return -(currentCol * 10.5);
  }, [currentCol, isReturningCarriage]);

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] text-[#e2e5eb] font-sans antialiased selection:bg-[#e63946] selection:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss-Italian Atelier Header */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b1f2c] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#e63946] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
            Day 053 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Mechanical Typewriter Platen & Escapement Carriage
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            올리베티 발렌티네(Olivetti Valentine) 강철 활자봉 타격 기구학, 바이컬러 리본 잉크 압인, 그리고 스위스 에디토리얼-메커니즘
          </p>
        </div>

        {/* Global Mechanical Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#10121a] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181d28] hover:bg-[#252d3d] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">COLUMN: </span>
            <span className={currentCol >= 58 ? "text-[#e63946] font-bold animate-pulse" : "text-[#00f0ff] font-bold"}>
              {currentCol} / 65 {currentCol >= 58 && "🔔 BELL"}
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">KEYSTROKES: </span>
            <span className="text-[#ffb703] font-bold">{totalKeystrokes}</span>
          </div>
        </div>
      </header>

      {/* Main Asymmetrical Mechanical Typewriter Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: Physical Typewriter Platen Carriage & Paper Deck (8 cols) */}
        <section className="lg:col-span-8 bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative select-none overflow-hidden">
          {/* Top Stage Bar with Margin Guide Scale */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#181b26] pb-3 mb-4 gap-2">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e63946]" />
              01 // Heavy Rubber Platen & Carriage Escapement (Olivetti Segment)
            </span>
            <div className="flex items-center gap-2">
              {/* Auto Demonstration Mode Button */}
              <button
                onClick={toggleAutoTyping}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  isAutoTyping
                    ? "bg-[#00f0ff] text-black border-[#00f0ff] animate-pulse"
                    : "bg-[#161a25] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/10"
                }`}
              >
                {isAutoTyping ? "■ STOP AUTO-TYPE" : "▶ AUTO-TYPE SHOWCASE"}
              </button>

              {/* Chrome Carriage Return Lever Button */}
              <button
                onClick={performCarriageReturn}
                className="px-3.5 py-1 rounded text-xs font-mono font-bold bg-[#e63946] text-white hover:bg-[#d62839] shadow-md shadow-[#e63946]/20 transition-all flex items-center gap-1.5 active:scale-95"
                title="Pull the carriage return lever [ENTER]"
              >
                <span>← RETURN [ENTER]</span>
              </button>
            </div>
          </div>

          {/* Precision Escapement Pitch Margin Scale Ruler */}
          <div className="w-full bg-[#12151f] border border-[#23293a] rounded-lg py-1 px-3 mb-4 flex items-center justify-between font-mono text-[10px] text-[#64748b] overflow-hidden">
            <span>MARGIN: 00</span>
            <div className="flex-1 mx-4 flex justify-between tracking-widest text-[#3d465c]">
              <span>|....|....|....|....|....|....|....|....|....|....|....|....|</span>
            </div>
            <span className={currentCol >= 58 ? "text-[#e63946] font-bold" : "text-[#8d96a5]"}>
              BELL: 58-65
            </span>
          </div>

          {/* The Physical Carriage & Rubber Platen Cylinder */}
          <div className="relative w-full h-80 bg-[#141824] border-2 border-[#262e42] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-4">
            {/* Left and Right Manual Rubber Platen Knobs */}
            <div
              onClick={() => rollPlaten("up")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-16 bg-[#1f2430] border-2 border-[#475569] rounded-l-md shadow-2xl z-30 cursor-pointer hover:border-[#00f0ff] transition-all flex items-center justify-center"
              title="Click to roll platen cylinder up"
            >
              <div
                className="w-full h-full flex flex-col justify-around py-1 px-0.5 transition-transform duration-100"
                style={{ transform: `rotate(${platenRotation}deg)` }}
              >
                <div className="h-[2px] bg-[#64748b] w-full" />
                <div className="h-[2px] bg-[#64748b] w-full" />
                <div className="h-[2px] bg-[#64748b] w-full" />
              </div>
            </div>

            <div
              onClick={() => rollPlaten("down")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-16 bg-[#1f2430] border-2 border-[#475569] rounded-r-md shadow-2xl z-30 cursor-pointer hover:border-[#00f0ff] transition-all flex items-center justify-center"
              title="Click to roll platen cylinder down"
            >
              <div
                className="w-full h-full flex flex-col justify-around py-1 px-0.5 transition-transform duration-100"
                style={{ transform: `rotate(${platenRotation}deg)` }}
              >
                <div className="h-[2px] bg-[#64748b] w-full" />
                <div className="h-[2px] bg-[#64748b] w-full" />
                <div className="h-[2px] bg-[#64748b] w-full" />
              </div>
            </div>

            {/* Heavy Rubber Platen Cylinder Visual */}
            <div className="absolute inset-x-0 h-14 bg-gradient-to-b from-[#1c202a] via-[#0b0c10] to-[#1a1e28] border-y border-[#333d52] shadow-inner flex items-center justify-between px-8 z-0 pointer-events-none">
              <div className="w-4 h-12 bg-[#2d3648] rounded-sm border border-[#485672] shadow-sm" />
              <div className="w-4 h-12 bg-[#2d3648] rounded-sm border border-[#485672] shadow-sm" />
            </div>

            {/* Horizontally Translating Paper Substrate */}
            <div
              className="relative z-10 w-full max-w-xl bg-[#f7f5ed] text-[#111317] p-6 rounded-md shadow-2xl border border-[#ded8c5] transition-transform duration-100 ease-out min-h-[220px]"
              style={{
                transform: `translateX(${carriageTranslationX}px)`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 0 40px rgba(230,225,205,0.4)",
              }}
            >
              {/* Textured Linen Paper Header */}
              <div className="border-b border-[#ded8c5] pb-2 mb-3 flex items-center justify-between font-mono text-[10px] text-[#8c826e] uppercase tracking-wider select-none">
                <span>MILAN // OLIVETTI ARCHIVE</span>
                <span>PICA PITCH 10-CPI</span>
              </div>

              {/* Typed Lines */}
              <div className="space-y-2 font-mono text-base md:text-lg leading-relaxed select-none min-h-[140px]">
                {lines.map((lineChars, lineIdx) => (
                  <div key={lineIdx} className="flex flex-wrap items-center min-h-[24px]">
                    {lineChars.map((item, charIdx) => {
                      const colorClass =
                        item.color === "red"
                          ? "text-[#d90429]"
                          : item.color === "stencil"
                          ? "text-transparent stroke-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                          : "text-[#111317]";
                      return (
                        <span
                          key={charIdx}
                          className={`inline-block transition-transform ${colorClass}`}
                          style={{
                            fontWeight: item.weight,
                            transform: `rotate(${item.rotation}deg)`,
                            textShadow:
                              item.color === "red"
                                ? "0 0 1px rgba(217, 4, 41, 0.4)"
                                : "0 0 1px rgba(17, 19, 23, 0.5)",
                          }}
                        >
                          {item.char === " " ? " " : item.char}
                        </span>
                      );
                    })}
                    {/* Blinking Mechanical Type Cursor on the Current Line */}
                    {lineIdx === lines.length - 1 && (
                      <span className="inline-block w-2 h-5 bg-[#e63946] ml-0.5 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Semicircular Radial Typebar Basket & Center V-Guide Alignment Fork */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center w-64 h-24 overflow-hidden">
              {/* Radial Typebar Segment Fan */}
              <div className="relative w-56 h-28 border-t-2 border-[#333d4e] rounded-t-full bg-gradient-to-t from-[#0e1017] to-[#1a1f2b] shadow-2xl flex items-end justify-center">
                {ALL_KEYS.map((k) => {
                  const angle = KEY_ANGLES[k];
                  const isThisKeyStriking = activeKey === k && isStriking;
                  return (
                    <div
                      key={k}
                      className="absolute bottom-0 left-1/2 origin-bottom transition-all"
                      style={{
                        height: isThisKeyStriking ? "88px" : "42px",
                        width: isThisKeyStriking ? "3px" : "1.5px",
                        backgroundColor: isThisKeyStriking ? "#f8f9fa" : "#4b5563",
                        transform: `translateX(-50%) rotate(${angle}deg) ${isThisKeyStriking ? "scaleY(1.4)" : "scaleY(1)"}`,
                        boxShadow: isThisKeyStriking ? "0 0 12px rgba(255,255,255,0.9)" : "none",
                        zIndex: isThisKeyStriking ? 30 : 10,
                      }}
                    />
                  );
                })}
              </div>

              {/* Center V-Guide Steel Fork */}
              <div className="absolute top-2 w-8 h-8 border-b-2 border-x-2 border-[#818ea7] rounded-b-lg bg-[#141822] shadow-md flex items-center justify-center z-30">
                <div className="w-1.5 h-1.5 bg-[#e63946] rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          {/* Departure Footer / Preset Buttons */}
          <div className="mt-4 pt-3 border-t border-[#181b26] flex flex-wrap items-center justify-between text-xs font-mono text-[#71717a] gap-2">
            <div className="flex items-center gap-2">
              <span>SAMPLES:</span>
              <button
                onClick={() => loadPreset("vignelli")}
                className="px-2 py-1 rounded bg-[#161a25] text-[#9ca3af] hover:text-white hover:bg-[#252c3e] transition-colors"
              >
                VIGNELLI CANON
              </button>
              <button
                onClick={() => loadPreset("sottsass")}
                className="px-2 py-1 rounded bg-[#161a25] text-[#e63946] hover:text-white hover:bg-[#e63946]/30 transition-colors"
              >
                SOTTSASS VALENTINE
              </button>
              <button
                onClick={() => loadPreset("clear")}
                className="px-2 py-1 rounded bg-[#161a25] text-[#71717a] hover:text-white transition-colors"
              >
                BLANK SHEET
              </button>
            </div>
            <span>STRIKE FORCE: {touchPressure}N · CARRIAGE STEP: 10.5mm</span>
          </div>
        </section>

        {/* Cell 2: Cockpit Controls & Variable Typography Specimen (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Top: Bicolor Ribbon & Touch Pressure Cockpit */}
          <div className="bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-6 relative shadow-2xl flex flex-col justify-between">
            <div>
              <div className="w-full flex items-center justify-between border-b border-[#181b26] pb-3 mb-4">
                <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffb703]" />
                  02 // Ribbon & Force Actuators
                </span>
                <span className="text-xs font-mono text-[#00f0ff]">
                  BICOLOR RIBBON
                </span>
              </div>

              {/* Bicolor Ribbon Selector Switch */}
              <div className="mb-5">
                <div className="text-xs font-mono text-[#8d96a5] mb-2 uppercase">INK RIBBON SELECTOR:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRibbonColor("black")}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all border ${
                      ribbonColor === "black"
                        ? "bg-[#1f2433] text-white border-[#4f5b7d] shadow-md"
                        : "bg-[#10121a] text-[#6b7280] border-[#1f2433] hover:text-white"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/40" />
                    CARBON
                  </button>
                  <button
                    onClick={() => setRibbonColor("red")}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all border ${
                      ribbonColor === "red"
                        ? "bg-[#e63946] text-white border-[#e63946] shadow-md shadow-[#e63946]/20"
                        : "bg-[#10121a] text-[#e63946]/70 border-[#1f2433] hover:text-white hover:bg-[#e63946]/20"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d90429] border border-white/40" />
                    CRIMSON
                  </button>
                  <button
                    onClick={() => setRibbonColor("stencil")}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all border ${
                      ribbonColor === "stencil"
                        ? "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60"
                        : "bg-[#10121a] text-[#6b7280] border-[#1f2433] hover:text-white"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-transparent border-2 border-white/60" />
                    STENCIL
                  </button>
                </div>
              </div>

              {/* Touch Pressure Dials (Strike Momentum) */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#8d96a5] mb-2 uppercase">
                  <span>TOUCH STRIKE PRESSURE:</span>
                  <span className="text-[#00f0ff] font-bold">{touchPressure} (wght: {touchPressure})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTouchPressure(300)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      touchPressure === 300
                        ? "bg-[#00f0ff] text-black font-bold border-[#00f0ff]"
                        : "bg-[#121520] text-[#8d96a5] border-[#222738]"
                    }`}
                  >
                    LIGHT (300)
                  </button>
                  <button
                    onClick={() => setTouchPressure(600)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      touchPressure === 600
                        ? "bg-[#00f0ff] text-black font-bold border-[#00f0ff]"
                        : "bg-[#121520] text-[#8d96a5] border-[#222738]"
                    }`}
                  >
                    NORM (600)
                  </button>
                  <button
                    onClick={() => setTouchPressure(900)}
                    className={`py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      touchPressure === 900
                        ? "bg-[#00f0ff] text-black font-bold border-[#00f0ff]"
                        : "bg-[#121520] text-[#8d96a5] border-[#222738]"
                    }`}
                  >
                    HEAVY (900)
                  </button>
                </div>
              </div>
            </div>

            {/* Escapement Diagram Indicator */}
            <div className="mt-4 pt-3 border-t border-[#181b26] flex items-center justify-between font-mono text-xs text-[#71717a]">
              <span>ESCAPEMENT: STARWHEEL</span>
              <span className="text-[#ffb703]">10-CPI PITCH</span>
            </div>
          </div>

          {/* Bottom: Swiss Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181b26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
                03 // Kinetic Typebar Specimen
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {touchPressure} · angle: {struckAngle.toFixed(1)}°
              </span>
            </div>

            {/* Kinetic Variable Typography Specimen */}
            <div className="py-4 relative min-h-[110px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: touchPressure,
                  color: ribbonColor === "red" ? "#e63946" : "#f8f9fa",
                  textShadow: isStriking ? "0 0 25px rgba(230, 57, 70, 0.6)" : "none",
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ffb703] mb-1.5 uppercase font-semibold">
                  Mechanical Ink Pressure Kinematics
                </div>
                <h2 className="text-2xl md:text-3xl leading-tight tracking-tight">
                  단어 하나마다 손끝의 온기를 새기다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2 max-w-sm mx-auto leading-relaxed">
                  강철 활자봉이 붉은 잉크 리본을 뚫고 리넨 종이를 때릴 때, 활자는 물리적 타격의 힘에 공명하여 깊고 선명한 울림을 남깁니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex items-center justify-between font-mono text-xs text-[#788599]">
              <div>
                <span>TYPOGRAPHY: </span>
                <span className="text-[#f8f9fa] font-bold">Monospace Mechanical</span>
              </div>
              <div>
                <span>LAST KEY: </span>
                <span className="text-[#e63946] font-bold">{activeKey || "IDLE"}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile On-Screen Mechanical Round Keycaps Console */}
      <footer className="w-full max-w-7xl mt-6 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 select-none">
        <div className="text-center font-mono text-xs text-[#64748b] tracking-widest uppercase">
          TACTILE ROUND KEYCAPS · EMBODIED PHYSICAL INPUT
        </div>

        {/* 3 Main Alphabet Rows */}
        <div className="flex flex-col items-center gap-2 w-full">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1.5 sm:gap-2">
              {row.map((char) => {
                const isPressed = activeKey === char;
                return (
                  <button
                    key={char}
                    onClick={() => typeCharacter(char)}
                    className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all border shadow-lg ${
                      isPressed
                        ? "bg-[#e63946] text-white border-white scale-90 shadow-none translate-y-1"
                        : "bg-gradient-to-b from-[#242b3b] to-[#121620] text-[#e2e8f0] border-[#3e485e] hover:border-[#00f0ff] active:scale-90"
                    }`}
                    style={{
                      boxShadow: isPressed
                        ? "inset 0 2px 4px rgba(0,0,0,0.8)"
                        : "0 3px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)",
                    }}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Spacebar & Carriage Return Row */}
          <div className="flex items-center gap-2 mt-1 w-full max-w-md justify-center">
            <button
              onClick={handleBackspace}
              className="px-4 py-2 rounded-full font-mono text-xs font-bold bg-[#1a1e2a] border border-[#343e54] text-[#9ca3af] hover:text-white active:scale-95 transition-all shadow-md"
            >
              ⌫ BACK
            </button>
            <button
              onClick={() => typeCharacter(" ")}
              className="flex-1 py-2.5 rounded-full font-mono text-xs font-bold tracking-widest uppercase bg-gradient-to-b from-[#242b3b] to-[#121620] border border-[#3e485e] text-[#e2e8f0] hover:border-[#00f0ff] active:scale-95 transition-all shadow-md text-center"
            >
              SPACEBAR
            </button>
            <button
              onClick={performCarriageReturn}
              className="px-4 py-2 rounded-full font-mono text-xs font-bold bg-[#e63946] text-white hover:bg-[#d62839] active:scale-95 transition-all shadow-md shadow-[#e63946]/20"
            >
              ↵ RETURN
            </button>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="text-center font-mono text-[11px] text-[#6b7280]">
          PHYSICAL KEYBOARD ACTIVE: Press any key to strike typebar · [ENTER] for Carriage Return · [BACKSPACE] to step back
        </div>
      </footer>
    </div>
  );
}
