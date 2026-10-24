"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Optical Disc Media Formats ---
interface DiscFormat {
  id: string;
  name: string;
  pitchUm: number; // nano-track pitch in micrometers
  capacity: string;
  laserNm: number;
  laserColor: string;
  fanMultiplier: number;
  description: string;
}

const DISC_FORMATS: DiscFormat[] = [
  {
    id: "cd",
    name: "01 // Compact Disc (CD)",
    pitchUm: 1.60,
    capacity: "700 MB (80 Min)",
    laserNm: 780,
    laserColor: "#ef4444",
    fanMultiplier: 1.0,
    description: "Original 1982 Red Book Standard · 1.6μm Spiral Track Pitch · Classic Wide Spectral Fan",
  },
  {
    id: "dvd",
    name: "02 // Digital Versatile Disc (DVD)",
    pitchUm: 0.74,
    capacity: "4.7 GB (Single Layer)",
    laserNm: 650,
    laserColor: "#f97316",
    fanMultiplier: 1.5,
    description: "1995 High-Density Standard · 0.74μm Track Pitch · Sharpened Dispersion Curvature",
  },
  {
    id: "bd",
    name: "03 // Blu-ray Disc (BD)",
    pitchUm: 0.32,
    capacity: "25.0 GB (Single Layer)",
    laserNm: 405,
    laserColor: "#3b82f6",
    fanMultiplier: 2.2,
    description: "2006 Blue-Violet Laser Standard · 0.32μm Nano-Pitch · Ultra-Dense Compressed Diffraction",
  },
];

// --- Braun Atelier Audio Tracks ---
interface AudioTrack {
  id: number;
  title: string;
  koTitle: string;
  duration: string;
  freqs: number[];
}

const BRAUN_TRACKS: AudioTrack[] = [
  {
    id: 1,
    title: "Structural Light Overture in E Major",
    koTitle: "제1악장: 구조광 서곡 (E Major)",
    duration: "03:42",
    freqs: [329.63, 415.3, 493.88, 659.25], // E4, G#4, B4, E5
  },
  {
    id: 2,
    title: "Fraunhofer Dispersion Etude",
    koTitle: "제2악장: 프라운호퍼 분광 에튀드",
    duration: "04:15",
    freqs: [261.63, 329.63, 392.0, 523.25], // C4, E4, G4, C5
  },
  {
    id: 3,
    title: "Braun Atelier Minimalism Ambient",
    koTitle: "제3악장: 브라운 아틀리에 미니멀리즘",
    duration: "05:08",
    freqs: [220.0, 277.18, 329.63, 440.0], // A3, C#4, E4, A4
  },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MasterworkOpticalDiscAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicOscs: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;

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

  // Central hub rosette push-release tactile 'click-thud'
  playHubRelease(isPopped: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. High plastic tooth latch snap
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      filter1.type = "highpass";
      filter1.frequency.setValueAtTime(2400, t);

      osc1.type = "square";
      osc1.frequency.setValueAtTime(isPopped ? 3200 : 1800, t);
      osc1.frequency.exponentialRampToValueAtTime(500, t + 0.015);

      gain1.gain.setValueAtTime(0.35, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.03);

      // 2. Acrylic jewel case body resonance thud
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(isPopped ? 210 : 140, t + 0.008);
      osc2.frequency.exponentialRampToValueAtTime(45, t + 0.055);

      gain2.gain.setValueAtTime(0.45, t + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t + 0.008);
      osc2.stop(t + 0.075);
    } catch {
      // Audio safe
    }
  }

  // Disc aerodynamic whisper whir during gyroscopic tilt
  playDiscWhir(velocity: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(900 + Math.min(1200, velocity * 25), t);
      filter.Q.setValueAtTime(3.5, t);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(240 + Math.min(300, velocity * 8), t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {
      // Audio safe
    }
  }

  // Crystalline spectral harmonic ping when diffraction alignment peaks
  playSpectralChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2093, t); // C7
      osc.frequency.exponentialRampToValueAtTime(2080, t + 0.6);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.75);
    } catch {
      // Audio safe
    }
  }

  // Spindle Motor Spin-up Acceleration Whine
  playMotorSpinUp(isPlaying: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      if (isPlaying) {
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.25);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      } else {
        osc.frequency.setValueAtTime(480, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    } catch {
      // Audio safe
    }
  }

  // Start Music Track Playback Chords
  startMusic(track: AudioTrack) {
    if (this.isMuted) return;
    this.stopMusic();
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.001, t);
      this.musicGain.gain.exponentialRampToValueAtTime(0.12, t + 0.4);
      this.musicGain.connect(this.ctx.destination);

      this.musicOscs = track.freqs.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t);
        osc.connect(this.musicGain!);
        osc.start(t);
        return osc;
      });
    } catch {
      // Audio safe
    }
  }

  // Stop Music Track
  stopMusic() {
    try {
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
        this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      }
      setTimeout(() => {
        this.musicOscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.musicOscs = [];
        this.musicGain = null;
      }, 250);
    } catch {}
  }
}

export default function MasterworkOpticalDiscDiffractionBento() {
  // --- States ---
  const [formatIdx, setFormatIdx] = useState<number>(0);
  const [trackIdx, setTrackIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [tiltX, setTiltX] = useState<number>(10); // degrees (-25 to 25)
  const [tiltY, setTiltY] = useState<number>(-12); // degrees (-25 to 25)
  const [isDiscPopped, setIsDiscPopped] = useState<boolean>(false);
  const [isDraggingDisc, setIsDraggingDisc] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(48);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  // Audio Engine & Canvas Refs
  const audioRef = useRef<MasterworkOpticalDiscAudio | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const discDeckRef = useRef<HTMLDivElement | null>(null);
  const prevPeakRef = useRef<boolean>(false);
  const spinAngleRef = useRef<number>(0);

  useEffect(() => {
    audioRef.current = new MasterworkOpticalDiscAudio();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        audioRef.current.stopMusic();
      } else if (isPlaying) {
        audioRef.current.startMusic(BRAUN_TRACKS[trackIdx]);
      }
    }
  };

  const curFormat = DISC_FORMATS[formatIdx];
  const curTrack = BRAUN_TRACKS[trackIdx];

  // Calculated Light Incident Angle & Diffraction Vector
  const tiltMagnitude = useMemo(() => {
    return Math.sqrt(tiltX * tiltX + tiltY * tiltY);
  }, [tiltX, tiltY]);

  // Fraunhofer Diffraction Spectral Dominant Wavelength (nm)
  // lambda = d * sin(theta_tilt)
  const dominantWavelength = useMemo(() => {
    const rad = (tiltMagnitude * Math.PI) / 180;
    const rawLambda = curFormat.pitchUm * Math.sin(rad) * 1000 * 0.8;
    const clamped = Math.max(380, Math.min(750, 400 + (rawLambda % 350)));
    return Math.round(clamped);
  }, [tiltMagnitude, curFormat]);

  // Peak spectral alignment chime
  useEffect(() => {
    const isPeak = Math.abs(tiltX) < 2 && Math.abs(tiltY) < 2;
    if (isPeak && !prevPeakRef.current) {
      audioRef.current?.playSpectralChime();
    }
    prevPeakRef.current = isPeak;
  }, [tiltX, tiltY]);

  // Dynamic Variable Font Weight mapped to diffraction beam intensity
  const dynamicFontWeight = useMemo(() => {
    const factor = Math.min(1.0, tiltMagnitude / 22);
    return Math.round(250 + factor * 600);
  }, [tiltMagnitude]);

  // Center Hub Push-Release Action
  const triggerHubRelease = useCallback(() => {
    const nextPopped = !isDiscPopped;
    setIsDiscPopped(nextPopped);
    audioRef.current?.playHubRelease(nextPopped);
    if (nextPopped && isPlaying) {
      // Popping disc pauses motor
      setIsPlaying(false);
      audioRef.current?.stopMusic();
    }
  }, [isDiscPopped, isPlaying]);

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (isDiscPopped) {
      // Lock disc first
      setIsDiscPopped(false);
      audioRef.current?.playHubRelease(false);
    }
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    audioRef.current?.playMotorSpinUp(nextPlaying);
    if (nextPlaying) {
      audioRef.current?.startMusic(curTrack);
    } else {
      audioRef.current?.stopMusic();
    }
  }, [isPlaying, isDiscPopped, curTrack]);

  // Format Switch
  const switchFormat = (idx: number) => {
    setFormatIdx(idx);
    audioRef.current?.playHubRelease(false);
  };

  // Track Switch
  const switchTrack = (idx: number) => {
    setTrackIdx(idx);
    if (isPlaying) {
      audioRef.current?.startMusic(BRAUN_TRACKS[idx]);
    }
  };

  // Playback Timer Tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackTime((prev) => (prev + 1) % 320);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Laser Sled Position normalized [0, 1]
  const laserSledProgress = useMemo(() => {
    return (playbackTime % 240) / 240;
  }, [playbackTime]);

  // --- Real-time 60fps Canvas Diffraction Grating Shader ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      if (isPlaying && !isDiscPopped) {
        spinAngleRef.current += delta * 3.5; // continuous spindle rotation
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 16;
      const innerHole = radius * 0.18;
      const clampArea = radius * 0.38;

      ctx.clearRect(0, 0, w, h);

      // 1. Mirrored Polycarbonate Disc Substrate
      const baseGrad = ctx.createRadialGradient(cx, cy, innerHole, cx, cy, radius);
      baseGrad.addColorStop(0, "#1c212a");
      baseGrad.addColorStop(0.35, "#303846");
      baseGrad.addColorStop(0.7, "#252b36");
      baseGrad.addColorStop(1, "#161a22");
      ctx.fillStyle = baseGrad;
      ctx.beginPath);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Fraunhofer Diffraction Rainbow Fan Arcs
      const tiltAngleRad = Math.atan2(tiltY, tiltX);
      const fanMult = curFormat.fanMultiplier;
      const numFans = 4;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.arc(cx, cy, clampArea, 0, Math.PI * 2, true);
      ctx.clip();

      for (let f = 0; f < numFans; f++) {
        const baseFanAngle = tiltAngleRad + (f * Math.PI) / 2 + spinAngleRef.current;
        const fanSpread = (0.46 * Math.PI) / fanMult;

        const fanGrad = ctx.createConicGradient(baseFanAngle, cx, cy);
        fanGrad.addColorStop(0, "rgba(123, 44, 191, 0)"); // Violet edge
        fanGrad.addColorStop(0.12, "rgba(67, 97, 238, 0.75)"); // Indigo
        fanGrad.addColorStop(0.25, "rgba(0, 240, 255, 0.88)"); // Cyan
        fanGrad.addColorStop(0.4, "rgba(16, 185, 129, 0.88)"); // Emerald
        fanGrad.addColorStop(0.55, "rgba(255, 183, 3, 0.88)"); // Amber
        fanGrad.addColorStop(0.7, "rgba(230, 57, 70, 0.82)"); // Crimson
        fanGrad.addColorStop(0.85, "rgba(123, 44, 191, 0.5)"); // Violet return
        fanGrad.addColorStop(1.0, "rgba(123, 44, 191, 0)");

        ctx.fillStyle = fanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, baseFanAngle - fanSpread, baseFanAngle + fanSpread);
        ctx.lineTo(cx, cy);
        ctx.fill();
      }

      // Micro spiral tracks texture overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let r = clampArea + 10; r < radius - 5; r += 14) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Active Laser Pickup Sled Tracking Dot
      const activeLaserRadius = clampArea + 12 + laserSledProgress * (radius - clampArea - 24);
      ctx.strokeStyle = curFormat.laserColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, activeLaserRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 4. Transparent Inner Clamping Ring & Center Hub Hole
      ctx.fillStyle = "#101319";
      ctx.beginPath();
      ctx.arc(cx, cy, clampArea, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Laser Lead-in Ring Markings
      ctx.strokeStyle = curFormat.laserColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, clampArea - 8, 0, Math.PI * 2);
      ctx.stroke();

      // Center Spindle Hole
      ctx.fillStyle = "#07080a";
      ctx.beginPath();
      ctx.arc(cx, cy, innerHole, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Specular Sunlight Glare Streak
      const glareGrad = ctx.createLinearGradient(
        cx - tiltX * 8,
        cy - tiltY * 8,
        cx + tiltX * 8,
        cy + tiltY * 8
      );
      glareGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      glareGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.16)");
      glareGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glareGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tiltX, tiltY, curFormat, isDiscPopped, isPlaying, laserSledProgress]);

  // Pointer Dragging for 3D Gyroscopic Tilt
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingDisc(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingDisc || !discDeckRef.current) return;
    const rect = discDeckRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    const targetX = Math.max(-25, Math.min(25, -ny * 25));
    const targetY = Math.max(-25, Math.min(25, nx * 25));

    const vel = Math.abs(targetX - tiltX) + Math.abs(targetY - tiltY);
    if (vel > 1.5) {
      audioRef.current?.playDiscWhir(vel);
    }

    setTiltX(targetX);
    setTiltY(targetY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingDisc) {
      setIsDraggingDisc(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard Navigation Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        togglePlay();
      } else if (e.code === "KeyP") {
        e.preventDefault();
        setKeyHint("P");
        triggerHubRelease();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setKeyHint("LEFT");
        setTiltY((prev) => Math.max(-25, prev - 5));
        audioRef.current?.playDiscWhir(8);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setKeyHint("RIGHT");
        setTiltY((prev) => Math.min(25, prev + 5));
        audioRef.current?.playDiscWhir(8);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setKeyHint("UP");
        setTiltX((prev) => Math.min(25, prev + 5));
        audioRef.current?.playDiscWhir(8);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setKeyHint("DOWN");
        setTiltX((prev) => Math.max(-25, prev - 5));
        audioRef.current?.playDiscWhir(8);
      } else if (e.key === "1") {
        switchFormat(0);
      } else if (e.key === "2") {
        switchFormat(1);
      } else if (e.key === "3") {
        switchFormat(2);
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
  }, [togglePlay, triggerHubRelease]);

  return (
    <div className="relative min-h-screen w-full bg-[#07080b] text-[#e2e5eb] font-sans antialiased selection:bg-[#00f0ff] selection:text-black p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss Header Console (Braun Atelier CD3 Aesthetic) */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b1f2b] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#00f0ff] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            Day 048 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Optical Disc Diffraction Grating & Spectral Interference Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            1.6μm 나노 트랙 회절격자, 3D 자이로스코프 틸트 동역학, 주얼 케이스 허브 릴리즈, 그리고 브라운 아틀리에(Braun CD3) 구조색 에디토리얼 건축
          </p>
        </div>

        {/* Global Optical & Mechanical Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0f121a] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161a25] hover:bg-[#22283a] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">MOTOR: </span>
            <span className={isPlaying ? "text-[#10b981] font-bold" : "text-[#ffb703] font-bold"}>
              {isPlaying ? "300 RPM [PLAY]" : "STANDBY"}
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">TRACK PITCH: </span>
            <span className="text-[#00f0ff] font-bold">{curFormat.pitchUm} μm</span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">SPECTRUM: </span>
            <span className="text-[#f8f9fa] font-bold">{dominantWavelength} nm</span>
          </div>
        </div>
      </header>

      {/* Optical Format Selector Rail */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {DISC_FORMATS.map((fmt, idx) => {
          const isSelected = idx === formatIdx;
          return (
            <button
              key={fmt.id}
              onClick={() => switchFormat(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#141822] border-[#00f0ff] shadow-lg shadow-[#00f0ff]/10"
                  : "bg-[#0b0d13] border-[#1d222e] hover:border-[#2d3444] hover:bg-[#10131a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#94a3b8]">{fmt.name}</span>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: isSelected ? fmt.laserColor : "transparent",
                    color: isSelected ? "#ffffff" : "#64748b",
                    border: `1px solid ${isSelected ? "transparent" : "#2d3444"}`,
                  }}
                >
                  λ = {fmt.laserNm}nm
                </span>
              </div>
              <div className="text-sm md:text-base font-bold text-[#f8f9fa] mt-1">{fmt.capacity}</div>
              <div className="text-xs text-[#71717a] mt-0.5">{fmt.description}</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Prism Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: 3D Gyroscopic Disc Chamber (6 cols) */}
        <section
          ref={discDeckRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="lg:col-span-6 bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none"
        >
          <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: curFormat.laserColor }} />
              01 // 3D Optical Disc Chamber (120mm)
            </span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  isPlaying
                    ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/20"
                    : "bg-[#1f2533] text-[#f8f9fa] hover:bg-[#2d3548]"
                }`}
              >
                {isPlaying ? "❚❚ PAUSE" : "▶ PLAY [SPACE]"}
              </button>
            </div>
          </div>

          {/* 3D Perspective Gyroscopic Deck */}
          <div className="relative flex items-center justify-center py-4 perspective-1000">
            <div
              className="relative transition-transform duration-75 cursor-grab active:cursor-grabbing touch-none"
              style={{
                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${
                  isDiscPopped ? "translateZ(32px) scale(1.05)" : "translateZ(0px)"
                }`,
                filter: isDiscPopped ? "drop-shadow(0 25px 35px rgba(0,0,0,0.85))" : "drop-shadow(0 15px 25px rgba(0,0,0,0.6))",
              }}
            >
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="w-[320px] h-[320px] md:w-[360px] md:h-[360px] rounded-full"
              />

              {/* Central Hub Push Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHubRelease();
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono text-[9px] font-extrabold tracking-wider border-2 transition-all shadow-inner ${
                  isDiscPopped
                    ? "bg-[#ffb703] text-black border-white scale-95 shadow-orange-900/40"
                    : "bg-[#181d26] text-[#9ca3af] border-[#374151] hover:text-white hover:border-[#00f0ff] active:scale-90"
                }`}
              >
                <span>{isDiscPopped ? "POPPED" : "PUSH"}</span>
                <span className="text-[7px] text-[#64748b]">HUB [P]</span>
              </button>
            </div>
          </div>

          {/* Disc Deck Controls & Tilt Guidance */}
          <div className="mt-4 pt-4 border-t border-[#181c26] flex items-center justify-between text-xs font-mono text-[#788599]">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isPlaying ? "bg-[#10b981] animate-pulse" : "bg-[#64748b]"}`} />
              <span>{isPlaying ? "SPINDLE ROTATING 300 RPM" : "DRAG DECK TO TILT 3D PERSPECTIVE"}</span>
            </div>
            <button
              onClick={() => {
                setTiltX(0);
                setTiltY(0);
                audioRef.current?.playDiscWhir(10);
              }}
              className="text-[#00f0ff] hover:underline"
            >
              [RESET HORIZON 0°]
            </button>
          </div>
        </section>

        {/* Cell 2 & 3: Structural Color Telemetry & Audio-Editorial Stage (6 cols) */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          {/* Top: Fraunhofer Dispersion & Track Player Stage */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                02 // Braun Atelier CD3 Audio Deck
              </span>
              <span className="text-xs font-mono text-[#00f0ff]">
                TRACK 0{curTrack.id} // {Math.floor(playbackTime / 60)}:{(playbackTime % 60).toString().padStart(2, "0")} / {curTrack.duration}
              </span>
            </div>

            {/* Track Selector Bar */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {BRAUN_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => switchTrack(idx)}
                  className={`p-2 rounded-lg text-left font-mono text-xs border transition-all ${
                    idx === trackIdx
                      ? "bg-[#161d2b] border-[#00f0ff] text-white"
                      : "bg-[#0d1017] border-[#1d2330] text-[#71717a] hover:text-[#e2e8f0]"
                  }`}
                >
                  <div className="text-[10px] text-[#64748b]">TRK 0{t.id}</div>
                  <div className="font-bold truncate mt-0.5">{t.title}</div>
                </button>
              ))}
            </div>

            {/* Dispersion Readout Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl font-mono">
                <div className="text-[10px] text-[#64748b]">PITCH (d)</div>
                <div className="text-sm font-bold text-[#f8f9fa] mt-0.5">{curFormat.pitchUm} μm</div>
                <div className="text-[9px] text-[#8d96a5] mt-0.5">{Math.round(1000 / curFormat.pitchUm)} lines/mm</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl font-mono">
                <div className="text-[10px] text-[#64748b]">WAVELENGTH</div>
                <div className="text-sm font-bold text-[#00f0ff] mt-0.5">{dominantWavelength} nm</div>
                <div className="text-[9px] text-[#8d96a5] mt-0.5">Structural Color</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl font-mono">
                <div className="text-[10px] text-[#64748b]">TILT ANGLE</div>
                <div className="text-sm font-bold text-[#ffb703] mt-0.5">{tiltMagnitude.toFixed(1)}°</div>
                <div className="text-[9px] text-[#8d96a5] mt-0.5">Incident Horizon</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl font-mono">
                <div className="text-[10px] text-[#64748b]">DIFFRACTION</div>
                <div className="text-sm font-bold text-[#10b981] mt-0.5">m = ±1</div>
                <div className="text-[9px] text-[#8d96a5] mt-0.5">Primary Fan</div>
              </div>
            </div>

            {/* Continuous Rainbow Spectrum Bar */}
            <div className="mt-4 pt-3 border-t border-[#181c26]">
              <div className="flex justify-between text-[11px] font-mono text-[#64748b] mb-1">
                <span>380nm (Violet)</span>
                <span>500nm (Cyan)</span>
                <span>580nm (Amber)</span>
                <span>750nm (Red)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#7b2cbf] via-[#00f0ff] via-[#10b981] via-[#ffb703] to-[#e63946] relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-md shadow-white transition-all duration-75"
                  style={{
                    left: `${Math.max(0, Math.min(100, ((dominantWavelength - 380) / (750 - 380)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom: Swiss Audio-Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
                03 // Structural-Color Variable Typography (Braun Atelier CD3)
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicFontWeight} · opsz: 36
              </span>
            </div>

            {/* Kinetic Variable Typography Specimen */}
            <div className="py-6 relative min-h-[140px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: dynamicFontWeight,
                  color: "#f8f9fa",
                  textShadow: `0 0 20px rgba(0, 240, 255, ${tiltMagnitude / 35})`,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ffb703] mb-1.5 uppercase font-semibold">
                  Light Wave Interference (mλ = d · sin θ)
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight text-[#f8f9fa] tracking-tight">
                  빛의 파동을 나노 홈에 새겨 음악을 듣다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2.5 max-w-xl mx-auto leading-relaxed">
                  알루미늄 디스크를 기울일 때마다 1.6마이크로미터 나노 홈에서 피어오르는 무지갯빛 부챗살이 활자의 무게를 팽창시키며 완벽한 스위스 오디오-에디토리얼 평형을 완성합니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-[#788599]">
              <div>
                <span>CURRENT AUDIO PIECE: </span>
                <span className="text-[#f8f9fa] font-bold">{curTrack.koTitle}</span>
              </div>
              <div>
                <span>ANGULAR DISPERSION: </span>
                <span className="text-[#00f0ff] font-bold">D = {(1 / (curFormat.pitchUm * 1000)).toFixed(4)} rad/nm</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Play & Hub Latch Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={togglePlay}
            className={`px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border flex items-center gap-2 ${
              isPlaying
                ? "bg-[#10b981] text-black border-[#10b981] shadow-lg shadow-[#10b981]/20"
                : "bg-[#141822] text-[#f8f9fa] border-[#293245] hover:border-[#10b981]"
            }`}
          >
            <span>{isPlaying ? "❚❚ PAUSE MOTOR [SPACE]" : "▶ PLAY MOTOR [SPACE]"}</span>
          </button>
          <button
            onClick={triggerHubRelease}
            className={`px-4 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border ${
              isDiscPopped
                ? "bg-[#ffb703] text-black border-[#ffb703]"
                : "bg-[#141822] text-[#9ca3af] border-[#293245] hover:text-white"
            }`}
          >
            <span>{isDiscPopped ? "DISC UNLATCHED [P]" : "POP HUB [P]"}</span>
          </button>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL CONTROLS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#00f0ff] font-bold" : ""}>[SPACE] Play/Pause</span>
            <span>·</span>
            <span className={keyHint === "P" ? "text-[#ffb703] font-bold" : ""}>[P] Hub Release</span>
            <span>·</span>
            <span className={keyHint === "LEFT" || keyHint === "RIGHT" ? "text-white font-bold" : ""}>[←/→] Tilt Y-Axis</span>
            <span>·</span>
            <span className={keyHint === "UP" || keyHint === "DOWN" ? "text-white font-bold" : ""}>[↑/↓] Tilt X-Axis</span>
            <span>·</span>
            <span>[1/2/3] CD / DVD / Blu-ray</span>
          </div>
        </div>

        {/* Right: Quick Horizon Reset */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setTiltX(0);
              setTiltY(0);
              audioRef.current?.playDiscWhir(15);
            }}
            className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border bg-[#151924] text-[#8d96a5] border-[#273042] hover:text-white hover:border-[#00f0ff]"
          >
            <span>RESET HORIZON (0°, 0°)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
