import React, { useState } from "react";

type StageStep = 1 | 2 | 3 | 4;

interface StageInfo {
  step: StageStep;
  name: string;
  nameKo: string;
  latency: string;
  role: string;
  desc: string;
  descKo: string;
}

const STAGES: StageInfo[] = [
  {
    step: 1,
    name: "The Awning & Silhouette",
    nameKo: "어닝과 건축적 윤곽",
    latency: "0 – 150 ms",
    role: "Shelter & Form (피난처와 형태)",
    desc: "Spotted from across the street. The geometric canvas canopy promises physical shelter from rain and sun, anchoring the shop against the urban streetscape.",
    descKo: "길 건너편에서 가장 먼저 눈에 들어옵니다. 비와 햇볕을 가려주는 캔버스 처마의 단정한 실루엣이 도시의 번잡함 속에서 심리적 피난처의 신호를 보냅니다.",
  },
  {
    step: 2,
    name: "The Doorway & Material Weight",
    nameKo: "문짝과 물리적 물성",
    latency: "150 – 300 ms",
    role: "Tactile Welcome (촉각적 환대)",
    desc: "As footsteps draw near, the eye locks onto the portal. Heavy solid oak, clear glass panes, and a brushed brass handle invite the hand to touch and push.",
    descKo: "걸음이 가까워지며 시선은 출입문으로 향합니다. 묵직한 원목 프레임과 손때 묻은 황동 손잡이가 손끝에 닿을 묵직하고 믿음직한 촉각적 환대를 예고합니다.",
  },
  {
    step: 3,
    name: "The Amber Glow & Depth",
    nameKo: "호박색 불빛과 실내 깊이",
    latency: "300 – 550 ms",
    role: "Emotional Temperature (정서적 온도)",
    desc: "Warm light spills through the glass, illuminating wooden tables and ceramic wares. It signals that comfort, safety, and human presence wait inside.",
    descKo: "유리창을 통해 2200K의 따뜻한 호박색 불빛이 흘러나옵니다. 테이블과 도자기 잔을 비추며 저 문 너머에 안식과 따스한 사람의 온기가 있음을 확신시킵니다.",
  },
  {
    step: 4,
    name: "The Typographic Arrival",
    nameKo: "활자의 도착과 확인",
    latency: "550 ms+",
    role: "Cognitive Confirmation (이성적 확인)",
    desc: "With trust and curiosity established, the eye finally reads the quiet brass-framed paper menu beside the door. Typography speaks in a calm, confident whisper.",
    descKo: "공간에 대한 신뢰가 형성된 바로 이 순간, 시선은 문 옆에 단정하게 걸린 종이 메뉴판에 닿습니다. 이제 활자는 소리쳐 외칠 필요 없이 차분하게 확인시켜 줍니다.",
  },
];

export default function StorefrontThresholdAnatomy() {
  const [activeStep, setActiveStep] = useState<StageStep>(1);
  const [colorTemp, setColorTemp] = useState<number>(2400); // 2200K to 5500K
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);

  // Compute ambient window glow color from color temperature
  const getWindowGlowColor = () => {
    // 2200K = Warm Amber (#F5A623), 5500K = Cool Daylight (#E2EDF8)
    const factor = (colorTemp - 2200) / (5500 - 2200); // 0 to 1
    const r = Math.round(245 - factor * 20);
    const g = Math.round(166 + factor * 60);
    const b = Math.round(35 + factor * 200);
    const opacity = 0.25 + (1 - factor) * 0.45;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const currentStage = STAGES[activeStep - 1];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1D1B] font-sans p-6 md:p-14 select-none flex flex-col justify-between">
      
      {/* Top Editorial Header */}
      <header className="border-b border-[#EAE6DE] pb-6 mb-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B85D38]" />
            <span className="font-mono text-xs tracking-[0.25em] text-[#B85D38] uppercase font-bold">
              DAY 028 · 2026-09-29 · DESIGN MINDS
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-[#1E1D1B] mt-2">
            The Anatomy of an Entrance
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#76736D] mt-1 max-w-xl">
            How architectural shelter, tactile material, and the color temperature of light establish human trust long before the conscious brain ever reads a menu.
          </p>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-[#EAE6DE] p-1.5 rounded-2xl shadow-sm">
          {STAGES.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                activeStep === s.step
                  ? "bg-[#B85D38] text-white font-bold shadow-sm"
                  : "text-[#76736D] hover:text-[#1E1D1B]"
              }`}
            >
              STAGE {s.step}
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow items-start">
        
        {/* Left: Architectural Storefront Facade Canvas (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-[#EAE6DE] rounded-3xl p-8 md:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] relative flex flex-col items-center justify-between min-h-[560px]">
          
          {/* Awning (Stage 1 Target) */}
          <div
            onClick={() => setActiveStep(1)}
            className={`w-full max-w-md h-20 rounded-t-2xl relative transition-all duration-500 cursor-pointer overflow-hidden border-b-4 border-[#8A4225] ${
              activeStep === 1
                ? "ring-2 ring-[#B85D38] shadow-md scale-[1.01]"
                : "opacity-90 hover:opacity-100"
            }`}
            style={{
              background: "repeating-linear-gradient(45deg, #B85D38, #B85D38 20px, #A04A27 20px, #A04A27 40px)",
            }}
          >
            <div className="absolute inset-0 bg-black/[0.04]" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-serif text-white tracking-widest text-xs uppercase font-medium">
              EST. 2026 · FOREST HILLS
            </div>
            {showHeatmap && (
              <div className="absolute top-2 left-6 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[9px]">
                FIXATION: 24%
              </div>
            )}
          </div>

          {/* Storefront Wall & Windows */}
          <div className="w-full max-w-md bg-[#FAF8F5] border-x border-[#EAE6DE] p-6 flex justify-between gap-4 items-stretch flex-grow relative">
            
            {/* Left Window: Warm Interior Glow (Stage 3 Target) */}
            <div
              onClick={() => setActiveStep(3)}
              className={`flex-1 rounded-2xl border transition-all duration-500 cursor-pointer relative p-4 flex flex-col justify-between overflow-hidden ${
                activeStep === 3
                  ? "border-[#F2A93B] ring-2 ring-[#F2A93B]/40 shadow-md"
                  : "border-[#EAE6DE] hover:border-[#F2A93B]/60"
              }`}
              style={{ backgroundColor: getWindowGlowColor() }}
            >
              <div className="flex justify-between font-mono text-[9px] text-[#76736D]">
                <span>TRANSOM</span>
                <span className="font-bold text-[#B85D38]">{colorTemp}K</span>
              </div>

              {/* Interior Silhouette Shapes */}
              <div className="flex items-end justify-center gap-2 h-24 opacity-60">
                <div className="w-6 h-12 bg-[#8C6D58] rounded-t-lg" />
                <div className="w-8 h-16 bg-[#5A4537] rounded-t-lg" />
                <div className="w-4 h-8 bg-[#CFA052] rounded-full" />
              </div>

              <div className="text-center font-serif text-[11px] text-[#5C5954] italic">
                “A quiet table in the corner”
              </div>

              {showHeatmap && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F2A93B]/20 pointer-events-none">
                  <span className="font-mono text-xs bg-black/70 text-white px-2 py-1 rounded">
                    WARMTH FIXATION: 42%
                  </span>
                </div>
              )}
            </div>

            {/* Right Doorway & Brass Handle (Stage 2 Target) */}
            <div
              onClick={() => setActiveStep(2)}
              className={`w-36 rounded-2xl border-2 transition-all duration-500 cursor-pointer relative p-3 flex flex-col justify-between ${
                activeStep === 2
                  ? "border-[#B85D38] ring-2 ring-[#B85D38]/30 shadow-md"
                  : "border-[#D5CEBF] hover:border-[#B85D38]/60"
              }`}
              style={{
                backgroundColor: isDoorOpen ? "#F4EFE6" : "#EFE9DD",
              }}
            >
              {/* Leaded Glass Pane */}
              <div className="h-32 rounded-lg border border-[#D5CEBF] bg-white/40 flex items-center justify-center">
                <span className="font-serif italic text-xs text-[#76736D]">Welcome</span>
              </div>

              {/* Brass Door Pull-Handle */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDoorOpen(!isDoorOpen);
                }}
                className="my-auto self-end mr-1 w-3 h-14 rounded-full bg-[#CFA052] border border-[#A67C33] shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                title="Click to pull handle"
              >
                <div className="w-0.5 h-8 bg-[#FFE699]" />
              </div>

              {/* Door Threshold Plate */}
              <div className="w-full h-2 bg-[#8C8577] rounded-sm mt-2" />

              {showHeatmap && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#B85D38]/40 animate-ping pointer-events-none" />
              )}
            </div>

            {/* Small Brass-Framed Paper Menu (Stage 4 Target) */}
            <div
              onClick={() => setActiveStep(4)}
              className={`absolute -right-4 top-12 w-14 h-24 bg-white border rounded shadow-md p-1.5 flex flex-col justify-between cursor-pointer transition-all ${
                activeStep === 4
                  ? "border-[#B85D38] ring-2 ring-[#B85D38]/40 scale-105"
                  : "border-[#CFA052] hover:scale-105"
              }`}
            >
              <div className="w-full border-b border-[#EAE6DE] pb-0.5 text-[6px] font-serif font-bold text-center">
                MENU
              </div>
              <div className="space-y-1 py-1">
                <div className="w-full h-1 bg-[#D5CEBF] rounded-full" />
                <div className="w-4/5 h-1 bg-[#D5CEBF] rounded-full" />
                <div className="w-full h-1 bg-[#D5CEBF] rounded-full" />
              </div>
              <div className="text-[6px] font-mono text-[#8C8880] text-center">
                DAILY
              </div>
            </div>

          </div>

          {/* Bottom Ground Stone Pavement */}
          <div className="w-full max-w-md h-8 bg-[#E5E0D5] rounded-b-2xl border-t border-[#D5CEBF] flex items-center justify-center text-[10px] font-mono text-[#8C8577] tracking-widest">
            COBBLESTONE THRESHOLD
          </div>
        </div>

        {/* Right: Saccadic Chronology & Interaction Panel (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Stage Card */}
          <div className="bg-white border border-[#EAE6DE] rounded-3xl p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-[#F0ECE4] pb-4">
              <span className="font-mono text-xs tracking-widest text-[#B85D38] uppercase font-bold">
                STAGE 0{currentStage.step} // SACCADIC ARRIVAL
              </span>
              <span className="font-mono text-xs text-[#76736D] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EAE6DE]">
                {currentStage.latency}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-serif text-[#1E1D1B]">
                {currentStage.name}
              </h3>
              <span className="text-xs font-serif text-[#B85D38] italic block mt-0.5">
                {currentStage.nameKo}
              </span>
            </div>

            <p className="text-xs md:text-sm text-[#5C5954] leading-relaxed">
              {currentStage.desc}
            </p>
            <p className="text-xs text-[#76736D] leading-relaxed pt-1 border-t border-[#F5F2EB]">
              {currentStage.descKo}
            </p>
          </div>

          {/* Color Temperature Control Bar */}
          <div className="bg-white border border-[#EAE6DE] rounded-3xl p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs tracking-widest text-[#76736D] uppercase font-bold">
                AMBIENT COLOR TEMPERATURE
              </span>
              <span className="font-mono text-sm font-bold text-[#B85D38]">
                {colorTemp} K
              </span>
            </div>

            <input
              type="range"
              min="2200"
              max="5500"
              step="100"
              value={colorTemp}
              onChange={(e) => setColorTemp(Number(e.target.value))}
              className="w-full h-2 bg-[#EAE6DE] rounded-lg appearance-none cursor-pointer accent-[#B85D38]"
            />

            <div className="flex justify-between font-mono text-[10px] text-[#8C8880]">
              <span>2200K (WARM AMBER / HEARTH)</span>
              <span>5500K (CLINICAL DAYLIGHT)</span>
            </div>

            <p className="text-xs text-[#76736D] leading-relaxed pt-2">
              Slide to the left to feel the welcoming hearth of neighborhood comfort; slide to the right to see how clinical light turns a warm cafe into a detached commercial clinic.
            </p>
          </div>

          {/* Gaze Heatmap Toggle & Interaction Feedback */}
          <div className="bg-white border border-[#EAE6DE] rounded-3xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-serif text-sm text-[#1E1D1B] block">
                Visual Fixation Map
              </span>
              <span className="font-sans text-xs text-[#76736D] block">
                Show eye tracking fixation percentages
              </span>
            </div>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors ${
                showHeatmap
                  ? "bg-[#B85D38] text-white font-bold"
                  : "bg-[#FAF8F5] border border-[#EAE6DE] text-[#76736D] hover:text-[#1E1D1B]"
              }`}
            >
              {showHeatmap ? "HEATMAP: ACTIVE" : "SHOW HEATMAP"}
            </button>
          </div>

        </div>

      </main>

      {/* Warm Minimalist Footer Colophon */}
      <footer className="max-w-6xl mx-auto w-full pt-8 mt-12 border-t border-[#EAE6DE] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-[#8C8880]">
        <div>
          <span>Design Minds · Day 028 · The Anatomy of an Entrance</span>
          <span className="mx-3 opacity-30">|</span>
          <span>Observation-Based Visual Design Inquiry</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#B85D38] font-mono text-[11px]">CALIBRATION: WARM ENTRANCE TECTONICS</span>
          <span>ZERO-NEON · NATURAL DAYLIGHT</span>
        </div>
      </footer>
    </div>
  );
}
