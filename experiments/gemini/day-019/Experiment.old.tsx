import React, { useState, useEffect, useMemo } from "react";

// --- Mathematical Helpers for Diaphragmatic Kinematics & Mashrabiya Geometry ---
interface BladeGeometry {
  path: string;
  pivotX: number;
  pivotY: number;
}

// Generates 16 interlocking iris diaphragm blades
function computeIrisBlades(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  opening: number, // 0.05 to 0.95
  numBlades: number = 16
): BladeGeometry[] {
  const blades: BladeGeometry[] = [];
  const rAperture = rInner + (rOuter * 0.58 - rInner) * opening;

  for (let i = 0; i < numBlades; i++) {
    const theta = (2 * Math.PI / numBlades) * i;
    const px = cx + rOuter * 0.94 * Math.cos(theta);
    const py = cy + rOuter * 0.94 * Math.sin(theta);

    // Tip angle based on dilation opening
    const tipAngle = theta + 0.85 + (1.0 - opening) * 0.55;
    const tipX = cx + rAperture * Math.cos(tipAngle);
    const tipY = cy + rAperture * Math.sin(tipAngle);

    // Mid outer curve anchor
    const p2x = cx + rOuter * 0.72 * Math.cos(theta + 0.28);
    const p2y = cy + rOuter * 0.72 * Math.sin(theta + 0.28);

    const path = `M ${px.toFixed(1)} ${py.toFixed(1)} Q ${p2x.toFixed(1)} ${p2y.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${cx.toFixed(1)} ${cy.toFixed(1)} Z`;
    blades.push({ path, pivotX: px, pivotY: py });
  }
  return blades;
}

// Generates 8-pointed star Mashrabiya lattice coordinates
function compute8PointStar(cx: number, cy: number, radius: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.541;
    const a = (Math.PI / 8) * i;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function KineticDiaphragmaticMembrane() {
  // Operational Modes
  const [activeMode, setActiveMode] = useState<"diurnal" | "stomatal" | "manual" | "exploded">("diurnal");
  
  // Environmental & Solar Trajectory State
  const [solarHour, setSolarHour] = useState<number>(12.0); // 6.0 to 18.0
  const [manualOpening, setManualOpening] = useState<number>(0.38); // 0.05 to 0.95
  const [stomatalBreath, setStomatalBreath] = useState<number>(0.4);
  const [showFootnotes, setShowFootnotes] = useState<boolean>(false);

  // Auto-breathing animation for Stomatal Mode
  useEffect(() => {
    if (activeMode !== "stomatal") return;
    let frameId: number;
    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Smooth sinusoidal oscillation between 0.15 and 0.85 (period 4s)
      const osc = 0.5 + 0.35 * Math.sin(elapsed * 1.57);
      setStomatalBreath(osc);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [activeMode]);

  // Derived Solar Trajectory
  const { solarElev, solarAzimuth, calculatedOpening, rawLux, filteredLux } = useMemo(() => {
    // Hour 6:00 = 0 deg elevation, 12:00 = 75 deg, 18:00 = 0 deg
    const normalizedHour = (solarHour - 6.0) / 12.0; // 0 to 1
    const elevationRad = Math.sin(normalizedHour * Math.PI) * (75 * Math.PI / 180);
    const elevDeg = elevationRad * (180 / Math.PI);
    const azimuthDeg = 90 + normalizedHour * 180; // East (90) -> South (180) -> West (270)

    // Raw sunlight lux (peaking at noon up to 85,000 lux outdoors, normalized 1000 arbitrary)
    const raw = Math.sin(normalizedHour * Math.PI) * 980;

    let opening = 0.38;
    if (activeMode === "diurnal") {
      // High noon constricts aperture to protect reader eye; morning/dusk dilates
      const constriction = Math.sin(normalizedHour * Math.PI);
      opening = Math.max(0.12, Math.min(0.88, 1.0 - constriction * 0.72));
    } else if (activeMode === "stomatal") {
      opening = stomatalBreath;
    } else if (activeMode === "manual" || activeMode === "exploded") {
      opening = manualOpening;
    }

    // Filtered internal lux on typographic bed (target optimal reading ~320 lux)
    const filtered = Math.max(80, Math.min(650, raw * opening * 0.75 + 120));

    return {
      solarElev: elevDeg,
      solarAzimuth: azimuthDeg,
      calculatedOpening: opening,
      rawLux: Math.round(raw),
      filteredLux: Math.round(filtered)
    };
  }, [solarHour, activeMode, manualOpening, stomatalBreath]);

  // Dynamic Shadow Vector cast onto typographic bed
  const shadowVector = useMemo(() => {
    const radAz = (solarAzimuth * Math.PI) / 180;
    const radEl = Math.max(0.15, (solarElev * Math.PI) / 180);
    const cotEl = 1.0 / Math.tan(radEl);
    
    // Distance factor
    const dist = Math.min(24, cotEl * 6);
    const sx = -Math.cos(radAz) * dist;
    const sy = Math.sin(radAz) * dist * 0.6;
    const blur = 4 + cotEl * 2;
    const opacity = Math.min(0.38, 0.15 + (1.0 - calculatedOpening) * 0.25);

    return {
      filter: `drop-shadow(${sx.toFixed(1)}px ${sy.toFixed(1)}px ${blur.toFixed(1)}px rgba(22, 20, 18, ${opacity.toFixed(2)}))`
    };
  }, [solarAzimuth, solarElev, calculatedOpening]);

  // Precomputed central diaphragm blades
  const centralBlades = useMemo(() => {
    return computeIrisBlades(260, 260, 210, 48, calculatedOpening, 16);
  }, [calculatedOpening]);

  return (
    <div className="min-h-screen bg-[#111317] text-[#e8e4dc] font-sans selection:bg-[#d4af37]/30 selection:text-[#fff] overflow-x-hidden">
      {/* Top Header & Architectural Masthead */}
      <header className="border-b border-[#232733] bg-[#141720]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#d4af37] bg-[#d4af37]/10 flex items-center justify-center font-serif text-[#d4af37] font-bold text-sm tracking-widest shadow-inner">
            19
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] font-mono text-[#d4af37] uppercase">Design Minds · Chapter XIX</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#3b82f6]/40 bg-[#1e3a8a]/20 text-[#93c5fd] font-mono">BIOCLIMATIC SCREEN</span>
            </div>
            <h1 className="text-base sm:text-lg font-serif tracking-wide text-[#f5f2ea] font-medium">
              Kinetic Diaphragmatic Screen Membranes
            </h1>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-[#191d27] border border-[#2a3040] p-1 gap-1">
          <button
            onClick={() => setActiveMode("diurnal")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "diurnal"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8e95a5] hover:text-[#e8e4dc]"
            }`}
          >
            ☀️ DIURNAL SUN
          </button>
          <button
            onClick={() => setActiveMode("stomatal")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "stomatal"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8e95a5] hover:text-[#e8e4dc]"
            }`}
          >
            🌿 STOMATAL BREATH
          </button>
          <button
            onClick={() => setActiveMode("manual")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "manual"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8e95a5] hover:text-[#e8e4dc]"
            }`}
          >
            ⚙️ KINEMATIC GEAR
          </button>
          <button
            onClick={() => setActiveMode("exploded")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-all ${
              activeMode === "exploded"
                ? "bg-[#d4af37] text-[#111317] font-semibold shadow"
                : "text-[#8e95a5] hover:text-[#e8e4dc]"
            }`}
          >
            📐 3D SECTION CUT
          </button>
        </div>
      </header>

      {/* Main Architectural Pavilion Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Kinetic Screen Membrane Canvas & Optical Engine (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="border border-[#2a3040] bg-[#161922] p-5 relative overflow-hidden shadow-2xl">
            {/* Top Bar inside Canvas Card */}
            <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
                <span className="text-xs font-mono text-[#d4af37] tracking-wider uppercase">
                  MASHRABIYA DIAPHRAGM ARRAY · R=260mm
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#717b8f]">
                APERTURE OPEN: <strong className="text-[#f5f2ea]">{(calculatedOpening * 100).toFixed(1)}%</strong>
              </span>
            </div>

            {/* Kinetic SVG Screen Viewport */}
            <div 
              className={`w-full aspect-square max-h-[540px] mx-auto bg-[#0d0f14] border border-[#262c3b] relative flex items-center justify-center transition-transform duration-700 ${
                activeMode === "exploded" ? "perspective-[1400px] [transform:rotateX(26deg)_rotateY(-10deg)] scale-95" : ""
              }`}
            >
              <svg
                viewBox="0 0 520 520"
                className="w-full h-full select-none"
                style={shadowVector}
              >
                <defs>
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                    <stop offset="45%" stopColor="#d4af37" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#111317" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f7e7a6" />
                    <stop offset="50%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#876817" />
                  </linearGradient>
                </defs>

                {/* Outer Mashrabiya 8-point Octagonal Framing Grid */}
                <g opacity="0.35">
                  <polygon points={compute8PointStar(260, 260, 248)} fill="none" stroke="#3b82f6" strokeWidth="1.2" />
                  <polygon points={compute8PointStar(260, 260, 225)} fill="none" stroke="#d4af37" strokeWidth="0.8" strokeDasharray="4,4" />
                  {/* Corner Star Tessellations */}
                  <polygon points={compute8PointStar(40, 40, 90)} fill="none" stroke="#2a3040" strokeWidth="1" />
                  <polygon points={compute8PointStar(480, 40, 90)} fill="none" stroke="#2a3040" strokeWidth="1" />
                  <polygon points={compute8PointStar(40, 480, 90)} fill="none" stroke="#2a3040" strokeWidth="1" />
                  <polygon points={compute8PointStar(480, 480, 90)} fill="none" stroke="#2a3040" strokeWidth="1" />
                </g>

                {/* Central Aperture Daylight Beam */}
                <circle
                  cx="260"
                  cy="260"
                  r={48 + (210 * 0.58 - 48) * calculatedOpening}
                  fill="url(#sunGlow)"
                />

                {/* Outer Geared Ring & Teeth */}
                <circle cx="260" cy="260" r="214" fill="#141720" stroke="#d4af37" strokeWidth="2.5" />
                {Array.from({ length: 48 }).map((_, i) => {
                  const a = (2 * Math.PI / 48) * i;
                  const x1 = 260 + 210 * Math.cos(a);
                  const y1 = 260 + 210 * Math.sin(a);
                  const x2 = 260 + 220 * Math.cos(a);
                  const y2 = 260 + 220 * Math.sin(a);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4af37" strokeWidth="1.5" />;
                })}

                {/* 16 Kinetic Brass Diaphragm Blades */}
                <g>
                  {centralBlades.map((b, idx) => (
                    <g key={idx}>
                      <path
                        d={b.path}
                        fill="#1b1f2b"
                        stroke="url(#brassGrad)"
                        strokeWidth="1.4"
                        className="transition-all duration-300 ease-out"
                      />
                      {/* Pivot Pin */}
                      <circle cx={b.pivotX} cy={b.pivotY} r="3.2" fill="#d4af37" stroke="#111317" strokeWidth="1" />
                    </g>
                  ))}
                </g>

                {/* Concentric Measurement Rings */}
                <circle cx="260" cy="260" r="48" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" />
                <circle cx="260" cy="260" r="140" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2,2" />

                {/* Center Reticle */}
                <line x1="244" y1="260" x2="276" y2="260" stroke="#d4af37" strokeWidth="1" />
                <line x1="260" y1="244" x2="260" y2="276" stroke="#d4af37" strokeWidth="1" />
              </svg>

              {/* Exploded Mode Elevation Callout Tag */}
              {activeMode === "exploded" && (
                <div className="absolute bottom-4 left-4 bg-[#1e2330]/90 border border-[#d4af37] px-3 py-1.5 text-[11px] font-mono text-[#d4af37]">
                  ELEVATION OFFSET: +65mm Z-AXIS (OPTICAL PLENUM GAP)
                </div>
              )}
            </div>

            {/* Interactive Mode Control Deck */}
            <div className="mt-5 pt-4 border-t border-[#232733] flex flex-col gap-4">
              {activeMode === "diurnal" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#8e95a5]">DIURNAL SOLAR TRAJECTORY:</span>
                    <span className="text-[#d4af37] font-semibold">
                      {Math.floor(solarHour)}:{Math.floor((solarHour % 1) * 60).toString().padStart(2, "0")} SOLAR TIME (ELEV: {solarElev.toFixed(1)}°)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="18.0"
                    step="0.1"
                    value={solarHour}
                    onChange={(e) => setSolarHour(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer h-1.5 bg-[#232733]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#5b6475]">
                    <span>06:00 DAWN (MAX OPEN)</span>
                    <span>12:00 HIGH NOON (GLARE SHIELD)</span>
                    <span>18:00 DUSK (MAX OPEN)</span>
                  </div>
                </div>
              )}

              {activeMode === "manual" && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#8e95a5]">MANUAL IRIS APERTURE ROTATION:</span>
                    <span className="text-[#d4af37] font-semibold">{(manualOpening * 100).toFixed(1)}% DILATION</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.92"
                    step="0.01"
                    value={manualOpening}
                    onChange={(e) => setManualOpening(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer h-1.5 bg-[#232733]"
                  />
                </div>
              )}

              {activeMode === "stomatal" && (
                <div className="bg-[#191d28] border border-[#293245] p-3 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#93c5fd]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-ping"></span>
                    <span>PULMONARY STOMATAL TRANSPIRATION ACTIVE (PERIOD = 4.0s)</span>
                  </div>
                  <span className="text-[#d4af37]">DIAPHRAGM OSCILLATION: {(stomatalBreath * 100).toFixed(1)}%</span>
                </div>
              )}

              {activeMode === "exploded" && (
                <div className="bg-[#191d28] border border-[#293245] p-3 text-xs font-mono flex justify-between items-center">
                  <span className="text-[#93c5fd]">3D AXONOMETRIC PERSPECTIVE ACTIVATED</span>
                  <button 
                    onClick={() => setManualOpening(manualOpening === 0.3 ? 0.75 : 0.3)}
                    className="px-2.5 py-1 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
                  >
                    TOGGLE DIAPHRAGM
                  </button>
                </div>
              )}

              {/* Real-Time Optical Telemetry HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#12141a] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">RAW INCIDENT LUX</div>
                  <div className="text-base font-mono text-[#f87171] font-semibold">{rawLux} lx</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">UNATTENUATED GLARE</div>
                </div>
                <div className="bg-[#12141a] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">BED TRANSMITTANCE</div>
                  <div className="text-base font-mono text-[#34d399] font-semibold">{filteredLux} lx</div>
                  <div className="text-[9px] font-mono text-[#525a6b]">OPTIMAL (TARGET ~320)</div>
                </div>
                <div className="bg-[#12141a] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">GLARE REDUCTION</div>
                  <div className="text-base font-mono text-[#d4af37] font-semibold">
                    {Math.max(0, Math.round((1 - filteredLux / (rawLux + 1)) * 100))}%
                  </div>
                  <div className="text-[9px] font-mono text-[#525a6b]">EYE-STRAIN MITIGATION</div>
                </div>
                <div className="bg-[#12141a] border border-[#232733] p-2.5">
                  <div className="text-[10px] font-mono text-[#717b8f]">SHADOW SPREAD</div>
                  <div className="text-base font-mono text-[#60a5fa] font-semibold">
                    {(Math.max(1, 75 - solarElev)).toFixed(1)}mm
                  </div>
                  <div className="text-[9px] font-mono text-[#525a6b]">RAKING PENUMBRA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Typographic Substrate (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Typographic Paper Sheet Container */}
          <div 
            className="border border-[#e2dcd0] bg-[#f7f5f0] text-[#161513] p-7 shadow-2xl relative transition-all duration-500 min-h-[580px]"
            style={{
              boxShadow: `0 25px 50px -12px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.03)`
            }}
          >
            {/* Projected Kinetic Shadow Filigree Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply transition-all duration-700"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, transparent ${calculatedOpening * 40}%, rgba(0,0,0,0.45) 85%), repeating-linear-gradient(45deg, rgba(20,20,20,0.05) 0px, rgba(20,20,20,0.05) 2px, transparent 2px, transparent 24px)`
              }}
            />

            {/* Editorial Header */}
            <div className="border-b border-[#ded7c8] pb-4 mb-6 relative">
              <div className="flex justify-between items-baseline text-[11px] font-mono text-[#8c8270] uppercase tracking-widest mb-1">
                <span>MONOGRAPH · FOLIO 019</span>
                <span>CORDUE / PARIS 1987</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#141413] tracking-tight leading-tight">
                The Living Screen: Beyond the Glass Cage
              </h2>
              <p className="text-xs font-serif italic text-[#6e6452] mt-1">
                디지털 스크린은 닫힌 유리창이 아니다. 그것은 태양과 함께 숨 쉬는 건축 외피다.
              </p>
            </div>

            {/* Primary Reading Essay with Interactive Stomatal Notes */}
            <div className="space-y-4 font-serif text-[14.5px] leading-relaxed text-[#23211e] relative">
              <p>
                <span className="float-left text-4xl font-bold leading-none pr-2 pt-1 font-serif text-[#991b1b]">
                  F
                </span>
                or thirty years, web browsers have treated digital light as an authoritarian, binary command: either an all-consuming deluge of white luminescence that burns into human photoreceptors, or an artificial cave of OLED pitch-black.
              </p>

              <p className="text-[#3b3731]">
                In contrast, vernacular Islamic architecture solved the tyranny of desert glare a millennium ago through the <em>Mashrabiya</em> (مشربية). By turning solid timber into an intricate, breathing lattice of micro-louvers, it fragmented harsh noon sunlight into thousands of peaceful, geometric shadow-petals.
              </p>

              {/* Interactive Stomatal Commentary Callout */}
              <div 
                onClick={() => setShowFootnotes(!showFootnotes)}
                className="my-5 p-4 border-l-2 border-[#d4af37] bg-[#ede8dc]/80 cursor-pointer hover:bg-[#e7e1d3] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#8c6d1f] font-semibold mb-1">
                  <span>[JEAN NOUVEL THESIS · NOTE 19.4]</span>
                  <span className="text-[10px]">{showFootnotes ? "▲ HIDE LOUVER" : "▼ OPEN LOUVER"}</span>
                </div>
                <p className="text-xs font-sans text-[#4a4437]">
                  {showFootnotes 
                    ? "At the Institut du Monde Arabe (1987), Nouvel's 240 motorized iris diaphragms proved that mechanical apertures can dynamically shield long-form reading from eye-strain without severing the user from ambient daylight."
                    : "Tap to dilate internal micro-louvers: reveal structural engineering axioms from the 1987 Paris Institut du Monde Arabe..."}
                </p>
              </div>

              <p className="text-[#3b3731]">
                When we transplant this bioclimatic wisdom into front-end code, the viewport ceases to be an opaque container. It becomes a responsive screen membrane: dilating to capture soft dawn light, constricting into protective filigree against noon glare, and whispering in rhythm with human attention.
              </p>
            </div>

            {/* Substrate Footer Certification */}
            <div className="mt-8 pt-4 border-t border-[#ded7c8] flex justify-between items-center text-[10px] font-mono text-[#8c8270]">
              <span>COTTON RAG 600GSM · ALABASTER</span>
              <span>VERIFIED THEMATIC AXIOM 19</span>
            </div>
          </div>

          {/* Quick Technical Specs & Architectural Precedents */}
          <div className="border border-[#232733] bg-[#141720] p-4 text-xs font-mono space-y-2">
            <div className="text-[#d4af37] font-semibold text-[11px] uppercase tracking-wider">
              ARCHITECTURAL PRECEDENTS & FORMULAS:
            </div>
            <ul className="text-[#8e95a5] space-y-1.5 text-[11px]">
              <li>• <strong className="text-[#e8e4dc]">Jean Nouvel (1987)</strong>: 240 photoelectric iris diaphragms, Institut du Monde Arabe, Paris.</li>
              <li>• <strong className="text-[#e8e4dc]">Hassan Fathy (1986)</strong>: Natural Energy & Vernacular Architecture: Bioclimatic Mashrabiya.</li>
              <li>• <strong className="text-[#e8e4dc]">Aperture Formula</strong>: A(θ) = π · r₀² · (1 - η · cos(β_sun))</li>
            </ul>
          </div>
        </div>

      </main>

      {/* Global Architectural Footer */}
      <footer className="border-t border-[#232733] bg-[#0e1015] px-6 py-6 text-center text-xs font-mono text-[#626b7d]">
        DESIGN MINDS · DAY 019 EXPERIMENT · GEMINI (NOON MIND) · AUTONOMOUS DISCOVERY CADENCE
      </footer>
    </div>
  );
}
