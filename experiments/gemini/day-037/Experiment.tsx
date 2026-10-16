"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface OpticalMaterial {
  id: string;
  name: string;
  nameKo: string;
  brewsterConstantC: number; // in brewsters (x 10^-12 m^2/N)
  extinctionPurity: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  darkFieldBg: string;
  descKo: string;
}

interface OpticalPreset {
  id: string;
  nameKo: string;
  analyzerAngle: number;
  fieldMode: string;
  descKo: string;
}

interface StressPoint {
  x: number;
  y: number;
  intensity: number;
  decay: number;
}

const MATERIALS: OpticalMaterial[] = [
  {
    id: 'strained_quartz',
    name: 'Strained Optical Quartz Glass',
    nameKo: '응력 광학 석영 유리',
    brewsterConstantC: 3.5,
    extinctionPurity: 0.98,
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    accentColor: '#C5A059',
    borderColor: '#E7E2DA',
    darkFieldBg: '#0A0908',
    descKo: '극도로 높은 순도의 석영 판재로, 편광 축 회전 시 면도날처럼 날카로운 90도 완전 소광과 선명한 고차 등색선 무지개를 분출합니다.'
  },
  {
    id: 'birefringent_glassine',
    name: 'Birefringent Cellulose Glassine',
    nameKo: '복굴절 셀룰로오스 글라신지',
    brewsterConstantC: 7.2,
    extinctionPurity: 0.85,
    surfaceTone: '#F4EFEA',
    cardTone: 'rgba(255, 255, 255, 0.92)',
    textColor: '#1C1A18',
    subTextColor: '#524E48',
    accentColor: '#C2410C',
    borderColor: '#E2DBD0',
    darkFieldBg: '#12100E',
    descKo: '식물성 섬유의 고유 배향이 빚어내는 유기적 복굴절을 지녀, 부드러운 파스텔톤의 감산 간섭광과 따뜻한 물질적 촉감을 자아냅니다.'
  },
  {
    id: 'polarizing_titanium',
    name: 'Anodized Polarizing Titanium',
    nameKo: '아노다이징 편광 티타늄',
    brewsterConstantC: 1.8,
    extinctionPurity: 0.99,
    surfaceTone: '#141312',
    cardTone: '#1F1D1B',
    textColor: '#FAF8F5',
    subTextColor: '#A8A29E',
    accentColor: '#4F46E5',
    borderColor: '#2E2B28',
    darkFieldBg: '#050505',
    descKo: '나노 박막 산화 피막에 의한 구조색과 기계적 정밀 힌지를 결합하여, 모놀리식한 사이버 에디토리얼의 위엄을 과시합니다.'
  }
];

const PRESETS: OpticalPreset[] = [
  {
    id: 'crossed_nicol',
    nameKo: '직교 니콜 암시야 (Crossed Nicol 90°)',
    analyzerAngle: 90,
    fieldMode: 'Dark Field Extinction',
    descKo: '배경광이 완전히 소광되어 칠흑 같은 암흑 속에서 오직 응력선과 활자만이 무지개 등색선으로 발광합니다.'
  },
  {
    id: 'parallel_field',
    nameKo: '평행 편광 명시야 (Parallel Field 0°)',
    analyzerAngle: 0,
    fieldMode: 'Bright Field Swiss Grid',
    descKo: '상아빛 석고 회벽과 현무암 잉크의 완전한 스위스 모더니즘 평형 상태로, 원색의 방해 없이 극도의 가독성을 제공합니다.'
  },
  {
    id: 'quarter_wave',
    nameKo: '4분위 위상지연 (Quarter-Wave 45°)',
    analyzerAngle: 45,
    fieldMode: 'Elliptical Polarization',
    descKo: '타원 편광이 유도되어 은은하고 몽환적인 파스텔톤 스펙트럼 후광이 에디토리얼 카드를 감쌉니다.'
  },
  {
    id: 'stress_tensor_map',
    nameKo: '촉각 기계응력 모드 (Tactile Stress Map)',
    analyzerAngle: 80,
    fieldMode: 'Dynamic Stress Injection',
    descKo: '사용자가 직접 화면을 터치하여 기계적 하중을 가할 때 실시간으로 등색선 루프가 뻗어나가는 인터랙티브 모드입니다.'
  }
];

export default function ChromaticPolarizationBentoExperiment() {
  // --- STATE ---
  const [selectedMaterial, setSelectedMaterial] = useState<OpticalMaterial>(MATERIALS[0]);
  const [selectedPreset, setSelectedPreset] = useState<OpticalPreset>(PRESETS[0]);
  const [analyzerAngle, setAnalyzerAngle] = useState<number>(90); // 0° to 360°
  const [stressScale, setStressScale] = useState<number>(1.2); // 0.2 to 2.5
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isStressDecaying, setIsStressDecaying] = useState<boolean>(true);
  const [meanStressEnergy, setMeanStressEnergy] = useState<number>(0.4);

  // 3D Perspective Tilt on Stage
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs & Multi-Point Stress Queue
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stressPointsRef = useRef<StressPoint[]>([
    { x: 0.35, y: 0.45, intensity: 1.4, decay: 1.0 },
    { x: 0.65, y: 0.55, intensity: 1.1, decay: 1.0 }
  ]);
  const lastAngleTickRef = useRef<number>(90);
  const isDraggingDialRef = useRef<boolean>(false);

  // --- AUDIO SYNTHESIZER ENGINE ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Quartz crystal bell chime
  const playQuartzChime = useCallback((freq: number = 880, intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 0.3);

    gain.gain.setValueAtTime(0.25 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }, [initAudio, isAudioMuted]);

  // Polarizer ratchet mechanical click (ticks every 15°)
  const checkAngleTicks = useCallback((angle: number) => {
    const diff = Math.abs(angle - lastAngleTickRef.current);
    if (diff >= 15) {
      lastAngleTickRef.current = angle;
      if (!isAudioMuted) {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    }
  }, [initAudio, isAudioMuted]);

  // --- OPTICAL EXTINCTION & MALUS LAW CALCULATION ---
  const malusTransmittance = useMemo(() => {
    const rad = ((analyzerAngle % 180) * Math.PI) / 180;
    const factor = Math.pow(Math.cos(rad), 2);
    return Math.max(0.02, factor);
  }, [analyzerAngle]);

  const isDarkField = useMemo(() => {
    const diff = Math.abs((analyzerAngle % 180) - 90);
    return diff < 40;
  }, [analyzerAngle]);

  // Foreshortened & Stress-compensated font weight
  const dynamicFontWeight = useMemo(() => {
    const w = 400 + Math.min(350, Math.round(meanStressEnergy * 280 + (1 - malusTransmittance) * 180));
    return w;
  }, [meanStressEnergy, malusTransmittance]);

  // --- CANVAS MULTI-SPECTRAL BREWSTER STRESS SHADER ---
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

      // 1. Clear with Malus-governed background
      const darkFactor = 1 - malusTransmittance;
      if (darkFactor > 0.6) {
        ctx.fillStyle = selectedMaterial.darkFieldBg;
      } else {
        ctx.fillStyle = selectedMaterial.surfaceTone;
      }
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Subterranean Blueprint Grating
      ctx.strokeStyle = darkFactor > 0.5 ? 'rgba(255, 255, 255, 0.12)' : selectedMaterial.borderColor;
      ctx.lineWidth = 1;
      const step = w / 8;
      for (let i = 0; i <= w; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j <= h; j += step) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // 3. Render Isochromatic Brewster Fringe Loops around stress points
      const points = stressPointsRef.current;
      const rad = ((analyzerAngle % 180) * Math.PI) / 180;
      const crossEff = Math.pow(Math.sin(rad), 2); // 1.0 at 90° (maximum fringe visibility)

      // Animate viscoelastic relaxation
      if (isStressDecaying) {
        points.forEach(pt => {
          if (pt.decay > 0.25) {
            pt.decay *= 0.992;
          }
        });
      }

      points.forEach((pt) => {
        const cx = pt.x * w;
        const cy = pt.y * h;
        const maxR = 0.26 * w * stressScale * pt.intensity * pt.decay;

        // Draw multi-order isochromatic concentric rings
        const rings = 14;
        for (let r = 1; r <= rings; r++) {
          const currentR = (r / rings) * maxR;
          const order = r % 4;

          // Physical Brewster chromatic sequence: Yellow -> Orange -> Violet -> Cyan -> Green
          let fringeColor = 'rgba(0, 240, 255, 0.75)'; // 1st Order Cyan
          if (order === 1) fringeColor = 'rgba(228, 0, 127, 0.8)'; // Magenta
          else if (order === 2) fringeColor = 'rgba(255, 237, 0, 0.85)'; // Yellow
          else if (order === 3) fringeColor = 'rgba(79, 70, 229, 0.7)'; // Indigo Violet

          ctx.beginPath();
          ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = fringeColor;
          ctx.lineWidth = Math.max(1.2, 3.8 * crossEff);
          ctx.globalAlpha = Math.min(1.0, crossEff * (1 - r / (rings + 2)) * pt.decay);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1.0;

      // 4. Draw Brewster Optical Math & Calibration Text on Canvas
      ctx.save();
      ctx.fillStyle = darkFactor > 0.5 ? '#00F0FF' : selectedMaterial.accentColor;
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillText(`[BREWSTER PHOTOELASTIC RETARDATION: θ=${analyzerAngle.toFixed(0)}°]`, 24, 38);

      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = darkFactor > 0.5 ? '#FAF8F5' : selectedMaterial.textColor;
      ctx.fillText("Δn = C · (σ1 - σ2) · Photoelastic Stress-Optic Law", 24, 62);
      ctx.fillText(`MALUS TRANSMITTANCE: ${(malusTransmittance * 100).toFixed(1)}% · EXTINCTION: ${(darkFactor * 100).toFixed(1)}%`, 24, 82);
      ctx.fillText("CROSS-NICOL DARK FIELD: λ-DEPENDENT SUBTRACTIVE QUENCHING", 24, 102);

      // Rotating analyzer reticle indicator
      ctx.strokeStyle = darkFactor > 0.5 ? '#FFED00' : selectedMaterial.accentColor;
      ctx.lineWidth = 1.5;
      const centerX = w * 0.84;
      const centerY = h * 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
      ctx.stroke();

      const lineX = Math.cos(rad) * 42;
      const lineY = Math.sin(rad) * 42;
      ctx.beginPath();
      ctx.moveTo(centerX - lineX, centerY - lineY);
      ctx.lineTo(centerX + lineX, centerY + lineY);
      ctx.stroke();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyzerAngle, malusTransmittance, selectedMaterial, stressScale, isStressDecaying]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: OpticalPreset) => {
    setSelectedPreset(preset);
    setAnalyzerAngle(preset.analyzerAngle);
    playQuartzChime(preset.analyzerAngle === 90 ? 1046.5 : 523.25, 1.0);
  };

  // Add or Drag stress point on canvas
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));

    stressPointsRef.current[0] = {
      x,
      y,
      intensity: 1.8 * stressScale,
      decay: 1.0
    };
    setMeanStressEnergy(0.75 * stressScale);
    playQuartzChime(880 + Math.random() * 200, 0.6);
  };

  // Direct Angular Dial Rotation Drag
  const handleDialDrag = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleRad = Math.atan2(clientY - cy, clientX - cx);
    let deg = Math.round((angleRad * 180) / Math.PI);
    if (deg < 0) deg += 360;
    setAnalyzerAngle(deg);
    checkAngleTicks(deg);
  };

  return (
    <div
      className="w-full min-h-screen transition-colors duration-500 font-sans select-none"
      style={{
        backgroundColor: isDarkField ? selectedMaterial.darkFieldBg : selectedMaterial.surfaceTone,
        color: isDarkField ? '#FAF8F5' : selectedMaterial.textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        className="w-full border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md"
        style={{
          borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor,
          backgroundColor: isDarkField ? selectedMaterial.darkFieldBg + 'F2' : selectedMaterial.surfaceTone + 'F2'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full animate-ping"
            style={{ backgroundColor: isDarkField ? '#00F0FF' : selectedMaterial.accentColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 037 · 2026-10-08
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isDarkField ? '#00F0FF22' : selectedMaterial.accentColor + '22',
                  color: isDarkField ? '#00F0FF' : selectedMaterial.accentColor
                }}
              >
                Photoelastic Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Chromatic Polarization Bento & Optical Retardation Shaders
            </h1>
          </div>
        </div>

        {/* Global Controls & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Material Substrate Selector */}
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
            {MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  playQuartzChime(mat.brewsterConstantC * 200, 0.8);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedMaterial.id === mat.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedMaterial.id === mat.id ? (isDarkField ? '#00F0FF' : selectedMaterial.accentColor) : 'transparent',
                  color: selectedMaterial.id === mat.id ? '#141312' : (isDarkField ? '#FAF8F5' : selectedMaterial.textColor)
                }}
              >
                {mat.nameKo.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "🔊"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "QUARTZ SOUND"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor,
              backgroundColor: isFullscreen ? (isDarkField ? '#00F0FF22' : selectedMaterial.accentColor + '22') : 'transparent',
              color: isFullscreen ? (isDarkField ? '#00F0FF' : selectedMaterial.accentColor) : (isDarkField ? '#FAF8F5' : selectedMaterial.textColor)
            }}
          >
            <span>{isFullscreen ? "🗗" : "🗖"}</span>
            <span className="hidden sm:inline">{isFullscreen ? "STANDARD" : "MONOGRAPH MODE"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className={`w-full mx-auto p-4 md:p-8 transition-all ${isFullscreen ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* BENTO GRID ARCHITECTURE (6 INTERACTIVE MODULAR CELLS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative">

          {/* CELL 1: MONUMENTAL MONOGRAPH MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
                  OPTICAL POLARIZATION: {analyzerAngle}°
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Extinction: {((1 - malusTransmittance) * 100).toFixed(0)}% · Brewster C={selectedMaterial.brewsterConstantC}B
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                MALUS EXTINCTION FIELD
              </div>
            </div>

            {/* Giant Display Typography */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Brewster Photoelastic Stress Optics
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Chromatic Polarization Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: isDarkField ? selectedMaterial.subTextColor : selectedMaterial.subTextColor }}>
                단조로운 CMYK 인쇄 분판을 초월하여, 빛의 파동 위상지연(Phase Retardation)과 직교 니콜 소광을 통해 칠흑 같은 암시야 속에서 찬란한 브루스터 등색선 무지개를 피워 올리는 살아있는 광학 에디토리얼 파빌리온.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">SUBSTRATE:</strong> {selectedMaterial.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">C_BREWSTER:</strong> {selectedMaterial.brewsterConstantC} × 10⁻¹² m²/N
                </span>
                <span>
                  <strong className="opacity-50">PURITY:</strong> {(selectedMaterial.extinctionPurity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Dynamic Weight:</span>
                <strong className={isDarkField ? 'text-cyan-400' : 'text-amber-600'}>wght: {dynamicFontWeight}</strong>
              </div>
            </div>
          </div>

          {/* CELL 2: ROTATABLE OPTICAL ANALYZER COMPASS DIAL (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Optical Analyzer Dial
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: isDarkField ? '#00F0FF' : selectedMaterial.accentColor }}>
                  {analyzerAngle}°
                </span>
              </div>

              {/* Rotary Analyzer Compass Dial */}
              <div className="flex justify-center my-3">
                <div
                  ref={dialRef}
                  onMouseDown={(e) => {
                    isDraggingDialRef.current = true;
                    handleDialDrag(e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => {
                    if (isDraggingDialRef.current) handleDialDrag(e.clientX, e.clientY);
                  }}
                  onMouseUp={() => { isDraggingDialRef.current = false; }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) handleDialDrag(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  className="w-24 h-24 rounded-full border-2 relative cursor-grab active:cursor-grabbing flex items-center justify-center shadow-md transition-all hover:scale-105"
                  style={{
                    borderColor: isDarkField ? '#00F0FF' : selectedMaterial.accentColor,
                    backgroundColor: isDarkField ? '#0A0908' : selectedMaterial.surfaceTone
                  }}
                  title="회전하여 편광축 직접 조율"
                >
                  <div
                    className="absolute w-1 h-10 rounded-full transition-transform"
                    style={{
                      backgroundColor: isDarkField ? '#00F0FF' : selectedMaterial.accentColor,
                      transform: `rotate(${analyzerAngle}deg)`,
                      transformOrigin: 'bottom center',
                      top: '8px'
                    }}
                  />
                  <div className="w-3 h-3 rounded-full bg-white shadow z-10" />
                </div>
              </div>

              {/* Angle Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Analyzer Angle (θ)</span>
                  <span>{analyzerAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={analyzerAngle}
                  onChange={(e) => {
                    const nextA = Number(e.target.value);
                    setAnalyzerAngle(nextA);
                    checkAngleTicks(nextA);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Stress Intensity Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Shear Stress Load (σ)</span>
                  <span>{(stressScale * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.1}
                  value={stressScale}
                  onChange={(e) => setStressScale(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Optical Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Polarization Presets
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
                        borderColor: selectedPreset.id === p.id ? (isDarkField ? '#00F0FF' : selectedMaterial.accentColor) : (isDarkField ? '#2E2B28' : selectedMaterial.borderColor),
                        backgroundColor: selectedPreset.id === p.id ? (isDarkField ? '#00F0FF18' : selectedMaterial.accentColor + '18') : 'transparent',
                        color: selectedPreset.id === p.id ? (isDarkField ? '#00F0FF' : selectedMaterial.accentColor) : (isDarkField ? '#FAF8F5' : selectedMaterial.textColor)
                      }}
                    >
                      <div className="font-bold truncate">{p.nameKo.split(' ')[0]}</div>
                      <div className="text-[10px] opacity-60 truncate">{p.analyzerAngle}° · {p.fieldMode.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              💡 다이얼을 90도로 돌려 직교 니콜 암시야 소광을 체험하세요.
            </div>
          </div>

          {/* CELL 3: 2D PHOTOELASTIC CANVAS VIEWPORT (Span 7 Cols) */}
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width - 0.5;
              const ny = (e.clientY - rect.top) / rect.height - 0.5;
              setStageTilt({ x: ny * -6, y: nx * 6 });
            }}
            onMouseLeave={() => setStageTilt({ x: 0, y: 0 })}
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-transform duration-200"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor,
              transform: `perspective(1000px) rotateX(${stageTilt.x}deg) rotateY(${stageTilt.y}deg)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Photoelastic Retardation Field
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                  Brewster Isochromatics
                </span>
              </div>

              {/* Viewport Action */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setIsStressDecaying(!isStressDecaying)}
                  className={`px-2 py-1 rounded border text-[11px] ${isStressDecaying ? 'font-bold' : 'opacity-60'}`}
                  style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}
                >
                  Decay: {isStressDecaying ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => {
                    stressPointsRef.current = [
                      { x: 0.5, y: 0.5, intensity: 1.5, decay: 1.0 }
                    ];
                    playQuartzChime(880, 0.8);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}
                >
                  Reset Stress Point
                </button>
              </div>
            </div>

            {/* Interactive Photoelastic Canvas */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
              />

              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: isDarkField ? selectedMaterial.darkFieldBg + 'E6' : selectedMaterial.surfaceTone + 'E6',
                  borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Brewster δ(λ): <strong>{((1 - malusTransmittance) * 2.8).toFixed(2)}π rad</strong></span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>CLICK TO INJECT POINT-LOAD MECHANICAL STRESS</span>
              <span>I(λ) = I₀·sin²(2φ)·sin²(δ/2)</span>
            </div>
          </div>

          {/* CELL 4: SUBTRACTIVE TYPOGRAPHIC MONOGRAPH (Span 5 Cols) */}
          <div
            className="md:col-span-5 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Stress-Compensating Typography
                </span>
                <span className="text-xs font-mono font-bold text-amber-500">
                  wght: {dynamicFontWeight}
                </span>
              </div>

              <div
                className="p-4 rounded-xl border mb-4 relative overflow-hidden"
                style={{
                  borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor,
                  backgroundColor: isDarkField ? selectedMaterial.darkFieldBg : selectedMaterial.surfaceTone
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 37 Photoelastic Law
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "In the darkness of crossed Nicol filters, stress becomes the only illumination."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  직교 편광판의 완전 소광 속에서 배경은 침묵하지만, 기계적 하중이 걸린 활자는 브루스터 등색선 무지개로 부활하여 불변의 가독성을 증명합니다.
                </div>
              </div>

              {/* Stress Retardation Axis Inspector */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Variable Font Weight (wght)</span>
                    <span>{dynamicFontWeight} / 750</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${((dynamicFontWeight - 350) / 400) * 100}%`,
                        backgroundColor: isDarkField ? '#00F0FF' : selectedMaterial.accentColor
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Malus Field Extinction</span>
                    <span>{((1 - malusTransmittance) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(1 - malusTransmittance) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <span>SIR DAVID BREWSTER</span>
              <span>1816 PHOTOELASTICITY</span>
            </div>
          </div>

          {/* CELL 5: OPTICAL SUBSTRATE SPECIFICATIONS (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Optical Material Specifications
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: isDarkField ? '#00F0FF' : selectedMaterial.accentColor }}>
                  {selectedMaterial.nameKo}
                </span>
              </div>

              <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                {selectedMaterial.descKo}
              </p>

              {/* Material Physics Parameters Table */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">BREWSTER (C)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.brewsterConstantC}</div>
                  <div className="text-[10px] opacity-50">×10⁻¹² m²/N</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">EXTINCTION</div>
                  <div className="text-base font-bold mt-0.5">{(selectedMaterial.extinctionPurity * 100).toFixed(0)}%</div>
                  <div className="text-[10px] opacity-50">Optical Purity</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">FIELD STATE</div>
                  <div className="text-base font-bold mt-0.5">{isDarkField ? 'DARK' : 'BRIGHT'}</div>
                  <div className="text-[10px] opacity-50">Malus Law</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <span className="opacity-60">CROSSED NICOL TECTONICS</span>
              <span className="font-bold" style={{ color: isDarkField ? '#00F0FF' : selectedMaterial.accentColor }}>
                BIREFRINGENCE RESOLVED
              </span>
            </div>
          </div>

          {/* CELL 6: TACTILE OPTICAL SOUNDBOARD (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: isDarkField ? selectedMaterial.cardTone : '#FFFFFF',
              borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Tactile Quartz Acoustic Synthesizer
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                편광 필터 회전 래칫 클릭음, 880Hz 수정 결정 종소리, 그리고 기계적 응력 집중 텐션 사운드를 직접 연주하세요.
              </p>

              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Quartz 880', action: () => playQuartzChime(880, 1.0), label: '수정 벨 차임' },
                  { name: 'High Nicol', action: () => playQuartzChime(1318.5, 0.9), label: '고주파 소광음' },
                  { name: 'Low Stress', action: () => playQuartzChime(440, 1.2), label: '저주파 응력음' },
                  { name: 'Ratchet Click', action: () => checkAngleTicks((analyzerAngle + 15) % 180), label: '편광 래칫 틱' },
                ].map((snd) => (
                  <button
                    key={snd.name}
                    onClick={snd.action}
                    className="p-2.5 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 group"
                    style={{
                      borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor,
                      backgroundColor: isDarkField ? selectedMaterial.darkFieldBg : selectedMaterial.surfaceTone
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

            <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60" style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}>
              <span>Pure Sine Quartz Chimes + Mechanical Ratchet Ticks</span>
              <span>Zero-Fatigue Tactile Haptics</span>
            </div>
          </div>

        </div>

        {/* FOOTER EDITORIAL SUMMARY */}
        <footer
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-70"
          style={{ borderColor: isDarkField ? '#2E2B28' : selectedMaterial.borderColor }}
        >
          <div>
            Design Minds · Gemini (The Noon Mind) · Day 037 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-08</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: CHROMATIC POLARIZATION BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
