"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Earthquake Presets ---
interface QuakePreset {
  id: string;
  name: string;
  ko: string;
  magnitude: number;
  pDelaySec: number;
  sDelaySec: number;
  durationSec: number;
  pga: number; // Peak ground acceleration in %g
  desc: string;
}

const QUAKE_PRESETS: QuakePreset[] = [
  {
    id: "ambient",
    name: "01 // Ambient Micro-Tremor (M1.2)",
    ko: "도시 배경 미동 및 지각 호흡 (M1.2)",
    magnitude: 1.2,
    pDelaySec: 0.2,
    sDelaySec: 0.8,
    durationSec: 2.5,
    pga: 0.02,
    desc: "Gentle background micro-tremors and subtle atmospheric pressure waves",
  },
  {
    id: "alpine",
    name: "02 // Alpine Regional Quake (M4.8)",
    ko: "알프스 단층 중규모 지진 (M4.8)",
    magnitude: 4.8,
    pDelaySec: 0.4,
    sDelaySec: 1.8,
    durationSec: 6.0,
    pga: 0.18,
    desc: "Sharp high-frequency P-wave arrival followed by sustained S-wave shear ringing",
  },
  {
    id: "rupture",
    name: "03 // Major Fault Rupture (M7.8)",
    ko: "대단층 파열 대지진 (M7.8)",
    magnitude: 7.8,
    pDelaySec: 0.5,
    sDelaySec: 2.8,
    durationSec: 10.0,
    pga: 0.85,
    desc: "Violent drum-shaking shockwave and deep tectonic reverberation",
  },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MasterworkSeismographAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private scratchNode: AudioNode | null = null;
  private scratchGain: GainNode | null = null;
  private tickInterval: NodeJS.Timeout | null = null;

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

  // Steel stylus scratching on sooted paper (continuous dry paper whisper)
  startStylusScratch() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.scratchNode) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.04;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.scratchGain = this.ctx.createGain();
      this.scratchGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.scratchGain);
      this.scratchGain.connect(this.ctx.destination);

      noiseSource.start();
      this.scratchNode = noiseSource;

      // Clockwork escapement ticking heartbeat (1Hz)
      this.startClockworkTick();
    } catch {}
  }

  // Clockwork escapement governor gear ticks
  private startClockworkTick() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.008);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.015);
      } catch {}
    }, 1000);
  }

  updateScratchIntensity(velocity: number) {
    if (this.isMuted || !this.scratchGain || !this.ctx) return;
    try {
      const targetGain = 0.035 + Math.min(0.28, Math.abs(velocity) * 0.0035);
      this.scratchGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    } catch {}
  }

  playNeedleSpringPing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(2200, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.035);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }

  triggerTectonicRumble(durationSec: number, intensity: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(65, t);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(38, t);
      osc.frequency.linearRampToValueAtTime(46, t + durationSec * 0.3);
      osc.frequency.linearRampToValueAtTime(30, t + durationSec);

      const peakGain = Math.min(0.45, 0.08 + intensity * 0.38);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(peakGain, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + durationSec + 0.1);
    } catch {}
  }

  stopAll() {
    try {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
      if (this.scratchNode) {
        (this.scratchNode as AudioBufferSourceNode).stop();
        this.scratchNode.disconnect();
        this.scratchNode = null;
      }
    } catch {}
  }
}

export default function MasterworkSeismographDrumBento() {
  // --- States ---
  const [activePreset, setActivePreset] = useState<string>("moderate");
  const [currentPga, setCurrentPga] = useState<number>(0.0);
  const [stylusY, setStylusY] = useState<number>(0);
  const [isQuaking, setIsQuaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTriAxial, setIsTriAxial] = useState<boolean>(false); // 3-Component Mode
  const [drumSpeedIdx, setDrumSpeedIdx] = useState<number>(0); // 15, 30, 60 mm/min
  const [keyHint, setKeyHint] = useState<string | null>(null);

  const DRUM_SPEEDS = [
    { label: "15 mm/min (Standard)", mult: 1.0 },
    { label: "30 mm/min (Teleseismic)", mult: 2.0 },
    { label: "60 mm/min (High-Res)", mult: 4.0 },
  ];

  // Audio Engine & Refs
  const audioRef = useRef<MasterworkSeismographAudio | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physical Harmonic Oscillator Simulation States
  const simRef = useRef({
    displacementZ: 0,
    velocityZ: 0,
    displacementN: 0,
    velocityN: 0,
    displacementE: 0,
    velocityE: 0,
    targetForceZ: 0,
    targetForceN: 0,
    targetForceE: 0,
    chartHistoryZ: [] as number[],
    chartHistoryN: [] as number[],
    chartHistoryE: [] as number[],
  });

  useEffect(() => {
    audioRef.current = new MasterworkSeismographAudio();
    audioRef.current.startStylusScratch();

    return () => {
      audioRef.current?.stopAll();
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        audioRef.current.stopAll();
      } else {
        audioRef.current.startStylusScratch();
      }
    }
  };

  const curSpeed = DRUM_SPEEDS[drumSpeedIdx];

  // Trigger Seismic Event
  const triggerSeismicEvent = useCallback(
    (preset: QuakePreset) => {
      setActivePreset(preset.id);
      setIsQuaking(true);
      audioRef.current?.playNeedleSpringPing();

      const startTime = performance.now();
      const magIntensity = preset.magnitude / 8.0;
      audioRef.current?.triggerTectonicRumble(preset.durationSec, magIntensity);

      const eventDurationMs = preset.durationSec * 1000;
      const pDelayMs = preset.pDelaySec * 1000;
      const sDelayMs = preset.sDelaySec * 1000;

      const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        if (elapsed > eventDurationMs) {
          clearInterval(interval);
          setIsQuaking(false);
          simRef.current.targetForceZ = 0;
          simRef.current.targetForceN = 0;
          simRef.current.targetForceE = 0;
          setCurrentPga(0.01);
          return;
        }

        // P-wave phase (Vertical Z dominated)
        let fZ = 0, fN = 0, fE = 0;
        if (elapsed >= pDelayMs && elapsed < sDelayMs) {
          const tP = (elapsed - pDelayMs) * 0.001;
          fZ = Math.sin(tP * 48) * (preset.magnitude * 5.0) * Math.exp(-tP * 1.5);
          fN = Math.sin(tP * 42) * (preset.magnitude * 2.5) * Math.exp(-tP * 1.5);
          fE = Math.cos(tP * 44) * (preset.magnitude * 2.2) * Math.exp(-tP * 1.5);
          setCurrentPga(Math.round(preset.pga * 0.35 * 100) / 100);
        }
        // S-wave phase (Horizontal N and E dominated)
        else if (elapsed >= sDelayMs) {
          const tS = (elapsed - sDelayMs) * 0.001;
          const sAmp = preset.magnitude * 14.5 * Math.exp(-tS * 0.85);
          fZ = Math.sin(tS * 14) * (sAmp * 0.5);
          fN = (Math.sin(tS * 12) * 0.7 + Math.sin(tS * 20) * 0.3) * sAmp;
          fE = (Math.cos(tS * 10) * 0.8 + Math.sin(tS * 18) * 0.2) * sAmp * 0.9;
          setCurrentPga(Math.round(preset.pga * (sAmp / (preset.magnitude * 14.5)) * 100) / 100);
        }

        simRef.current.targetForceZ = fZ;
        simRef.current.targetForceN = fN;
        simRef.current.targetForceE = fE;
      }, 16);
    },
    []
  );

  // Manual Canvas Tap Impulse
  const handleCanvasTap = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - (rect.top + rect.height / 2);
      const impulse = (clickY / (rect.height / 2)) * 65;

      simRef.current.velocityZ += impulse;
      simRef.current.velocityN += impulse * 0.7;
      simRef.current.velocityE += impulse * 0.5;
      audioRef.current?.playNeedleSpringPing();
      setCurrentPga(Math.round(Math.abs(impulse) * 0.012 * 100) / 100);
    },
    []
  );

  const dynamicTypography = useMemo(() => {
    const absDisp = Math.abs(stylusY);
    const factor = Math.min(1.0, absDisp / 45);
    const wght = Math.round(300 + factor * 550);
    const slnt = Math.round(factor * -12);
    const wdth = Math.round(85 + factor * 40);
    return { wght, slnt, wdth };
  }, [stylusY]);

  // Main 60fps Drum Rotation & Harmonic Oscillator Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();
    const historyLength = 580;
    simRef.current.chartHistoryZ = new Array(historyLength).fill(0);
    simRef.current.chartHistoryN = new Array(historyLength).fill(0);
    simRef.current.chartHistoryE = new Array(historyLength).fill(0);

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) * 0.001);
      lastTime = now;

      const k = 140;
      const c = 8.5;
      const m = 1.0;

      // Z Component Kinematics
      const springZ = -k * simRef.current.displacementZ;
      const dampZ = -c * simRef.current.velocityZ;
      const accelZ = (springZ + dampZ + simRef.current.targetForceZ) / m;
      simRef.current.velocityZ += accelZ * dt;
      simRef.current.displacementZ += simRef.current.velocityZ * dt;

      // N Component Kinematics
      const springN = -k * simRef.current.displacementN;
      const dampN = -c * simRef.current.velocityN;
      const accelN = (springN + dampN + simRef.current.targetForceN) / m;
      simRef.current.velocityN += accelN * dt;
      simRef.current.displacementN += simRef.current.velocityN * dt;

      // E Component Kinematics
      const springE = -k * simRef.current.displacementE;
      const dampE = -c * simRef.current.velocityE;
      const accelE = (springE + dampE + simRef.current.targetForceE) / m;
      simRef.current.velocityE += accelE * dt;
      simRef.current.displacementE += simRef.current.velocityE * dt;

      setStylusY(simRef.current.displacementZ);
      audioRef.current?.updateScratchIntensity(simRef.current.velocityZ);

      // Append history
      simRef.current.chartHistoryZ.push(simRef.current.displacementZ);
      simRef.current.chartHistoryN.push(simRef.current.displacementN);
      simRef.current.chartHistoryE.push(simRef.current.displacementE);

      if (simRef.current.chartHistoryZ.length > historyLength) simRef.current.chartHistoryZ.shift();
      if (simRef.current.chartHistoryN.length > historyLength) simRef.current.chartHistoryN.shift();
      if (simRef.current.chartHistoryE.length > historyLength) simRef.current.chartHistoryE.shift();

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark Smoked Charcoal Paper Substrate
      ctx.fillStyle = "#141923";
      ctx.fillRect(0, 0, w, h);

      // Time axis grid lines
      ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
      ctx.lineWidth = 1;

      const minuteSpacing = 48 * curSpeed.mult;
      const offset = (now * 0.04 * curSpeed.mult) % minuteSpacing;
      for (let x = -offset; x < w; x += minuteSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const stylusX = w - 40;

      if (!isTriAxial) {
        // --- Single Z Component Trace ---
        const cy = h / 2;

        // Amplitude Guides
        [-40, -20, 0, 20, 40].forEach((yOff) => {
          ctx.beginPath();
          ctx.moveTo(0, cy + yOff);
          ctx.lineTo(w, cy + yOff);
          ctx.stroke();
        });

        // Centerline
        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Z-Waveform
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = Math.min(15, Math.abs(simRef.current.displacementZ) * 0.5);
        ctx.beginPath();
        const histZ = simRef.current.chartHistoryZ;
        for (let i = 0; i < histZ.length; i++) {
          const x = (i / historyLength) * (w - 40);
          const y = cy + histZ[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Stylus Arm
        const needleY = cy + simRef.current.displacementZ;
        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(stylusX + 30, cy);
        ctx.lineTo(stylusX, needleY);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(stylusX, needleY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // --- Tri-Axial 3-Component Mode (Z, N-S, E-W) ---
        const channels = [
          { name: "Z (Vertical)", color: "#00f0ff", cy: h * 0.22, hist: simRef.current.chartHistoryZ, disp: simRef.current.displacementZ },
          { name: "N (North-South)", color: "#ffb703", cy: h * 0.50, hist: simRef.current.chartHistoryN, disp: simRef.current.displacementN },
          { name: "E (East-West)", color: "#e63946", cy: h * 0.78, hist: simRef.current.chartHistoryE, disp: simRef.current.displacementE },
        ];

        channels.forEach((ch) => {
          // Channel baseline
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath();
          ctx.moveTo(0, ch.cy);
          ctx.lineTo(w, ch.cy);
          ctx.stroke();

          // Label
          ctx.fillStyle = ch.color;
          ctx.font = "bold 9px monospace";
          ctx.fillText(ch.name, 12, ch.cy - 16);

          // Waveform
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let i = 0; i < ch.hist.length; i++) {
            const x = (i / historyLength) * (w - 40);
            const y = ch.cy + ch.hist[i] * 0.75;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Stylus
          const needleY = ch.cy + ch.disp * 0.75;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(stylusX, needleY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [curSpeed, isTriAxial]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        simRef.current.velocityZ += 38;
        simRef.current.velocityN += 26;
        simRef.current.velocityE += 20;
        audioRef.current?.playNeedleSpringPing();
      } else if (e.key === "1") {
        triggerSeismicEvent(QUAKE_PRESETS[0]);
      } else if (e.key === "2") {
        triggerSeismicEvent(QUAKE_PRESETS[1]);
      } else if (e.key === "3") {
        triggerSeismicEvent(QUAKE_PRESETS[2]);
      } else if (e.code === "KeyT") {
        setKeyHint("T");
        setIsTriAxial((prev) => !prev);
      } else if (e.code === "KeyG") {
        setKeyHint("G");
        setDrumSpeedIdx((prev) => (prev + 1) % DRUM_SPEEDS.length);
      } else if (e.code === "KeyC") {
        simRef.current.chartHistoryZ = new Array(580).fill(0);
        simRef.current.chartHistoryN = new Array(580).fill(0);
        simRef.current.chartHistoryE = new Array(580).fill(0);
        simRef.current.displacementZ = 0;
        simRef.current.displacementN = 0;
        simRef.current.displacementE = 0;
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
  }, [triggerSeismicEvent, DRUM_SPEEDS.length]);

  return (
    <div className="relative min-h-screen w-full bg-[#080a0f] text-[#e2e5eb] font-sans antialiased selection:bg-[#00f0ff] selection:text-black p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss Header Console (ETH Zurich Geophysics / Müller-Brockmann Lineage) */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b202c] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#00f0ff] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            Day 051 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Mechanical Seismograph Drum & Inertial Pendulum Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            1904 에밀 비헤르트(Wiechert) 역진자 지진계, 회전 원통형 그을음 종이 드럼, P파/S파 지진 충격파, 그리고 스위스 지진학-에디토리얼 건축
          </p>
        </div>

        {/* Global Mechanical & Geophysical Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#11141c] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181d28] hover:bg-[#252d3d] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">CHANNELS: </span>
            <span className="text-[#00f0ff] font-bold">{isTriAxial ? "3-COMPONENT (Z,N,E)" : "SINGLE (Z)"}</span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">PEAK PGA: </span>
            <span className={currentPga > 0.2 ? "text-[#e63946] font-bold" : "text-[#00f0ff] font-bold"}>
              {currentPga.toFixed(2)} g
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">SPEED: </span>
            <span className="text-[#ffb703] font-bold">{curSpeed.label}</span>
          </div>
        </div>
      </header>

      {/* Richter Magnitude Event Selector Rail */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {QUAKE_PRESETS.map((p) => {
          const isSelected = p.id === activePreset;
          return (
            <button
              key={p.id}
              onClick={() => triggerSeismicEvent(p)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#161a25] border-[#00f0ff] shadow-lg shadow-[#00f0ff]/10"
                  : "bg-[#0b0d13] border-[#1d222e] hover:border-[#2d3444] hover:bg-[#10131a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#94a3b8]">{p.name}</span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    isSelected ? "bg-[#00f0ff] text-black" : "text-[#64748b]"
                  }`}
                >
                  M{p.magnitude.toFixed(1)}
                </span>
              </div>
              <div className="text-sm md:text-base font-bold text-[#f8f9fa] mt-1">{p.ko}</div>
              <div className="text-xs text-[#71717a] mt-0.5">{p.desc}</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Seismological Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: Rotating Drum Seismograph Canvas (7 cols) */}
        <section className="lg:col-span-7 bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none">
          <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
              01 // 1904 Emil Wiechert Cylindrical Drum Seismograph
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTriAxial((prev) => !prev)}
                className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1d2332] text-[#00f0ff] hover:bg-[#283247] border border-[#00f0ff]/30 transition-all"
              >
                {isTriAxial ? "VIEW SINGLE Z [T]" : "VIEW 3-COMPONENT (Z,N,E) [T]"}
              </button>
            </div>
          </div>

          {/* Interactive Seismogram Canvas */}
          <div className="relative flex items-center justify-center py-2">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasTap}
              width={640}
              height={300}
              className="w-full h-[260px] md:h-[300px] rounded-xl cursor-crosshair border border-[#1e2330] shadow-inner"
            />
          </div>

          {/* Seismograph Drum Deck Controls & Guidance */}
          <div className="mt-4 pt-4 border-t border-[#181c26] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#788599]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00f0ff]" />
              <span>CLICK CANVAS TO DELIVER MANUAL SEISMIC IMPULSE</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrumSpeedIdx((prev) => (prev + 1) % DRUM_SPEEDS.length)}
                className="text-[#ffb703] hover:underline"
              >
                [GEAR: {curSpeed.label} (G)]
              </button>
              <button
                onClick={() => {
                  simRef.current.chartHistoryZ = new Array(580).fill(0);
                  simRef.current.chartHistoryN = new Array(580).fill(0);
                  simRef.current.chartHistoryE = new Array(580).fill(0);
                  simRef.current.displacementZ = 0;
                  simRef.current.displacementN = 0;
                  simRef.current.displacementE = 0;
                  audioRef.current?.playNeedleSpringPing();
                }}
                className="text-[#00f0ff] hover:underline"
              >
                [CLEAR TRACE]
              </button>
            </div>
          </div>
        </section>

        {/* Cell 2 & 3: P/S Wave Telemetry & Kinetic Typographic Specimen (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Top: Seismic P/S Wave Kinematics Telemetry */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                02 // P-Wave & S-Wave Kinematics
              </span>
              <span className="text-xs font-mono text-[#00f0ff]">
                ETH ZURICH STATION (ZUR)
              </span>
            </div>

            {/* Geophysical Telemetry Matrix */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl">
                <div className="text-[10px] text-[#ffb703]">PRIMARY (P) COMPRESSION</div>
                <div className="text-base font-bold text-[#f8f9fa] mt-0.5">V_p = 6.2 km/s</div>
                <div className="text-[9px] text-[#8d96a5] mt-1">High-Freq Initial Tremor</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl">
                <div className="text-[10px] text-[#e63946]">SECONDARY (S) SHEAR</div>
                <div className="text-base font-bold text-[#f8f9fa] mt-0.5">V_s = 3.5 km/s</div>
                <div className="text-[9px] text-[#8d96a5] mt-1">Destructive Transverse Wave</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl">
                <div className="text-[10px] text-[#64748b]">S - P TIME LAG</div>
                <div className="text-base font-bold text-[#00f0ff] mt-0.5">Δt = 4.8 sec</div>
                <div className="text-[9px] text-[#8d96a5] mt-1">Focal Distance ~42 km</div>
              </div>
              <div className="bg-[#07080a] border border-[#1f2430] p-3 rounded-xl">
                <div className="text-[10px] text-[#64748b]">INERTIAL DAMPING</div>
                <div className="text-base font-bold text-[#10b981] mt-0.5">ζ = 0.65 Critical</div>
                <div className="text-[9px] text-[#8d96a5] mt-1">Dashpot Oil Damped</div>
              </div>
            </div>
          </div>

          {/* Bottom: Swiss Seismological-Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
                03 // Sympathetic Micro-Tremor Typography
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicTypography.wght} · slnt: {dynamicTypography.slnt}°
              </span>
            </div>

            {/* Kinetic Variable Typography Specimen */}
            <div className="py-4 relative min-h-[130px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-75 select-none"
                style={{
                  fontWeight: dynamicTypography.wght,
                  fontStyle: dynamicTypography.slnt !== 0 ? "italic" : "normal",
                  color: "#f8f9fa",
                  textShadow: Math.abs(stylusY) > 5 ? "0 0 20px rgba(0, 240, 255, 0.5)" : "none",
                  transform: `translateY(${stylusY * 0.15}px)`,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ffb703] mb-1.5 uppercase font-semibold">
                  Tectonic Pulse (mẍ + cẋ + kx = F)
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight text-[#f8f9fa] tracking-tight">
                  대지의 맥박을 가느다란 바늘에 새기다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2.5 max-w-md mx-auto leading-relaxed">
                  그을음 종이 위를 스치는 강철 펜촉이 지진파의 충격을 기록할 때, 스위스 에디토리얼 활자는 대지의 진동에 공명하여 굵기와 기울기를 유기적으로 호흡합니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex items-center justify-between font-mono text-xs text-[#788599]">
              <div>
                <span>INSTRUMENT: </span>
                <span className="text-[#f8f9fa] font-bold">Wiechert 1904 Inverted</span>
              </div>
              <div>
                <span>STATUS: </span>
                <span className="text-[#00f0ff] font-bold">Continuous Drum Scan</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Quick Manual Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              simRef.current.velocityZ += 38;
              simRef.current.velocityN += 26;
              simRef.current.velocityE += 20;
              audioRef.current?.playNeedleSpringPing();
            }}
            className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border flex items-center gap-2 bg-[#161a25] text-[#00f0ff] border-[#00f0ff] hover:bg-[#00f0ff] hover:text-black shadow-lg shadow-[#00f0ff]/10 active:scale-95"
          >
            <span>★ MANUAL TAP IMPULSE [SPACE]</span>
          </button>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL CONTROLS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#00f0ff] font-bold" : ""}>[SPACE] Tap Impulse</span>
            <span>·</span>
            <span className={keyHint === "T" ? "text-[#ffb703] font-bold" : ""}>[T] 3-Component</span>
            <span>·</span>
            <span className={keyHint === "G" ? "text-[#ffb703] font-bold" : ""}>[G] Gear Speed</span>
            <span>·</span>
            <span>[1/2/3] Quake Presets</span>
            <span>·</span>
            <span>[M] Mute</span>
          </div>
        </div>

        {/* Right: Great Quake Trigger */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => triggerSeismicEvent(QUAKE_PRESETS[2])}
            className="px-5 py-3.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border bg-[#1a1215] text-[#e63946] border-[#e63946] hover:bg-[#e63946] hover:text-white"
          >
            <span>TRIGGER M7.8 RUPTURE [3]</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
