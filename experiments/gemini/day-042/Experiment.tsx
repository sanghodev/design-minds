"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface SpacetimeSubstrate {
  id: string;
  name: string;
  nameKo: string;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  descKo: string;
}

interface SingularityPreset {
  id: string;
  nameKo: string;
  massSolar: number; // 0 to 50 M☉
  warpRadiusPx: number; // 40 to 180px
  deflectionMultiplier: number;
  descKo: string;
}

const SUBSTRATES: SpacetimeSubstrate[] = [
  {
    id: 'deep_singularity_black',
    name: 'Obsidian Vacuum Continuum',
    nameKo: '흑요석 진공 연속체',
    surfaceTone: '#07080A',
    cardTone: '#11141A',
    textColor: '#FAF8F5',
    subTextColor: '#9CA3AF',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    borderColor: '#1E232D',
    descKo: '사건의 지평선(Event Horizon) 깊은 암흑을 재현하여, 청록빛 아인슈타인 링과 황금빛 광자구의 눈부신 상대론적 발광을 극대화합니다.'
  },
  {
    id: 'milled_brass_astrolabe',
    name: 'Relativistic Brass Astrolabe',
    nameKo: '상대론적 황동 혼천의',
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#121110',
    subTextColor: '#57534E',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    borderColor: '#E5E7EB',
    descKo: '상아빛 종이와 정밀 황동 측정 기구의 조형미를 결합하여, 절제된 스위스 모더니즘과 아인슈타인 측지선 기하학의 권위를 드러냅니다.'
  },
  {
    id: 'gravitational_wave_void',
    name: 'LIGO Interferometer Matrix',
    nameKo: 'LIGO 간섭계 시공간 직물',
    surfaceTone: '#0B0D14',
    cardTone: '#151924',
    textColor: '#F8FAFC',
    subTextColor: '#94A3B8',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    borderColor: '#242B3D',
    descKo: '보랏빛 중력파 파면과 레이저 간섭계 계량 눈금을 품어 신비롭고 묵직한 현대 천체물리학의 아우라를 연출합니다.'
  }
];

const PRESETS: SingularityPreset[] = [
  {
    id: 'supermassive_kerr_core',
    nameKo: '초거대 블랙홀 모드 (45 M☉)',
    massSolar: 45,
    warpRadiusPx: 145,
    deflectionMultiplier: 1.4,
    descKo: '45 태양 질량의 극단적 시공간 왜곡이 발생하여 광범위한 측지선 굴절과 아인슈타인 링을 형성합니다.'
  },
  {
    id: 'einstein_ring_alignment',
    nameKo: '임계 아인슈타인 링 모드 (28 M☉)',
    massSolar: 28,
    warpRadiusPx: 100,
    deflectionMultiplier: 1.0,
    descKo: '배후 활자가 정확한 원형 아인슈타인 링으로 결착되는 최적의 광학적 초점 기하학을 제공합니다.'
  },
  {
    id: 'compact_neutron_star',
    nameKo: '고밀도 중성자별 모드 (15 M☉)',
    massSolar: 15,
    warpRadiusPx: 65,
    deflectionMultiplier: 0.7,
    descKo: '날카롭고 팽팽한 국소적 중력 렌즈 왜곡을 일으키며 글자의 굵기를 단단하게 압축·팽창시킵니다.'
  },
  {
    id: 'minkowski_flat_space',
    nameKo: '민코프스키 평탄 시공간 모드 (0 M☉)',
    massSolar: 0,
    warpRadiusPx: 0,
    deflectionMultiplier: 0.0,
    descKo: '질량이 0으로 소광되어 완벽한 직교 직선과 정갈한 스위스 모더니즘 baseline으로 회귀합니다.'
  }
];

export default function RelativisticSpacetimeBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<SpacetimeSubstrate>(SUBSTRATES[0]);
  const [selectedPreset, setSelectedPreset] = useState<SingularityPreset>(PRESETS[0]);
  const [massSolar, setMassSolar] = useState<number>(45); // 0 to 50 M☉
  const [warpRadius, setWarpRadius] = useState<number>(145); // 40 to 180px
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [singularityPos, setSingularityPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.45 });
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isDraggingSingularityRef = useRef<boolean>(false);
  const chirpOscRef = useRef<OscillatorNode | null>(null);
  const chirpGainRef = useRef<GainNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Distance from Singularity to Masthead Text Center (normalized approx 0.35, 0.4)
  const distToHeadline = useMemo(() => {
    const dx = singularityPos.x - 0.35;
    const dy = singularityPos.y - 0.4;
    return Math.sqrt(dx * dx + dy * dy);
  }, [singularityPos]);

  // Is within Critical Einstein Ring Alignment Zone (r < 0.12)
  const isRingAligned = useMemo(() => {
    return distToHeadline < 0.12 && massSolar > 10;
  }, [distToHeadline, massSolar]);

  // --- AUDIO SYNTHESIS ENGINE ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Gravitational Wave Inspiral Chirp Sound Sweep
  const playGravitationalChirpSound = useCallback((intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // LIGO-style inspiral chirp upward sweep (35Hz to 260Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.18);

    gain.gain.setValueAtTime(0.35 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }, [initAudio, isAudioMuted]);

  // Spacetime Metric Curvature Continuous Hum Drone
  const updateMetricDrone = useCallback((mass: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (!droneOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(48, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      droneOscRef.current = osc;
      droneGainRef.current = gain;
    }

    const now = ctx.currentTime;
    const targetFreq = 42 + (mass / 50) * 48; // 42Hz to 90Hz deep gravitational hum
    const targetGain = Math.min(0.07, (mass / 50) * 0.07);

    droneOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.05);
    droneGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.05);
  }, [initAudio, isAudioMuted]);

  useEffect(() => {
    updateMetricDrone(massSolar);
    return () => {
      if (droneGainRef.current && audioCtxRef.current) {
        droneGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
      }
    };
  }, [massSolar, updateMetricDrone]);

  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  const dynamicFontWeight = useMemo(() => {
    // Redshift dilation swells weight from 300 up to 800
    const proximityFactor = Math.max(0, 1 - distToHeadline / 0.5);
    const massFactor = massSolar / 50;
    return Math.min(800, Math.round(300 + proximityFactor * massFactor * 500));
  }, [distToHeadline, massSolar]);

  const dynamicTracking = useMemo(() => {
    // Gravitational time dilation expands tracking
    const proximityFactor = Math.max(0, 1 - distToHeadline / 0.5);
    return ((massSolar / 50) * proximityFactor * 0.08).toFixed(3);
  }, [distToHeadline, massSolar]);

  // Flat Spacetime Restitution (Zero Mass)
  const handleZeroMassRestitution = useCallback(() => {
    playGravitationalChirpSound(1.4);
    setMassSolar(0);
    setWarpRadius(0);
  }, [playGravitationalChirpSound]);

  // Preset Selection
  const handleSelectPreset = useCallback((preset: SingularityPreset) => {
    setSelectedPreset(preset);
    setMassSolar(preset.massSolar);
    setWarpRadius(preset.warpRadiusPx);
    playGravitationalChirpSound(0.9);
  }, [playGravitationalChirpSound]);

  // --- 2D CANVAS RELATIVISTIC LENSING & GEODESIC SHADER (60FPS) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear background
      ctx.fillStyle = selectedSubstrate.surfaceTone;
      ctx.fillRect(0, 0, w, h);

      const sX = singularityPos.x * w;
      const sY = singularityPos.y * h;
      const currentMass = massSolar;
      const rWarp = warpRadius;

      // 2. Render Curved Spacetime Geodesic Grid Lines
      ctx.strokeStyle = selectedSubstrate.borderColor;
      ctx.lineWidth = 1;

      const step = 28;

      // Vertical Geodesics
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 8) {
          const dx = x - sX;
          const dy = y - sY;
          const r = Math.sqrt(dx * dx + dy * dy);

          let px = x;
          let py = y;

          if (currentMass > 0 && r > 2) {
            // Deflection angle alpha ~ 4GM / c^2 r
            const deflection = (currentMass * 32) / (r + 15);
            const factor = Math.min(0.85, deflection / r);
            px = x - dx * factor;
            py = y - dy * factor;
          }

          if (y === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Horizontal Geodesics
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const dx = x - sX;
          const dy = y - sY;
          const r = Math.sqrt(dx * dx + dy * dy);

          let px = x;
          let py = y;

          if (currentMass > 0 && r > 2) {
            const deflection = (currentMass * 32) / (r + 15);
            const factor = Math.min(0.85, deflection / r);
            px = x - dx * factor;
            py = y - dy * factor;
          }

          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // 3. Render Concentric Einstein Rings & Accretion Halo
      if (currentMass > 5) {
        const einsteinRadius = Math.sqrt(currentMass * 85);

        // Volumetric Glow Halo
        const haloGrad = ctx.createRadialGradient(sX, sY, einsteinRadius * 0.4, sX, sY, einsteinRadius * 1.8);
        haloGrad.addColorStop(0, 'transparent');
        haloGrad.addColorStop(0.5, selectedSubstrate.accentColor + '55');
        haloGrad.addColorStop(0.8, selectedSubstrate.glowColor);
        haloGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(sX, sY, einsteinRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Sharp Einstein Ring Light Arc
        ctx.strokeStyle = selectedSubstrate.accentColor;
        ctx.lineWidth = isRingAligned ? 3.5 : 2;
        ctx.shadowColor = selectedSubstrate.accentColor;
        ctx.shadowBlur = isRingAligned ? 20 : 10;
        ctx.beginPath();
        ctx.arc(sX, sY, einsteinRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Photon Sphere Inner Boundary (r = 1.5 r_s)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(sX, sY, einsteinRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Black Hole Event Horizon Core
      const horizonRadius = Math.max(6, currentMass * 0.45);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sX, sY, horizonRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = selectedSubstrate.accentColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Readout Coordinates Tag
      ctx.fillStyle = selectedSubstrate.textColor;
      ctx.font = '10px monospace';
      ctx.fillText(`M: ${currentMass} M☉ · θ_E: ${Math.round(Math.sqrt(currentMass * 85))}px`, sX + horizonRadius + 10, sY - 10);

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [singularityPos, massSolar, warpRadius, isRingAligned, selectedSubstrate]);

  // Handle Dragging Gravitational Singularity
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    const ny = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));

    const now = performance.now();
    const dt = Math.max(1, now - lastMousePosRef.current.time);
    const dx = nx - lastMousePosRef.current.x;
    const dy = ny - lastMousePosRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

    lastMousePosRef.current = { x: nx, y: ny, time: now };
    setSingularityPos({ x: nx, y: ny });

    if (speed > 0.001) {
      playGravitationalChirpSound(0.2);
    }
  };

  return (
    <div
      className="w-full min-h-screen transition-colors duration-500 font-sans select-none"
      style={{
        backgroundColor: selectedSubstrate.surfaceTone,
        color: selectedSubstrate.textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        className="w-full border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md"
        style={{
          borderColor: selectedSubstrate.borderColor,
          backgroundColor: selectedSubstrate.surfaceTone + 'F2'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all ${isRingAligned ? 'bg-cyan-400 animate-ping' : 'bg-amber-500'}`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 042 · 2026-10-13
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Relativistic Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Relativistic Spacetime Bento & Gravitational Lensing Shaders
            </h1>
          </div>
        </div>

        {/* Global Controls & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Substrate Selector */}
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: selectedSubstrate.borderColor }}>
            {SUBSTRATES.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubstrate(sub);
                  playGravitationalChirpSound(1.0);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedSubstrate.id === sub.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSubstrate.id === sub.id ? selectedSubstrate.accentColor : 'transparent',
                  color: selectedSubstrate.id === sub.id ? '#07080A' : selectedSubstrate.textColor
                }}
              >
                {sub.nameKo.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-white/5"
            style={{ borderColor: selectedSubstrate.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "🌌"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "METRIC DRONE"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-white/5"
            style={{
              borderColor: selectedSubstrate.borderColor,
              backgroundColor: isFullscreen ? selectedSubstrate.accentColor + '22' : 'transparent',
              color: isFullscreen ? selectedSubstrate.accentColor : selectedSubstrate.textColor
            }}
          >
            <span>{isFullscreen ? "🗗" : "🗖"}</span>
            <span className="hidden sm:inline">{isFullscreen ? "STANDARD" : "SINGULARITY MODE"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className={`w-full mx-auto p-4 md:p-8 transition-all ${isFullscreen ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* BENTO GRID ARCHITECTURE (6 INTERACTIVE MODULAR CELLS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative">

          {/* CELL 1: MONUMENTAL MONOGRAPH MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-md"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: isRingAligned ? selectedSubstrate.accentColor : selectedSubstrate.borderColor,
              boxShadow: isRingAligned ? `0 0 30px ${selectedSubstrate.glowColor}` : 'none'
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold flex items-center gap-1 ${
                    isRingAligned ? 'text-cyan-400' : 'text-amber-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full inline-block animate-ping" style={{ backgroundColor: isRingAligned ? '#00F0FF' : '#F59E0B' }} />
                  {isRingAligned ? 'EINSTEIN RING CRITICAL ALIGNMENT' : `SCHWARZSCHILD MASS: ${massSolar} M☉`}
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Dilation Tracking: +{dynamicTracking}em · Weight: {dynamicFontWeight}
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                GENERAL RELATIVITY G_μν
              </div>
            </div>

            {/* Display Typography with Gravitational Redshift Dilation */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Spacetime Metric Geodesics & Lensed Rings
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  letterSpacing: `${dynamicTracking}em`,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Relativistic Spacetime Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                단순 멱법칙 줌 클리셰를 극복하고, 2차원 슈바르츠실트 시공간 계량과 아인슈타인 중력 렌즈 편향각(α = 4GM/c²b)을 스위스 벤토 그리드 건축에 전격 이식하여, 특이점 배후에서 눈부신 동심원 아인슈타인 링으로 타오르는 상대론적 에디토리얼 파빌리온.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">METRIC:</strong> Schwarzschild
                </span>
                <span>
                  <strong className="opacity-50">DEFLECTION:</strong> α(b) ∝ 1/r
                </span>
                <span>
                  <strong className="opacity-50">REDSHIFT:</strong> 1+z = (1-rs/r)⁻¹/²
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Variable Mass Weight:</span>
                <strong style={{ color: selectedSubstrate.accentColor }}>wght: {dynamicFontWeight}</strong>
              </div>
            </div>
          </div>

          {/* CELL 2: SINGULARITY MASS CONTROLS & ZERO MASS SWITCH (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative transition-all duration-300"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Gravitational Singularity
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {massSolar} M☉ Solar Mass
                </span>
              </div>

              {/* Solar Mass Slider */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-mono mb-1 opacity-70">
                  <span>Mass-Energy Magnitude (M)</span>
                  <span>{massSolar} M☉</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={massSolar}
                  onChange={(e) => {
                    setMassSolar(Number(e.target.value));
                    setWarpRadius(Math.round(Number(e.target.value) * 3.2));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Warp Radius Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1 opacity-70">
                  <span>Geodesic Warp Radius (r_warp)</span>
                  <span>{warpRadius} px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={warpRadius}
                  onChange={(e) => setWarpRadius(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* ZERO MASS MINKOWSKI RESTITUTION BUTTON */}
              <div className="mb-4">
                <button
                  onClick={handleZeroMassRestitution}
                  className="w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-cyan-500/10 hover:border-cyan-500 text-cyan-400"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  <span>⚛️</span>
                  <span>ZERO-MASS FLAT METRIC (0 M☉)</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Singularity Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                        selectedPreset.id === p.id ? 'font-bold' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: selectedPreset.id === p.id ? selectedSubstrate.accentColor : selectedSubstrate.borderColor,
                        backgroundColor: selectedPreset.id === p.id ? selectedSubstrate.accentColor + '18' : 'transparent',
                        color: selectedPreset.id === p.id ? selectedSubstrate.accentColor : selectedSubstrate.textColor
                      }}
                    >
                      <div className="font-bold truncate">{p.nameKo.split(' ')[0]}</div>
                      <div className="text-[10px] opacity-60 truncate">{p.massSolar} M☉</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              💡 캔버스 위의 블랙홀 중심을 드래그하여 시공간을 직접 왜곡하세요.
            </div>
          </div>

          {/* CELL 3: 2D RELATIVISTIC GEODESIC & EINSTEIN RING VIEWPORT (Span 7 Cols) */}
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width - 0.5;
              const ny = (e.clientY - rect.top) / rect.height - 0.5;
              setStageTilt({ x: ny * -6, y: nx * 6 });
            }}
            onMouseLeave={() => setStageTilt({ x: 0, y: 0 })}
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative overflow-hidden transition-transform duration-200"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor,
              transform: `perspective(1000px) rotateX(${stageTilt.x}deg) rotateY(${stageTilt.y}deg)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  2D Schwarzschild Geodesic Ray-Tracer
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isRingAligned ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {isRingAligned ? 'EINSTEIN RING ACTIVE' : 'GEODESIC CURVATURE'}
                </span>
              </div>

              {/* Center Singularity */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setSingularityPos({ x: 0.5, y: 0.45 });
                    playGravitationalChirpSound(0.8);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-white/5"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  Center Core
                </button>
              </div>
            </div>

            {/* Interactive Ray-Tracing Canvas */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: selectedSubstrate.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => {
                  isDraggingSingularityRef.current = true;
                  handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (isDraggingSingularityRef.current || e.buttons === 1) {
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }
                }}
                onMouseUp={() => { isDraggingSingularityRef.current = false; }}
                onMouseLeave={() => { isDraggingSingularityRef.current = false; }}
                onTouchStart={(e) => {
                  isDraggingSingularityRef.current = true;
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={() => { isDraggingSingularityRef.current = false; }}
              />

              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedSubstrate.cardTone + 'E6',
                  borderColor: selectedSubstrate.borderColor
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isRingAligned ? 'bg-cyan-400 animate-ping' : 'bg-amber-500'}`}
                />
                <span>Deflection α: <strong>{((massSolar * 4 * 0.08) / Math.max(0.1, distToHeadline)).toFixed(2)} rad</strong></span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>DRAG BLACK HOLE OVER TYPOGRAPHIC MODULE</span>
              <span>ds² = -(1 - 2GM/c²r)c²dt² + ...</span>
            </div>
          </div>

          {/* CELL 4: GRAVITATIONAL REDSHIFT TYPOGRAPHY (Span 5 Cols) */}
          <div
            className="md:col-span-5 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Redshift Variable Typography
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  wght: {dynamicFontWeight}
                </span>
              </div>

              <div
                className="p-4 rounded-xl border mb-4 relative overflow-hidden"
                style={{
                  borderColor: selectedSubstrate.borderColor,
                  backgroundColor: selectedSubstrate.surfaceTone
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 42 Gravitational Lensing
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    letterSpacing: `${dynamicTracking}em`,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "Mass commands spacetime how to curve; spacetime commands light how to bend."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  중력 포텐셜 우물이 깊어질수록 글자는 물리적 질량을 흡수하여 굵기(wght: 300 → 800)와 자간(+{dynamicTracking}em)을 확장하며, 아인슈타인 링 정렬 시 순수한 빛의 원형 광륜으로 융합합니다.
                </div>
              </div>

              {/* Weight & Redshift Inspectors */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Variable Font Weight (wght)</span>
                    <span>{dynamicFontWeight} / 800</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${((dynamicFontWeight - 300) / 500) * 100}%`,
                        backgroundColor: selectedSubstrate.accentColor
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Gravitational Time Dilation Tracking</span>
                    <span>+{dynamicTracking} em</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(Number(dynamicTracking) / 0.08) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>ALBERT EINSTEIN</span>
              <span>1915 GENERAL RELATIVITY</span>
            </div>
          </div>

          {/* CELL 5: SCHWARZSCHILD ASTROPHYSICAL PARAMETERS (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Astrophysical Metric Parameters
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {selectedSubstrate.nameKo}
                </span>
              </div>

              <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                {selectedSubstrate.descKo}
              </p>

              {/* Physical Parameters Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">SCHWARZSCHILD r_s</div>
                  <div className="text-base font-bold mt-0.5">{(massSolar * 2.95).toFixed(1)}</div>
                  <div className="text-[10px] opacity-50">Kilometers</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">EINSTEIN RADIUS θ_E</div>
                  <div className="text-base font-bold mt-0.5">{Math.round(Math.sqrt(massSolar * 85))}</div>
                  <div className="text-[10px] opacity-50">Pixels Radius</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">METRIC STATE</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: selectedSubstrate.accentColor }}>
                    {isRingAligned ? 'RING LOCK' : 'WARPED'}
                  </div>
                  <div className="text-[10px] opacity-50">{massSolar > 0 ? 'Non-Euclidean' : 'Flat Minkowski'}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span className="opacity-60">GEODESIC DEVIATION RESOLVED</span>
              <span className="font-bold text-cyan-400">
                EINSTEIN EQUATIONS BALANCED
              </span>
            </div>
          </div>

          {/* CELL 6: TACTILE LIGO ASTROPHYSICS SOUNDBOARD (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Tactile Relativistic Acoustics
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                LIGO 중력파 관측소 스타일의 첩(Chirp) 글리산도, 시공간 프레임 드래깅 기저 험, 그리고 아인슈타인 링 결착 시의 맑고 영롱한 공명음을 연주하세요.
              </p>

              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'GW Chirp', action: () => playGravitationalChirpSound(1.5), label: '중력파 첩' },
                  { name: '45 M☉ Core', action: () => { setMassSolar(45); setWarpRadius(145); playGravitationalChirpSound(1.0); }, label: '블랙홀 코어' },
                  { name: 'Ring Focus', action: () => { setSingularityPos({ x: 0.35, y: 0.4 }); playGravitationalChirpSound(1.2); }, label: '아인슈타인 링' },
                  { name: 'Flat Metric', action: handleZeroMassRestitution, label: '민코프스키 평탄' },
                ].map((snd) => (
                  <button
                    key={snd.name}
                    onClick={snd.action}
                    className="p-2.5 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 group"
                    style={{
                      borderColor: selectedSubstrate.borderColor,
                      backgroundColor: selectedSubstrate.surfaceTone
                    }}
                  >
                    <div className="text-xs font-mono font-bold group-hover:text-cyan-400 transition-colors">
                      {snd.name}
                    </div>
                    <div className="text-[9px] font-mono opacity-50 truncate">
                      {snd.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>LIGO Inspiral Chirp Sweeps + Sub-Bass Metric Drones</span>
              <span>Zero-Fatigue Tactile Haptics</span>
            </div>
          </div>

        </div>

        {/* FOOTER EDITORIAL SUMMARY */}
        <footer
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-70"
          style={{ borderColor: selectedSubstrate.borderColor }}
        >
          <div>
            Design Minds · Gemini (The Noon Mind) · Day 042 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-13</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: RELATIVISTIC SPACETIME BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
