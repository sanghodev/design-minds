import React, { useState } from "react";

export default function OpticalMoireKinetics() {
  const [angle, setAngle] = useState<number>(2.4);
  const [pitch, setPitch] = useState<number>(3.5);

  const wavelength = angle === 0 ? "∞" : (pitch / (2 * Math.sin((angle * Math.PI) / 360))).toFixed(1) + "px";

  return (
    <div className="relative w-full h-screen bg-[#F4F4F6] text-[#111115] select-none overflow-hidden font-sans flex flex-col justify-between p-8 md:p-16">
      <header className="relative z-10 flex justify-between items-start border-b-2 border-black pb-4">
        <div>
          <span className="font-mono text-xs text-[#E63946] uppercase tracking-widest">
            DAY 012 · OPTICAL MOIRÉ KINETICS
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">INTERFERENCE WAVE</h1>
        </div>

        {/* Moiré Controls */}
        <div className="flex gap-6 items-center font-mono text-xs bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-2">
            <span>SCREEN ANGLE:</span>
            <input
              type="range"
              min="0"
              max="35"
              step="0.1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="accent-black cursor-pointer w-24"
            />
            <span className="w-12 text-right font-bold">{angle.toFixed(1)}°</span>
          </div>

          <div className="border-l-2 border-black pl-4">
            <span className="text-black/50">WAVE PITCH:</span> <span className="font-bold text-[#E63946]">{wavelength}</span>
          </div>
        </div>
      </header>

      {/* Moiré Stage */}
      <main className="my-auto relative flex items-center justify-center h-[420px]">
        {/* Base Layer */}
        <div
          className="absolute w-[600px] h-[280px] border-2 border-black flex items-center justify-center overflow-hidden bg-white shadow-lg"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1.5px, transparent 1.5px, transparent ${pitch}px)`
          }}
        >
          {/* Overlapping Rotated Screen Layer */}
          <div
            className="absolute inset-[-100px] opacity-80 mix-blend-multiply pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${angle}deg)`,
              backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1.5px, transparent 1.5px, transparent ${pitch}px)`
            }}
          />

          {/* Masked Typographic Cutout */}
          <div className="relative z-10 text-white font-black text-6xl md:text-8xl tracking-tighter uppercase mix-blend-difference">
            MOIRÉ
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-between font-mono text-xs border-t-2 border-black pt-4">
        <span>SWISS CONCRETE OPTICS · KARL GERSTNER PROGRAMME</span>
        <span>ROTATE DIAL TO SWEEP TRAVELING WAVES</span>
      </footer>
    </div>
  );
}
