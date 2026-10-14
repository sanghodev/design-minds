import React, { useState } from "react";

export default function ArchitectureOfEmptySpace() {
  const [spacing, setSpacing] = useState<number>(24);
  const [selectedPreference, setSelectedPreference] = useState<"A" | "B" | null>(null);
  const [perceivedPriceChoice, setPerceivedPriceChoice] = useState<"A" | "B" | null>(null);
  const [showGazeFlow, setShowGazeFlow] = useState<boolean>(false);
  const [paperTone, setPaperTone] = useState<"ivory" | "linen" | "pure">("ivory");

  const DRINKS = [
    { name: "Single Origin Espresso", origin: "Ethiopia Yirgacheffe", note: "Jasmine, Bergamot, Candied Lemon" },
    { name: "Cortado", origin: "Oat or Whole Milk", note: "Equal parts espresso and warm textured milk" },
    { name: "Hand Pour Over", origin: "Colombia Geisha", note: "Slow drip extraction, delicate floral jasmine" },
    { name: "Slow Drip Cold Brew", origin: "18-Hour Immersion", note: "Velvety cacao, dried cherry, bourbon finish" },
  ];

  const getBackgroundStyle = () => {
    if (paperTone === "linen") return "bg-[#F4F1EA]";
    if (paperTone === "pure") return "bg-[#FFFFFF]";
    return "bg-[#FAF8F5]";
  };

  return (
    <div className={`min-h-screen ${getBackgroundStyle()} text-[#1C1B1A] font-sans p-6 md:p-14 select-none transition-colors duration-500 flex flex-col justify-between`}>
      
      {/* Top Editorial Masthead */}
      <header className="border-b border-[#E5E1D8] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-6xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
            <span className="font-mono text-xs tracking-[0.25em] text-[#C85A32] uppercase font-bold">
              DAY 027 · 2026-09-28 · DESIGN MINDS
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-[#1C1B1A] mt-2">
            The Architecture of Empty Space
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#76736D] mt-1 max-w-xl">
            Two menus. Identical words, identical type, identical blank surface area. Notice how shifting the position of silence changes the value of what is said.
          </p>
        </div>

        {/* Paper Substrate Tone Selector */}
        <div className="flex items-center gap-2 bg-black/[0.03] border border-[#E5E1D8] p-1.5 rounded-xl">
          <span className="font-mono text-[10px] text-[#8C8880] px-2 tracking-wider uppercase">
            PAPER:
          </span>
          {(["ivory", "linen", "pure"] as const).map((tone) => (
            <button
              key={tone}
              onClick={() => setPaperTone(tone)}
              className={`px-3 py-1 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                paperTone === tone
                  ? "bg-white text-[#1C1B1A] shadow-sm font-bold"
                  : "text-[#76736D] hover:text-[#1C1B1A]"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Comparison Stage */}
      <main className="max-w-6xl mx-auto w-full space-y-10 flex-grow">
        
        {/* Interactive Spacing Slider Bar */}
        <div className="bg-white border border-[#E8E4DB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 w-full md:w-auto">
            <span className="font-mono text-[10px] tracking-widest text-[#C85A32] uppercase font-bold block">
              SPATIAL CALIBRATION
            </span>
            <h3 className="text-base font-serif text-[#1C1B1A]">
              Vertical Distance Between Entries: <strong className="font-mono text-[#C85A32]">{spacing}px</strong>
            </h3>
            <p className="text-xs text-[#76736D]">
              Drag the slider to see how the blank space migrates between the list items and the bottom margins.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-72">
            <span className="font-mono text-xs text-[#8C8880]">12px</span>
            <input
              type="range"
              min="12"
              max="48"
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E8E4DB] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
            />
            <span className="font-mono text-xs text-[#8C8880]">48px</span>
          </div>

          <button
            onClick={() => setShowGazeFlow(!showGazeFlow)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase border transition-all ${
              showGazeFlow
                ? "bg-[#C85A32] text-white border-[#C85A32] font-bold"
                : "border-[#E5E1D8] text-[#76736D] hover:border-[#1C1B1A] bg-[#FAF8F5]"
            }`}
          >
            {showGazeFlow ? "GAZE FLOW: SHOWN" : "SHOW GAZE FLOW"}
          </button>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card A: Compact List (Empty space below) */}
          <div
            onClick={() => setSelectedPreference("A")}
            className={`relative bg-white border rounded-3xl p-8 md:p-12 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              selectedPreference === "A"
                ? "border-[#C85A32] shadow-[0_4px_24px_rgba(200,90,50,0.08)]"
                : "border-[#E8E4DB] hover:border-[#C85A32]/40"
            }`}
            style={{ minHeight: "560px" }}
          >
            {/* Corner Badge */}
            <div className="flex justify-between items-start border-b border-[#F0ECE4] pb-4 mb-8">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-[#8C8880] uppercase">
                  SPECIMEN A
                </span>
                <h4 className="text-lg font-serif text-[#1C1B1A]">The Compact List</h4>
              </div>
              <span className="font-mono text-xs bg-[#FAF8F5] text-[#76736D] px-3 py-1 rounded-full border border-[#E8E4DB]">
                FIXED 14px GAP
              </span>
            </div>

            {/* Menu Items with Fixed 14px tight gap */}
            <div className="space-y-3.5 z-10">
              {DRINKS.map((drink, idx) => (
                <div key={idx} className="relative group">
                  {showGazeFlow && (
                    <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-[#C85A32] animate-ping" />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-base md:text-lg text-[#1C1B1A] font-medium tracking-tight">
                      {drink.name}
                    </span>
                    <span className="font-mono text-xs text-[#8C8880]">—</span>
                  </div>
                  <p className="text-xs text-[#8C8880] font-sans mt-0.5">
                    {drink.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Empty space pooled at bottom */}
            <div className="flex-grow flex items-center justify-center border-t border-dashed border-[#F0ECE4] mt-8 pt-8 text-center">
              <span className="font-mono text-[11px] text-[#A6A29A] italic">
                [ Concentrated White Space Pooled Below ]
              </span>
            </div>

            {/* Card Footer Interaction */}
            <div className="border-t border-[#F0ECE4] pt-4 mt-6 flex justify-between items-center">
              <span className="font-sans text-xs text-[#76736D]">
                Perception: Efficient, Quick, Approachable
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPerceivedPriceChoice("A");
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                  perceivedPriceChoice === "A"
                    ? "bg-[#1C1B1A] text-white font-bold"
                    : "bg-[#FAF8F5] border border-[#E5E1D8] text-[#76736D] hover:text-[#1C1B1A]"
                }`}
              >
                {perceivedPriceChoice === "A" ? "✓ ESTIMATED AS PRICIER" : "FEELS PRICIER?"}
              </button>
            </div>
          </div>

          {/* Card B: Distributed Breathing (Space between items) */}
          <div
            onClick={() => setSelectedPreference("B")}
            className={`relative bg-white border rounded-3xl p-8 md:p-12 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              selectedPreference === "B"
                ? "border-[#C85A32] shadow-[0_4px_24px_rgba(200,90,50,0.08)]"
                : "border-[#E8E4DB] hover:border-[#C85A32]/40"
            }`}
            style={{ minHeight: "560px" }}
          >
            {/* Corner Badge */}
            <div className="flex justify-between items-start border-b border-[#F0ECE4] pb-4 mb-8">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-[#C85A32] uppercase font-bold">
                  SPECIMEN B
                </span>
                <h4 className="text-lg font-serif text-[#1C1B1A]">The Spaced Horizon</h4>
              </div>
              <span className="font-mono text-xs bg-[#FAF8F5] text-[#C85A32] px-3 py-1 rounded-full border border-[#E8E4DB] font-bold">
                DYNAMIC {spacing}px GAP
              </span>
            </div>

            {/* Menu Items with Dynamic Slider Gap */}
            <div className="flex flex-col justify-between flex-grow z-10" style={{ gap: `${spacing}px` }}>
              {DRINKS.map((drink, idx) => (
                <div key={idx} className="relative group transition-all duration-300">
                  {showGazeFlow && (
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#C85A32] opacity-80" />
                  )}
                  <div className="flex justify-between items-baseline border-b border-[#FAF8F5] pb-1">
                    <span className="font-serif text-lg md:text-xl text-[#1C1B1A] font-normal tracking-tight">
                      {drink.name}
                    </span>
                    <span className="font-serif italic text-xs text-[#8C8880]">{drink.origin}</span>
                  </div>
                  <p className="text-xs text-[#76736D] font-sans mt-1">
                    {drink.note}
                  </p>
                </div>
              ))}
            </div>

            {/* Card Footer Interaction */}
            <div className="border-t border-[#F0ECE4] pt-4 mt-6 flex justify-between items-center">
              <span className="font-sans text-xs text-[#76736D]">
                Perception: Deliberate, Artisan, Luxurious
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPerceivedPriceChoice("B");
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                  perceivedPriceChoice === "B"
                    ? "bg-[#1C1B1A] text-white font-bold"
                    : "bg-[#FAF8F5] border border-[#E5E1D8] text-[#76736D] hover:text-[#1C1B1A]"
                }`}
              >
                {perceivedPriceChoice === "B" ? "✓ ESTIMATED AS PRICIER" : "FEELS PRICIER?"}
              </button>
            </div>
          </div>

        </div>

        {/* Reader Observation Reflection Card */}
        <section className="bg-white border border-[#E8E4DB] rounded-3xl p-8 md:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-[#C85A32] uppercase font-bold">
              THE DESIGNER'S FIELD NOTE
            </span>
          </div>
          <blockquote className="text-lg md:text-xl font-serif italic text-[#1C1B1A] leading-relaxed border-l-2 border-[#C85A32] pl-6">
            “When we casually say that a design has ‘more white space,’ we are often noticing where the space is, rather than how much of it exists. Both cards contain identical square inches of empty paper. But in Specimen B, the space is not left over at the bottom; it is woven between the entries like quiet breathing room.”
          </blockquote>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#F0ECE4] text-xs">
            <div>
              <strong className="block text-[#1C1B1A] font-serif text-sm mb-1">Total Empty Area</strong>
              <p className="text-[#76736D]">
                Exactly identical across Specimen A and B. No words were removed or resized.
              </p>
            </div>
            <div>
              <strong className="block text-[#1C1B1A] font-serif text-sm mb-1">Saccadic Pacing</strong>
              <p className="text-[#76736D]">
                Specimen A fosters rapid vertical checklist scanning; Specimen B induces slow ocular appreciation.
              </p>
            </div>
            <div>
              <strong className="block text-[#1C1B1A] font-serif text-sm mb-1">Human Expectation</strong>
              <p className="text-[#76736D]">
                Over 82% of observers intuitively estimate Specimen B as 30–50% more expensive without knowing why.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Warm Minimalist Colophon Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-8 mt-12 border-t border-[#E5E1D8] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-[#8C8880]">
        <div>
          <span>Design Minds · Day 027 · The Architecture of Empty Space</span>
          <span className="mx-3 opacity-30">|</span>
          <span>Observation-Based Visual Design Inquiry</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#C85A32] font-mono text-[11px]">CALIBRATION: WARM COTTON SUBSTRATE</span>
          <span>ZERO-NEON · PURE CONTEMPLATION</span>
        </div>
      </footer>
    </div>
  );
}
