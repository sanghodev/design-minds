import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export interface CuratedObject {
  id: string;
  name: string;
  nameKo: string;
  material: string;
  materialKo: string;
  visualMass: number; // 0 to 100
  baseColor: string;
  accentColor: string;
  shadowColor: string;
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  size: number; // px base scale
  resonanceHz: number;
  descriptionEn: string;
  descriptionKo: string;
  specs: { label: string; val: string }[];
}

export interface LightingState {
  azimuth: number; // degrees 0 - 360
  elevation: number; // degrees 15 - 85
  presetName: string;
}

export type PlinthSubstrate = "washi" | "hinoki" | "travertine";

// Initial Curated Objects
const INITIAL_OBJECTS: CuratedObject[] = [
  {
    id: "vessel",
    name: "Hand-Formed Bisque Stoneware Vessel",
    nameKo: "수제 비스크 소결 도기 잔",
    material: "Unglazed Terracotta & Feldspar Clay",
    materialKo: "무유약 테라코타 장석 점토 (1240°C 산화소성)",
    visualMass: 85,
    baseColor: "#B85D38",
    accentColor: "#D68160",
    shadowColor: "rgba(184, 93, 56, 0.35)",
    x: 28,
    y: 64,
    size: 104,
    resonanceHz: 180,
    descriptionEn: "Coarse tactile grain with micro-porous texture. Absorbs light into a soft matte envelope, anchoring the compositional plane.",
    descriptionKo: "유약을 입히지 않고 장석 점토 본연의 거친 입자를 살린 소결 도기. 빛을 흡수하며 깊은 확산 그림자를 만들어 지면의 시각적 주춧돌 역할을 합니다.",
    specs: [
      { label: "Materiality", val: "High-fired Porous Clay" },
      { label: "Firing Temp", val: "1,240°C Cone 6" },
      { label: "Surface Sheen", val: "0% Matte (100% Diffuse)" },
      { label: "Visual Torque", val: "High Foundation Anchor" },
    ]
  },
  {
    id: "compass",
    name: "Milled Solid Brass Drafting Divider",
    nameKo: "황동 정밀 절삭 디바이더",
    material: "C36000 Free-Machining Solid Brass",
    materialKo: "C36000 고밀도 절삭 황동 합금 (수작업 헤어라인 연마)",
    visualMass: 95,
    baseColor: "#C5A059",
    accentColor: "#F4D592",
    shadowColor: "rgba(197, 160, 89, 0.4)",
    x: 74,
    y: 32,
    size: 114,
    resonanceHz: 880,
    descriptionEn: "High-density machined brass with hairline brushing. Pierces space with razor precision, creating concentrated specular focal weight.",
    descriptionKo: "선반으로 깎아낸 정밀 황동 디바이더. 가느다란 선형 구조임에도 금속 특유의 높은 반사 밀도로 시선을 강력히 끌어당기는 초점이 됩니다.",
    specs: [
      { label: "Materiality", val: "Cold-Drawn C36000 Brass" },
      { label: "Finish", val: "Directional Hairline Polish" },
      { label: "Surface Sheen", val: "85% Specular Highlight" },
      { label: "Visual Torque", val: "High Focal Punctuation" },
    ]
  },
  {
    id: "notebook",
    name: "Bound Raw Flax Linen Monograph",
    nameKo: "원사 린넨 제본 디자인 도록",
    material: "Unbleached Natural Flax & 140gsm Cotton Rag",
    materialKo: "무표백 천연 아마사 린넨 & 140g 면지 코튼 종이",
    visualMass: 50,
    baseColor: "#D3C8B4",
    accentColor: "#EAE3D5",
    shadowColor: "rgba(140, 130, 115, 0.25)",
    x: 42,
    y: 38,
    size: 126,
    resonanceHz: 420,
    descriptionEn: "Woven organic textile with deckle-edged paper core. Acts as a soft spatial mediator, buffering between dense solids and empty air.",
    descriptionKo: "가공하지 않은 천연 린넨 섬유로 장정한 도록. 무거운 고체와 허공 사이를 부드럽게 완충하며 여백과 사물을 잇는 매개체 역할을 합니다.",
    specs: [
      { label: "Materiality", val: "100% Belgian Flax Linen" },
      { label: "Paper Core", val: "Acid-Free Cotton Rag" },
      { label: "Surface Sheen", val: "Low Fabric Grain Sheen" },
      { label: "Visual Torque", val: "Planar Spatial Mediator" },
    ]
  },
  {
    id: "bowl",
    name: "Celadon Crackle-Glazed Porcelain Bowl",
    nameKo: "청자 빙렬 유약 완",
    material: "Iron-Bearing Celadon Glaze over Kaolin",
    materialKo: "미량 철분 환원 청자유 & 카올린 백토 (미세 빙렬문)",
    visualMass: 65,
    baseColor: "#7E9685",
    accentColor: "#A6BCAD",
    shadowColor: "rgba(126, 150, 133, 0.3)",
    x: 60,
    y: 70,
    size: 94,
    resonanceHz: 640,
    descriptionEn: "Translucent vitreous glaze with fine hairline crackles. Introduces cool contemplative breathing room and fluid ceramic elegance.",
    descriptionKo: "맑은 비색 유약 표면에 식어가는 과정의 미세한 빙렬(Crackle)이 새겨진 찻사발. 흙과 유리의 투명함이 공존하며 사색적인 고요를 부여합니다.",
    specs: [
      { label: "Materiality", val: "Reduction-Fired Celadon" },
      { label: "Glaze Type", val: "Natural Iron Ash Vitrification" },
      { label: "Surface Sheen", val: "65% Vitreous Soft Gloss" },
      { label: "Visual Torque", val: "Contemplative Fluid Center" },
    ]
  }
];

// Curated Presets
const PRESETS = [
  {
    id: "zen",
    titleEn: "Zen Asymmetry",
    titleKo: "비대칭 여백의 조화",
    description: "Classic Japanese Ma: Heavy vessel in lower quadrant counterbalanced by sharp brass compass across diagonal void.",
    positions: { vessel: { x: 26, y: 66 }, compass: { x: 74, y: 32 }, notebook: { x: 42, y: 36 }, bowl: { x: 60, y: 72 } }
  },
  {
    id: "editorial",
    titleEn: "Editorial Spread",
    titleKo: "도록 카탈로그 펼침면",
    description: "Swiss 12-column alignment with linen monograph as anchor and artifacts spaced on harmonic rhythm intervals.",
    positions: { vessel: { x: 22, y: 46 }, compass: { x: 48, y: 68 }, notebook: { x: 50, y: 32 }, bowl: { x: 78, y: 56 } }
  },
  {
    id: "workbench",
    titleEn: "Studio Workbench",
    titleKo: "도예가의 작업대",
    description: "Artisan workshop in active motion: tools and freshly thrown pieces grouped naturally near the artisan's hand.",
    positions: { vessel: { x: 36, y: 56 }, compass: { x: 66, y: 48 }, notebook: { x: 28, y: 28 }, bowl: { x: 70, y: 68 } }
  },
  {
    id: "solitude",
    titleEn: "Centric Solitude",
    titleKo: "단일 사물의 응시",
    description: "Stoneware hero alone near the focal center with companion instruments quietly resting along peripheral borders.",
    positions: { vessel: { x: 48, y: 48 }, compass: { x: 82, y: 22 }, notebook: { x: 18, y: 24 }, bowl: { x: 82, y: 78 } }
  }
];

// Plinth Substrate Styling Specs
const SUBSTRATES: Record<PlinthSubstrate, { nameKo: string; nameEn: string; bg: string; border: string; desc: string }> = {
  washi: {
    nameKo: "코튼 면지 한지",
    nameEn: "Ivory Cotton Washi",
    bg: "#FAF6F0",
    border: "#EAE2D5",
    desc: "Warm ivory handmade paper substrate with delicate raw fiber specks"
  },
  hinoki: {
    nameKo: "편백 원목",
    nameEn: "Hinoki Cypress Wood",
    bg: "#F2E8D8",
    border: "#DFD2BE",
    desc: "Pale natural wood board with subtle linear grain and satin reflection"
  },
  travertine: {
    nameKo: "트래버틴 석회암",
    nameEn: "Honed Travertine",
    bg: "#EFEBE2",
    border: "#DDD6C8",
    desc: "Matte mineral limestone slab with subtle warm porous texture"
  }
};

export default function Experiment() {
  // State
  const [objects, setObjects] = useState<CuratedObject[]>(INITIAL_OBJECTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [substrate, setSubstrate] = useState<PlinthSubstrate>("washi");
  const [lighting, setLighting] = useState<LightingState>({
    azimuth: 45,
    elevation: 35,
    presetName: "Morning North Light (45°)"
  });
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>("zen");
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [vectorsVisible, setVectorsVisible] = useState<boolean>(true);
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
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

  // Material Sound Synthesizer (Realistic Physical Decay)
  const playMaterialSound = useCallback((obj: CuratedObject) => {
    if (!audioEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (obj.id === "vessel") {
        // Stoneware clay thud (180Hz fundamental + 72Hz body thump)
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(72, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      } else if (obj.id === "compass") {
        // High brass harmonic ring (880Hz + overtone)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(875, now + 0.65);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      } else if (obj.id === "notebook") {
        // Soft paper/linen friction rustle (320Hz filtered envelope)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        // Celadon porcelain bell (640Hz crystalline ring with micro-sustain)
        osc.type = "sine";
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(638, now + 0.55);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
      // Audio fallback silent
    }
  }, [audioEnabled, initAudio]);

  // Center of Visual Gravity calculation
  const centerOfGravity = useMemo(() => {
    let totalMass = 0;
    let weightedX = 0;
    let weightedY = 0;

    objects.forEach((obj) => {
      totalMass += obj.visualMass;
      weightedX += obj.visualMass * obj.x;
      weightedY += obj.visualMass * obj.y;
    });

    const cx = totalMass > 0 ? weightedX / totalMass : 50;
    const cy = totalMass > 0 ? weightedY / totalMass : 50;

    // Deviation from geometric center (50, 50)
    const dx = cx - 50;
    const dy = cy - 50;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Rotational torque relative to geometric center
    let netTorque = 0;
    objects.forEach((obj) => {
      const rx = obj.x - 50;
      const ry = obj.y - 50;
      netTorque += (rx * ry * obj.visualMass) / 1000;
    });

    // Composition Harmony Score (0 - 100)
    // Optimal artistic asymmetry has an eccentricity of 8 to 14 px.
    const optimalEccentricity = 11;
    const scoreDiff = Math.abs(distanceFromCenter - optimalEccentricity);
    const harmonyScore = Math.max(70, Math.min(100, Math.round(100 - scoreDiff * 2.2)));

    // Qualitative equilibrium state
    let balanceState = "Harmonic Asymmetry";
    let balanceStateKo = "완벽한 조형적 평형";
    let balanceColor = "#7E9685"; // celadon green

    if (distanceFromCenter > 18) {
      balanceState = "High Asymmetric Tension";
      balanceStateKo = "극적 비대칭 긴장 상태";
      balanceColor = "#B85D38"; // terracotta
    } else if (distanceFromCenter > 7) {
      balanceState = "Dynamic Counterbalance";
      balanceStateKo = "역동적 대각선 대치 평형";
      balanceColor = "#C5A059"; // brass gold
    } else {
      balanceState = "Static Centered Balance";
      balanceStateKo = "정적 중앙 집중 평형";
      balanceColor = "#8A847C";
    }

    return { cx, cy, dx, dy, distanceFromCenter, netTorque, harmonyScore, balanceState, balanceStateKo, balanceColor };
  }, [objects]);

  // Dynamic Typographic Compensation
  const typoOffset = useMemo(() => {
    const trackingEm = 0.02 + Math.abs(centerOfGravity.dx) * 0.0018;
    const typoShiftX = -centerOfGravity.dx * 0.45;
    const typoShiftY = -centerOfGravity.dy * 0.35;
    return { trackingEm, typoShiftX, typoShiftY };
  }, [centerOfGravity]);

  // Shadow vectors derived from lighting azimuth and elevation
  const shadowStyles = useMemo(() => {
    const radAz = (lighting.azimuth * Math.PI) / 180;
    const radEl = (lighting.elevation * Math.PI) / 180;
    const lengthFactor = 1 / Math.tan(Math.max(0.2, radEl));
    const shadowDist = Math.min(48, Math.max(6, 16 * lengthFactor));

    const sx = -Math.cos(radAz) * shadowDist;
    const sy = -Math.sin(radAz) * shadowDist;
    const blur = shadowDist * 1.5;

    return { sx, sy, blur };
  }, [lighting]);

  // Drag and drop handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedId(id);
    setIsDragging(id);
    const targetObj = objects.find((o) => o.id === id);
    if (targetObj) playMaterialSound(targetObj);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(8, Math.min(92, rawX));
    const clampedY = Math.max(8, Math.min(92, rawY));

    setObjects((prev) =>
      prev.map((obj) => (obj.id === isDragging ? { ...obj, x: clampedX, y: clampedY } : obj))
    );
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const targetObj = objects.find((o) => o.id === isDragging);
      if (targetObj) playMaterialSound(targetObj);
      setIsDragging(null);
    }
  }, [isDragging, objects, playMaterialSound]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Preset Selector
  const applyPreset = (presetId: string) => {
    const p = PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setActivePreset(presetId);
    setObjects((prev) =>
      prev.map((obj) => {
        const pos = p.positions[obj.id as keyof typeof p.positions];
        return pos ? { ...obj, x: pos.x, y: pos.y } : obj;
      })
    );
    const sample = objects[0];
    if (sample) playMaterialSound(sample);
  };

  // Inspecting Object
  const inspectedObject = useMemo(() => {
    return objects.find((o) => o.id === inspectingId) || null;
  }, [inspectingId, objects]);

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
        userSelect: isDragging ? "none" : "auto",
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
              Design Minds · Day 029
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
              2026-09-30 · Spatial Curation & Balance
            </span>
          </div>

          {/* Top Control Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Substrate Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#F2ECE4", padding: "3px", borderRadius: "4px" }}>
              {(["washi", "hinoki", "travertine"] as PlinthSubstrate[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubstrate(sub)}
                  style={{
                    border: "none",
                    background: substrate === sub ? "#FFFFFF" : "transparent",
                    color: substrate === sub ? "#1E1C1A" : "#766F64",
                    fontWeight: substrate === sub ? 600 : 400,
                    padding: "4px 8px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: substrate === sub ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  {SUBSTRATES[sub].nameKo}
                </button>
              ))}
            </div>

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
                gap: "5px"
              }}
            >
              <span>{audioEnabled ? "🔔" : "🔕"}</span>
              <span>{audioEnabled ? "Haptics ON" : "Muted"}</span>
            </button>

            {/* Swiss Grid Toggle */}
            <button
              onClick={() => setGridVisible(!gridVisible)}
              style={{
                background: gridVisible ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {gridVisible ? "Grid C1-C12" : "Grid Hidden"}
            </button>

            {/* Monograph Mode Toggle */}
            <button
              onClick={() => setIsMonographMode(true)}
              style={{
                backgroundColor: "#1E1C1A",
                color: "#FAF8F5",
                border: "none",
                borderRadius: "4px",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              📖 도록 뷰 (Monograph)
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Monograph Mode Button */}
      {isMonographMode && (
        <button
          onClick={() => setIsMonographMode(false)}
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
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
          ✕ 큐레이터 모드로 복귀 (Exit Monograph)
        </button>
      )}

      {/* Main Studio Viewport */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMonographMode ? "1fr" : "1fr 430px",
          flex: 1,
          minHeight: isMonographMode ? "100vh" : "calc(100vh - 65px)",
          transition: "all 0.3s ease"
        }}
      >
        {/* Left Column: The Interactive Exhibition Plinth */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #EAE4D9",
            backgroundColor: SUBSTRATES[substrate].bg,
            overflow: "hidden",
            transition: "background-color 0.4s ease"
          }}
        >
          {/* Plinth Canvas Controls Header */}
          {!isMonographMode && (
            <div
              style={{
                padding: "14px 24px",
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
                  Curated Presets:
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
                    {p.titleKo}
                  </button>
                ))}
              </div>

              {/* Lighting Slider Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", color: "#57534E" }}>
                <span>☀️ Azimuth: {lighting.azimuth}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={lighting.azimuth}
                  onChange={(e) =>
                    setLighting((prev) => ({
                      ...prev,
                      azimuth: Number(e.target.value),
                      presetName: "Custom Daylight"
                    }))
                  }
                  style={{ width: "80px", accentColor: "#C5A059" }}
                />
                <span>Elevation: {lighting.elevation}°</span>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={lighting.elevation}
                  onChange={(e) =>
                    setLighting((prev) => ({
                      ...prev,
                      elevation: Number(e.target.value),
                      presetName: "Custom Daylight"
                    }))
                  }
                  style={{ width: "70px", accentColor: "#C5A059" }}
                />
              </div>
            </div>
          )}

          {/* Interactive Workbench Surface */}
          <div
            ref={canvasRef}
            style={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: "560px",
              backgroundColor: SUBSTRATES[substrate].bg,
              cursor: isDragging ? "grabbing" : "default",
              overflow: "hidden"
            }}
          >
            {/* Subtle Texture Grain Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  substrate === "washi"
                    ? `radial-gradient(#E8DFC8 0.75px, transparent 0.75px)`
                    : substrate === "hinoki"
                    ? `repeating-linear-gradient(90deg, #E6DBC6, #E6DBC6 1px, transparent 1px, transparent 40px)`
                    : `radial-gradient(#D5CEC0 1px, transparent 1px)`,
                backgroundSize: substrate === "washi" ? "24px 24px" : substrate === "hinoki" ? "40px 100%" : "20px 20px",
                opacity: 0.5,
                pointerEvents: "none"
              }}
            />

            {/* Swiss 12-Column Blueprint Grid Overlay */}
            {gridVisible && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: "16px",
                  padding: "24px",
                  pointerEvents: "none",
                  opacity: 0.35
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      borderLeft: "1px dashed #C8BFA8",
                      borderRight: "1px dashed #C8BFA8",
                      height: "100%",
                      position: "relative"
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "4px",
                        fontSize: "9px",
                        fontFamily: "monospace",
                        color: "#9C927F"
                      }}
                    >
                      C{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Geometric Center Crosshair */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "16px",
                height: "16px",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                opacity: 0.35
              }}
            >
              <div style={{ position: "absolute", left: "7px", top: 0, bottom: 0, width: "1px", background: "#8A847C" }} />
              <div style={{ position: "absolute", top: "7px", left: 0, right: 0, height: "1px", background: "#8A847C" }} />
            </div>

            {/* Dynamic Center of Visual Gravity (Reticle) */}
            <div
              style={{
                position: "absolute",
                left: `${centerOfGravity.cx}%`,
                top: `${centerOfGravity.cy}%`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 10,
                transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
              }}
            >
              {/* Reticle Ring */}
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: `1.5px dashed ${centerOfGravity.balanceColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(2px)"
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: centerOfGravity.balanceColor
                  }}
                />
              </div>
              {!isMonographMode && (
                <div
                  style={{
                    position: "absolute",
                    top: "42px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    backgroundColor: "rgba(255, 255, 255, 0.94)",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    border: "1px solid #D8CFC2",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#4A453E",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                  }}
                >
                  Centroid: {centerOfGravity.cx.toFixed(0)}%, {centerOfGravity.cy.toFixed(0)}%
                </div>
              )}
            </div>

            {/* Connecting Torque Vector Lines from Objects to Centroid */}
            {vectorsVisible && (
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 2
                }}
              >
                {objects.map((obj) => (
                  <line
                    key={obj.id}
                    x1={`${obj.x}%`}
                    y1={`${obj.y}%`}
                    x2={`${centerOfGravity.cx}%`}
                    y2={`${centerOfGravity.cy}%`}
                    stroke={centerOfGravity.balanceColor}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity={selectedId === obj.id ? 0.85 : 0.3}
                  />
                ))}
              </svg>
            )}

            {/* Render Curated Tangible Artifacts */}
            {objects.map((obj) => {
              const isSelected = selectedId === obj.id;
              const isGrabbed = isDragging === obj.id;

              return (
                <div
                  key={obj.id}
                  onMouseDown={(e) => handleMouseDown(e, obj.id)}
                  style={{
                    position: "absolute",
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    transform: `translate(-50%, -50%) scale(${isGrabbed ? 1.08 : 1})`,
                    cursor: isGrabbed ? "grabbing" : "grab",
                    zIndex: isGrabbed ? 20 : isSelected ? 15 : 5,
                    transition: isGrabbed ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}
                >
                  {/* Dynamic Ray-Traced Material Drop Shadow */}
                  <div
                    style={{
                      position: "absolute",
                      width: `${obj.size * 0.9}px`,
                      height: `${obj.size * 0.55}px`,
                      borderRadius: "50%",
                      backgroundColor: "rgba(40, 30, 20, 0.28)",
                      filter: `blur(${shadowStyles.blur}px)`,
                      transform: `translate(${shadowStyles.sx}px, ${shadowStyles.sy + obj.size * 0.35}px)`,
                      pointerEvents: "none"
                    }}
                  />

                  {/* Physical Artifact SVG Render with Specular Lighting */}
                  <div
                    style={{
                      width: `${obj.size}px`,
                      height: `${obj.size}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}
                  >
                    {/* SVG 1: Stoneware Vessel */}
                    {obj.id === "vessel" && (
                      <svg width={obj.size} height={obj.size} viewBox="0 0 100 100" fill="none">
                        <defs>
                          <radialGradient id="vesselGrad2" cx="35%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#DF8F72" />
                            <stop offset="45%" stopColor="#B85D38" />
                            <stop offset="85%" stopColor="#8A3E20" />
                            <stop offset="100%" stopColor="#5E2711" />
                          </radialGradient>
                          <linearGradient id="vesselLip2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E2A690" />
                            <stop offset="100%" stopColor="#8A3E20" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 28 32 C 24 50, 22 72, 36 84 C 44 89, 56 89, 64 84 C 78 72, 76 50, 72 32 Z"
                          fill="url(#vesselGrad2)"
                        />
                        <ellipse cx="50" cy="32" rx="22" ry="8" fill="#5E2711" />
                        <ellipse cx="50" cy="32" rx="20" ry="6.5" fill="#3D1808" />
                        <ellipse cx="50" cy="31" rx="22" ry="8" fill="none" stroke="url(#vesselLip2)" strokeWidth="1.5" />
                        <path d="M 27 48 C 36 53, 64 53, 73 48" stroke="#D68160" strokeWidth="0.75" strokeOpacity="0.5" fill="none" />
                        <path d="M 25 64 C 36 70, 64 70, 75 64" stroke="#8A3E20" strokeWidth="0.75" strokeOpacity="0.6" fill="none" />
                      </svg>
                    )}

                    {/* SVG 2: Solid Brass Compass Divider */}
                    {obj.id === "compass" && (
                      <svg width={obj.size} height={obj.size} viewBox="0 0 100 100" fill="none">
                        <defs>
                          <linearGradient id="brassGrad2" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#F9E6B5" />
                            <stop offset="40%" stopColor="#C5A059" />
                            <stop offset="80%" stopColor="#947535" />
                            <stop offset="100%" stopColor="#5E491A" />
                          </linearGradient>
                          <linearGradient id="brassHinge2" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="50%" stopColor="#C5A059" />
                            <stop offset="100%" stopColor="#5E491A" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="22" r="7" fill="url(#brassHinge2)" />
                        <circle cx="50" cy="22" r="3" fill="#3E3011" />
                        <polygon points="48,22 46,26 28,88 32,88 50,26" fill="url(#brassGrad2)" />
                        <polygon points="52,22 50,26 68,88 72,88 54,26" fill="url(#brassGrad2)" />
                        <polygon points="28,88 30,94 32,88" fill="#EAEAEA" />
                        <polygon points="68,88 70,94 72,88" fill="#EAEAEA" />
                        <path d="M 38 52 A 25 25 0 0 1 62 52" stroke="url(#brassGrad2)" strokeWidth="3" fill="none" />
                        <circle cx="50" cy="46" r="3.5" fill="#3E3011" stroke="#F9E6B5" strokeWidth="1" />
                      </svg>
                    )}

                    {/* SVG 3: Raw Flax Linen Monograph Notebook */}
                    {obj.id === "notebook" && (
                      <svg width={obj.size} height={obj.size} viewBox="0 0 100 100" fill="none">
                        <defs>
                          <linearGradient id="linenCover2" x1="0" y1="0" x2="1" y2="0.8">
                            <stop offset="0%" stopColor="#EAE3D5" />
                            <stop offset="50%" stopColor="#D3C8B4" />
                            <stop offset="100%" stopColor="#B3A690" />
                          </linearGradient>
                        </defs>
                        <rect x="22" y="24" width="56" height="68" rx="2" fill="url(#linenCover2)" stroke="#9C8F79" strokeWidth="1" />
                        <rect x="22" y="24" width="7" height="68" rx="1" fill="#9C8F79" />
                        <line x1="29" y1="36" x2="78" y2="36" stroke="#9C8F79" strokeWidth="0.5" strokeOpacity="0.4" />
                        <line x1="29" y1="48" x2="78" y2="48" stroke="#9C8F79" strokeWidth="0.5" strokeOpacity="0.4" />
                        <line x1="29" y1="60" x2="78" y2="60" stroke="#9C8F79" strokeWidth="0.5" strokeOpacity="0.4" />
                        <line x1="29" y1="72" x2="78" y2="72" stroke="#9C8F79" strokeWidth="0.5" strokeOpacity="0.4" />
                        <rect x="36" y="32" width="34" height="12" fill="#C5BAA5" rx="1" opacity="0.6" />
                        <line x1="40" y1="38" x2="66" y2="38" stroke="#685E4E" strokeWidth="1.2" />
                      </svg>
                    )}

                    {/* SVG 4: Celadon Crackle-Glazed Porcelain Bowl */}
                    {obj.id === "bowl" && (
                      <svg width={obj.size} height={obj.size} viewBox="0 0 100 100" fill="none">
                        <defs>
                          <radialGradient id="celadonGrad2" cx="40%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#C4D7CA" />
                            <stop offset="45%" stopColor="#96AD9D" />
                            <stop offset="85%" stopColor="#6E8574" />
                            <stop offset="100%" stopColor="#4A5C4F" />
                          </radialGradient>
                          <linearGradient id="celadonRim2" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="50%" stopColor="#A6BCAD" />
                            <stop offset="100%" stopColor="#5E7364" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 18 36 C 20 64, 38 84, 50 84 C 62 84, 80 64, 82 36 Z"
                          fill="url(#celadonGrad2)"
                        />
                        <path d="M 30 42 L 38 58 L 34 72" stroke="#526456" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
                        <path d="M 50 36 L 46 54 L 56 68 L 52 82" stroke="#526456" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
                        <path d="M 68 40 L 62 56 L 68 70" stroke="#526456" strokeWidth="0.6" strokeOpacity="0.45" fill="none" />
                        <ellipse cx="50" cy="36" rx="32" ry="7" fill="url(#celadonGrad2)" stroke="url(#celadonRim2)" strokeWidth="1" />
                        <ellipse cx="50" cy="37" rx="26" ry="4.5" fill="#586E5E" opacity="0.6" />
                      </svg>
                    )}
                  </div>

                  {/* Micro Metadata Tag on Hover / Select */}
                  {!isMonographMode && (
                    <div
                      style={{
                        marginTop: "6px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        opacity: isSelected ? 1 : 0.85,
                        transition: "opacity 0.2s ease"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#1E1C1A",
                          backgroundColor: "rgba(255, 255, 255, 0.94)",
                          padding: "2px 8px",
                          borderRadius: "2px",
                          border: "1px solid #E2DCD1",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}
                      >
                        {obj.nameKo}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingId(obj.id);
                          playMaterialSound(obj);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "10px",
                          color: "#857E74",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: "2px"
                        }}
                      >
                        🔍 물성 상세 검사 (Inspect)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
            <span>SUBSTRATE: {SUBSTRATES[substrate].nameEn.toUpperCase()}</span>
            <span>BALANCE HARMONY SCORE: {centerOfGravity.harmonyScore} / 100</span>
            <span>TOTAL VISUAL MASS: {objects.reduce((acc, o) => acc + o.visualMass, 0)} UNITS</span>
          </div>
        </div>

        {/* Right Column: Editorial Typographic Monograph & Balance Compensator */}
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
            {/* Editorial Title Section */}
            <div
              style={{
                transform: `translate(${typoOffset.typoShiftX}px, ${typoOffset.typoShiftY}px)`,
                transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
              }}
            >
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
                CHAPTER 029 · ESSAY & EXPERIMENT
              </div>

              <h1
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "26px",
                  lineHeight: 1.25,
                  fontWeight: 500,
                  color: "#1E1C1A",
                  margin: "0 0 12px 0",
                  letterSpacing: `${typoOffset.trackingEm}em`,
                  transition: "letter-spacing 0.2s ease"
                }}
              >
                The Weight of the Object: Asymmetrical Spatial Balance
              </h1>

              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#7E7569",
                  margin: "0 0 20px 0",
                  lineHeight: 1.5
                }}
              >
                사물의 무게와 에디토리얼 균형: 비대칭 공간 위의 물성과 여백의 호흡
              </h2>

              {/* Live Center of Gravity Telemetry Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5DFD4",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "24px",
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
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <span>Composition Telemetry</span>
                  <span style={{ color: centerOfGravity.balanceColor }}>{centerOfGravity.balanceStateKo}</span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "12px",
                    color: "#57534E",
                    fontFamily: "monospace"
                  }}
                >
                  <div>
                    <span style={{ color: "#9E978C" }}>Centroid X:</span> {centerOfGravity.cx.toFixed(1)}%
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Centroid Y:</span> {centerOfGravity.cy.toFixed(1)}%
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Eccentricity:</span> {centerOfGravity.distanceFromCenter.toFixed(1)} px
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Typo Tracking:</span> +{typoOffset.trackingEm.toFixed(3)}em
                  </div>
                </div>

                {/* Dynamic Balance Meter Bar */}
                <div
                  style={{
                    marginTop: "12px",
                    height: "4px",
                    width: "100%",
                    backgroundColor: "#F0EAE1",
                    borderRadius: "2px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${centerOfGravity.harmonyScore}%`,
                      backgroundColor: centerOfGravity.balanceColor,
                      transition: "width 0.2s ease, background-color 0.2s ease"
                    }}
                  />
                </div>
              </div>

              {/* Editorial Monograph Paragraph */}
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.75,
                  color: "#4A453E",
                  textAlign: "justify",
                  marginBottom: "20px"
                }}
              >
                <p style={{ margin: "0 0 12px 0" }}>
                  사물은 결코 혼자 존재하지 않습니다. 장석 점토를 구워낸 투박한 도기 잔, 단단한 황동 디바이더, 거친 린넨 제본 노트를 지면 위에 놓는 순간, 사물이 지닌 물성과 질감은 화면 전체에 보이지 않는 시각적 무게를 부여합니다.
                </p>
                <p style={{ margin: 0 }}>
                  왼쪽 작업대 위의 사물들을 드래그하여 움직여 보십시오. 시각적 무게중심이 이동함에 따라, 이 오른쪽 열의 활자와 여백이 사물의 무게에 화답하며 스스로 자간을 열고 닫으며 완전한 비대칭 평형을 유지합니다.
                </p>
              </div>
            </div>

            {/* Curated Artifact List with Acoustic Triggers */}
            <div style={{ borderTop: "1px solid #EAE4D9", paddingTop: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#857E74",
                  marginBottom: "12px"
                }}
              >
                Curated Artifacts (Click to Inspect)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {objects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedId(obj.id);
                      setInspectingId(obj.id);
                      playMaterialSound(obj);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: selectedId === obj.id ? "#FFFFFF" : "#FAF6F0",
                      border: `1px solid ${selectedId === obj.id ? "#C5A059" : "#E5DFD4"}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "2px",
                          backgroundColor: obj.baseColor
                        }}
                      />
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#1E1C1A" }}>{obj.nameKo}</div>
                        <div style={{ fontSize: "10px", color: "#857E74" }}>{obj.material}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#57534E" }}>
                        Mass: {obj.visualMass}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Macro Inspection Modal */}
      {inspectedObject && (
        <div
          onClick={() => setInspectingId(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(30, 28, 26, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FAF8F5",
              border: "1px solid #D8CFC2",
              borderRadius: "8px",
              maxWidth: "520px",
              width: "100%",
              padding: "32px",
              boxShadow: "0 16px 36px rgba(0,0,0,0.14)",
              position: "relative"
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setInspectingId(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#857E74"
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "3px",
                  backgroundColor: inspectedObject.baseColor
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#857E74",
                    fontFamily: "monospace"
                  }}
                >
                  MATERIAL ARCHIVE & TACTILE PROFILE
                </span>
                <h3
                  style={{
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: "2px 0 0 0",
                    color: "#1E1C1A"
                  }}
                >
                  {inspectedObject.nameKo}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#57534E", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              {inspectedObject.descriptionKo}
            </p>
            <p style={{ fontSize: "12px", color: "#7E7569", lineHeight: 1.5, margin: "0 0 20px 0", fontStyle: "italic" }}>
              {inspectedObject.descriptionEn}
            </p>

            {/* Material Specs Table */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EAE4D9",
                borderRadius: "4px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "11px",
                marginBottom: "20px"
              }}
            >
              {inspectedObject.specs.map((s, idx) => (
                <div key={idx}>
                  <div style={{ color: "#9E978C", textTransform: "uppercase", fontSize: "9px" }}>{s.label}</div>
                  <div style={{ fontWeight: 600, color: "#1E1C1A", marginTop: "2px" }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Test Resonance Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => playMaterialSound(inspectedObject)}
                style={{
                  backgroundColor: "#F2ECE4",
                  border: "1px solid #D8CFC2",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  color: "#1E1C1A",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>🔔 물성 공명음 청취 ({inspectedObject.resonanceHz}Hz)</span>
              </button>
              <span style={{ fontSize: "11px", color: "#857E74" }}>Visual Mass: {inspectedObject.visualMass}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
