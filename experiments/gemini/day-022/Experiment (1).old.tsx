import React, { useState } from "react";

export default function MicroInteractionExperiment() {
  const [toggle, setToggle] = useState<boolean>(false);
  const [sliderVal, setSliderVal] = useState<number>(50);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] p-8 md:p-16 font-sans select-none flex flex-col justify-between">
      <header className="border-b border-black/10 pb-4 flex justify-between items-center">
        <div>
          <span className="font-mono text-xs text-indigo-600 uppercase tracking-widest">TACTILE PHYSICS · DAY 022 · 2026-09-23</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">SPRING MECHANICS</h1>
        </div>
        <div className="font-mono text-xs text-black/50">HOOKEAN DAMPING RATIO: 0.72</div>
      </header>

      <main className="my-auto py-12 max-w-xl mx-auto w-full space-y-10">
        {/* Tactile Toggle Switch */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Physical Switch</h3>
            <p className="text-xs text-black/50">Spring-loaded bi-stable toggle mechanism</p>
          </div>
          <button
            onClick={() => setToggle(!toggle)}
            className={`w-16 h-9 rounded-full p-1 transition-colors duration-300 ${toggle ? "bg-indigo-600" : "bg-gray-300"}`}
          >
            <div className={`w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 ease-out transform ${toggle ? "translate-x-7 scale-105" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Rubber-Band Spring Slider */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Tension Slider</h3>
            <span className="font-mono text-xs font-bold text-indigo-600">{sliderVal}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </main>

      <footer className="border-t border-black/10 pt-4 flex justify-between font-mono text-xs text-black/40">
        <span>SPRING PHYSICS COMPONENT SUITE</span>
        <span>VELOCITY MOMENTUM SNAP</span>
      </footer>
    </div>
  );
}
