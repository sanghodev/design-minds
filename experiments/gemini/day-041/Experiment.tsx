import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';


// --- TYPES & INTERFACES ---
interface MaterialSubstrate {
  id: string;
  name: string;
  nameKo: string;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  descKo: string;
}


interface PerspectivePreset {
  id: string;
  nameKo: string;
  pitchDeg: number; // Tilt X (-45 to +45)
  yawDeg: number;   // Rotate Y (-60 to +60)
  rollDeg: number;  // Rotate Z (-20 to +20)
  perspectivePx: number; // 600 to 1800
  descKo: string;
}


const SUBSTRATES: MaterialSubstrate[] = [
  {
    id: 'bristol_ivory',
    name: 'Heavy Bristol Ivory Board',
    nameKo: '상아빛 브리스톨 후지',
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#121110',
    subTextColor: '#57534E',
    accentColor: '#2563EB',
    borderColor: '#E5E7EB',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    descKo: '요제프 뮐러-브로크만의 정갈한 인쇄소 종이를 재현하여, 깊은 사선 원근 속에서도 높은 명도 대비와 정갈한 조형미를 유지합니다.'
  },
  {
    id: 'basalt_carbon',
    name: 'Sintered Basalt Obsidian',
    nameKo: '소결 현무암 흑요석',
    surfaceTone: '#0D0E10',
    cardTone: '#16181D',
    textColor: '#FAF8F5',
    subTextColor: '#9CA3AF',
    accentColor: '#F59E0B',
    borderColor: '#262A33',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    descKo: '칠흑 같은 암석 기판 위에 호박색 투영 보조선과 왜상 활자가 빛을 발하며 극적인 사이버 에디토리얼 긴장감을 부여합니다.'
  },
  {
    id: 'milled_brass_optics',
    name: 'Milled Brass Caliper Plate',
    nameKo: '황동 정밀 광학 캘리퍼',
    surfaceTone: '#F4EFEA',
    cardTone: 'rgba(255, 255, 255, 0.95)',
    textColor: '#1C1917',
    subTextColor: '#78716C',
    accentColor: '#06B6D4',
    borderColor: '#D6CEBE',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    descKo: '16세기 한스 홀바인의 과학 기구(해시계, 토크레툼) 황동 질감을 모사하여 클래식 원근법 기하학의 권위를 드러냅니다.'
  }
];


const PRESETS: PerspectivePreset[] = [
  {
    id: 'holbein_skull_oblique',
    nameKo: '한스 홀바인 왜상 사선 모드 (38° Oblique)',
    pitchDeg: 28,
    yawDeg: -42,
    rollDeg: 12,
    perspectivePx: 900,
    descKo: '대사들 바닥의 해골처럼 극단적인 사선 원근으로 활자를 왜곡시킵니다.'
  },
  {
    id: 'vantage_singularity_lock',
    nameKo: '정면 광학 특이점 정렬 모드 (0° Vantage Lock)',
    pitchDeg: 0,
    yawDeg: 0,
    rollDeg: 0,
    perspectivePx: 1200,
    descKo: '사영 호모그래피 왜곡이 완벽히 상쇄되어 정갈한 스위스 벤토 그리드로 결착됩니다.'
  },
  {
    id: 'extreme_spatial_ribbon',
    nameKo: '극단 투영 리본 모드 (-35° Pitch, 50° Yaw)',
    pitchDeg: -35,
    yawDeg: 50,
    rollDeg: -15,
    perspectivePx: 750,
    descKo: '자하 하디드 건축의 공간 리본처럼 뷰포트 전체가 3차원 공간 속으로 솟구칩니다.'
  },
  {
    id: 'subtle_cinematic_cant',
    nameKo: '시네마틱 캔트 앵글 모드 (12° Pitch, -18° Yaw)',
    pitchDeg: 12,
    yawDeg: -18,
    rollDeg: 4,
    perspectivePx: 1400,
    descKo: '자연스러운 3차원 부유감을 제공하며 활자의 입체감을 부각시킵니다.'
  }
];


export default function AnamorphicSpatialBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<MaterialSubstrate>(SUBSTRATES[0]);
  const [selectedPreset, setSelectedPreset] = useState<PerspectivePreset>(PRESETS[0]);
  const [pitch, setPitch] = useState<number>(28); // -45 to 45
  const [yaw, setYaw] = useState<number>(-42);   // -60 to 60
  const [roll, setRoll] = useState<number>(12);   // -20 to 20
  const [perspectiveDist, setPerspectiveDist] = useState<number>(900); // 600 to 1800
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);


  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasTriggeredLockAudioRef = useRef<boolean>(false);


  // Angular Distance to Singular Vantage Point (0, 0, 0)
  const angularDistance = useMemo(() => {
    return Math.sqrt(pitch * pitch + yaw * yaw + roll * roll);
  }, [pitch, yaw, roll]);


  // Is within Vantage Point Singularity Lock (|Δ| < 3.5°)
  const isVantageLocked = useMemo(() => {
    return angularDistance < 3.5;
  }, [angularDistance]);


  // Anamorphic Stretch Factor: S ~ 1 / cos(view angle)
  const anamorphicStretch = useMemo(() => {
    const rad = (Math.max(Math.abs(pitch), Math.abs(yaw)) * Math.PI) / 180;
    return (1 / Math.max(0.2, Math.cos(rad))).toFixed(2);
  }, [pitch, yaw]);


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


  // Mechanical Camera Lens Barrel Ratchet Click Snap
  const playLensRatchetClick = useCallback((intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);


    gain.gain.setValueAtTime(0.3 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }, [initAudio, isAudioMuted]);


  // Pure 1200Hz Crystalline Focal Bell Chime upon Vantage Lock
  const playVantageLockChime = useCallback(() => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now); // Pure harmonic
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.7);


    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }, [initAudio, isAudioMuted]);


  // Trigger Lock Audio once when crossing threshold
  useEffect(() => {
    if (isVantageLocked && !hasTriggeredLockAudioRef.current) {
      playVantageLockChime();
      playLensRatchetClick(1.5);
      hasTriggeredLockAudioRef.current = true;
    } else if (!isVantageLocked) {
      hasTriggeredLockAudioRef.current = false;
    }
  }, [isVantageLocked, playVantageLockChime, playLensRatchetClick]);


  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  const dynamicFontWeight = useMemo(() => {
    // Weight swells from 300 (extreme oblique) up to 800 (singular vantage lock)
    const factor = Math.max(0, 1 - Math.min(1, angularDistance / 50));
    return Math.min(800, Math.round(300 + factor * 500));
  }, [angularDistance]);


  const dynamicFontWidth = useMemo(() => {
    // Width compensates yaw foreshortening: expands up to 125%
    const yawRad = (Math.abs(yaw) * Math.PI) / 180;
    return Math.min(130, Math.round(100 / Math.max(0.75, Math.cos(yawRad))));
  }, [yaw]);


  // Snap to Singular Vantage Point Lock
  const handleSnapToVantage = useCallback(() => {
    setPitch(0);
    setYaw(0);
    setRoll(0);
    setPerspectiveDist(1200);
    playLensRatchetClick(1.2);
    playVantageLockChime();
  }, [playLensRatchetClick, playVantageLockChime]);


  // Preset Selection
  const handleSelectPreset = useCallback((preset: PerspectivePreset) => {
    setSelectedPreset(preset);
    setPitch(preset.pitchDeg);
    setYaw(preset.yawDeg);
    setRoll(preset.rollDeg);
    setPerspectiveDist(preset.perspectivePx);
    playLensRatchetClick(0.9);
  }, [playLensRatchetClick]);


  // --- 2D HOMOGRAPHY PROJECTION CANVAS (60FPS) ---
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


      // 2. Compute 3x3 Projective Homography Simulation on Perspective Grid
      const cx = w / 2;
      const cy = h / 2;
      const pitchRad = (pitch * Math.PI) / 180;
      const yawRad = (yaw * Math.PI) / 180;


      ctx.save();
      ctx.translate(cx, cy);


      // 3. Draw Projected Spatial Coordinate Grid Lines
      ctx.strokeStyle = selectedSubstrate.borderColor;
      ctx.lineWidth = 1;


      const gridRange = 160;
      const step = 40;


      for (let x = -gridRange; x <= gridRange; x += step) {
        ctx.beginPath();
        for (let y = -gridRange; y <= gridRange; y += 10) {
          // Perspective math:
          const rotX = x * Math.cos(yawRad) - y * Math.sin(pitchRad) * Math.sin(yawRad);
          const rotY = y * Math.cos(pitchRad);
          const z = 300 + x * Math.sin(yawRad) + y * Math.sin(pitchRad);
          const scale = perspectiveDist / Math.max(100, z);


          const px = rotX * scale;
          const py = rotY * scale;


          if (y === -gridRange) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }


      for (let y = -gridRange; y <= gridRange; y += step) {
        ctx.beginPath();
        for (let x = -gridRange; x <= gridRange; x += 10) {
          const rotX = x * Math.cos(yawRad) - y * Math.sin(pitchRad) * Math.sin(yawRad);
          const rotY = y * Math.cos(pitchRad);
          const z = 300 + x * Math.sin(yawRad) + y * Math.sin(pitchRad);
          const scale = perspectiveDist / Math.max(100, z);


          const px = rotX * scale;
          const py = rotY * scale;


          if (x === -gridRange) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }


      // 4. Draw Projected Anamorphic Letterform Ribbon Stems
      ctx.strokeStyle = isVantageLocked ? selectedSubstrate.accentColor : '#4B5563';
      ctx.lineWidth = isVantageLocked ? 3 : 1.5;
      ctx.shadowColor = isVantageLocked ? selectedSubstrate.glowColor : 'transparent';
      ctx.shadowBlur = isVantageLocked ? 15 : 0;


      // Draw stylized "H" and "O" anamorphic skull glyph vectors
      const glyphPoints = [
        [-80, -60], [-80, 60], [-80, 0], [0, 0], [0, -60], [0, 60], // H
        [30, -60], [80, -60], [80, 60], [30, 60], [30, -60]         // O
      ];


      ctx.beginPath();
      for (let i = 0; i < glyphPoints.length; i++) {
        const [gx, gy] = glyphPoints[i];
        const rotX = gx * Math.cos(yawRad) - gy * Math.sin(pitchRad) * Math.sin(yawRad);
        const rotY = gy * Math.cos(pitchRad);
        const z = 300 + gx * Math.sin(yawRad) + gy * Math.sin(pitchRad);
        const scale = perspectiveDist / Math.max(100, z);


        const px = rotX * scale;
        const py = rotY * scale;


        if (i === 0 || i === 2 || i === 6) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();


      // 5. Draw Optical Center Vantage Reticle
      ctx.restore();


      ctx.strokeStyle = isVantageLocked ? '#10B981' : 'rgba(156, 163, 175, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, isVantageLocked ? 28 : 18, 0, Math.PI * 2);
      ctx.moveTo(cx - 24, cy);
      ctx.lineTo(cx + 24, cy);
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx, cy + 24);
      ctx.stroke();


      // Vantage Point Text
      ctx.fillStyle = selectedSubstrate.textColor;
      ctx.font = '10px monospace';
      ctx.fillText(`Δ Vantage: ${angularDistance.toFixed(1)}° · S: ${anamorphicStretch}x`, 16, 24);


      requestAnimationFrame(render);
    };


    const animId = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [pitch, yaw, roll, perspectiveDist, isVantageLocked, angularDistance, anamorphicStretch, selectedSubstrate]);


  // Handle Dragging Canvas Gimbal
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingCanvas(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };


    setYaw(prev => Math.max(-60, Math.min(60, prev + dx * 0.4)));
    setPitch(prev => Math.max(-45, Math.min(45, prev - dy * 0.4)));


    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      playLensRatchetClick(0.3);
    }
  };


  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };


  return (
    <div
      className="w-full min-h-screen transition-colors duration-500 font-sans select-none"
      style={{
        backgroundColor: selectedSubstrate.surfaceTone,
        color: selectedSubstrate.textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
      onMouseUp={handleMouseUp}
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
            className={`w-3.5 h-3.5 rounded-full transition-all ${isVantageLocked ? 'bg-emerald-500 animate-ping' : 'bg-blue-600'}`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 041 · 2026-10-12
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Anamorphic Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Anamorphic Spatial Bento & Projective Homography Shaders
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
                  playLensRatchetClick(1.0);
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


          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:bg-black/5"
            style={{ borderColor: selectedSubstrate.borderColor }}
            title={isAudioMuted ? "음소거 해제 (Unmute Audio)" : "음소거 (Mute Audio)"}
          >
            <span>{isAudioMuted ? "🔇" : "📐"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "LENS SOUND"}</span>
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
            <span className="hidden sm:inline">{isFullscreen ? "STANDARD" : "STAGE MODE"}</span>
          </button>
        </div>
      </header>


      {/* MAIN CONTAINER */}
      <main className={`w-full mx-auto p-4 md:p-8 transition-all ${isFullscreen ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* 3D SPATIAL PROJECTION WRAPPER */}
        <div
          className="relative transition-all duration-300 transform-gpu"
          style={{
            perspective: `${perspectiveDist}px`,
            perspectiveOrigin: '50% 50%'
          }}
        >
          {/* BENTO GRID ARCHITECTURE (6 INTERACTIVE MODULAR CELLS WITH 3D PERSPECTIVE) */}
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative transition-transform duration-100"
            style={{
              transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >


            {/* CELL 1: MONUMENTAL MONOGRAPH MASTHEAD (Span 8 Cols) */}
            <div
              className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-md"
              style={{
                backgroundColor: selectedSubstrate.cardTone,
                borderColor: isVantageLocked ? selectedSubstrate.accentColor : selectedSubstrate.borderColor,
                boxShadow: isVantageLocked ? `0 0 25px ${selectedSubstrate.glowColor}` : 'none'
              }}
            >
              {/* Top Micro-Specs */}
              <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedSubstrate.borderColor }}>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold flex items-center gap-1 ${
                      isVantageLocked ? 'text-emerald-500' : 'text-blue-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full inline-block animate-ping" style={{ backgroundColor: isVantageLocked ? '#10B981' : '#2563EB' }} />
                    {isVantageLocked ? 'VANTAGE POINT LOCKED (H⁻¹ H = I)' : `OBLIQUE DISTORTION: ${anamorphicStretch}x`}
                  </span>
                  <span className="text-xs opacity-40 font-mono">/</span>
                  <span className="font-mono text-xs opacity-75">
                    Δ: {angularDistance.toFixed(1)}° · Weight: {dynamicFontWeight}
                  </span>
                </div>
                <div className="font-mono text-xs opacity-60">
                  PROJECTIVE HOMOGRAPHY H
                </div>
              </div>


              {/* Display Typography with Variable Weight & Width Compensation */}
              <div className="my-auto py-4">
                <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                  Holbein Anamorphosis & Homography Collapse
                </span>
                <h2
                  className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    transform: `scaleX(${dynamicFontWidth / 100})`,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  Anamorphic Spatial Bento
                </h2>
                <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                  역사적 디오라마 클리셰를 극복하고, 3x3 사영 호모그래피 행렬과 왜상 원근 기하학을 스위스 벤토 그리드에 전격 이식하여, 단일 광학 특이점(θ=0°, ψ=0°)에서 완벽한 스위스 모더니즘의 정갈한 평형으로 찰칵 결착되는 3차원 공간 에디토리얼 파빌리온.
                </p>
              </div>


              {/* Bottom Coordinate Bar & Dynamic Metrics */}
              <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
                <div className="flex items-center gap-4">
                  <span>
                    <strong className="opacity-50">SUBSTRATE:</strong> {selectedSubstrate.nameKo.split(' ')[0]}
                  </span>
                  <span>
                    <strong className="opacity-50">PITCH:</strong> {pitch.toFixed(1)}°
                  </span>
                  <span>
                    <strong className="opacity-50">YAW:</strong> {yaw.toFixed(1)}°
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-60">Optical Width:</span>
                  <strong className="text-blue-600">{dynamicFontWidth}%</strong>
                </div>
              </div>
            </div>


            {/* CELL 2: 3D GIMBAL CONTROLS & VANTAGE SNAP (Span 4 Cols) */}
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
                    3D Perspective Gimbal
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                    {perspectiveDist}px Depth
                  </span>
                </div>


                {/* Pitch Angle Slider */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1 opacity-70">
                    <span>Pitch Angle (X-Tilt)</span>
                    <span>{pitch.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={pitch}
                    onChange={(e) => {
                      setPitch(Number(e.target.value));
                      playLensRatchetClick(0.4);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>


                {/* Yaw Angle Slider */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1 opacity-70">
                    <span>Yaw Angle (Y-Rotate)</span>
                    <span>{yaw.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    value={yaw}
                    onChange={(e) => {
                      setYaw(Number(e.target.value));
                      playLensRatchetClick(0.4);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>


                {/* Perspective Focal Distance Slider */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-mono mb-1 opacity-70">
                    <span>Focal Distance (Perspective)</span>
                    <span>{perspectiveDist}px</span>
                  </div>
                  <input
                    type="range"
                    min={600}
                    max={1800}
                    value={perspectiveDist}
                    onChange={(e) => setPerspectiveDist(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>


                {/* SNAP TO VANTAGE POINT LOCK BUTTON */}
                <div className="mb-4">
                  <button
                    onClick={handleSnapToVantage}
                    className={`w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isVantageLocked ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'hover:bg-blue-600/10 hover:border-blue-500 text-blue-600'
                    }`}
                    style={{ borderColor: isVantageLocked ? '#10B981' : selectedSubstrate.borderColor }}
                  >
                    <span>🎯</span>
                    <span>SNAP TO VANTAGE SINGULARITY (0°)</span>
                  </button>
                </div>


                {/* Presets Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                    Anamorphic Camera Presets
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
                        <div className="text-[10px] opacity-60 truncate">{p.pitchDeg}° / {p.yawDeg}°</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
                💡 캔버스 위를 마우스로 직접 드래그하여 3D 시점을 자유롭게 회전하세요.
              </div>
            </div>


            {/* CELL 3: 2D HOMOGRAPHY RAY-TRACED VIEWPORT (Span 7 Cols) */}
            <div
              className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-md relative overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: selectedSubstrate.cardTone,
                borderColor: selectedSubstrate.borderColor
              }}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    Projective Homography Ray-Tracer
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isVantageLocked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 text-blue-600'
                    }`}
                  >
                    {isVantageLocked ? 'PERFECT FOCUS' : 'OBLIQUE STRETCH'}
                  </span>
                </div>


                {/* Reset Camera Button */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    onClick={handleSnapToVantage}
                    className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                    style={{ borderColor: selectedSubstrate.borderColor }}
                  >
                    Center Reticle
                  </button>
                </div>
              </div>


              {/* Interactive Projection Canvas */}
              <div
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner cursor-grab active:cursor-grabbing"
                style={{ borderColor: selectedSubstrate.borderColor }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={420}
                  className="w-full h-full block"
                />


                {/* Overlay Readout Tag */}
                <div
                  className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: selectedSubstrate.cardTone + 'E6',
                    borderColor: selectedSubstrate.borderColor
                  }}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isVantageLocked ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`}
                  />
                  <span>Homography Matrix: <strong>{isVantageLocked ? 'H = Identity (I)' : 'H = Projective'}</strong></span>
                </div>
              </div>


              {/* Bottom Caption */}
              <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
                <span>HANS HOLBEIN THE YOUNGER (1533)</span>
                <span>x' ~ Hx · Non-Euclidean Perspective</span>
              </div>
            </div>


            {/* CELL 4: ANAMORPHIC VARIABLE TYPOGRAPHY MONOGRAPH (Span 5 Cols) */}
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
                    Vantage-Coupled Variable Text
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    wght: {dynamicFontWeight}
                  </span>
                </div>


                <div
                  className="p-4 rounded-xl border mb-4 relative overflow-hidden transition-all"
                  style={{
                    borderColor: selectedSubstrate.borderColor,
                    backgroundColor: selectedSubstrate.surfaceTone
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                    Axiom 41 Projective Alignment
                  </span>
                  <p
                    className="text-lg md:text-xl font-serif leading-snug transition-all"
                    style={{
                      fontWeight: dynamicFontWeight,
                      transform: `scaleX(${dynamicFontWidth / 100})`,
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}
                  >
                    "Truth in perspective is not an absolute plane, but a singular vantage point waiting to be discovered."
                  </p>
                  <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                    비스듬한 각도에서는 활자가 공간 속으로 2.5배 이상 늘어나며 원근 단축에 저항하고, 단일 광학 특이점에 도달했을 때 압도적인 굵기(wght: 800)의 스위스 에디토리얼 그리드로 찰칵 결착됩니다.
                  </div>
                </div>


                {/* Weight & Width Inspectors */}
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
                      <span>Optical Foreshortening Width (wdth)</span>
                      <span>{dynamicFontWidth}% / 130%</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, ((dynamicFontWidth - 100) / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>


              <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span>PROJECTIVE HOMOGRAPHY</span>
                <span>SINGULAR VANTAGE RESOLVED</span>
              </div>
            </div>


            {/* CELL 5: HOMOGRAPHY MATRIX MATHEMATICAL PARAMS (Span 6 Cols) */}
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
                    3x3 Homography Matrix Components
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: selectedSubstrate.accentColor }}>
                    det(H) ≠ 0 (Invertible)
                  </span>
                </div>


                <p className="text-xs font-sans opacity-80 leading-relaxed mb-4">
                  월드 좌표 [X, Y, Z]와 스크린 좌표 [x', y'] 사이의 회전 및 투영 변환 계수를 실시간으로 해석하여, 사선 뷰포트의 비선형 원근 신장률을 통제합니다.
                </p>


                {/* Matrix Component Matrix 3x3 */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h11 (cos ψ)</div>
                    <div className="font-bold">{Math.cos((yaw * Math.PI)/180).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h12 (sin ψ)</div>
                    <div className="font-bold">{Math.sin((yaw * Math.PI)/180).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h13 (tx)</div>
                    <div className="font-bold">0.00</div>
                  </div>


                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h21 (-sin θ)</div>
                    <div className="font-bold">{(-Math.sin((pitch * Math.PI)/180)).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h22 (cos θ)</div>
                    <div className="font-bold">{Math.cos((pitch * Math.PI)/180).toFixed(2)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h23 (ty)</div>
                    <div className="font-bold">0.00</div>
                  </div>


                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h31 (proj x)</div>
                    <div className="font-bold">{(Math.sin((yaw * Math.PI)/180) / perspectiveDist).toFixed(4)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h32 (proj y)</div>
                    <div className="font-bold">{(Math.sin((pitch * Math.PI)/180) / perspectiveDist).toFixed(4)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border" style={{ borderColor: selectedSubstrate.borderColor }}>
                    <div className="text-[10px] opacity-50">h33 (scale)</div>
                    <div className="font-bold">1.00</div>
                  </div>
                </div>
              </div>


              <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="opacity-60">SINGULARITY STATUS</span>
                <span className="font-bold text-emerald-500">
                  {isVantageLocked ? 'HOMOGRAPHY INVERTED (H⁻¹ H = I)' : 'PROJECTIVE DISTORTION ACTIVE'}
                </span>
              </div>
            </div>


            {/* CELL 6: TACTILE LENS ACOUSTIC SOUNDBOARD (Span 6 Cols) */}
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
                    Tactile Lens Optics Acoustics
                  </span>
                  <span className="text-xs font-mono opacity-60">
                    Web Audio API Haptics
                  </span>
                </div>


                <p className="text-xs font-sans opacity-70 mb-4">
                  정밀 카메라 렌즈 조리개 회전 시의 래칫 틱음, 사선 원근 신장음, 그리고 단일 광학 특이점에 도달했을 때의 맑고 영롱한 1200Hz 석영 수정 초점 벨을 연주하세요.
                </p>


                {/* Soundboard Buttons Matrix */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { name: 'Lens Ratchet', action: () => playLensRatchetClick(1.4), label: '경통 래칫 틱' },
                    { name: 'Vantage Bell', action: playVantageLockChime, label: '1200Hz 초점 벨' },
                    { name: 'Oblique 45°', action: () => { setPitch(28); setYaw(-42); playLensRatchetClick(0.9); }, label: '왜상 사선 각도' },
                    { name: 'Zero Vantage', action: handleSnapToVantage, label: '특이점 스냅 정렬' },
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
                      <div className="text-xs font-mono font-bold group-hover:text-blue-600 transition-colors">
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
                <span>Mechanical Lens Barrel Detents + 1200Hz Focal Ring Chimes</span>
                <span>Zero-Fatigue Tactile Haptics</span>
              </div>
            </div>


          </div>
        </div>


        {/* FOOTER EDITORIAL SUMMARY */}
        <footer
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-70"
          style={{ borderColor: selectedSubstrate.borderColor }}
        >
          <div>
            Design Minds · Gemini (The Noon Mind) · Day 041 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-12</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: ANAMORPHIC SPATIAL BENTO</span>
          </div>
        </footer>


      </main>
    </div>
  );
}
