"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Real-World Polarization Environments ---
interface PolarEnvironment {
  id: string;
  name: string;
  ko: string;
  glareDesc: string;
  revealedDesc: string;
  subterraneanHeadline: string;
  subterraneanBody: string;
  ambientTone: string;
}

const ENVIRONMENTS: PolarEnvironment[] = [
  {
    id: "lake",
    name: "01 // Alpine Lake Water Reflection",
    ko: "알프스 호수 수면의 난반사",
    glareDesc: "Blinding white surface water shimmer and sunlight scatter",
    revealedDesc: "Submerged river pebbles, aquatic flora, and crystalline depths",
    subterraneanHeadline: "수면 아래로 열리는 투명한 심연",
    subterraneanBody: "하얗게 부서지던 햇빛의 난반사가 지워지는 순간, 수면 밑 3미터 깊이에 고요히 잠겨 있던 조약돌과 물고기의 비늘이 청량한 에메랄드빛으로 모습을 드러냅니다.",
    ambientTone: "emerald",
  },
  {
    id: "museum",
    name: "02 // Bauhaus Showcase Glass",
    ko: "바우하우스 쇼윈도 전시면 유리",
    glareDesc: "Harsh street traffic, sky reflections, and washed-out glass haze",
    revealedDesc: "1958 Josef Müller-Brockmann Musica Viva poster in pure ink contrast",
    subterraneanHeadline: "쇼윈도 너머 드러나는 스위스 모더니즘",
    subterraneanBody: "유리창을 뿌옇게 가로막던 거리의 잡음과 하늘의 잔상이 소광되며, 100% 순수한 잉크 농도를 지닌 요제프 뮐러-브로크만의 비대칭 그리드 포스터가 눈앞에 다가섭니다.",
    ambientTone: "indigo",
  },
  {
    id: "asphalt",
    name: "03 // Wet Rainy Night Highway",
    ko: "비 내린 밤 젖은 아스팔트 노면",
    glareDesc: "Blinding oncoming headlight reflections and slick oil haze",
    revealedDesc: "Crisp retroreflective road markings and textured bitumen relief",
    subterraneanHeadline: "어둠 속에서 정렬하는 노면의 궤적",
    subterraneanBody: "젖은 아스팔트 위에 번들거리던 헤드라이트의 눈부신 편광 난반사가 차단되고, 선명한 차선과 도로 표지판이 어둠 속에서 확고한 인지적 안정감을 선사합니다.",
    ambientTone: "amber",
  },
];

// --- Preset Extinction Angles ---
const ANGLE_PRESETS = [
  { angle: 0, label: "0° (Max Glare)", isExtinction: false },
  { angle: 45, label: "45° (50% Glare)", isExtinction: false },
  { angle: 90, label: "90° (Brewster Extinction)", isExtinction: true },
  { angle: 135, label: "135° (50% Glare)", isExtinction: false },
  { angle: 180, label: "180° (Max Glare)", isExtinction: false },
  { angle: 270, label: "270° (Brewster Extinction)", isExtinction: true },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class PolarizingAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Fluid-damped mechanical rotation friction glide sound
  playDialGlide(angularVelocity: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400 + Math.min(1000, angularVelocity * 20), t);
      filter.Q.setValueAtTime(4.0, t);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320 + Math.min(400, angularVelocity * 10), t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {
      // Audio safety
    }
  }

  // Crystalline harmonic bell chime when crossing Brewster extinction node (90° / 270°)
  playExtinctionChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Primary harmonic bell
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1760, t); // A6
      osc1.frequency.exponentialRampToValueAtTime(1750, t + 0.8);
      gain1.gain.setValueAtTime(0.35, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.95);

      // Secondary overtone shimmer
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3520, t); // A7
      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.55);
    } catch {
      // Audio safety
    }
  }

  // Calcite crystal cleavage tap
  playCalciteTap(isEngaged: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(isEngaged ? 2400 : 1600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Audio safety
    }
  }

  // Scene switch acoustic shimmer
  playSceneTransition() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // Audio safety
    }
  }
}

export default function MasterworkPolarizingBento() {
  // --- States ---
  const [envIdx, setEnvIdx] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0); // 0 to 360 degrees
  const [isBirefringence, setIsBirefringence] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDraggingDial, setIsDraggingDial] = useState<boolean>(false);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  // Audio Engine Ref
  const audioRef = useRef<PolarizingAudioEngine | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const prevAngleRef = useRef<number>(0);

  useEffect(() => {
    audioRef.current = new PolarizingAudioEngine();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const curEnv = ENVIRONMENTS[envIdx];

  // Normalized angle in [0, 360)
  const normAngle = useMemo(() => {
    let a = angle % 360;
    if (a < 0) a += 360;
    return Math.round(a * 10) / 10;
  }, [angle]);

  // Malus's Law for Surface Glare Intensity:
  // Glare is maximal at 0° and 180°, and extinguishes to zero at 90° and 270°.
  // Angle difference from Brewster Extinction (90°):
  // I_glare = cos²(theta - 90°) = sin²(theta)
  const glareIntensity = useMemo(() => {
    const rad = (normAngle - 90) * (Math.PI / 180);
    const cosVal = Math.cos(rad);
    return Math.pow(cosVal, 2); // 1.0 at 0°/180°, 0.0 at 90°/270°
  }, [normAngle]);

  const extinctionPercentage = useMemo(() => {
    return Math.round((1 - glareIntensity) * 100);
  }, [glareIntensity]);

  // Variable Font Weight linked to extinction:
  // Glare washed out -> 250 (thin, airy), Extinguished -> 850 (sharp, dense)
  const dynamicFontWeight = useMemo(() => {
    return Math.round(250 + (1 - glareIntensity) * 600);
  }, [glareIntensity]);

  // Calcite Birefringence Displacement (Ordinary vs Extraordinary Ray):
  // Displacement orbits along an ellipse: dx = 16 * sin(2*theta), dy = 10 * cos(2*theta)
  const rayDisplacement = useMemo(() => {
    if (!isBirefringence) return { dx: 0, dy: 0, splitPx: 0 };
    const rad = (normAngle * Math.PI) / 180;
    const dx = Math.sin(2 * rad) * 16;
    const dy = Math.cos(2 * rad) * 10;
    const splitPx = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
    return { dx, dy, splitPx };
  }, [isBirefringence, normAngle]);

  // Play extinction chime when crossing extinction points
  useEffect(() => {
    const prev = prevAngleRef.current;
    const curr = normAngle;

    const crossed90 = (prev < 90 && curr >= 90) || (prev > 90 && curr <= 90);
    const crossed270 = (prev < 270 && curr >= 270) || (prev > 270 && curr <= 270);

    if (crossed90 || crossed270) {
      audioRef.current?.playExtinctionChime();
    }
    prevAngleRef.current = curr;
  }, [normAngle]);

  // --- Dial Dragging Kinematics ---
  const handleDialPointerDown = (e: React.PointerEvent) => {
    setIsDraggingDial(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDialPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingDial || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    const delta = Math.abs(deg - normAngle);
    if (delta > 2) {
      audioRef.current?.playDialGlide(delta);
    }
    setAngle(deg);
  }, [isDraggingDial, normAngle]);

  const handleDialPointerUp = (e: React.PointerEvent) => {
    if (isDraggingDial) {
      setIsDraggingDial(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe
      }
    }
  };

  const setPresetAngle = (deg: number) => {
    audioRef.current?.playDialGlide(15);
    setAngle(deg);
  };

  const switchEnv = (idx: number) => {
    setEnvIdx(idx);
    audioRef.current?.playSceneTransition();
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        setAngle((prev) => (Math.abs(prev % 360 - 90) < Math.abs(prev % 360 - 270) ? 270 : 90));
      } else if (e.code === "KeyB") {
        e.preventDefault();
        setKeyHint("B");
        setIsBirefringence((prev) => {
          audioRef.current?.playCalciteTap(!prev);
          return !prev;
        });
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setKeyHint("RIGHT");
        setAngle((prev) => {
          audioRef.current?.playDialGlide(5);
          return (prev + 5) % 360;
        });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setKeyHint("LEFT");
        setAngle((prev) => {
          audioRef.current?.playDialGlide(5);
          return (prev - 5 + 360) % 360;
        });
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setKeyHint("UP");
        setAngle((prev) => {
          audioRef.current?.playDialGlide(15);
          return (prev + 15) % 360;
        });
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setKeyHint("DOWN");
        setAngle((prev) => {
          audioRef.current?.playDialGlide(15);
          return (prev - 15 + 360) % 360;
        });
      } else if (e.key === "1") {
        switchEnv(0);
      } else if (e.key === "2") {
        switchEnv(1);
      } else if (e.key === "3") {
        switchEnv(2);
      } else if (e.code === "KeyM") {
        toggleMute();
      }
    };

    const handleKeyUp = () => setKeyHint(null);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#07080b] text-[#e2e5eb] font-sans antialiased selection:bg-[#00f0ff] selection:text-black p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss Header Console */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b1f2b] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#00f0ff] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            Day 047 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Optical Polarizing Filter & Anisotropic Birefringence Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            C-PL 원형 편광 링 회전, 브루스터 반사광 소광(Malus&apos;s Law), 방해석 복굴절 이중 굴절상, 그리고 스위스 크로매틱-프리즘 에디토리얼 건축
          </p>
        </div>

        {/* Global Optical Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0f121a] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161a25] hover:bg-[#22283a] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">POLAR AXIS: </span>
            <span className="text-[#00f0ff] font-bold">{normAngle.toFixed(0)}°</span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">GLARE EXTINCTION: </span>
            <span className={extinctionPercentage > 85 ? "text-[#ffb703] font-bold" : "text-[#f8f9fa] font-bold"}>
              {extinctionPercentage}%
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">CALCITE RAY SPLIT: </span>
            <span className="text-[#f8f9fa] font-bold">
              {isBirefringence ? `Δd: ${rayDisplacement.splitPx}px` : "OFF"}
            </span>
          </div>
        </div>
      </header>

      {/* Human Resonance: Real-World Scenario Selector Rail */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {ENVIRONMENTS.map((env, idx) => {
          const isSelected = idx === envIdx;
          return (
            <button
              key={env.id}
              onClick={() => switchEnv(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#141822] border-[#00f0ff] shadow-lg shadow-[#00f0ff]/10"
                  : "bg-[#0b0d13] border-[#1d222e] hover:border-[#2d3444] hover:bg-[#10131a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#94a3b8]">SCENARIO 0{idx + 1}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isSelected ? "bg-[#00f0ff] text-black font-bold" : "text-[#64748b]"}`}>
                  [KEY {idx + 1}]
                </span>
              </div>
              <div className="text-sm md:text-base font-bold text-[#f8f9fa] mt-1">{env.name}</div>
              <div className="text-xs text-[#71717a] mt-0.5">{env.ko}</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Prism Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: 360° Circular Polarizing Dial Chamber (5 cols) */}
        <section className="lg:col-span-5 bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
              01 // Circular Polarizing Dial (C-PL)
            </span>
            <span className="text-xs font-mono text-[#ffb703] bg-[#ffb703]/10 px-2 py-0.5 rounded border border-[#ffb703]/20">
              {normAngle === 90 || normAngle === 270 ? "★ BREWSTER EXTINCTION" : `θ = ${normAngle.toFixed(0)}°`}
            </span>
          </div>

          {/* Interactive Rotatable Polarizing Ring */}
          <div className="relative flex items-center justify-center py-6 select-none">
            <div
              ref={dialRef}
              onPointerDown={handleDialPointerDown}
              onPointerMove={handleDialPointerMove}
              onPointerUp={handleDialPointerUp}
              className="w-[280px] h-[280px] rounded-full bg-[#08090d] border-4 border-[#222736] flex items-center justify-center relative shadow-2xl cursor-grab active:cursor-grabbing touch-none"
            >
              {/* Outer Knurled Ring Markings */}
              <div
                className="absolute inset-0 rounded-full transition-transform duration-75"
                style={{ transform: `rotate(${normAngle}deg)` }}
              >
                {Array.from({ length: 36 }).map((_, i) => {
                  const deg = i * 10;
                  const isMajor = deg % 90 === 0;
                  return (
                    <div
                      key={deg}
                      className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom h-[140px] pointer-events-none"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div
                        className={`w-0.5 rounded-full ${
                          isMajor ? "h-4 bg-[#00f0ff]" : "h-2 bg-[#2d3648]"
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Polarizing Transmission Axis Line */}
                <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#00f0ff] via-transparent to-[#00f0ff] opacity-80" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-md shadow-[#00f0ff]" />
              </div>

              {/* Central Polarizer Crystal Element */}
              <div className="w-[180px] h-[180px] rounded-full bg-[#0d1017] border border-[#2b3345] flex flex-col items-center justify-center pointer-events-none shadow-inner relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
                    opacity: glareIntensity,
                  }}
                />
                <span className="text-[10px] font-mono tracking-widest text-[#64748b] uppercase">POLARIZING ANGLE</span>
                <span className="text-3xl font-extrabold font-mono text-[#f8f9fa] mt-1">{normAngle.toFixed(0)}°</span>
                <span className="text-xs font-mono text-[#00f0ff] mt-1 font-semibold">
                  {extinctionPercentage}% EXTINCTION
                </span>
              </div>
            </div>
          </div>

          {/* Preset Buttons Rail */}
          <div className="mt-4 pt-4 border-t border-[#181c26]">
            <div className="flex items-center justify-between text-xs font-mono text-[#788599] mb-2">
              <span>PRESET ANGLE NODES</span>
              <span>MALUS: cos²(θ - 90°)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ANGLE_PRESETS.map((p) => {
                const isActive = Math.abs(normAngle - p.angle) < 4;
                return (
                  <button
                    key={p.label}
                    onClick={() => setPresetAngle(p.angle)}
                    className={`py-2 px-1 text-center text-xs font-mono font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-[#00f0ff] text-black font-bold shadow-lg shadow-[#00f0ff]/20 scale-102"
                        : p.isExtinction
                        ? "bg-[#181f2c] text-[#ffb703] border border-[#ffb703]/30 hover:bg-[#20293a]"
                        : "bg-[#11141c] text-[#9ca3af] hover:bg-[#191d28] hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cell 2 & 3: Dual-Layer Glare Extinction & Birefringence Typographic Stage (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Top: Glare Extinction Visual Stage */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                02 // Brewster Glare Extinction Visualizer
              </span>
              <span className="text-xs font-mono text-[#64748b]">
                SURFACE REFLECTION: {(glareIntensity * 100).toFixed(0)}%
              </span>
            </div>

            {/* Simulated Glass Reflection Surface */}
            <div className="relative w-full h-[230px] bg-[#06070a] rounded-xl border border-[#202636] overflow-hidden flex items-center justify-center p-6">
              {/* Deep Subterranean Content (Uncovered when Glare is Extinguished) */}
              <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-xs font-mono text-[#00f0ff] tracking-widest uppercase font-semibold mb-1">
                    [ SUBTERRANEAN SIGNAL REVEALED ]
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#f8f9fa] tracking-tight">
                    {curEnv.subterraneanHeadline}
                  </h3>
                  <p className="text-xs md:text-sm text-[#94a3b8] mt-2 leading-relaxed">
                    {curEnv.subterraneanBody}
                  </p>
                </div>

                <div className="bg-[#10141d] border border-[#252c3d] p-3 rounded-lg font-mono text-xs text-[#8d96a5] space-y-1">
                  <div>θ_Brewster: <span className="text-[#ffb703] font-bold">56.3°</span></div>
                  <div>Refractive n₁: 1.000 (Air)</div>
                  <div>Refractive n₂: 1.517 (Dielectric)</div>
                  <div>Extinction Node: <span className="text-[#00f0ff] font-bold">90° / 270°</span></div>
                </div>
              </div>

              {/* Surface Reflection Glare Overlay (Milky blinding reflection) */}
              <div
                className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-150 flex items-center justify-center"
                style={{
                  opacity: glareIntensity,
                  background:
                    envIdx === 0
                      ? "radial-gradient(circle at 75% 30%, rgba(255,255,255,0.95) 0%, rgba(200,240,255,0.7) 40%, transparent 100%)"
                      : envIdx === 1
                      ? "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.92) 0%, rgba(220,225,240,0.65) 45%, transparent 100%)"
                      : "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.96) 0%, rgba(255,220,180,0.7) 35%, transparent 100%)",
                  backdropFilter: `blur(${glareIntensity * 8}px)`,
                }}
              >
                <div className="text-center p-4 bg-black/50 rounded-xl border border-white/20 backdrop-blur-md">
                  <div className="text-xs font-mono tracking-widest text-[#f8f9fa] uppercase font-bold">
                    ⚠️ {curEnv.glareDesc}
                  </div>
                  <div className="text-xs text-[#cbd5e1] mt-1 font-mono">
                    Rotate dial to 90° (Brewster extinction) to reveal subterranean clarity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Calcite Anisotropic Birefringence Typography Stage */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
                03 // Anisotropic Calcite Birefringence (Double Refraction)
              </span>
              <button
                onClick={() => {
                  audioRef.current?.playCalciteTap(!isBirefringence);
                  setIsBirefringence(!isBirefringence);
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  isBirefringence
                    ? "bg-[#00f0ff] text-black shadow-md shadow-[#00f0ff]/20"
                    : "bg-[#161a25] text-[#71717a] hover:text-white"
                }`}
              >
                {isBirefringence ? "CALCITE BIREFRINGENCE: ON [B]" : "CALCITE: OFF [B]"}
              </button>
            </div>

            {/* Kinetic Variable Typographic Specimen */}
            <div className="py-6 relative min-h-[140px] flex items-center justify-center overflow-hidden">
              {/* Ordinary Ray (O-Ray: Stationary / Base Glyph) */}
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: dynamicFontWeight,
                  opacity: 0.95,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ffb703] mb-1.5 uppercase font-semibold">
                  Ordinary Ray (n_o = 1.658)
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl leading-tight text-[#f8f9fa] tracking-tight">
                  빛의 파동을 쪼개어 본질을 세우다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2 max-w-2xl mx-auto leading-relaxed">
                  편광 축이 일치할 때 세상의 잡음은 소광되고, 분열되었던 복굴절 활자는 하나의 완벽한 스위스 모더니즘의 선예도로 정렬합니다.
                </p>
              </div>

              {/* Extraordinary Ray (E-Ray: Orbiting / Displaced Glyph in Calcite Mode) */}
              {isBirefringence && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-center pointer-events-none select-none transition-transform duration-75 mix-blend-screen"
                  style={{
                    transform: `translate(${rayDisplacement.dx}px, ${rayDisplacement.dy}px)`,
                    color: "#00f0ff",
                    fontWeight: dynamicFontWeight,
                    opacity: 0.65,
                  }}
                >
                  <div>
                    <div className="text-xs font-mono tracking-widest text-transparent mb-1.5 uppercase">
                      Extraordinary Ray (n_e = 1.486)
                    </div>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl leading-tight tracking-tight">
                      빛의 파동을 쪼개어 본질을 세우다.
                    </h2>
                    <p className="text-xs md:text-sm text-transparent mt-2 max-w-2xl mx-auto leading-relaxed">
                      편광 축이 일치할 때 세상의 잡음은 소광되고, 분열되었던 복굴절 활자는 하나의 완벽한 스위스 모더니즘의 선예도로 정렬합니다.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-[#788599]">
              <div>
                <span>OPTICAL WEIGHT: </span>
                <span className="text-[#f8f9fa] font-bold">wght: {dynamicFontWeight}</span>
              </div>
              <div>
                <span>CALCITE DISPERSION: </span>
                <span className="text-[#00f0ff] font-bold">
                  {isBirefringence ? `Δn = -0.172 (Uniaxial Negative)` : "ISOTROPIC"}
                </span>
              </div>
              <div>
                <span>RAY DISPLACEMENT: </span>
                <span className="text-[#ffb703] font-bold">
                  dx: {rayDisplacement.dx.toFixed(1)}px · dy: {rayDisplacement.dy.toFixed(1)}px
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Quick Snap Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setAngle(90)}
            className={`px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border flex items-center gap-2 ${
              normAngle === 90
                ? "bg-[#00f0ff] text-black border-[#00f0ff] shadow-lg shadow-[#00f0ff]/20"
                : "bg-[#141822] text-[#f8f9fa] border-[#293245] hover:border-[#00f0ff]"
            }`}
          >
            <span>★ SNAP 90° EXTINCTION</span>
          </button>
          <button
            onClick={() => setAngle(0)}
            className={`px-4 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border ${
              normAngle === 0
                ? "bg-[#ffb703] text-black border-[#ffb703]"
                : "bg-[#141822] text-[#9ca3af] border-[#293245] hover:text-white"
            }`}
          >
            <span>0° (MAX GLARE)</span>
          </button>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL SHORTCUTS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#00f0ff] font-bold" : ""}>[SPACE] Toggle 90°/270°</span>
            <span>·</span>
            <span className={keyHint === "B" ? "text-[#ffb703] font-bold" : ""}>[B] Calcite Birefringence</span>
            <span>·</span>
            <span className={keyHint === "LEFT" || keyHint === "RIGHT" ? "text-white font-bold" : ""}>[←/→] ±5° Fine Dial</span>
            <span>·</span>
            <span className={keyHint === "UP" || keyHint === "DOWN" ? "text-white font-bold" : ""}>[↑/↓] ±15° Rapid</span>
            <span>·</span>
            <span>[1/2/3] Scenarios</span>
          </div>
        </div>

        {/* Right: Birefringence Quick Switch */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              audioRef.current?.playCalciteTap(!isBirefringence);
              setIsBirefringence(!isBirefringence);
            }}
            className={`px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border shadow-lg ${
              isBirefringence
                ? "bg-gradient-to-r from-[#00f0ff] to-[#00b4d8] text-black border-[#00f0ff] shadow-[#00f0ff]/20 scale-102"
                : "bg-[#151924] text-[#8d96a5] border-[#273042] hover:text-white"
            }`}
          >
            <span>{isBirefringence ? "BIREFRINGENCE ACTIVE [B]" : "ACTIVATE BIREFRINGENCE [B]"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
