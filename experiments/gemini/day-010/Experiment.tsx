"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function SchrodingerTypographyExperiment() {
  const [isObserved, setIsObserved] = useState<boolean>(false);
  const [collapsedState, setCollapsedState] = useState<"ALIVE" | "DEAD" | null>(null);
  const [decayProbability, setDecayProbability] = useState<number>(50); // 50% chance at t = half-life
  const [quantumPhase, setQuantumPhase] = useState<number>(0);
  const [observationCount, setObservationCount] = useState<number>(0);

  // Animation frame for quantum wave oscillation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setQuantumPhase((prev) => (prev + 0.08) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    if (!isObserved) {
      animId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animId);
  }, [isObserved]);

  // Observer Effect: Opening the chamber collapses the wave function
  const observeChamber = () => {
    if (isObserved) return;
    const roll = Math.random() * 100;
    const result = roll < decayProbability ? "DEAD" : "ALIVE";
    setCollapsedState(result);
    setIsObserved(true);
    setObservationCount((prev) => prev + 1);
  };

  // Quantum Eraser: Resets the system into unobserved superposition
  const resetSuperposition = () => {
    setIsObserved(false);
    setCollapsedState(null);
  };

  // Wave function interference displacement
  const jitterX = Math.sin(quantumPhase * 2) * 6;
  const jitterY = Math.cos(quantumPhase * 3) * 4;

  return (
    <div
      onClick={observeChamber}
      className="w-screen h-screen overflow-hidden bg-[#07090e] text-[#e6edf3] font-mono select-none relative flex flex-col justify-between p-6 sm:p-12 cursor-pointer"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.04) 0%, transparent 70%),
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 48px 48px, 48px 48px"
      }}
    >
      {/* Top Header Framing */}
      <header className="flex justify-between items-start z-30 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={(e) => e.stopPropagation()}
              className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-[#38bdf8] text-black hover:bg-white transition-colors"
            >
              ← DM-010 // QUANTUM CHAMBER
            </Link>
            <span className="text-[#94a3b8] text-xs font-bold tracking-widest">
              ERWIN SCHRÖDINGER 1935 · WAVEFUNCTION COLLAPSE
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1.5 max-w-xl font-sans">
            In the unobserved chamber, typography exists in simultaneous contradictory states: Ψ = 1/√2 (|ALIVE⟩ + |DEAD⟩). Click anywhere to act as the Observer.
          </p>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-[#64748b] uppercase tracking-widest">State</div>
            <div className={!isObserved ? "text-[#38bdf8] font-bold animate-pulse" : collapsedState === "ALIVE" ? "text-[#10b981] font-bold" : "text-[#ef4444] font-bold"}>
              {!isObserved ? "SUPERPOSITION |Ψ⟩" : `COLLAPSED: |${collapsedState}⟩`}
            </div>
          </div>

          {isObserved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetSuperposition();
              }}
              className="px-3 py-1.5 rounded border border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/10 text-xs font-bold uppercase transition-all"
            >
              ↺ QUANTUM ERASER
            </button>
          )}
        </div>
      </header>

      {/* Main Quantum Superposition Stage */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto relative z-20 text-center w-full max-w-5xl mx-auto">
        
        {/* Unobserved Superposition State: Both states overlapping with quantum interference */}
        {!isObserved && (
          <div className="relative py-12">
            {/* Wavefunction Ghost A: ALIVE (Cyan Shift) */}
            <h1
              className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter transition-all font-sans"
              style={{
                color: "rgba(56, 189, 248, 0.75)",
                transform: `translate(${jitterX}px, ${jitterY}px)`,
                textShadow: "0 0 25px rgba(56, 189, 248, 0.5)"
              }}
            >
              ALIVE
            </h1>

            {/* Wavefunction Ghost B: DEAD (Crimson Shift overlapping) */}
            <h1
              className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter absolute inset-0 flex items-center justify-center pointer-events-none font-sans"
              style={{
                color: "rgba(239, 68, 68, 0.75)",
                transform: `translate(${-jitterX}px, ${-jitterY}px)`,
                textShadow: "0 0 25px rgba(239, 68, 68, 0.5)",
                mixBlendMode: "screen"
              }}
            >
              DEAD
            </h1>

            {/* Interference Fringe Subtext */}
            <p className="mt-8 text-sm sm:text-base text-[#94a3b8] font-serif italic max-w-lg mx-auto leading-relaxed">
              "The cat is simultaneously living and dead; the word is simultaneously certainty and void. The text remains undecided until your gaze breaks the seal of the box."
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1e293b] bg-[#0c121e]/80 text-[#38bdf8] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
              <span>CLICK ANYWHERE TO OBSERVE (COLLAPSE WAVE FUNCTION)</span>
            </div>
          </div>
        )}

        {/* Collapsed State: Reality has chosen */}
        {isObserved && (
          <div className="py-12 animate-in fade-in zoom-in duration-300">
            {collapsedState === "ALIVE" ? (
              <div className="space-y-6">
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight text-[#10b981] font-sans drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                  ALIVE
                </h1>
                <p className="text-base text-[#6ee7b7] font-serif italic max-w-lg mx-auto">
                  "Observation complete: The radioactive isotope did not decay. The geiger counter remained silent; the vial of hydrocyanic acid remains intact. Language survives."
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight text-[#ef4444] font-sans drop-shadow-[0_0_35px_rgba(239,68,68,0.4)]">
                  DEAD
                </h1>
                <p className="text-base text-[#fca5a5] font-serif italic max-w-lg mx-auto">
                  "Observation complete: The quantum trigger fired. The hammer fell; the poison shattered. Meaning dissolves into entropic silence."
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantum Instrument Dock & Telemetry */}
      <footer className="z-30 border-t border-[#1e293b] pt-4 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-xs">
        
        {/* Isotope Decay Probability Control */}
        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between text-[#94a3b8]">
            <span>ISOTOPE DECAY (λ)</span>
            <strong className="text-white">{decayProbability}%</strong>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={decayProbability}
            onChange={(e) => setDecayProbability(Number(e.target.value))}
            className="w-full accent-[#38bdf8] cursor-pointer"
          />
          <div className="text-[10px] text-[#64748b]">HALF-LIFE THRESHOLD: t½ = 1.0 hr</div>
        </div>

        {/* Quantum Entanglement Phase */}
        <div className="space-y-1 text-[#94a3b8]">
          <div className="text-[10px] uppercase font-bold text-[#64748b]">PHASE ANGLE θ(t)</div>
          <div className="text-base font-bold text-white">{(quantumPhase * (180 / Math.PI)).toFixed(1)}° RAD</div>
          <div className="text-[10px] text-[#64748b]">INTERFERENCE AMPLITUDE: ±6.0px</div>
        </div>

        {/* Observation Ledger */}
        <div className="space-y-1 text-[#94a3b8]">
          <div className="text-[10px] uppercase font-bold text-[#64748b]">OBSERVATION LOG</div>
          <div className="text-base font-bold text-white">{observationCount} MEASUREMENTS</div>
          <div className="text-[10px] text-[#64748b]">VON NEUMANN-WIGNER COLLAPSE</div>
        </div>

        {/* Source Citation */}
        <div className="bg-[#0c121e] border border-[#1e293b] p-3 rounded text-[10px] text-[#94a3b8] space-y-0.5">
          <div className="text-[#38bdf8] font-bold uppercase">DIE NATURWISSENSCHAFTEN (1935)</div>
          <div>Erwin Schrödinger: "Die gegenwärtige Situation in der Quantenmechanik"</div>
        </div>
      </footer>
    </div>
  );
}
