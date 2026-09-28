import React, { useState } from "react";

export default function GravitationalLensingExperiment() {
  const [singularityPos, setSingularityPos] = useState({ x: 300, y: 220 });
  const [mass, setMass] = useState<number>(45);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSingularityPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const TEXT_BLOCKS = [
    "OBJECTIVE REALITY IS NOT IMMUTABLE.",
    "MASSIVE IDEOLOGY BENDS THE GEODESICS OF TRUTH.",
    "RECTILINEAR COLUMNS WARP INTO EINSTEIN RINGS.",
    "ACROSS THE HORIZON, ALL LANGUAGE DISSOLVES INTO SILENCE."
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#07070A] text-[#F0F0F2] select-none overflow-hidden font-sans flex flex-col justify-between p-8 md:p-16"
    >
      <header className="relative z-10 flex justify-between items-start border-b border-white/10 pb-4">
        <div>
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">
            DAY 013 · RELATIVISTIC GRAVITATIONAL LENSING
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">EINSTEIN SINGULARITY</h1>
        </div>

        <div className="flex gap-4 items-center font-mono text-xs bg-black/60 border border-white/10 p-3 rounded-xl backdrop-blur-md">
          <span>SINGULARITY MASS:</span>
          <input
            type="range"
            min="20"
            max="90"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="accent-amber-400 cursor-pointer w-24"
          />
          <span className="font-bold text-amber-400">{mass} M☉</span>
        </div>
      </header>

      {/* Spacetime Grid & Warped Lensing Canvas */}
      <main className="relative my-auto h-[480px] flex items-center justify-center overflow-hidden">
        {/* Rectilinear Background Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl text-xs font-mono opacity-40 leading-relaxed pointer-events-none">
          {TEXT_BLOCKS.map((t, idx) => (
            <div key={idx} className="border-l border-white/20 pl-4 space-y-2">
              <div className="text-amber-400 font-bold">COLUMN 0{idx+1}</div>
              <p>{t}</p>
              <p>Geodesic curvature alpha = 4GM / c^2 b. Deflection increases inversely with impact parameter b.</p>
            </div>
          ))}
        </div>

        {/* Lensing Singularity Cursor Avatar */}
        <div
          className="absolute pointer-events-none rounded-full border border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-all duration-75 flex items-center justify-center"
          style={{
            left: `${singularityPos.x}px`,
            top: `${singularityPos.y}px`,
            width: `${mass * 2.8}px`,
            height: `${mass * 2.8}px`,
            transform: "translate(-50%, -50%)",
            backdropFilter: "invert(90%) hue-rotate(180deg) blur(2px)"
          }}
        >
          {/* Black Hole Event Horizon */}
          <div
            className="rounded-full bg-black border border-white/30"
            style={{ width: `${mass * 0.8}px`, height: `${mass * 0.8}px` }}
          />
        </div>
      </main>

      <footer className="relative z-10 flex justify-between font-mono text-xs border-t border-white/10 pt-4 text-white/40">
        <span>CURVATURE: α = 4GM/c²b · EINSTEIN RADIUS LOCKED</span>
        <span>DRAG SINGULARITY TO BEND EDITORIAL GRID</span>
      </footer>
    </div>
  );
}
