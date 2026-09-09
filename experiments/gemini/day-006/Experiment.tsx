"use client";

import React, { useState, useId } from "react";
import Link from "next/link";

interface CreasePreset {
  angle: number;
  label: string;
  description: string;
}

const CREASE_PRESETS: CreasePreset[] = [
  { angle: 0, label: "Virgin Sheet", description: "Pristine continuous ink film; zero mechanical strain with 100% elastic integrity." },
  { angle: 45, label: "Gentle Flank", description: "Subtle trough shadow; tensile stress remains below the binder elongation threshold." },
  { angle: 95, label: "Acute Ridge", description: "Plastic yield exceeded; dried offset ink fractures, exposing raw white cellulose pulp." },
  { angle: 150, label: "Bone-Folded Set", description: "Severe mechanical delamination; irreversible crease memory permanently splits word glyphs." }
];

export default function TectonicCreasingExperiment() {
  const [foldAngle, setFoldAngle] = useState<number>(65); // 0 to 160 degrees
  const [paperCaliper, setPaperCaliper] = useState<number>(300); // 120gsm to 450gsm
  const [ridgeMode, setRidgeMode] = useState<"mountain" | "valley">("mountain");
  const [toolMode, setToolMode] = useState<"fold" | "burnish">("fold");
  const [isManipulating, setIsManipulating] = useState<boolean>(false);

  const foldId = useId();
  const caliperId = useId();

  // Elastoplastic Bending & Tensile Strain Model:
  // sigma = E * (t / (2 * R)), where effective curvature radius R shrinks non-linearly
  const curvatureRadius = Math.max(0.8, 18 - (foldAngle / 160) * 16.8); // mm
  const tensileStress = Math.min(100, Math.round(((paperCaliper / 300) / curvatureRadius) * 32)); // %
  const isPlasticYield = tensileStress > 40; // Plastic deformation threshold
  const fractureWidth = isPlasticYield ? ((tensileStress - 40) / 60) * 4.5 : 0; // mm exposed fiber gap

  // 3D Spatial Leaf Rotation & Perspective Shadow
  const halfAngle = foldAngle / 2;
  const leftRotation = ridgeMode === "mountain" ? halfAngle * 0.72 : -halfAngle * 0.72;
  const rightRotation = ridgeMode === "mountain" ? -halfAngle * 0.72 : halfAngle * 0.72;
  const castShadowIntensity = Math.sin((foldAngle * Math.PI) / 180) * 40;

  // Direct tactile dragging across the crease apex
  const handlePointerDown = () => setIsManipulating(true);
  const handlePointerUp = () => setIsManipulating(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isManipulating) {
      if (toolMode === "fold") {
        const delta = (e.movementY * 0.6) - (e.movementX * 0.3);
        setFoldAngle((prev) => Math.min(160, Math.max(0, prev + delta)));
      } else {
        // Burnish tool tightens crease radius
        setPaperCaliper((prev) => Math.min(450, Math.max(120, prev + (e.movementY < 0 ? 4 : -4))));
      }
    }
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#ebe8e0] text-[#1b1916] font-serif antialiased select-none overflow-hidden relative flex flex-col justify-between p-6 sm:p-14 selection:bg-[#c99738] selection:text-white cursor-grab active:cursor-grabbing touch-none"
      style={{
        backgroundImage: `
          radial-gradient(#d6d1c2 0.8px, transparent 0.8px),
          radial-gradient(#e2ddd0 0.8px, #ebe8e0 0.8px)
        `,
        backgroundSize: "26px 26px, 13px 13px"
      }}
    >
      {/* Bauhaus Archival Header */}
      <header className="flex justify-between items-baseline z-20 border-b border-[#d4cebe] pb-4">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-[#7c7566] hover:text-[#1b1916] transition-colors font-semibold"
          >
            ← Design Minds
          </Link>
          <span className="text-[#b2a99a] font-mono">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#1b1916] font-bold">
            Noon Mind · Day 006 · Elastoplastic Paper Creasing
          </span>
        </div>

        <div className="font-mono text-xs text-[#7c7566] hidden sm:flex items-center gap-6">
          <span>ANGLE: <strong className="text-[#1b1916] font-bold">{foldAngle.toFixed(0)}°</strong></span>
          <span>TENSILE STRESS: <strong className={isPlasticYield ? "text-amber-800 font-bold" : "text-[#1b1916]"}>{tensileStress}%</strong></span>
          <span>FIBER DELAMINATION: <strong className="text-[#1b1916]">{fractureWidth.toFixed(1)}mm</strong></span>
        </div>
      </header>

      {/* Main 3D Folded Paper Center Stage */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto py-10 relative z-10 text-center perspective-[1500px]">
        
        {/* Tensile Stress Status Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#d4cebe] bg-[#faf8f2]/90 backdrop-blur mb-8 font-mono text-xs text-[#7c7566]">
          <span
            className="w-2 h-2 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: tensileStress > 75 ? "#b91c1c" : isPlasticYield ? "#d97706" : "#059669"
            }}
          />
          <span className="uppercase tracking-widest text-[11px] font-bold text-[#1b1916]">
            {tensileStress > 75 ? "Macroscopic Delamination & Severing" : isPlasticYield ? "Plastic Ink Yield Fracture" : "Elastic Reversible Strain"}
          </span>
          <span>·</span>
          <span>{foldAngle.toFixed(0)}° {ridgeMode.toUpperCase()}</span>
        </div>

        {/* The 3D Folded Paper Sheet Assembly */}
        <div className="relative max-w-5xl w-full flex justify-center items-center py-8">
          
          {/* Left Paper Leaf */}
          <div
            className="w-1/2 p-8 sm:p-14 bg-[#f6f4ec] border border-[#d4cebe] origin-right transition-transform duration-100 ease-out relative"
            style={{
              transform: `rotateY(${leftRotation}deg)`,
              boxShadow: ridgeMode === "mountain"
                ? `${-castShadowIntensity * 0.4}px ${castShadowIntensity * 0.25}px ${castShadowIntensity * 0.8}px rgba(0,0,0,0.14)`
                : `inset ${-castShadowIntensity * 0.6}px 0 ${castShadowIntensity * 0.8}px rgba(0,0,0,0.18)`
            }}
          >
            <div className="text-right">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#9c9382] block mb-2">Leaf Alpha // Left Flank</span>
              <h2 className="text-4xl sm:text-7xl md:text-8xl font-serif uppercase tracking-tight text-[#141311] font-bold">
                Tectonic
              </h2>
            </div>
          </div>

          {/* Central Crease Apex (Mechanical Fracture Ridge) */}
          <div className="relative h-full z-20 flex flex-col items-center justify-center">
            <div
              className="transition-all duration-100 relative"
              style={{
                width: `${Math.max(2, fractureWidth * 2)}px`,
                height: "220px",
                backgroundColor: isPlasticYield ? "#ffffff" : "#c2b9a7",
                boxShadow: isPlasticYield
                  ? `0 0 10px rgba(255,255,255,0.95), 0 0 2px #c99738`
                  : "none"
              }}
            >
              {isPlasticYield && (
                <div
                  className="absolute inset-0 bg-repeat-y opacity-90"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, transparent 2px, rgba(255,255,255,0.95) 3px, transparent 5px)`
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Paper Leaf */}
          <div
            className="w-1/2 p-8 sm:p-14 bg-[#f6f4ec] border border-[#d4cebe] origin-left transition-transform duration-100 ease-out relative"
            style={{
              transform: `rotateY(${rightRotation}deg)`,
              boxShadow: ridgeMode === "mountain"
                ? `${castShadowIntensity * 0.4}px ${castShadowIntensity * 0.25}px ${castShadowIntensity * 0.8}px rgba(0,0,0,0.14)`
                : `inset ${castShadowIntensity * 0.6}px 0 ${castShadowIntensity * 0.8}px rgba(0,0,0,0.18)`
            }}
          >
            <div className="text-left">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#9c9382] block mb-2">Leaf Beta // Right Flank</span>
              <h2 className="text-4xl sm:text-7xl md:text-8xl font-serif uppercase tracking-tight text-[#141311] font-bold">
                Creasing
              </h2>
            </div>
          </div>
        </div>

        {/* Prose across the fold */}
        <p className="mt-4 text-sm sm:text-base text-[#5a5245] max-w-xl mx-auto font-serif italic leading-relaxed">
          "As the bone folder compresses 300gsm cotton rag fibers into an acute mountain fold, outer tensile strain tears dried offset ink, peeling open the raw white cellulose heart of the paper."
        </p>

        {/* Tactile Direct-Drag Cue */}
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#918776] mt-4">
          {isManipulating
            ? (toolMode === "fold" ? "📐 Modulating 3D Fold Curvature..." : "🪓 Burnishing Crease Caliper...")
            : "Drag vertically to fold the paper in 3D space · Switch tool to burnish caliper"}
        </p>

        {/* Minimalist Substrate Bone-Folder Dock */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 bg-[#e3ded0]/80 border border-[#d4cebe] px-8 py-3 rounded-full backdrop-blur z-20 font-mono text-xs">
          <div className="flex items-center gap-3">
            <label htmlFor={foldId} className="text-[10px] text-[#7c7566] uppercase font-bold tracking-wider">Crease Angle (θ)</label>
            <input
              id={foldId}
              type="range"
              min="0"
              max="160"
              value={foldAngle}
              onChange={(e) => setFoldAngle(Number(e.target.value))}
              className="w-32 accent-[#1b1916] cursor-pointer"
            />
            <span className="font-bold text-[#1b1916] w-10">{foldAngle.toFixed(0)}°</span>
          </div>

          <div className="h-4 w-px bg-[#beb5a1]" />

          <div className="flex items-center gap-3">
            <label htmlFor={caliperId} className="text-[10px] text-[#7c7566] uppercase font-bold tracking-wider">Caliper (gsm)</label>
            <input
              id={caliperId}
              type="range"
              min="120"
              max="450"
              value={paperCaliper}
              onChange={(e) => setPaperCaliper(Number(e.target.value))}
              className="w-24 accent-[#1b1916] cursor-pointer"
            />
            <span className="font-bold text-[#1b1916] w-12">{paperCaliper}gsm</span>
          </div>

          <div className="h-4 w-px bg-[#beb5a1]" />

          <button
            onClick={() => setRidgeMode(ridgeMode === "mountain" ? "valley" : "mountain")}
            className="px-3 py-1 rounded text-[10px] uppercase font-bold border border-[#beb5a1] hover:border-[#1b1916] transition-colors"
          >
            Ridge: {ridgeMode}
          </button>

          <button
            onClick={() => setToolMode(toolMode === "fold" ? "burnish" : "fold")}
            className={`px-3 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${
              toolMode === "burnish" ? "border-[#c99738] bg-[#c99738] text-white" : "border-[#beb5a1] hover:border-[#1b1916]"
            }`}
          >
            Tool: {toolMode}
          </button>

          <div className="h-4 w-px bg-[#beb5a1]" />

          <div className="flex items-center gap-2">
            {CREASE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setFoldAngle(p.angle)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all border ${
                  Math.abs(foldAngle - p.angle) < 8
                    ? "border-[#1b1916] bg-[#1b1916] text-[#f6f4ec]"
                    : "border-[#beb5a1] bg-transparent text-[#7c7566] hover:text-[#1b1916]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bauhaus Colophon */}
      <footer className="border-t border-[#d4cebe] pt-4 flex flex-wrap justify-between items-center text-[11px] font-mono text-[#7c7566] z-20">
        <div>JOSEF ALBERS PAPER FOLDING · KENYA HARA WHITE CREASE · ELASTOPLASTIC FRACTURE MECHANICS</div>
        <div className="tracking-wider">CHAPTER VI: TECTONIC PAPER CREASING & TENSILE FRACTURE</div>
      </footer>
    </main>
  );
}
