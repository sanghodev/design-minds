import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export type LiquidMaterialId = "glycerin" | "water" | "oil";

export interface LiquidMaterial {
  id: LiquidMaterialId;
  nameKo: string;
  nameEn: string;
  viscosity: number; // Damping factor (0.92 to 0.985)
  refractiveIndex: number; // Snell's n
  surfaceTension: number; // N/m
  resonanceHz: number;
  causticColor: string;
  accentColor: string;
  descKo: string;
}

export interface FluidPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  impulseForce: number;
  dropletCount: number;
  descKo: string;
}

// Substrates Matrix
const MATERIALS: Record<LiquidMaterialId, LiquidMaterial> = {
  glycerin: {
    id: "glycerin",
    nameKo: "순수 고점성 글리세린 (Pure Glycerin)",
    nameEn: "Viscous Pure Glycerin",
    viscosity: 0.952,
    refractiveIndex: 1.474,
    surfaceTension: 0.063,
    resonanceHz: 240,
    causticColor: "rgba(255, 240, 215, 0.88)",
    accentColor: "#D97706",
    descKo: "묵직하고 유려한 점성을 지녀 커서가 지나간 자리에 깊고 완만한 파동과 따스한 호박색 굴절광을 남깁니다."
  },
  water: {
    id: "water",
    nameKo: "알프스 천연수 (Alpine Spring Water)",
    nameEn: "Alpine Spring Water",
    viscosity: 0.978,
    refractiveIndex: 1.333,
    surfaceTension: 0.072,
    resonanceHz: 480,
    causticColor: "rgba(255, 255, 255, 0.92)",
    accentColor: "#0284C7",
    descKo: "극도로 맑고 즉각적인 모세관 파동을 일으키며, 면도날처럼 선명한 코스틱 그물망과 청량한 굴절광을 분출합니다."
  },
  oil: {
    id: "oil",
    nameKo: "광학 실리콘 오일 (Silicone Oil)",
    nameEn: "Optical Silicone Oil",
    viscosity: 0.938,
    refractiveIndex: 1.515,
    surfaceTension: 0.045,
    resonanceHz: 180,
    causticColor: "rgba(245, 235, 255, 0.85)",
    accentColor: "#7C3AED",
    descKo: "높은 굴절률과 강한 감쇠율을 지녀, 글자를 돋보기처럼 극적으로 왜곡하면서도 파동을 부드럽게 흡수합니다."
  }
};

// Presets
const PRESETS: FluidPreset[] = [
  {
    id: "zen",
    nameKo: "고요한 수면 (Zen Calm)",
    nameEn: "Resting Equilibrium",
    impulseForce: 0,
    dropletCount: 0,
    descKo: "외부 섭동이 완전히 가라앉아 거울처럼 잔잔해진 수면 아래 완벽한 스위스 모더니즘 정적 평형."
  },
  {
    id: "ripples",
    nameKo: "모세관 잔물결 (Capillary Waves)",
    nameEn: "Gentle Capillary Ripples",
    impulseForce: 24,
    dropletCount: 3,
    descKo: "표면장력에 의해 빗방울이 떨어지듯 동심원의 맑은 파동이 퍼져나가며 텍스트를 은은하게 굴절시킵니다."
  },
  {
    id: "viscous_drag",
    nameKo: "점성 유체 스윕 (Viscous Drag)",
    nameEn: "Viscous Surface Sweep",
    impulseForce: 45,
    dropletCount: 6,
    descKo: "유체를 깊게 휘젓듯 연속적인 전단 파동이 일어나며 글자가 액체 속 갈대처럼 유연하게 일렁입니다."
  },
  {
    id: "caustic_surge",
    nameKo: "코스틱 집광 격랑 (Caustic Surge)",
    nameEn: "High-Flux Caustic Surge",
    impulseForce: 75,
    dropletCount: 10,
    descKo: "강한 파동이 중첩되어 오목한 파골마다 눈부신 황금빛 코스틱 광선 그물망이 화려하게 집중 투영됩니다."
  }
];

// Discrete Heightfield Grid Resolution
const GRID_W = 100;
const GRID_H = 65;

export default function Experiment() {
  // State
  const [materialId, setMaterialId] = useState<LiquidMaterialId>("water");
  const [activePreset, setActivePreset] = useState<string>("zen");
  const [showCausticWeb, setShowCausticWeb] = useState<boolean>(true);
  const [showWaveMesh, setShowWaveMesh] = useState<boolean>(true);
  const [causticIntensity, setCausticIntensity] = useState<number>(1.5); // 0.5 to 2.5
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [ambientDroneEnabled, setAmbientDroneEnabled] = useState<boolean>(false);
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    kineticEnergy: 0,
    peakHeight: 0,
    meanCurvature: 0,
    waveVelocity: 1.0,
    causticFocusFlux: 120
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buffer1Ref = useRef<Float32Array>(new Float32Array(GRID_W * GRID_H));
  const buffer2Ref = useRef<Float32Array>(new Float32Array(GRID_W * GRID_H));
  const animFrameRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Web Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);

  const activeMaterial = MATERIALS[materialId];

  // Initialize Web Audio API
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

  // Liquid Droplet & Ripple Impact Acoustic Synthesizer
  const playDropletSound = useCallback(
    (force: number = 0.5) => {
      if (!audioEnabled) return;
      try {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Droplet water pitch sweep
        const baseFreq = activeMaterial.resonanceHz * (0.85 + Math.random() * 0.35);
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq * 1.8, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.12);

        const vol = Math.min(0.2, 0.03 + force * 0.15);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch {
        // Fallback
      }
    },
    [audioEnabled, initAudio, activeMaterial]
  );

  // Ambient Underwater Drone Toggle
  const toggleAmbientDrone = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    if (ambientDroneEnabled) {
      if (droneGainRef.current) {
        droneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      }
      setTimeout(() => {
        try {
          droneOscRef.current?.stop();
          droneOscRef.current?.disconnect();
        } catch {
          // Ignore
        }
        droneOscRef.current = null;
        droneGainRef.current = null;
        setAmbientDroneEnabled(false);
      }, 250);
    } else {
      try {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.8);

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(activeMaterial.resonanceHz * 0.5, ctx.currentTime);

        osc.connect(masterGain);
        masterGain.connect(ctx.destination);
        osc.start();

        droneOscRef.current = osc;
        droneGainRef.current = masterGain;
        setAmbientDroneEnabled(true);
      } catch {
        // Fallback
      }
    }
  }, [ambientDroneEnabled, initAudio, activeMaterial]);

  // Adjust drone frequency on material change
  useEffect(() => {
    if (ambientDroneEnabled && audioCtxRef.current && droneOscRef.current) {
      droneOscRef.current.frequency.setTargetAtTime(
        activeMaterial.resonanceHz * 0.5,
        audioCtxRef.current.currentTime,
        0.2
      );
    }
  }, [activeMaterial, ambientDroneEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        droneOscRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        // Safe cleanup
      }
    };
  }, []);

  // Drop fluid perturbation into heightfield buffer
  const addFluidDrop = useCallback((gx: number, gy: number, radius: number, strength: number) => {
    const buf = buffer1Ref.current;
    const rInt = Math.ceil(radius);
    for (let dy = -rInt; dy <= rInt; dy++) {
      for (let dx = -rInt; dx <= rInt; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 1 && nx < GRID_W - 1 && ny >= 1 && ny < GRID_H - 1) {
          const d2 = dx * dx + dy * dy;
          if (d2 <= radius * radius) {
            const factor = Math.cos((Math.sqrt(d2) / radius) * (Math.PI / 2));
            buf[ny * GRID_W + nx] += strength * factor;
          }
        }
      }
    }
  }, []);

  // Apply Fluid Presets
  const applyPreset = useCallback(
    (presetId: string) => {
      const p = PRESETS.find((item) => item.id === presetId);
      if (!p) return;
      setActivePreset(presetId);

      if (p.impulseForce === 0) {
        // Zen Stillness: Clear height buffers
        buffer1Ref.current.fill(0);
        buffer2Ref.current.fill(0);
      } else {
        // Scatter liquid droplets
        for (let i = 0; i < p.dropletCount; i++) {
          const gx = Math.round(GRID_W * (0.2 + Math.random() * 0.6));
          const gy = Math.round(GRID_H * (0.2 + Math.random() * 0.6));
          addFluidDrop(gx, gy, 3.5, p.impulseForce * (0.8 + Math.random() * 0.4));
        }
        playDropletSound(p.impulseForce / 60);
      }
    },
    [addFluidDrop, playDropletSound]
  );

  // 60fps Navier-Stokes 2D Wave Propagation & Caustic Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bufCurrent = buffer1Ref.current;
    let bufPrev = buffer2Ref.current;

    const loop = () => {
      // 1. Solve 2D Wave Equation with Viscous Damping
      const damping = activeMaterial.viscosity;
      let totalEnergy = 0;
      let maxH = 0;

      for (let y = 1; y < GRID_H - 1; y++) {
        const row = y * GRID_W;
        for (let x = 1; x < GRID_W - 1; x++) {
          const idx = row + x;

          // Discretized 4-neighbor laplacian wave equation
          const val =
            (bufCurrent[idx - 1] +
              bufCurrent[idx + 1] +
              bufCurrent[idx - GRID_W] +
              bufCurrent[idx + GRID_W]) *
              0.5 -
            bufPrev[idx];

          const dampedVal = val * damping;
          bufPrev[idx] = dampedVal;

          const absVal = Math.abs(dampedVal);
          totalEnergy += absVal;
          if (absVal > maxH) maxH = absVal;
        }
      }

      // Swap heightfield double buffers
      const temp = bufCurrent;
      bufCurrent = bufPrev;
      bufPrev = temp;
      buffer1Ref.current = bufCurrent;
      buffer2Ref.current = bufPrev;

      // Update telemetry
      setTelemetry({
        kineticEnergy: Math.round(totalEnergy),
        peakHeight: Number(maxH.toFixed(1)),
        meanCurvature: Number((totalEnergy / (GRID_W * GRID_H)).toFixed(2)),
        waveVelocity: 1.0,
        causticFocusFlux: Math.round(100 + maxH * 4.5 * causticIntensity)
      });

      // 2. Render Caustic Light & Refraction to Canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cellW = width / GRID_W;
      const cellH = height / GRID_H;

      // Caustic web lines & focal concentrations
      if (showCausticWeb && maxH > 0.8) {
        ctx.save();
        for (let y = 1; y < GRID_H - 2; y += 2) {
          for (let x = 1; x < GRID_W - 2; x += 2) {
            const idx = y * GRID_W + x;
            const h = bufCurrent[idx];

            // Surface gradient / curvature
            const gx = (bufCurrent[idx + 1] - bufCurrent[idx - 1]) * 0.5;
            const gy = (bufCurrent[idx + GRID_W] - bufCurrent[idx - GRID_W]) * 0.5;
            const laplacian =
              bufCurrent[idx - 1] +
              bufCurrent[idx + 1] +
              bufCurrent[idx - GRID_W] +
              bufCurrent[idx + GRID_W] -
              4 * h;

            // Caustic focus: concave troughs converge light
            if (laplacian < -0.8) {
              const focusStrength = Math.min(1, Math.abs(laplacian) * 0.12 * causticIntensity);
              const px = x * cellW;
              const py = y * cellH;

              ctx.beginPath();
              ctx.arc(px, py, cellW * (1.2 + focusStrength * 1.5), 0, Math.PI * 2);
              ctx.fillStyle = activeMaterial.causticColor;
              ctx.globalAlpha = focusStrength * 0.6;
              ctx.fill();
            }
          }
        }
        ctx.restore();
      }

      // Wave Mesh Overlay (subtle contour splines)
      if (showWaveMesh && maxH > 1.2) {
        ctx.save();
        ctx.strokeStyle = activeMaterial.accentColor;
        ctx.lineWidth = 0.75;
        ctx.globalAlpha = Math.min(0.35, maxH * 0.02);

        for (let y = 3; y < GRID_H - 3; y += 4) {
          ctx.beginPath();
          for (let x = 0; x < GRID_W; x++) {
            const idx = y * GRID_W + x;
            const h = bufCurrent[idx];
            const px = x * cellW;
            const py = y * cellH + h * 0.6;
            if (x === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMaterial, showCausticWeb, showWaveMesh, causticIntensity]);

  // Window Resize Handling
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Interactive Cursor / Touch Ripple Injection ---
  const triggerRipple = (clientX: number, clientY: number, forceMultiplier: number = 1) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const gx = Math.round((x / rect.width) * GRID_W);
    const gy = Math.round((y / rect.height) * GRID_H);

    // Calculate cursor velocity
    let vel = 1;
    if (lastMousePosRef.current) {
      const dx = clientX - lastMousePosRef.current.x;
      const dy = clientY - lastMousePosRef.current.y;
      vel = Math.min(4, Math.hypot(dx, dy) * 0.08 + 1);
    }
    lastMousePosRef.current = { x: clientX, y: clientY };

    const force = 18 * vel * forceMultiplier;
    addFluidDrop(gx, gy, 3.2, force);

    if (Math.random() < 0.15) {
      playDropletSound(Math.min(1, vel * 0.3));
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    triggerRipple(e.clientX, e.clientY, 1.8);
    setActivePreset("custom");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteracting || Math.random() < 0.4) {
      triggerRipple(e.clientX, e.clientY, isInteracting ? 1.5 : 0.8);
    }
  };

  const handleMouseUp = () => {
    setIsInteracting(false);
  };

  // Touch Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsInteracting(true);
      triggerRipple(e.touches[0].clientX, e.touches[0].clientY, 1.8);
      setActivePreset("custom");
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      triggerRipple(e.touches[0].clientX, e.touches[0].clientY, 1.4);
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
  };

  // Center Typography Refractive Displacement Calculation
  const typographicOptics = useMemo(() => {
    const energyNorm = Math.min(1, telemetry.kineticEnergy / 450);
    const dispX = Math.sin(telemetry.peakHeight * 0.3) * energyNorm * 8;
    const dispY = Math.cos(telemetry.peakHeight * 0.3) * energyNorm * 6;
    const dynamicWeight = Math.round(450 + energyNorm * 380);
    const blurPx = energyNorm * 1.5;

    return { dispX, dispY, dynamicWeight, blurPx, energyNorm };
  }, [telemetry]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FAF8F5",
        color: "#1A1816",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
        userSelect: isInteracting ? "none" : "auto"
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
                color: "#1A1816",
                letterSpacing: "-0.015em"
              }}
            >
              Design Minds · Day 033
            </span>
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#8A847C",
                fontFamily: "monospace"
              }}
            >
              2026-10-04 · Viscous Surface Tension & Caustic Typography
            </span>
          </div>

          {/* Top Control Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Substrate Material Switcher */}
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
              {(Object.keys(MATERIALS) as LiquidMaterialId[]).map((mKey) => (
                <button
                  key={mKey}
                  onClick={() => {
                    setMaterialId(mKey);
                    playDropletSound(0.7);
                  }}
                  style={{
                    border: "none",
                    background: materialId === mKey ? "#FFFFFF" : "transparent",
                    color: materialId === mKey ? "#1A1816" : "#766F64",
                    fontWeight: materialId === mKey ? 600 : 400,
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: materialId === mKey ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  {MATERIALS[mKey].nameKo.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Caustic Web Overlay Toggle */}
            <button
              onClick={() => setShowCausticWeb(!showCausticWeb)}
              style={{
                background: showCausticWeb ? "#1A1816" : "transparent",
                color: showCausticWeb ? "#FAF8F5" : "#4A453E",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {showCausticWeb ? "✨ Caustic Web [ON]" : "✨ Caustic [OFF]"}
            </button>

            {/* Wave Mesh Contours Toggle */}
            <button
              onClick={() => setShowWaveMesh(!showWaveMesh)}
              style={{
                background: showWaveMesh ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showWaveMesh ? "🌊 Mesh [ON]" : "🌊 Mesh [OFF]"}
            </button>

            {/* Haptic & Drone Audio Toggles */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                title="물방울 액적 햅틱 음향"
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
                title="수중 글래스 하모닉 공명음"
                style={{
                  background: ambientDroneEnabled ? activeMaterial.accentColor : "transparent",
                  color: ambientDroneEnabled ? "#FFFFFF" : "#4A453E",
                  border: "1px solid #D8CFC2",
                  borderRadius: "4px",
                  padding: "5px 9px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                {ambientDroneEnabled ? "🎵 Drone ON" : "🎵 Drone OFF"}
              </button>
            </div>

            {/* Fullscreen Monograph Mode */}
            <button
              onClick={() => setIsMonographMode(true)}
              style={{
                backgroundColor: "#1A1816",
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
              📖 유체 수조 전면 뷰
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
            color: "#1A1816",
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
        {/* Left Column: Interactive Shallow Water Pool */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #EAE4D9",
            backgroundColor: "#FAF8F5",
            overflow: "hidden",
            cursor: "crosshair",
            touchAction: "none"
          }}
        >
          {/* Top Presets Quick Bar */}
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
                    color: "#8A847C",
                    fontFamily: "monospace"
                  }}
                >
                  FLUID PRESETS:
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    style={{
                      backgroundColor: activePreset === p.id ? "#1A1816" : "#FFFFFF",
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
                    {p.nameKo.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Direct Drag Instruction Badge */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#8A847C",
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>💡 [직접 조작] 수면 위를 마우스나 손가락으로 가볍게 스위프하여 물결을 일으켜 보세요</span>
              </div>
            </div>
          )}

          {/* Interactive Liquid Canvas & Submerged Typography */}
          <div
            style={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Background 2D Navier-Stokes Caustic Canvas */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 5
              }}
            />

            {/* Submerged Refractive Typographic Layer */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                pointerEvents: "none",
                padding: "60px 80px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "100%",
                boxSizing: "border-box"
              }}
            >
              {/* Header Telemetry Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(138, 132, 124, 0.3)",
                  paddingBottom: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: activeMaterial.accentColor,
                      boxShadow: `0 0 10px ${activeMaterial.accentColor}`,
                      transition: "all 0.2s ease"
                    }}
                  />
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#4A453E", fontWeight: 600 }}>
                    FLUID SUBSTRATE: {activeMaterial.nameEn.toUpperCase()} (n = {activeMaterial.refractiveIndex})
                  </span>
                </div>
                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#8A847C" }}>
                  CAUSTIC FLUX: {telemetry.causticFocusFlux} LUX / DAMPING μ = {activeMaterial.viscosity}
                </div>
              </div>

              {/* Monumental Submerged Editorial Typography with Snell Refraction */}
              <div
                style={{
                  maxWidth: "840px",
                  margin: "40px 0",
                  transform: `translate(${typographicOptics.dispX}px, ${typographicOptics.dispY}px)`,
                  filter: `blur(${typographicOptics.blurPx}px)`,
                  transition: "transform 0.08s ease-out, filter 0.08s ease-out"
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    color: activeMaterial.accentColor,
                    marginBottom: "16px",
                    fontFamily: "monospace",
                    fontWeight: 600
                  }}
                >
                  CHAPTER 033 · VISCOUS CAUSTIC REFRACTION
                </div>

                <h1
                  style={{
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: "52px",
                    lineHeight: 1.15,
                    fontWeight: typographicOptics.dynamicWeight,
                    margin: "0 0 24px 0",
                    color: "#1A1816",
                    letterSpacing: "-0.02em",
                    textShadow: `${typographicOptics.dispX * 0.8}px ${typographicOptics.dispY * 0.8}px 4px rgba(255,255,255,0.95), ${-typographicOptics.dispX * 0.5}px ${-typographicOptics.dispY * 0.5}px 6px rgba(35,28,20,0.22)`,
                    transition: "font-weight 0.1s ease"
                  }}
                >
                  Water does not resist form; it creates it through light.
                </h1>

                <h2
                  style={{
                    fontSize: "20px",
                    lineHeight: 1.65,
                    fontWeight: 400,
                    color: "#4A453E",
                    margin: "0 0 28px 0"
                  }}
                >
                  물은 형태에 저항하지 않는다. 물결의 렌즈가 햇빛을 모아 문장 위에 살아있는 빛의 악보를 새긴다.
                </h2>

                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.85,
                    color: "#38342F",
                    maxWidth: "700px",
                    textAlign: "justify",
                    backgroundColor: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(6px)",
                    padding: "24px 28px",
                    borderRadius: "5px",
                    border: "1px solid rgba(226, 218, 205, 0.85)",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.03)"
                  }}
                >
                  화면 아무 곳이나 마우스나 손끝으로 가볍게 스위프해 보십시오.
                  30일 전 Day 003의 색채 점성학이 1차원 자간 압축에 머물렀다면, Day 033은 2차원 나비에-스토크스 얕은 물 표면장력 파동 방정식을 브라우저 수조에 직접 이식했습니다.
                  수면에 잔물결이 일면 텍스트는 맑은 시냇물 속 갈대처럼 유연하게 굴절되고 황금빛 코스틱 광선 그물망이 글자를 비추며, 손을 떼는 순간 400밀리초 만에 점성 감쇠를 거쳐 단정하고 고요한 스위스 모더니즘 정적 평형으로 돌아옵니다.
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div
                style={{
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
                <span>SOLVER: 2D DISCRETIZED SHALLOW WATER HEIGHTFIELD (100x65)</span>
                <span>
                  KINETIC ENERGY: {telemetry.kineticEnergy} J / CURVATURE: ∇²h = {telemetry.meanCurvature}
                </span>
                <span>MONTH 2 CANON: SANCTUARY OF TOUCH · DAY 033</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Analysis & Liquid Bento Telemetry */}
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
                OPTICAL FLUID TELEMETRY · DAY 033
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1A1816",
                  margin: "0 0 6px 0"
                }}
              >
                The Caustic Pool
              </h2>
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#57534E", margin: 0 }}>
                정적인 아크릴 블러를 걷어내고, 얕은 물 표면장력 파동과 코스틱 굴절 광학을 결합하여 살아 숨 쉬는 유체 에디토리얼 인터페이스를 구축합니다.
              </p>
            </div>

            {/* Live Caustic Light Energy Card */}
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
                    color: "#1A1816"
                  }}
                >
                  Caustic Focus & Energy
                </span>
                <span style={{ color: activeMaterial.accentColor, fontFamily: "monospace", fontSize: "11px", fontWeight: 600 }}>
                  {telemetry.causticFocusFlux} LUX
                </span>
              </div>

              {/* Energy Progress Meter */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#8A847C", marginBottom: "4px", fontFamily: "monospace" }}>
                  <span>0 J (Equilibrium)</span>
                  <span>250 J (Moderate)</span>
                  <span>500 J (Turbulent)</span>
                </div>
                <div
                  style={{
                    height: "7px",
                    width: "100%",
                    background: "linear-gradient(to right, #FAF8F5, #0284C7, #D97706, #7C3AED)",
                    borderRadius: "4px",
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-3px",
                      left: `${Math.min(96, Math.max(4, (telemetry.kineticEnergy / 500) * 100))}%`,
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      backgroundColor: "#1A1816",
                      border: "2px solid #FFFFFF",
                      transform: "translateX(-50%)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                    }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "11px",
                  color: "#57534E",
                  fontFamily: "monospace"
                }}
              >
                <div>
                  <span style={{ color: "#9E978C" }}>Refractive n:</span> {activeMaterial.refractiveIndex}
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Viscosity μ:</span> {activeMaterial.viscosity}
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Tension γ:</span> {activeMaterial.surfaceTension} N/m
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Resonance:</span> {activeMaterial.resonanceHz} Hz
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Peak Height:</span> ±{telemetry.peakHeight}px
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Grid Cells:</span> 100x65 (6,500)
                </div>
              </div>
            </div>

            {/* Caustic Intensity Slider Bento Card */}
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
                    color: "#1A1816"
                  }}
                >
                  Caustic Intensity Gain
                </span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: activeMaterial.accentColor, fontWeight: 600 }}>
                  {causticIntensity.toFixed(1)}x
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#6E685E", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                수면의 오목한 물골(Concave Troughs)이 집광하는 코스틱 하이라이트 광선의 투영 세기를 조절합니다.
              </p>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={causticIntensity}
                onChange={(e) => setCausticIntensity(Number(e.target.value))}
                style={{ width: "100%", accentColor: activeMaterial.accentColor }}
              />
            </div>

            {/* Material Specification Bento Card */}
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
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#1A1816",
                  marginBottom: "8px"
                }}
              >
                Active Medium: {activeMaterial.nameKo}
              </div>
              <p style={{ fontSize: "12px", color: "#57534E", lineHeight: 1.6, margin: "0 0 10px 0" }}>
                {activeMaterial.descKo}
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span
                  style={{
                    backgroundColor: "#F2ECE4",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#766F64"
                  }}
                >
                  {activeMaterial.nameEn}
                </span>
                <span
                  style={{
                    backgroundColor: "#F2ECE4",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#766F64"
                  }}
                >
                  Base {activeMaterial.resonanceHz}Hz
                </span>
              </div>
            </div>

            {/* Architectural Axioms Box */}
            <div
              style={{
                backgroundColor: "#F2ECE4",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1A1816", marginBottom: "8px" }}>
                조형 메커니즘 3대 공리 (Axiom 33 Synthesis)
              </div>
              <div style={{ fontSize: "11px", color: "#57534E", lineHeight: 1.65 }}>
                1. <strong>유체 코스틱 집광 (Caustic Focus)</strong>: 파동의 오목한 곡면이 자연광을 모아 문장 위에 눈부신 황금빛 포락선 투영.<br />
                2. <strong>스넬 굴절 타이포그래피 (Snell Refractive Typography)</strong>: 유체 표면 기울기에 연동되어 글자가 입체적으로 일렁이며 가변 굵기 보정.<br />
                3. <strong>점성 평형 회복 (Viscous Equilibrium)</strong>: 400ms 내에 파동 에너지를 마찰로 소산시키며 단정한 스위스 모더니즘 침묵으로 회귀.
              </div>
            </div>

            {/* Month 2 Initiative Card */}
            <div style={{ borderTop: "1px solid #EAE4D9", paddingTop: "14px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: activeMaterial.accentColor,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px"
                }}
              >
                Sanctuary of Touch · Day 033
              </div>
              <div style={{ fontSize: "12px", color: "#4A453E", lineHeight: 1.5 }}>
                피상적인 화면 위의 그래픽을 넘어, 인간의 호흡과 자연의 빛·물이 만나는 촉각적 유체 인터페이스의 지평을 엽니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
