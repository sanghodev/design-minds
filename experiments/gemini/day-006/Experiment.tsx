"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TectonicCreasingExperiment() {
  const [foldAngle, setFoldAngle] = useState<number>(75);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Beam bending tensile strain sigma = E * (t / 2R)
  const curvatureR = Math.max(0.8, 16 - (foldAngle / 160) * 15);
  const tensileStress = Math.min(100, Math.round((1.2 / curvatureR) * 25));
  const isYieldExceeded = tensileStress > 38;
  const fractureGapMm = isYieldExceeded ? ((tensileStress - 38) / 62) * 5.2 : 0;

  const halfAngle = foldAngle / 2;
  const castShadow = Math.sin((foldAngle * Math.PI) / 180) * 45;

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setFoldAngle((prev) => Math.min(160, Math.max(0, prev + e.movementY * 0.75)));
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#e8e5dc] text-[#1c1a17] select-none touch-none cursor-ns-resize font-serif relative flex flex-col justify-between p-8 sm:p-14"
      style={{
        backgroundImage: `
          radial-gradient(#d4cfc0 0.8px, transparent 0.8px),
          radial-gradient(#ded9cb 0.8px, #e8e5dc 0.8px)
        `,
        backgroundSize: "28px 28px, 14px 14px"
      }}
    >
      {/* Bauhaus Workshop Watermark */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="font-mono text-xs text-[#7c7566] hover:text-[#1c1a17] uppercase tracking-widest transition-colors font-semibold block"
        >
          ← DM-006 // PAPER CREASING
        </Link>
        <span className="font-mono text-[10px] text-[#9c9382] uppercase tracking-wider block mt-1">
          Josef Albers Bauhaus Paper Folding Vorkurs
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 text-right font-mono text-xs text-[#7c7566] pointer-events-none">
        <div>CREASE ANGLE: <strong className="text-[#1c1a17]">{foldAngle.toFixed(0)}°</strong></div>
        <div className="text-[10px] text-[#9c9382] mt-0.5">
          TENSILE STRESS: <strong className={isYieldExceeded ? "text-amber-800 font-bold" : "text-[#1c1a17]"}>{tensileStress}%</strong>
        </div>
      </div>

      {/* 3D Folded Broadside Paper Leaf Assembly (The Entire Viewport) */}
      <div className="flex-1 flex justify-center items-center my-auto relative z-10 perspective-[1600px] w-full max-w-5xl mx-auto">
        
        {/* Left Paper Leaf */}
        <div
          className="w-1/2 p-10 sm:p-16 bg-[#faf8f2] border border-[#d2ccbc] origin-right transition-transform duration-75 ease-out relative"
          style={{
            transform: `rotateY(${halfAngle * 0.75}deg)`,
            boxShadow: `${-castShadow * 0.4}px ${castShadow * 0.25}px ${castShadow * 0.75}px rgba(0,0,0,0.14)`
          }}
        >
          <div className="text-right">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#9e9686] block mb-3">FLANK ALPHA</span>
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif uppercase tracking-tight text-[#161513] font-bold">
              TECTONIC
            </h1>
          </div>
        </div>

        {/* Central Mechanical Crease Fracture Apex */}
        <div className="relative h-full z-20 flex flex-col items-center justify-center">
          <div
            className="transition-all duration-75 relative"
            style={{
              width: `${Math.max(2, fractureGapMm * 2.5)}px`,
              height: "260px",
              backgroundColor: isYieldExceeded ? "#ffffff" : "#c4bca9",
              boxShadow: isYieldExceeded ? "0 0 12px rgba(255,255,255,0.95), 0 0 3px #c99738" : "none"
            }}
          >
            {isYieldExceeded && (
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
          className="w-1/2 p-10 sm:p-16 bg-[#faf8f2] border border-[#d2ccbc] origin-left transition-transform duration-75 ease-out relative"
          style={{
            transform: `rotateY(${-halfAngle * 0.75}deg)`,
            boxShadow: `${castShadow * 0.4}px ${castShadow * 0.25}px ${castShadow * 0.75}px rgba(0,0,0,0.14)`
          }}
        >
          <div className="text-left">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#9e9686] block mb-3">FLANK BETA</span>
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif uppercase tracking-tight text-[#161513] font-bold">
              CREASING
            </h1>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#8a8070] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        CLICK &amp; DRAG VERTICALLY TO PHYSICALLY FOLD THE 300GSM COTTON BROADSHEET. BEYOND 70°, TENSILE STRAIN SURPASSES THE PLASTIC YIELD LIMIT, FRACTURING INK TO BARE RAW CELLULOSE PULP.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#9c9382] pointer-events-none text-right">
        <span>KENYA HARA WHITE PAPER EMPTINESS · BEAM BENDING MECHANICAL STRAIN</span>
      </div>
    </div>
  );
}
