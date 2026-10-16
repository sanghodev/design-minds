"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface CellularSubstrate {
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

interface EcosystemPreset {
  id: string;
  nameKo: string;
  initialDensity: number; // 0.0 to 0.4
  tickSpeedMs: number; // 30 to 120ms
  spawnPattern: 'glider' | 'pulsar' | 'soup' | 'clear';
  descKo: string;
}

const SUBSTRATES: CellularSubstrate[] = [
  {
    id: 'bristol_ivory',
    name: 'Swiss Ivory Paper Petri',
    nameKo: '스위스 상아빛 페트리 접시',
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#111318',
    subTextColor: '#57534E',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#E2E8F0',
    descKo: '요제프 뮐러-브로크만의 정갈한 인쇄용 상아빛 종이 위에 에메랄드 세포들이 번식하며 우아한 생명 유기체를 이룹니다.'
  },
  {
    id: 'slate_basalt_matrix',
    name: 'Sintered Basalt Biomatrix',
    nameKo: '소결 현무암 바이오 매트릭스',
    surfaceTone: '#0C0E12',
    cardTone: '#141820',
    textColor: '#FAF8F5',
    subTextColor: '#94A3B8',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    borderColor: '#242C3D',
    descKo: '어두운 흑연 기판 위에 형광 시안 글라이더들이 날아다니며 사이버 에디토리얼의 날카로운 긴장감을 극대화합니다.'
  },
  {
    id: 'brass_autoclave_dish',
    name: 'Milled Brass Nutrient Dish',
    nameKo: '황동 정밀 배양 샬레',
    surfaceTone: '#F3EFE8',
    cardTone: 'rgba(255, 255, 255, 0.96)',
    textColor: '#1C1917',
    subTextColor: '#78716C',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    borderColor: '#DED6CB',
    descKo: '황동 실험실 기구의 고전적 광학 눈금과 호박색 미토틱 세포가 결합되어 복잡계 생물학의 권위를 드러냅니다.'
  }
];

const PRESETS: EcosystemPreset[] = [
  {
    id: 'glider_migration',
    nameKo: '글라이더 공간 이주 모드 (Glider Streams)',
    initialDensity: 0.18,
    tickSpeedMs: 50,
    spawnPattern: 'glider',
    descKo: '살아있는 5세포 글라이더들이 벤토 카드의 여백을 가로질러 지속적으로 이주합니다.'
  },
  {
    id: 'pulsar_oscillator',
    nameKo: '펄서 주기 진동 군락 (Pulsar Oscillators)',
    initialDensity: 0.25,
    tickSpeedMs: 70,
    spawnPattern: 'pulsar',
    descKo: '규칙적인 3주기 진동자들이 박동하며 활자의 굵기를 심장 박동처럼 진동시킵니다.'
  },
  {
    id: 'edge_of_chaos',
    nameKo: '혼돈의 가장자리 원시 수프 (Langton λ ≈ 0.273)',
    initialDensity: 0.34,
    tickSpeedMs: 40,
    spawnPattern: 'soup',
    descKo: '크리스토퍼 랭턴의 임계 상전이 영역에서 끊임없이 새로운 세포 생태계가 발현합니다.'
  },
  {
    id: 'sterile_baseline',
    nameKo: '멸균 스위스 모더니즘 정적 모드 (Sterile Grid)',
    initialDensity: 0.0,
    tickSpeedMs: 60,
    spawnPattern: 'clear',
    descKo: '모든 세포가 0으로 멸균되어 스위스 국제주의 그리드의 완벽한 음화 공간으로 회귀합니다.'
  }
];

// Grid dimensions: 48 columns x 36 rows = 1,728 cells
const COLS = 48;
const ROWS = 36;

export default function CellularSyntacticBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<CellularSubstrate>(SUBSTRATES[0]);
  const [selectedPreset, setSelectedPreset] = useState<EcosystemPreset>(PRESETS[0]);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [tickSpeed, setTickSpeed] = useState<number>(50); // ms per generation
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [aliveCount, setAliveCount] = useState<number>(0);
  const [brushMode, setBrushMode] = useState<'glider' | 'blinker' | 'single'>('glider');
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grid Buffer (Uint8Array for raw performance)
  const gridRef = useRef<Uint8Array>(new Uint8Array(COLS * ROWS));
  const nextGridRef = useRef<Uint8Array>(new Uint8Array(COLS * ROWS));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const lastCellCoordRef = useRef<{ c: number; r: number }>({ c: -1, r: -1 });

  // Initialize Cellular Grid Pattern
  const initPattern = useCallback((pattern: 'glider' | 'pulsar' | 'soup' | 'clear') => {
    const grid = gridRef.current;
    grid.fill(0);

    if (pattern === 'soup') {
      for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.random() < 0.28 ? 1 : 0;
      }
    } else if (pattern === 'glider') {
      // Spawn 4 diagonal gliders
      const spawnGlider = (startC: number, startR: number) => {
        const coords = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
        coords.forEach(([dc, dr]) => {
          const c = (startC + dc) % COLS;
          const r = (startR + dr) % ROWS;
          grid[r * COLS + c] = 1;
        });
      };
      spawnGlider(4, 4);
      spawnGlider(16, 6);
      spawnGlider(28, 8);
      spawnGlider(38, 12);
    } else if (pattern === 'pulsar') {
      // Spawn central pulsar oscillator
      const cx = 24;
      const cy = 18;
      const offsets = [
        [-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4],
        [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4],
        [-4, -6], [-3, -6], [-2, -6], [2, -6], [3, -6], [4, -6],
        [-4, 6], [-3, 6], [-2, 6], [2, 6], [3, 6], [4, 6]
      ];
      offsets.forEach(([dc, dr]) => {
        const c = (cx + dc + COLS) % COLS;
        const r = (cy + dr + ROWS) % ROWS;
        grid[r * COLS + c] = 1;
      });
    }

    setGenerationCount(0);
  }, []);

  useEffect(() => {
    initPattern('glider');
  }, [initPattern]);

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

  // Pentatonic Cell Birth Note
  const playCellNote = useCallback((pitchIndex: number = 0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Pentatonic scale frequencies (C5, D5, E5, G5, A5, C6)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = notes[pitchIndex % notes.length];

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [initAudio, isAudioMuted]);

  // Crisp Relay Snap & Crystal Bell upon Sterile Reset
  const playSterileResetChime = useCallback(() => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    // 1. Relay Click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1600, now);
    clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.07);

    // 2. Crystal Bell (880Hz)
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(880, now);
    bellOsc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
    bellGain.gain.setValueAtTime(0.3, now);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    bellOsc.start(now);
    bellOsc.stop(now + 0.9);
  }, [initAudio, isAudioMuted]);

  // --- CELLULAR ENGINE STEP LOOP (CONWAY B3/S23) ---
  const stepGeneration = useCallback(() => {
    const current = gridRef.current;
    const next = nextGridRef.current;
    let alive = 0;
    let birthCount = 0;

    for (let r = 0; r < ROWS; r++) {
      const rUp = (r - 1 + ROWS) % ROWS;
      const rDown = (r + 1) % ROWS;

      for (let c = 0; c < COLS; c++) {
        const cLeft = (c - 1 + COLS) % COLS;
        const cRight = (c + 1) % COLS;

        // Count 8 Moore neighbors
        const n =
          current[rUp * COLS + cLeft] +
          current[rUp * COLS + c] +
          current[rUp * COLS + cRight] +
          current[r * COLS + cLeft] +
          current[r * COLS + cRight] +
          current[rDown * COLS + cLeft] +
          current[rDown * COLS + c] +
          current[rDown * COLS + cRight];

        const state = current[r * COLS + c];
        let nextState = 0;

        // B3 / S23 Rules
        if (state === 1 && (n === 2 || n === 3)) {
          nextState = 1;
        } else if (state === 0 && n === 3) {
          nextState = 1;
          birthCount++;
        }

        next[r * COLS + c] = nextState;
        if (nextState === 1) alive++;
      }
    }

    // Swap buffers
    gridRef.current = next;
    nextGridRef.current = current;

    setGenerationCount(prev => prev + 1);
    setAliveCount(alive);

    if (birthCount > 0 && Math.random() < 0.25) {
      playCellNote(birthCount);
    }
  }, [playCellNote]);

  // Main Generation Interval
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      stepGeneration();
    }, tickSpeed);

    return () => clearInterval(timer);
  }, [isRunning, tickSpeed, stepGeneration]);

  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  // Living biomass density factor (0.0 to 1.0)
  const biomassDensity = useMemo(() => {
    return Math.min(1.0, aliveCount / 350);
  }, [aliveCount]);

  const dynamicFontWeight = useMemo(() => {
    // 300 up to 800
    return Math.min(800, Math.round(300 + biomassDensity * 500));
  }, [biomassDensity]);

  const dynamicTracking = useMemo(() => {
    // Tracking dilates up to +0.06em under cellular reproduction
    return (biomassDensity * 0.06).toFixed(3);
  }, [biomassDensity]);

  // Sterile Grid Reset Handler
  const handleSterileReset = useCallback(() => {
    playSterileResetChime();
    gridRef.current.fill(0);
    nextGridRef.current.fill(0);
    setAliveCount(0);
    setGenerationCount(0);
  }, [playSterileResetChime]);

  // Preset Selection Handler
  const handleSelectPreset = useCallback((preset: EcosystemPreset) => {
    setSelectedPreset(preset);
    setTickSpeed(preset.tickSpeedMs);
    initPattern(preset.spawnPattern);
    playCellNote(2);
  }, [initPattern, playCellNote]);

  // Inject Pattern at Grid Coordinate (c, r)
  const injectPatternAt = useCallback((c: number, r: number, mode: 'glider' | 'blinker' | 'single') => {
    const grid = gridRef.current;
    if (mode === 'single') {
      const idx = r * COLS + c;
      grid[idx] = grid[idx] ? 0 : 1;
    } else if (mode === 'glider') {
      const coords = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
      coords.forEach(([dc, dr]) => {
        const gc = (c + dc + COLS) % COLS;
        const gr = (r + dr + ROWS) % ROWS;
        grid[gr * COLS + gc] = 1;
      });
    } else if (mode === 'blinker') {
      const coords = [[-1, 0], [0, 0], [1, 0]];
      coords.forEach(([dc, dr]) => {
        const gc = (c + dc + COLS) % COLS;
        const gr = (r + dr + ROWS) % ROWS;
        grid[gr * COLS + gc] = 1;
      });
    }
    playCellNote(mode === 'glider' ? 4 : 1);
  }, [playCellNote]);

  // --- 2D CANVAS RENDERING LOOP (60FPS) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cellW = w / COLS;
      const cellH = h / ROWS;
      const grid = gridRef.current;

      // 1. Clear background
      ctx.fillStyle = selectedSubstrate.surfaceTone;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Subtle Cellular Mesh Lines
      ctx.strokeStyle = selectedSubstrate.borderColor;
      ctx.lineWidth = 0.5;

      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, h);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(w, r * cellH);
        ctx.stroke();
      }

      // 3. Render Living Cells with Volumetric Glow
      ctx.fillStyle = selectedSubstrate.accentColor;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r * COLS + c] === 1) {
            // Draw smooth rounded cell square
            const px = c * cellW + 1;
            const py = r * cellH + 1;
            const sw = cellW - 2;
            const sh = cellH - 2;

            ctx.fillRect(px, py, sw, sh);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedSubstrate]);

  // Handle Canvas Mouse Clicks & Dragging
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const c = Math.max(0, Math.min(COLS - 1, Math.floor((x / rect.width) * COLS)));
    const r = Math.max(0, Math.min(ROWS - 1, Math.floor((y / rect.height) * ROWS)));

    if (lastCellCoordRef.current.c !== c || lastCellCoordRef.current.r !== r) {
      lastCellCoordRef.current = { c, r };
      injectPatternAt(c, r, brushMode);
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
            className="w-3.5 h-3.5 rounded-full animate-ping"
            style={{ backgroundColor: selectedSubstrate.accentColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 043 · 2026-10-14
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Cellular Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Cellular Syntactic Bento & Conway Ecosystem Shaders
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
                  playCellNote(3);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedSubstrate.id === sub.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSubstrate.id === sub.id ? selectedSubstrate.accentColor : 'transparent',
                  color: selectedSubstrate.id === sub.id ? (selectedSubstrate.id === 'slate_basalt_matrix' ? '#0C0E12' : '#FFFFFF') : selectedSubstrate.textColor
                }}
              >
                {sub.nameKo.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{ borderColor: selectedSubstrate.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "🧬"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "ORGANIC SOUND"}</span>
          </button>

          {/* Play/Pause Toggle */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{ borderColor: selectedSubstrate.borderColor }}
          >
            <span>{isRunning ? "⏸️" : "▶️"}</span>
            <span className="hidden sm:inline">{isRunning ? "PAUSE CLOCK" : "START CLOCK"}</span>
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
            <span className="hidden sm:inline">{isFullscreen ? "STANDARD" : "COLONY MODE"}</span>
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
              borderColor: selectedSubstrate.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold flex items-center gap-1" style={{ color: selectedSubstrate.accentColor }}>
                  <span className="w-2 h-2 rounded-full inline-block animate-ping" style={{ backgroundColor: selectedSubstrate.accentColor }} />
                  ALIVE BIOMASS: {aliveCount} CELLS (Gen {generationCount})
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Rule: B3/S23 · Weight: {dynamicFontWeight}
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                EDGE OF CHAOS λ ≈ 0.273
              </div>
            </div>

            {/* Display Typography with Biomass Dilation & Tracking */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Conway Life Engine & Syntactic Colonization
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  letterSpacing: `${dynamicTracking}em`,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Cellular Syntactic Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                광학 왜곡 필터 클리셰를 극복하고, 존 콘웨이의 라이프 게임 세포 자동자와 랭턴의 혼돈의 가장자리 상전이를 스위스 벤토 그리드 건축에 전격 이식하여, 스스로 증식하고 이주하는 세포 군락과 공생하는 자율적 인터페이스 파빌리온.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">LATTICE:</strong> 48 × 36 Torus
                </span>
                <span>
                  <strong className="opacity-50">DENSITY:</strong> {((aliveCount / (COLS * ROWS)) * 100).toFixed(1)}%
                </span>
                <span>
                  <strong className="opacity-50">CLOCK:</strong> {Math.round(1000 / tickSpeed)} Hz
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Biomass Weight:</span>
                <strong style={{ color: selectedSubstrate.accentColor }}>wght: {dynamicFontWeight}</strong>
              </div>
            </div>
          </div>

          {/* CELL 2: CELLULAR SPAWNER & STERILE RESET SWITCH (Span 4 Cols) */}
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
                  Cellular Seed Spawner
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {aliveCount} Active
                </span>
              </div>

              {/* Seed Injection Tool Modes */}
              <div className="mb-4">
                <div className="text-xs font-mono mb-1.5 opacity-70">Interactive Seed Tool</div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  {[
                    { id: 'glider', label: '🚀 Glider' },
                    { id: 'blinker', label: '⚡ Blinker' },
                    { id: 'single', label: '🔘 Cell' }
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setBrushMode(tool.id as 'glider' | 'blinker' | 'single')}
                      className={`p-2 rounded-lg border font-bold flex items-center justify-center transition-all ${
                        brushMode === tool.id ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ borderColor: brushMode === tool.id ? '#10B981' : selectedSubstrate.borderColor }}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clock Tick Speed Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Metabolic Clock Interval</span>
                  <span>{tickSpeed} ms</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={120}
                  value={tickSpeed}
                  onChange={(e) => setTickSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* STERILE RESET BUTTON */}
              <div className="mb-4">
                <button
                  onClick={handleSterileReset}
                  className="w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-red-500/10 hover:border-red-500 text-red-500"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  <span>🧹</span>
                  <span>STERILE GRID RESET (0 CELLS)</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Life Ecosystem Presets
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
                      <div className="text-[10px] opacity-60 truncate">{p.tickSpeedMs}ms · {p.spawnPattern}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              💡 캔버스 위를 클릭하거나 드래그하여 글라이더 군락을 직접 파종하세요.
            </div>
          </div>

          {/* CELL 3: 2D CONWAY LIFE MATRIX SIMULATION VIEWPORT (Span 7 Cols) */}
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
                  2D Toroidal Life Matrix (B3/S23)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                  1,728 Cellular Units
                </span>
              </div>

              {/* Step Manual Generation */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={stepGeneration}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  Step Generation
                </button>
              </div>
            </div>

            {/* Interactive Canvas Grid */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: selectedSubstrate.borderColor }}>
              <canvas
                ref={canvasRef}
                width={576}
                height={432}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => {
                  isMouseDownRef.current = true;
                  handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (isMouseDownRef.current) {
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }
                }}
                onMouseUp={() => { isMouseDownRef.current = false; lastCellCoordRef.current = { c: -1, r: -1 }; }}
                onMouseLeave={() => { isMouseDownRef.current = false; lastCellCoordRef.current = { c: -1, r: -1 }; }}
                onTouchStart={(e) => {
                  isMouseDownRef.current = true;
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={() => { isMouseDownRef.current = false; lastCellCoordRef.current = { c: -1, r: -1 }; }}
              />

              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedSubstrate.cardTone + 'E6',
                  borderColor: selectedSubstrate.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Cellular Entropy: <strong>{aliveCount > 0 ? (Math.log2(aliveCount + 1)).toFixed(2) + ' Bits' : '0.00 (Sterile)'}</strong></span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>DRAG TO SEED LIVING CELLULAR COLONIES</span>
              <span>B3/S23 · John Horton Conway 1970</span>
            </div>
          </div>

          {/* CELL 4: BIOMASS-COUPLED VARIABLE TYPOGRAPHY (Span 5 Cols) */}
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
                  Metabolic Variable Typography
                </span>
                <span className="text-xs font-mono font-bold text-emerald-500">
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
                  Axiom 43 Emergent Metabolism
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    letterSpacing: `${dynamicTracking}em`,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "Out of four elementary local rules emerges an autonomous, irreducible ecology of living form."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  세포 바이오매스 밀도가 증가할수록 글자는 생체 질량을 흡수하여 굵기(wght: 300 → 800)와 자간(+{dynamicTracking}em)을 확장하며, 멸균 스위치를 조작하면 완벽한 스위스 모더니즘의 정갈한 평형으로 복귀합니다.
                </div>
              </div>

              {/* Weight & Density Inspectors */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Variable Font Weight (wght)</span>
                    <span>{dynamicFontWeight} / 800</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
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
                    <span>Metabolic Tracking Expansion</span>
                    <span>+{dynamicTracking} em</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(Number(dynamicTracking) / 0.06) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>CHRISTOPHER LANGTON</span>
              <span>1990 EDGE OF CHAOS</span>
            </div>
          </div>

          {/* CELL 5: COMPLEX ECOSYSTEM PARAMETERS (Span 6 Cols) */}
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
                  Cellular Ecosystem Telemetry
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                  {selectedSubstrate.nameKo}
                </span>
              </div>

              <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                {selectedSubstrate.descKo}
              </p>

              {/* Parameters Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">TRANSITION</div>
                  <div className="text-base font-bold mt-0.5">B3 / S23</div>
                  <div className="text-[10px] opacity-50">Conway Standard</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">GENERATIONS</div>
                  <div className="text-base font-bold mt-0.5">{generationCount}</div>
                  <div className="text-[10px] opacity-50">Epochs</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">SYSTEM STATE</div>
                  <div className="text-base font-bold mt-0.5 text-emerald-500">
                    {aliveCount > 100 ? 'COLONIZED' : (aliveCount > 0 ? 'PIONEER' : 'STERILE')}
                  </div>
                  <div className="text-[10px] opacity-50">{aliveCount} Living Cells</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span className="opacity-60">COMPLEXITY EQUILIBRIUM</span>
              <span className="font-bold text-emerald-500">
                EDGE OF CHAOS BALANCED
              </span>
            </div>
          </div>

          {/* CELL 6: TACTILE GENERATIVE SOUNDBOARD (Span 6 Cols) */}
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
                  Tactile Generative Acoustics
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                새로 태어난 세포들의 5음계 아르페지오, 글라이더 이주 신호음, 그리고 멸균 스위치를 조작했을 때의 맑은 880Hz 석영 수정 차임을 연주하세요.
              </p>

              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Spawn Glider', action: () => { injectPatternAt(24, 18, 'glider'); }, label: '글라이더 펄스' },
                  { name: 'Birth Tone', action: () => playCellNote(Math.floor(Math.random() * 6)), label: '세포 탄생음' },
                  { name: 'Genesis Soup', action: () => { initPattern('soup'); playCellNote(5); }, label: '원시 수프 파종' },
                  { name: 'Sterile Reset', action: handleSterileReset, label: '멸균 평형 회귀' },
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
                    <div className="text-xs font-mono font-bold group-hover:text-emerald-500 transition-colors">
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
              <span>Generative Pentatonic Arpeggios + 880Hz Quartz Bells</span>
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
            Design Minds · Gemini (The Noon Mind) · Day 043 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-14</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: CELLULAR SYNTACTIC BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
