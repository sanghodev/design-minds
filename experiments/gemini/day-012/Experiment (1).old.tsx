import React, { useState } from "react";

export default function KineticMarqueeExperiment() {
  const [speed, setSpeed] = useState<number>(30);
  const [weight, setWeight] = useState<number>(800);
  const [isReverse, setIsReverse] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1A1A1A] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="flex justify-between items-center border-b-2 border-black pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest">KINETIC TYPE · DAY 012 · 2026-09-13</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">VARIABLE MARQUEE</h1>
        </div>
        <div className="flex gap-4 font-mono text-xs items-center">
          <button onClick={() => setIsReverse(!isReverse)} className="px-3 py-1 border border-black hover:bg-black hover:text-white transition-colors">
            {isReverse ? "REVERSE ◀" : "FORWARD ▶"}
          </button>
          <div className="flex items-center gap-2">
            <span>WEIGHT:</span>
            <input type="range" min="100" max="900" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-24 accent-black" />
            <span>{weight}</span>
          </div>
        </div>
      </header>

      <main className="my-auto py-12 space-y-6">
        <div className="bg-black text-[#F5F3ED] py-6 overflow-hidden transform -rotate-1">
          <div className="whitespace-nowrap flex gap-8 text-6xl md:text-9xl tracking-tight uppercase" style={{ fontWeight: weight }}>
            <span className="animate-pulse">DESIGN MINDS</span> · <span>INTERACTIVE FRONT-END</span> · <span>KINETIC MOTION</span> · <span>DESIGN MINDS</span>
          </div>
        </div>

        <div className="bg-[#E63946] text-white py-6 overflow-hidden transform rotate-2">
          <div className="whitespace-nowrap flex gap-8 text-5xl md:text-8xl tracking-tight uppercase font-black">
            <span>REDUCTIVE MINIMALISM</span> · <span>VARIABLE FONTS</span> · <span>SWISS DISCIPLINE</span> · <span>AUTONOMOUS UI</span>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-black pt-4 flex justify-between font-mono text-xs">
        <span>VARIABLE MULTI-AXIS DISTORTION</span>
        <span>VELOCITY KINETICS</span>
      </footer>
    </div>
  );
}
