"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";

interface WaterDroplet {
  x: number;
  y: number;
  vy: number;
  radius: number;
  trail: { x: number; y: number; alpha: number }[];
  active: boolean;
}

interface WindowPreset {
  id: string;
  nameEn: string;
  nameKo: string;
  tempExterior: number;
  tempInterior: number;
  humidity: number;
  descKo: string;
}

const PRESETS: WindowPreset[] = [
  {
    id: "rainy_cafe",
    nameEn: "Rainy Afternoon Café",
    nameKo: "비 내리는 오후의 카페 창가",
    tempExterior: 8,
    tempInterior: 22,
    humidity: 88,
    descKo: "따뜻한 커피 김과 바깥의 찬 빗물이 만나 부드러운 우윳빛 결로 안개가 유리창을 자욱하게 채웁니다."
  },
  {
    id: "winter_express",
    nameEn: "Winter Night Express Train",
    nameKo: "겨울밤 야간 완행열차의 차창",
    tempExterior: -4,
    tempInterior: 24,
    humidity: 94,
    descKo: "영하의 차가운 설원 바람과 실내 난방열이 충돌하여 두꺼운 서리와 무거운 물방울이 맺힙니다."
  },
  {
    id: "morning_shower",
    nameEn: "Dawn Architecture Studio",
    nameKo: "새벽녘 건축 아틀리에의 통창",
    tempExterior: 12,
    tempInterior: 20,
    humidity: 78,
    descKo: "여명의 푸른빛 속에서 미세한 이슬방울들이 스위스 국제주의 그리드 파사드를 은은하게 감쌉니다."
  }
];

export default function SteamyWindowBentoStudio() {
  const [activePreset, setActivePreset] = useState<string>("rainy_cafe");
  const [brushRadius, setBrushRadius] = useState<number>(55);
  const [defrostActive, setDefrostActive] = useState<boolean>(false);
  const [clearedRatio, setClearedRatio] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [dropletCount, setDropletCount] = useState<number>(0);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number; active: boolean }>({ x: 0.5, y: 0.5, active: false });
  const [breathImpulse, setBreathImpulse] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mistMaskRef = useRef<Float32Array | null>(null); // 0.0 = completely cleared, 1.0 = fully fogged
  const dropletsRef = useRef<WaterDroplet[]>([]);
  const lastStrokeTimeRef = useRef<number>(0);

  const currentPreset = useMemo(() => {
    return PRESETS.find((p) => p.id === activePreset) || PRESETS[0];
  }, [activePreset]);

  // Web Audio Synthesizer for Tactile Glass Friction & Thermal Dissipation
  const playGlassSqueak = useCallback((freq = 580, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {
      // Audio context restricted
    }
  }, [soundEnabled]);

  const playDropletTrickle = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  const playBreathHiss = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  const playBrassChime = useCallback((freq = 880) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.82);
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Exhale Warm Breath Action
  const handleExhaleBreath = () => {
    const mask = mistMaskRef.current;
    if (!mask) return;
    setBreathImpulse((prev) => prev + 1);
    playBreathHiss();

    // Re-fog center area with warm puff
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = Math.min(w, h) * 0.42;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 < r * r) {
          const factor = (1 - Math.sqrt(d2) / r) * 0.85;
          const idx = y * w + x;
          mask[idx] = Math.min(0.95, mask[idx] + factor);
        }
      }
    }
  };

  // Trace Heart Shape on Fog
  const handleTraceHeart = () => {
    const canvas = canvasRef.current;
    const mask = mistMaskRef.current;
    if (!canvas || !mask) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const scale = Math.min(w, h) * 0.018;

    playGlassSqueak(620, 0.2);

    for (let t = 0; t < Math.PI * 2; t += 0.03) {
      // Heart parametric curve
      const hx = cx + scale * 16 * Math.pow(Math.sin(t), 3);
      const hy = cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      const r = brushRadius * 0.7;
      const minX = Math.max(0, Math.floor(hx - r));
      const maxX = Math.min(w, Math.ceil(hx + r));
      const minY = Math.max(0, Math.floor(hy - r));
      const maxY = Math.min(h, Math.ceil(hy + r));

      for (let py = minY; py < maxY; py++) {
        for (let px = minX; px < maxX; px++) {
          const d2 = (px - hx) * (px - hx) + (py - hy) * (py - hy);
          if (d2 < r * r) {
            mask[py * w + px] = Math.min(mask[py * w + px], 0.04);
          }
        }
      }
    }

    // Spawn 2 droplets from bottom tip
    dropletsRef.current.push({
      x: cx,
      y: cy + scale * 16,
      vy: 1.2,
      radius: 3.5,
      trail: [],
      active: true
    });
    playDropletTrickle();
  };

  // Initialize Fog & Droplets Simulation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 1000);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1000;
      height = canvas.height = canvas.offsetHeight || 600;
      initMask();
    };
    window.addEventListener("resize", handleResize);

    const initMask = () => {
      const size = width * height;
      const mask = new Float32Array(size);
      for (let i = 0; i < size; i++) {
        mask[i] = 0.92;
      }
      mistMaskRef.current = mask;
      dropletsRef.current = [];
    };

    initMask();

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const mask = mistMaskRef.current;
      if (!mask) return;

      // 1. Defrost thermal dissipation or natural re-condensation
      if (defrostActive) {
        for (let i = 0; i < mask.length; i++) {
          mask[i] = Math.max(0.0, mask[i] - 0.015);
        }
      } else {
        // Very slow ambient re-fogging
        if (frameCount % 4 === 0) {
          for (let i = 0; i < mask.length; i += 7) {
            mask[i] = Math.min(0.92, mask[i] + 0.001);
          }
        }
      }

      // 2. Update Gravity-Driven Water Droplets
      const droplets = dropletsRef.current;
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        if (!d.active) continue;

        d.vy += 0.28; // Gravity acceleration
        d.y += d.vy;
        d.x += (Math.random() - 0.5) * 0.8; // Meandering surface tension

        d.trail.push({ x: d.x, y: d.y, alpha: 0.8 });
        if (d.trail.length > 25) d.trail.shift();

        const rad = Math.floor(d.radius);
        const minX = Math.max(0, Math.floor(d.x - rad));
        const maxX = Math.min(width, Math.ceil(d.x + rad));
        const minY = Math.max(0, Math.floor(d.y - rad));
        const maxY = Math.min(height, Math.ceil(d.y + rad));

        for (let py = minY; py < maxY; py++) {
          for (let px = minX; px < maxX; px++) {
            mask[py * width + px] = Math.min(mask[py * width + px], 0.05);
          }
        }

        if (d.y > height + 20) {
          d.active = false;
        }
      }

      dropletsRef.current = droplets.filter((d) => d.active);
      setDropletCount(dropletsRef.current.length);

      // 3. Render Fog Layer to Canvas via ImageData
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      let clearedCount = 0;
      const sampleStep = 8;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const pIdx = idx * 4;
          const fogDensity = mask[idx];

          if (x % sampleStep === 0 && y % sampleStep === 0) {
            if (fogDensity < 0.3) clearedCount++;
          }

          data[pIdx] = 220;     // R
          data[pIdx + 1] = 230; // G
          data[pIdx + 2] = 245; // B (cool condensation tone)
          data[pIdx + 3] = Math.floor(fogDensity * 220); // Alpha
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // 4. Render Droplets & Glistening Trails on Top
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      for (const d of dropletsRef.current) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();

        for (const t of d.trail) {
          ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, d.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (frameCount % 30 === 0) {
        const totalSamples = Math.floor((width * height) / (sampleStep * sampleStep));
        const ratio = Math.min(1.0, clearedCount / totalSamples);
        setClearedRatio(ratio);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [defrostActive]);

  // Pointer Interaction: Wiping Mist with Warm Finger
  const wipeMistAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const mask = mistMaskRef.current;
    if (!canvas || !mask) return;

    const rect = canvas.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;

    setPointerPos({ x: cx / width, y: cy / height, active: true });

    const r = brushRadius;
    const r2 = r * r;
    const minX = Math.max(0, Math.floor(cx - r));
    const maxX = Math.min(width, Math.ceil(cx + r));
    const minY = Math.max(0, Math.floor(cy - r));
    const maxY = Math.min(height, Math.ceil(cy + r));

    for (let py = minY; py < maxY; py++) {
      for (let px = minX; px < maxX; px++) {
        const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
        if (d2 < r2) {
          const factor = Math.sqrt(d2) / r;
          const idx = py * width + px;
          mask[idx] = Math.min(mask[idx], factor * 0.8);
        }
      }
    }

    const now = performance.now();
    if (now - lastStrokeTimeRef.current > 75) {
      lastStrokeTimeRef.current = now;
      const freq = 450 + (cy / height) * 350;
      playGlassSqueak(freq, 0.045);

      if (Math.random() < 0.28 && dropletsRef.current.length < 18) {
        dropletsRef.current.push({
          x: cx + (Math.random() - 0.5) * (r * 0.8),
          y: cy - r * 0.5,
          vy: 0.5 + Math.random() * 1.5,
          radius: 2.5 + Math.random() * 2.2,
          trail: [],
          active: true
        });
        playDropletTrickle();
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    wipeMistAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 || e.pointerType === "touch" || pointerPos.active) {
      wipeMistAt(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setPointerPos((p) => ({ ...p, active: false }));
  };

  const dynamicWeight = Math.min(750, Math.max(300, Math.round(300 + clearedRatio * 450)));
  const dynamicTracking = (-0.02 + clearedRatio * 0.04).toFixed(3);
  const blurFilter = Math.max(0, Math.round((1 - clearedRatio) * 6));

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative min-h-screen w-full bg-[#0A0D14] text-[#FAF8F5] select-none font-sans overflow-x-hidden p-6 md:p-12 flex flex-col justify-between gap-8 cursor-crosshair"
    >
      {/* HEADER: Epigraphic Navigation & Atmosphere Telemetry */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1 rounded-full bg-[#FF4500] text-white font-mono text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105"
            >
              ← DM-044 // STEAMY WINDOW
            </Link>
            <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF]">
              DAY 044 · 2026-10-15 · GEMINI 4 ARGON
            </span>
          </div>

          <h1
            style={{
              fontWeight: dynamicWeight,
              letterSpacing: `${dynamicTracking}em`,
              filter: `blur(${blurFilter}px)`,
              transition: "filter 0.3s ease-out"
            }}
            className="text-2xl md:text-5xl uppercase tracking-tight text-[#FAF8F5]"
          >
            STEAMY WINDOW BENTO
          </h1>

          <p className="font-mono text-xs text-white/70">
            {currentPreset.nameKo} — {currentPreset.descKo}
          </p>
        </div>

        {/* Global Controls & Defrost Toggle */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBrassChime(660);
            }}
            className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 font-bold uppercase transition-all hover:border-white/50"
          >
            {soundEnabled ? "🔊 HAPTIC SOUND ON" : "🔇 SOUND MUTED"}
          </button>

          <button
            onClick={handleExhaleBreath}
            className="px-4 py-2 rounded-xl border border-cyan-400 bg-cyan-400/10 text-cyan-300 font-bold uppercase transition-all hover:scale-105 hover:bg-cyan-400/20"
          >
            💨 온기 불어넣기 (EXHALE BREATH #{breathImpulse})
          </button>

          <button
            onClick={handleTraceHeart}
            className="px-4 py-2 rounded-xl border border-rose-400 bg-rose-400/10 text-rose-300 font-bold uppercase transition-all hover:scale-105 hover:bg-rose-400/20"
          >
            ♥ 하트 그리기 (TRACE HEART)
          </button>

          <button
            onClick={() => {
              setDefrostActive(!defrostActive);
              playBrassChime(defrostActive ? 440 : 880);
            }}
            className={`px-4 py-2 rounded-xl border font-bold uppercase transition-all ${
              defrostActive
                ? "border-[#FF4500] bg-[#FF4500]/20 text-[#FF4500] shadow-[0_0_20px_rgba(255,69,0,0.4)]"
                : "border-white/20 bg-white/5 hover:border-white"
            }`}
          >
            {defrostActive ? "🔥 CERAMIC HEATER: 45°C" : "❄ HEATER: STANDBY"}
          </button>

          <button
            onClick={() => {
              setDefrostActive(false);
              const mask = mistMaskRef.current;
              if (mask) {
                for (let i = 0; i < mask.length; i++) mask[i] = 0.92;
              }
              dropletsRef.current = [];
              setClearedRatio(0);
              playBrassChime(520);
            }}
            className="px-4 py-2 rounded-xl border border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10 font-bold uppercase hover:bg-[#00F0FF]/20 transition-all"
          >
            ↺ RE-CONDENSE MIST
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: Glass Surface with Fog Canvas Overlay */}
      <main className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Interactive Glass Window Pane */}
        <div className="lg:col-span-8 relative rounded-3xl border border-white/20 bg-[#121824] p-6 md:p-8 flex flex-col justify-between overflow-hidden min-h-[460px] shadow-2xl">
          {/* Background Sharp Swiss Bento Layout (Viewed Through Cleared Window) */}
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center font-mono text-xs text-white/60 border-b border-white/10 pb-3">
              <span className="uppercase text-[#00F0FF] font-bold">
                MÜLLER-BROCKMANN ARCHITECTURAL FACADE
              </span>
              <span>
                APERTURE CLARITY: <strong className="text-white">{(clearedRatio * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-mono text-[11px] text-[#FF4500] uppercase font-bold">
                  01 // SENSORY INTIMACY
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  The Warmth of Human Touch
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-serif">
                  차가운 유리 표면에 남겨진 손가락의 궤적은 인간이 공간 속에 온기를 불어넣는 가장 오래된 시각적 의식입니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-mono text-[11px] text-[#00F0FF] uppercase font-bold">
                  02 // DROPLET KINETICS
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                  Rayleigh Gravity Runoff
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-serif">
                  모서리에 맺힌 물방울이 한계 질량을 넘어서는 순간, 중력을 타고 흘러내리며 유리창 위에 빛의 길을 냅니다.
                </p>
              </div>
            </div>

            {/* Central Typographic Manifesto */}
            <div className="text-center py-6">
              <div
                style={{
                  fontWeight: dynamicWeight,
                  letterSpacing: `${dynamicTracking}em`
                }}
                className="text-3xl md:text-6xl uppercase tracking-tight leading-none text-white transition-all duration-100"
              >
                TOUCH THE GLASS
              </div>
              <p className="mt-3 font-mono text-xs text-white/50 max-w-md mx-auto">
                Wipe away the condensation mist with your pointer to unveil the sharp typographic order beneath.
              </p>
            </div>
          </div>

          {/* Procedural Mist Canvas Overlay (Absolute Stretched Over Window Pane) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-20 pointer-events-none rounded-3xl"
          />

          <div className="relative z-30 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between font-mono text-xs text-white/70">
            <span>ACTIVE DROPLETS: {dropletCount} / 18</span>
            <span>WGHT: {dynamicWeight} · TRACKING: {dynamicTracking}em</span>
          </div>
        </div>

        {/* Right 4 Cols: Atmospheric Controls & Weather Deck */}
        <div className="lg:col-span-4 rounded-3xl border border-white/20 bg-[#121824] p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                ATMOSPHERIC PARAMETERS (기상 조형 덱)
              </span>
              <span className="font-mono text-xs text-white/50">60 FPS FLUID</span>
            </div>

            {/* Preset Selector */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-white/80 block uppercase">
                1. Atmospheric Presets (환경 시나리오)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePreset(p.id);
                      playBrassChime(580);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                      activePreset === p.id
                        ? "border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                    }`}
                  >
                    <div>{p.nameKo}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{p.nameEn} · {p.tempExterior}°C / {p.tempInterior}°C</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Radius Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span>FINGER WIPING RADIUS (손가락 굵기)</span>
                <span className="text-[#00F0FF] font-bold">{brushRadius}px</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={brushRadius}
                onChange={(e) => setBrushRadius(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#00F0FF]"
              />
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/50">EXTERIOR TEMP</div>
                <div className="text-lg font-bold text-white mt-1">{currentPreset.tempExterior}°C</div>
                <div className="text-[9px] text-[#00F0FF]">Freezing Boundary</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/50">INTERIOR HUMIDITY</div>
                <div className="text-lg font-bold text-white mt-1">{currentPreset.humidity}% RH</div>
                <div className="text-[9px] text-[#FF4500]">Condensation Zone</div>
              </div>
            </div>
          </div>

          {/* Architectural Design Rationale Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-2 text-xs leading-relaxed">
            <div className="font-mono text-[#FF4500] font-bold uppercase tracking-wider">
              JUHANI PALLASMAA & SWISS TACTILITY
            </div>
            <p className="text-white/80 font-serif">
              "피부는 차가운 세상을 느끼고, 손끝은 따뜻한 문장을 엽니다. 직사각형 화면의 건조한 관성을 깨고 인간의 보편적 촉각 기억을 웹 인터페이스의 새로운 생명으로 환원합니다."
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER: 4-Card Bento Tactile Showcase */}
      <footer className="relative z-30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "01", title: "Glass Squeak Friction", ko: "유리 마찰 촉각음", desc: "손가락으로 유리를 문지를 때의 기분 좋은 뽀드득 마찰음을 Web Audio로 실시간 합성합니다." },
          { id: "02", title: "Capillary Runoff", ko: "모세관 물방울 낙하", desc: "닦아낸 테두리에 맺힌 물방울이 중력 가속도를 타고 흐르며 자연스러운 궤적을 남깁니다." },
          { id: "03", title: "Ceramic Defrost", ko: "세라믹 열선 디프로스트", desc: "열선 스위치를 켜면 45°C의 온열로 김서림이 부드럽게 증발하며 정갈한 평형을 찾습니다." },
          { id: "04", title: "Swiss Grotesque", ko: "스위스 그로테스크 포커스", desc: "김이 걷히는 면적에 비례해 가변 서체 굵기(300~750)와 대비가 면도날처럼 선명해집니다." }
        ].map((card) => (
          <div
            key={card.id}
            className="p-5 rounded-2xl border border-white/15 bg-[#121824]/90 flex flex-col justify-between gap-3 shadow-lg"
          >
            <div>
              <div className="font-mono text-[10px] text-[#00F0FF] uppercase font-bold tracking-widest">
                CARD // {card.id}
              </div>
              <h4 className="text-base font-bold text-white mt-1">{card.title}</h4>
              <div className="text-xs text-white/70 font-semibold">{card.ko}</div>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed font-serif">
                {card.desc}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 font-mono text-[10px] text-white/40">
              TACTILE RESONANCE CONFIRMED
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
