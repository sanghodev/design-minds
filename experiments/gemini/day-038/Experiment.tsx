import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';


// --- TYPES & INTERFACES ---
interface MagneticMaterial {
  id: string;
  name: string;
  nameKo: string;
  remanenceTesla: number;
  coercivityKaM: number;
  energyProductMgoe: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  fluxStreamline: string;
  descKo: string;
}


interface PolarityPreset {
  id: string;
  nameKo: string;
  actuatorGauss: number;
  polarity: 'N' | 'S' | 'N-S';
  descKo: string;
}


const MATERIALS: MagneticMaterial[] = [
  {
    id: 'sintered_ndfeb',
    name: 'Sintered Neodymium-Iron-Boron (NdFeB)',
    nameKo: '소결 네오디뮴-철-붕소 자석',
    remanenceTesla: 1.42,
    coercivityKaM: 955,
    energyProductMgoe: 52,
    surfaceTone: '#141312',
    cardTone: '#1E1C1A',
    textColor: '#FAF8F5',
    subTextColor: '#A8A29E',
    accentColor: '#00F0FF',
    borderColor: '#2E2B28',
    fluxStreamline: '#00F0FF',
    descKo: '1.42 테슬라의 압도적 잔류자속밀도를 지녀, 카드 간의 결착력이 극도로 강하며 면도날처럼 날카로운 사이버 에디토리얼 금속성을 연출합니다.'
  },
  {
    id: 'ceramic_ferrite',
    name: 'Ceramic Strontium Ferrite',
    nameKo: '세라믹 스트론튬 페라이트',
    remanenceTesla: 0.41,
    coercivityKaM: 275,
    energyProductMgoe: 4.5,
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    accentColor: '#2563EB',
    borderColor: '#E7E2DA',
    fluxStreamline: '#2563EB',
    descKo: '상아빛 세라믹 소지에 부드러운 자화율을 지녀, 코발트 블루 자속선과 함께 정갈하고 따뜻한 스위스 모더니즘의 평형을 형성합니다.'
  },
  {
    id: 'high_perm_mumetal',
    name: 'High-Permeability Mu-Metal',
    nameKo: '고투자율 뮤메탈 차폐 합금',
    remanenceTesla: 0.75,
    coercivityKaM: 1.2,
    energyProductMgoe: 12,
    surfaceTone: '#F4EFEA',
    cardTone: 'rgba(255, 255, 255, 0.95)',
    textColor: '#1A1918',
    subTextColor: '#64748B',
    accentColor: '#DC2626',
    borderColor: '#E2DBD0',
    fluxStreamline: '#DC2626',
    descKo: '자력선을 흡수하여 내부를 보호하는 전자기 차폐 특성을 모사하여, 붉은 테라코타 자력선과 깊은 공간적 안도감을 자아냅니다.'
  }
];


const PRESETS: PolarityPreset[] = [
  {
    id: 'north_repulsion',
    nameKo: 'N극 발산 척력 모드 (North Divergence)',
    actuatorGauss: 95,
    polarity: 'N',
    descKo: '강력한 N극이 카드를 바깥으로 밀어내며 방사형 자속선을 형성합니다.'
  },
  {
    id: 'south_attraction',
    nameKo: 'S극 수렴 인력 모드 (South Convergence)',
    actuatorGauss: 95,
    polarity: 'S',
    descKo: '수렴하는 S극이 주변 카드들을 중심점으로 자석처럼 결착시킵니다.'
  },
  {
    id: 'quadrupole_loop',
    nameKo: '4중극자 와류 루프 (Quadrupole Loop)',
    actuatorGauss: 110,
    polarity: 'N-S',
    descKo: 'N극과 S극이 회전 와류를 일으키며 벤토 카드를 궤도 회전 정렬시킵니다.'
  },
  {
    id: 'earth_baseline',
    nameKo: '지자기 평형 모드 (Earth Field 0.5G)',
    actuatorGauss: 5,
    polarity: 'N',
    descKo: '0.5 가우스의 미세 지자기장 속에서 요제프 뮐러-브로크만의 절대적 평면 평형으로 안착합니다.'
  }
];


export default function LorentzMagneticBentoExperiment() {
  // --- STATE ---
  const [selectedMaterial, setSelectedMaterial] = useState<MagneticMaterial>(MATERIALS[1]); // Default Ceramic Ferrite (Swiss Ivory)
  const [selectedPreset, setSelectedPreset] = useState<PolarityPreset>(PRESETS[0]);
  const [actuatorGauss, setActuatorGauss] = useState<number>(95); // 0 to 120 Gauss
  const [actuatorPolarity, setActuatorPolarity] = useState<'N' | 'S'>('N');
  const [actuatorPos, setActuatorPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [streamlineDensity, setStreamlineDensity] = useState<number>(18); // 8 to 32 lines


  // Card Magnetic Repulsion Displacements
  const [cardOffset1, setCardOffset1] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cardOffset2, setCardOffset2] = useState<{ x: number; y: number }>({ x: 0, y: 0 });


  // 3D Perspective Tilt on Stage
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });


  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingActuatorRef = useRef<boolean>(false);
  const inductionHumOscRef = useRef<OscillatorNode | null>(null);
  const inductionHumGainRef = useRef<GainNode | null>(null);


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


  // Crisp neodymium mechanical snap click
  const playMagneticSnapSound = useCallback((intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1250, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);


    gain.gain.setValueAtTime(0.35 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [initAudio, isAudioMuted]);


  // Electromagnetic induction hum pitch sweep
  const updateInductionHum = useCallback((gauss: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    if (!inductionHumOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);


      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();


      inductionHumOscRef.current = osc;
      inductionHumGainRef.current = gain;
    }


    const now = ctx.currentTime;
    const targetFreq = 55 + (gauss / 120) * 165; // 55Hz to 220Hz
    const targetGain = Math.min(0.08, (gauss / 120) * 0.08);


    inductionHumOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.05);
    inductionHumGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.05);
  }, [initAudio, isAudioMuted]);


  useEffect(() => {
    updateInductionHum(actuatorGauss);
    return () => {
      if (inductionHumGainRef.current && audioCtxRef.current) {
        inductionHumGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
      }
    };
  }, [actuatorGauss, updateInductionHum]);


  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  // Magnetic field intensity at card 1 center
  const card1CenterDist = useMemo(() => {
    const dx = actuatorPos.x - 0.35;
    const dy = actuatorPos.y - 0.4;
    return Math.max(0.08, Math.sqrt(dx * dx + dy * dy));
  }, [actuatorPos]);


  const localBFlux = useMemo(() => {
    return Math.round((actuatorGauss / Math.pow(card1CenterDist * 2.5, 2)));
  }, [actuatorGauss, card1CenterDist]);


  const dynamicFontWeight = useMemo(() => {
    // Weight swells from 400 up to 800 in high flux
    return Math.min(800, Math.round(400 + Math.tanh(localBFlux / 80) * 400));
  }, [localBFlux]);


  const dynamicFontSlant = useMemo(() => {
    // Slant inclines up to -12° along field vector
    const dx = actuatorPos.x - 0.35;
    const dy = actuatorPos.y - 0.4;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const sign = actuatorPolarity === 'N' ? -1 : 1;
    return Math.round(Math.max(-12, Math.min(12, (angle / 180) * 12 * sign)));
  }, [actuatorPos, actuatorPolarity]);


  // --- 2D CANVAS MAGNETIC VECTOR FIELD SIMULATION ---
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
      ctx.fillStyle = selectedMaterial.surfaceTone;
      ctx.fillRect(0, 0, w, h);


      // 2. Draw Subterranean Coordinate Grid
      ctx.strokeStyle = selectedMaterial.borderColor;
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


      // 3. Render 400 Ferromagnetic Vector Compasses (20x20 Grid)
      const cols = 20;
      const rows = 15;
      const ax = actuatorPos.x * w;
      const ay = actuatorPos.y * h;
      const mPol = actuatorPolarity === 'N' ? 1 : -1;
      const gFactor = actuatorGauss / 100;


      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c + 0.5) / cols;
          const ny = (r + 0.5) / rows;
          const px = nx * w;
          const py = ny * h;


          const dx = px - ax;
          const dy = py - ay;
          const dist = Math.max(25, Math.sqrt(dx * dx + dy * dy));


          // Dipole field B(r) vector direction
          const angle = Math.atan2(dy, dx) + (mPol === 1 ? 0 : Math.PI);
          const needleLen = Math.min(14, Math.max(6, (120 / dist) * 12 * gFactor));


          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);


          // Draw North (Red) and South (Blue) needle poles
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#DC2626'; // North tip
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(needleLen, 0);
          ctx.stroke();


          ctx.strokeStyle = '#2563EB'; // South tail
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-needleLen * 0.7, 0);
          ctx.stroke();


          ctx.restore();
        }
      }


      // 4. Render Magnetic Flux Streamlines radiating from Actuator
      ctx.strokeStyle = selectedMaterial.fluxStreamline;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.65;


      for (let s = 0; s < streamlineDensity; s++) {
        const theta0 = (s / streamlineDensity) * Math.PI * 2;
        ctx.beginPath();
        let curX = ax + Math.cos(theta0) * 20;
        let curY = ay + Math.sin(theta0) * 20;
        ctx.moveTo(curX, curY);


        for (let stepIdx = 0; stepIdx < 45; stepIdx++) {
          const rdx = curX - ax;
          const rdy = curY - ay;
          const rdist = Math.max(10, Math.sqrt(rdx * rdx + rdy * rdy));
          const stepAngle = Math.atan2(rdy, rdx) + (mPol === 1 ? 0.08 : -0.08);


          curX += Math.cos(stepAngle) * 8 * mPol;
          curY += Math.sin(stepAngle) * 8 * mPol;


          ctx.lineTo(curX, curY);
          if (curX < 0 || curX > w || curY < 0 || curY > h) break;
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;


      // 5. Draw Actuator Magnet Core on Canvas
      ctx.save();
      ctx.translate(ax, ay);


      // Magnetic Glow Aura
      const glowR = 25 + (actuatorGauss / 120) * 25;
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, glowR);
      grad.addColorStop(0, actuatorPolarity === 'N' ? 'rgba(220, 38, 38, 0.45)' : 'rgba(37, 99, 235, 0.45)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();


      // Physical Actuator Ring
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = actuatorPolarity === 'N' ? '#DC2626' : '#2563EB';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();


      // Polarity Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(actuatorPolarity, 0, 0);


      ctx.restore();


      // 6. Draw Field Calibration Text
      ctx.fillStyle = selectedMaterial.accentColor;
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillText(`[LORENTZ VECTOR FIELD: B=${actuatorGauss} GAUSS (${actuatorPolarity}-POLE)]`, 24, 38);


      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillStyle = selectedMaterial.textColor;
      ctx.fillText("B(r) = (μ₀/4π) · (1/r³) · [3(m·r̂)r̂ - m] · Magnetic Dipole Law", 24, 60);
      ctx.fillText(`LOCAL FLUX DENSITY: ${localBFlux} G · F_LORENTZ ∝ 1/r²`, 24, 80);


      animFrameRef.current = requestAnimationFrame(render);
    };


    render();


    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [actuatorPos, actuatorPolarity, actuatorGauss, selectedMaterial, streamlineDensity, localBFlux]);


  // Handle Preset Change
  const handleSelectPreset = (preset: PolarityPreset) => {
    setSelectedPreset(preset);
    setActuatorGauss(preset.actuatorGauss);
    if (preset.polarity !== 'N-S') {
      setActuatorPolarity(preset.polarity);
    }
    playMagneticSnapSound(1.2);
  };


  // Canvas Mouse Dragging of Neodymium Actuator
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0.08, Math.min(0.92, (clientX - rect.left) / rect.width));
    const ny = Math.max(0.08, Math.min(0.92, (clientY - rect.top) / rect.height));


    setActuatorPos({ x: nx, y: ny });


    // Dynamic magnetic repulsion pushing cards
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    const repX = (dx > 0 ? -1 : 1) * Math.min(22, (actuatorGauss / 120) * 24);
    const repY = (dy > 0 ? -1 : 1) * Math.min(22, (actuatorGauss / 120) * 24);


    setCardOffset1({ x: repX, y: repY });
    setCardOffset2({ x: -repX * 0.7, y: -repY * 0.7 });


    if (Math.random() < 0.25) {
      playMagneticSnapSound(0.5);
    }
  };


  return (
    <div
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
            className="w-3.5 h-3.5 rounded-full animate-ping"
            style={{ backgroundColor: actuatorPolarity === 'N' ? '#DC2626' : '#2563EB' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 038 · 2026-10-09
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedMaterial.accentColor + '22',
                  color: selectedMaterial.accentColor
                }}
              >
                Lorentz Magnetic Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Lorentz Magnetic Bento & Ferromagnetic Vector Shaders
            </h1>
          </div>
        </div>


        {/* Global Controls & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Substrate Selector */}
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: selectedMaterial.borderColor }}>
            {MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  playMagneticSnapSound(1.0);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedMaterial.id === mat.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedMaterial.id === mat.id ? selectedMaterial.accentColor : 'transparent',
                  color: selectedMaterial.id === mat.id ? (selectedMaterial.id === 'sintered_ndfeb' ? '#141312' : '#FFFFFF') : selectedMaterial.textColor
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
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "COIL SOUND"}</span>
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
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 shadow-sm"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor,
              transform: `translate(${cardOffset1.x}px, ${cardOffset1.y}px)`
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                  MAGNETIC FLUX: {localBFlux} GAUSS
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Polarity: {actuatorPolarity} · Slant: {dynamicFontSlant}°
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                2D LORENTZ VECTOR FIELD
              </div>
            </div>


            {/* Giant Display Typography with Magnetic Slant & Weight Swelling */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Dipole Field Curvature & Kinetic Snapping
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  transform: `skewX(${dynamicFontSlant}deg)`,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Lorentz Magnetic Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedMaterial.subTextColor }}>
                혼돈의 액체 가시돌기 클리셰를 폐기하고, 2차원 자기 쌍극자 벡터장과 역제곱 인력·척력(F ∝ 1/r²)을 스위스 벤토 그리드에 이식한 살아 숨 쉬는 전자기 에디토리얼 파빌리온.
              </p>
            </div>


            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">SUBSTRATE:</strong> {selectedMaterial.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">REMANENCE:</strong> {selectedMaterial.remanenceTesla} Tesla
                </span>
                <span>
                  <strong className="opacity-50">COERCIVITY:</strong> {selectedMaterial.coercivityKaM} kA/m
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Vector Weight:</span>
                <strong className="text-blue-600">wght: {dynamicFontWeight}</strong>
              </div>
            </div>
          </div>


          {/* CELL 2: MAGNETIC ACTUATOR & POLARITY CONTROLS (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative transition-transform duration-200"
            style={{
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor,
              transform: `translate(${cardOffset2.x}px, ${cardOffset2.y}px)`
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Magnetic Actuator Knobs
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: actuatorPolarity === 'N' ? '#DC2626' : '#2563EB' }}>
                  {actuatorGauss} G ({actuatorPolarity})
                </span>
              </div>


              {/* Gauss Intensity Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Magnetic Field Strength (B)</span>
                  <span>{actuatorGauss} Gauss</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  value={actuatorGauss}
                  onChange={(e) => setActuatorGauss(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>


              {/* Polarity Switcher (North vs South) */}
              <div className="mb-4">
                <div className="text-xs font-mono mb-1.5 opacity-70">Actuator Polarity</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      setActuatorPolarity('N');
                      playMagneticSnapSound(1.0);
                    }}
                    className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      actuatorPolarity === 'N' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ borderColor: actuatorPolarity === 'N' ? '#DC2626' : selectedMaterial.borderColor }}
                  >
                    <span>🔴</span>
                    <span>NORTH (N)</span>
                  </button>
                  <button
                    onClick={() => {
                      setActuatorPolarity('S');
                      playMagneticSnapSound(1.0);
                    }}
                    className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      actuatorPolarity === 'S' ? 'bg-blue-600 text-white border-blue-700 shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ borderColor: actuatorPolarity === 'S' ? '#2563EB' : selectedMaterial.borderColor }}
                  >
                    <span>🔵</span>
                    <span>SOUTH (S)</span>
                  </button>
                </div>
              </div>


              {/* Streamline Density Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Flux Streamline Density</span>
                  <span>{streamlineDensity} Lines</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={streamlineDensity}
                  onChange={(e) => setStreamlineDensity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>


              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Dipole Field Presets
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
                      <div className="text-[10px] opacity-60 truncate">{p.actuatorGauss}G · {p.polarity}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>


            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              💡 캔버스 위의 자석 코어를 드래그하여 전자기장을 직접 연주하세요.
            </div>
          </div>


          {/* CELL 3: 2D MAGNETIC VECTOR CANVAS VIEWPORT (Span 7 Cols) */}
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
              backgroundColor: selectedMaterial.cardTone,
              borderColor: selectedMaterial.borderColor,
              transform: `perspective(1000px) rotateX(${stageTilt.x}deg) rotateY(${stageTilt.y}deg)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedMaterial.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  2D Magnetic Dipole Vector Field
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">
                  400 Compass Needles
                </span>
              </div>


              {/* Viewport Reset */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setActuatorPos({ x: 0.5, y: 0.5 });
                    setCardOffset1({ x: 0, y: 0 });
                    setCardOffset2({ x: 0, y: 0 });
                    playMagneticSnapSound(1.0);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedMaterial.borderColor }}
                >
                  Center Magnet
                </button>
              </div>
            </div>


            {/* Interactive Vector Canvas */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: selectedMaterial.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => {
                  isDraggingActuatorRef.current = true;
                  handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (isDraggingActuatorRef.current || e.buttons === 1) {
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }
                }}
                onMouseUp={() => { isDraggingActuatorRef.current = false; }}
                onMouseLeave={() => { isDraggingActuatorRef.current = false; }}
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
                  backgroundColor: selectedMaterial.cardTone + 'E6',
                  borderColor: selectedMaterial.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Lorentz Force F: <strong>{(localBFlux * 0.12).toFixed(2)} N/m</strong></span>
              </div>
            </div>


            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>DRAG NEODYMIUM ACTUATOR ACROSS FIELD</span>
              <span>B(r) = (μ₀/4πr³)·[3(m·r̂)r̂ - m]</span>
            </div>
          </div>


          {/* CELL 4: FLUX-COUPLED TYPOGRAPHIC MONOGRAPH (Span 5 Cols) */}
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
                  Flux-Saturated Variable Text
                </span>
                <span className="text-xs font-mono font-bold text-blue-600">
                  wght: {dynamicFontWeight}
                </span>
              </div>


              <div
                className="p-4 rounded-xl border mb-4 relative overflow-hidden"
                style={{
                  borderColor: selectedMaterial.borderColor,
                  backgroundColor: selectedMaterial.surfaceTone
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-widest block mb-2 opacity-50">
                  Axiom 38 Magnetic Polarity
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    transform: `skewX(${dynamicFontSlant}deg)`,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "The line of force is the invisible skeleton upon which matter gracefully rests."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  자속 밀도가 높아질수록 글자는 물리적 질량을 흡수하여 굵기(wght: 400 → 800)를 팽창시키고, 자력선 접선 각도({dynamicFontSlant}°)를 따라 자연스럽게 기울어집니다.
                </div>
              </div>


              {/* Stress Retardation Axis Inspector */}
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
                        width: `${((dynamicFontWeight - 400) / 400) * 100}%`,
                        backgroundColor: selectedMaterial.accentColor
                      }}
                    />
                  </div>
                </div>


                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Field Vector Slant Angle</span>
                    <span>{dynamicFontSlant}° / 12°</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (Math.abs(dynamicFontSlant) / 12) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>MICHAEL FARADAY</span>
              <span>1831 ELECTROMAGNETIC LINES</span>
            </div>
          </div>


          {/* CELL 5: MAGNETIC SUBSTRATE SPECIFICATIONS (Span 6 Cols) */}
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
                  Magnetic Material Specifications
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
                  <div className="text-[10px] opacity-60">REMANENCE (B_r)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.remanenceTesla}</div>
                  <div className="text-[10px] opacity-50">Tesla</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">COERCIVITY (H_c)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.coercivityKaM}</div>
                  <div className="text-[10px] opacity-50">kA/m</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedMaterial.borderColor }}>
                  <div className="text-[10px] opacity-60">ENERGY (BH_max)</div>
                  <div className="text-base font-bold mt-0.5">{selectedMaterial.energyProductMgoe}</div>
                  <div className="text-[10px] opacity-50">MGOe</div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedMaterial.borderColor }}>
              <span className="opacity-60">TANGIBLE FORCE FIELDS</span>
              <span className="font-bold" style={{ color: selectedMaterial.accentColor }}>
                DIPOLE EQUILIBRIUM RESOLVED
              </span>
            </div>
          </div>


          {/* CELL 6: TACTILE ELECTROMAGNETIC SOUNDBOARD (Span 6 Cols) */}
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
                  Tactile Induction Acoustics
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>


              <p className="text-xs font-sans opacity-70 mb-4">
                가우스 자기장 세기에 비례하는 유도 코일 험, 쇳가루 자침들의 회전 마찰음, 그리고 카드 결착 시의 묵직한 네오디뮴 클릭음을 연주하세요.
              </p>


              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'NdFeB Snap', action: () => playMagneticSnapSound(1.4), label: '네오디뮴 결착음' },
                  { name: 'Ferrite Clack', action: () => playMagneticSnapSound(0.8), label: '페라이트 틱' },
                  { name: 'Coil Surge', action: () => updateInductionHum(120), label: '코일 서지 험' },
                  { name: 'Zero Field', action: () => updateInductionHum(5), label: '지자기 기저음' },
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


            <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono opacity-60" style={{ borderColor: selectedMaterial.borderColor }}>
              <span>Low-Frequency Induction Hum + Mechanical Magnetic Snaps</span>
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
            Design Minds · Gemini (The Noon Mind) · Day 038 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-09</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: LORENTZ MAGNETIC BENTO</span>
          </div>
        </footer>


      </main>
    </div>
  );
}
