"use client";

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
  sheenColor: string;
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
    sheenColor: 'rgba(229, 200, 135, 0.45)',
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
    sandColor: '#EA580C',
    sheenColor: 'rgba(194, 65, 12, 0.3)',
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
    sheenColor: 'rgba(79, 70, 229, 0.25)',
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
  const [isAutoSandDancing, setIsAutoSandDancing] = useState<boolean>(false);

  // 3D Perspective Tilt on Plate
  const [plateTilt, setPlateTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Direct Interactive String Pluck & Drag States
  const [dividerTensionX, setDividerTensionX] = useState<number>(0); // -100 to +100 px deflection
  const [dividerTensionY, setDividerTensionY] = useState<number>(0);
  const [isDraggingX, setIsDraggingX] = useState<boolean>(false);
  const [isDraggingY, setIsDraggingY] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Continuous XY Acoustic Pad Drag State
  const [isDraggingXYPad, setIsDraggingXYPad] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<SandParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const tensionSpringRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Plucked String Acoustic Synthesis (Karplus-Strong string pluck with stereo panning)
  const playPluckSound = useCallback((frequency: number, pan: number = 0.0, intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (panner) {
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
    }

    // Material timbre selection
    if (selectedMaterial.id === 'milled_brass') {
      osc.type = 'triangle';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency * 2.2, now);
      filter.Q.setValueAtTime(16, now);
      gain.gain.setValueAtTime(0.35 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    } else if (selectedMaterial.id === 'honed_basalt') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 1.4, now);
      gain.gain.setValueAtTime(0.5 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    } else {
      osc.type = 'sine';
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(frequency * 0.9, now);
      gain.gain.setValueAtTime(0.3 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
    }

    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.98, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + 1.0);
  }, [initAudio, isAudioMuted, selectedMaterial]);

  // Pure Crystalline Modal Snap Chime (Plate Overtone Ratios: 1.0, 2.76, 5.40)
  const playModalChime = useCallback((m: number, n: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const baseF = selectedMaterial.baseFreq * (1 + (m + n) * 0.04);
    const overtoneRatios = [1.0, 2.76, 5.40, 8.90];
    const now = ctx.currentTime;

    overtoneRatios.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseF * ratio, now + i * 0.03);

      gain.gain.setValueAtTime((0.18 / (i + 1)) * 0.8, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.03 + (1.4 - i * 0.2));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 1.5);
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
  const scatterSand = useCallback(() => {
    const particleCount = 1600;
    const particles: SandParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        settled: false
      });
    }
    particlesRef.current = particles;
    playPluckSound(selectedMaterial.baseFreq * 1.5, 0, 0.7);
  }, [playPluckSound, selectedMaterial]);

  useEffect(() => {
    scatterSand();
  }, [scatterSand]);

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

      // 1. Draw Subtle Chladni Heatmap / Nodal Contours
      if (showNodalCurves) {
        const resolution = 70;
        ctx.strokeStyle = selectedMaterial.accentColor + '2A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        for (let i = 0; i <= resolution; i++) {
          for (let j = 0; j <= resolution; j++) {
            const nx = i / resolution;
            const ny = j / resolution;
            const val = calcChladniDisplacement(nx, ny, modeM, modeN);
            if (Math.abs(val) < 0.075) {
              const px = nx * width;
              const py = ny * height;
              ctx.rect(px - 1, py - 1, 2, 2);
            }
          }
        }
        ctx.stroke();

        // Nodal line center glow
        ctx.strokeStyle = selectedMaterial.accentColor + '70';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Update and Draw Sand Particles
      if (showSand) {
        const particles = particlesRef.current;
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

          if (absVal > 0.065 || isAutoSandDancing) {
            // Eject particle downhill toward nodal zero-crossing
            const force = (absVal * 0.9 + (isAutoSandDancing ? 0.3 : 0)) * vibFactor;
            p.vx = -gradX * force * 0.01 + (Math.random() - 0.5) * 0.009 * vibFactor;
            p.vy = -gradY * force * 0.01 + (Math.random() - 0.5) * 0.009 * vibFactor;
            p.settled = false;
          } else {
            // Particle resting in nodal valley
            p.vx *= 0.55;
            p.vy *= 0.55;
            p.settled = true;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Boundary bounce / wrap
          if (p.x < 0.015) { p.x = 0.015; p.vx *= -0.4; }
          if (p.x > 0.985) { p.x = 0.985; p.vx *= -0.4; }
          if (p.y < 0.015) { p.y = 0.015; p.vy *= -0.4; }
          if (p.y > 0.985) { p.y = 0.985; p.vy *= -0.4; }

          // Render particle
          const px = p.x * width;
          const py = p.y * height;
          const radius = p.settled ? 1.75 : 1.2;

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Elastic Tension Boundary Spring Physics
      const k = 0.16; // spring stiffness
      const c = 0.84; // damping

      if (!isDraggingX) {
        tensionSpringRef.current.vx = (tensionSpringRef.current.vx - dividerTensionX * k) * c;
        setDividerTensionX(prev => {
          const next = prev + tensionSpringRef.current.vx;
          return Math.abs(next) < 0.05 && Math.abs(tensionSpringRef.current.vx) < 0.05 ? 0 : next;
        });
      }

      if (!isDraggingY) {
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
  }, [selectedMaterial, modeM, modeN, freq, amplitude, showSand, showNodalCurves, calcChladniDisplacement, isDraggingX, isDraggingY, dividerTensionX, dividerTensionY, isAutoSandDancing]);

  // Handle Mode Selection
  const handleSelectMode = (mode: ChladniMode) => {
    setModeM(mode.m);
    setModeN(mode.n);
    setFreq(mode.freq);
    playModalChime(mode.m, mode.n);
  };

  // Nodal stability metric for central typography
  const centerNodalDisplacement = useMemo(() => {
    return Math.abs(calcChladniDisplacement(0.5, 0.5, modeM, modeN));
  }, [calcChladniDisplacement, modeM, modeN]);

  const typographicWeight = useMemo(() => {
    const w = 450 + Math.min(350, Math.floor(centerNodalDisplacement * 420));
    return w;
  }, [centerNodalDisplacement]);

  // Pointer drag listeners for elastic string dividers
  const handleStartDragX = (clientX: number) => {
    setIsDraggingX(true);
    dragStartRef.current.x = clientX;
    playPluckSound(freq * 1.2, -0.3, 0.6);
  };

  const handleStartDragY = (clientY: number) => {
    setIsDraggingY(true);
    dragStartRef.current.y = clientY;
    playPluckSound(freq * 0.8, 0.3, 0.6);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDraggingX) {
      const delta = clientX - dragStartRef.current.x;
      setDividerTensionX(Math.max(-75, Math.min(75, delta)));
    }
    if (isDraggingY) {
      const delta = clientY - dragStartRef.current.y;
      setDividerTensionY(Math.max(-75, Math.min(75, delta)));
    }
  };

  const handlePointerUp = () => {
    if (isDraggingX) {
      setIsDraggingX(false);
      tensionSpringRef.current.vx = -dividerTensionX * 0.6;
      playPluckSound(freq * 1.5, -0.2, Math.min(1.5, Math.abs(dividerTensionX) / 30));
    }
    if (isDraggingY) {
      setIsDraggingY(false);
      tensionSpringRef.current.vy = -dividerTensionY * 0.6;
      playPluckSound(freq * 0.75, 0.2, Math.min(1.5, Math.abs(dividerTensionY) / 30));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerUp}
      className="w-full min-h-screen transition-colors duration-500 font-sans select-none"
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
          backgroundColor: selectedMaterial.surfaceBg + 'F2'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full animate-ping"
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
                Chladni Nodal Bento
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
                  playPluckSound(mat.baseFreq, 0, 0.8);
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative">

          {/* CELL 1: MONUMENTAL ARCHITECTURAL MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm group"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor,
              transform: `translate(${dividerTensionX * 0.15}px, ${dividerTensionY * 0.1}px)`
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

            {/* Elastic Boundary Drag Handle (Vertical Suture) */}
            <div
              onMouseDown={(e) => handleStartDragX(e.clientX)}
              onTouchStart={(e) => {
                if (e.touches[0]) handleStartDragX(e.touches[0].clientX);
              }}
              className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-amber-500/20 active:bg-amber-500/40 transition-colors flex items-center justify-center group"
              title="드래그하여 수직 탄성 분할선 튕기기"
            >
              <div className="w-0.5 h-16 rounded bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
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
                onClick={() => {
                  tensionSpringRef.current.vx = 30;
                  setDividerTensionX(30);
                  playPluckSound(freq * 1.5, -0.3, 1.2);
                }}
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

          {/* CELL 2: CONTINUOUS ACOUSTIC XY PAD & MODAL SELECTOR (Span 4 Cols) */}
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
                  2D Acoustic XY Controller
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedMaterial.accentColor }}>
                  {freq} Hz
                </span>
              </div>

              {/* Interactive 2D XY Acoustic Pad */}
              <div
                onMouseDown={(e) => {
                  setIsDraggingXYPad(true);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const nx = (e.clientX - rect.left) / rect.width;
                  const ny = (e.clientY - rect.top) / rect.height;
                  const nextF = Math.round(55 + nx * (880 - 55));
                  setFreq(nextF);
                  setAmplitude(0.4 + (1 - ny) * 1.4);
                  playPluckSound(nextF, nx * 2 - 1, 0.7);
                }}
                onMouseMove={(e) => {
                  if (!isDraggingXYPad) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                  const nextF = Math.round(55 + nx * (880 - 55));
                  setFreq(nextF);
                  setAmplitude(0.4 + (1 - ny) * 1.4);
                }}
                onMouseUp={() => setIsDraggingXYPad(false)}
                className="w-full h-32 rounded-xl border relative cursor-crosshair overflow-hidden mb-4"
                style={{
                  borderColor: selectedMaterial.borderColor,
                  backgroundColor: selectedMaterial.surfaceBg
                }}
              >
                {/* Crosshair guide lines */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-amber-500/50"
                  style={{ left: `${((freq - 55) / (880 - 55)) * 100}%` }}
                />
                <div
                  className="absolute left-0 right-0 h-px bg-amber-500/50"
                  style={{ top: `${(1 - (amplitude - 0.4) / 1.4) * 100}%` }}
                />
                {/* Node Target Dot */}
                <div
                  className="absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full border-2 border-white shadow"
                  style={{
                    left: `${((freq - 55) / (880 - 55)) * 100}%`,
                    top: `${(1 - (amplitude - 0.4) / 1.4) * 100}%`,
                    backgroundColor: selectedMaterial.accentColor
                  }}
                />
                <div className="absolute bottom-2 left-2 text-[10px] font-mono opacity-50">
                  X: Freq ({freq}Hz) · Y: Amp ({(amplitude * 100).toFixed(0)}%)
                </div>
              </div>

              {/* Mode Integer Pair (m, n) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
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

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              💡 XY 패드를 드래그하여 주파수와 진폭을 연속으로 연주하세요.
            </div>
          </div>

          {/* CELL 3: 2D CHLADNI SAND CANVAS SIMULATOR (Span 7 Cols) */}
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = (e.clientX - rect.left) / rect.width - 0.5;
              const ny = (e.clientY - rect.top) / rect.height - 0.5;
              setPlateTilt({ x: ny * -8, y: nx * 8 });
            }}
            onMouseLeave={() => setPlateTilt({ x: 0, y: 0 })}
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-transform duration-200"
            style={{
              backgroundColor: selectedMaterial.cardBg,
              borderColor: selectedMaterial.borderColor,
              transform: `perspective(1000px) rotateX(${plateTilt.x}deg) rotateY(${plateTilt.y}deg) translateX(${dividerTensionX * 0.3}px)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  2D Chladni Sand Particle Canvas
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                  1,600 Quartz Grains
                </span>
              </div>

              {/* Canvas Toggles */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={scatterSand}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedMaterial.borderColor }}
                  title="모래알 무작위 재배치"
                >
                  🌪️ Scatter
                </button>
                <button
                  onClick={() => setIsAutoSandDancing(!isAutoSandDancing)}
                  className={`px-2 py-1 rounded border text-[11px] ${isAutoSandDancing ? 'font-bold bg-amber-500/20 text-amber-600' : 'opacity-70'}`}
                  style={{ borderColor: selectedMaterial.borderColor }}
                >
                  Dance: {isAutoSandDancing ? 'ON' : 'OFF'}
                </button>
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
                  playPluckSound(freq * (1 + Math.abs(disp)), x * 2 - 1, 1.0);
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
                onMouseDown={(e) => handleStartDragY(e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStartDragY(e.touches[0].clientY);
                }}
                className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-amber-500/20 active:bg-amber-500/40 transition-colors flex items-center justify-center"
                title="드래그하여 수평 탄성 분할선 튕기기"
              >
                <div className="h-0.5 w-24 rounded bg-amber-500/50" />
              </div>
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
              transform: `translateY(${dividerTensionY * 0.3}px)`
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
                      playPluckSound(note.freq, (idx / 7) * 2 - 1, 1.0);
                      if (idx % 2 === 0) {
                        tensionSpringRef.current.vx = 20;
                        setDividerTensionX(20);
                      } else {
                        tensionSpringRef.current.vy = 20;
                        setDividerTensionY(20);
                      }
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
