"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";

interface TrackItem {
  id: number;
  title: string;
  ko: string;
  duration: string;
  radiusFrac: number; // 0.85 = outer, 0.4 = inner
  bpm: number;
  chords: number[];
}

const TRACKS: TrackItem[] = [
  { id: 1, title: "Saccadic Overture in F Minor", ko: "제1악장: 안구 도약 서곡", duration: "03:42", radiusFrac: 0.82, bpm: 68, chords: [174.61, 207.65, 261.63, 349.23] },
  { id: 2, title: "Dieter Rams Functionalism", ko: "제2악장: 디터 람스 기능주의", duration: "04:15", radiusFrac: 0.68, bpm: 72, chords: [196.00, 246.94, 293.66, 392.00] },
  { id: 3, title: "Acoustic Micro-Groove Resonance", ko: "제3악장: 미세 음골 공명", duration: "05:08", radiusFrac: 0.54, bpm: 64, chords: [220.00, 261.63, 329.63, 440.00] },
  { id: 4, title: "Run-Out Matrix & Modern Silence", ko: "제4악장: 런아웃 매트릭스와 침묵", duration: "02:50", radiusFrac: 0.38, bpm: 60, chords: [130.81, 164.81, 196.00, 261.63] }
];

export default function VinylTurntableBentoStudio() {
  const [rpm, setRpm] = useState<number>(33.333);
  const [speedStandard, setSpeedStandard] = useState<33 | 45>(33);
  const [needleDown, setNeedleDown] = useState<boolean>(false);
  const [tonearmPos, setTonearmPos] = useState<number>(0.85); // 0.9 = rest, 0.85 = lead-in, 0.35 = run-out
  const [activeTrackId, setActiveTrackId] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [trackingForce, setTrackingForce] = useState<number>(1.8); // grams
  const [vinylDustIntensity, setVinylDustIntensity] = useState<number>(45); // %
  const [strobeLocked, setStrobeLocked] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [brushCleansCount, setBrushCleansCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const crackleTimerRef = useRef<number | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastPointerAngleRef = useRef<number>(0);

  // Strobe lock evaluation (33.333 RPM gives frozen stroboscope dots under 60Hz neon)
  useEffect(() => {
    const target = speedStandard === 33 ? 33.333 : 45.0;
    const delta = Math.abs(rpm - target);
    setStrobeLocked(delta < 0.15);
  }, [rpm, speedStandard]);

  // Audio Synthesis for Needle Drop, Vinyl Crackle, Ground Hum, and Analog Tone
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const playNeedleDropThud = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;

      // Low mechanical thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

      gain.gain.setValueAtTime(0.25 * (trackingForce / 1.8), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Ignore
    }
  }, [soundEnabled, trackingForce, initAudio]);

  const playScratchSound = useCallback((deltaAngle: number) => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200 + Math.abs(deltaAngle) * 4000, now);
      filter.Q.setValueAtTime(3.0, now);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180 + Math.abs(deltaAngle) * 800, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }, [soundEnabled, initAudio]);

  const playCarbonBrushSweep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(340, now);

      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.4);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }, [soundEnabled, initAudio]);

  const playBrassChime = useCallback((freq = 880) => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.62);
    } catch {
      // Ignore
    }
  }, [soundEnabled, initAudio]);

  // Clean with Anti-Static Carbon Brush
  const handleCleanVinyl = () => {
    setBrushCleansCount((prev) => prev + 1);
    playCarbonBrushSweep();
    setVinylDustIntensity((prev) => Math.max(6, Math.round(prev * 0.35)));
  };

  // Continuous Procedural Vinyl Surface Noise & Melodic Chord Progression
  useEffect(() => {
    if (!needleDown || !soundEnabled) {
      if (crackleTimerRef.current) clearInterval(crackleTimerRef.current);
      if (musicTimerRef.current) clearInterval(musicTimerRef.current);
      return;
    }

    const ctx = initAudio();

    // 1. Random Vinyl Crackle (Poisson dust pops)
    const crackleInterval = setInterval(() => {
      try {
        if (Math.random() < (vinylDustIntensity / 100) * 0.45) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const biquad = ctx.createBiquadFilter();

          biquad.type = "bandpass";
          biquad.frequency.setValueAtTime(1800 + Math.random() * 3200, now);
          biquad.Q.setValueAtTime(3.5, now);

          osc.type = "triangle";
          osc.frequency.setValueAtTime(200 + Math.random() * 800, now);

          const vol = (0.015 + Math.random() * 0.035) * (vinylDustIntensity / 50);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          osc.connect(biquad);
          biquad.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.02);
        }
      } catch {
        // Ignore
      }
    }, 40);
    crackleTimerRef.current = crackleInterval as unknown as number;

    // 2. Warm Analog Synthesizer Chords based on active track
    const track = TRACKS.find((t) => t.id === activeTrackId) || TRACKS[0];
    let chordIdx = 0;

    const musicInterval = setInterval(() => {
      try {
        const now = ctx.currentTime;
        const speedFactor = rpm / 33.333;
        const baseFreq = track.chords[chordIdx % track.chords.length] * speedFactor;
        chordIdx++;

        [baseFreq, baseFreq * 1.5].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(650, now);

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.025, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.25);
        });
      } catch {
        // Ignore
      }
    }, Math.max(800, Math.round(1600 / (rpm / 33.333))));
    musicTimerRef.current = musicInterval as unknown as number;

    return () => {
      clearInterval(crackleInterval);
      clearInterval(musicInterval);
    };
  }, [needleDown, soundEnabled, activeTrackId, vinylDustIntensity, rpm, initAudio]);

  // Turntable Platter 60fps Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 560);
    let height = (canvas.height = canvas.offsetHeight || 560);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 560;
      height = canvas.height = canvas.offsetHeight || 560;
    };
    window.addEventListener("resize", handleResize);

    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!isScrubbing) {
        const radPerSec = (rpm / 60) * Math.PI * 2;
        angleRef.current += radPerSec * dt;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.46;
      const cy = height * 0.5;
      const maxRadius = Math.min(width, height) * 0.44;

      // 1. Turntable Aluminum Outer Platter & Strobe Ring
      ctx.save();
      ctx.translate(cx, cy);

      ctx.fillStyle = "#0D0E12";
      ctx.beginPath();
      ctx.arc(0, 0, maxRadius + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Platter Edge with Stroboscopic Calibration Dots
      const strobeCount = speedStandard === 33 ? 120 : 160;
      for (let i = 0; i < strobeCount; i++) {
        const dotAngle = angleRef.current + (i / strobeCount) * Math.PI * 2;
        const dx = Math.cos(dotAngle) * (maxRadius + 6);
        const dy = Math.sin(dotAngle) * (maxRadius + 6);

        const isStrobeIlluminated = Math.sin(dotAngle * 30 - angleRef.current * 30) > 0.2;
        ctx.fillStyle = isStrobeIlluminated
          ? (strobeLocked ? "#00F0FF" : "#F59E0B")
          : "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Glossy Black 12-inch Vinyl Record Disc
      const gradDisc = ctx.createRadialGradient(0, 0, 40, 0, 0, maxRadius);
      gradDisc.addColorStop(0, "#1A1C23");
      gradDisc.addColorStop(0.3, "#0A0B0E");
      gradDisc.addColorStop(0.85, "#060709");
      gradDisc.addColorStop(1, "#181A22");

      ctx.fillStyle = gradDisc;
      ctx.beginPath();
      ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Micro-Grooves Spirals & Track Divide Bands
      ctx.lineWidth = 1;
      for (let r = 55; r < maxRadius - 8; r += 3.5) {
        ctx.strokeStyle = (r % 14 === 0) ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.035)";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Highlight active track band
      const activeTrack = TRACKS.find((t) => t.id === activeTrackId);
      if (activeTrack) {
        const trRad = maxRadius * activeTrack.radiusFrac;
        ctx.strokeStyle = needleDown ? "rgba(245, 158, 11, 0.45)" : "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, trRad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Rotating Light Reflection Sheen
      ctx.save();
      ctx.rotate(angleRef.current * 0.25);
      const sheenGrad = ctx.createLinearGradient(-maxRadius, -maxRadius, maxRadius, maxRadius);
      sheenGrad.addColorStop(0, "rgba(255,255,255,0.08)");
      sheenGrad.addColorStop(0.5, "rgba(255,255,255,0.0)");
      sheenGrad.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.arc(0, 0, maxRadius - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Central Swiss Typography Red Label
      ctx.save();
      ctx.rotate(angleRef.current);
      ctx.fillStyle = "#E63946"; // Vignelli Red Label
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`DM-045 · ${speedStandard === 33 ? "33⅓" : "45"} RPM`, 0, -18);
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("DESIGN MINDS", 0, -4);
      ctx.font = "6px monospace";
      ctx.fillText("GEMINI 4 ARGON", 0, 10);
      ctx.fillText("STEREO // HI-FI", 0, 22);

      // Center Spindle Hole
      ctx.fillStyle = "#C5A059";
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore platter translate

      // 6. Tonearm Base & Arm Kinematics
      const armBaseX = width * 0.88;
      const armBaseY = height * 0.24;

      const currentRadius = maxRadius * tonearmPos;
      const stylusAngle = Math.PI * 0.85 - (1 - tonearmPos) * 0.25;
      const stylusX = cx + Math.cos(stylusAngle) * currentRadius;
      const stylusY = cy + Math.sin(stylusAngle) * currentRadius;

      // Draw Tonearm Gimbal Base
      ctx.fillStyle = "#22252E";
      ctx.beginPath();
      ctx.arc(armBaseX, armBaseY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Counterweight
      const rearAngle = Math.atan2(stylusY - armBaseY, stylusX - armBaseX) + Math.PI;
      const cwX = armBaseX + Math.cos(rearAngle) * 36;
      const cwY = armBaseY + Math.sin(rearAngle) * 36;
      ctx.fillStyle = "#111318";
      ctx.beginPath();
      ctx.arc(cwX, cwY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#C5A059";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tonearm Silver Tube
      ctx.strokeStyle = needleDown ? "#E5E7EB" : "#9CA3AF";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(armBaseX, armBaseY);
      const midArmX = (armBaseX + stylusX) * 0.5 + 10;
      const midArmY = (armBaseY + stylusY) * 0.5 - 15;
      ctx.quadraticCurveTo(midArmX, midArmY, stylusX, stylusY);
      ctx.stroke();

      // Headshell & Cartridge
      ctx.save();
      ctx.translate(stylusX, stylusY);
      const headAngle = Math.atan2(stylusY - midArmY, stylusX - midArmX);
      ctx.rotate(headAngle);

      ctx.fillStyle = "#181A20";
      ctx.fillRect(-6, -10, 24, 20);
      ctx.strokeStyle = "#E63946";
      ctx.lineWidth = 2;
      ctx.strokeRect(-6, -10, 24, 20);

      // Stylus Needle Point
      ctx.fillStyle = needleDown ? "#00F0FF" : "#F59E0B";
      ctx.beginPath();
      ctx.arc(14, 0, needleDown ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
      if (needleDown) {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(14, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [rpm, needleDown, tonearmPos, activeTrackId, strobeLocked, isScrubbing, speedStandard]);

  // Direct Scratch & Platter Touch Handling
  const handlePointerDownPlatter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width * 0.46;
    const cy = canvas.height * 0.5;

    setIsScrubbing(true);
    lastPointerAngleRef.current = Math.atan2(y - cy, x - cx);
  };

  const handlePointerMovePlatter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScrubbing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width * 0.46;
    const cy = canvas.height * 0.5;

    const currentAngle = Math.atan2(y - cy, x - cx);
    let delta = currentAngle - lastPointerAngleRef.current;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    angleRef.current += delta;
    lastPointerAngleRef.current = currentAngle;

    if (needleDown && Math.abs(delta) > 0.03) {
      playScratchSound(delta);
    }
  };

  const handlePointerUpPlatter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsScrubbing(false);
    // If it was a quick click rather than a long drag, cue to track
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width * 0.46;
    const cy = canvas.height * 0.5;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.44;
    const dist = Math.hypot(x - cx, y - cy);
    const frac = Math.max(0.35, Math.min(0.85, dist / maxRadius));

    let closestTrack = TRACKS[0];
    let minDiff = 999;
    TRACKS.forEach((t) => {
      const diff = Math.abs(t.radiusFrac - frac);
      if (diff < minDiff) {
        minDiff = diff;
        closestTrack = t;
      }
    });

    setTonearmPos(closestTrack.radiusFrac);
    setActiveTrackId(closestTrack.id);
    setNeedleDown(true);
    playNeedleDropThud();
  };

  const toggleCueLever = () => {
    const nextState = !needleDown;
    setNeedleDown(nextState);
    if (nextState) {
      playNeedleDropThud();
    } else {
      playBrassChime(580);
    }
  };

  // Variable font calculations coupled to playback state
  const dynamicWeight = needleDown ? Math.min(800, Math.max(400, Math.round(400 + (rpm / 33.333) * 350))) : 300;
  const dynamicTracking = needleDown ? "-0.015em" : "0.06em";

  return (
    <div className="relative min-h-screen w-full bg-[#0D0E12] text-[#FAF8F5] select-none font-sans overflow-x-hidden p-6 md:p-12 flex flex-col justify-between gap-8">
      {/* HEADER: Epigraphic Navigation & Braun Hi-Fi Telemetry */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1 rounded-full bg-[#E63946] text-white font-mono text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105"
            >
              ← DM-045 // VINYL TURNTABLE
            </Link>
            <span className="font-mono text-xs uppercase tracking-widest text-[#F59E0B]">
              DAY 045 · 2026-10-16 · GEMINI 4 ARGON
            </span>
          </div>

          <h1
            style={{
              fontWeight: dynamicWeight,
              letterSpacing: dynamicTracking,
              transition: "all 0.3s ease-out"
            }}
            className="text-2xl md:text-5xl uppercase tracking-tight text-[#FAF8F5]"
          >
            VINYL TURNTABLE BENTO
          </h1>

          <p className="font-mono text-xs text-white/70">
            디터 람스 브라운 오디오 미학(SK4)과 요제프 뮐러-브로크만 스위스 음악 그리드의 결합
          </p>
        </div>

        {/* Global Controls & Cue Lever Button */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBrassChime(720);
            }}
            className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 font-bold uppercase transition-all hover:border-white/50"
          >
            {soundEnabled ? "🔊 STEREO SOUND ON" : "🔇 SOUND MUTED"}
          </button>

          <button
            onClick={handleCleanVinyl}
            className="px-4 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 font-bold uppercase transition-all hover:scale-105 hover:bg-amber-400/20"
          >
            🧹 카본 브러시 청소 ({brushCleansCount})
          </button>

          <button
            onClick={() => {
              const nextStd = speedStandard === 33 ? 45 : 33;
              setSpeedStandard(nextStd);
              setRpm(nextStd === 33 ? 33.333 : 45.0);
              playBrassChime(nextStd === 33 ? 660 : 880);
            }}
            className="px-4 py-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold uppercase transition-all hover:scale-105"
          >
            ⚡ {speedStandard === 33 ? "33⅓ RPM 모드" : "45 RPM 싱글 모드"}
          </button>

          <button
            onClick={toggleCueLever}
            className={`px-4 py-2 rounded-xl border font-bold uppercase transition-all ${
              needleDown
                ? "border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                : "border-[#E63946] bg-[#E63946]/20 text-white hover:bg-[#E63946]/30"
            }`}
          >
            {needleDown ? "▼ CUE LEVER: NEEDLE DOWN" : "▲ CUE LEVER: NEEDLE UP"}
          </button>

          <button
            onClick={() => {
              setRpm(33.333);
              setSpeedStandard(33);
              setNeedleDown(true);
              setTonearmPos(0.82);
              setActiveTrackId(1);
              playNeedleDropThud();
            }}
            className="px-4 py-2 rounded-xl border border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10 font-bold uppercase hover:bg-[#F59E0B]/20 transition-all"
          >
            ↺ 33⅓ RPM RESET
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: Turntable Stage + Audio Deck */}
      <main className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Interactive Turntable Platter Canvas */}
        <div className="lg:col-span-7 relative rounded-3xl border border-white/20 bg-[#161820] p-6 md:p-8 flex flex-col justify-between overflow-hidden min-h-[480px] shadow-2xl">
          <div className="relative z-10 flex justify-between items-center font-mono text-xs text-white/60 border-b border-white/10 pb-3">
            <span className="uppercase text-[#00F0FF] font-bold">
              300MM ALUMINUM PLATTER · TOUCH TO SCRATCH
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${strobeLocked ? "bg-[#00F0FF] animate-pulse" : "bg-[#F59E0B]"}`} />
              STROBOSCOPE: <strong className={strobeLocked ? "text-[#00F0FF]" : "text-[#F59E0B]"}>{strobeLocked ? `${speedStandard === 33 ? "33⅓" : "45"} LOCKED` : "DRIFTING"}</strong>
            </span>
          </div>

          {/* Interactive Turntable Canvas with Scratch Gesture */}
          <div className="relative my-auto flex items-center justify-center py-4">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDownPlatter}
              onPointerMove={handlePointerMovePlatter}
              onPointerUp={handlePointerUpPlatter}
              className="w-full max-w-[480px] h-[340px] md:h-[440px] cursor-grab active:cursor-grabbing touch-none"
            />
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between font-mono text-xs text-white/70">
            <span>TRACKING FORCE: {trackingForce}g · DUST NOISE: {vinylDustIntensity}%</span>
            <span>CLICK DISC OR DRAG TO SCRATCH</span>
          </div>
        </div>

        {/* Right 5 Cols: Tracklist & Precision Control Deck */}
        <div className="lg:col-span-5 rounded-3xl border border-white/20 bg-[#161820] p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                AUDIO-EDITORIAL TRACKLIST (음반 트랙)
              </span>
              <span className="font-mono text-xs text-white/50">HI-FI ANALOG</span>
            </div>

            {/* Interactive Tracklist Rows */}
            <div className="space-y-2">
              {TRACKS.map((track) => {
                const isActive = activeTrackId === track.id && needleDown;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setActiveTrackId(track.id);
                      setTonearmPos(track.radiusFrac);
                      setNeedleDown(true);
                      playNeedleDropThud();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "border-[#F59E0B] bg-[#F59E0B]/15 text-white shadow-md"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[10px] text-[#F59E0B] font-bold uppercase">
                        TRACK 0{track.id} // {track.duration}
                      </div>
                      <div className="text-sm font-bold tracking-tight mt-0.5">{track.title}</div>
                      <div className="text-xs text-white/60">{track.ko}</div>
                    </div>

                    <div className="font-mono text-xs font-bold">
                      {isActive ? "● PLAYING" : "CUE ▶"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sliders Deck */}
            <div className="space-y-3 pt-2">
              {/* Pitch Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span>PITCH CONTROL (RPM):</span>
                  <span className={strobeLocked ? "text-[#00F0FF] font-bold" : "text-[#F59E0B] font-bold"}>
                    {rpm.toFixed(3)} RPM
                  </span>
                </div>
                <input
                  type="range"
                  min={speedStandard === 33 ? 30.0 : 42.0}
                  max={speedStandard === 33 ? 36.0 : 48.0}
                  step={0.05}
                  value={rpm}
                  onChange={(e) => setRpm(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Tracking Force Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs">
                  <span>STYLUS TRACKING FORCE (침압):</span>
                  <span className="text-[#00F0FF] font-bold">{trackingForce}g</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={trackingForce}
                  onChange={(e) => setTrackingForce(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          {/* Dieter Rams Design Philosophy Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-2 text-xs leading-relaxed">
            <div className="font-mono text-[#E63946] font-bold uppercase tracking-wider">
              DIETER RAMS: LESS, BUT BETTER (Braun SK4)
            </div>
            <p className="text-white/80 font-serif">
              "좋은 디자인은 가능한 한 최소한으로 디자인하는 것입니다. 불필요한 장식을 걷어내고 기계의 정직한 작동 원리와 촉각적 의식을 드러낼 때, 디자인은 일상의 예술이 됩니다."
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER: 4-Card Tactile Audio Showcase */}
      <footer className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "01", title: "Tonearm Kinematics", ko: "톤암의 기계적 중량감", desc: "금속 톤암을 집어 올려 음반 위에 떨어뜨릴 때의 찰나의 침묵과 착지음을 완벽히 재현합니다." },
          { id: "02", title: "Analog Dust Crackle", ko: "포근한 아날로그 팝 노이즈", desc: "미세한 먼지 입자가 바늘을 스칠 때의 따스한 파열음과 60Hz 진공관 험을 절차적으로 합성합니다." },
          { id: "03", title: "Stroboscope 33⅓", ko: "33⅓ RPM 스트로보 정지", desc: "60Hz 광원 아래서 정확한 속도에 도달했을 때 눈앞에서 멈춘 듯 고정되는 광학적 정렬입니다." },
          { id: "04", title: "Swiss Audio Typography", ko: "음악적 가변 타이포그래피", desc: "바늘이 음골을 주행할 때 활자가 wght: 300에서 800으로 팽창하며 음악의 중량을 시각화합니다." }
        ].map((card) => (
          <div
            key={card.id}
            className="p-5 rounded-2xl border border-white/15 bg-[#161820]/90 flex flex-col justify-between gap-3 shadow-lg"
          >
            <div>
              <div className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold tracking-widest">
                CARD // {card.id}
              </div>
              <h4 className="text-base font-bold text-white mt-1">{card.title}</h4>
              <div className="text-xs text-white/70 font-semibold">{card.ko}</div>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed font-serif">
                {card.desc}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 font-mono text-[10px] text-white/40">
              BRAUN HI-FI SPECIFICATION
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
