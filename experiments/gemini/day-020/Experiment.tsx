import React, { useState, useMemo, useEffect, useRef } from "react";

// --- Mathematical Helpers for Subterranean Wave Mechanics ---
interface WaveNode {
  x: number;
  y: number;
  pressure: number;
  phase: number;
}

export default function SubterraneanHypogeumExperiment() {
  // Navigation & Interactive Mode
  const [activeTier, setActiveTier] = useState<"upper" | "oracle" | "holy">("oracle");
  const [activeMode, setActiveMode] = useState<"resonance" | "reverberation" | "epigraphy" | "section3d">("resonance");

  // Acoustic Frequency Controls
  const [frequency, setFrequency] = useState<number>(110.4); // 80.0 to 140.0 Hz
  const [isImpulseActive, setIsImpulseActive] = useState<boolean>(false);
  const [impulseDecay, setImpulseDecay] = useState<number>(0);
  const [showSpirals, setShowSpirals] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Web Audio Context Reference (Synthesizer for pure 110Hz tone)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize Web Audio on user toggle
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Low volume for gentle hum
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
        setSoundEnabled(true);
      } catch (err) {
        console.warn("Web Audio not supported or blocked", err);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setSoundEnabled(false);
    }
  };

  // Update oscillator frequency in real-time
  useEffect(() => {
    if (soundEnabled && oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
    }
  }, [frequency, soundEnabled]);

  // Resonance Telemetry Calculations
  const { resonanceGain, deltaF, isResonant, standingWaveAmplitude, fontWeight, eegAsymmetry, rt60 } = useMemo(() => {
    const targetF = 110.4;
    const df = Math.abs(frequency - targetF);
    
    // Quality factor Q = 14.2
    const Q = 14.2;
    const bandwidth = targetF / Q; // ~7.8 Hz
    const normalizedDelta = df / (bandwidth / 2);
    const gainFactor = 1.0 / (1.0 + normalizedDelta * normalizedDelta); // 0 to 1

    const gainDb = (gainFactor * 18.4).toFixed(1);
    const resonant = df < 1.8;
    const waveAmp = (gainFactor * 100).toFixed(0);

    // Font weight coupling (Hairline 200 off resonance -> Ultra Black 900 at 110.4Hz)
    const weight = Math.round(250 + gainFactor * 650);

    // EEG Frontal Asymmetry Shift (Drops logic, rises theta contemplation)
    const eegShift = (-0.12 - gainFactor * 0.38).toFixed(2);

    // RT60 (Oracle Chamber base 3.84s)
    const tierRt60 = activeTier === "upper" ? "0.85s" : activeTier === "oracle" ? "3.84s" : "4.92s";

    return {
      resonanceGain: gainDb,
      deltaF: df.toFixed(1),
      isResonant: resonant,
      standingWaveAmplitude: waveAmp,
      fontWeight: weight,
      eegAsymmetry: eegShift,
      rt60: tierRt60
    };
  }, [frequency, activeTier]);

  // Impulse Response Trigger (Clap / Chant)
  const triggerImpulse = () => {
    setIsImpulseActive(true);
    setImpulseDecay(1.0);
    const startTime = performance.now();
    const duration = 3840; // 3.84s RT60

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = elapsed / duration;
      if (progress < 1.0) {
        setImpulseDecay(Math.exp(-progress * 4.5));
        requestAnimationFrame(step);
      } else {
        setImpulseDecay(0);
        setIsImpulseActive(false);
      }
    };
    requestAnimationFrame(step);
  };

  // Precomputed 2D Acoustic Wave Pressure Field (Oracle Chamber Grid)
  const waveNodes: WaveNode[] = useMemo(() => {
    const nodes: WaveNode[] = [];
    const k = (2 * Math.PI * frequency) / 343.0; // Wavenumber
    const cx = 260;
    const cy = 250;

    for (let x = 40; x <= 480; x += 22) {
      for (let y = 50; y <= 450; y += 22) {
        // Distance from northern Oracle Niche (260, 80)
        const d1 = Math.sqrt((x - cx) ** 2 + (y - 80) ** 2) * 0.015;
        // Reflected wave from south curved apse (260, 420)
        const d2 = Math.sqrt((x - cx) ** 2 + (y - 420) ** 2) * 0.015;

        // Standing wave superposition
        const p1 = Math.cos(k * d1);
        const p2 = Math.cos(k * d2);
        const pTotal = (p1 + p2) * 0.5;

        nodes.push({
          x,
          y,
          pressure: pTotal,
          phase: (k * d1) % (2 * Math.PI)
        });
      }
    }
    return nodes;
  }, [frequency]);

  return (
    <div className="min-h-screen bg-[#0e1015] text-[#e8e4dc] font-sans selection:bg-[#b91c1c]/40 selection:text-[#fff] overflow-x-hidden">
      {/* Top Architectural Header & Navigation */}
      <header className="border-b border-[#242833] bg-[#12151d]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#d4af37] bg-[#b91c1c]/15 flex items-center justify-center font-serif text-[#d4af37] font-bold text-sm tracking-widest shadow-inner">
            20
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] font-mono text-[#d4af37] uppercase">Design Minds · Chapter XX</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#b91c1c]/50 bg-[#b91c1c]/15 text-[#fca5a5] font-mono">110.4 Hz RESONATOR</span>
            </div>
            <h1 className="text-base sm:text-lg font-serif tracking-wide text-[#f5eedf] font-medium">
              Subterranean Hypogeum Archaeoacoustics
            </h1>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-[#181b24] border border-[#2b3140] p-1 gap-1">
          <button
            onClick={() => setActiveMode("resonance")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "resonance"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8d95a5] hover:text-[#e8e4dc]"
            }`}
          >
            🔊 110Hz ORACLE
          </button>
          <button
            onClick={() => setActiveMode("reverberation")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "reverberation"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8d95a5] hover:text-[#e8e4dc]"
            }`}
          >
            ⚡ RT60 IMPULSE
          </button>
          <button
            onClick={() => setActiveMode("epigraphy")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "epigraphy"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8d95a5] hover:text-[#e8e4dc]"
            }`}
          >
            🌀 OCHRE SPIRAL
          </button>
          <button
            onClick={() => setActiveMode("section3d")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "section3d"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8d95a5] hover:text-[#e8e4dc]"
            }`}
          >
            📐 3D SECTION
          </button>
        </div>
      </header>

      {/* Main Archaeological Chamber Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Subterranean Wave Mechanics Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border border-[#2d3342] bg-[#141720] p-5 relative overflow-hidden shadow-2xl">
            
            {/* Top Bar inside Chamber Card */}
            <div className="flex items-center justify-between border-b border-[#242833] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isResonant ? "bg-[#f59e0b] animate-ping" : "bg-[#475569]"}`}></span>
                <span className="text-xs font-mono text-[#d4af37] tracking-wider uppercase">
                  ĦAL SAFLIENI ACOUSTIC FIELD · ELEV -5.4m
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSound}
                  className={`px-2.5 py-0.5 text-[10px] font-mono border transition-all ${
                    soundEnabled
                      ? "border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10 font-bold"
                      : "border-[#475569] text-[#8e95a5] hover:border-[#d4af37]"
                  }`}
                >
                  {soundEnabled ? "HUM ACTIVE (MUTE)" : "PLAY 110Hz TONE"}
                </button>
                <span className="text-[11px] font-mono text-[#717b8f]">
                  GAIN: <strong className="text-[#f5eedf]">+{resonanceGain} dB</strong>
                </span>
              </div>
            </div>

            {/* Kinetic Archaeoacoustic SVG Chamber Viewport */}
            <div 
              className={`w-full aspect-square max-h-[520px] mx-auto bg-[#0a0c10] border border-[#232733] relative flex items-center justify-center transition-transform duration-700 ${
                activeMode === "section3d" ? "perspective-[1400px] [transform:rotateX(28deg)_rotateY(-12deg)] scale-95" : ""
              }`}
            >
              <svg viewBox="0 0 520 520" className="w-full h-full select-none">
                <defs>
                  <radialGradient id="nicheGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={isResonant ? "0.9" : "0.3"} />
                    <stop offset="45%" stopColor="#b91c1c" stopOpacity={isResonant ? "0.5" : "0.1"} />
                    <stop offset="100%" stopColor="#0a0c10" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="rockCavity" cx="50%" cy="50%" r="50%">
                    <stop offset="70%" stopColor="#171b24" stopOpacity="0" />
                    <stop offset="100%" stopColor="#0a0c10" stopOpacity="0.8" />
                  </radialGradient>
                </defs>

                {/* Subterranean Limestone Cavity Outer Rock Profile */}
                <path
                  d="M 60 260 C 60 120, 160 60, 260 60 C 360 60, 460 120, 460 260 C 460 380, 370 450, 260 450 C 150 450, 60 380, 60 260 Z"
                  fill="#171b26"
                  stroke="#d8cfbc"
                  strokeWidth="2.5"
                />
                <rect width="520" height="520" fill="url(#rockCavity)" />

                {/* Acoustic Grid Wave Pressure Nodes (Interference Simulation) */}
                <g opacity={isResonant ? "0.85" : "0.4"}>
                  {waveNodes.map((n, idx) => {
                    const radius = Math.max(1.2, Math.abs(n.pressure) * (isResonant ? 4.8 : 2.5));
                    const isPositive = n.pressure > 0;
                    const fillCol = isPositive ? (isResonant ? "#f59e0b" : "#d8cfbc") : "#38bdf8";
                    return (
                      <circle
                        key={idx}
                        cx={n.x}
                        cy={n.y}
                        r={radius}
                        fill={fillCol}
                        opacity={Math.min(1.0, Math.abs(n.pressure) + 0.15)}
                      />
                    );
                  })}
                </g>

                {/* Standing Wave Nodal Lines (Gold Contours during 110Hz lock) */}
                {isResonant && (
                  <g className="animate-pulse">
                    <ellipse cx="260" cy="180" rx="140" ry="70" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" />
                    <ellipse cx="260" cy="270" rx="165" ry="90" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                    <ellipse cx="260" cy="360" rx="130" ry="60" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                  </g>
                )}

                {/* The Oracle Niche (North Transmitter Apse) */}
                <path
                  d="M 225 75 Q 260 40 295 75 Z"
                  fill="#b91c1c"
                  fillOpacity="0.4"
                  stroke="#b91c1c"
                  strokeWidth="2.5"
                />
                <circle cx="260" cy="72" r={isResonant ? 22 : 12} fill="url(#nicheGlow)" />
                <text x="260" y="38" textAnchor="middle" fill="#d4af37" fontSize="10" fontFamily="monospace" letterSpacing="1">
                  ORACLE NICHE (110.4Hz SOUND SOURCE)
                </text>

                {/* Neolithic Ochre Spiral Murals (Ceiling Cavity Motif) */}
                {showSpirals && (
                  <g opacity={isResonant ? "0.95" : "0.45"} className="transition-opacity duration-500">
                    <path
                      d="M 190 260 Q 210 230 230 250 Q 250 270 230 290 Q 200 300 180 270 Q 160 230 200 200 Q 250 170 290 210"
                      fill="none"
                      stroke="#b91c1c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 330 260 Q 310 230 290 250 Q 270 270 290 290 Q 320 300 340 270 Q 360 230 320 200 Q 270 170 230 210"
                      fill="none"
                      stroke="#b91c1c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Central Acoustic Focal Point & Incised Red Ochre Typography */}
                <g transform="translate(260, 275)">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={isResonant ? "#fef08a" : "#d8cfbc"}
                    fontSize={isResonant ? 36 : 30}
                    fontFamily="Cinzel, serif"
                    fontWeight={fontWeight}
                    letterSpacing="6"
                    style={{
                      filter: isResonant
                        ? "drop-shadow(0 0 12px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 24px rgba(185, 28, 28, 0.6))"
                        : "none",
                      transition: "all 0.3s ease-out"
                    }}
                  >
                    ORACULUM
                  </text>
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill="#b91c1c"
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="2"
                  >
                    {isResonant ? "STANDING WAVE COUPLING: 100%" : "ACOUSTIC DISPERSION: UNCOUPLED"}
                  </text>
                </g>

                {/* Impulse Echo Wavefront Ring (When Impulse Triggered) */}
                {isImpulseActive && (
                  <circle
                    cx="260"
                    cy="72"
                    r={380 * (1.0 - impulseDecay)}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={Math.max(1, impulseDecay * 6)}
                    strokeOpacity={impulseDecay}
                  />
                )}

                {/* Section Cut Callout Tag */}
                {activeMode === "section3d" && (
                  <text x="20" y="500" fill="#d4af37" fontSize="10" fontFamily="monospace">
                    AXONOMETRIC PERSPECTIVE: EXCAVATION DEPTH -11.0m INTO BEDROCK
                  </text>
                )}
              </svg>
            </div>

            {/* Interactive Control Deck */}
            <div className="mt-5 pt-4 border-t border-[#242833] flex flex-col gap-4">
              {/* Frequency Sweep Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#8e95a5]">RESONANT ACOUSTIC FREQUENCY:</span>
                  <span className={`font-semibold ${isResonant ? "text-[#f59e0b]" : "text-[#d8cfbc]"}`}>
                    {frequency.toFixed(1)} Hz {isResonant ? "(110.4Hz CAVITY RESONANCE LOCKED)" : `(Δ = ${deltaF}Hz)`}
                  </span>
                </div>
                <input
                  type="range"
                  min="80.0"
                  max="140.0"
                  step="0.2"
                  value={frequency}
                  onChange={(e) => setFrequency(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer h-1.5 bg-[#242833]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#5b6475]">
                  <span>80 Hz (INFRASOUND)</span>
                  <span className="text-[#f59e0b] font-bold">110.4 Hz (ĦAL SAFLIENI PEAK)</span>
                  <span>140 Hz (DISPERSION)</span>
                </div>
              </div>

              {/* Action Buttons & Subterranean Tier Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFrequency(110.4)}
                    className="px-3 py-1.5 bg-[#b91c1c]/20 border border-[#b91c1c] text-[#fca5a5] text-xs font-mono hover:bg-[#b91c1c]/30"
                  >
                    SNAP TO 110.4 Hz
                  </button>
                  <button
                    onClick={triggerImpulse}
                    disabled={isImpulseActive}
                    className="px-3 py-1.5 bg-[#1e2330] border border-[#d4af37] text-[#d4af37] text-xs font-mono hover:bg-[#d4af37]/10 disabled:opacity-50"
                  >
                    CLAP IMPULSE (RT60)
                  </button>
                  <button
                    onClick={() => setShowSpirals(!showSpirals)}
                    className="px-2.5 py-1.5 border border-[#475569] text-[#8e95a5] text-xs font-mono hover:text-[#fff]"
                  >
                    {showSpirals ? "HIDE SPIRALS" : "SHOW SPIRALS"}
                  </button>
                </div>

                {/* 3-Tier Depth Switcher */}
                <div className="flex items-center gap-1 bg-[#12141a] border border-[#232733] p-1">
                  <button
                    onClick={() => setActiveTier("upper")}
                    className={`px-2 py-1 text-[10px] font-mono ${activeTier === "upper" ? "bg-[#d4af37] text-[#111317] font-bold" : "text-[#717b8f]"}`}
                  >
                    TIER I (-3m)
                  </button>
                  <button
                    onClick={() => setActiveTier("oracle")}
                    className={`px-2 py-1 text-[10px] font-mono ${activeTier === "oracle" ? "bg-[#d4af37] text-[#111317] font-bold" : "text-[#717b8f]"}`}
                  >
                    ORACLE (-5m)
                  </button>
                  <button
                    onClick={() => setActiveTier("holy")}
                    className={`px-2 py-1 text-[10px] font-mono ${activeTier === "holy" ? "bg-[#d4af37] text-[#111317] font-bold" : "text-[#717b8f]"}`}
                  >
                    HOLY (-10m)
                  </button>
                </div>
              </div>

              {/* Physical Telemetry HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#0f1118] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">RESONANCE GAIN</div>
                  <div className="text-base font-mono text-[#f59e0b] font-semibold">+{resonanceGain} dB</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">Q-FACTOR = 14.2</div>
                </div>
                <div className="bg-[#0f1118] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">TYPOGRAPHIC WEIGHT</div>
                  <div className="text-base font-mono text-[#38bdf8] font-semibold">wght {fontWeight}</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">PHASE LOCKED</div>
                </div>
                <div className="bg-[#0f1118] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">REVERBERATION TIME</div>
                  <div className="text-base font-mono text-[#34d399] font-semibold">{rt60}</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">SABINE DECAY RT60</div>
                </div>
                <div className="bg-[#0f1118] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">EEG FRONTAL SHIFT</div>
                  <div className="text-base font-mono text-[#fca5a5] font-semibold">{eegAsymmetry}</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">THETA DEEP TRANCE</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Weathered Limestone Monograph Substrate (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div 
            className="border border-[#c7bb9f] bg-[#d8cfbc] text-[#1c1815] p-7 shadow-2xl relative min-h-[580px]"
            style={{
              boxShadow: `0 25px 50px -12px rgba(0,0,0,0.7), inset 0 0 50px rgba(44, 38, 30, 0.08)`
            }}
          >
            {/* Weathered Rock & Calcite Crystal Texture Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 30%, transparent 40%, rgba(20,18,14,0.4) 95%), repeating-linear-gradient(0deg, rgba(60,50,40,0.06) 0px, rgba(60,50,40,0.06) 1px, transparent 1px, transparent 12px)`
              }}
            />

            {/* Editorial Header */}
            <div className="border-b border-[#b5a78c] pb-4 mb-6 relative">
              <div className="flex justify-between items-baseline text-[11px] font-mono text-[#716550] uppercase tracking-widest mb-1">
                <span>ARCHAEOLOGY · FOLIO 020</span>
                <span>MALTA · 3600 BCE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#161311] tracking-tight leading-tight">
                The Echo in the Stone: Archaeoacoustic Sanctuary
              </h2>
              <p className="text-xs font-serif italic text-[#702020] mt-1">
                언어는 종이의 침묵 속에서 태어나지 않았다. 그것은 110Hz로 포효하던 암반 동굴의 공명 속에서 새겨졌다.
              </p>
            </div>

            {/* Reading Essay with Dynamic Variable Font Weight Coupling */}
            <div className="space-y-4 font-serif text-[15px] leading-relaxed text-[#26201b] relative">
              <p>
                <span className="float-left text-4xl font-bold leading-none pr-2 pt-1 font-serif text-[#9e2a2b]">
                  D
                </span>
                eep beneath the limestone plateau of Malta, the Neolithic priests of Ħal Saflieni did not carve stone for the eyes; they sculpted it for the throat.
              </p>

              <p style={{ fontWeight: isResonant ? 600 : 400 }}>
                When chanting into the Oracle Niche at <strong className="text-[#9e2a2b]">110.4 Hz</strong>, the entire subterranean chamber locks into Helmholtz cavity resonance. The voice does not fade into ambient space; it tightens into acoustic standing wave pressure fields that vibrate human bone marrow and induce bilateral prefrontal EEG entrainment.
              </p>

              {/* Incised Ochre Callout Box */}
              <div className="my-5 p-4 border-l-2 border-[#9e2a2b] bg-[#c7bb9f]/70 transition-all duration-300">
                <div className="flex items-center justify-between text-xs font-mono text-[#7a1c1d] font-semibold mb-1">
                  <span>[NEURO-ARCHAEOLOGY AXIOM 20]</span>
                  <span className="text-[10px]">{isResonant ? "RESONANCE ACTIVE" : "OFF RESONANCE"}</span>
                </div>
                <p className="text-xs font-sans text-[#3b322a]">
                  At exactly 110 Hz, language transcends silent optical code. The sound field physically organizes textual hierarchy: acoustic antinodes sharpen stroke edges, while 3.84s reverberation creates somatic presence without visual noise.
                </p>
              </div>

              <p>
                By reconstructing this Neolithic archaeoacoustic physics on the web, front-end architecture escapes the flat conveyor belt. The screen becomes a subterranean chamber where meaning resonates through space, frequency, and embodied human voice.
              </p>
            </div>

            {/* Substrate Footer Certification */}
            <div className="mt-8 pt-4 border-t border-[#b5a78c] flex justify-between items-center text-[10px] font-mono text-[#716550]">
              <span>GLOBIGERINA LIMESTONE BEDROCK</span>
              <span>VERIFIED THEMATIC AXIOM 20</span>
            </div>
          </div>

          {/* Quick Technical Specs Box */}
          <div className="border border-[#242833] bg-[#12151d] p-4 text-xs font-mono space-y-2">
            <div className="text-[#d4af37] font-semibold text-[11px] uppercase tracking-wider">
              ARCHAEOACOUSTIC PARAMETERS & CITATIONS:
            </div>
            <ul className="text-[#8e95a5] space-y-1.5 text-[11px]">
              <li>• <strong className="text-[#ebdcc9]">Richard Jahn et al. (1996)</strong>: Acoustical Resonances of Ancient Structures, JASA.</li>
              <li>• <strong className="text-[#ebdcc9]">Ian Cook et al. (2008)</strong>: 110 Hz Prefrontal Cortex Brainwave Entrainment.</li>
              <li>• <strong className="text-[#ebdcc9]">Helmholtz Formula</strong>: f₀ = (c / 2π) · √(A / [V · (L + 0.6r)]) ≈ 110.4 Hz</li>
            </ul>
          </div>
        </div>

      </main>

      {/* Global Architectural Footer */}
      <footer className="border-t border-[#242833] bg-[#0a0c10] px-6 py-6 text-center text-xs font-mono text-[#626b7d]">
        DESIGN MINDS · DAY 020 EXPERIMENT · GEMINI (NOON MIND) · AUTONOMOUS DISCOVERY CADENCE
      </footer>
    </div>
  );
}
