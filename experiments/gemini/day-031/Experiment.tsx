import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export type LouverMaterial = "hinoki" | "brass" | "basalt";

export interface LouverMaterialProfile {
  id: LouverMaterial;
  nameKo: string;
  nameEn: string;
  bladeColor: string;
  bladeBorder: string;
  shadowColor: string;
  shadowOpacity: number;
  resonanceHz: number;
  tactileTone: string;
  descKo: string;
}

export interface SolarPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  elevation: number; // deg (8 to 85)
  azimuth: number; // deg (0 to 360)
  louverAngle: number; // deg (0 to 90)
  colorTempK: number;
  descKo: string;
}

// Materials Profile Matrix
const MATERIALS: Record<LouverMaterial, LouverMaterialProfile> = {
  hinoki: {
    id: "hinoki",
    nameKo: "편백 원목 루버",
    nameEn: "Turned Hinoki Wood",
    bladeColor: "#D8C7B0",
    bladeBorder: "#BFA98F",
    shadowColor: "rgba(45, 34, 22, 0.48)",
    shadowOpacity: 0.45,
    resonanceHz: 280,
    tactileTone: "따스한 목재 섬유질과 유기적 분산광",
    descKo: "따스한 나무결을 품은 자연 원목 슬랫으로, 빛을 은은하게 흡수하며 부드러운 음영을 만듭니다."
  },
  brass: {
    id: "brass",
    nameKo: "절삭 황동 블레이드",
    nameEn: "Architectural Milled Brass",
    bladeColor: "#C5A059",
    bladeBorder: "#9E7B35",
    shadowColor: "rgba(40, 30, 15, 0.58)",
    shadowOpacity: 0.55,
    resonanceHz: 780,
    tactileTone: "금속성 거울 반사와 날카로운 면도날 그림자",
    descKo: "금빛 금속성 광택의 압출 황동 날개로, 날카로운 모서리 반사와 선명한 직선 그림자를 투영합니다."
  },
  basalt: {
    id: "basalt",
    nameKo: "연마 현무암 핀",
    nameEn: "Honed Basalt Fins",
    bladeColor: "#3D3935",
    bladeBorder: "#25221F",
    shadowColor: "rgba(20, 18, 16, 0.68)",
    shadowOpacity: 0.65,
    resonanceHz: 160,
    tactileTone: "석재의 묵직한 중력과 완전 차단 칠흑 음영",
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
    azimuth: 42,
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
    louverAngle: 84,
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
    elevation: 9,
    azimuth: 110,
    louverAngle: 12,
    colorTempK: 2100,
    descKo: "외부의 빛을 차단하고 실내의 부드러운 벽등만으로 글자의 음각을 은은하게 비추는 아늑한 밤의 풍경."
  }
];

export default function Experiment() {
  // State
  const [material, setMaterial] = useState<LouverMaterial>("hinoki");
  const [elevation, setElevation] = useState<number>(18); // 8 to 85 deg
  const [azimuth, setAzimuth] = useState<number>(42); // 0 to 360 deg
  const [louverAngle, setLouverAngle] = useState<number>(32); // 0 (closed) to 90 (open)
  const [activePreset, setActivePreset] = useState<string>("dawn_raking");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [ambientDroneEnabled, setAmbientDroneEnabled] = useState<boolean>(false);
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [showRayOverlay, setShowRayOverlay] = useState<boolean>(true);
  const [showDraftingGrid, setShowDraftingGrid] = useState<boolean>(true);

  // Mouse drag & cursor tracking
  const [isDraggingWall, setIsDraggingWall] = useState<boolean>(false);
  const [isDraggingSlat, setIsDraggingSlat] = useState<boolean>(false);
  const [isDraggingCompass, setIsDraggingCompass] = useState<boolean>(false);
  const [cursorGlintPos, setCursorGlintPos] = useState<{ x: number; y: number } | null>(null);

  const galleryWallRef = useRef<HTMLDivElement | null>(null);
  const compassRef = useRef<SVGSVGElement | null>(null);
  const slatSvgRef = useRef<SVGSVGElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOsc1Ref = useRef<OscillatorNode | null>(null);
  const ambientOsc2Ref = useRef<OscillatorNode | null>(null);

  // Initialize Web Audio API safely
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, []);

  // Mechanical Slat Tilt Sound Synthesizer
  const playSlatSound = useCallback(
    (frequency: number = 280, isSharp: boolean = false) => {
      if (!audioEnabled) return;
      try {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sound characteristics vary by material
        if (material === "brass") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(frequency * 1.5, now);
          osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 0.18);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        } else if (material === "basalt") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(frequency, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        } else {
          // Hinoki Wood
          osc.type = "triangle";
          osc.frequency.setValueAtTime(frequency, now);
          osc.frequency.exponentialRampToValueAtTime(75, now + 0.12);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch {
        // Safe fallback
      }
    },
    [audioEnabled, initAudio, material]
  );

  // Solar Ambient Drone Toggle
  const toggleAmbientDrone = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    if (ambientDroneEnabled) {
      // Fade out
      if (ambientGainRef.current) {
        ambientGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      setTimeout(() => {
        try {
          ambientOsc1Ref.current?.stop();
          ambientOsc2Ref.current?.stop();
          ambientOsc1Ref.current?.disconnect();
          ambientOsc2Ref.current?.disconnect();
        } catch {
          // Ignore
        }
        ambientOsc1Ref.current = null;
        ambientOsc2Ref.current = null;
        ambientGainRef.current = null;
        setAmbientDroneEnabled(false);
      }, 250);
    } else {
      // Start drone
      try {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.8);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();

        // 108Hz / 216Hz sacred solar harmonic
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(108, ctx.currentTime);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(216.4, ctx.currentTime);

        osc1.connect(masterGain);
        osc2.connect(masterGain);
        masterGain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        ambientOsc1Ref.current = osc1;
        ambientOsc2Ref.current = osc2;
        ambientGainRef.current = masterGain;
        setAmbientDroneEnabled(true);
      } catch {
        // Fallback
      }
    }
  }, [ambientDroneEnabled, initAudio]);

  // Adjust drone frequency according to Kelvin temperature
  useEffect(() => {
    if (ambientDroneEnabled && audioCtxRef.current && ambientOsc1Ref.current) {
      const baseFreq = 90 + ((elevation - 8) / 77) * 36;
      ambientOsc1Ref.current.frequency.setTargetAtTime(baseFreq, audioCtxRef.current.currentTime, 0.15);
      if (ambientOsc2Ref.current) {
        ambientOsc2Ref.current.frequency.setTargetAtTime(baseFreq * 2.002, audioCtxRef.current.currentTime, 0.15);
      }
    }
  }, [elevation, ambientDroneEnabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      try {
        ambientOsc1Ref.current?.stop();
        ambientOsc2Ref.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        // Safe cleanup
      }
    };
  }, []);

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

  // Diurnal Color Temperature Curve & Lighting Values
  const colorTempInfo = useMemo(() => {
    const normalizedEl = Math.sin((Math.max(5, elevation) * Math.PI) / 180);
    const kelvin = Math.round(2200 + normalizedEl * 3300);

    let lightTint = "#FFFDF9"; // noon crisp
    let ambientWarmth = "rgba(255, 248, 235, 0.38)";
    let rayStrokeColor = "rgba(235, 200, 140, 0.65)";
    let moodKo = "한낮의 청량한 자연광 (Solar Zenith)";
    let moodEn = "Solar Zenith";

    if (kelvin < 2600) {
      lightTint = "#EFA651"; // dawn warm amber
      ambientWarmth = "rgba(239, 166, 81, 0.52)";
      rayStrokeColor = "rgba(239, 166, 81, 0.75)";
      moodKo = "새벽의 촛불빛 호박색 (Dawn Amber)";
      moodEn = "Dawn Grazing Amber";
    } else if (kelvin < 3200) {
      lightTint = "#E28751"; // golden hour
      ambientWarmth = "rgba(226, 135, 81, 0.45)";
      rayStrokeColor = "rgba(226, 135, 81, 0.7)";
      moodKo = "석양의 황금빛 테라코타 (Golden Terracotta)";
      moodEn = "Golden Terracotta";
    } else if (kelvin < 4500) {
      lightTint = "#FCECD5"; // soft afternoon
      ambientWarmth = "rgba(252, 236, 213, 0.4)";
      rayStrokeColor = "rgba(220, 190, 150, 0.6)";
      moodKo = "부드러운 오후의 햇살 (Late Afternoon)";
      moodEn = "Late Afternoon";
    }

    return { kelvin, lightTint, ambientWarmth, rayStrokeColor, moodKo, moodEn };
  }, [elevation]);

  // Dynamic Shadow Band Geometry & Vector Offsets
  const shadowBands = useMemo(() => {
    const radEl = (Math.max(5, elevation) * Math.PI) / 180;
    const radAz = (azimuth * Math.PI) / 180;

    // Louver opening factor: 0 is closed (solid shadow), 90 is full light
    const openFactor = Math.sin((louverAngle * Math.PI) / 180);
    const shadowStripeWidth = Math.max(10, Math.min(84, (1 - openFactor) * 72 + 14));
    const shadowGap = Math.max(12, openFactor * 88 + 12);
    const bandAngle = (radAz * 180) / Math.PI * 0.28;

    // Dual-offset vectors for Emboss typography
    const rayLength = Math.max(1.8, Math.min(7.5, 7.5 / Math.tan(radEl)));
    const embDx = -Math.cos(radAz) * rayLength;
    const embDy = -Math.sin(radAz) * rayLength;

    // Contrast ratio estimation (WCAG)
    const lBright = 0.85 + (elevation / 90) * 0.12;
    const lShadow = 0.15 + (1 - openFactor) * 0.25;
    const contrastRatio = ((lBright + 0.05) / (lShadow + 0.05)).toFixed(1);

    return { shadowStripeWidth, shadowGap, bandAngle, embDx, embDy, contrastRatio };
  }, [elevation, azimuth, louverAngle]);

  const activeMaterial = MATERIALS[material];

  // --- Interactive Dragging Handlers ---
  // 1. Direct Wall Drag: Sweeps Solar Azimuth (X) and Elevation (Y)
  const handleWallMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingWall(true);
    handleWallMouseMove(e);
  };

  const handleWallMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryWallRef.current) return;
    const rect = galleryWallRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    // Update glint position
    setCursorGlintPos({ x: relX, y: relY });

    if (isDraggingWall) {
      // Map X -> Azimuth (0 to 360 deg)
      const newAz = Math.round((relX / rect.width) * 360);
      // Map Y -> Elevation (85 down to 8 deg)
      const newEl = Math.round(85 - (relY / rect.height) * 77);

      setAzimuth(newAz);
      setElevation(Math.max(8, Math.min(85, newEl)));
      setActivePreset("custom");
    }
  };

  const handleWallMouseUp = () => {
    setIsDraggingWall(false);
  };

  // 2. Direct Slat Cross-Section Drag: Rotates Louver Angle (0° to 90°)
  const handleSlatMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDraggingSlat(true);
    handleSlatMouseMove(e);
  };

  const handleSlatMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingSlat || !slatSvgRef.current) return;
    const rect = slatSvgRef.current.getBoundingClientRect();
    const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    // Drag up/down adjusts louver angle
    const angle = Math.round(90 - (relY / rect.height) * 90);
    const clamped = Math.max(0, Math.min(90, angle));
    setLouverAngle(clamped);
    setActivePreset("custom");
    if (Math.abs(clamped - louverAngle) > 6) {
      playSlatSound(260);
    }
  };

  // 3. Celestial Compass Drag: Sweeps Azimuth in 360° circle
  const handleCompassMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDraggingCompass(true);
    handleCompassMouseMove(e);
  };

  const handleCompassMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingCompass || !compassRef.current) return;
    const rect = compassRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let theta = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (theta < 0) theta += 360;
    setAzimuth(Math.round(theta));
    setActivePreset("custom");
  };

  // Global mouseup listener for drag release
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingWall(false);
      setIsDraggingSlat(false);
      setIsDraggingCompass(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

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
        overflowX: "hidden",
        userSelect: isDraggingWall || isDraggingSlat || isDraggingCompass ? "none" : "auto"
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
            zIndex: 30,
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: "italic",
                fontSize: "23px",
                fontWeight: 500,
                color: "#1E1C1A",
                letterSpacing: "-0.015em"
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Louver Material Switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#F2ECE4",
                padding: "3px",
                borderRadius: "5px",
                border: "1px solid #E6DEC8"
              }}
            >
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
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: material === mKey ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease"
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
                background: showRayOverlay ? "#1E1C1A" : "transparent",
                color: showRayOverlay ? "#FAF8F5" : "#4A453E",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {showRayOverlay ? "☀️ Solar Ray Vectors [ON]" : "☀️ Ray Vectors [OFF]"}
            </button>

            {/* Drafting Grid Toggle */}
            <button
              onClick={() => setShowDraftingGrid(!showDraftingGrid)}
              style={{
                background: showDraftingGrid ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showDraftingGrid ? "📐 Grid [ON]" : "📐 Grid [OFF]"}
            </button>

            {/* Haptic & Drone Audio Toggles */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                title="기계식 슬랫 햅틱 사운드"
                style={{
                  background: audioEnabled ? "#F2ECE4" : "transparent",
                  border: "1px solid #D8CFC2",
                  borderRadius: "4px",
                  padding: "5px 9px",
                  fontSize: "11px",
                  color: "#4A453E",
                  cursor: "pointer"
                }}
              >
                {audioEnabled ? "🔔 Haptics" : "🔕 Muted"}
              </button>

              <button
                onClick={toggleAmbientDrone}
                title="태양 색온도 연동 공명 하모닉 드론"
                style={{
                  background: ambientDroneEnabled ? "#B85D38" : "transparent",
                  color: ambientDroneEnabled ? "#FFFFFF" : "#4A453E",
                  border: "1px solid #D8CFC2",
                  borderRadius: "4px",
                  padding: "5px 9px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                {ambientDroneEnabled ? "🌊 Solar Drone ON" : "🌊 Drone OFF"}
              </button>
            </div>

            {/* Fullscreen Monograph Mode */}
            <button
              onClick={() => setIsMonographMode(true)}
              style={{
                backgroundColor: "#1E1C1A",
                color: "#FAF8F5",
                border: "none",
                borderRadius: "4px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.03em"
              }}
            >
              📖 건축 파빌리온 전면 뷰
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
            top: "24px",
            right: "28px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid #D8CFC2",
            borderRadius: "20px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1E1C1A",
            cursor: "pointer",
            zIndex: 100,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
          }}
        >
          ✕ 큐레이터 모드로 복귀 (Exit Monograph)
        </button>
      )}

      {/* Main Studio Viewport */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMonographMode ? "1fr" : "1fr 440px",
          flex: 1,
          minHeight: isMonographMode ? "100vh" : "calc(100vh - 65px)",
          transition: "all 0.3s ease"
        }}
      >
        {/* Left Column: Architectural Sunroom Gallery Wall */}
        <div
          ref={galleryWallRef}
          onMouseDown={handleWallMouseDown}
          onMouseMove={handleWallMouseMove}
          onMouseUp={handleWallMouseUp}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #EAE4D9",
            backgroundColor: "#FAF6F0",
            overflow: "hidden",
            cursor: isDraggingWall ? "grabbing" : "crosshair"
          }}
        >
          {/* Top Presets & Interactive Quick Bar */}
          {!isMonographMode && (
            <div
              style={{
                padding: "10px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E6DEC8",
                backgroundColor: "#FAF8F5",
                zIndex: 20,
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              {/* Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#857E74",
                    fontFamily: "monospace"
                  }}
                >
                  PRESETS:
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
                      padding: "4px 9px",
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

              {/* Direct Drag Instruction Badge */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#857E74",
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>💡 [드래그 조작] 벽면 드래그: 태양 방위각/고도 조절 · 루버 슬랫 드래그: 회전각 조절</span>
              </div>
            </div>
          )}

          {/* Gallery Plaster Wall Viewport */}
          <div
            style={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: "620px",
              backgroundColor: "#FAF6F0",
              overflow: "hidden",
              padding: "50px 70px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Background Drafting Grid (Optional Architectural Grid) */}
            {showDraftingGrid && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(to right, rgba(160, 150, 135, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(160, 150, 135, 0.08) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  pointerEvents: "none"
                }}
              />
            )}

            {/* Ambient Sunlight Wash Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at ${50 + Math.cos((azimuth * Math.PI) / 180) * 38}% ${
                  35 - Math.sin((elevation * Math.PI) / 180) * 28
                }%, ${colorTempInfo.ambientWarmth}, transparent 75%)`,
                pointerEvents: "none",
                transition: "background 0.2s ease"
              }}
            />

            {/* Rhythmic Louver Shadow Bands Overlay (Brise-Soleil Stripes) */}
            <div
              style={{
                position: "absolute",
                inset: "-50%",
                width: "200%",
                height: "200%",
                background: `repeating-linear-gradient(${shadowBands.bandAngle}deg, ${activeMaterial.shadowColor}, ${activeMaterial.shadowColor} ${shadowBands.shadowStripeWidth}px, transparent ${shadowBands.shadowStripeWidth}px, transparent ${
                  shadowBands.shadowStripeWidth + shadowBands.shadowGap
                }px)`,
                pointerEvents: "none",
                mixBlendMode: "multiply",
                transition: "background 0.25s ease"
              }}
            />

            {/* Architectural Ray Vector Overlay (SVG Projected Lines) */}
            {showRayOverlay && (
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 8
                }}
              >
                {/* Projected Sunbeam Vectors */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const startX = 60 + i * 110;
                  const startY = 10;
                  const length = 550;
                  const radAz = (azimuth * Math.PI) / 180;
                  const radEl = (elevation * Math.PI) / 180;
                  const endX = startX + Math.cos(radAz) * length * Math.cos(radEl);
                  const endY = startY + Math.sin(radEl) * length;

                  return (
                    <g key={i}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke={colorTempInfo.rayStrokeColor}
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        opacity={0.7}
                      />
                      {i === 2 && (
                        <text
                          x={startX + 30}
                          y={startY + 70}
                          fill="#8A847C"
                          fontSize="9"
                          fontFamily="monospace"
                          transform={`rotate(${shadowBands.bandAngle}, ${startX + 30}, ${startY + 70})`}
                        >
                          θ_inc = {elevation}° / α_slat = {louverAngle}°
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Top Louver Slat Physical Frame & Slat Status */}
            <div
              style={{
                position: "relative",
                zIndex: 15,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(138, 132, 124, 0.3)",
                paddingBottom: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: colorTempInfo.lightTint,
                    border: "1px solid #C5BCAD",
                    boxShadow: "0 0 10px rgba(255,255,255,0.8)"
                  }}
                />
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#4A453E", fontWeight: 600 }}>
                  DIURNAL TEMPERATURE: {colorTempInfo.kelvin}K ({colorTempInfo.moodKo})
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", fontFamily: "monospace", color: "#8A847C" }}>
                <span>CONTRAST RATIO: {shadowBands.contrastRatio}:1</span>
                <span>APERTURE: {louverAngle}° ({activeMaterial.nameEn.toUpperCase()})</span>
              </div>
            </div>

            {/* Center Monumental Typography Pavilion */}
            <div style={{ position: "relative", zIndex: 15, maxWidth: "820px", marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#B85D38",
                  marginBottom: "16px",
                  fontFamily: "monospace",
                  fontWeight: 600
                }}
              >
                CHAPTER 031 · THE DIURNAL SUNDIAL & BRISE-SOLEIL
              </div>

              {/* Embossed Main Masthead (Dual Opposing Shadows Reacting to Incident Sun) */}
              <h1
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "54px",
                  lineHeight: 1.14,
                  fontWeight: 500,
                  margin: "0 0 24px 0",
                  color: "#2C2824",
                  letterSpacing: "-0.02em",
                  textShadow: `${shadowBands.embDx * 1.3}px ${shadowBands.embDy * 1.3}px 3px rgba(255, 255, 255, 0.96), ${
                    -shadowBands.embDx * 1.5
                  }px ${-shadowBands.embDy * 1.5}px 7px rgba(45, 35, 25, 0.38)`,
                  transition: "text-shadow 0.15s ease"
                }}
              >
                Light does not merely illuminate form; it carves it.
              </h1>

              {/* Korean Subtitle with Tactile Inset Relief */}
              <h2
                style={{
                  fontSize: "20px",
                  lineHeight: 1.65,
                  fontWeight: 400,
                  color: "#4A453E",
                  margin: "0 0 28px 0",
                  textShadow: `${shadowBands.embDx * 0.8}px ${shadowBands.embDy * 0.8}px 2px rgba(255, 255, 255, 0.9), ${
                    -shadowBands.embDx
                  }px ${-shadowBands.embDy}px 4px rgba(45, 35, 25, 0.28)`
                }}
              >
                빛은 사물을 비추는 광원이 아니라, 공간과 글자를 깎아내는 보이지 않는 조각가의 끌이다.
              </h2>

              {/* Interactive Saccadic Editorial Card */}
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.85,
                  color: "#38342F",
                  maxWidth: "720px",
                  textAlign: "justify",
                  backgroundColor: "rgba(255, 255, 255, 0.65)",
                  backdropFilter: "blur(6px)",
                  padding: "24px 28px",
                  borderRadius: "5px",
                  border: "1px solid rgba(226, 218, 205, 0.85)",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.03)"
                }}
              >
                벽면 아무 곳이나 마우스로 드래그하여 태양의 고도와 방위각을 직접 회전시켜 보십시오.
                새벽 14도의 긴 측광이 창문을 넘어올 때, 르 코르뷔지에의 차양 블레이드는 빛을 정갈한 평행 스트라이프 악보로 해체합니다.
                그림자가 벽면의 형압 활자를 스쳐 지나갈 때, 글자는 눈부신 하이라이트와 깊은 침묵의 음영 사이를 유려하게 오가며 살아 숨 쉬는 건축적 안식처를 완성합니다.
              </div>
            </div>

            {/* Bottom Gallery Plinth Footer */}
            <div
              style={{
                position: "relative",
                zIndex: 15,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(138, 132, 124, 0.3)",
                paddingTop: "14px",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#7E7569",
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              <span>SUBSTRATE: HONED IVORY PLASTER (#FAF6F0)</span>
              <span>
                SHADOW BAND: W={shadowBands.shadowStripeWidth}PX / GAP={shadowBands.shadowGap}PX / ANGLE=
                {shadowBands.bandAngle.toFixed(1)}°
              </span>
              <span>MONTH 2 ARCHITECTURAL CANON · DAY 031</span>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Analysis & Diurnal Bento Telemetry */}
        {!isMonographMode && (
          <div
            style={{
              backgroundColor: "#FAF8F5",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
              boxSizing: "border-box"
            }}
          >
            {/* Header Title */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#8A847C",
                  marginBottom: "6px",
                  fontFamily: "monospace"
                }}
              >
                ARCHITECTURAL TELEMETRY · DAY 031
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1E1C1A",
                  margin: "0 0 6px 0"
                }}
              >
                The Raking Louver Pavilion
              </h2>
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#57534E", margin: 0 }}>
                30일 전 Day 001의 석각 반전 원리가 자연 상태의 해시계였다면, Day 031은 건축적 루버를 통해 빛을 분절하고 길들이는 인간의 공간적 조율입니다.
              </p>
            </div>

            {/* Interactive Louver Slat Physical Cross-Section Engine */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1E1C1A"
                  }}
                >
                  Interactive Slat Assembly (단면 조작)
                </span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#B85D38", fontWeight: 600 }}>
                  θ = {louverAngle}° TILT
                </span>
              </div>

              {/* Slat SVG Cross-section */}
              <div style={{ position: "relative", width: "100%", height: "130px", backgroundColor: "#FAF6F0", borderRadius: "4px", overflow: "hidden" }}>
                <svg
                  ref={slatSvgRef}
                  onMouseDown={handleSlatMouseDown}
                  onMouseMove={handleSlatMouseMove}
                  style={{ width: "100%", height: "100%", cursor: isDraggingSlat ? "grabbing" : "ns-resize" }}
                >
                  {/* Incident Sun Beam Vectors entering slats */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = 20 + i * 24;
                    return (
                      <g key={i}>
                        <line
                          x1="10"
                          y1={y}
                          x2="160"
                          y2={y + Math.tan((elevation * Math.PI) / 180) * 45}
                          stroke={colorTempInfo.rayStrokeColor}
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                      </g>
                    );
                  })}

                  {/* Slat Blades tilting with louverAngle */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const cx = 175;
                    const cy = 20 + i * 24;
                    const bladeLen = 42;
                    const rad = (louverAngle * Math.PI) / 180;
                    const x1 = cx - (Math.cos(rad) * bladeLen) / 2;
                    const y1 = cy - (Math.sin(rad) * bladeLen) / 2;
                    const x2 = cx + (Math.cos(rad) * bladeLen) / 2;
                    const y2 = cy + (Math.sin(rad) * bladeLen) / 2;

                    return (
                      <g key={i}>
                        {/* Blade Shadow projection */}
                        <line
                          x1={x2}
                          y1={y2}
                          x2={x2 + 80}
                          y2={y2 + (90 - louverAngle) * 0.8}
                          stroke={activeMaterial.shadowColor}
                          strokeWidth="3"
                          opacity={0.4}
                        />
                        {/* Slat Blade */}
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={activeMaterial.bladeColor}
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <circle cx={cx} cy={cy} r="2.5" fill="#1E1C1A" />
                      </g>
                    );
                  })}

                  {/* Dimension Annotations */}
                  <text x="250" y="30" fontSize="10" fontFamily="monospace" fill="#766F64">
                    P_pitch = 24mm
                  </text>
                  <text x="250" y="55" fontSize="10" fontFamily="monospace" fill="#766F64">
                    Aperture = {Math.round((louverAngle / 90) * 100)}%
                  </text>
                  <text x="250" y="80" fontSize="10" fontFamily="monospace" fill="#B85D38">
                    ↕ 드래그하여 회전
                  </text>
                </svg>
              </div>

              {/* Slat Slider Fallback */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                <span style={{ fontSize: "11px", color: "#6E685E" }}>폐쇄 (0°)</span>
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
                  style={{ flex: 1, margin: "0 12px", accentColor: "#B85D38" }}
                />
                <span style={{ fontSize: "11px", color: "#6E685E" }}>완전 개방 (90°)</span>
              </div>
            </div>

            {/* Celestial Compass & Diurnal Spectrum Bento Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1E1C1A"
                  }}
                >
                  Celestial Orbit Compass & Telemetry
                </span>
                <span style={{ color: "#B85D38", fontFamily: "monospace", fontSize: "11px" }}>
                  {colorTempInfo.kelvin}K
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* 360-Degree Interactive Compass Wheel */}
                <div style={{ width: "96px", height: "96px", flexShrink: 0 }}>
                  <svg
                    ref={compassRef}
                    onMouseDown={handleCompassMouseDown}
                    onMouseMove={handleCompassMouseMove}
                    viewBox="0 0 100 100"
                    style={{ width: "100%", height: "100%", cursor: isDraggingCompass ? "grabbing" : "grab" }}
                  >
                    <circle cx="50" cy="50" r="46" fill="#FAF6F0" stroke="#D8CFC2" strokeWidth="1.5" />
                    <line x1="50" y1="6" x2="50" y2="94" stroke="#E6DEC8" strokeWidth="1" />
                    <line x1="6" y1="50" x2="94" y2="50" stroke="#E6DEC8" strokeWidth="1" />
                    <text x="50" y="16" fontSize="8" textAnchor="middle" fill="#857E74" fontFamily="monospace">
                      N
                    </text>
                    <text x="88" y="53" fontSize="8" textAnchor="middle" fill="#857E74" fontFamily="monospace">
                      E
                    </text>
                    <text x="50" y="90" fontSize="8" textAnchor="middle" fill="#857E74" fontFamily="monospace">
                      S
                    </text>
                    <text x="12" y="53" fontSize="8" textAnchor="middle" fill="#857E74" fontFamily="monospace">
                      W
                    </text>

                    {/* Sun Position Indicator */}
                    {(() => {
                      const rad = ((azimuth - 90) * Math.PI) / 180;
                      const dist = 40 * (1 - elevation / 90);
                      const sx = 50 + Math.cos(rad) * dist;
                      const sy = 50 + Math.sin(rad) * dist;
                      return (
                        <g>
                          <line x1="50" y1="50" x2={sx} y2={sy} stroke="#C5A059" strokeWidth="1.5" />
                          <circle
                            cx={sx}
                            cy={sy}
                            r="6"
                            fill={colorTempInfo.lightTint}
                            stroke="#1E1C1A"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Telemetry Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "11px",
                    color: "#57534E",
                    fontFamily: "monospace",
                    flex: 1
                  }}
                >
                  <div>
                    <span style={{ color: "#9E978C" }}>Elevation:</span> {elevation}° Alt
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Azimuth:</span> {azimuth}° Az
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Relief Depth:</span> ±{Math.abs(shadowBands.embDx).toFixed(1)}px
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Contrast:</span> {shadowBands.contrastRatio}:1
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Material:</span> {activeMaterial.nameEn}
                  </div>
                  <div>
                    <span style={{ color: "#9E978C" }}>Acoustic:</span> {activeMaterial.resonanceHz}Hz
                  </div>
                </div>
              </div>

              {/* Color Temperature Indicator Bar */}
              <div style={{ marginTop: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#857E74", marginBottom: "4px", fontFamily: "monospace" }}>
                  <span>2200K Dawn</span>
                  <span>3500K Afternoon</span>
                  <span>5500K Noon</span>
                </div>
                <div
                  style={{
                    height: "7px",
                    width: "100%",
                    background: "linear-gradient(to right, #EFA651, #FCECD5, #FFFDF9, #E28751)",
                    borderRadius: "4px",
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-3px",
                      left: `${Math.min(96, Math.max(4, ((colorTempInfo.kelvin - 2200) / 3300) * 100))}%`,
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      backgroundColor: "#1E1C1A",
                      border: "2px solid #FFFFFF",
                      transform: "translateX(-50%)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Architectural Principles Box */}
            <div
              style={{
                backgroundColor: "#FAF6F0",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1E1C1A", marginBottom: "8px" }}>
                조형 메커니즘 3대 공리 (Axiom 31 Synthesis)
              </div>
              <div style={{ fontSize: "11px", color: "#6E685E", lineHeight: 1.65 }}>
                1. <strong>차양 분절 (Brise-Soleil)</strong>: 회전 슬랫이 직사광을 부드러운 평행 음영 띠로 분할.<br />
                2. <strong>형압 광학 돋을새김 (Blind Emboss)</strong>: 획의 상단 하이라이트와 하단 음각 골짜기가 자연광 입사각에 연동.<br />
                3. <strong>일영 리듬 (Diurnal Rhythm)</strong>: 2200K 새벽에서 5500K 정오로 이어지는 생체 리듬의 회복.
              </div>
            </div>

            {/* Month 2 Kickoff Milestone Badge */}
            <div style={{ borderTop: "1px solid #EAE4D9", paddingTop: "14px" }}>
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
