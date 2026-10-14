import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export type LouverMaterial = "hinoki" | "brass" | "basalt";

export interface LouverMaterialProfile {
  id: LouverMaterial;
  nameKo: string;
  nameEn: string;
  bladeColor: string;
  shadowColor: string;
  shadowOpacity: number;
  resonanceHz: number;
  descKo: string;
}

export interface SolarPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  elevation: number; // deg
  azimuth: number; // deg
  louverAngle: number; // deg
  colorTempK: number;
  descKo: string;
}

// Materials
const MATERIALS: Record<LouverMaterial, LouverMaterialProfile> = {
  hinoki: {
    id: "hinoki",
    nameKo: "편백 원목 루버",
    nameEn: "Turned Hinoki Wood",
    bladeColor: "#D8C7B0",
    shadowColor: "rgba(45, 34, 22, 0.48)",
    shadowOpacity: 0.45,
    resonanceHz: 280,
    descKo: "따스한 나무결을 품은 자연 원목 슬랫으로, 빛을 은은하게 흡수하며 부드러운 음영을 만듭니다."
  },
  brass: {
    id: "brass",
    nameKo: "절삭 황동 블레이드",
    nameEn: "Architectural Milled Brass",
    bladeColor: "#C5A059",
    shadowColor: "rgba(40, 30, 15, 0.58)",
    shadowOpacity: 0.55,
    resonanceHz: 780,
    descKo: "금빛 금속성 광택의 압출 황동 날개로, 날카로운 모서리 반사와 선명한 직선 그림자를 투영합니다."
  },
  basalt: {
    id: "basalt",
    nameKo: "연마 현무암 핀",
    nameEn: "Honed Basalt Fins",
    bladeColor: "#3D3935",
    shadowColor: "rgba(20, 18, 16, 0.68)",
    shadowOpacity: 0.65,
    resonanceHz: 160,
    descKo: "Day 001의 석각을 연상시키는 묵직한 현무암 핀으로, 짙고 극적인 건축적 대비를 자아냅니다."
  }
};

// Presets
const PRESETS: SolarPreset[] = [
  {
    id: "dawn_raking",
    nameKo: "새벽의 긴 측광 (Dawn 14°)",
    nameEn: "Dawn Grazing Light",
    elevation: 14,
    azimuth: 40,
    louverAngle: 28,
    colorTempK: 2350,
    descKo: "지평선 바로 위에서 낮게 비치는 호박색 아침 햇살이 벽면을 길게 훑으며 형압 활자를 드라마틱하게 깨웁니다."
  },
  {
    id: "zenith_noon",
    nameKo: "정오의 개방형 루버 (Noon 75°)",
    nameEn: "Solar Zenith Open",
    elevation: 75,
    azimuth: 180,
    louverAngle: 82,
    colorTempK: 5400,
    descKo: "수직에 가까운 높은 햇살과 활짝 열린 루버를 통해 청량한 백색광이 공간을 가득 채웁니다."
  },
  {
    id: "golden_hour",
    nameKo: "황금빛 차양 (Golden Hour 26°)",
    nameEn: "Golden Hour Slanted",
    elevation: 26,
    azimuth: 245,
    louverAngle: 45,
    colorTempK: 2800,
    descKo: "석양 무렵의 짙은 테라코타빛 빛줄기가 슬랫 사이로 쏟아져 들어오며 공간에 깊은 향수를 불어넣습니다."
  },
  {
    id: "intimate_dusk",
    nameKo: "실내 조명과 닫힌 루버 (Night Sconce)",
    nameEn: "Interior Sconce Dusk",
    elevation: 8,
    azimuth: 110,
    louverAngle: 12,
    colorTempK: 2100,
    descKo: "외부의 빛을 차단하고 실내의 부드러운 벽등만으로 글자의 음각을 은은하게 비추는 아늑한 밤의 풍경."
  }
];

export default function Experiment() {
  // State
  const [material, setMaterial] = useState<LouverMaterial>("hinoki");
  const [elevation, setElevation] = useState<number>(24); // 8 to 85 deg
  const [azimuth, setAzimuth] = useState<number>(45); // 0 to 360 deg
  const [louverAngle, setLouverAngle] = useState<number>(36); // 0 (closed) to 90 (open)
  const [activePreset, setActivePreset] = useState<string>("dawn_raking");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [showRayOverlay, setShowRayOverlay] = useState<boolean>(true);
  const [isDraggingSun, setIsDraggingSun] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, []);

  // Mechanical Slat & Solar Haptic Synthesizer
  const playSlatSound = useCallback((frequency: number = 280) => {
    if (!audioEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Mechanical wooden / brass click
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio fallback silent
    }
  }, [audioEnabled, initAudio]);

  // Apply Preset
  const applyPreset = (presetId: string) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(presetId);
    setElevation(p.elevation);
    setAzimuth(p.azimuth);
    setLouverAngle(p.louverAngle);
    playSlatSound(MATERIALS[material].resonanceHz);
  };

  // Color Temperature Calculation (Kelvin & Hex Tint)
  const colorTempInfo = useMemo(() => {
    // Elevation maps to 2200K (dawn) -> 5500K (noon)
    const normalizedEl = Math.sin((Math.max(5, elevation) * Math.PI) / 180);
    const kelvin = Math.round(2200 + normalizedEl * 3300);

    // Dynamic light color
    let lightTint = "#FFFDF9"; // noon crisp
    let ambientWarmth = "rgba(255, 248, 235, 0.4)";
    let moodKo = "한낮의 청량한 자연광";

    if (kelvin < 2600) {
      lightTint = "#EFA651"; // dawn warm amber
      ambientWarmth = "rgba(239, 166, 81, 0.55)";
      moodKo = "새벽의 촛불빛 호박색";
    } else if (kelvin < 3200) {
      lightTint = "#E28751"; // golden hour
      ambientWarmth = "rgba(226, 135, 81, 0.5)";
      moodKo = "석양의 황금빛 테라코타";
    } else if (kelvin < 4500) {
      lightTint = "#FCECD5"; // soft afternoon
      ambientWarmth = "rgba(252, 236, 213, 0.45)";
      moodKo = "부드러운 오후의 햇살";
    }

    return { kelvin, lightTint, ambientWarmth, moodKo };
  }, [elevation]);

  // Dynamic Shadow Band Geometry
  const shadowBands = useMemo(() => {
    const radEl = (Math.max(5, elevation) * Math.PI) / 180;
    const radAz = (azimuth * Math.PI) / 180;

    // Louver opening factor: 0 is closed (solid shadow), 90 is full light
    const openFactor = Math.sin((louverAngle * Math.PI) / 180);
    const shadowStripeWidth = Math.max(12, Math.min(80, (1 - openFactor) * 70 + 14));
    const shadowGap = Math.max(14, openFactor * 85 + 10);
    const bandAngle = (radAz * 180) / Math.PI * 0.25; // subtle tilt

    // Emboss offset for typography
    const embDx = -Math.cos(radAz) * Math.max(1.5, Math.min(6, 6 / Math.tan(radEl)));
    const embDy = -Math.sin(radAz) * Math.max(1.5, Math.min(6, 6 / Math.tan(radEl)));

    return { shadowStripeWidth, shadowGap, bandAngle, embDx, embDy };
  }, [elevation, azimuth, louverAngle]);

  const activeMaterial = MATERIALS[material];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FAF8F5",
        color: "#1E1C1A",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* Editorial Top Navigation Header */}
      {!isMonographMode && (
        <header
          style={{
            borderBottom: "1px solid #EAE4D9",
            padding: "16px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAF8F5",
            zIndex: 20
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: "italic",
                fontSize: "22px",
                fontWeight: 500,
                color: "#1E1C1A",
                letterSpacing: "-0.01em"
              }}
            >
              Design Minds · Day 031
            </span>
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#857E74",
                fontFamily: "monospace"
              }}
            >
              2026-10-02 · Architectural Louver & Raking Light
            </span>
          </div>

          {/* Top Control Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Louver Material Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#F2ECE4", padding: "3px", borderRadius: "4px" }}>
              {(Object.keys(MATERIALS) as LouverMaterial[]).map((mKey) => (
                <button
                  key={mKey}
                  onClick={() => {
                    setMaterial(mKey);
                    playSlatSound(MATERIALS[mKey].resonanceHz);
                  }}
                  style={{
                    border: "none",
                    background: material === mKey ? "#FFFFFF" : "transparent",
                    color: material === mKey ? "#1E1C1A" : "#766F64",
                    fontWeight: material === mKey ? 600 : 400,
                    padding: "4px 8px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: material === mKey ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  {MATERIALS[mKey].nameKo}
                </button>
              ))}
            </div>

            {/* Ray Overlay Toggle */}
            <button
              onClick={() => setShowRayOverlay(!showRayOverlay)}
              style={{
                background: showRayOverlay ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showRayOverlay ? "☀️ Solar Ray Vectors ON" : "☀️ Vectors Hidden"}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                background: audioEnabled ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "12px",
                color: "#4A453E",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>{audioEnabled ? "🔔" : "🔕"}</span>
              <span>{audioEnabled ? "Haptics ON" : "Muted"}</span>
            </button>

            {/* Fullscreen Monograph Mode */}
            <button
              onClick={() => setIsMonographMode(true)}
              style={{
                backgroundColor: "#1E1C1A",
                color: "#FAF8F5",
                border: "none",
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              📖 건축 파빌리온 모드
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Monograph Button */}
      {isMonographMode && (
        <button
          onClick={() => setIsMonographMode(false)}
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            border: "1px solid #D8CFC2",
            borderRadius: "20px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1E1C1A",
            cursor: "pointer",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}
        >
          ✕ 큐레이터 모드로 복귀 (Exit)
        </button>
      )}

      {/* Main Studio Viewport */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMonographMode ? "1fr" : "1fr 420px",
          flex: 1,
          minHeight: isMonographMode ? "100vh" : "calc(100vh - 65px)",
          transition: "all 0.3s ease"
        }}
      >
        {/* Left Column: Architectural Sunroom Gallery Wall */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #EAE4D9",
            backgroundColor: "#FAF6F0",
            overflow: "hidden"
          }}
        >
          {/* Top Presets & Solar Orbit Controls */}
          {!isMonographMode && (
            <div
              style={{
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E6DEC8",
                backgroundColor: "#FAF8F5"
              }}
            >
              {/* Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#857E74" }}>
                  Solar Presets:
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    style={{
                      backgroundColor: activePreset === p.id ? "#1E1C1A" : "#FFFFFF",
                      color: activePreset === p.id ? "#FAF8F5" : "#4A453E",
                      border: "1px solid #D8CFC2",
                      borderRadius: "3px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: activePreset === p.id ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {p.nameKo}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", color: "#57534E" }}>
                <span>☀️ Altitude: {elevation}°</span>
                <input
                  type="range"
                  min="8"
                  max="85"
                  value={elevation}
                  onChange={(e) => {
                    setElevation(Number(e.target.value));
                    setActivePreset("custom");
                  }}
                  style={{ width: "70px", accentColor: "#B85D38" }}
                />
                <span>Azimuth: {azimuth}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={azimuth}
                  onChange={(e) => {
                    setAzimuth(Number(e.target.value));
                    setActivePreset("custom");
                  }}
                  style={{ width: "70px", accentColor: "#C5A059" }}
                />
                <span>🪟 Louver: {louverAngle}°</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={louverAngle}
                  onChange={(e) => {
                    setLouverAngle(Number(e.target.value));
                    setActivePreset("custom");
                    playSlatSound(260);
                  }}
                  style={{ width: "70px", accentColor: "#857E74" }}
                />
              </div>
            </div>
          )}

          {/* Gallery Plaster Wall with Embossed Typography & Louver Shadows */}
          <div
            style={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: "580px",
              backgroundColor: "#FAF6F0",
              overflow: "hidden",
              padding: "60px 80px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Ambient Sunlight Wash Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at ${50 + Math.cos((azimuth * Math.PI) / 180) * 35}% ${
                  40 - Math.sin((elevation * Math.PI) / 180) * 25
                }%, ${colorTempInfo.ambientWarmth}, transparent 70%)`,
                pointerEvents: "none",
                transition: "background 0.3s ease"
              }}
            />

            {/* Rhythmic Louver Shadow Bands Overlay (Brise-Soleil Stripes) */}
            <div
              style={{
                position: "absolute",
                inset: "-40%",
                width: "180%",
                height: "180%",
                background: `repeating-linear-gradient(${shadowBands.bandAngle}deg, ${activeMaterial.shadowColor}, ${activeMaterial.shadowColor} ${shadowBands.shadowStripeWidth}px, transparent ${shadowBands.shadowStripeWidth}px, transparent ${
                  shadowBands.shadowStripeWidth + shadowBands.shadowGap
                }px)`,
                pointerEvents: "none",
                mixBlendMode: "multiply",
                transition: "background 0.25s ease"
              }}
            />

            {/* Top Louver Slat Physical Frame (Architectural Header) */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(138, 132, 124, 0.25)",
                paddingBottom: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: colorTempInfo.lightTint,
                    border: "1px solid #C5BCAD",
                    boxShadow: "0 0 8px rgba(255,255,255,0.8)"
                  }}
                />
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#6E685E" }}>
                  SOLAR TEMPERATURE: {colorTempInfo.kelvin}K ({colorTempInfo.moodKo})
                </span>
              </div>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8A847C" }}>
                SLAT APERTURE: {louverAngle}° / {activeMaterial.nameEn.toUpperCase()}
              </span>
            </div>

            {/* Monumental Blind-Embossed Typography Pavilion */}
            <div style={{ position: "relative", zIndex: 10, maxWidth: "780px" }}>
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#A2833B",
                  marginBottom: "16px",
                  fontFamily: "monospace"
                }}
              >
                CHAPTER 031 · THE DIURNAL SUNDIAL
              </div>

              {/* Embossed Main Masthead (Dual Opposing Shadows Reacting to Sun) */}
              <h1
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "52px",
                  lineHeight: 1.15,
                  fontWeight: 500,
                  margin: "0 0 24px 0",
                  color: "#2C2824",
                  letterSpacing: "-0.015em",
                  textShadow: `${shadowBands.embDx * 1.2}px ${shadowBands.embDy * 1.2}px 3px rgba(255, 255, 255, 0.95), ${
                    -shadowBands.embDx * 1.4
                  }px ${-shadowBands.embDy * 1.4}px 6px rgba(45, 35, 25, 0.38)`,
                  transition: "text-shadow 0.15s ease"
                }}
              >
                Light does not merely illuminate form; it carves it.
              </h1>

              {/* Korean Subtitle with Tactile Inset Relief */}
              <h2
                style={{
                  fontSize: "20px",
                  lineHeight: 1.6,
                  fontWeight: 400,
                  color: "#4A453E",
                  margin: "0 0 32px 0",
                  textShadow: `${shadowBands.embDx * 0.8}px ${shadowBands.embDy * 0.8}px 2px rgba(255, 255, 255, 0.9), ${
                    -shadowBands.embDx
                  }px ${-shadowBands.embDy}px 4px rgba(45, 35, 25, 0.28)`
                }}
              >
                빛은 사물을 비추는 광원이 아니라, 공간과 글자를 깎아내는 보이지 않는 조각가의 끌이다.
              </h2>

              {/* Raking Light Editorial Commentary Paragraph */}
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.85,
                  color: "#38342F",
                  maxWidth: "680px",
                  textAlign: "justify",
                  backgroundColor: "rgba(255, 255, 255, 0.55)",
                  backdropFilter: "blur(4px)",
                  padding: "24px 28px",
                  borderRadius: "4px",
                  border: "1px solid rgba(226, 218, 205, 0.8)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
                }}
              >
                상단의 태양 고도(Altitude)와 루버 블레이드 회전 각도(Louver Angle)를 조작해 보십시오.
                새벽 14도의 긴 측광이 창문을 넘어올 때, 르 코르뷔지에의 차양 블레이드는 빛을 규칙적인 스트라이프 악보로 해체합니다.
                그림자가 벽면의 형압 활자를 스쳐 지나갈 때, 글자는 번쩍이는 하이라이트와 깊은 침묵의 음영 사이를 유려하게 오가며 살아 숨 쉬는 건축적 안식처를 완성합니다.
              </div>
            </div>

            {/* Bottom Gallery Plinth Footer */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(138, 132, 124, 0.25)",
                paddingTop: "16px",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#7E7569"
              }}
            >
              <span>PAVILION SUBSTRATE: HONED IVORY PLASTER (#FAF6F0)</span>
              <span>SHADOW STRIPE PITCH: {shadowBands.shadowStripeWidth}PX / GAP {shadowBands.shadowGap}PX</span>
              <span>MONTH 2 INITIATIVE: SANCTUARY OF TOUCH</span>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Analysis & Diurnal Telemetry */}
        {!isMonographMode && (
          <div
            style={{
              backgroundColor: "#FAF8F5",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflowY: "auto"
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#8A847C",
                  marginBottom: "8px",
                  fontFamily: "monospace"
                }}
              >
                DAY 031 · OPTICAL ANALYSIS
              </div>

              <h2
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#1E1C1A",
                  margin: "0 0 10px 0"
                }}
              >
                The Raking Louver Pavilion
              </h2>

              <p style={{ fontSize: "12px", lineHeight: 1.65, color: "#4A453E", margin: "0 0 20px 0" }}>
                30일 전 Day 001의 석각 반전 원리가 자연 상태의 해시계였다면, Day 031은 건축적 루버를 통해 빛을 분절하고 길들이는 인간의 공간적 조율입니다.
              </p>

              {/* Diurnal Solar Telemetry Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5DFD4",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1E1C1A",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <span>Solar Optical Telemetry</span>
                  <span style={{ color: "#B85D38" }}>{colorTempInfo.kelvin}K</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "11px",
                    color: "#57534E",
                    fontFamily: "monospace"
                  }}
                >
                  <div>
                    <span style={{ color: "#9E978C" }}>Elevation:</span> {elevation}° Alt
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Azimuth:</span> {azimuth}° Az
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Louver Slat:</span> {louverAngle}° Tilt
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Relief Depth:</span> ±{Math.abs(shadowBands.embDx).toFixed(1)}px
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Blade Material:</span> {activeMaterial.nameEn}
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Shadow Opacity:</span> {(activeMaterial.shadowOpacity * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Color Temp Indicator Bar */}
                <div
                  style={{
                    marginTop: "14px",
                    height: "6px",
                    width: "100%",
                    background: "linear-gradient(to right, #EFA651, #FCECD5, #FFFDF9, #E28751)",
                    borderRadius: "3px",
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-3px",
                      left: `${Math.min(95, Math.max(5, ((colorTempInfo.kelvin - 2200) / 3300) * 100))}%`,
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#1E1C1A",
                      border: "2px solid #FFFFFF",
                      transform: "translateX(-50%)"
                    }}
                  />
                </div>
              </div>

              {/* Architectural Principles Box */}
              <div
                style={{
                  backgroundColor: "#FAF6F0",
                  border: "1px solid #E5DFD4",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#1E1C1A", marginBottom: "8px" }}>
                  조형 메커니즘 3대 공리
                </div>
                <div style={{ fontSize: "11px", color: "#6E685E", lineHeight: 1.6 }}>
                  1. <strong>차양 분절 (Brise-Soleil)</strong>: 회전 슬랫이 직사광을 부드러운 평행 음영 띠로 분할.<br />
                  2. <strong>형압 광학 돋을새김 (Blind Emboss)</strong>: 획의 상단 하이라이트와 하단 음각 골짜기가 자연광 입사각에 연동.<br />
                  3. <strong>일영 리듬 (Diurnal Rhythm)</strong>: 2200K 새벽에서 5500K 정오로 이어지는 생체 리듬의 회복.
                </div>
              </div>
            </div>

            {/* Month 2 Kickoff Statement */}
            <div style={{ borderTop: "1px solid #EAE4D9", paddingTop: "16px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#B85D38",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px"
                }}
              >
                Month 2 Inaugural Milestone · Day 031
              </div>
              <div style={{ fontSize: "12px", color: "#4A453E", lineHeight: 1.5 }}>
                피상적인 화면 위의 그래픽을 넘어, 인간의 호흡과 자연의 빛이 만나는 촉각적 건축 인터페이스의 새로운 장을 엽니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
