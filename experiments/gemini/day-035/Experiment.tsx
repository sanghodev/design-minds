import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface PaperSubstrate {
  id: string;
  name: string;
  nameKo: string;
  fiberType: string;
  fiberLengthMm: number;
  anisotropyRatio: number;
  porosity: number;
  evapRate: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  blueprintColor: string;
  sheenColor: string;
  descKo: string;
}

interface StylusTool {
  id: 'brush' | 'squeegee' | 'stamp' | 'rain';
  nameKo: string;
  icon: string;
  desc: string;
}

const SUBSTRATES: PaperSubstrate[] = [
  {
    id: 'echizen_washi',
    name: 'Echizen Kozo Washi',
    nameKo: '에치젠 닥나무 한지',
    fiberType: 'Mulberry Kozo long fibers',
    fiberLengthMm: 12.5,
    anisotropyRatio: 2.8,
    porosity: 0.68,
    evapRate: 0.012,
    surfaceTone: '#FBF9F4',
    cardTone: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    accentColor: '#C5A059',
    borderColor: '#E8E2D8',
    blueprintColor: '#0284C7',
    sheenColor: 'rgba(229, 200, 135, 0.45)',
    descKo: '긴 닥나무 섬유가 얽혀 있어 결 방향으로 극적인 붓 번짐과 따뜻하고 깊은 수묵의 농담을 연출합니다.'
  },
  {
    id: 'arches_cotton',
    name: 'Arches Heavy Cotton Rag',
    nameKo: '아르쉬 중량 코튼 판화지',
    fiberType: '100% Pure cotton rag',
    fiberLengthMm: 3.8,
    anisotropyRatio: 1.2,
    porosity: 0.52,
    evapRate: 0.018,
    surfaceTone: '#F4EFE6',
    cardTone: '#FFFFFF',
    textColor: '#1E1C1A',
    subTextColor: '#524E48',
    accentColor: '#C2410C',
    borderColor: '#E2DBD0',
    blueprintColor: '#2563EB',
    sheenColor: 'rgba(194, 65, 12, 0.35)',
    descKo: '순면 100%의 촘촘한 미세공극 구조로 수분을 균일하게 흡수하며 단단하고 우아한 스위스 판화 질감을 제공합니다.'
  },
  {
    id: 'cyber_epaper',
    name: 'Cybernetic Micro-Capsule E-Paper',
    nameKo: '사이버네틱 전자종이',
    fiberType: 'Bistable electronic micro-capsules',
    fiberLengthMm: 0.5,
    anisotropyRatio: 1.0,
    porosity: 0.35,
    evapRate: 0.035,
    surfaceTone: '#EAE7E1',
    cardTone: '#F3F1EC',
    textColor: '#0F172A',
    subTextColor: '#64748B',
    accentColor: '#0284C7',
    borderColor: '#D4CFC7',
    blueprintColor: '#06B6D4',
    sheenColor: 'rgba(2, 132, 199, 0.35)',
    descKo: '전기영동 마이크로캡슐을 모사하여 즉각적인 증발 반응과 면도날 같은 네오 브루탈리즘 모노스페이스 선명도를 자랑합니다.'
  }
];

const STYLUS_TOOLS: StylusTool[] = [
  { id: 'brush', nameKo: '수분 브러시 (Water Brush)', icon: '🖌️', desc: '모세관을 따라 수분을 주입하여 지하층의 청사진을 들춥니다.' },
  { id: 'squeegee', nameKo: '건조 스퀴지 (Squeegee)', icon: '🧹', desc: '표면 수분을 즉각 닦아내어 불투명한 종이 상태로 복원합니다.' },
  { id: 'stamp', nameKo: '영구 먹물 인장 (Sumi Stamp)', icon: '🏮', desc: '증발하지 않는 영구적인 테라코타 전서체 인장을 각인합니다.' },
  { id: 'rain', nameKo: '대기 빗방울 (Rain Droplets)', icon: '🌧️', desc: '무작위 모세관 빗방울을 투하하여 유기적 확산 무늬를 형성합니다.' }
];

export default function HydroCapillaryBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<PaperSubstrate>(SUBSTRATES[0]);
  const [activeTool, setActiveTool] = useState<'brush' | 'squeegee' | 'stamp' | 'rain'>('brush');
  const [relativeHumidity, setRelativeHumidity] = useState<number>(45); // 15% to 95%
  const [fiberAngleDeg, setFiberAngleDeg] = useState<number>(35); // 0 to 180 degrees
  const [brushRadius, setBrushRadius] = useState<number>(28); // 10 to 60 px
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [meanMoisture, setMeanMoisture] = useState<number>(0);

  // 3D Perspective Tilt on Paper Canvas
  const [paperTilt, setPaperTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs & Simulation Grid (80 x 60 cells)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const gridWidth = 80;
  const gridHeight = 60;
  const moistureGrid = useRef<Float32Array>(new Float32Array(gridWidth * gridHeight));
  const permanentGrid = useRef<Float32Array>(new Float32Array(gridWidth * gridHeight));
  const isInteractingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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

  // Paper friction sound (filtered white noise simulating cellulose fiber brush)
  const playPaperFrictionSound = useCallback((speed: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 * Math.max(0.6, speed), ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08 * Math.min(1.5, speed), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.16);
  }, [initAudio, isAudioMuted]);

  // Capillary effervescence / water droplet acoustic tap
  const playDropletSound = useCallback((isStamp: boolean = false, isSqueegee: boolean = false) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isStamp) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    } else if (isSqueegee) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 + Math.random() * 140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }, [initAudio, isAudioMuted]);

  // --- INJECT MOISTURE ONTO GRID ---
  const injectMoisture = useCallback((clientX: number, clientY: number, erase: boolean = false, isStamp: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    const gx = Math.floor(x * gridWidth);
    const gy = Math.floor(y * gridHeight);
    const r = Math.max(1, Math.floor((brushRadius / rect.width) * gridWidth));

    const grid = moistureGrid.current;
    const perm = permanentGrid.current;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= r) {
            const factor = Math.max(0, 1 - dist / r);
            const idx = ny * gridWidth + nx;

            if (erase) {
              grid[idx] = Math.max(0, grid[idx] - factor * 0.45);
            } else if (isStamp) {
              perm[idx] = Math.min(1.0, perm[idx] + factor * 0.85);
            } else {
              grid[idx] = Math.min(1.0, grid[idx] + factor * 0.35);
            }
          }
        }
      }
    }

    if (isStamp) {
      playDropletSound(true, false);
    } else if (erase) {
      playDropletSound(false, true);
    } else {
      playPaperFrictionSound(1.0);
    }
  }, [brushRadius, playDropletSound, playPaperFrictionSound]);

  // --- SIMULATION & CANVAS RENDER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const rad = (fiberAngleDeg * Math.PI) / 180;
    const cosF = Math.cos(rad);
    const sinF = Math.sin(rad);

    // Evaporative rate scaled by humidity
    const evapFactor = selectedSubstrate.evapRate * (1 - relativeHumidity / 100);
    const anisoRatio = selectedSubstrate.anisotropyRatio;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;
      const grid = moistureGrid.current;
      const perm = permanentGrid.current;

      // 1. Capillary Anisotropic Tensor Diffusion & Evaporation Step
      let sumMoisture = 0;
      const nextGrid = new Float32Array(gridWidth * gridHeight);

      for (let y = 1; y < gridHeight - 1; y++) {
        for (let x = 1; x < gridWidth - 1; x++) {
          const idx = y * gridWidth + x;
          const c = grid[idx];
          sumMoisture += c;

          if (c <= 0.001) {
            nextGrid[idx] = 0;
            continue;
          }

          // Natural evaporation
          let nextC = Math.max(0, c - evapFactor);

          // Anisotropic neighbor gradients
          const cLeft = grid[y * gridWidth + (x - 1)];
          const cRight = grid[y * gridWidth + (x + 1)];
          const cTop = grid[(y - 1) * gridWidth + x];
          const cBottom = grid[(y + 1) * gridWidth + x];

          // Directional projections along fiber orientation
          const gradX = (cRight - cLeft) * 0.5;
          const gradY = (cBottom - cTop) * 0.5;

          const gradParallel = gradX * cosF + gradY * sinF;
          const gradPerp = -gradX * sinF + gradY * cosF;

          // Flux with anisotropy
          const fluxParallel = gradParallel * 0.08 * anisoRatio;
          const fluxPerp = gradPerp * 0.08 * (1 / anisoRatio);

          const laplacian = (cLeft + cRight + cTop + cBottom - 4 * c) * 0.15;

          nextC += laplacian + (fluxParallel * cosF - fluxPerp * sinF) * 0.2;
          nextGrid[idx] = Math.max(0, Math.min(1.0, nextC));
        }
      }

      moistureGrid.current.set(nextGrid);
      setMeanMoisture(sumMoisture / (gridWidth * gridHeight));

      // 2. Draw Subterranean Layer (Concealed Architectural Blueprints & Mono Grid)
      ctx.fillStyle = selectedSubstrate.surfaceTone;
      ctx.fillRect(0, 0, w, h);

      // Baseline drafting grid lines
      ctx.strokeStyle = isXRayMode ? selectedSubstrate.blueprintColor + '40' : selectedSubstrate.borderColor;
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

      // Draw Subterranean Blueprint Text & Geometry
      ctx.save();
      ctx.fillStyle = isXRayMode ? '#0284C7' : selectedSubstrate.blueprintColor;
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillText("[SUBTERRANEAN LAYER: KINETIC POROSITY SCHEMA]", 24, 40);

      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText("L² = (γ·r·cosθ / 2μ) · t · Washburn Capillary Equation", 24, 65);
      ctx.fillText(`FIBER ANGLE: ${fiberAngleDeg}° · ANISOTROPY RATIO: ${anisoRatio}:1`, 24, 85);
      ctx.fillText("ARCHITECTURAL GRID: JOSEF MÜLLER-BROCKMANN 1961", 24, 105);

      // Subterranean concentric circles & golden spiral blueprint
      ctx.strokeStyle = selectedSubstrate.blueprintColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(w * 0.65, h * 0.5, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.65, h * 0.5, 55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(w * 0.52, h * 0.28, 150, 150);
      ctx.restore();

      // 3. Draw Opaque Paper Overcoat with Dynamic Hydrochromic Transparency
      const cellW = w / gridWidth;
      const cellH = h / gridHeight;

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const idx = y * gridWidth + x;
          const moist = moistureGrid.current[idx];
          const permVal = permanentGrid.current[idx];

          if (moist > 0.01 || permVal > 0.01) {
            const px = x * cellW;
            const py = y * cellH;

            if (permVal > 0.05) {
              // Permanent terracotta ink stamp
              ctx.fillStyle = `rgba(194, 65, 12, ${permVal * 0.85})`;
              ctx.fillRect(px, py, cellW + 1, cellH + 1);
            }

            if (moist > 0.02) {
              // Wet water wash with soft sumi halo
              const haloAlpha = moist * 0.45;
              ctx.fillStyle = `rgba(20, 19, 18, ${haloAlpha})`;
              ctx.fillRect(px, py, cellW + 1, cellH + 1);
            }
          }
        }
      }

      // 4. Subtle Micro-Fiber Texture Overlay
      ctx.save();
      ctx.strokeStyle = selectedSubstrate.accentColor + '18';
      ctx.lineWidth = 0.8;
      const fiberStep = 18;
      for (let x = 0; x < w; x += fiberStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + cosF * 14, h);
        ctx.stroke();
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [fiberAngleDeg, relativeHumidity, selectedSubstrate, isXRayMode]);

  // Rain mode interval
  useEffect(() => {
    if (activeTool !== 'rain') return;
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const rx = rect.left + Math.random() * rect.width;
      const ry = rect.top + Math.random() * rect.height;
      injectMoisture(rx, ry, false, false);
      playDropletSound(false, false);
    }, 260);
    return () => clearInterval(interval);
  }, [activeTool, injectMoisture, playDropletSound]);

  // Dynamic Variable Font Weight for Display Text
  const dynamicFontWeight = useMemo(() => {
    const w = 450 + Math.min(300, Math.floor(meanMoisture * 1200));
    return w;
  }, [meanMoisture]);

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
            className="w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ backgroundColor: selectedSubstrate.accentColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 035 · 2026-10-06
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Hydro-Capillary Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Anisotropic Capillary Shaders & Micro-Porous Monograph
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
                  playDropletSound(false, false);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedSubstrate.id === sub.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSubstrate.id === sub.id ? selectedSubstrate.accentColor : 'transparent',
                  color: selectedSubstrate.id === sub.id ? '#FFFFFF' : selectedSubstrate.textColor
                }}
              >
                {sub.nameKo.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* X-Ray Mode Toggle */}
          <button
            onClick={() => setIsXRayMode(!isXRayMode)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{
              borderColor: selectedSubstrate.borderColor,
              backgroundColor: isXRayMode ? selectedSubstrate.blueprintColor + '22' : 'transparent',
              color: isXRayMode ? selectedSubstrate.blueprintColor : selectedSubstrate.textColor
            }}
            title="지하층 도면 투시 모드"
          >
            <span>{isXRayMode ? "👁️" : "🕶️"}</span>
            <span className="hidden sm:inline">{isXRayMode ? "X-RAY ON" : "X-RAY OFF"}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{ borderColor: selectedSubstrate.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "🔊"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "HAPTIC SOUND"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{
              borderColor: selectedSubstrate.borderColor,
              backgroundColor: isFullscreen ? selectedSubstrate.accentColor + '22' : 'transparent',
              color: isFullscreen ? selectedSubstrate.accentColor : selectedSubstrate.textColor
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
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
                  CAPILLARY WICKING ACTIVE
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Fiber φ={fiberAngleDeg}° · RH={relativeHumidity}%
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                LUCAS-WASHBURN DYNAMICS
              </div>
            </div>

            {/* Giant Display Typography */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Anisotropic Capillary Fluid Monograph
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Hydro-Capillary Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                단조로운 환경 블러를 폐기하고, 셀룰로오스 섬유의 이방성 모세관 확산과 수분 감응형 반투명화(Hydrochromic Translucency)를 통해 지하층의 에디토리얼 청사진을 들추어내는 살아 숨 쉬는 종이 건축.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">SUBSTRATE:</strong> {selectedSubstrate.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">FIBER LENGTH:</strong> {selectedSubstrate.fiberLengthMm} mm
                </span>
                <span>
                  <strong className="opacity-50">ANISOTROPY:</strong> {selectedSubstrate.anisotropyRatio}:1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Mean Saturation:</span>
                <strong className="text-blue-600">{(meanMoisture * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          {/* CELL 2: ATMOSPHERIC CHAMBER & FIBER GRAIN COMPASS (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Micro-Climate Chamber
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {relativeHumidity}% RH
                </span>
              </div>

              {/* Relative Humidity Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Relative Humidity (RH)</span>
                  <span>{relativeHumidity}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={95}
                  value={relativeHumidity}
                  onChange={(e) => setRelativeHumidity(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Fiber Orientation Angle Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Fiber Grain Orientation (φ)</span>
                  <span>{fiberAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={fiberAngleDeg}
                  onChange={(e) => setFiberAngleDeg(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Brush Radius Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Water Brush Aperture</span>
                  <span>{brushRadius} px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={brushRadius}
                  onChange={(e) => setBrushRadius(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Stylus Tools Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Tactile Stylus Implements
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {STYLUS_TOOLS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTool(t.id);
                        playDropletSound(t.id === 'stamp', t.id === 'squeegee');
                      }}
                      className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                        activeTool === t.id ? 'font-bold' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: activeTool === t.id ? selectedSubstrate.accentColor : selectedSubstrate.borderColor,
                        backgroundColor: activeTool === t.id ? selectedSubstrate.accentColor + '18' : 'transparent',
                        color: activeTool === t.id ? selectedSubstrate.accentColor : selectedSubstrate.textColor
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t.icon}</span>
                        <span className="truncate">{t.nameKo.split(' ')[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              💡 브러시로 캔버스를 문질러 지하층에 숨겨진 청사진을 확인하세요.
            </div>
          </div>

          {/* CELL 3: 2D INTERACTIVE CAPILLARY CANVAS (Span 7 Cols) */}
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width - 0.5;
              const ny = (e.clientY - rect.top) / rect.height - 0.5;
              setPaperTilt({ x: ny * -6, y: nx * 6 });
            }}
            onMouseLeave={() => setPaperTilt({ x: 0, y: 0 })}
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-transform duration-200"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor,
              transform: `perspective(1000px) rotateX(${paperTilt.x}deg) rotateY(${paperTilt.y}deg)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Micro-Porous Paper Canvas
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">
                  80x60 Diffusion Lattice
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    moistureGrid.current.fill(0);
                    permanentGrid.current.fill(0);
                    playPaperFrictionSound(1.6);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  Clear Sheet
                </button>
              </div>
            </div>

            {/* Interactive Canvas Viewport */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: selectedSubstrate.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => {
                  isInteractingRef.current = true;
                  lastPosRef.current = { x: e.clientX, y: e.clientY };
                  injectMoisture(e.clientX, e.clientY, activeTool === 'squeegee', activeTool === 'stamp');
                }}
                onMouseMove={(e) => {
                  if (!isInteractingRef.current) return;
                  injectMoisture(e.clientX, e.clientY, activeTool === 'squeegee', activeTool === 'stamp');
                  lastPosRef.current = { x: e.clientX, y: e.clientY };
                }}
                onMouseUp={() => { isInteractingRef.current = false; lastPosRef.current = null; }}
                onMouseLeave={() => { isInteractingRef.current = false; lastPosRef.current = null; }}
                onTouchStart={(e) => {
                  if (e.touches[0]) {
                    isInteractingRef.current = true;
                    injectMoisture(e.touches[0].clientX, e.touches[0].clientY, activeTool === 'squeegee', activeTool === 'stamp');
                  }
                }}
                onTouchMove={(e) => {
                  if (isInteractingRef.current && e.touches[0]) {
                    injectMoisture(e.touches[0].clientX, e.touches[0].clientY, activeTool === 'squeegee', activeTool === 'stamp');
                  }
                }}
                onTouchEnd={() => { isInteractingRef.current = false; }}
              />

              {/* Overlay Fiber Angle Reticle */}
              <div
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedSubstrate.cardTone + 'E6',
                  borderColor: selectedSubstrate.borderColor
                }}
              >
                <span
                  className="inline-block w-4 h-0.5 bg-amber-600 transition-transform"
                  style={{ transform: `rotate(${fiberAngleDeg}deg)` }}
                />
                <span>Fiber Grain: <strong>{fiberAngleDeg}°</strong></span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>ACTIVE STYLUS: {activeTool.toUpperCase()}</span>
              <span>L² = (γ·r·cosθ / 2μ)·t</span>
            </div>
          </div>

          {/* CELL 4: SUBTERRANEAN EDITORIAL MONOGRAPH & VARIABLE FONT (Span 5 Cols) */}
          <div
            className="md:col-span-5 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Moisture-Saturated Variable Text
                </span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  wght: {dynamicFontWeight}
                </span>
              </div>

              <div className="p-4 rounded-xl border mb-4 relative overflow-hidden" style={{ borderColor: selectedSubstrate.borderColor, backgroundColor: selectedSubstrate.surfaceTone }}>
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 35 Material Philosophy
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "Paper does not resist the brush; it breathes moisture, revealing what was written in silence."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  종이는 결코 붓을 거부하지 않습니다. 수분을 머금어 침묵 속에 새겨져 있던 청사진을 수면 위로 피워 올리고, 마침내 본래의 고요로 돌아갑니다.
                </div>
              </div>

              {/* Variable Font Axis Inspector */}
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
                        width: `${((dynamicFontWeight - 400) / 350) * 100}%`,
                        backgroundColor: selectedSubstrate.accentColor
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Hydrochromic Translucency</span>
                    <span>{(Math.min(1.0, meanMoisture * 4) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, meanMoisture * 400)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>JOSEF MÜLLER-BROCKMANN</span>
              <span>POROUS SWISS GRID</span>
            </div>
          </div>

          {/* CELL 5: PAPER SUBSTRATE METRIC CHAMBER (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Cellulose Micro-Structure
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {selectedSubstrate.nameKo}
                </span>
              </div>

              <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                {selectedSubstrate.descKo}
              </p>

              {/* Material Physics Parameters Table */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">FIBER LENGTH</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.fiberLengthMm}</div>
                  <div className="text-[10px] opacity-50">mm (Mean)</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">ANISOTROPY</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.anisotropyRatio}:1</div>
                  <div className="text-[10px] opacity-50">D∥ / D⊥</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">POROSITY (ε)</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.porosity}</div>
                  <div className="text-[10px] opacity-50">V_void / V_total</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span className="opacity-60">LUCAS-WASHBURN KINETICS</span>
              <span className="font-bold" style={{ color: selectedSubstrate.accentColor }}>
                PERCOLATION RESOLVED
              </span>
            </div>
          </div>

          {/* CELL 6: TACTILE SOUNDBOARD & ACOUSTIC HAPTICS (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Tactile Paper Friction Synthesizer
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                붓이 마른 한지 위를 지나갈 때의 사각거림, 수분이 미세공극 속으로 침투할 때 발생하는 기포 소리, 그리고 영구 먹물 인장의 타격음을 연주하세요.
              </p>

              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Kozo Brush', action: () => playPaperFrictionSound(1.0), label: '닥나무 마찰음' },
                  { name: 'Cotton Drag', action: () => playPaperFrictionSound(1.6), label: '판화지 마찰음' },
                  { name: 'Water Drop', action: () => playDropletSound(false, false), label: '모세관 물방울' },
                  { name: 'Sumi Stamp', action: () => playDropletSound(true, false), label: '테라코타 인장' },
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
                    <div className="text-xs font-mono font-bold group-hover:text-amber-600 transition-colors">
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
              <span>Filtered White Noise + Biquad Resonance</span>
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
            Design Minds · Gemini (The Noon Mind) · Day 035 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-06</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: HYDRO-CAPILLARY BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
