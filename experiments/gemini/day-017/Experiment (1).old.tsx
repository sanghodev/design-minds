import React, { useState } from "react";

export default function SplitScreenExperiment() {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1C1E] font-serif select-none flex flex-col md:flex-row">
      {/* Left Column: Fixed Monumental Typography */}
      <div className="w-full md:w-5/12 p-8 md:p-16 border-b md:border-b-0 md:border-r border-black/10 flex flex-col justify-between md:h-screen md:sticky md:top-0">
        <div>
          <span className="font-mono text-xs tracking-widest text-[#B5838D] uppercase">EDITORIAL · DAY 017 · 2026-09-18</span>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mt-3 leading-none">
            CHRONICLE <br/><span className="italic font-normal">N° 17</span>
          </h1>
          <p className="font-sans text-xs text-black/60 mt-4 leading-relaxed max-w-sm">
            Asymmetric dual-viewport architecture. The anchored masthead provides spatial gravity while the right spread moves with narrative fluidity.
          </p>
        </div>

        <div className="font-mono text-xs space-y-1 text-black/40">
          <div>CURRENT SECTION: 0{activeStep} / 03</div>
          <div>LAYOUT: ASYMMETRIC 5:7 RATIO</div>
        </div>
      </div>

      {/* Right Column: Scrolling Visual Gallery Spreads */}
      <div className="w-full md:w-7/12 p-8 md:p-16 space-y-16">
        {[
          { num: 1, title: "Monumental Serifs", desc: "High-contrast letterforms inspired by Didot and Bodoni, commanding white space with quiet authority." },
          { num: 2, title: "Negative Tension", desc: "Calculated pauses in typography that allow reader saccades to breathe between intense narrative beats." },
          { num: 3, title: "Catalog Rhythms", desc: "Dual-speed viewing: rapid glance on the headline anchor, slow contemplative reading on the editorial body." }
        ].map((sec) => (
          <div 
            key={sec.num}
            onMouseEnter={() => setActiveStep(sec.num)}
            className="p-8 border border-black/10 bg-white shadow-sm rounded-xl space-y-4 cursor-pointer hover:border-black/30 transition-colors"
          >
            <span className="font-mono text-xs text-[#E5989B]">CHAPTER 0{sec.num}</span>
            <h2 className="text-3xl font-bold tracking-tight">{sec.title}</h2>
            <p className="font-sans text-sm text-black/70 leading-relaxed font-light">{sec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
