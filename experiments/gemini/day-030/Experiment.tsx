import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export type PaperType = "rag140" | "onion80" | "board280";

export interface PaperProfile {
  id: PaperType;
  nameEn: string;
  nameKo: string;
  weightGsm: number;
  bg: string;
  edgeBorder: string;
  stiffness: number; // 0.1 to 1.0
  showThroughOpacity: number; // 0 to 1
  shadowDepth: number;
  descKo: string;
}

export interface SpreadPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  foldAngle: number; // 0 to 60 deg
  innerMargin: number; // px
  outerMargin: number; // px
  topMargin: number; // px
  bottomMargin: number; // px
  descKo: string;
}

// Paper Profiles
const PAPERS: Record<PaperType, PaperProfile> = {
  rag140: {
    id: "rag140",
    nameEn: "140gsm Unbleached Cotton Book Rag",
    nameKo: "140g 무표백 코튼 북래그 면지",
    weightGsm: 140,
    bg: "#FAF8F5",
    edgeBorder: "#EAE2D5",
    stiffness: 0.65,
    showThroughOpacity: 0.04,
    shadowDepth: 0.35,
    descKo: "손끝에 보송보송한 면 섬유의 결이 느껴지는 고급 단행본용 본문 면지."
  },
  onion80: {
    id: "onion80",
    nameEn: "80gsm Translucent Bible Paper",
    nameKo: "80g 반투명 성경 박엽지",
    weightGsm: 80,
    bg: "#FDFCF9",
    edgeBorder: "#F0EAE1",
    stiffness: 0.35,
    showThroughOpacity: 0.12,
    shadowDepth: 0.22,
    descKo: "뒷장의 활자가 은은하게 비치는 얇고 우아한 클래식 사전·성경용 지질."
  },
  board280: {
    id: "board280",
    nameEn: "280gsm Rigid Archival Board",
    nameKo: "280g 중량 보존용 아카이벌 보드지",
    weightGsm: 280,
    bg: "#F2ECE4",
    edgeBorder: "#DFD6C8",
    stiffness: 0.95,
    showThroughOpacity: 0.0,
    shadowDepth: 0.48,
    descKo: "미술관 도록과 고급 양장본 하드커버에 사용되는 묵직하고 빳빳한 중량지."
  }
};

// Curated Spread Presets
const SPREAD_PRESETS: SpreadPreset[] = [
  {
    id: "tschichold",
    nameKo: "치홀트 황금 규범 (2:3:4:6)",
    nameEn: "Tschichold Golden Canon",
    foldAngle: 24,
    innerMargin: 28,
    outerMargin: 56,
    topMargin: 42,
    bottomMargin: 84,
    descKo: "얀 치홀트가 밝혀낸 중세 필사본의 2:3:4:6 비례로, 안여백 둘이 합쳐 바깥여백 하나와 일치하는 완전한 조화."
  },
  {
    id: "flat_study",
    nameKo: "완전 펼침 열람 (Flat Study)",
    nameEn: "Flat Archival Spread",
    foldAngle: 0,
    innerMargin: 36,
    outerMargin: 48,
    topMargin: 36,
    bottomMargin: 64,
    descKo: "180도 완전히 평평하게 펼쳐진 제본 상태로, 도판과 본문이 가장 넓고 쾌적하게 호흡하는 상태."
  },
  {
    id: "intimate_reading",
    nameKo: "손에 쥔 독서 각도 (40° Fold)",
    nameEn: "Intimate Reading Fold",
    foldAngle: 40,
    innerMargin: 24,
    outerMargin: 52,
    topMargin: 38,
    bottomMargin: 76,
    descKo: "독자가 무릎 위에 책을 올리고 양손으로 감싸 쥐었을 때 생겨나는 깊고 아늑한 안여백의 계곡."
  },
  {
    id: "gallery_plinth",
    nameKo: "전시대 쇼케이스 (Gallery Plinth)",
    nameEn: "Exhibition Showcase",
    foldAngle: 15,
    innerMargin: 32,
    outerMargin: 64,
    topMargin: 48,
    bottomMargin: 92,
    descKo: "유리 쇼케이스 안 완만한 각도로 비스듬히 놓인 채 조명을 받는 미술관 도록의 우아한 자태."
  }
];

export default function Experiment() {
  // State
  const [paper, setPaper] = useState<PaperType>("rag140");
  const [foldAngle, setFoldAngle] = useState<number>(24);
  const [activePreset, setActivePreset] = useState<string>("tschichold");
  const [showCanonOverlay, setShowCanonOverlay] = useState<boolean>(true);
  const [showCaliperRuler, setShowCaliperRuler] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [selectedPlate, setSelectedPlate] = useState<"vessel" | "celadon">("vessel");
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [isDraggingSpine, setIsDraggingSpine] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartAngle, setDragStartAngle] = useState<number>(24);
  const [lightAzimuth, setLightAzimuth] = useState<number>(45);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, []);

  // Multi-layered Paper & Binding Acoustic Synthesizer
  const playPageTurnSound = useCallback((frequency: number = 320, isFlip: boolean = false) => {
    if (!audioEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isFlip) {
        // Broad sweeping paper flip (whoosh + rustle)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.32);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      } else {
        // Soft fibrous friction sweep
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (isFlip ? 0.38 : 0.22));
    } catch {
      // Audio silent fallback
    }
  }, [audioEnabled, initAudio]);

  // Apply Preset
  const applyPreset = (presetId: string) => {
    const p = SPREAD_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(presetId);
    setFoldAngle(p.foldAngle);
    playPageTurnSound(PAPERS[paper].resonanceHz);
  };

  // Flip Spread Action
  const toggleSpread = () => {
    playPageTurnSound(480, true);
    setCurrentSpreadIndex((prev) => (prev === 0 ? 1 : 0));
  };

  // Direct Mouse Drag to Fold
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSpine(true);
    setDragStartX(e.clientX);
    setDragStartAngle(foldAngle);
    playPageTurnSound(PAPERS[paper].resonanceHz);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingSpine) return;
    const deltaX = e.clientX - dragStartX;
    // Dragging right opens (flattens), dragging left closes (steepens)
    const newAngle = Math.max(0, Math.min(55, dragStartAngle - deltaX * 0.2));
    setFoldAngle(Math.round(newAngle));
    setActivePreset("custom");
  }, [isDraggingSpine, dragStartX, dragStartAngle]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingSpine) {
      setIsDraggingSpine(false);
      playPageTurnSound(240);
    }
  }, [isDraggingSpine, playPageTurnSound]);

  useEffect(() => {
    if (isDraggingSpine) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingSpine, handleMouseMove, handleMouseUp]);

  // Active Paper Details
  const activePaper = PAPERS[paper];

  // Dynamic Gutter Shadow Calculation
  const gutterShadowIntensity = useMemo(() => {
    const rad = (foldAngle * Math.PI) / 180;
    return Math.min(0.65, Math.max(0.08, Math.sin(rad) * activePaper.shadowDepth * 1.4));
  }, [foldAngle, activePaper]);

  // 3D Perspective Transformations
  const versoTransform = useMemo(() => {
    return `rotateY(${foldAngle * 0.5}deg) translateZ(${foldAngle * 0.45}px)`;
  }, [foldAngle]);

  const rectoTransform = useMemo(() => {
    return `rotateY(-${foldAngle * 0.5}deg) translateZ(${foldAngle * 0.45}px)`;
  }, [foldAngle]);

  // Directional Ray-Traced Shadow Offsets
  const lightOffsets = useMemo(() => {
    const rad = (lightAzimuth * Math.PI) / 180;
    const sx = Math.cos(rad) * 20;
    const sy = Math.sin(rad) * 20;
    return { sx, sy };
  }, [lightAzimuth]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#EFEBE2",
        color: "#1E1C1A",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        userSelect: isDraggingSpine ? "none" : "auto",
        overflowX: "hidden"
      }}
    >
      {/* Editorial Header */}
      {!isMonographMode && (
        <header
          style={{
            borderBottom: "1px solid #DFD7C8",
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
              Design Minds · Day 030
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
              2026-10-01 · 3D Imposition & Spread Architecture
            </span>
          </div>

          {/* Top Control Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Paper Substrate Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#F2ECE4", padding: "3px", borderRadius: "4px" }}>
              {(Object.keys(PAPERS) as PaperType[]).map((pKey) => (
                <button
                  key={pKey}
                  onClick={() => {
                    setPaper(pKey);
                    playPageTurnSound(PAPERS[pKey].resonanceHz);
                  }}
                  style={{
                    border: "none",
                    background: paper === pKey ? "#FFFFFF" : "transparent",
                    color: paper === pKey ? "#1E1C1A" : "#766F64",
                    fontWeight: paper === pKey ? 600 : 400,
                    padding: "4px 8px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: paper === pKey ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  {PAPERS[pKey].nameKo}
                </button>
              ))}
            </div>

            {/* Canon Overlay Toggle */}
            <button
              onClick={() => setShowCanonOverlay(!showCanonOverlay)}
              style={{
                background: showCanonOverlay ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showCanonOverlay ? "Canon Guide ON (2:3:4:6)" : "Guide Hidden"}
            </button>

            {/* Brass Caliper Overlay */}
            <button
              onClick={() => setShowCaliperRuler(!showCaliperRuler)}
              style={{
                background: showCaliperRuler ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showCaliperRuler ? "📐 Caliper ON" : "📐 Ruler Off"}
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
              <span>{audioEnabled ? "Sound ON" : "Muted"}</span>
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
              📖 도록 전면 보기 (Monograph)
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

      {/* Main Studio Workstage */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMonographMode ? "1fr" : "1fr 400px",
          flex: 1,
          minHeight: isMonographMode ? "100vh" : "calc(100vh - 65px)",
          transition: "all 0.3s ease"
        }}
      >
        {/* Left Column: 3D Double-Page Spread Viewport */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #DFD7C8",
            backgroundColor: "#EFEBE2",
            overflow: "hidden"
          }}
        >
          {/* Plinth Canvas Controls Bar */}
          {!isMonographMode && (
            <div
              style={{
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E2D9CB",
                backgroundColor: "#FAF8F5"
              }}
            >
              {/* Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#857E74" }}>
                  Spread Presets:
                </span>
                {SPREAD_PRESETS.map((p) => (
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

              {/* Fold Angle & Light Sliders */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", color: "#57534E" }}>
                <span>📖 Fold: {foldAngle}°</span>
                <input
                  type="range"
                  min="0"
                  max="55"
                  value={foldAngle}
                  onChange={(e) => {
                    setFoldAngle(Number(e.target.value));
                    setActivePreset("custom");
                  }}
                  style={{ width: "80px", accentColor: "#B85D38" }}
                />
                <span>☀️ Light: {lightAzimuth}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={lightAzimuth}
                  onChange={(e) => setLightAzimuth(Number(e.target.value))}
                  style={{ width: "70px", accentColor: "#C5A059" }}
                />
              </div>
            </div>
          )}

          {/* 3D Reading Table Canvas */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              perspective: "1400px",
              position: "relative",
              cursor: isDraggingSpine ? "grabbing" : "grab"
            }}
          >
            {/* Table Wood Surface Texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(#DFD7C8 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
                opacity: 0.6,
                pointerEvents: "none"
              }}
            />

            {/* The 3D Open Book Spread Container */}
            <div
              style={{
                width: "920px",
                height: "580px",
                display: "flex",
                transformStyle: "preserve-3d",
                position: "relative",
                boxShadow: `0 24px 60px rgba(45, 35, 25, 0.18), ${lightOffsets.sx}px ${lightOffsets.sy}px 40px rgba(0,0,0,0.06)`
              }}
            >
              {/* LEFT PAGE: Verso (The Contemplative Plate) */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: activePaper.bg,
                  border: `1px solid ${activePaper.edgeBorder}`,
                  borderRight: "none",
                  borderTopLeftRadius: "6px",
                  borderBottomLeftRadius: "6px",
                  transformOrigin: "right center",
                  transform: versoTransform,
                  transition: isDraggingSpine ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  boxShadow: "-8px 12px 28px rgba(0, 0, 0, 0.08)",
                  position: "relative",
                  padding: "40px 48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
              >
                {/* Tschichold Construction Lines Overlay (Verso) */}
                {showCanonOverlay && (
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      opacity: 0.25
                    }}
                  >
                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="#B85D38" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="16%" y1="12%" x2="88%" y2="84%" stroke="#C5A059" strokeWidth="1" />
                    <rect x="16%" y="12%" width="72%" height="72%" fill="none" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="3 3" />
                  </svg>
                )}

                {/* Caliper Measurement Overlay */}
                {showCaliperRuler && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      border: "1px dashed #C5A059",
                      padding: "10px",
                      fontSize: "9px",
                      fontFamily: "monospace",
                      color: "#A2833B"
                    }}
                  >
                    <div style={{ position: "absolute", top: "14px", left: "16px" }}>Top: 42px (Ratio 3)</div>
                    <div style={{ position: "absolute", bottom: "14px", left: "16px" }}>Bottom: 84px (Ratio 6)</div>
                    <div style={{ position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)" }}>Outer: 56px (Ratio 4)</div>
                    <div style={{ position: "absolute", top: "50%", right: "8px", transform: "translateY(-50%)" }}>Inner: 28px (Ratio 2)</div>
                  </div>
                )}

                {/* Verso Running Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#8A847C",
                    borderBottom: "1px solid #EFEAE1",
                    paddingBottom: "10px"
                  }}
                >
                  <span>PLATE NO. {currentSpreadIndex === 0 ? "030A" : "030B"} · STILL LIFE STILLNESS</span>
                  <span>VERSO · P. {currentSpreadIndex === 0 ? "58" : "60"}</span>
                </div>

                {/* Hero Artifact Display (Contemplative Plate) */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  {/* Plate Selector Buttons */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      display: "flex",
                      gap: "6px",
                      zIndex: 10
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlate("vessel");
                        playPageTurnSound(180);
                      }}
                      style={{
                        background: selectedPlate === "vessel" ? "#B85D38" : "transparent",
                        color: selectedPlate === "vessel" ? "#FFFFFF" : "#7A7368",
                        border: "1px solid #D8CFC2",
                        padding: "3px 8px",
                        borderRadius: "2px",
                        fontSize: "10px",
                        cursor: "pointer"
                      }}
                    >
                      Stoneware Vessel (소결 도기)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlate("celadon");
                        playPageTurnSound(640);
                      }}
                      style={{
                        background: selectedPlate === "celadon" ? "#7E9685" : "transparent",
                        color: selectedPlate === "celadon" ? "#FFFFFF" : "#7A7368",
                        border: "1px solid #D8CFC2",
                        padding: "3px 8px",
                        borderRadius: "2px",
                        fontSize: "10px",
                        cursor: "pointer"
                      }}
                    >
                      Celadon Bowl (청자 완)
                    </button>
                  </div>

                  {/* Render Plate SVG */}
                  <div style={{ transform: "scale(1.35)", marginTop: "24px" }}>
                    {selectedPlate === "vessel" ? (
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                        <defs>
                          <radialGradient id="vGradPlate2" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#DF8F72" />
                            <stop offset="45%" stopColor="#B85D38" />
                            <stop offset="85%" stopColor="#8A3E20" />
                            <stop offset="100%" stopColor="#5E2711" />
                          </radialGradient>
                        </defs>
                        <ellipse cx="50" cy="88" rx="34" ry="10" fill="rgba(60, 40, 20, 0.18)" filter="blur(4px)" />
                        <path
                          d="M 28 32 C 24 50, 22 72, 36 84 C 44 89, 56 89, 64 84 C 78 72, 76 50, 72 32 Z"
                          fill="url(#vGradPlate2)"
                        />
                        <ellipse cx="50" cy="32" rx="22" ry="8" fill="#5E2711" />
                        <ellipse cx="50" cy="32" rx="20" ry="6.5" fill="#3D1808" />
                        <ellipse cx="50" cy="31" rx="22" ry="8" fill="none" stroke="#E2A690" strokeWidth="1.2" />
                        <path d="M 27 48 C 36 53, 64 53, 73 48" stroke="#D68160" strokeWidth="0.75" strokeOpacity="0.5" fill="none" />
                      </svg>
                    ) : (
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                        <defs>
                          <radialGradient id="cGradPlate2" cx="40%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#C4D7CA" />
                            <stop offset="45%" stopColor="#96AD9D" />
                            <stop offset="85%" stopColor="#6E8574" />
                            <stop offset="100%" stopColor="#4A5C4F" />
                          </radialGradient>
                        </defs>
                        <ellipse cx="50" cy="88" rx="36" ry="10" fill="rgba(30, 45, 35, 0.18)" filter="blur(4px)" />
                        <path d="M 18 36 C 20 64, 38 84, 50 84 C 62 84, 80 64, 82 36 Z" fill="url(#cGradPlate2)" />
                        <path d="M 30 42 L 38 58 L 34 72" stroke="#526456" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
                        <path d="M 50 36 L 46 54 L 56 68 L 52 82" stroke="#526456" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
                        <ellipse cx="50" cy="36" rx="32" ry="7" fill="url(#cGradPlate2)" stroke="#A6BCAD" strokeWidth="1" />
                        <ellipse cx="50" cy="37" rx="26" ry="4.5" fill="#586E5E" opacity="0.6" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Verso Plate Footnote */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Newsreader', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "13px",
                      color: "#4A453E",
                      marginBottom: "4px"
                    }}
                  >
                    {selectedPlate === "vessel"
                      ? "Figure 30.1 · Hand-Formed Bisque Stoneware Vessel"
                      : "Figure 30.2 · Celadon Crackle-Glazed Porcelain Tea Bowl"}
                  </div>
                  <div style={{ fontSize: "10px", color: "#857E74", fontFamily: "monospace" }}>
                    Feldspar clay, reduction firing Cone 6 (1,240°C). Placed on solitary ivory rag.
                  </div>
                </div>

                {/* Right Edge Gutter Shadow Overlay (Verso) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "75px",
                    background: `linear-gradient(to right, transparent, rgba(40, 32, 24, ${gutterShadowIntensity}))`,
                    pointerEvents: "none"
                  }}
                />
              </div>

              {/* CENTRAL GUTTER CREASE & SPINE THREADS */}
              <div
                style={{
                  width: "14px",
                  height: "100%",
                  backgroundColor: "#E2D8CA",
                  position: "relative",
                  zIndex: 15,
                  boxShadow: `0 0 ${foldAngle * 0.85}px rgba(35, 25, 15, 0.45) inset`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  alignItems: "center"
                }}
              >
                {/* Bookbinding Linen Thread Stitches */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "14px",
                      backgroundColor: "#FFF8ED",
                      borderRadius: "1px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.25)"
                    }}
                  />
                ))}
              </div>

              {/* RIGHT PAGE: Recto (The Typographic Cadence) */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: activePaper.bg,
                  border: `1px solid ${activePaper.edgeBorder}`,
                  borderLeft: "none",
                  borderTopRightRadius: "6px",
                  borderBottomRightRadius: "6px",
                  transformOrigin: "left center",
                  transform: rectoTransform,
                  transition: isDraggingSpine ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  boxShadow: "8px 12px 28px rgba(0, 0, 0, 0.08)",
                  position: "relative",
                  padding: "40px 48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
              >
                {/* Tschichold Construction Lines Overlay (Recto) */}
                {showCanonOverlay && (
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      opacity: 0.25
                    }}
                  >
                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="#B85D38" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="84%" y1="12%" x2="12%" y2="84%" stroke="#C5A059" strokeWidth="1" />
                    <rect x="12%" y="12%" width="72%" height="72%" fill="none" stroke="#C5A059" strokeWidth="0.75" strokeDasharray="3 3" />
                  </svg>
                )}

                {/* Left Edge Gutter Shadow Overlay (Recto) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "75px",
                    background: `linear-gradient(to left, transparent, rgba(40, 32, 24, ${gutterShadowIntensity}))`,
                    pointerEvents: "none"
                  }}
                />

                {/* Recto Running Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#8A847C",
                    borderBottom: "1px solid #EFEAE1",
                    paddingBottom: "10px"
                  }}
                >
                  <span>CHAPTER 030 · ARCHITECTURE OF THE SPREAD</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>RECTO · P. {currentSpreadIndex === 0 ? "59" : "61"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSpread();
                      }}
                      style={{
                        background: "#F2ECE4",
                        border: "1px solid #D8CFC2",
                        padding: "2px 6px",
                        fontSize: "9px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        color: "#4A453E"
                      }}
                    >
                      {currentSpreadIndex === 0 ? "Next Page ➔" : "⬅ Previous"}
                    </button>
                  </div>
                </div>

                {/* Recto Content Blocks */}
                {currentSpreadIndex === 0 ? (
                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: "#B85D38",
                        marginBottom: "6px",
                        fontFamily: "monospace"
                      }}
                    >
                      EDITORIAL ESSAY & IMPOSITION
                    </div>

                    <h1
                      style={{
                        fontFamily: "'Newsreader', Georgia, serif",
                        fontSize: "24px",
                        lineHeight: 1.25,
                        fontWeight: 500,
                        color: "#1E1C1A",
                        margin: "0 0 14px 0",
                        letterSpacing: "-0.01em"
                      }}
                    >
                      The Architecture of the Spread
                    </h1>

                    <h2
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6E685E",
                        margin: "0 0 16px 0",
                        lineHeight: 1.4
                      }}
                    >
                      에디토리얼 펼침면의 조형학: 제본의 깊이와 안여백의 역학
                    </h2>

                    {/* 2-Column Swiss Modular Typographic Spread */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        fontSize: "11px",
                        lineHeight: 1.7,
                        color: "#3D3831",
                        textAlign: "justify"
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 10px 0" }}>
                          책의 기본 단위는 낱장이 아니라 펼침면(Spread)입니다. 웹이 탄생하기 전 500년 동안, 인류는 활자를 무한 스크롤 테이프로 소비하지 않고 좌우 양면이 마주 보는 완결된 광장 속에서 읽어왔습니다.
                        </p>
                        <p style={{ margin: 0 }}>
                          왼쪽 페이지(Verso)가 사물 본연의 침묵을 응시하는 사색의 좌대라면, 오른쪽 페이지(Recto)는 스위스 그리드 위의 정갈한 활자가 지적인 서사의 리듬을 완성하는 장소입니다.
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: "0 0 10px 0" }}>
                          안여백(Gutter)은 단순한 공백이 아닙니다. 실 제본과 종이의 3차원 곡률이 빚어내는 물리적 계곡이자, 독자의 시선이 좌면에서 우면으로 도약할 때 찰나의 숨을 고르게 돕는 시각적 쉼표입니다.
                        </p>
                        <p style={{ margin: 0, fontStyle: "italic", color: "#686156" }}>
                          "When margins breathe in sacred golden progression, reading ceases to be mechanical consumption and becomes a sanctuary of somatic presence."
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: "#7E9685",
                        marginBottom: "6px",
                        fontFamily: "monospace"
                      }}
                    >
                      TECHNICAL MONOGRAPH & CRAFT
                    </div>

                    <h1
                      style={{
                        fontFamily: "'Newsreader', Georgia, serif",
                        fontSize: "24px",
                        lineHeight: 1.25,
                        fontWeight: 500,
                        color: "#1E1C1A",
                        margin: "0 0 14px 0"
                      }}
                    >
                      The Saccadic Bridge Across the Valley
                    </h1>

                    <h2
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6E685E",
                        margin: "0 0 16px 0",
                        lineHeight: 1.4
                      }}
                    >
                      계곡을 건너는 시선의 징검다리와 인지적 완충
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        fontSize: "11px",
                        lineHeight: 1.7,
                        color: "#3D3831",
                        textAlign: "justify"
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 10px 0" }}>
                          시선 추적(Eye-tracking) 연구에 따르면 독자의 안구는 좌면의 도판을 350ms 동안 머무른 후, 중앙 안여백의 계곡을 건널 때 약 130ms의 무의식적 시선 감속(Saccadic Deceleration)을 겪습니다.
                        </p>
                        <p style={{ margin: 0 }}>
                          이 감속의 순간 동안 뇌는 방금 마주한 도판의 촉각적 질감을 감정적으로 온전히 소화하며, 이어진 우측 텍스트를 읽을 준비를 마칩니다.
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: "0 0 10px 0" }}>
                          디지털 화면에서 이 중앙 곡률을 없애버리면, 사용자는 시각적 멀미를 느끼고 정보를 건조한 데이터로만 인식합니다.
                        </p>
                        <p style={{ margin: 0, fontStyle: "italic", color: "#686156" }}>
                          "Gutter depth is not a technical defect of binding; it is an optical gift of spatial contemplation."
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recto Metadata Footnote */}
                <div
                  style={{
                    borderTop: "1px solid #EFEAE1",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "9px",
                    fontFamily: "monospace",
                    color: "#8A847C"
                  }}
                >
                  <span>GRID: 6-COL MODULAR / TSCHICHOLD CANON</span>
                  <span>SUBSTRATE: {activePaper.nameEn.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plinth Canvas Footer Telemetry */}
          <div
            style={{
              padding: "12px 24px",
              backgroundColor: "#FAF8F5",
              borderTop: "1px solid #EAE4D9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#6E685E",
              fontFamily: "monospace"
            }}
          >
            <span>INTERACTION: Click & drag book spread to fold in 3D perspective</span>
            <span>TSCHICHOLD RATIO: 2 (Inner) : 3 (Top) : 4 (Outer) : 6 (Bottom)</span>
          </div>
        </div>

        {/* Right Column: Editorial Analysis & Imposition Geometry Inspector */}
        {!isMonographMode && (
          <div
            style={{
              backgroundColor: "#FAF8F5",
              padding: "32px 28px",
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
                DAY 030 · CURATORIAL ANALYSIS
              </div>

              <h2
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1E1C1A",
                  margin: "0 0 10px 0"
                }}
              >
                Imposition Geometry & Saccadic Flow
              </h2>

              <p style={{ fontSize: "12px", lineHeight: 1.65, color: "#4A453E", margin: "0 0 20px 0" }}>
                책을 펼쳤을 때 좌우 안여백(2 + 2 = 4)이 합쳐져 바깥쪽 여백(4)과 완벽한 광학적 대칭을 이루는 얀 치홀트의 원리를 확인하십시오. 3차원 곡률이 발생할 때 활자가 접힘 속으로 묻히지 않도록 계산된 기하학입니다.
              </p>

              {/* Imposition Metric Telemetry Card */}
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
                  <span>Live Imposition Telemetry</span>
                  <span style={{ color: "#B85D38" }}>θ: {foldAngle}° Fold</span>
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
                    <span style={{ color: "#9E978C" }}>Inner Gutter:</span> 28px (Unit 2)
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Combined Spine:</span> 56px (Unit 4)
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Outer Margin:</span> 56px (Unit 4)
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Bottom Plinth:</span> 84px (Unit 6)
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Shadow Well:</span> {(gutterShadowIntensity * 100).toFixed(0)}% Depth
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Paper Weight:</span> {activePaper.weightGsm} gsm
                  </div>
                </div>
              </div>

              {/* Saccadic Reading Path Diagram */}
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
                  시선의 비대칭 도약 궤적 (Saccadic Rhythm)
                </div>
                <p style={{ fontSize: "11px", color: "#6E685E", lineHeight: 1.6, margin: 0 }}>
                  1. <strong>Verso 응시 (0–350ms)</strong>: 좌측 도판의 사물과 여백을 통해 정서적 고요를 흡수.<br />
                  2. <strong>Gutter 도약 (350–480ms)</strong>: 안여백의 계곡을 건너며 인지적 쉼표 획득.<br />
                  3. <strong>Recto 독서 (480ms+)</strong>: 우측 2단 활자의 모듈러 리듬을 따라 이성적 서사 탐독.
                </p>
              </div>
            </div>

            {/* 30-Day Synthesis Milestone Note */}
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
                Milestone: 30-Day Synthesis Complete
              </div>
              <div style={{ fontSize: "12px", color: "#4A453E", lineHeight: 1.5 }}>
                첫 30일의 여정이 완성되었습니다. 현무암의 일영에서 시작하여 펼침면의 제본에 이르기까지, 모든 실험은 인간의 존엄한 감각을 예우하는 진정한 시각디자인으로 귀환했습니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
