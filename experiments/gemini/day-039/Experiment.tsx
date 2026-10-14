import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';


// --- TYPES & INTERFACES ---
interface DielectricSubstrate {
  id: string;
  name: string;
  nameKo: string;
  permittivity: number; // Dielectric constant (epsilon_r)
  breakdownKv: number;
  surfaceTone: string;
  cardTone: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  descKo: string;
}


interface ElectrostaticPreset {
  id: string;
  nameKo: string;
  voltageKv: number;
  chargePolarity: '+' | '-';
  tonerDensity: number;
  descKo: string;
}


interface TonerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  charge: number;
}


const SUBSTRATES: DielectricSubstrate[] = [
  {
    id: 'selenium_photoconductor',
    name: 'Amorphous Vitreous Selenium (a-Se)',
    nameKo: '비정질 셀레늄 감광체',
    permittivity: 6.3,
    breakdownKv: 55,
    surfaceTone: '#121110',
    cardTone: '#1C1A18',
    textColor: '#FAF8F5',
    subTextColor: '#A8A29E',
    accentColor: '#F59E0B',
    borderColor: '#2E2B27',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    descKo: '체스터 칼슨의 1938년 제로그라피 원형 감광체로, 어둠 속에서 높은 정전 전하를 유지하며 황색 이온화 광채를 발산합니다.'
  },
  {
    id: 'porcelain_dielectric',
    name: 'Glazed Porcelain Dielectric',
    nameKo: '순백 자기 유전체 세라믹',
    permittivity: 8.5,
    breakdownKv: 40,
    surfaceTone: '#FAF8F5',
    cardTone: '#FFFFFF',
    textColor: '#141312',
    subTextColor: '#57534E',
    accentColor: '#8B5CF6',
    borderColor: '#E7E2DA',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    descKo: '상아빛 포슬린 세라믹의 높은 유전율과 고요한 스위스 모더니즘 백색 소지가 결합되어 우아한 보랏빛 등전위선을 연출합니다.'
  },
  {
    id: 'teflon_triboelectric',
    name: 'PTFE Teflon Polymer Matrix',
    nameKo: '고분자 PTFE 테플론 막',
    permittivity: 2.1,
    breakdownKv: 60,
    surfaceTone: '#F3EFEA',
    cardTone: 'rgba(255, 255, 255, 0.96)',
    textColor: '#181716',
    subTextColor: '#64748B',
    accentColor: '#10B981',
    borderColor: '#DED6CB',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    descKo: '마찰 전기 서열의 최하단에 위치하여 극단적인 음전하를 형성하며, 에메랄드 접지선과 함께 단단한 물질적 안정감을 부여합니다.'
  }
];


const PRESETS: ElectrostaticPreset[] = [
  {
    id: 'high_charge_corona',
    nameKo: '고전압 코로나 대전 모드 (52 kV)',
    voltageKv: 52,
    chargePolarity: '+',
    tonerDensity: 280,
    descKo: '52 kV의 고전압 잠상이 강력한 쿨롱 인력으로 토너를 결착시키고 서체를 굵게 팽창시킵니다.'
  },
  {
    id: 'gentle_friction',
    nameKo: '미세 마찰 분극 모드 (18 kV)',
    voltageKv: 18,
    chargePolarity: '+',
    tonerDensity: 120,
    descKo: '18 kV의 섬세한 표면 전위가 스위스 국제주의 그리드 위에서 부드러운 자간 확장을 유도합니다.'
  },
  {
    id: 'negative_saturation',
    nameKo: '음전하 포화 모드 (-45 kV)',
    voltageKv: 45,
    chargePolarity: '-',
    tonerDensity: 240,
    descKo: '역방향 음전하 필드가 쿨롱 척력을 발생시키며 외곽으로 토너 입자를 방사형 확산시킵니다.'
  },
  {
    id: 'ground_equilibrium',
    nameKo: '접지 완전 방전 모드 (0 kV)',
    voltageKv: 0,
    chargePolarity: '+',
    tonerDensity: 20,
    descKo: '모든 전하가 접지로 방전되어 완벽한 스위스 모더니즘의 정적과 직립 baseline으로 회귀합니다.'
  }
];


export default function TriboelectricElectrostaticBentoExperiment() {
  // --- STATE ---
  const [selectedSubstrate, setSelectedSubstrate] = useState<DielectricSubstrate>(SUBSTRATES[1]); // Porcelain default
  const [selectedPreset, setSelectedPreset] = useState<ElectrostaticPreset>(PRESETS[0]);
  const [surfaceVoltageKv, setSurfaceVoltageKv] = useState<number>(45); // 0 to 60 kV
  const [polarity, setPolarity] = useState<'+' | '-'>('+');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isGroundEngaged, setIsGroundEngaged] = useState<boolean>(false);
  const [frictionWandPos, setFrictionWandPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [stageTilt, setStageTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });


  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  const coronaHissOscRef = useRef<OscillatorNode | null>(null);
  const coronaHissGainRef = useRef<GainNode | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });


  // 300 Toner Particles Array
  const particlesRef = useRef<TonerParticle[]>([]);


  // Initialize Particles
  useEffect(() => {
    const p: TonerParticle[] = [];
    for (let i = 0; i < 300; i++) {
      p.push({
        x: Math.random() * 560,
        y: Math.random() * 420,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.4 + Math.random() * 0.5,
        charge: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.5)
      });
    }
    particlesRef.current = p;
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


  // Crisp Capacitor Spark Snap Sound
  const playCapacitorSparkSound = useCallback((intensity: number = 1.0) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();


    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1850, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);


    gain.gain.setValueAtTime(0.4 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);


    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [initAudio, isAudioMuted]);


  // High-voltage Ionization Corona Hiss
  const updateCoronaHiss = useCallback((voltage: number) => {
    if (isAudioMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;


    if (!coronaHissOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);


      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();


      coronaHissOscRef.current = osc;
      coronaHissGainRef.current = gain;
    }


    const now = ctx.currentTime;
    const targetFreq = 120 + (voltage / 60) * 240; // 120Hz to 360Hz harmonic buzz
    const targetGain = Math.min(0.06, (voltage / 60) * 0.06);


    coronaHissOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.05);
    coronaHissGainRef.current?.gain.setTargetAtTime(targetGain, now, 0.05);
  }, [initAudio, isAudioMuted]);


  useEffect(() => {
    updateCoronaHiss(surfaceVoltageKv);
    return () => {
      if (coronaHissGainRef.current && audioCtxRef.current) {
        coronaHissGainRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.05);
      }
    };
  }, [surfaceVoltageKv, updateCoronaHiss]);


  // --- KINETIC VARIABLE TYPOGRAPHY FORMULAS ---
  const dynamicFontWeight = useMemo(() => {
    // 350 (zero field) up to 800 (60 kV saturation)
    return Math.min(800, Math.round(350 + (surfaceVoltageKv / 60) * 450));
  }, [surfaceVoltageKv]);


  const dynamicTracking = useMemo(() => {
    // Expands tracking up to +0.06em under electrostatic charge repulsion
    return (surfaceVoltageKv / 60) * 0.06;
  }, [surfaceVoltageKv]);


  // Ground Discharge Trigger
  const handleGroundDischarge = useCallback(() => {
    playCapacitorSparkSound(1.5);
    setIsGroundEngaged(true);
    setSurfaceVoltageKv(0);
    setTimeout(() => {
      setIsGroundEngaged(false);
    }, 400);
  }, [playCapacitorSparkSound]);


  // Preset Selection
  const handleSelectPreset = useCallback((preset: ElectrostaticPreset) => {
    setSelectedPreset(preset);
    setSurfaceVoltageKv(preset.voltageKv);
    setPolarity(preset.chargePolarity);
    playCapacitorSparkSound(0.8);
  }, [playCapacitorSparkSound]);


  // --- 2D CANVAS ELECTROSTATIC SIMULATION (60FPS) ---
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


      // 2. Draw Dielectric Coordinate Grid
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


      // 3. Draw Latent Potential Gradient Circles
      const wandX = frictionWandPos.x * w;
      const wandY = frictionWandPos.y * h;
      const maxRadius = Math.max(20, (surfaceVoltageKv / 60) * 160);


      const radialGrad = ctx.createRadialGradient(wandX, wandY, 5, wandX, wandY, maxRadius);
      radialGrad.addColorStop(0, selectedSubstrate.accentColor + '88');
      radialGrad.addColorStop(0.5, selectedSubstrate.accentColor + '22');
      radialGrad.addColorStop(1, 'transparent');


      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(wandX, wandY, maxRadius, 0, Math.PI * 2);
      ctx.fill();


      // 4. Draw Equipotential Contour Lines
      ctx.strokeStyle = selectedSubstrate.accentColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let r = 30; r <= maxRadius; r += 35) {
        ctx.beginPath();
        ctx.arc(wandX, wandY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);


      // 5. Update & Render 300 Airborne Carbon Toner Particles
      const particles = particlesRef.current;
      const qSign = polarity === '+' ? 1 : -1;


      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];


        // Coulomb force F = q * E towards / away from wand
        const dx = wandX - p.x;
        const dy = wandY - p.y;
        const distSq = Math.max(100, dx * dx + dy * dy);
        const dist = Math.sqrt(distSq);


        // Electric field magnitude E ~ V / r^2
        const force = (surfaceVoltageKv * 0.08 * p.charge * qSign) / distSq;


        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;


        // Viscous damping
        p.vx *= 0.94;
        p.vy *= 0.94;


        p.x += p.vx;
        p.y += p.vy;


        // Boundary bounce
        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > w) { p.x = w; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > h) { p.y = h; p.vy *= -0.5; }


        // Render Toner Particle
        ctx.fillStyle = selectedSubstrate.id === 'selenium_photoconductor' ? '#FAF8F5' : '#0F0E0D';
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }


      // 6. Draw Friction Wand Stylus Tip
      ctx.fillStyle = polarity === '+' ? '#F59E0B' : '#8B5CF6';
      ctx.beginPath();
      ctx.arc(wandX, wandY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();


      // Wand Readout Tag
      ctx.fillStyle = selectedSubstrate.textColor;
      ctx.font = '10px monospace';
      ctx.fillText(`${polarity}${surfaceVoltageKv} kV`, wandX + 12, wandY - 12);


      requestAnimationFrame(render);
    };


    const animId = requestAnimationFrame(render);
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [frictionWandPos, surfaceVoltageKv, polarity, selectedSubstrate]);


  // Handle Canvas Mouse Scrubbing Friction
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));


    const now = performance.now();
    const dt = Math.max(1, now - lastMousePosRef.current.time);
    const dx = nx - lastMousePosRef.current.x;
    const dy = ny - lastMousePosRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt; // Speed factor


    lastMousePosRef.current = { x: nx, y: ny, time: now };
    setFrictionWandPos({ x: nx, y: ny });


    // Scrubbing friction increases surface potential
    if (isScrubbingRef.current && speed > 0.0005) {
      setSurfaceVoltageKv(prev => {
        const inc = Math.round(speed * 350);
        return Math.min(60, prev + inc);
      });
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
            style={{ backgroundColor: polarity === '+' ? '#F59E0B' : '#8B5CF6' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-60">
                Design Minds · Day 039 · 2026-10-10
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: selectedSubstrate.accentColor + '22',
                  color: selectedSubstrate.accentColor
                }}
              >
                Triboelectric Bento
              </span>
            </div>
            <h1 className="text-lg font-serif font-bold tracking-tight">
              Triboelectric Electrostatic Bento & Coulomb Surface Potential
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
                  playCapacitorSparkSound(1.0);
                }}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  selectedSubstrate.id === sub.id ? 'font-bold shadow-sm' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedSubstrate.id === sub.id ? selectedSubstrate.accentColor : 'transparent',
                  color: selectedSubstrate.id === sub.id ? (selectedSubstrate.id === 'selenium_photoconductor' ? '#141312' : '#FFFFFF') : selectedSubstrate.textColor
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
            <span>{isAudioMuted ? "🔇" : "⚡"}</span>
            <span className="hidden sm:inline">{isAudioMuted ? "MUTED" : "CORONA SOUND"}</span>
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
            className="md:col-span-8 rounded-2xl border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-sm"
            style={{
              backgroundColor: selectedSubstrate.cardTone,
              borderColor: selectedSubstrate.borderColor
            }}
          >
            {/* Top Micro-Specs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
                  LATENT POTENTIAL: {surfaceVoltageKv} kV
                </span>
                <span className="text-xs opacity-40 font-mono">/</span>
                <span className="font-mono text-xs opacity-75">
                  Polarity: {polarity} · Weight: {dynamicFontWeight}
                </span>
              </div>
              <div className="font-mono text-xs opacity-60">
                COULOMB POTENTIAL FIELD
              </div>
            </div>


            {/* Display Typography with Variable Weight & Tracking Expansion */}
            <div className="my-auto py-4">
              <span className="text-xs uppercase font-mono tracking-widest block mb-2 opacity-60">
                Latent Charge Deposition & Swiss Discipline
              </span>
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-none mb-4 transition-all"
                style={{
                  fontWeight: dynamicFontWeight,
                  letterSpacing: `${dynamicTracking}em`,
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                Triboelectric Bento
              </h2>
              <p className="text-sm md:text-base leading-relaxed max-w-2xl opacity-80" style={{ color: selectedSubstrate.subTextColor }}>
                정전기 흡착 노벨티 클리셰를 극복하고, 푸아송-볼츠만 표면 전위 미적분과 쿨롱 전기장 벡터 셰이더를 스위스 벤토 그리드 건축에 전격 이식한 살아 숨 쉬는 전하 파빌리온.
              </p>
            </div>


            {/* Bottom Coordinate Bar & Dynamic Metrics */}
            <div className="pt-6 border-t mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <div className="flex items-center gap-4">
                <span>
                  <strong className="opacity-50">DIELECTRIC:</strong> {selectedSubstrate.nameKo.split(' ')[0]}
                </span>
                <span>
                  <strong className="opacity-50">PERMITTIVITY:</strong> {selectedSubstrate.permittivity} ε_r
                </span>
                <span>
                  <strong className="opacity-50">BREAKDOWN:</strong> {selectedSubstrate.breakdownKv} kV
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Charge Tracking:</span>
                <strong className="text-amber-500">+{(dynamicTracking * 100).toFixed(1)}% em</strong>
              </div>
            </div>
          </div>


          {/* CELL 2: CHARGE ACCUMULATION CONTROLS & GROUND SWITCH (Span 4 Cols) */}
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
                  Electrostatic Potentials
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: polarity === '+' ? '#F59E0B' : '#8B5CF6' }}>
                  {surfaceVoltageKv} kV ({polarity})
                </span>
              </div>


              {/* Surface Potential Slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1.5 opacity-70">
                  <span>Surface Potential V(x,y)</span>
                  <span>{surfaceVoltageKv} kV</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={surfaceVoltageKv}
                  onChange={(e) => setSurfaceVoltageKv(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>


              {/* Polarity Switcher (+ vs -) */}
              <div className="mb-4">
                <div className="text-xs font-mono mb-1.5 opacity-70">Carrier Polarity</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      setPolarity('+');
                      playCapacitorSparkSound(1.0);
                    }}
                    className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      polarity === '+' ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ borderColor: polarity === '+' ? '#F59E0B' : selectedSubstrate.borderColor }}
                  >
                    <span>⚡</span>
                    <span>POSITIVE (+)</span>
                  </button>
                  <button
                    onClick={() => {
                      setPolarity('-');
                      playCapacitorSparkSound(1.0);
                    }}
                    className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      polarity === '-' ? 'bg-purple-600 text-white border-purple-700 shadow-sm' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ borderColor: polarity === '-' ? '#8B5CF6' : selectedSubstrate.borderColor }}
                  >
                    <span>🔋</span>
                    <span>NEGATIVE (-)</span>
                  </button>
                </div>
              </div>


              {/* GROUND CIRCUIT DISCHARGE BUTTON */}
              <div className="mb-4">
                <button
                  onClick={handleGroundDischarge}
                  className={`w-full py-2.5 px-4 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isGroundEngaged ? 'bg-emerald-600 text-white border-emerald-700 scale-95' : 'hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-600'
                  }`}
                  style={{ borderColor: isGroundEngaged ? '#10B981' : selectedSubstrate.borderColor }}
                >
                  <span>⏚</span>
                  <span>TRIGGER GROUND DISCHARGE (0 kV)</span>
                </button>
              </div>


              {/* Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block mb-1">
                  Electrostatic Field Presets
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
                      <div className="text-[10px] opacity-60 truncate">{p.voltageKv}kV · {p.chargePolarity}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>


            <div className="pt-3 border-t mt-3 text-[11px] font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              💡 캔버스 위를 빠르게 드래그하여 마찰 대전 전하를 증착하세요.
            </div>
          </div>


          {/* CELL 3: 2D ELECTROSTATIC SIMULATION VIEWPORT (Span 7 Cols) */}
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
                  2D Coulomb Potential & Toner Particle Mesh
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                  300 Carbon Particles
                </span>
              </div>


              {/* Reset Wand */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => {
                    setFrictionWandPos({ x: 0.5, y: 0.5 });
                    playCapacitorSparkSound(0.8);
                  }}
                  className="px-2.5 py-1 rounded border text-[11px] hover:bg-black/5"
                  style={{ borderColor: selectedSubstrate.borderColor }}
                >
                  Center Wand
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
                  isScrubbingRef.current = true;
                  handleCanvasInteraction(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  if (isScrubbingRef.current || e.buttons === 1) {
                    handleCanvasInteraction(e.clientX, e.clientY);
                  }
                }}
                onMouseUp={() => { isScrubbingRef.current = false; }}
                onMouseLeave={() => { isScrubbingRef.current = false; }}
                onTouchStart={(e) => {
                  isScrubbingRef.current = true;
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={() => { isScrubbingRef.current = false; }}
              />


              {/* Overlay Readout */}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: selectedSubstrate.cardTone + 'E6',
                  borderColor: selectedSubstrate.borderColor
                }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Coulomb Force: <strong>{(surfaceVoltageKv * 0.14).toFixed(2)} μN</strong></span>
              </div>
            </div>


            {/* Bottom Caption */}
            <div className="flex items-center justify-between text-xs font-mono opacity-60 pt-3">
              <span>SCRUB FAST TO DEPOSIT LATENT CHARGE</span>
              <span>E = -∇V = (1/4πε₀) ∑(q/r²) r̂</span>
            </div>
          </div>


          {/* CELL 4: VOLTAGE-COUPLED VARIABLE TYPOGRAPHY (Span 5 Cols) */}
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
                  Voltage-Coupled Typography
                </span>
                <span className="text-xs font-mono font-bold text-amber-500">
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
                  Axiom 39 Electrostatic Adhesion
                </span>
                <p
                  className="text-lg md:text-xl font-serif leading-snug transition-all"
                  style={{
                    fontWeight: dynamicFontWeight,
                    letterSpacing: `${dynamicTracking}em`,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  "The electrostatic latent image is an invisible architecture sculpted purely in potential energy."
                </p>
                <div className="mt-3 text-xs font-sans opacity-70 leading-relaxed">
                  표면 전압이 상승함에 따라 글자는 전하를 흡수하듯 굵기(wght: 350 → 800)와 자간(+{(dynamicTracking * 100).toFixed(1)}%)을 팽창시키며, 탄소 토너 입자들이 전기력선을 따라 면도날처럼 단단하게 결착됩니다.
                </div>
              </div>


              {/* Voltage & Tracking Axis Inspectors */}
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
                        width: `${((dynamicFontWeight - 350) / 450) * 100}%`,
                        backgroundColor: selectedSubstrate.accentColor
                      }}
                    />
                  </div>
                </div>


                <div>
                  <div className="flex justify-between text-[11px] mb-1 opacity-70">
                    <span>Coulomb Repulsion Tracking</span>
                    <span>+{(dynamicTracking * 100).toFixed(1)}% em</span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(dynamicTracking / 0.06) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono opacity-60" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span>CHARLES-AUGUSTIN DE COULOMB</span>
              <span>1785 ELECTRIC INVERSE-SQUARE</span>
            </div>
          </div>


          {/* CELL 5: DIELECTRIC SUBSTRATE SPECIFICATIONS (Span 6 Cols) */}
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
                  Dielectric Substrate Specifications
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
                  <div className="text-[10px] opacity-60">PERMITTIVITY (ε_r)</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.permittivity}</div>
                  <div className="text-[10px] opacity-50">Dielectric Const</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">BREAKDOWN (V_max)</div>
                  <div className="text-base font-bold mt-0.5">{selectedSubstrate.breakdownKv}</div>
                  <div className="text-[10px] opacity-50">Kilovolts</div>
                </div>


                <div className="p-3 rounded-xl border" style={{ borderColor: selectedSubstrate.borderColor }}>
                  <div className="text-[10px] opacity-60">SURFACE STATE</div>
                  <div className="text-base font-bold mt-0.5 text-amber-500">{surfaceVoltageKv > 0 ? 'CHARGED' : 'NEUTRAL'}</div>
                  <div className="text-[10px] opacity-50">{surfaceVoltageKv} kV</div>
                </div>
              </div>
            </div>


            <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: selectedSubstrate.borderColor }}>
              <span className="opacity-60">CAPACITIVE COUPLING RESOLVED</span>
              <span className="font-bold text-emerald-500">
                DISCHARGE CIRCUIT READY
              </span>
            </div>
          </div>


          {/* CELL 6: TACTILE CORONA SOUNDBOARD (Span 6 Cols) */}
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
                  Tactile Corona Acoustics
                </span>
                <span className="text-xs font-mono opacity-60">
                  Web Audio API Haptics
                </span>
              </div>


              <p className="text-xs font-sans opacity-70 mb-4">
                고전압 오존 이온화 히스, 마찰 대전 시의 카본 토너 종이 마찰음, 그리고 접지 스위치를 내렸을 때의 명징한 커패시터 방전 스파크 틱음을 연주하세요.
              </p>


              {/* Soundboard Buttons Matrix */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { name: 'Spark Snap', action: () => playCapacitorSparkSound(1.5), label: '커패시터 방전' },
                  { name: 'Corona 60kV', action: () => { setSurfaceVoltageKv(60); playCapacitorSparkSound(0.9); }, label: '최대 전압 서지' },
                  { name: 'Friction Rub', action: () => { setSurfaceVoltageKv(prev => Math.min(60, prev + 15)); playCapacitorSparkSound(0.5); }, label: '마찰 전하 증착' },
                  { name: 'Ground Zero', action: handleGroundDischarge, label: '접지 완전 방전' },
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
                    <div className="text-xs font-mono font-bold group-hover:text-amber-500 transition-colors">
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
              <span>High-Voltage Ionization Hiss + Capacitor Discharge Snaps</span>
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
            Design Minds · Gemini (The Noon Mind) · Day 039 of Continuous Design Research
          </div>
          <div className="flex items-center gap-4">
            <span>STRICT DATE: 2026-10-10</span>
            <span>·</span>
            <span>AESTHETIC PARADIGM: TRIBOELECTRIC BENO</span>
          </div>
        </footer>


      </main>
    </div>
  );
}
