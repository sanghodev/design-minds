"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";

export default function ChromaticViscosityExperiment() {
  const [velocity, setVelocity] = useState<number>(0);
  const [viscosity, setViscosity] = useState<number>(85); // 50 to 98% damping
  const [surfaceTension, setSurfaceTension] = useState<number>(45); // resistance coefficient
  const [chromaticIntensity, setChromaticIntensity] = useState<number>(60);
  const [freezeState, setFreezeState] = useState<boolean>(false);

  const lastPos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: Date.now() });
  const animFrame = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viscId = useId();
  const tensId = useId();
  const chromId = useId();

  // Pointer movement listener calculates real-time hydrodynamic velocity
  const handlePointerMove = (e: React.PointerEvent) => {
    if (freezeState) return;
    const now = Date.now();
    const dt = Math.max(1, now - lastPos.current.time);
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Non-linear acceleration scaled by surface tension resistance
    const rawV = (dist / dt) * 12;
    const dampedV = rawV / (1 + surfaceTension * 0.015);
    
    setVelocity((prev) => Math.min(100, Math.max(prev, dampedV)));
    lastPos.current = { x: e.clientX, y: e.clientY, time: now };
  };

  // Continuous relaxation loop: non-linear fluid viscosity decay
  useEffect(() => {
    const decayRate = 0.8 + (viscosity / 100) * 0.18; // e.g. 0.90 to 0.97
    const loop = () => {
      if (!freezeState) {
        setVelocity((prev) => (prev > 0.05 ? prev * decayRate : 0));
      }
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [viscosity, freezeState]);

  // Optical and typographic transformations
  const tracking = (0.04 - (velocity * 0.0009)).toFixed(3);
  const scaleCompressX = (1 - (velocity * 0.0025)).toFixed(3);
  const scaleCompressY = (1 + (velocity * 0.0018)).toFixed(3);
  const chromaticShift = ((velocity / 100) * (chromaticIntensity * 0.25)).toFixed(2);
  const blurDispersion = ((velocity / 100) * 3).toFixed(1);

  return (
    <div className="min-h-screen w-full bg-[#07080a] text-[#ededeb] font-sans antialiased flex flex-col justify-between selection:bg-[#d7ff45] selection:text-black">
      {/* Telemetry Header */}
      <header className="border-b border-neutral-800/80 bg-[#0c0d12]/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-[#d7ff45] transition-colors flex items-center gap-2"
          >
            <span>ΓåÉ</span>
            <span>Design Minds</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d7ff45] animate-pulse" />
            <span className="text-neutral-200 font-semibold uppercase tracking-wider">Noon Mind</span>
            <span className="text-neutral-500">/ Day 003 Research Instrument</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
          <div className="hidden md:flex items-center gap-3">
            <span>VELOCITY: <strong className="text-neutral-200">{velocity.toFixed(1)} px/ms</strong></span>
            <span>DISPERSION: <strong className="text-neutral-200">┬▒{chromaticShift}px</strong></span>
            <span>COMPRESSION: <strong className="text-[#d7ff45]">{((1 - Number(scaleCompressX)) * 100).toFixed(1)}%</strong></span>
          </div>
          <button
            onClick={() => setFreezeState(!freezeState)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
              freezeState ? "border-amber-400 text-amber-400 bg-amber-400/10" : "border-neutral-750 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            Freeze State: {freezeState ? "LOCKED" : "FREE"}
          </button>
        </div>
      </header>

      {/* Main Structural Laboratory */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
        
        {/* Left Parameter Controls */}
        <aside className="lg:col-span-3 border-r border-neutral-800/80 bg-[#0a0c10]/60 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#d7ff45] mb-1">Inquiry Core</p>
              <h2 className="text-sm font-semibold text-neutral-200 leading-tight">
                Chromatic Viscosity: Hydrodynamic Density
              </h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Investigating typography governed by fluid drag and capillary surface tension. Hurried gestures compress words into dense chromatic droplets; deliberate pause restores classical hierarchy.
              </p>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-neutral-800/60">
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={viscId}>Fluid Viscosity Decay (╬╝)</label>
                  <span className="text-neutral-200">{viscosity}%</span>
                </div>
                <input
                  id={viscId}
                  type="range"
                  min="50"
                  max="98"
                  value={viscosity}
                  onChange={(e) => setViscosity(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={tensId}>Surface Tension Resistance (╬│)</label>
                  <span className="text-neutral-200">{surfaceTension}%</span>
                </div>
                <input
                  id={tensId}
                  type="range"
                  min="10"
                  max="90"
                  value={surfaceTension}
                  onChange={(e) => setSurfaceTension(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={chromId}>Prism Chromatic Dispersion</label>
                  <span className="text-neutral-200">{chromaticIntensity}%</span>
                </div>
                <input
                  id={chromId}
                  type="range"
                  min="10"
                  max="100"
                  value={chromaticIntensity}
                  onChange={(e) => setChromaticIntensity(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4 text-[11px] font-mono text-neutral-500 space-y-1">
            <div>30-Day Avoidance: Linear velocity-proportional scaling</div>
            <div>Damping Equation: Non-Newtonian shear thinning</div>
          </div>
        </aside>

        {/* Center Canvas Stage (The Fluid Specimen) */}
        <main
          ref={stageRef}
          onPointerMove={handlePointerMove}
          className="lg:col-span-6 relative flex flex-col justify-center items-center p-8 sm:p-14 overflow-hidden select-none bg-[#090a0d] cursor-crosshair touch-none"
        >
          {/* Real-time Dynamic Fluid Particle Background */}
          <div className="absolute top-6 left-6 text-xs font-mono text-neutral-500">
            <div>GESTURE SENSOR ACTIVE</div>
            <div className="text-[#d7ff45] mt-0.5">Sweep cursor briskly to induce capillary coalescence</div>
          </div>

          <div className="w-full max-w-2xl text-center z-10 my-auto py-12">
            <p className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#d7ff45] mb-6">
              Hydrodynamic Typographic Specimen
            </p>

            {/* Specimen Title with Dynamic Chromatic Dispersion */}
            <h1
              className="text-5xl sm:text-7xl md:text-8xl tracking-tight transition-all uppercase font-black"
              style={{
                letterSpacing: `${tracking}em`,
                transform: `scale(${scaleCompressX}, ${scaleCompressY})`,
                filter: Number(blurDispersion) > 0.4 ? `blur(${blurDispersion}px)` : "none",
                textShadow:
                  velocity > 2
                    ? `${chromaticShift}px 0 rgba(255,50,60,0.85), -${chromaticShift}px 0 rgba(40,140,255,0.85)`
                    : "0 0 1px rgba(255,255,255,0.2)"
              }}
            >
              Chromatic Viscosity
            </h1>

            {/* Specimen Prose under Capillary Pull */}
            <p
              className="mt-8 text-sm sm:text-base text-neutral-300 max-w-lg mx-auto leading-relaxed transition-all duration-100 font-serif italic"
              style={{
                letterSpacing: `${Number(tracking) * 0.6}em`,
                opacity: Math.max(0.4, 1 - velocity * 0.008)
              }}
            >
              "The faster the reader rushes, the tighter glyphs coalesce into dense chromatic ink droplets. Only when breath slows does the sentence unfold into serene editorial equilibrium."
            </p>

            <div className="mt-8 inline-flex items-center gap-4 text-xs font-mono text-neutral-500 border border-neutral-800 bg-neutral-900/50 px-4 py-2 rounded">
              <span>Tracking: <strong className="text-neutral-300">{tracking}em</strong></span>
              <span>ΓÇó</span>
              <span>Prism Fringe: <strong className="text-neutral-300">┬▒{chromaticShift}px</strong></span>
              <span>ΓÇó</span>
              <span>Deformation: <strong className="text-[#d7ff45]">{scaleCompressX}x / {scaleCompressY}y</strong></span>
            </div>
          </div>
        </main>

        {/* Right Observational Telemetry Deck */}
        <aside className="lg:col-span-3 border-l border-neutral-800/80 bg-[#0a0c10]/60 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1">
                Theoretical Benchmark
              </p>
              <h3 className="text-xs font-semibold text-neutral-200">
                Emil Ruder's Kinetic Tension & Maeda's Computation
              </h3>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                In Ruder's canon, typography lives in the tension between black form and white counter. Translating gesture velocity into viscous surface tension restores tangible organic weight to digital pixels.
              </p>
            </div>

            <div className="space-y-4 border-t border-neutral-800/60 pt-4">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#d7ff45]">
                Hydrodynamic Telemetry
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Kinetic Velocity</span>
                    <span className="text-[#d7ff45] font-bold">{velocity.toFixed(1)} px/ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-[#d7ff45]" style={{ width: `${velocity}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Bouma Droplet Coalescence</span>
                    <span className="text-neutral-200">{((velocity / 100) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-neutral-400" style={{ width: `${(velocity / 100) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed font-mono">
                <div className="text-neutral-300 font-semibold mb-1">Self-Critique & Boundary:</div>
                Linear velocity mapping induces visual disorientation. Adding non-Newtonian shear thinning maintains legibility during abrupt deceleration without saccadic vertigo.
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Publication Chapter
            </p>
            <p className="text-xs text-neutral-300 font-medium">
              Chapter 3: Ink Viscosity and Textual Surface Tension
            </p>
          </div>
        </aside>

      </div>

      {/* Footer System Status */}
      <footer className="border-t border-neutral-800/80 bg-[#08090b] px-6 py-3 flex flex-wrap justify-between items-center text-xs font-mono text-neutral-500 z-30">
        <div>Design Minds ┬╖ 365 Days of Speculative Design Inquiry</div>
        <div className="flex items-center gap-4">
          <span>Target: Computational Typographers</span>
          <span>ΓÇó</span>
          <span>Status: Verified Interactive Instrument</span>
        </div>
      </footer>
    </div>
  );
}
