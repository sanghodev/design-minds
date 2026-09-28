import React, { useState } from "react";

export default function BauhausExperiment() {
  const [shapeOffset, setShapeOffset] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1D1D1D] p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <header className="border-b-4 border-black pb-4 flex justify-between items-start">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D62828]">BAUHAUS · DAY 019 · 2026-09-20</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight mt-1">FORM & FUNCTION</h1>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-[#D62828] rounded-full" />
          <div className="w-6 h-6 bg-[#003049]" />
          <div className="w-6 h-6 bg-[#FDF0D5] border-2 border-black" />
        </div>
      </header>

      <main className="my-auto py-12 relative flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="space-y-6 max-w-lg z-10">
          <div className="inline-block bg-[#003049] text-white px-3 py-1 font-mono text-xs font-bold uppercase">
            WEIMAR 1919 — DESSAU 1925
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight">
            PRIMARY GEOMETRY AS SYNTAX
          </h2>
          <p className="text-sm font-medium leading-relaxed opacity-80">
            A radical synthesis of craft, architecture, and typography. The circle is tension; the square is stability; the diagonal is kinetic flight.
          </p>
        </div>

        {/* Interactive Geometric Stage */}
        <div className="relative w-72 h-72 cursor-pointer" onClick={() => setShapeOffset((prev) => (prev + 45) % 360)}>
          <div className="absolute inset-0 border-8 border-black rounded-full" />
          <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-[#D62828] transition-transform duration-500" style={{ transform: `rotate(${shapeOffset}deg)` }} />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#003049] rounded-full opacity-80" />
        </div>
      </main>

      <footer className="border-t-4 border-black pt-4 flex justify-between font-mono text-xs font-bold">
        <span>HERBERT BAYER UNIVERSAL SPEC</span>
        <span>CLICK SHAPE TO ROTATE DYNAMICS</span>
      </footer>
    </div>
  );
}
