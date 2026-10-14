import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// --- TYPES & INTERFACES ---
interface MaterialPreset {
  id: string;
  name: string;
  nameKo: string;
  weightGsm: number;
  creaseRadiusMm: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  valleyShadow: string;
  sheenColor: string;
  descKo: string;
}

interface FoldPreset {
  id: 'miura_quad' | 'accordion_trifold' | 'gatefold_brochure' | 'flat_swiss';
  nameKo: string;
  targetAngle: number;
  layoutMode: string;
  descKo: string;
}

const MATERIALS: MaterialPreset[] = [
  {
    id: 'bristol_ivory',
    name: 'Heavy Cotton Bristol Cardstock',
    nameKo: '중량 코튼 브리스톨지',
    weightGsm: 350,
    creaseRadiusMm: 0.8,
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    accentColor: '#C5A059',
    borderColor: '#E7E2DA',
    valleyShadow: 'rgba(20, 19, 18, 0.48)',
    sheenColor: 'rgba(229, 200, 135, 0.4)',
    descKo: '350gsm 고밀도 순면 브리스톨지로, 접힐 때 둔탁하고 묵직한 종이 등뼈 마찰음과 우아한 상아빛 계곡 그림자를 형성합니다.'
  },
  {
    id: 'anodized_titanium',
    name: 'Anodized Architectural Titanium',
    nameKo: '아노다이징 티타늄 패널',
    weightGsm: 1800,
    creaseRadiusMm: 0.2,
    surfaceTone: '#141312',
    cardTone: '#1F1D1B',
    textColor: '#FAF8F5',
    subTextColor: '#A8A29E',
    accentColor: '#C2410C',
    borderColor: '#2E2B28',
    valleyShadow: 'rgba(0, 0, 0, 0.82)',
    sheenColor: 'rgba(194, 65, 12, 0.35)',
    descKo: '1.2mm 극도로 정밀한 금속성 힌지 메커니즘을 모사하여, 각도가 꺾일 때 면도날 같은 스펙큘러 리플렉션과 정밀 기계식 클릭음을 뿜어냅니다.'
  },
  {
    id: 'frosted_glassine',
    name: 'Translucent Folded Glassine',
    nameKo: '반투명 접이식 글라신지',
    weightGsm: 90,
    creaseRadiusMm: 0.4,
    surfaceTone: '#FAF6EE',
    cardTone: 'rgba(255, 255, 255, 0.84)',
    textColor: '#141312',
    subTextColor: '#64748B',
    accentColor: '#4F46E5',
    borderColor: '#E2E8F0',
    valleyShadow: 'rgba(79, 70, 229, 0.32)',
    sheenColor: 'rgba(79, 70, 229, 0.25)',
    descKo: '빛을 은은하게 여과하는 반투명 양피지로, 3D 접힘 속에서 면과 면이 겹치며 감산혼합적인 광학적 뎁스를 자아냅니다.'
  }
];

const PRESETS: FoldPreset[] = [
  {
    id: 'miura_quad',
    nameKo: '미우라 오그제틱 쿼드 (Miura 2x2)',
    targetAngle: 65,
    layoutMode: '4-Facet Alternating Mountain/Valley',
    descKo: '산과 골이 교차하며 4개의 모듈러 카드가 동시에 중심을 향해 수축·팽창합니다.'
  },
  {
    id: 'accordion_trifold',
    nameKo: '아코디언 Z-폴드 (Accordion 3-Fold)',
    targetAngle: 85,
    layoutMode: '3-Panel Z-Fold Horizontal Accordion',
    descKo: '3장의 독립된 에디토리얼 칼럼이 지그재그 병풍 형태로 접히며 입체적 서사를 전개합니다.'
  },
  {
    id: 'gatefold_brochure',
    nameKo: '양문형 게이트폴드 (Gatefold Pavilion)',
    targetAngle: 75,
    layoutMode: 'Dual Symmetrical Wing Doors',
    descKo: '좌우 날개 패널이 문처럼 열리고 닫히며 중앙의 장엄한 마스트헤드를 극적으로 드러냅니다.'
  },
  {
    id: 'flat_swiss',
    nameKo: '완전 전개 스위스 그리드 (Flat 0°)',
    targetAngle: 0,
    layoutMode: 'Flat 2D Modular Grid',
    descKo: '0도 완전 전개 상태에서 요제프 뮐러-브로크만의 완벽한 2차원 평면 그리드로 안착합니다.'
  }
];

export default function KineticOrigamiBentoExperiment() {
  // --- STATE ---
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialPreset>(MATERIALS[0]);
  const [selectedPreset, setSelectedPreset] = useState<FoldPreset>(PRESETS[0]);
  const [foldAngle, setFoldAngle] = useState<number>(65); // 0° to 160°
  const [lightAzimuthDeg, setLightAzimuthDeg] = useState<number>(45); // 0° to 360°
  const [auxeticScale, setAuxeticScale] = useState<number>(1.0); // 0.65 to 1.35
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDraggingHinge, setIsDraggingHinge] = useState<boolean>(false);
  const [isDraggingAuxetic, setIsDraggingAuxetic] = useState<boolean>(false);

  // 3D Gyroscopic Perspective Orbit
  const [orbitRotateX, setOrbitRotateX] = useState<number>(14);
  const [orbitRotateY, setOrbitRotateY] = useState<number>(-12);

  // References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; initialAngle: number; initialScale: number }>({
    x: 0,
    y: 0,
    initialAngle: 65,
    initialScale: 1.0
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTickAngleRef = useRef<number>(65);

  // --- WEB AUDIO API SYNTHESIZER ---
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Paper spine creasing friction sound
  const playCreaseFrictionSound = useCallback((speed: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850 * Math.max(0.5, speed), ctx.currentTime);
    filter.Q.setValueAtTime(2.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06 * Math.min(1.5, speed), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.13);
  }, [initAudio, isAudioMuted]);

  // Crisp origami mechanical snap / click sound
  const playFoldSnapSound = useCallback((isMechanical: boolean = false) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isMechanical || selectedMaterial.id === 'anodized_titanium') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }, [initAudio, isAudioMuted, selectedMaterial]);

  // Hinge angle micro-detent tick (triggered every 15 degrees)
  const checkAngleTicks = useCallback((currentAngle: number) => {
    const diff = Math.abs(currentAngle - lastTickAngleRef.current);
    if (diff >= 15) {
      lastTickAngleRef.current = currentAngle;
      if (!isAudioMuted) {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    }
  }, [initAudio, isAudioMuted]);

  // --- KINEMATIC FORMULAS ---
  // Dynamic margin relief: expands internal padding away from hinge seam
  const marginReliefPx = useMemo(() => {
    const rad = (foldAngle * Math.PI) / 360;
    return Math.round(18 + 36 * Math.sin(rad));
  }, [foldAngle]);

  // Foreshortening typography compensation:
  // As fold angle deepens, weight scales from 400 up to 750
  const foreshortenedFontWeight = useMemo(() => {
    const rad = (foldAngle * Math.PI) / 180;
    const factor = 1 - Math.cos(rad);
    return Math.min(750, Math.round(400 + 350 * factor));
  }, [foldAngle]);

  // Valley Shadow Umbra Opacity (reaches 0.85 at acute angle)
  const valleyShadowOpacity = useMemo(() => {
    const rad = (foldAngle * Math.PI) / 180;
    return Math.min(0.85, Math.sin(rad) * 0.9);
  }, [foldAngle]);

  // Handle Preset Change
  const handleSelectPreset = (preset: FoldPreset) => {
    setSelectedPreset(preset);
    setFoldAngle(preset.targetAngle);
    playFoldSnapSound(preset.targetAngle > 80);
  };

  // Pointer drag listeners for spatial hinge
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDraggingHinge(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      initialAngle: foldAngle,
      initialScale: auxeticScale
    };
    playCreaseFrictionSound(1.0);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDraggingHinge) {
      const deltaX = clientX - dragStartRef.current.x;
      const nextAngle = Math.max(0, Math.min(160, dragStartRef.current.initialAngle + deltaX * 0.45));
      setFoldAngle(nextAngle);
      checkAngleTicks(nextAngle);
      if (Math.abs(deltaX) % 18 < 2) {
        playCreaseFrictionSound(0.8);
      }
    } else if (isDraggingAuxetic) {
      const deltaX = clientX - dragStartRef.current.x;
      const nextScale = Math.max(0.65, Math.min(1.35, dragStartRef.current.initialScale + deltaX * 0.003));
      setAuxeticScale(nextScale);
      // Auxetic coupling: stretching corner also unfolds angle!
      const coupledAngle = Math.max(0, Math.min(160, (1.35 - nextScale) * 180));
      setFoldAngle(coupledAngle);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingHinge || isDraggingAuxetic) {
      setIsDraggingHinge(false);
      setIsDraggingAuxetic(false);
      playFoldSnapSound(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        handlePointerMove(e.clientX, e.clientY);
        if (!isDraggingHinge && !isDraggingAuxetic) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            setOrbitRotateY(Math.round(nx * 26));
            setOrbitRotateX(Math.round(ny * -20 + 10));
          }
        }
      }}
      onMouseUp={handlePointerUp}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerUp}
      className="w-full min-h-screen transition-colors duration-500 font-sans select-none"
      style={{
        backgroundColor: selectedMaterial.surfaceTone,
        color: selectedMaterial.textColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header
        className="w-full border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md"
        style={{
          borderColor: selectedMaterial.borderColor,
          backgroundColor: selectedMaterial.surfaceTone + 'F2'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ backgroundColor: selectedMaterial.accentColor }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 036 · 2026-10-07
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedMaterial.accentColor + '22',
                  color: selectedMaterial.accentColor
                }}
              >
                3D Origami Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Kinetic Origami Bento & 3D Spatial Hinge Tectonics
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
                  playFoldSnapSound(true);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedMaterial.id === mat.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedMaterial.id === mat.id ? selectedMaterial.accentColor : 'transparent',
                  color: selectedMaterial.id === mat.id ? (selectedMaterial.id === 'anodized_titanium' ? '#FAF8F5' : '#141312') : selectedMaterial.textColor
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
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "SPINE SOUND"}</span>
          </button>

          {/* Fullscreen Toggle */}
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

          {/* CELL 1: MONUMENTAL MONOGRAPH MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
                  3D HINGE COUPLING ACTIVE
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  θ={foldAngle.toFixed(1)}° · Margin Δ={marginReliefPx}px · ν &lt; 0
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                MIURA-ORI AUXETICS
              </div>
            </div>

            {/* Giant Display Typography with Foreshortening Compensation */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                3D Rigid Origami Tessellation
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: foreshortenedFontWeight,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Kinetic Origami Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedMaterial.subTextColor }}>
                파괴적인 종이 찢기 클리셰를 폐기하고, 우주 구조공학 미우라 접기(Miura-Ori)와 폴더블 스크린 힌지 인체공학을 결합한 3차원 입체 에디토리얼 파빌리온.
              </p>
            </div>

            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">SUBSTRATE:</strong> {selectedMaterial.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">WEIGHT:</strong> {selectedMaterial.weightGsm} gsm
                </span>
                <span>
                  <strong className="opacity-50">CREASE RADIUS:</strong> {selectedMaterial.creaseRadiusMm} mm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Optical Weight:</span>
                <strong className="text-amber-600">wght: {foreshortenedFontWeight}</strong>
              </div>
            </div>
          </div>

          {/* CELL 2: SPATIAL HINGE CONTROLLER & PRESET SELECTOR (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Spatial Hinge Controller
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: selectedMaterial.accentColor }}>
                  {foldAngle.toFixed(0)}° Dihedral
                </span>
              </div>

              {/* Fold Angle Slider */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Fold Angle (θ)</span>
                  <span>0° (Flat) – 160° (Closed)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={160}
                  value={foldAngle}
                  onChange={(e) => {
                    const nextA = Number(e.target.value);
                    setFoldAngle(nextA);
                    checkAngleTicks(nextA);
                    playCreaseFrictionSound(1.0);
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Light Azimuth Slider */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Raking Light Azimuth (α)</span>
                  <span>{lightAzimuthDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={lightAzimuthDeg}
                  onChange={(e) => setLightAzimuthDeg(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Fold Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Kinematic Origami Presets
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
                        borderColor: selectedPreset.id === p.id ? selectedMaterial.accentColor : selectedMaterial.borderColor,
                        backgroundColor: selectedPreset.id === p.id ? selectedMaterial.accentColor + '18' : 'transparent',
                        color: selectedPreset.id === p.id ? selectedMaterial.accentColor : selectedMaterial.textColor
                      }}
                    >
                      <div className="font-bold truncate">{p.nameKo.split(' ')[0]}</div>
                      <div className="text-[10px] opacity-60 truncate">{p.targetAngle}° · {p.layoutMode.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              💡 슬라이더나 3D 패널을 직접 마우스로 잡아당겨 접힘 각도를 조작하세요.
            </div>
          </div>

          {/* CELL 3: 3D PERSPECTIVE ORIGAMI CANVAS VIEWPORT (Span 7 Cols) */}
          <div
            className="md:col-span-7 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  3D Spatial Origami Viewport
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">
                  CSS 3D Preserve-3D Stage
                </span>
              </div>

              {/* Viewport Action */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setFoldAngle(foldAngle > 80 ? 15 : 105)}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedMaterial.borderColor }}
                >
                  ⚡ Toggle Snap
                </button>
              </div>
            </div>

            {/* 3D INTERACTIVE ORIGAMI FOLDING STAGE */}
            <div
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onTouchStart={(e) => {
                if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
              }}
              className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              style={{
                borderColor: selectedMaterial.borderColor,
                backgroundColor: selectedMaterial.surfaceTone,
                perspective: '1200px'
              }}
            >
              {/* Central 3D Folding Assembly */}
              <div
                className="w-4/5 h-4/5 flex items-stretch transition-transform duration-150 relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${orbitRotateX}deg) rotateY(${orbitRotateY}deg) scale(${auxeticScale})`
                }}
              >
                {/* 3D RENDER MODES: MIURA QUAD, ACCORDION, GATEFOLD */}
                {selectedPreset.id === 'accordion_trifold' ? (
                  // ACCORDION Z-FOLD (3 PANELS)
                  <div className="w-full h-full flex items-stretch" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Panel 1 */}
                    <div
                      className="flex-1 rounded-l-xl border p-4 flex flex-col justify-between shadow-md"
                      style={{
                        backgroundColor: selectedMaterial.cardTone,
                        borderColor: selectedMaterial.borderColor,
                        transformOrigin: 'right center',
                        transform: `rotateY(${foldAngle * 0.45}deg)`,
                        paddingRight: `${marginReliefPx}px`
                      }}
                    >
                      <span className="text-[9px] font-mono text-amber-600 font-bold">PANEL 1 · VERSO</span>
                      <h4 className="text-sm font-serif font-bold">Spatial Continuity</h4>
                      <div className="text-[10px] font-mono opacity-50">Z-FOLD 01</div>
                    </div>
                    {/* Seam 1 */}
                    <div className="w-1 relative flex-shrink-0" style={{ backgroundColor: selectedMaterial.borderColor }}>
                      <div className="absolute inset-0 w-6 pointer-events-none" style={{ opacity: valleyShadowOpacity, background: `linear-gradient(to right, ${selectedMaterial.valleyShadow}, transparent)` }} />
                    </div>
                    {/* Panel 2 (Center) */}
                    <div
                      className="flex-1 border p-4 flex flex-col justify-between shadow-md"
                      style={{
                        backgroundColor: selectedMaterial.cardTone,
                        borderColor: selectedMaterial.borderColor,
                        paddingLeft: `${marginReliefPx * 0.5}px`,
                        paddingRight: `${marginReliefPx * 0.5}px`
                      }}
                    >
                      <span className="text-[9px] font-mono text-amber-600 font-bold">PANEL 2 · SPINE</span>
                      <h4 className="text-sm font-serif font-bold" style={{ fontWeight: foreshortenedFontWeight }}>Josef Albers Vorkurs</h4>
                      <div className="text-[10px] font-mono opacity-50">STATIONARY</div>
                    </div>
                    {/* Seam 2 */}
                    <div className="w-1 relative flex-shrink-0" style={{ backgroundColor: selectedMaterial.borderColor }}>
                      <div className="absolute inset-0 w-6 right-0 pointer-events-none" style={{ opacity: valleyShadowOpacity, background: `linear-gradient(to left, ${selectedMaterial.valleyShadow}, transparent)` }} />
                    </div>
                    {/* Panel 3 */}
                    <div
                      className="flex-1 rounded-r-xl border p-4 flex flex-col justify-between shadow-md"
                      style={{
                        backgroundColor: selectedMaterial.cardTone,
                        borderColor: selectedMaterial.borderColor,
                        transformOrigin: 'left center',
                        transform: `rotateY(${-foldAngle * 0.45}deg)`,
                        paddingLeft: `${marginReliefPx}px`
                      }}
                    >
                      <span className="text-[9px] font-mono text-amber-600 font-bold">PANEL 3 · RECTO</span>
                      <h4 className="text-sm font-serif font-bold">Auxetic Unfolding</h4>
                      <div className="text-[10px] font-mono opacity-50">Z-FOLD 03</div>
                    </div>
                  </div>
                ) : (
                  // DUAL-WING / MIURA-ORI ASSEMBLY
                  <div className="w-full h-full flex items-stretch" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Left Folding Facet (Mountain/Valley Hinge) */}
                    <div
                      className="flex-1 rounded-l-xl border p-4 flex flex-col justify-between relative shadow-lg transition-transform duration-200"
                      style={{
                        backgroundColor: selectedMaterial.cardTone,
                        borderColor: selectedMaterial.borderColor,
                        transformOrigin: 'right center',
                        transform: `rotateY(${foldAngle * 0.5}deg)`,
                        paddingRight: `${marginReliefPx}px`
                      }}
                    >
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 font-bold block mb-1">
                          FACET A · LEFT HINGE
                        </span>
                        <h3
                          className="text-lg font-serif font-bold leading-tight"
                          style={{ fontWeight: foreshortenedFontWeight }}
                        >
                          "The fold does not destroy; it creates depth."
                        </h3>
                      </div>

                      <div className="text-[10px] font-mono opacity-60">
                        DIHEDRAL ANGLE: {(foldAngle * 0.5).toFixed(1)}°
                      </div>
                    </div>

                    {/* Central Hinge Seam & Crease Shadow Umbra */}
                    <div className="w-1 relative flex-shrink-0" style={{ backgroundColor: selectedMaterial.borderColor }}>
                      {/* Ray-traced shadow gradient into fold valley */}
                      <div
                        className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none transition-opacity duration-200"
                        style={{
                          opacity: valleyShadowOpacity,
                          background: `linear-gradient(to right, ${selectedMaterial.valleyShadow}, transparent)`
                        }}
                      />
                      <div
                        className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none transition-opacity duration-200"
                        style={{
                          opacity: valleyShadowOpacity,
                          background: `linear-gradient(to left, ${selectedMaterial.valleyShadow}, transparent)`
                        }}
                      />
                    </div>

                    {/* Right Folding Facet */}
                    <div
                      className="flex-1 rounded-r-xl border p-4 flex flex-col justify-between relative shadow-lg transition-transform duration-200"
                      style={{
                        backgroundColor: selectedMaterial.cardTone,
                        borderColor: selectedMaterial.borderColor,
                        transformOrigin: 'left center',
                        transform: `rotateY(${-foldAngle * 0.5}deg)`,
                        paddingLeft: `${marginReliefPx}px`
                      }}
                    >
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-600 font-bold block mb-1">
                          FACET B · RIGHT WING
                        </span>
                        <p className="text-xs font-sans opacity-80 leading-relaxed">
                          중앙 접힘축에서 여백이 스스로 {marginReliefPx}px 물러서며, 텍스트가 접힘 계곡 그림자에 가려지지 않는 불변의 가독성을 달성합니다.
                        </p>
                      </div>

                      <div className="text-[10px] font-mono opacity-60">
                        CLEARANCE: {marginReliefPx}px RELIEF
                      </div>
                    </div>
                  </div>
                )}

                {/* Auxetic Drag Corner Handle (Negative Poisson expansion) */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingAuxetic(true);
                    dragStartRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      initialAngle: foldAngle,
                      initialScale: auxeticScale
                    };
                    playCreaseFrictionSound(1.4);
                  }}
                  className="absolute bottom-2 right-2 w-7 h-7 rounded-lg border bg-amber-500/20 hover:bg-amber-500/40 cursor-nwse-resize flex items-center justify-center text-xs shadow-md transition-all"
                  style={{ borderColor: selectedMaterial.accentColor }}
                  title="오그제틱 모서리 당기기 (Auxetic Pull: ν < 0)"
                >
                  ↗
                </div>
              </div>

              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedMaterial.cardTone + 'E6',
                  borderColor: selectedMaterial.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Valley Angle: <strong>{(180 - foldAngle).toFixed(1)}°</strong> · Scale: <strong>{auxeticScale.toFixed(2)}x</strong></span>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>DRAG CANVAS TO ROTATE & FOLD</span>
              <span>cos(θ_v) = cos(θ_u)·cos(γ) / √(1 - sin²θ_u·sin²γ)</span>
            </div>
          </div>

          {/* CELL 4: HINGE MARGIN RELIEF & VARIABLE FONT INSPECTOR (Span 5 Cols) */}
          <div
            className="md:col-span-5 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Margin Relief & Typography
                </span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  wght: {foreshortenedFontWeight}
                </span>
              </div>

              <div className="p-4 rounded-xl border mb-4 relative overflow-hidden" style={{ borderColor: selectedMaterial.borderColor, backgroundColor: selectedMaterial.surfaceTone }}>
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 36 Invariant Legibility
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: foreshortenedFontWeight,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "The fold breathes like an altar screen, unveiling narrative in three dimensions."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  접힘 각도가 가팔라질수록 활자는 원근 단축을 극복하기 위해 가변 서체 굵기(wght: 400 → 750)를 스스로 증폭시켜 시각적 권위를 보존합니다.
                </div>
              </div>

              {/* Dynamic Hinge Clearance Inspector */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Hinge Margin Clearance</span>
                    <span>{marginReliefPx} px / 54 px</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${(marginReliefPx / 54) * 100}%`,
                        backgroundColor: selectedMaterial.accentColor
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Foreshortening Compensation</span>
                    <span>{(((foreshortenedFontWeight - 400) / 350) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${((foreshortenedFontWeight - 400) / 350) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>BAUHAUS VORKURS</span>
              <span>JOSEF ALBERS PAPER FOLDING</span>
            </div>
          </div>

          {/* CELL 5: ORIGAMI MATERIAL SPECIFICATIONS (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardTone,
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
                  <div className="text-[10px] opacity-60">WEIGHT (GSM)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.weightGsm}</div>
                  <div className="text-[10px] opacity-50">g/m²</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">CREASE RADIUS</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.creaseRadiusMm}</div>
                  <div className="text-[10px] opacity-50">mm (Fold Apex)</div>
                </div>

                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">VALLEY UMBRA</div>
                  <div className="text-base font-bold mt-0.5">{(valleyShadowOpacity * 100).toFixed(0)}%</div>
                  <div className="text-[10px] opacity-50">Shadow Flux</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <span className="opacity-60">MIURA-ORI AUXETIC KINEMATICS</span>
              <span className="font-bold" style={{ color: selectedMaterial.accentColor }}>
                FACET RIGIDITY PRESERVED
              </span>
            </div>
          </div>

          {/* CELL 6: TACTILE SOUNDBOARD & MECHANICAL DETENT SYNTHESIZER (Span 6 Cols) */}
          <div
            className="md:col-span-6 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Tactile Spine Friction Synthesizer
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>

              <p className="text-xs font-sans opacity-70 mb-4">
                종이 척추가 구부러질 때의 묵직한 섬유 마찰음, 기계식 경첩의 금속성 멈춤 클릭음, 그리고 완전 전개 시의 경쾌한 스냅 사운드를 직접 연주하세요.
              </p>

              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Spine Flex', action: () => playCreaseFrictionSound(1.0), label: '종이 등뼈 휨' },
                  { name: 'Crease Snap', action: () => playFoldSnapSound(false), label: '접힘 스냅음' },
                  { name: 'Hinge Detent', action: () => playFoldSnapSound(true), label: '기계식 경첩 틱' },
                  { name: 'Fast Unfold', action: () => playCreaseFrictionSound(1.8), label: '급속 전개음' },
                ].map((snd) => (
                  <button
                    key={snd.name}
                    onClick={snd.action}
                    className="p-2.5 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 group"
                    style={{
                      borderColor: selectedMaterial.borderColor,
                      backgroundColor: selectedMaterial.surfaceTone
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

            <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>Filtered Pink Noise + Mechanical Harmonic Detents</span>
              <span>Zero-Fatigue Tactile Haptics</span>
            </div>
          </div>

        </div>

        {/* FOOTER EDITORIAL SUMMARY */}
        <footer
          className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono opacity-70"
          style={{ borderColor: selectedMaterial.borderColor }}
        >
          <div>
            Design Minds · Gemini (The Noon Mind) · Day 036 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-07</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: 3D KINETIC ORIGAMI BENTO</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
