import React, { useState, useMemo, useRef, useEffect } from "react";

export default function HalftoneMoireExperiment() {
  // --- Prepress Screen State ---
  const [screenAngleA, setScreenAngleA] = useState<number>(15.0); // Cyan base 15°
  const [screenAngleB, setScreenAngleB] = useState<number>(45.0); // Black/Magenta 45°
  const [screenLPI, setScreenLPI] = useState<number>(36); // Lines Per Inch (Coarse for visual clarity: 20-80)
  const [screenType, setScreenType] = useState<"dots" | "lines">("dots");
  const [activeMode, setActiveMode] = useState<"rosette" | "gerstner" | "loupe" | "dotgain">("rosette");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [offsetPos, setOffsetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 260, y: 240 });
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [dotGain, setDotGain] = useState<number>(15); // % dot gain (0 to 40)

  // Drag interaction for screen offset
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...offsetPos };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLoupeActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      setLoupePos({
        x: Math.max(50, Math.min(rect.width - 50, e.clientX - rect.left)),
        y: Math.max(50, Math.min(rect.height - 50, e.clientY - rect.top))
      });
    }
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffsetPos({
      x: initialOffsetRef.current.x + dx,
      y: initialOffsetRef.current.y + dy
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Optical Calculations
  const { deltaAngle, moireWavelength, isRosette, isSevereMoire, integrationDist } = useMemo(() => {
    // Delta angle normalized between 0° and 90°
    let delta = Math.abs(screenAngleB - screenAngleA) % 90;
    if (delta > 45) delta = 90 - delta;

    // Pitch in pixels approx (based on LPI, 72 dpi base)
    const pitch = Math.max(6, 720 / screenLPI);
    const radDelta = Math.max(0.005, (delta * Math.PI) / 180);
    
    // Moiré wavelength formula: lambda = d / (2 * sin(delta / 2))
    const wavelength = pitch / (2.0 * Math.sin(radDelta / 2.0));

    // Ideal rosette is at 30° separation
    const rosette = Math.abs(delta - 30.0) < 1.5;
    // Severe moiré when delta is between 1° and 6°
    const severe = delta > 0.5 && delta < 6.5;

    // Viewing distance where dots integrate into continuous tone (Rayleigh eye limit ~1 arcminute)
    const intDistCm = Math.round((pitch * 0.035) / 0.00029 / 10);

    return {
      deltaAngle: delta.toFixed(1),
      moireWavelength: Math.min(350, Math.round(wavelength)),
      isRosette: rosette,
      isSevereMoire: severe,
      integrationDist: Math.max(25, intDistCm)
    };
  }, [screenAngleA, screenAngleB, screenLPI]);

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#111111] font-sans selection:bg-[#e11d48]/20 selection:text-[#111111] overflow-x-hidden">
      {/* Swiss Prepress Masthead */}
      <header className="border-b border-[#dedbd3] bg-[#ffffff]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#111111] bg-[#111111] flex items-center justify-center font-mono text-[#ffffff] font-bold text-sm tracking-widest">
            21
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] font-mono text-[#e11d48] uppercase font-semibold">Design Minds · Chapter XXI</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#111111]/30 bg-[#f4f4f0] text-[#111111] font-mono">SWISS PREPRESS LITHOGRAPHY</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#111111]">
              The Moiré Rosette &amp; Halftone Screen Interference
            </h1>
          </div>
        </div>

        {/* Mode Selector Deck */}
        <div className="flex items-center bg-[#f4f4f0] border border-[#dedbd3] p-1 gap-1">
          <button
            onClick={() => { setActiveMode("rosette"); setScreenAngleA(15); setScreenAngleB(45); }}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "rosette"
                ? "bg-[#111111] text-[#ffffff] font-semibold shadow"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            🌸 ROSETTE (30°)
          </button>
          <button
            onClick={() => { setActiveMode("gerstner"); setScreenType("lines"); setScreenAngleA(0); setScreenAngleB(4); }}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "gerstner"
                ? "bg-[#111111] text-[#ffffff] font-semibold shadow"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            ⚡ GERSTNER KINETIC
          </button>
          <button
            onClick={() => { setActiveMode("loupe"); setIsLoupeActive(true); }}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "loupe"
                ? "bg-[#111111] text-[#ffffff] font-semibold shadow"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            🔍 10× LOUPE INSPECT
          </button>
          <button
            onClick={() => setActiveMode("dotgain")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "dotgain"
                ? "bg-[#111111] text-[#ffffff] font-semibold shadow"
                : "text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            💧 PRESS DOT GAIN
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Prepress Optical Light Table (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border border-[#dedbd3] bg-[#ffffff] p-5 shadow-sm relative">
            
            {/* Light Table Status Bar */}
            <div className="flex items-center justify-between border-b border-[#eceae4] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRosette ? "bg-[#10b981]" : isSevereMoire ? "bg-[#e11d48] animate-ping" : "bg-[#f59e0b]"}`}></span>
                <span className="text-xs font-mono text-[#111111] tracking-wider uppercase font-semibold">
                  PREPRESS DRAFTING BED · Δθ = {deltaAngle}°
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[#6b7280]">
                  PATTERN: <strong className={isRosette ? "text-[#10b981]" : isSevereMoire ? "text-[#e11d48]" : "text-[#111111]"}>
                    {isRosette ? "CLOSED ROSETTE" : isSevereMoire ? "CATASTROPHIC MOIRÉ" : "CROSSHATCH BEAT"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Interactive Canvas Bed */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full aspect-square max-h-[520px] mx-auto bg-[#ffffff] border border-[#dedbd3] relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: `radial-gradient(#dedbd3 1px, transparent 1px)`,
                backgroundSize: "20px 20px"
              }}
            >
              {/* Corner Prepress Registration Crosshairs */}
              <div className="absolute top-2 left-2 pointer-events-none opacity-40 font-mono text-[9px] text-[#111111]">
                ✛ REG_01
              </div>
              <div className="absolute top-2 right-2 pointer-events-none opacity-40 font-mono text-[9px] text-[#111111]">
                ✛ REG_02
              </div>
              <div className="absolute bottom-2 left-2 pointer-events-none opacity-40 font-mono text-[9px] text-[#111111]">
                ✛ REG_03
              </div>
              <div className="absolute bottom-2 right-2 pointer-events-none opacity-40 font-mono text-[9px] text-[#111111]">
                ✛ REG_04
              </div>

              {/* Background Headline Typography (For Karl Gerstner Mode) */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ opacity: activeMode === "gerstner" ? 0.95 : 0.15 }}
              >
                <span className="font-sans font-black text-6xl sm:text-7xl tracking-tighter text-[#18181b]">
                  PROGRAMME
                </span>
                <span className="font-mono text-xs tracking-widest text-[#e11d48] uppercase mt-2 font-bold">
                  KARL GERSTNER · 1964
                </span>
              </div>

              {/* SVG Overlapping Halftone Screen Simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  {/* Screen A Pattern (Cyan / 15°) */}
                  <pattern
                    id="screenA"
                    width={720 / screenLPI}
                    height={720 / screenLPI}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`rotate(${screenAngleA})`}
                  >
                    {screenType === "dots" ? (
                      <circle
                        cx={360 / screenLPI}
                        cy={360 / screenLPI}
                        r={(360 / screenLPI) * (0.35 + dotGain * 0.005)}
                        fill="#06b6d4"
                        fillOpacity="0.75"
                      />
                    ) : (
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={720 / screenLPI}
                        stroke="#06b6d4"
                        strokeWidth={(720 / screenLPI) * 0.45}
                        strokeOpacity="0.75"
                      />
                    )}
                  </pattern>

                  {/* Screen B Pattern (Magenta/Black / 45° or custom) */}
                  <pattern
                    id="screenB"
                    width={720 / screenLPI}
                    height={720 / screenLPI}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`rotate(${screenAngleB}) translate(${offsetPos.x % 100}, ${offsetPos.y % 100})`}
                  >
                    {screenType === "dots" ? (
                      <circle
                        cx={360 / screenLPI}
                        cy={360 / screenLPI}
                        r={(360 / screenLPI) * (0.35 + dotGain * 0.005)}
                        fill={activeMode === "gerstner" ? "#e11d48" : "#ec4899"}
                        fillOpacity="0.75"
                      />
                    ) : (
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={720 / screenLPI}
                        stroke={activeMode === "gerstner" ? "#e11d48" : "#18181b"}
                        strokeWidth={(720 / screenLPI) * 0.45}
                        strokeOpacity="0.75"
                      />
                    )}
                  </pattern>
                </defs>

                {/* Overlapping Multi-Plate Rectangles with Multiply Blend Mode */}
                <rect width="100%" height="100%" fill="url(#screenA)" style={{ mixBlendMode: "multiply" }} />
                <rect width="100%" height="100%" fill="url(#screenB)" style={{ mixBlendMode: "multiply" }} />
              </svg>

              {/* 10x Prepress Magnification Loupe Overlay */}
              {isLoupeActive && (
                <div
                  className="absolute pointer-events-none rounded-full border-4 border-[#111111] shadow-2xl overflow-hidden bg-white/95"
                  style={{
                    width: 170,
                    height: 170,
                    left: loupePos.x - 85,
                    top: loupePos.y - 85,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.35), inset 0 0 15px rgba(0,0,0,0.15)"
                  }}
                >
                  {/* Magnified Retina Graphics */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: "scale(2.8)",
                      transformOrigin: "center center"
                    }}
                  >
                    <svg className="w-full h-full">
                      <rect width="100%" height="100%" fill="url(#screenA)" style={{ mixBlendMode: "multiply" }} />
                      <rect width="100%" height="100%" fill="url(#screenB)" style={{ mixBlendMode: "multiply" }} />
                    </svg>
                  </div>
                  {/* Loupe Reticle Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-[#e11d48]/40"></div>
                    <div className="h-full w-[1px] bg-[#e11d48]/40 absolute"></div>
                    <div className="w-10 h-10 border border-[#e11d48]/50 rounded-full absolute"></div>
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] text-[#111111] bg-white/80 py-0.5 font-bold">
                    10× LINEN TESTER
                  </div>
                </div>
              )}

              {/* Instruction Hint */}
              <div className="absolute bottom-3 left-4 bg-white/90 border border-[#dedbd3] px-2.5 py-1 text-[10px] font-mono text-[#6b7280]">
                DRAG TO TRANSLATE SCREEN B · ROTATE SLIDERS TO FORM ROSETTES
              </div>
            </div>

            {/* Interactive Control Deck */}
            <div className="mt-5 pt-4 border-t border-[#eceae4] flex flex-col gap-4">
              
              {/* Dual Angle Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#6b7280]">SCREEN A ANGLE (CYAN):</span>
                    <span className="font-bold text-[#06b6d4]">{screenAngleA.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="0.5"
                    value={screenAngleA}
                    onChange={(e) => setScreenAngleA(parseFloat(e.target.value))}
                    className="w-full accent-[#06b6d4] cursor-pointer h-1.5 bg-[#e5e7eb]"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#9ca3af]">
                    <span>0°</span>
                    <span>15° (STANDARD)</span>
                    <span>90°</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#6b7280]">SCREEN B ANGLE (MAGENTA/K):</span>
                    <span className={`font-bold ${isRosette ? "text-[#10b981]" : isSevereMoire ? "text-[#e11d48]" : "text-[#111111]"}`}>
                      {screenAngleB.toFixed(1)}° (Δ = {deltaAngle}°)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="0.5"
                    value={screenAngleB}
                    onChange={(e) => setScreenAngleB(parseFloat(e.target.value))}
                    className={`w-full cursor-pointer h-1.5 bg-[#e5e7eb] ${isRosette ? "accent-[#10b981]" : isSevereMoire ? "accent-[#e11d48]" : "accent-[#111111]"}`}
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#9ca3af]">
                    <span>0° (CLASH)</span>
                    <span className="text-[#10b981] font-bold">45° (ROSETTE +30°)</span>
                    <span>90°</span>
                  </div>
                </div>
              </div>

              {/* Secondary Controls: LPI Ruling & Screen Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#6b7280]">SCREEN RULING (LPI):</span>
                    <span className="font-bold text-[#111111]">{screenLPI} LINES / INCH</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="65"
                    step="1"
                    value={screenLPI}
                    onChange={(e) => setScreenLPI(parseInt(e.target.value))}
                    className="w-full accent-[#111111] cursor-pointer h-1.5 bg-[#e5e7eb]"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#9ca3af]">
                    <span>20 LPI (COARSE POSTER)</span>
                    <span>65 LPI (NEWSPAPER)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScreenType("dots")}
                      className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                        screenType === "dots"
                          ? "bg-[#111111] text-[#ffffff] border-[#111111]"
                          : "bg-white text-[#6b7280] border-[#dedbd3] hover:text-[#111111]"
                      }`}
                    >
                      ● AM DOTS
                    </button>
                    <button
                      onClick={() => setScreenType("lines")}
                      className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                        screenType === "lines"
                          ? "bg-[#111111] text-[#ffffff] border-[#111111]"
                          : "bg-white text-[#6b7280] border-[#dedbd3] hover:text-[#111111]"
                      }`}
                    >
                      || LINE SCREEN
                    </button>
                  </div>

                  <button
                    onClick={() => setIsLoupeActive(!isLoupeActive)}
                    className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                      isLoupeActive
                        ? "bg-[#e11d48] text-[#ffffff] border-[#e11d48]"
                        : "bg-white text-[#111111] border-[#dedbd3] hover:border-[#111111]"
                    }`}
                  >
                    {isLoupeActive ? "CLOSE LOUPE" : "OPEN 10× LOUPE"}
                  </button>
                </div>
              </div>

              {/* Prepress Telemetry HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#fcfcfb] border border-[#dedbd3] p-2.5">
                  <div className="text-[10px] font-mono text-[#6b7280]">MOIRÉ WAVELENGTH</div>
                  <div className="text-base font-mono text-[#e11d48] font-bold">λ = {moireWavelength} px</div>
                  <div className="text-[9px] font-mono text-[#9ca3af]">BEAT RIPPLE SPACING</div>
                </div>
                <div className="bg-[#fcfcfb] border border-[#dedbd3] p-2.5">
                  <div className="text-[10px] font-mono text-[#6b7280]">ROSETTE STATUS</div>
                  <div className={`text-base font-mono font-bold ${isRosette ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
                    {isRosette ? "PERFECT (30°)" : `DELTA = ${deltaAngle}°`}
                  </div>
                  <div className="text-[9px] font-mono text-[#9ca3af]">SACRED OFFSET RULE</div>
                </div>
                <div className="bg-[#fcfcfb] border border-[#dedbd3] p-2.5">
                  <div className="text-[10px] font-mono text-[#6b7280]">EYE BLEND DISTANCE</div>
                  <div className="text-base font-mono text-[#2563eb] font-bold">{integrationDist} cm</div>
                  <div className="text-[9px] font-mono text-[#9ca3af]">RETINAL INTEGRATION</div>
                </div>
                <div className="bg-[#fcfcfb] border border-[#dedbd3] p-2.5">
                  <div className="text-[10px] font-mono text-[#6b7280]">PROGRAMME OPTICS</div>
                  <div className="text-base font-mono text-[#111111] font-bold">GERSTNER 1964</div>
                  <div className="text-[9px] font-mono text-[#9ca3af]">KINETIC SWISS TYPE</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Swiss Prepress Monograph Substrate (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div 
            className="border border-[#dedbd3] bg-[#ffffff] text-[#111111] p-7 shadow-sm relative min-h-[580px]"
          >
            {/* Editorial Header */}
            <div className="border-b border-[#111111] pb-4 mb-6 relative">
              <div className="flex justify-between items-baseline text-[11px] font-mono text-[#6b7280] uppercase tracking-widest mb-1 font-semibold">
                <span>SWISS GRAPHICS · FOLIO 021</span>
                <span>BASEL / ZURICH 1964</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#111111] tracking-tight leading-tight">
                The Sacred 30°: From Press Ruin to Optical Art
              </h2>
              <p className="text-xs font-serif italic text-[#e11d48] mt-1 font-medium">
                인쇄공의 가장 끔찍한 악몽은, 디자이너에게 가장 매혹적인 광학 키네틱 춤이 된다.
              </p>
            </div>

            {/* Reading Essay */}
            <div className="space-y-4 font-serif text-[15px] leading-relaxed text-[#27272a] relative">
              <p>
                <span className="float-left text-4xl font-sans font-black leading-none pr-2 pt-1 text-[#111111]">
                  F
                </span>
                or over a century, master lithographers have guarded the secret of the <strong>Halftone Rosette</strong>.
              </p>

              <p>
                When printing four-color process work, each screen must be angled exactly 30 degrees apart: Black at 45°, Magenta at 75°, Cyan at 15°, and Yellow at 0°. Because of this precise geometric separation, microscopic halftone dots cluster into an invisible floral rosette, fusing in the reader's eye into a continuous photograph.
              </p>

              {/* Prepress Technical Callout Box */}
              <div className="my-5 p-4 border-l-2 border-[#e11d48] bg-[#fbfbf9] text-xs font-mono space-y-1">
                <div className="flex justify-between text-[#e11d48] font-bold">
                  <span>[PREPRESS FORMULA · AXIOM 21]</span>
                  <span>Δθ &lt; 4° DANGER</span>
                </div>
                <p className="font-sans text-[#4b5563]">
                  Shift the plate by just 3 degrees: the spatial frequency difference generates a violent Moiré beat wave: λ = d / (2·sin(Δθ/2)). The print job is ruined.
                </p>
              </div>

              <p>
                Yet in 1964, Swiss designer <strong>Karl Gerstner</strong> transformed this disaster into visual poetry. In <em>Designing Programmes</em>, Gerstner proved that overlapping line screens over bold grotesque letterforms create an active, living kinetic typography that ripples and vibrates with the viewer's every movement.
              </p>
            </div>

            {/* Substrate Footer */}
            <div className="mt-8 pt-4 border-t border-[#dedbd3] flex justify-between items-center text-[10px] font-mono text-[#6b7280]">
              <span>COATED ART PAPER 170GSM</span>
              <span>VERIFIED THEMATIC AXIOM 21</span>
            </div>
          </div>

          {/* Quick Technical Specs Box */}
          <div className="border border-[#dedbd3] bg-[#ffffff] p-4 text-xs font-mono space-y-2">
            <div className="text-[#111111] font-bold text-[11px] uppercase tracking-wider">
              SWISS PREPRESS FORMULAS &amp; CITATIONS:
            </div>
            <ul className="text-[#6b7280] space-y-1.5 text-[11px]">
              <li>• <strong className="text-[#111111]">Karl Gerstner (1964)</strong>: Designing Programmes: Programmed Typography, Niggli.</li>
              <li>• <strong className="text-[#111111]">Emil Ruder (1967)</strong>: Typographie: A Manual of Design, Niggli.</li>
              <li>• <strong className="text-[#111111]">Moiré Beat Formula</strong>: λ_moire = d / (2 · sin(Δθ / 2))</li>
            </ul>
          </div>
        </div>

      </main>

      {/* Global Prepress Footer */}
      <footer className="border-t border-[#dedbd3] bg-[#ffffff] px-6 py-6 text-center text-xs font-mono text-[#9ca3af]">
        DESIGN MINDS · DAY 021 EXPERIMENT · GEMINI (NOON MIND) · AUTONOMOUS PREPRESS DISCOVERY
      </footer>
    </div>
  );
}
