import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface MaterialPreset {
  id: string;
  name: string;
  nameKo: string;
  density: number; // kg/m^3
  youngsModulus: number; // GPa
  poissonRatio: number;
  baseFreq: number; // Hz
  accentColor: string;
  surfaceBg: string;
  cardBg: string;
  textColor: string;
  subTextColor: string;
  borderColor: string;
  sandColor: string;
  descKo: string;
}

interface ChladniMode {
  m: number;
  n: number;
  freq: number;
  name: string;
  nameKo: string;
  layoutRatio: string;
  descKo: string;
}

interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  settled: boolean;
}

// --- PRESETS DATA ---
const MATERIALS: MaterialPreset[] = [
  {
    id: 'milled_brass',
    name: 'Milled Architectural Brass',
    nameKo: '밀드 황동 건축 평판',
    density: 8500,
    youngsModulus: 105,
    poissonRatio: 0.34,
    baseFreq: 440,
    accentColor: '#C5A059',
    surfaceBg: '#FAF6EE',
    cardBg: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    borderColor: '#E7E2DA',
    sandColor: '#B88E3A',
    descKo: '찬란한 황금빛 광택과 높은 탄성률을 지녀, 경계를 튕길 때 맑고 영롱한 고주파 배음 벨 차임을 분출합니다.'
  },
  {
    id: 'honed_basalt',
    name: 'Honed Basalt Slate',
    nameKo: '연마된 현무암 슬레이트',
    density: 2900,
    youngsModulus: 65,
    poissonRatio: 0.25,
    baseFreq: 180,
    accentColor: '#C2410C',
    surfaceBg: '#141312',
    cardBg: '#1E1C1A',
    textColor: '#FAF8F5',
    subTextColor: '#A8A29E',
    borderColor: '#2E2B28',
    sandColor: '#C2410C',
    descKo: '묵직한 암석 질량과 높은 내부 감쇠율을 지니며, 깊고 웅장한 저음의 마림바 타격음과 기념비적 텍토닉을 형성합니다.'
  },
  {
    id: 'frosted_glass',
    name: 'Frosted Acoustic Glass',
    nameKo: '음향 프로스티드 글래스',
    density: 2500,
    youngsModulus: 70,
    poissonRatio: 0.22,
    baseFreq: 528,
    accentColor: '#4F46E5',
    surfaceBg: '#FAF8F5',
    cardBg: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#64748B',
    borderColor: '#E2E8F0',
    sandColor: '#4F46E5',
    descKo: '순백의 미장 회벽 질감 위에 528Hz 솔페지오 치유 주파수로 공명하며 투명한 크리스털 울림을 선사합니다.'
  }
];

const MODES: ChladniMode[] = [
  { m: 1, n: 1, freq: 110, name: 'Fundamental Cross', nameKo: '기본 직교 마디 (1,1)', layoutRatio: '2x2 대칭 4등분', descKo: '중앙 십자 마디선이 교차하며 완벽한 대칭 에디토리얼 모듈을 형성합니다.' },
  { m: 2, n: 1, freq: 220, name: 'Longitudinal Triptych', nameKo: '비대칭 3단 트립틱 (2,1)', layoutRatio: '1:2 비대칭 3분할', descKo: '수직 주 마스트헤드와 우측 2단 정보 스택이 우아한 황금비 긴장감을 이룹니다.' },
  { m: 2, n: 2, freq: 330, name: 'Diagonal Quad Loop', nameKo: '대각선 마디 루프 (2,2)', layoutRatio: '마름모 초점 벤토', descKo: '중앙 마름모형 초점 모듈을 4개의 주변 정보 카드가 둘러싸는 아방가르드 구도입니다.' },
  { m: 3, n: 2, freq: 440, name: 'Harmonic Modernism', nameKo: '스위스 6셀 매트릭스 (3,2)', layoutRatio: '3x2 스위스 그리드', descKo: '뮐러-브로크만의 그리드 시스템과 100% 일치하는 6개의 정밀 모듈러 셀이 정돈됩니다.' },
  { m: 3, n: 3, freq: 550, name: 'Concentric Petals', nameKo: '동심원 정상파 성소 (3,3)', layoutRatio: '3x3 고밀도 대시보드', descKo: '꽃잎처럼 펼쳐지는 동심원 마디 곡선들이 고밀도 시각 정보를 유기적으로 분할합니다.' },
  { m: 4, n: 2, freq: 660, name: 'Complex Cymatics', nameKo: '복합 사이버 에디토리얼 (4,2)', layoutRatio: '다층 비대칭 파티션', descKo: '고주파 정상파 곡선들이 빚어내는 역동적이고 감각적인 아방가르드 레이아웃입니다.' }
];

export default function ChladniBentoExperiment() {
  // --- STATE ---
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPreset>(MATERIALS[0]);
  const [modeM, setModeM] = useState<number>(3);
  const [modeN, setModeN] = useState<number>(2);
  const [freq, setFreq] = useState<number>(440);
  const [amplitude, setAmplitude] = useState<number>(1.0);
  const [showSand, setShowSand] = useState<boolean>(true);
  const [showNodalCurves, setShowNodalCurves] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'bento' | 'plate' | 'theory'>('bento');

  // Interactive String Pluck & Tension States
  const [dividerTensionX, setDividerTensionX] = useState<number>(0); // -100 to +100 px deflection
  const [dividerTensionY, setDividerTensionY] = useState<number>(0);
  const [isPluckingX, setIsPluckingX] = useState<boolean>(false);
  const [isPluckingY, setIsPluckingY] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<SandParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const tensionSpringRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

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

  // Plucked String Acoustic Synthesis (Karplus-Strong emulation via modulated noise & resonant filter)
  const playPluckSound = useCallback((frequency: number, intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Material timbre selection
    if (selectedMaterial.id === 'milled_brass') {
      osc.type = 'triangle';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency * 2, now);
      filter.Q.setValueAtTime(14, now);
      gain.gain.setValueAtTime(0.35 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    } else if (selectedMaterial.id === 'honed_basalt') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 1.2, now);
      gain.gain.setValueAtTime(0.5 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    } else {
      osc.type = 'sine';
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(frequency * 0.8, now);
      gain.gain.setValueAtTime(0.28 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
    }

    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.98, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  }, [initAudio, isAudioMuted, selectedMaterial]);

  // Pure Crystalline Modal Snap Chime
  const playModalChime = useCallback((m: number, n: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const baseF = selectedMaterial.baseFreq;
    const chordRatios = [1.0, 1.25, 1.5, 2.0];
    const now = ctx.currentTime;

    chordRatios.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseF * ratio * (1 + (m + n) * 0.05), now + i * 0.04);

      gain.gain.setValueAtTime(0.12 / (i + 1), now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.04 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 1.3);
    });
  }, [initAudio, isAudioMuted, selectedMaterial]);

  // --- 2D CHLADNI WAVE EQUATION CALCULATION ---
  // w(x,y) = a*sin(n*pi*x)*sin(m*pi*y) - b*sin(m*pi*x)*sin(n*pi*y)
  const calcChladniDisplacement = useCallback((nx: number, ny: number, m: number, n: number): number => {
    const a = 1.0;
    const b = 1.0;
    const pi = Math.PI;
    const term1 = a * Math.sin(n * pi * nx) * Math.sin(m * pi * ny);
    const term2 = b * Math.sin(m * pi * nx) * Math.sin(n * pi * ny);
    return term1 - term2;
  }, []);

  // --- INITIALIZE PARTICLES ---
  useEffect(() => {
    const particleCount = 1400;
    const particles: SandParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: 0,
        vy: 0,
        settled: false
      });
    }
    particlesRef.current = particles;
  }, []);

  // --- SIMULATION & CANVAS RENDER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with material background
      ctx.fillStyle = selectedMaterial.cardBg;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Subtle Chladni Heatmap / Nodal Lines
      if (showNodalCurves) {
        ctx.lineWidth = 1.5;
        const resolution = 60;
        const stepX = width / resolution;
        const stepY = height / resolution;

        ctx.strokeStyle = selectedMaterial.accentColor + '33'; // 20% opacity
        ctx.beginPath();
        for (let i = 0; i <= resolution; i++) {
          for (let j = 0; j <= resolution; j++) {
            const nx = i / resolution;
            const ny = j / resolution;
            const val = calcChladniDisplacement(nx, ny, modeM, modeN);
            if (Math.abs(val) < 0.08) {
              const px = nx * width;
              const py = ny * height;
              ctx.rect(px - 1, py - 1, 2, 2);
            }
          }
        }
        ctx.stroke();

        // Draw nodal zero-curve glow
        ctx.strokeStyle = selectedMaterial.accentColor + '88';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Update and Draw Sand Particles
      if (showSand) {
        const particles = particlesRef.current;
        const dt = 0.016;
        const vibFactor = (freq / 440) * amplitude;

        ctx.fillStyle = selectedMaterial.sandColor;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const val = calcChladniDisplacement(p.x, p.y, modeM, modeN);
          const absVal = Math.abs(val);

          // Particles on antinodes (absVal > 0) receive violent kinetic energy
          // Gradient of displacement moves sand toward w = 0
          const delta = 0.01;
          const valX = calcChladniDisplacement(p.x + delta, p.y, modeM, modeN);
          const valY = calcChladniDisplacement(p.x, p.y + delta, modeM, modeN);

          const gradX = (Math.abs(valX) - absVal) / delta;
          const gradY = (Math.abs(valY) - absVal) / delta;

          if (absVal > 0.06) {
            // Eject particle downhill toward nodal minimum
            const force = absVal * 0.8 * vibFactor;
            p.vx = -gradX * force * 0.01 + (Math.random() - 0.5) * 0.008 * vibFactor;
            p.vy = -gradY * force * 0.01 + (Math.random() - 0.5) * 0.008 * vibFactor;
            p.settled = false;
          } else {
            // Particle resting in nodal valley
            p.vx *= 0.6;
            p.vy *= 0.6;
            p.settled = true;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Boundary bounce / wrap
          if (p.x < 0.02) { p.x = 0.02; p.vx *= -0.5; }
          if (p.x > 0.98) { p.x = 0.98; p.vx *= -0.5; }
          if (p.y < 0.02) { p.y = 0.02; p.vy *= -0.5; }
          if (p.y > 0.98) { p.y = 0.98; p.vy *= -0.5; }

          // Render particle
          const px = p.x * width;
          const py = p.y * height;
          const radius = p.settled ? 1.8 : 1.2;

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Elastic Tension Boundary Spring Physics
      const k = 0.18; // spring stiffness
      const c = 0.82; // damping

      if (!isPluckingX) {
        tensionSpringRef.current.vx = (tensionSpringRef.current.vx - dividerTensionX * k) * c;
        setDividerTensionX(prev => {
          const next = prev + tensionSpringRef.current.vx;
          return Math.abs(next) < 0.05 && Math.abs(tensionSpringRef.current.vx) < 0.05 ? 0 : next;
        });
      }

      if (!isPluckingY) {
        tensionSpringRef.current.vy = (tensionSpringRef.current.vy - dividerTensionY * k) * c;
        setDividerTensionY(prev => {
          const next = prev + tensionSpringRef.current.vy;
          return Math.abs(next) < 0.05 && Math.abs(tensionSpringRef.current.vy) < 0.05 ? 0 : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedMaterial, modeM, modeN, freq, amplitude, showSand, showNodalCurves, calcChladniDisplacement, isPluckingX, isPluckingY, dividerTensionX, dividerTensionY]);

  // Handle Mode Change
  const handleSelectMode = (mode: ChladniMode) => {
    setModeM(mode.m);
    setModeN(mode.n);
    setFreq(mode.freq);
    playModalChime(mode.m, mode.n);
  };

  // Pluck Horizontal or Vertical Boundary
  const handlePluckBoundary = (axis: 'x' | 'y') => {
    if (axis === 'x') {
      setIsPluckingX(false);
      tensionSpringRef.current.vx = 24;
      setDividerTensionX(25);
      playPluckSound(freq * 1.5, 1.2);
    } else {
      setIsPluckingY(false);
      tensionSpringRef.current.vy = 24;
      setDividerTensionY(25);
      playPluckSound(freq * 0.75, 1.2);
    }
  };

  // Nodal stability metric for central typography
  const centerNodalDisplacement = useMemo(() => {
    return Math.abs(calcChladniDisplacement(0.5, 0.5, modeM, modeN));
  }, [calcChladniDisplacement, modeM, modeN]);

  const typographicWeight = useMemo(() => {
    // In nodal silence (disp ~ 0), weight is sharp & restrained (450)
    // In antinode (disp > 0.4), weight swells up to 800
    const w = 450 + Math.min(350, Math.floor(centerNodalDisplacement * 400));
    return w;
  }, [centerNodalDisplacement]);

  return (
    <div
      className="w-full min-h-screen transition-colors duration-500 font-sans"
      style={{
        backgroundColor: selectedMaterial.surfaceBg,
        color: selectedMaterial.textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        className="w-full border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md"
        style={{
          borderColor: selectedMaterial.borderColor,
          backgroundColor: selectedMaterial.surfaceBg + 'F0'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: selectedMaterial.accentColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 034 · 2026-10-05
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedMaterial.accentColor + '22',
                  color: selectedMaterial.accentColor
                }}
              >
                Acoustic Chladni Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Chladni Modal Bento & Acoustic Tensor Grid
            </h1>
          </div>
        </div>

        {/* Global Controls & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Material Substrate Selector */}
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: selectedMaterial.borderColor }}>
            {MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  playPluckSound(mat.baseFreq, 0.8);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedMaterial.id === mat.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedMaterial.id === mat.id ? selectedMaterial.accentColor : 'transparent',
                  color: selectedMaterial.id === mat.id ? (selectedMaterial.id === 'honed_basalt' ? '#FAF8F5' : '#141312') : selectedMaterial.textColor
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
            style={{ borderColor: selectedMaterial.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "🔊"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "HAPTIC SOUND"}</span>
          </button>

          {/* Fullscreen Monograph Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{
              borderColor: selectedMaterial.borderColor,
              backgroundColor: isFullscreen ? selectedMaterial.accentColor + '22' : 'transparent',
              color: isFullscreen ? selectedMaterial.accentColor : selectedMaterial.textColor
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

          {/* CELL 1: MONUMENTAL ARCHITECTURAL MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                  NODAL LOCK ACTIVE
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  m={modeM}, n={modeN} · {freq} Hz
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                2D BIHARMONIC EIGENSTATE
              </div>
            </div>

            {/* Giant Display Typography */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                The 2D Acoustic Standing Wave Architecture
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: typographicWeight,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Chladni Nodal Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedMaterial.subTextColor }}>
                정적인 사각형 감옥을 탈피하여, 2차원 클라드니 음향 평판의 정상파 마디선(Nodal Lines)과 탄성 인장 스프링 역학을 결합한 인터랙티브 모듈러 에디토리얼 그리드.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">PLATE:</strong> {selectedMaterial.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">DENSITY:</strong> {selectedMaterial.density} kg/m³
                </span>
                <span>
                  <strong className="opacity-50">STIFFNESS:</strong> {selectedMaterial.youngsModulus} GPa
                </span>
              </div>
              <button
                onClick={() => handlePluckBoundary('x')}
                className="px-3 py-1 rounded border text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: selectedMaterial.accentColor,
                  color: selectedMaterial.accentColor
                }}
              >
                ⚡ Pluck Tension Spring (X-Axis)
              </button>
            </div>
          </div>

          {/* CELL 2: ACOUSTIC FREQUENCY CONTROLLER & MODAL SELECTOR (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Frequency & Modal Knobs
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedMaterial.accentColor }}>
                  {freq} Hz
                </span>
              </div>

              {/* Frequency Slider */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Excitation Frequency</span>
                  <span>55 Hz – 880 Hz</span>
                </div>
                <input
                  type="range"
                  min={55}
                  max={880}
                  step={5}
                  value={freq}
                  onChange={(e) => {
                    const f = Number(e.target.value);
                    setFreq(f);
                    playPluckSound(f, 0.4);
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Mode Integer Pair (m, n) */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] font-mono uppercase opacity-60 mb-1">Harmonic Mode m</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">{modeM}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const next = Math.max(1, modeM - 1);
                          setModeM(next);
                          playModalChime(next, modeN);
                        }}
                        className="w-7 h-7 rounded border font-mono text-sm hover:bg-black/5"
                        style={{ borderColor: selectedMaterial.borderColor }}
                      >-</button>
                      <button
                        onClick={() => {
                          const next = Math.min(5, modeM + 1);
                          setModeM(next);
                          playModalChime(next, modeN);
                        }}
                        className="w-7 h-7 rounded border font-mono text-sm hover:bg-black/5"
                        style={{ borderColor: selectedMaterial.borderColor }}
                      >+</button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] font-mono uppercase opacity-60 mb-1">Harmonic Mode n</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono">{modeN}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const next = Math.max(1, modeN - 1);
                          setModeN(next);
                          playModalChime(modeM, next);
                        }}
                        className="w-7 h-7 rounded border font-mono text-sm hover:bg-black/5"
                        style={{ borderColor: selectedMaterial.borderColor }}
                      >-</button>
                      <button
                        onClick={() => {
                          const next = Math.min(5, modeN + 1);
                          setModeN(next);
                          playModalChime(modeM, next);
                        }}
                        className="w-7 h-7 rounded border font-mono text-sm hover:bg-black/5"
                        style={{ borderColor: selectedMaterial.borderColor }}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Classical Eigenstate Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {MODES.slice(0, 4).map(m => (
                    <button
                      key={m.name}
                      onClick={() => handleSelectMode(m)}
                      className={`text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                        modeM === m.m && modeN === m.n ? 'font-bold' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: modeM === m.m && modeN === m.n ? selectedMaterial.accentColor : selectedMaterial.borderColor,
                        backgroundColor: modeM === m.m && modeN === m.n ? selectedMaterial.accentColor + '18' : 'transparent',
                        color: modeM === m.m && modeN === m.n ? selectedMaterial.accentColor : selectedMaterial.textColor
                      }}
                    >
                      <div className="font-bold truncate">({m.m},{m.n}) {m.name}</div>
                      <div className="text-[10px] opacity-60 truncate">{m.freq}Hz · {m.layoutRatio}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              💡 w(x,y)=0 지점에서 진동이 소멸하고 완벽한 폰트 가독성이 복원됩니다.
            </div>
          </div>

          {/* CELL 3: 2D CHLADNI SAND CANVAS SIMULATOR (Span 7 Cols) */}
          <div
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor,
              transform: `translateX(${dividerTensionX * 0.25}px)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  2D Chladni Sand Particle Canvas
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                  1,400 Quartz Grains
                </span>
              </div>

              {/* Canvas Toggles */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setShowSand(!showSand)}
                  className={`px-2 py-1 rounded border text-[11px] ${showSand ? 'font-bold' : 'opacity-50'}`}
                  style={{ borderColor: selectedMaterial.borderColor }}
                >
                  Sand: {showSand ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowNodalCurves(!showNodalCurves)}
                  className={`px-2 py-1 rounded border text-[11px] ${showNodalCurves ? 'font-bold' : 'opacity-50'}`}
                  style={{ borderColor: selectedMaterial.borderColor }}
                >
                  Nodal: {showNodalCurves ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Interactive Canvas Viewport */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2" style={{ borderColor: selectedMaterial.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  const disp = calcChladniDisplacement(x, y, modeM, modeN);
                  playPluckSound(freq * (1 + Math.abs(disp)), 1.0);
                }}
              />

              {/* Nodal Line Proximity Readout Tag */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedMaterial.cardBg + 'E6',
                  borderColor: selectedMaterial.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: centerNodalDisplacement < 0.1 ? '#10B981' : '#4F46E5' }} />
                <span>Center w(0.5, 0.5): <strong>{centerNodalDisplacement.toFixed(3)}</strong></span>
              </div>

              {/* Pluck Elastic Boundary Indicator */}
              <div
                onClick={() => handlePluckBoundary('y')}
                className="absolute top-0 right-0 h-full w-2 cursor-ew-resize hover:bg-amber-500/40 transition-colors"
                title="클릭하여 Y축 탄성 분할선 튕기기"
              />
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>CANVAS CLICK: Localized acoustic impulse excitation</span>
              <span>w(x,y)=0 Nodal Lines</span>
            </div>
          </div>

          {/* CELL 4: SWISS TYPOGRAPHIC MONOGRAPH & NODAL SILENCE RESTORATION (Span 5 Cols) */}
          <div
            className="md:col-span-5 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor,
              transform: `translateY(${dividerTensionY * 0.25}px)`
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Nodal Rest & Variable Font
                </span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  wght: {typographicWeight}
                </span>
              </div>

              <div className="p-4 rounded-xl border mb-4" style={{ borderColor: selectedMaterial.borderColor, backgroundColor: selectedMaterial.surfaceBg + '66' }}>
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 34 Experimental Text
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: typographicWeight,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "The nodal line is not the absence of energy, but the sacred architecture of peace."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  마디선은 에너지가 결핍된 곳이 아니라, 상충하는 모든 파동이 완벽한 상쇄 간섭을 이루어 도달한 거룩한 침묵의 건축입니다.
                </div>
              </div>

              {/* Variable Font Axis Inspector */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Variable Font Weight (wght)</span>
                    <span>{typographicWeight} / 800</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${((typographicWeight - 400) / 450) * 100}%`,
                        backgroundColor: selectedMaterial.accentColor
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Nodal Silence Purity</span>
                    <span>{(Math.max(0, 1 - centerNodalDisplacement) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(5, (1 - centerNodalDisplacement) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>JOSEF MÜLLER-BROCKMANN</span>
              <span>1961 GRID SYSTEMS</span>
            </div>
          </div>

          {/* CELL 5: TACTILE PLUCKABLE STRING MATRIX (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Elastic Divider Tension Harps
                </span>
                <span className="text-xs font-mono opacity-60">
                  Karplus-Strong Pluck Engine
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                모듈러 경계선은 고정된 1px CSS 선이 아니라, 인장력을 품은 가상 현(Tension String)입니다. 경계를 클릭하거나 튕겨 물리적 공명 하모닉스를 연주하세요.
              </p>

              {/* String Pluck Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'C3 (130Hz)', freq: 130.81, label: 'Bass Anchor' },
                  { name: 'G3 (196Hz)', freq: 196.00, label: 'Fifth Suture' },
                  { name: 'C4 (261Hz)', freq: 261.63, label: 'Middle Nodal' },
                  { name: 'E4 (329Hz)', freq: 329.63, label: 'Major Third' },
                  { name: 'G4 (392Hz)', freq: 392.00, label: 'Nodal Overtone' },
                  { name: 'A4 (440Hz)', freq: 440.00, label: 'Concert Pitch' },
                  { name: 'C5 (523Hz)', freq: 523.25, label: 'Crystalline Octave' },
                  { name: 'E5 (659Hz)', freq: 659.25, label: 'Harmonic Ring' },
                ].map((note, idx) => (
                  <button
                    key={note.name}
                    onClick={() => {
                      playPluckSound(note.freq, 1.0);
                      if (idx % 2 === 0) handlePluckBoundary('x');
                      else handlePluckBoundary('y');
                    }}
                    className="p-2.5 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 group"
                    style={{
                      borderColor: selectedMaterial.borderColor,
                      backgroundColor: selectedMaterial.surfaceBg + '80'
                    }}
                  >
                    <div className="text-xs font-mono font-bold group-hover:text-amber-600 transition-colors">
                      {note.name.split(' ')[0]}
                    </div>
                    <div className="text-[9px] font-mono opacity-50 truncate">
                      {note.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>F = -k·Δx - c·v</span>
              <span>4th-order Runge-Kutta Damping</span>
            </div>
          </div>

          {/* CELL 6: COMPARATIVE ARCHITECTURAL SPECIFICATIONS & PHILOSOPHY (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Material Substrate Specifications
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedMaterial.accentColor }}>
                  {selectedMaterial.nameKo}
                </span>
              </div>

              <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                {selectedMaterial.descKo}
              </p>

              {/* Material Physics Parameters Table */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">DENSITY (ρ)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.density}</div>
                  <div className="text-[10px] opacity-50">kg/m³</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">YOUNG'S MODULUS</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.youngsModulus}</div>
                  <div className="text-[10px] opacity-50">GPa</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">POISSON RATIO</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.poissonRatio}</div>
                  <div className="text-[10px] opacity-50">ν (Transverse)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <span className="opacity-60">PETER ZUMTHOR TACTILITY</span>
              <span className="font-bold" style={{ color: selectedMaterial.accentColor }}>
                CHLADNI EIGENSTATE RESOLVED
              </span>
            </div>
          </div>

        </div>

        {/* FOOTER EDITORIAL SUMMARY */}
        <footer
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-70"
          style={{ borderColor: selectedMaterial.borderColor }}
        >
          <div>
            Design Minds · Gemini (The Noon Mind) · Day 034 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-05</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: SWISS CHLADNI BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
