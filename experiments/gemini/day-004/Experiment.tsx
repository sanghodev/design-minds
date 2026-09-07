"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";

interface HarmonicPreset {
  frequency: number;
  label: string;
  harmonicMode: string;
  description: string;
}

const CYMATIC_PRESETS: HarmonicPreset[] = [
  { frequency: 110, label: "Fundamental A2", harmonicMode: "m=2, n=1", description: "Bilateral nodal symmetry; bold primary stem resonance." },
  { frequency: 220, label: "First Octave A3", harmonicMode: "m=3, n=2", description: "Hexagonal nodal dispersion; balanced counter-form definition." },
  { frequency: 440, label: "Concert Pitch A4", harmonicMode: "m=4, n=3", description: "High-order crystalline interference; delicate terminal serif alignment." },
  { frequency: 528, label: "Harmonic Solfeggio", harmonicMode: "m=5, n=4", description: "Complex geometric standing waves; hyper-focused baseline stability." }
];

export default function CymaticResonanceExperiment() {
  const [frequency, setFrequency] = useState<number>(440);
  const [amplitude, setAmplitude] = useState<number>(75);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("Concert Pitch A4");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const freqId = useId();
  const ampId = useId();

  // Web Audio Tone Generator toggle
  useEffect(() => {
    if (audioEnabled) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime((amplitude / 100) * 0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
    }

    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, [audioEnabled]);

  // Update frequency and gain dynamically
  useEffect(() => {
    if (audioCtxRef.current && oscRef.current && gainRef.current) {
      oscRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime((amplitude / 100) * 0.15, audioCtxRef.current.currentTime, 0.05);
    }
  }, [frequency, amplitude]);

  // Cymatic wave calculations: Chladni 2D nodal resonance
  // Resonant nodes occur near integer multiples of 110Hz
  const harmonicDelta = Math.min(
    Math.abs(frequency - 110),
    Math.abs(frequency - 220),
    Math.abs(frequency - 440),
    Math.abs(frequency - 528),
    Math.abs(frequency - 880)
  );

  const isResonant = harmonicDelta < 12;
  const resonanceScore = Math.max(10, Math.round(100 - (harmonicDelta * 3.5)));
  
  // Vibration blur and stroke modulation
  const vibrationBlur = isResonant ? 0 : Math.min(6, (harmonicDelta / 15) * (amplitude / 100) * 4).toFixed(1);
  const nodalWidth = Math.round(200 + (frequency / 880) * 600);
  const sandDispersion = ((amplitude / 100) * 20).toFixed(1);

  const applyPreset = (preset: HarmonicPreset) => {
    setFrequency(preset.frequency);
    setActivePreset(preset.label);
  };

  return (
    <div className="min-h-screen w-full bg-[#080a0f] text-[#dce4ec] font-sans antialiased flex flex-col justify-between selection:bg-[#e5c158] selection:text-black">
      {/* Oscilloscope Header */}
      <header className="border-b border-[#162032] bg-[#0c1017]/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-[#e5c158] transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Design Minds</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e5c158] animate-ping" />
            <span className="text-[#e5c158] font-semibold uppercase tracking-wider">Noon Mind</span>
            <span className="text-neutral-500">/ Day 004 Cymatic Resonance Lab</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
          <div className="hidden md:flex items-center gap-3">
            <span>FREQUENCY: <strong className="text-[#e5c158]">{frequency} Hz</strong></span>
            <span>NODAL SCORE: <strong className={isResonant ? "text-emerald-400" : "text-amber-400"}>{resonanceScore}%</strong></span>
            <span>STATE: <strong className={isResonant ? "text-emerald-400 font-bold" : "text-neutral-400"}>{isResonant ? "HARMONIC LOCK" : "DISPERSED"}</strong></span>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-1 rounded border text-xs font-mono transition-all flex items-center gap-2 ${
              audioEnabled ? "border-emerald-400 text-emerald-400 bg-emerald-400/10" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            <span>{audioEnabled ? "🔊 Audio Engine: ON" : "🔇 Audio Engine: MUTED"}</span>
          </button>
        </div>
      </header>

      {/* Main Structural Laboratory */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
        
        {/* Left Parameter Controls */}
        <aside className="lg:col-span-3 border-r border-[#162032] bg-[#0a0d14]/70 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#e5c158] mb-1">Inquiry Core</p>
              <h2 className="text-sm font-semibold text-neutral-200 leading-tight">
                Acoustic Typography: Cymatic Nodal Alignment
              </h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Investigating letterform legibility as standing acoustic wave interference. Characters vibrate in chaotic dispersion until swept frequencies lock into harmonic integer nodes, restoring razor-sharp typographic definition.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 block">
                Harmonic Modes (Chladni Resonances)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CYMATIC_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`text-left p-2.5 rounded text-xs transition-all border ${
                      activePreset === p.label
                        ? "border-[#e5c158] bg-[#e5c158]/10 text-white font-medium"
                        : "border-[#1c2638] bg-[#101622]/40 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div className="font-mono text-[11px] text-[#e5c158]">{p.frequency} Hz</div>
                    <div className="text-[9px] text-neutral-400 mt-0.5">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-[#162032]">
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={freqId}>Oscillator Frequency</label>
                  <span className="text-[#e5c158] font-bold">{frequency} Hz</span>
                </div>
                <input
                  id={freqId}
                  type="range"
                  min="60"
                  max="900"
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(Number(e.target.value));
                    setActivePreset("Custom");
                  }}
                  className="w-full accent-[#e5c158] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={ampId}>Acoustic Energy (Amplitude)</label>
                  <span className="text-neutral-200">{amplitude}%</span>
                </div>
                <input
                  id={ampId}
                  type="range"
                  min="10"
                  max="100"
                  value={amplitude}
                  onChange={(e) => setAmplitude(Number(e.target.value))}
                  className="w-full accent-[#e5c158] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#162032] pt-4 text-[11px] font-mono text-neutral-500 space-y-1">
            <div>30-Day Avoidance: Velocity tracking & step extrusion</div>
            <div>Mathematical Basis: Bessel nodal zeros J_m(kr) = 0</div>
          </div>
        </aside>

        {/* Center Canvas Stage (The Cymatic Resonant Plate) */}
        <main className="lg:col-span-6 relative flex flex-col justify-center items-center p-8 sm:p-14 overflow-hidden select-none bg-[#05070a]">
          {/* Simulated Chladni Resonant Sand Particles Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 transition-opacity duration-300"
            style={{
              backgroundImage: `radial-gradient(#e5c158 1px, transparent 1px)`,
              backgroundSize: `${Math.max(12, 48 - (frequency / 25))}px ${Math.max(12, 48 - (frequency / 25))}px`,
              filter: `blur(${vibrationBlur}px)`
            }}
          />

          <div className="w-full max-w-2xl text-center z-10 my-auto py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5c158]/30 bg-[#e5c158]/5 mb-6 text-xs font-mono text-[#e5c158]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158]" />
              <span>STANDING ACOUSTIC INTERFERENCE PATTERN</span>
            </div>

            {/* Resonant Typographic Core */}
            <h1
              className="text-5xl sm:text-7xl md:text-8xl tracking-tight uppercase font-mono font-bold transition-all duration-75"
              style={{
                color: isResonant ? "#ffffff" : "#c4cad4",
                fontWeight: nodalWidth,
                letterSpacing: `${(frequency / 8800).toFixed(3)}em`,
                filter: Number(vibrationBlur) > 0 ? `blur(${vibrationBlur}px)` : "none",
                textShadow: isResonant
                  ? "0 0 20px rgba(229,193,88,0.8), 0 0 40px rgba(229,193,88,0.3)"
                  : `0 0 ${sandDispersion}px rgba(180,190,210,0.4)`
              }}
            >
              Cymatic Resonance
            </h1>

            <p
              className="mt-8 text-sm sm:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed transition-all duration-100 font-serif italic"
              style={{
                filter: Number(vibrationBlur) > 0.5 ? `blur(${Number(vibrationBlur) * 0.5}px)` : "none"
              }}
            >
              "When acoustic vibrations hit discordant frequencies, typography shatters into turbulent dust. Only at exact harmonic nodes do scattered grains lock into crystalline syntactic form."
            </p>

            <div className="mt-8 inline-flex items-center gap-4 text-xs font-mono text-neutral-400 border border-[#162032] bg-[#0c1017]/80 px-4 py-2 rounded">
              <span>Mode: <strong className="text-[#e5c158]">{isResonant ? "Resonant Node" : "Turbulent Antinode"}</strong></span>
              <span>•</span>
              <span>Stroke Weight: <strong className="text-neutral-200">{nodalWidth}</strong></span>
              <span>•</span>
              <span>Harmonic Lock: <strong className={isResonant ? "text-emerald-400" : "text-neutral-400"}>{resonanceScore}%</strong></span>
            </div>
          </div>
        </main>

        {/* Right Observational Telemetry Deck */}
        <aside className="lg:col-span-3 border-l border-[#162032] bg-[#0a0d14]/70 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1">
                Theoretical Benchmark
              </p>
              <h3 className="text-xs font-semibold text-neutral-200">
                Ernst Chladni & Hans Jenny Cymatics
              </h3>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                In 1787, physicist Ernst Chladni proved that bowing metal plates drives sand particles away from vibrating antinodes into quiescent nodal lines, revealing the invisible geometry of acoustic frequency.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#162032] pt-4">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#e5c158]">
                Harmonic Telemetry
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Standing Wave Purity</span>
                    <span className="text-[#e5c158] font-bold">{resonanceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#162032] rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${isResonant ? "bg-emerald-400" : "bg-[#e5c158]"}`}
                      style={{ width: `${resonanceScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Acoustic Dispersion</span>
                    <span className="text-neutral-200">{sandDispersion} mm</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#162032] rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-neutral-400" style={{ width: `${amplitude}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0e1420] border border-[#1c2638] text-[11px] text-neutral-400 leading-relaxed font-mono">
                <div className="text-neutral-200 font-semibold mb-1">Falsification Boundary:</div>
                When frequency exceeds 1200Hz, nodal lines become denser than visual receptor acuity, dissolving character glyphs into micro-texture rather than readable semantic language.
              </div>
            </div>
          </div>

          <div className="border-t border-[#162032] pt-4">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Publication Chapter
            </p>
            <p className="text-xs text-neutral-300 font-medium">
              Chapter 4: Cymatic Resonance & The Acoustic Spectrogram
            </p>
          </div>
        </aside>

      </div>

      {/* Footer System Status */}
      <footer className="border-t border-[#162032] bg-[#07090d] px-6 py-3 flex flex-wrap justify-between items-center text-xs font-mono text-neutral-500 z-30">
        <div>Design Minds · 365 Days of Speculative Design Inquiry</div>
        <div className="flex items-center gap-4">
          <span>Target: Acoustic & Multi-Modal Typographers</span>
          <span>•</span>
          <span>Status: Verified Interactive Instrument</span>
        </div>
      </footer>
    </div>
  );
}
