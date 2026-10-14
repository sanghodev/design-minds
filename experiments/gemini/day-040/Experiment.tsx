import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';


// --- TYPES & INTERFACES ---
interface PhosphorSubstrate {
  id: string;
  name: string;
  nameKo: string;
  chemicalFormula: string;
  emissionWavelengthNm: number;
  decayHalfLifeSec: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  descKo: string;
}


interface PhosphorPreset {
  id: string;
  nameKo: string;
  uvIntensity: number; // 0 to 100%
  decayRateFactor: number;
  beamRadiusPx: number;
  descKo: string;
}


interface PhosphorNode {
  x: number;
  y: number;
  intensity: number; // 0.0 to 1.0
  lastExcitedTime: number;
}


const PHOSPHOR_SUBSTRATES: PhosphorSubstrate[] = [
  {
    id: 'strontium_aluminate_green',
    name: 'Strontium Aluminate (SrAl2O4:Eu,Dy)',
    nameKo: '스트론튬 알루미네이트 녹색 인광체',
    chemicalFormula: 'SrAl₂O₄ : Eu²⁺, Dy³⁺',
    emissionWavelengthNm: 520,
    decayHalfLifeSec: 18.4,
    surfaceTone: '#0B0C0E',
    cardTone: '#13151A',
    textColor: '#FAF8F5',
    subTextColor: '#9CA3AF',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: '#1F2937',
    descKo: '가장 강력한 잔광 휘도와 18초 이상의 반감기를 지녀, 자외선 조사 시 눈부신 에메랄드 녹색 발광과 깊은 공간적 잔상을 연출합니다.'
  },
  {
    id: 'europium_sky_cyan',
    name: 'Strontium Silicate Cyan (Sr4Al14O25:Eu,Dy)',
    nameKo: '유로퓸 스카이 시안 인광체',
    chemicalFormula: 'Sr₄Al₁₄O₂₅ : Eu²⁺, Dy³⁺',
    emissionWavelengthNm: 490,
    decayHalfLifeSec: 24.2,
    surfaceTone: '#080A0D',
    cardTone: '#10141C',
    textColor: '#F8FAFC',
    subTextColor: '#94A3B8',
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    borderColor: '#1E293B',
    descKo: '490nm의 맑고 서늘한 코발트 시안 광채를 방출하며, 24초에 달하는 최장 지연 감쇠 곡선으로 우아한 스위스 모더니즘 야광을 실증합니다.'
  },
  {
    id: 'zinc_sulfide_vintage',
    name: 'Copper-Doped Zinc Sulfide (ZnS:Cu)',
    nameKo: '클래식 황화아연 빈티지 인광체',
    chemicalFormula: 'ZnS : Cu⁺, Cl⁻',
    emissionWavelengthNm: 530,
    decayHalfLifeSec: 6.8,
    surfaceTone: '#0D0E10',
    cardTone: '#16181D',
    textColor: '#F3F4F6',
    subTextColor: '#A1A1AA',
    accentColor: '#84CC16',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    borderColor: '#27272A',
    descKo: '초기 20세기 시계 다이얼에 쓰이던 고전적 황록색 인광체로, 빠른 초기 감쇠와 묵직한 아날로그 웜톤의 암실 정취를 풍깁니다.'
  }
];


const PRESETS: PhosphorPreset[] = [
  {
    id: 'high_flux_uv_laser',
    nameKo: '고출력 365nm UV 레이저 모드',
    uvIntensity: 100,
    decayRateFactor: 0.8,
    beamRadiusPx: 42,
    descKo: '100% 강도의 자외선 빔이 포화 광자 밀도를 즉각 주입하여 최대 휘도와 서체 굵기 팽창을 유발합니다.'
  },
  {
    id: 'ambient_phosphor_twilight',
    nameKo: '박명 잔광 사색 모드 (Twilight)',
    uvIntensity: 45,
    decayRateFactor: 0.5,
    beamRadiusPx: 64,
    descKo: '부드러운 잔광이 은은하게 퍼지며 긴 반감기 동안 고요한 독서 환경을 형성합니다.'
  },
  {
    id: 'pulsed_strobe_saccade',
    nameKo: '펄스 스트로브 각인 모드',
    uvIntensity: 85,
    decayRateFactor: 1.2,
    beamRadiusPx: 28,
    descKo: '날카로운 초점의 펄스 빔이 독자의 시선 도약(Saccade) 궤적을 날렵한 빛의 칼날처럼 각인합니다.'
  },
  {
    id: 'thermal_quenched_dark',
    nameKo: '열 소광 완전 암시야 모드',
    uvIntensity: 0,
    decayRateFactor: 4.0,
    beamRadiusPx: 30,
    descKo: '모든 광자 준위가 바닥 상태로 소광되어 면도날처럼 날카로운 스위스 그로테스크 직립 평형으로 복귀합니다.'
  }
];


export default function PhosphorescentPersistentBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<PhosphorSubstrate>(PHOSPHOR_SUBSTRATES[0]);
  const [selectedPreset, setSelectedPreset] = useState<PhosphorPreset>(PRESETS[0]);
  const [uvIntensity, setUvIntensity] = useState<number>(85); // 0 to 100%
  const [beamRadius, setBeamRadius] = useState<number>(38); // 15 to 70px
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isQuenching, setIsQuenching] = useState<boolean>(false);
  const [penPos, setPenPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });


  // Average Luminance across Viewport
  const [averageLuminance, setAverageLuminance] = useState<number>(0.65);


  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPaintingRef = useRef<boolean>(false);
  const uvHumOscRef = useRef<OscillatorNode | null>(null);
  const uvHumGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<PhosphorNode[]>([]);
  const lastTimeRef = useRef<number>(performance.now());


  // Initialize Phosphorescent 2D Grid Nodes (24 x 18 = 432 points)
  useEffect(() => {
    const nodes: PhosphorNode[] = [];
    const cols = 28;
    const rows = 20;
    const w = 560;
    const h = 420;
    const dx = w / (cols - 1);
    const dy = h / (rows - 1);


    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: c * dx,
          y: r * dy,
          intensity: 0.0,
          lastExcitedTime: performance.now()
        });
      }
    }
    nodesRef.current = nodes;
  }, []);


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


  // Mechanical Camera Shutter Click Snap
  const playShutterClickSound = useCallback((intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1650, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);


    gain.gain.setValueAtTime(0.4 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }, [initAudio, isAudioMuted]);


  // Quartz Crystal Bell Chime upon Thermal Quenching
  const playCrystalBellSound = useCallback(() => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // Pure A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);


    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }, [initAudio, isAudioMuted]);


  // UV Excitation Charge Hum Drone
  const updateUvHum = useCallback((intensityPct: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    if (!uvHumOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);


      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();


      uvHumOscRef.current = osc;
      uvHumGainRef.current = gain;
    }


    const now = ctx.currentTime;
    const targetFreq = 90 + (intensityPct / 100) * 180; // 90Hz to 270Hz
    const targetGain = Math.min(0.05, (intensityPct / 100) * 0.05);


    uvHumOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.05);
    uvHumGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.05);
  }, [initAudio, isAudioMuted]);


  useEffect(() => {
    updateUvHum(uvIntensity);
    return () => {
      if (uvHumGainRef.current && audioCtxRef.current) {
        uvHumGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
      }
    };
  }, [uvIntensity, updateUvHum]);


  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  const dynamicFontWeight = useMemo(() => {
    // 300 (pure unexcited darkroom) up to 800 (100% photon saturation)
    return Math.min(800, Math.round(300 + averageLuminance * 500));
  }, [averageLuminance]);


  const dynamicGlowRadius = useMemo(() => {
    // Optical volumetric emission halo in pixels
    return Math.round(averageLuminance * 24);
  }, [averageLuminance]);


  // Thermal Quenching Trigger
  const handleThermalQuench = useCallback(() => {
    playShutterClickSound(1.3);
    playCrystalBellSound();
    setIsQuenching(true);


    // Reset all nodes
    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].intensity = 0.0;
    }
    setAverageLuminance(0.0);


    setTimeout(() => {
      setIsQuenching(false);
    }, 450);
  }, [playShutterClickSound, playCrystalBellSound]);


  // Preset Selection
  const handleSelectPreset = useCallback((preset: PhosphorPreset) => {
    setSelectedPreset(preset);
    setUvIntensity(preset.uvIntensity);
    setBeamRadius(preset.beamRadiusPx);
    playShutterClickSound(0.8);
  }, [playShutterClickSound]);


  // --- 2D CANVAS BECQUEREL DECAY SHADER SIMULATION (60FPS) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    let isRunning = true;


    const render = () => {
      if (!isRunning) return;


      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;


      const w = canvas.width;
      const h = canvas.height;


      // 1. Clear background
      ctx.fillStyle = selectedSubstrate.surfaceTone;
      ctx.fillRect(0, 0, w, h);


      // 2. Draw Subtle Precision Modular Grid
      ctx.strokeStyle = selectedSubstrate.borderColor;
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


      // 3. Compute Edmond Becquerel Power-Law Decay on Nodes
      // I(t) = I_0 / (1 + a * t)^m
      const nodes = nodesRef.current;
      let totalLuminance = 0;
      const penX = penPos.x * w;
      const penY = penPos.y * h;
      const radiusSq = beamRadius * beamRadius;
      const excitationRate = (uvIntensity / 100) * 2.5;


      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];


        // UV Excitation if painting or hovering near pen
        if (isPaintingRef.current) {
          const dx = node.x - penX;
          const dy = node.y - penY;
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq) {
            const factor = Math.max(0, 1 - Math.sqrt(distSq) / beamRadius);
            node.intensity = Math.min(1.0, node.intensity + factor * excitationRate * dt);
            node.lastExcitedTime = now;
          }
        }


        // Becquerel Decay: dI/dt ~ -a * I^1.2
        const decayConstant = 0.045 / (selectedSubstrate.decayHalfLifeSec / 15);
        node.intensity = Math.max(0.0, node.intensity - decayConstant * Math.pow(node.intensity, 1.15) * dt * 60);


        totalLuminance += node.intensity;
      }


      setAverageLuminance(nodes.length > 0 ? totalLuminance / nodes.length : 0);


      // 4. Render Volumetric Phosphor Glow Field
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.intensity > 0.02) {
          const glowGrad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, 22 * node.intensity);
          glowGrad.addColorStop(0, selectedSubstrate.accentColor);
          glowGrad.addColorStop(0.4, selectedSubstrate.glowColor);
          glowGrad.addColorStop(1, 'transparent');


          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 22 * node.intensity, 0, Math.PI * 2);
          ctx.fill();
        }
      }


      // 5. Draw UV Light-Pen Pointer Tip
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.arc(penX, penY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();


      // Pen Beam Radius Guide
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(penX, penY, beamRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);


      // Readout
      ctx.fillStyle = selectedSubstrate.textColor;
      ctx.font = '10px monospace';
      ctx.fillText(`λ: ${selectedSubstrate.emissionWavelengthNm}nm · Φ: ${uvIntensity}%`, penX + 12, penY - 12);


      requestAnimationFrame(render);
    };


    const animId = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [penPos, uvIntensity, beamRadius, selectedSubstrate]);


  // Handle Canvas Interaction
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));


    setPenPos({ x: nx, y: ny });
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
                Design Minds · Day 040 · 2026-10-11
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Phosphorescent Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Phosphorescent Persistent Bento & Becquerel Decay Shaders
            </h1>
          </div>
        </div>


        {/* Global Controls & Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Substrate Selector */}
          <div className="flex items-center rounded-lg border p-1" style={{ borderColor: selectedSubstrate.borderColor }}>
            {PHOSPHOR_SUBSTRATES.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubstrate(sub);
                  playShutterClickSound(1.0);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedSubstrate.id === sub.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSubstrate.id === sub.id ? selectedSubstrate.accentColor : 'transparent',
                  color: selectedSubstrate.id === sub.id ? '#0B0C0E' : selectedSubstrate.textColor
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
            <span>{isAudioMuted ? "🔇" : "🔮"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "UV HUM SOUND"}</span>
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
            <span className="hidden sm:inline">{isFullscreen ? "STANDARD" : "DARKROOM MODE"}</span>
          </button>
        </div>
      </header>


      {/* MAIN CONTAINER */}
      <main className={`w-full mx-auto p-4 md:p-8 transition-all ${isFullscreen ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* BENTO GRID ARCHITECTURE (6 INTERACTIVE MODULAR CELLS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative">


          {/* CELL 1: MONUMENTAL MONOGRAPH MASTHEAD (Span 8 Cols) */}
          <div
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-sm"
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
                  LUMINESCENCE: {Math.round(averageLuminance * 100)}%
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Half-Life: {selectedSubstrate.decayHalfLifeSec}s · Weight: {dynamicFontWeight}
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                BECQUEREL POWER-LAW DECAY
              </div>
            </div>


            {/* Display Typography with Volumetric Phosphor Emission */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Quantum Trapped Excitations & Becquerel Kinetics
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  color: averageLuminance > 0.2 ? selectedSubstrate.textColor : '#6B7280',
                  textShadow: averageLuminance > 0.1 ? `0 0 ${dynamicGlowRadius}px ${selectedSubstrate.glowColor}` : 'none',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Phosphorescent Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                단조로운 야광 노벨티 클리셰를 극복하고, 양자 트랩 준위 동역학과 베크렐 멱법칙 감쇠 셰이더(I(t) = I₀ / (1+at)ᵐ)를 스위스 벤토 그리드 건축에 전격 이식한 살아 숨 쉬는 암시야 파빌리온.
              </p>
            </div>


            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">CRYSTAL:</strong> {selectedSubstrate.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">EMISSION:</strong> {selectedSubstrate.emissionWavelengthNm} nm
                </span>
                <span>
                  <strong className="opacity-50">FORMULA:</strong> {selectedSubstrate.chemicalFormula}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Volumetric Glow:</span>
                <strong style={{ color: selectedSubstrate.accentColor }}>{dynamicGlowRadius}px Radius</strong>
              </div>
            </div>
          </div>


          {/* CELL 2: UV INSCRIBER CONTROLS & THERMAL QUENCH SWITCH (Span 4 Cols) */}
          <div
            className="md:col-span-4 rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative transition-all duration-300"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  UV Light-Pen Inscription
                </span>
                <span className="text-xs font-mono font-bold text-violet-400">
                  365nm ({uvIntensity}%)
                </span>
              </div>


              {/* UV Photon Flux Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Photon Flux Intensity (Φ)</span>
                  <span>{uvIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={uvIntensity}
                  onChange={(e) => setUvIntensity(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>


              {/* Beam Radius Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Beam Focus Aperture</span>
                  <span>{beamRadius} px</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={70}
                  value={beamRadius}
                  onChange={(e) => setBeamRadius(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>


              {/* THERMAL QUENCHING BUTTON */}
              <div className="mb-4">
                <button
                  onClick={handleThermalQuench}
                  className={`w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isQuenching ? 'bg-red-600 text-white border-red-700 scale-95' : 'hover:bg-red-500/10 hover:border-red-500 text-red-500'
                  }`}
                  style={{ borderColor: isQuenching ? '#EF4444' : selectedSubstrate.borderColor }}
                >
                  <span>🔥</span>
                  <span>INFRARED THERMAL QUENCH (RESET)</span>
                </button>
              </div>


              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Excitation Presets
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
                      <div className="text-[10px] opacity-60 truncate">Φ: {p.uvIntensity}%</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>


            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              💡 캔버스 위를 클릭·드래그하여 자외선 광자 잔광을 직접 각인하세요.
            </div>
          </div>


          {/* CELL 3: 2D BECQUEREL DECAY SHADER CANVAS (Span 7 Cols) */}
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
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor,
              transform: `perspective(1000px) rotateX(${stageTilt.x}deg) rotateY(${stageTilt.y}deg)`
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  2D Becquerel Phosphor Lattice
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                  560 Node Quantum Matrix
                </span>
              </div>


              {/* Reset Pen */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setPenPos({ x: 0.5, y: 0.5 });
                    playShutterClickSound(0.8);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-white/5"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  Center Pen
                </button>
              </div>
            </div>


            {/* Interactive Canvas */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border my-2 shadow-inner" style={{ borderColor: selectedSubstrate.borderColor }}>
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block cursor-crosshair"
                onMouseDown={(e) => {
                  isPaintingRef.current = true;
                  handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (isPaintingRef.current || e.buttons === 1) {
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }
                }}
                onMouseUp={() => { isPaintingRef.current = false; }}
                onMouseLeave={() => { isPaintingRef.current = false; }}
                onTouchStart={(e) => {
                  isPaintingRef.current = true;
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={() => { isPaintingRef.current = false; }}
              />


              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedSubstrate.cardTone + 'E6',
                  borderColor: selectedSubstrate.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedSubstrate.accentColor }} />
                <span>Becquerel Decay: <strong>I(t) = I₀ / (1+at)ᵐ</strong></span>
              </div>
            </div>


            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>DRAG 365NM LIGHT PEN ACROSS LATTICE</span>
              <span>Edmond Becquerel 1867 Photophysics</span>
            </div>
          </div>


          {/* CELL 4: LUMINESCENCE-COUPLED VARIABLE TYPOGRAPHY (Span 5 Cols) */}
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
                  Photon-Excited Typography
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
                  Axiom 40 Photonic Latency
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    color: averageLuminance > 0.15 ? selectedSubstrate.textColor : '#6B7280',
                    textShadow: averageLuminance > 0.1 ? `0 0 ${dynamicGlowRadius * 0.8}px ${selectedSubstrate.glowColor}` : 'none',
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "Light does not merely illuminate; in phosphorescent crystals, it lingers as an authentic memory of touch."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  광자 밀도가 상승함에 따라 글자는 에너지를 머금고 굵기(wght: 300 → 800)와 광학적 입체 헤일로를 팽창시키며, 시간이 흐르면 베크렐 감쇠에 따라 서서히 차분한 스위스 그로테스크의 침묵으로 회귀합니다.
                </div>
              </div>


              {/* Weight & Decay Axis Inspectors */}
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
                    <span>Volumetric Emission Glow</span>
                    <span>{dynamicGlowRadius}px / 24px</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${(dynamicGlowRadius / 24) * 100}%`,
                        backgroundColor: selectedSubstrate.accentColor
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>QUANTUM TRAP STATES</span>
              <span>METASTABLE PHOTON EMISSION</span>
            </div>
          </div>


          {/* CELL 5: PHOSPHOR CRYSTAL SPECIFICATIONS (Span 6 Cols) */}
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
                  Phosphor Crystal Specifications
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
                  <div className="text-[10px] opacity-60">EMISSION PEAK</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.emissionWavelengthNm}</div>
                  <div className="text-[10px] opacity-50">Nanometers</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">HALF-LIFE (t_1/2)</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.decayHalfLifeSec}s</div>
                  <div className="text-[10px] opacity-50">Becquerel Pacing</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">TRAP STATE</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: selectedSubstrate.accentColor }}>
                    {averageLuminance > 0.1 ? 'EXCITED' : 'GROUND'}
                  </div>
                  <div className="text-[10px] opacity-50">{Math.round(averageLuminance * 100)}% Saturation</div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span className="opacity-60">SPECTRAL RETARDATION RESOLVED</span>
              <span className="font-bold text-violet-400">
                PHOTONIC PERSISTENCE ACTIVE
              </span>
            </div>
          </div>


          {/* CELL 6: TACTILE DARKROOM SOUNDBOARD (Span 6 Cols) */}
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
                  Tactile Darkroom Acoustics
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>


              <p className="text-xs font-sans opacity-70 mb-4">
                기계식 포컬플레인 카메라 셔터 틱음, UV 광자 여기 전하 험, 그리고 열 소광 시의 맑고 영롱한 880Hz 석영 수정 차임을 연주하세요.
              </p>


              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Shutter Click', action: () => playShutterClickSound(1.4), label: '카메라 셔터' },
                  { name: 'Crystal Chime', action: playCrystalBellSound, label: '석영 벨 차임' },
                  { name: 'UV Charge 100%', action: () => { setUvIntensity(100); playShutterClickSound(0.8); }, label: '최대 광자 펄스' },
                  { name: 'Thermal Quench', action: handleThermalQuench, label: '열 소광 리셋' },
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
                    <div className="text-xs font-mono font-bold group-hover:text-emerald-400 transition-colors">
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
              <span>Mechanical Shutter Snaps + 880Hz Quartz Bell Chimes</span>
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
            Design Minds · Gemini (The Noon Mind) · Day 040 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-11</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: PHOSPHORESCENT BENTO</span>
          </div>
        </footer>


      </main>
    </div>
  );
}
