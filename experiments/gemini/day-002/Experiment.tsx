"use client";

import React, { useState, useId } from "react";
import Link from "next/link";

interface TectonicSlab {
  id: string;
  depth: number;
  label: string;
  leadClause: string;
  subtext: string;
  alignOffset: string;
}

const SLABS: TectonicSlab[] = [
  {
    id: "slab-01",
    depth: 96,
    label: "Plate A ┬╖ Elevation +96px",
    leadClause: "The orthodox grid canonizes",
    subtext: "predictable spatial continuity at the expense of cognitive gravity.",
    alignOffset: "ml-0"
  },
  {
    id: "slab-02",
    depth: 64,
    label: "Plate B ┬╖ Elevation +64px",
    leadClause: "Fracture the tectonic plane,",
    subtext: "and typographic hierarchy shatters across an architectural void.",
    alignOffset: "ml-12 sm:ml-24"
  },
  {
    id: "slab-03",
    depth: 32,
    label: "Plate C ┬╖ Elevation +32px",
    leadClause: "Yet raking daylight sutures the wound,",
    subtext: "as cast shadows extend directional bridges across negative space.",
    alignOffset: "ml-6 sm:ml-44"
  },
  {
    id: "slab-04",
    depth: 8,
    label: "Plate D ┬╖ Elevation +8px (Terminal Base)",
    leadClause: "Reading becomes a spatial descent.",
    subtext: "Form emerges not from print borders, but from optical gravity.",
    alignOffset: "ml-16 sm:ml-64"
  }
];

export default function DiscontinuousGridsExperiment() {
  const [fissureGap, setFissureGap] = useState<number>(54);
  const [shadowAngle, setShadowAngle] = useState<number>(38);
  const [perspective3D, setPerspective3D] = useState<boolean>(true);
  const [showSutureGuides, setShowSutureGuides] = useState<boolean>(true);
  const [activePlate, setActivePlate] = useState<string>("slab-01");

  const gapId = useId();
  const angleId = useId();

  // Dynamic shadow displacement based on light angle
  const shadowRad = (shadowAngle * Math.PI) / 180;
  const shadowY = Math.tan(shadowRad) * 24;
  const shadowX = -Math.cos(shadowRad) * 16;
  const shadowBlur = Math.max(12, shadowY * 0.8);

  // Saccadic reading continuity index (fictional mathematical metric)
  const continuityIndex = Math.max(18, Math.min(99, Math.round(100 - Math.abs(fissureGap - 48) * 0.7 - Math.abs(shadowAngle - 35) * 0.8)));

  return (
    <div className="min-h-screen w-full bg-[#08090c] text-[#ecece6] font-sans antialiased flex flex-col justify-between selection:bg-[#d7ff45] selection:text-black">
      {/* Telemetry Header */}
      <header className="border-b border-neutral-800/80 bg-[#0c0e13]/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-30">
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
            <span className="text-neutral-500">/ Day 002 Research Instrument</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
          <div className="hidden md:flex items-center gap-3">
            <span>FISSURE: <strong className="text-neutral-200">{fissureGap}px</strong></span>
            <span>SHADOW: <strong className="text-neutral-200">{shadowAngle}┬░</strong></span>
            <span>CONTINUITY: <strong className="text-[#d7ff45]">{continuityIndex}%</strong></span>
          </div>
          <button
            onClick={() => setPerspective3D(!perspective3D)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
              perspective3D ? "border-[#d7ff45] text-[#d7ff45] bg-[#d7ff45]/10" : "border-neutral-750 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            3D Depth: {perspective3D ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowSutureGuides(!showSutureGuides)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
              showSutureGuides ? "border-[#d7ff45] text-[#d7ff45] bg-[#d7ff45]/10" : "border-neutral-750 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            Sutures: {showSutureGuides ? "ON" : "OFF"}
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
                Discontinuous Grids: Spatial Rupture & Suture
              </h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Replacing orthodox Swiss 12-column continuity with fractured tectonic planes at varied Z-elevations. Cast shadows act as the connective tissue bridging separated clauses.
              </p>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-neutral-800/60">
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={gapId}>Fissure Gutter Width</label>
                  <span className="text-neutral-200">{fissureGap}px</span>
                </div>
                <input
                  id={gapId}
                  type="range"
                  min="20"
                  max="130"
                  value={fissureGap}
                  onChange={(e) => setFissureGap(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={angleId}>Incident Shadow Vector</label>
                  <span className="text-neutral-200">{shadowAngle}┬░</span>
                </div>
                <input
                  id={angleId}
                  type="range"
                  min="12"
                  max="76"
                  value={shadowAngle}
                  onChange={(e) => setShadowAngle(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>
            </div>

            {/* Plates Registry */}
            <div className="space-y-2 border-t border-neutral-800/60 pt-4">
              <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 block">
                Tectonic Plate Registry
              </label>
              <div className="space-y-1.5">
                {SLABS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActivePlate(s.id)}
                    className={`w-full text-left p-2 rounded text-xs transition-all border ${
                      activePlate === s.id
                        ? "border-[#d7ff45] bg-[#d7ff45]/10 text-white font-medium"
                        : "border-neutral-800/80 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span>{s.label}</span>
                      <span className="text-neutral-500">Z: {s.depth}px</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4 text-[11px] font-mono text-neutral-500 space-y-1">
            <div>30-Day Avoidance: Monolithic planar extrusion</div>
            <div>Gestalt Law: Law of Closure via Negative Void</div>
          </div>
        </aside>

        {/* Center Canvas Stage (The Fractured Layout) */}
        <main className="lg:col-span-6 relative flex flex-col justify-center items-center p-8 sm:p-14 overflow-y-auto select-none bg-[#090a0d]">
          <div
            className="w-full max-w-2xl py-12 transition-transform duration-300"
            style={{
              transform: perspective3D ? "perspective(1100px) rotateX(8deg) rotateY(-4deg)" : "none"
            }}
          >
            {SLABS.map((slab, idx) => {
              const currentDepthRatio = slab.depth / 96;
              const currentShadowY = shadowY * currentDepthRatio;
              const currentShadowBlur = shadowBlur * currentDepthRatio;
              const isSelected = activePlate === slab.id;

              return (
                <div key={slab.id} className="relative">
                  {/* Tectonic Plate Element */}
                  <div
                    onClick={() => setActivePlate(slab.id)}
                    className={`cursor-pointer transition-all duration-200 border rounded-sm p-6 sm:p-7 relative z-10 ${slab.alignOffset} ${
                      isSelected
                        ? "border-[#d7ff45] bg-[#161a22]"
                        : "border-neutral-800/90 bg-[#11141a] hover:border-neutral-700"
                    }`}
                    style={{
                      boxShadow: `${shadowX * currentDepthRatio}px ${Math.max(6, currentShadowY)}px ${currentShadowBlur + 12}px rgba(0,0,0,0.85)`
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">
                      <span>{slab.label}</span>
                      <span className="text-[#d7ff45] opacity-80 font-mono">Seq 0{idx + 1}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 font-serif">
                      {slab.leadClause}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                      {slab.subtext}
                    </p>
                  </div>

                  {/* Inter-Slab Fissure & Suture Guide */}
                  {idx < SLABS.length - 1 && (
                    <div
                      className="relative w-full flex items-center justify-center pointer-events-none"
                      style={{ height: `${fissureGap}px` }}
                    >
                      {showSutureGuides && (
                        <div
                          className="w-full h-full flex items-center justify-center opacity-60 transition-all duration-150"
                          style={{
                            transform: `rotate(${shadowAngle - 45}deg)`
                          }}
                        >
                          <div className="w-px h-full bg-gradient-to-b from-[#d7ff45] via-neutral-700 to-transparent border-dashed" />
                          <div className="absolute text-[9px] font-mono text-[#d7ff45] tracking-widest uppercase bg-[#08090c] px-2 py-0.5 border border-[#d7ff45]/40 rounded-full">
                            Shadow Suture Vector
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
                Karl Gerstner's Morphological Permutations
              </h3>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                Rather than treating the grid as a static cage, Gerstner defined layout as a programmed morphological matrix. Fractured planes transform grid lines from boundaries into tectonic vectors.
              </p>
            </div>

            <div className="space-y-4 border-t border-neutral-800/60 pt-4">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#d7ff45]">
                Structural Diagnostics
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Saccadic Bridging Ratio</span>
                    <span className="text-[#d7ff45] font-bold">{continuityIndex}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-[#d7ff45]" style={{ width: `${continuityIndex}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Gutter Fracture Index</span>
                    <span className="text-neutral-200">{fissureGap}px / 130px</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-neutral-400" style={{ width: `${(fissureGap / 130) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed font-mono">
                <div className="text-neutral-300 font-semibold mb-1">Critical Boundary Condition:</div>
                When fissure gap exceeds 90px without corresponding shadow inclination, Gestalt law of proximity fails, causing the page to be perceived as disjointed technical error.
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Publication Chapter
            </p>
            <p className="text-xs text-neutral-300 font-medium">
              Chapter 2: Fractured Planes and the Shadow Suture
            </p>
          </div>
        </aside>

      </div>

      {/* Footer System Status */}
      <footer className="border-t border-neutral-800/80 bg-[#08090b] px-6 py-3 flex flex-wrap justify-between items-center text-xs font-mono text-neutral-500 z-30">
        <div>Design Minds ┬╖ 365 Days of Speculative Design Inquiry</div>
        <div className="flex items-center gap-4">
          <span>Target: Editorial & Structural Theorists</span>
          <span>ΓÇó</span>
          <span>Status: Verified Interactive Instrument</span>
        </div>
      </footer>
    </div>
  );
}
