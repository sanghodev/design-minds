"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Lens Configuration ---
interface LensPreset {
  id: string;
  name: string;
  focalLength: string;
  maxAperture: string;
  bokehCharacter: string;
  minBlurMult: number;
}

const LENS_PRESETS: LensPreset[] = [
  {
    id: "35mm",
    name: "Summilux-M 35mm f/1.4 ASPH",
    focalLength: "35mm",
    maxAperture: "f/1.4",
    bokehCharacter: "Wide Environmental Clarity · Natural Falloff",
    minBlurMult: 0.8,
  },
  {
    id: "50mm",
    name: "Noctilux-M 50mm f/0.95",
    focalLength: "50mm",
    maxAperture: "f/0.95",
    bokehCharacter: "Dreamy Velvety Bokeh · Extreme Subject Isolation",
    minBlurMult: 1.4,
  },
  {
    id: "90mm",
    name: "Summicron-M 90mm f/2.0 APO",
    focalLength: "90mm",
    maxAperture: "f/2.0",
    bokehCharacter: "Compressed Perspective · Razor-Sharp Micro-Contrast",
    minBlurMult: 1.1,
  },
];

// --- Aperture Stops ---
interface FStopInfo {
  fNumber: number;
  label: string;
  radiusRatio: number; // 1.0 (wide open) down to 0.088 (f/16)
  transmission: number; // T-stop relative light transmission percentage
}

const F_STOPS: FStopInfo[] = [
  { fNumber: 1.4, label: "f/1.4", radiusRatio: 1.0, transmission: 100 },
  { fNumber: 2.0, label: "f/2.0", radiusRatio: 0.707, transmission: 50 },
  { fNumber: 2.8, label: "f/2.8", radiusRatio: 0.5, transmission: 25 },
  { fNumber: 4.0, label: "f/4.0", radiusRatio: 0.353, transmission: 12.5 },
  { fNumber: 5.6, label: "f/5.6", radiusRatio: 0.25, transmission: 6.25 },
  { fNumber: 8.0, label: "f/8.0", radiusRatio: 0.177, transmission: 3.12 },
  { fNumber: 11.0, label: "f/11", radiusRatio: 0.125, transmission: 1.56 },
  { fNumber: 16.0, label: "f/16", radiusRatio: 0.088, transmission: 0.78 },
];

// --- Shutter Speeds ---
interface ShutterSpeedInfo {
  seconds: number;
  label: string;
  slitWidthFrac: number; // fraction of curtain height
  curtainSpeedMs: number;
  isBulb?: boolean;
}

const SHUTTER_SPEEDS: ShutterSpeedInfo[] = [
  { seconds: 1 / 1000, label: "1/1000s", slitWidthFrac: 0.06, curtainSpeedMs: 35 },
  { seconds: 1 / 500, label: "1/500s", slitWidthFrac: 0.12, curtainSpeedMs: 45 },
  { seconds: 1 / 250, label: "1/250s", slitWidthFrac: 0.24, curtainSpeedMs: 60 },
  { seconds: 1 / 125, label: "1/125s", slitWidthFrac: 0.48, curtainSpeedMs: 80 },
  { seconds: 1 / 60, label: "1/60s", slitWidthFrac: 0.95, curtainSpeedMs: 110 },
  { seconds: 1 / 30, label: "1/30s", slitWidthFrac: 1.0, curtainSpeedMs: 160 },
  { seconds: 1 / 15, label: "1/15s", slitWidthFrac: 1.0, curtainSpeedMs: 240 },
  { seconds: 1 / 8, label: "1/8s", slitWidthFrac: 1.0, curtainSpeedMs: 380 },
  { seconds: 1 / 4, label: "1/4s", slitWidthFrac: 1.0, curtainSpeedMs: 550 },
  { seconds: 1 / 2, label: "1/2s", slitWidthFrac: 1.0, curtainSpeedMs: 800 },
  { seconds: 1.0, label: "1s", slitWidthFrac: 1.0, curtainSpeedMs: 1200 },
  { seconds: 0, label: "B (Bulb)", slitWidthFrac: 1.0, curtainSpeedMs: 0, isBulb: true },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MechanicalAudioEngine {
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

  // Winding lever ratchet click with physical mechanical body resonance
  playRatchetClick(pitchMult = 1.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Sharp metallic pawl impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2600 * pitchMult, t);
      filter.Q.setValueAtTime(5.0, t);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(950 * pitchMult, t);
      osc.frequency.exponentialRampToValueAtTime(140 * pitchMult, t + 0.016);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.026);

      // 2. Chassis brass resonance body ring
      const oscBody = this.ctx.createOscillator();
      const gainBody = this.ctx.createGain();
      oscBody.type = "sine";
      oscBody.frequency.setValueAtTime(420 * pitchMult, t);
      gainBody.gain.setValueAtTime(0.08, t);
      gainBody.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      oscBody.connect(gainBody);
      gainBody.connect(this.ctx.destination);
      oscBody.start(t);
      oscBody.stop(t + 0.045);
    } catch {
      // Audio safety
    }
  }

  // Aperture ring milled ball-bearing detent click
  playApertureClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(3400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.01);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.014);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.018);
    } catch {
      // Audio safety
    }
  }

  // Focal plane shutter release sequence
  playShutterRelease(durationSeconds: number, isBulbOpen = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Release trip: High-frequency metallic trip click ("snick")
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      filter1.type = "highpass";
      filter1.frequency.setValueAtTime(1600, t);

      osc1.type = "square";
      osc1.frequency.setValueAtTime(2200, t);
      osc1.frequency.exponentialRampToValueAtTime(320, t + 0.02);

      gain1.gain.setValueAtTime(0.45, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.035);

      if (isBulbOpen) return; // In Bulb mode, brake sound plays on release

      // 2. Mechanical escapement clockwork governor whir
      const exposureTime = Math.max(0.02, Math.min(durationSeconds, 1.5));
      const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * exposureTime));
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1900, t);
      noiseFilter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14, t + 0.005);
      noiseGain.gain.setValueAtTime(0.14, t + Math.max(0.015, exposureTime - 0.02));
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + exposureTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noiseSource.start(t + 0.005);
      noiseSource.stop(t + exposureTime + 0.01);

      // 3. Second curtain brake / stop impact ("clack / damped thud")
      const stopTime = t + Math.max(0.03, durationSeconds);
      this.playCurtainBrake(stopTime);
    } catch {
      // Audio safety
    }
  }

  // Curtain Brake Impact
  playCurtainBrake(atTime?: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = atTime || this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.045);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.065);
    } catch {
      // Audio safety
    }
  }
}

export default function MasterworkShutterCurtainBento() {
  // --- States ---
  const [lensIdx, setLensIdx] = useState<number>(0);
  const [fStopIdx, setFStopIdx] = useState<number>(2); // f/2.8 default
  const [shutterIdx, setShutterIdx] = useState<number>(3); // 1/125s default
  const [iso, setIso] = useState<number>(400);
  const [focusDistance, setFocusDistance] = useState<number>(50); // 0 (macro) to 100 (infinity)
  const [isCocked, setIsCocked] = useState<boolean>(true);
  const [windProgress, setWindProgress] = useState<number>(100);
  const [isWinding, setIsWinding] = useState<boolean>(false);
  const [isExposing, setIsExposing] = useState<boolean>(false);
  const [isBulbHolding, setIsBulbHolding] = useState<boolean>(false);
  const [bulbTimer, setBulbTimer] = useState<number>(0);
  const [exposureCount, setExposureCount] = useState<number>(46);
  const [exposureFlash, setExposureFlash] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [keyHintActive, setKeyHintActive] = useState<string | null>(null);

  // Audio Engine Ref
  const audioRef = useRef<MechanicalAudioEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const bulbIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new MechanicalAudioEngine();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const curLens = LENS_PRESETS[lensIdx];
  const curFStop = F_STOPS[fStopIdx];
  const curShutter = SHUTTER_SPEEDS[shutterIdx];

  // Calculated Exposure Value (EV): EV = log2(N^2 / t)
  const calculatedEV = useMemo(() => {
    if (curShutter.isBulb) return "BULB (VAR)";
    const N = curFStop.fNumber;
    const t = curShutter.seconds;
    const ev = Math.log2((N * N) / t);
    return Math.round(ev * 10) / 10;
  }, [curFStop, curShutter]);

  // Depth-of-Field Blur Calculation
  const dofBlur = useMemo(() => {
    const baseBlur = (16 - curFStop.fNumber) * 0.75 * curLens.minBlurMult;
    const focusOffset = Math.abs(focusDistance - 50) / 50;
    return Math.max(0, baseBlur * (0.25 + focusOffset * 0.75));
  }, [curFStop, focusDistance, curLens]);

  // Kinetic Variable Typography font weight mapped to aperture & exposure
  const dynamicFontWeight = useMemo(() => {
    const factor = fStopIdx / (F_STOPS.length - 1);
    return Math.round(250 + factor * 600);
  }, [fStopIdx]);

  // --- Winding Lever Drag Handling ---
  const leverStartRef = useRef<number>(0);

  const handleWindStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCocked || isExposing) return;
    setIsWinding(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    leverStartRef.current = clientX;
  };

  const handleWindMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isWinding) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - leverStartRef.current;
    const maxDelta = 140; // px
    const progress = Math.min(100, Math.max(0, (delta / maxDelta) * 100));
    setWindProgress(progress);

    const clickInterval = 25;
    const prevStep = Math.floor(windProgress / clickInterval);
    const currStep = Math.floor(progress / clickInterval);
    if (currStep > prevStep) {
      audioRef.current?.playRatchetClick(1.0 + currStep * 0.18);
    }

    if (progress >= 100) {
      setIsWinding(false);
      setIsCocked(true);
      setWindProgress(100);
      audioRef.current?.playRatchetClick(1.8);
    }
  }, [isWinding, windProgress]);

  const handleWindEnd = useCallback(() => {
    if (isWinding) {
      setIsWinding(false);
      if (windProgress < 100) {
        setWindProgress(0);
      }
    }
  }, [isWinding, windProgress]);

  useEffect(() => {
    if (isWinding) {
      window.addEventListener("mousemove", handleWindMove);
      window.addEventListener("mouseup", handleWindEnd);
      window.addEventListener("touchmove", handleWindMove);
      window.addEventListener("touchend", handleWindEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleWindMove);
      window.removeEventListener("mouseup", handleWindEnd);
      window.removeEventListener("touchmove", handleWindMove);
      window.removeEventListener("touchend", handleWindEnd);
    };
  }, [isWinding, handleWindMove, handleWindEnd]);

  // Quick Wind shortcut button
  const triggerWind = useCallback(() => {
    if (isCocked || isExposing) return;
    audioRef.current?.playRatchetClick(1.1);
    setTimeout(() => audioRef.current?.playRatchetClick(1.4), 70);
    setTimeout(() => {
      audioRef.current?.playRatchetClick(1.8);
      setIsCocked(true);
      setWindProgress(100);
    }, 140);
  }, [isCocked, isExposing]);

  // --- Shutter Release Action ---
  const fireShutter = useCallback(() => {
    if (isExposing || isBulbHolding) return;
    if (!isCocked) {
      audioRef.current?.playRatchetClick(0.6);
      return;
    }

    if (curShutter.isBulb) {
      // Start Bulb Mode
      setIsBulbHolding(true);
      setIsCocked(false);
      setWindProgress(0);
      setBulbTimer(0);
      audioRef.current?.playShutterRelease(0, true);

      bulbIntervalRef.current = setInterval(() => {
        setBulbTimer((prev) => prev + 0.1);
      }, 100);

      // Canvas opens curtain 1 completely
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    // Standard Shutter Release
    setIsExposing(true);
    setIsCocked(false);
    setWindProgress(0);

    const exposureSec = curShutter.seconds;
    audioRef.current?.playShutterRelease(exposureSec);

    setExposureFlash(1.0);
    const flashTimer = setTimeout(() => {
      setExposureFlash(0);
    }, Math.max(50, exposureSec * 1000));

    // Canvas Curtain Slit Animation
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = canvas.width;
        const h = canvas.height;
        const startTime = performance.now();
        const duration = Math.max(120, curShutter.curtainSpeedMs * 2);

        const renderFrame = (now: number) => {
          const elapsed = now - startTime;
          const t = Math.min(1.0, elapsed / duration);

          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#090b0e";
          ctx.fillRect(0, 0, w, h);

          const slitHeight = h * Math.min(1.0, curShutter.slitWidthFrac * 1.5);
          const travelRange = h + slitHeight;
          const curtain1Y = t * travelRange - slitHeight;
          const curtain2Y = curtain1Y + slitHeight;

          const slitTop = Math.max(0, curtain1Y);
          const slitBottom = Math.min(h, curtain2Y);

          if (slitBottom > slitTop) {
            const grad = ctx.createLinearGradient(0, slitTop, 0, slitBottom);
            grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
            grad.addColorStop(0.5, "rgba(255, 245, 230, 0.95)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.1)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, slitTop, w, slitBottom - slitTop);

            ctx.fillStyle = "#090a0d";
            ctx.font = "bold 22px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`EXPOSING // ${curShutter.label} @ ${curFStop.label}`, w / 2, (slitTop + slitBottom) / 2 + 7);
          }

          // Titanium Shutter Curtains
          ctx.fillStyle = "#1b2029";
          if (curtain1Y > 0) {
            ctx.fillRect(0, 0, w, Math.min(h, curtain1Y));
            ctx.fillStyle = "#333b4c";
            ctx.fillRect(0, curtain1Y - 4, w, 4);
          }

          if (curtain2Y < h) {
            ctx.fillStyle = "#14171e";
            ctx.fillRect(0, Math.max(0, curtain2Y), w, h - curtain2Y);
            ctx.fillStyle = "#333b4c";
            ctx.fillRect(0, curtain2Y, w, 4);
          }

          if (t < 1.0) {
            animFrameRef.current = requestAnimationFrame(renderFrame);
          } else {
            ctx.fillStyle = "#0f1217";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#4a5568";
            ctx.font = "13px monospace";
            ctx.textAlign = "center";
            ctx.fillText("FRAME EXPOSED · WIND LEVER (W) TO RE-COCK", w / 2, h / 2);
            setIsExposing(false);
            setExposureCount((prev) => prev + 1);
          }
        };

        animFrameRef.current = requestAnimationFrame(renderFrame);
      }
    }

    return () => clearTimeout(flashTimer);
  }, [isCocked, isExposing, isBulbHolding, curShutter, curFStop]);

  // Release Bulb Mode
  const releaseBulb = useCallback(() => {
    if (!isBulbHolding) return;
    if (bulbIntervalRef.current) clearInterval(bulbIntervalRef.current);
    setIsBulbHolding(false);
    audioRef.current?.playCurtainBrake();
    setExposureCount((prev) => prev + 1);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f1217";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffb703";
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`BULB EXPOSURE COMPLETE: ${bulbTimer.toFixed(1)}s`, canvas.width / 2, canvas.height / 2);
      }
    }
  }, [isBulbHolding, bulbTimer]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHintActive("SPACE");
        fireShutter();
      } else if (e.code === "KeyW") {
        e.preventDefault();
        setKeyHintActive("W");
        triggerWind();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setKeyHintActive("UP");
        setFStopIdx((prev) => {
          const next = Math.max(0, prev - 1);
          audioRef.current?.playApertureClick();
          return next;
        });
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setKeyHintActive("DOWN");
        setFStopIdx((prev) => {
          const next = Math.min(F_STOPS.length - 1, prev + 1);
          audioRef.current?.playApertureClick();
          return next;
        });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setKeyHintActive("LEFT");
        setShutterIdx((prev) => {
          const next = Math.max(0, prev - 1);
          audioRef.current?.playApertureClick();
          return next;
        });
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setKeyHintActive("RIGHT");
        setShutterIdx((prev) => {
          const next = Math.min(SHUTTER_SPEEDS.length - 1, prev + 1);
          audioRef.current?.playApertureClick();
          return next;
        });
      } else if (e.key === "1") {
        setLensIdx(0);
      } else if (e.key === "2") {
        setLensIdx(1);
      } else if (e.key === "3") {
        setLensIdx(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyHintActive(null);
      if (e.code === "Space" && isBulbHolding) {
        releaseBulb();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [fireShutter, triggerWind, isBulbHolding, releaseBulb]);

  // Clean animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (bulbIntervalRef.current) clearInterval(bulbIntervalRef.current);
    };
  }, []);

  // Aperture step selection
  const selectFStop = (idx: number) => {
    setFStopIdx(idx);
    audioRef.current?.playApertureClick();
  };

  // Shutter speed step selection
  const selectShutter = (idx: number) => {
    setShutterIdx(idx);
    audioRef.current?.playApertureClick();
  };

  // SVG 9-Blade Iris Diaphragm rendering calculation
  const irisBladesSvg = useMemo(() => {
    const bladeCount = 9;
    const center = 150;
    const maxRadius = 112;
    const minRadius = 12;
    const curRadius = minRadius + (maxRadius - minRadius) * curFStop.radiusRatio;

    const blades = [];
    const angleStep = (2 * Math.PI) / bladeCount;
    const rotOffset = (1 - curFStop.radiusRatio) * 0.48;

    for (let i = 0; i < bladeCount; i++) {
      const baseAngle = i * angleStep + rotOffset;
      const x1 = center + Math.cos(baseAngle) * maxRadius;
      const y1 = center + Math.sin(baseAngle) * maxRadius;

      const innerAngle = baseAngle + 0.68;
      const x2 = center + Math.cos(innerAngle) * curRadius;
      const y2 = center + Math.sin(innerAngle) * curRadius;

      const outerNextAngle = baseAngle + angleStep * 1.45;
      const x3 = center + Math.cos(outerNextAngle) * (maxRadius + 22);
      const y3 = center + Math.sin(outerNextAngle) * (maxRadius + 22);

      const pathData = `M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3} Z`;
      blades.push(
        <path
          key={i}
          d={pathData}
          fill="#1b1f27"
          stroke="#303744"
          strokeWidth="1.3"
          opacity="0.95"
          className="transition-all duration-300 ease-out"
        />
      );
    }

    return { blades, curRadius };
  }, [curFStop]);

  return (
    <div className="relative min-h-screen w-full bg-[#07080a] text-[#e5e7eb] font-sans antialiased selection:bg-[#e63946] selection:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Exposure Flash Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-[#fffdfa] transition-opacity duration-150"
        style={{ opacity: exposureFlash * 0.88 }}
      />

      {/* Modernist Swiss Header Console */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1f242e] pb-5 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#ffb703] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ffb703] animate-pulse" />
            Day 046 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Analog Shutter Curtain & Iris Diaphragm Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            기계식 셔터막과 9엽 조리개 날개의 물리적 탄성, 노출 지연 시간(Exposure Latency), 그리고 스위스 광학-에디토리얼 조형 시스템
          </p>
        </div>

        {/* Global Mechanical Status & Audio Toggle */}
        <div className="flex flex-wrap items-center gap-3 bg-[#101319] border border-[#242a35] px-4 py-2.5 rounded-lg font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181d26] hover:bg-[#252c38] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#242a35]" />
          <div>
            <span className="text-[#64748b]">TENSION: </span>
            <span className={isCocked ? "text-[#00f5d4] font-bold" : "text-[#e63946] font-bold"}>
              {isCocked ? "COCKED [READY]" : "DISCHARGED"}
            </span>
          </div>
          <div className="h-4 w-px bg-[#242a35]" />
          <div>
            <span className="text-[#64748b]">FRAME: </span>
            <span className="text-[#f8f9fa] font-bold">EXP-{exposureCount.toString().padStart(3, "0")}</span>
          </div>
          <div className="h-4 w-px bg-[#242a35]" />
          <div>
            <span className="text-[#64748b]">EV: </span>
            <span className="text-[#ffb703] font-bold">{calculatedEV}</span>
          </div>
        </div>
      </header>

      {/* Optical Lens Selector Bar */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {LENS_PRESETS.map((lens, idx) => {
          const isSelected = idx === lensIdx;
          return (
            <button
              key={lens.id}
              onClick={() => {
                setLensIdx(idx);
                audioRef.current?.playApertureClick();
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#141820] border-[#ffb703] shadow-lg shadow-[#ffb703]/10"
                  : "bg-[#0c0e12] border-[#1d222b] hover:border-[#2d3442] hover:bg-[#11141a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#94a3b8]">0{idx + 1} // LENS CALIBRATION</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${isSelected ? "bg-[#ffb703] text-black font-bold" : "text-[#64748b]"}`}>
                  {lens.maxAperture}
                </span>
              </div>
              <div className="text-sm md:text-base font-bold text-[#f8f9fa] mt-1">{lens.name}</div>
              <div className="text-xs text-[#71717a] mt-1">{lens.bokehCharacter}</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: 9-Blade Iris Diaphragm Interactive Chamber (5 cols) */}
        <section className="lg:col-span-5 bg-[#0d0f14] border border-[#1e232e] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#191d25] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e63946] rounded-full" />
              01 // Optical Iris Diaphragm
            </span>
            <span className="text-xs font-mono text-[#00f5d4] bg-[#00f5d4]/10 px-2 py-0.5 rounded border border-[#00f5d4]/20">
              {curFStop.label} · 9 CARBON LEAVES
            </span>
          </div>

          {/* Iris Visualizer */}
          <div className="relative flex items-center justify-center py-4">
            <div className="w-[300px] h-[300px] rounded-full bg-[#080a0d] border-2 border-[#262c38] flex items-center justify-center relative shadow-inner overflow-hidden">
              <div className="absolute inset-2 rounded-full border border-dashed border-[#1f242f] pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-[#161a22] pointer-events-none" />

              {/* Central Optical Pupil Light */}
              <div
                className="absolute rounded-full transition-all duration-300 pointer-events-none"
                style={{
                  width: `${irisBladesSvg.curRadius * 2}px`,
                  height: `${irisBladesSvg.curRadius * 2}px`,
                  background: "radial-gradient(circle, rgba(255,250,235,0.95) 0%, rgba(255,183,3,0.3) 70%, transparent 100%)",
                  boxShadow: `0 0 ${curFStop.radiusRatio * 42}px rgba(255,183,3,0.45)`,
                }}
              />

              {/* 9 Overlapping Steel Blades SVG */}
              <svg width="300" height="300" viewBox="0 0 300 300" className="relative z-10 pointer-events-none">
                {irisBladesSvg.blades}
                <circle
                  cx="150"
                  cy="150"
                  r={irisBladesSvg.curRadius}
                  fill="none"
                  stroke="#ffb703"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* Aperture F-Stop Selector Rail */}
          <div className="mt-4 pt-4 border-t border-[#191d25]">
            <div className="flex items-center justify-between text-xs font-mono text-[#788599] mb-2">
              <span>APERTURE DETENT RINGS</span>
              <span>LIGHT TRANSMISSION: {curFStop.transmission}%</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {F_STOPS.map((stop, idx) => {
                const isSelected = idx === fStopIdx;
                return (
                  <button
                    key={stop.label}
                    onClick={() => selectFStop(idx)}
                    className={`py-2 text-center text-xs font-mono font-medium rounded-lg transition-all ${
                      isSelected
                        ? "bg-[#ffb703] text-black font-bold shadow-lg shadow-[#ffb703]/25 scale-105"
                        : "bg-[#13161d] text-[#9ca3af] hover:bg-[#1c212a] hover:text-white"
                    }`}
                  >
                    {stop.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cell 2 & 3: Focal Plane Dual-Curtain Slit & Variable Typography (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Top: Shutter Curtain Canvas Stage */}
          <div className="bg-[#0d0f14] border border-[#1e232e] rounded-2xl p-6 relative shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#191d25] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f5d4] rounded-full" />
                02 // Focal Plane Dual-Curtain Slit Dynamics
              </span>
              <div className="flex gap-2">
                {SHUTTER_SPEEDS.slice(0, 5).map((speed, idx) => (
                  <button
                    key={speed.label}
                    onClick={() => selectShutter(idx)}
                    className={`px-2 py-0.5 text-xs font-mono rounded ${
                      idx === shutterIdx
                        ? "bg-[#00f5d4] text-black font-bold"
                        : "bg-[#161a22] text-[#788599] hover:text-white"
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Slit Simulator */}
            <div className="relative w-full h-[220px] bg-[#080a0d] rounded-xl border border-[#222834] overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={640}
                height={220}
                className="w-full h-full object-cover"
              />

              {!isExposing && !isBulbHolding && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                  <div className="text-xs font-mono tracking-widest text-[#64748b] mb-1">
                    TITANIUM FOIL HORIZONTAL TRAVEL SLIT
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-[#f1f5f9] tracking-tight">
                    {curShutter.label} EXPOSURE WINDOW
                  </div>
                  <div className="text-xs font-mono text-[#00f5d4] mt-2 bg-[#00f5d4]/10 px-3 py-1 rounded-md border border-[#00f5d4]/20">
                    SLIT: ~{(curShutter.slitWidthFrac * 100).toFixed(0)}% · LATENCY: {curShutter.curtainSpeedMs}ms
                  </div>
                </div>
              )}

              {isBulbHolding && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center bg-white/10 backdrop-blur-sm">
                  <div className="text-xs font-mono tracking-widest text-[#ffb703] uppercase animate-pulse">
                    ● BULB LONG EXPOSURE IN PROGRESS
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-1 font-mono">
                    {bulbTimer.toFixed(1)}s
                  </div>
                  <div className="text-xs font-mono text-[#e2e8f0] mt-1">
                    RELEASE SHUTTER (SPACE) TO BRAKE CURTAIN
                  </div>
                </div>
              )}
            </div>

            {/* Shutter Speed Full Rail */}
            <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {SHUTTER_SPEEDS.map((speed, idx) => (
                <button
                  key={speed.label}
                  onClick={() => selectShutter(idx)}
                  className={`flex-1 py-1.5 px-2 text-center text-xs font-mono rounded-md transition-all whitespace-nowrap ${
                    idx === shutterIdx
                      ? "bg-[#00f5d4] text-black font-bold shadow-md shadow-[#00f5d4]/20"
                      : "bg-[#12151b] text-[#71717a] hover:bg-[#1a1f27] hover:text-[#d4d4d8]"
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom: Editorial Variable Typography & Focus Plane */}
          <div className="bg-[#0d0f14] border border-[#1e232e] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#191d25] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                03 // Optical Depth-of-Field & Kinetic Typography
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicFontWeight} · blur: {dofBlur.toFixed(1)}px
              </span>
            </div>

            {/* Kinetic Typography Specimen */}
            <div className="py-4 relative overflow-hidden">
              <div
                className="transition-all duration-300"
                style={{
                  filter: `blur(${dofBlur}px)`,
                  fontWeight: dynamicFontWeight,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#e63946] mb-1.5 uppercase font-semibold">
                  Light Freezes on Physical Substrate
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight text-[#f8f9fa] tracking-tight">
                  시간의 파열음을 물리적 슬릿에 새기다.
                </h2>
                <p className="text-sm md:text-base text-[#94a3b8] mt-2.5 leading-relaxed max-w-2xl">
                  찰나의 노출 시간 동안 두 장의 셔터막 사이로 스며든 빛이 활자의 무게와 선예도를 재단합니다. 조리개 구경이 좁아질수록 세상은 깊고 선명한 스위스 모더니즘의 광학 평형을 되찾습니다.
                </p>
              </div>
            </div>

            {/* Focus Plane Racking Slider & ISO */}
            <div className="pt-4 border-t border-[#191d25] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-2/3">
                <div className="flex justify-between text-xs font-mono text-[#788599] mb-1.5">
                  <span>FOCUS PLANE: {focusDistance < 30 ? "MACRO SUBJECT" : focusDistance > 70 ? "INFINITY (∞)" : "NORMAL PORTRAIT"}</span>
                  <span>{focusDistance}cm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focusDistance}
                  onChange={(e) => setFocusDistance(Number(e.target.value))}
                  className="w-full accent-[#ffb703] bg-[#171b23] h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* ISO Sensitivity Selector */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#64748b]">ISO:</span>
                {[100, 400, 1600, 6400].map((val) => (
                  <button
                    key={val}
                    onClick={() => setIso(val)}
                    className={`px-2.5 py-1 rounded-md ${
                      iso === val
                        ? "bg-[#e63946] text-white font-bold"
                        : "bg-[#151921] text-[#71717a] hover:text-white"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Mechanical Shutter Cock & Release Control Console */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0f1218] border-2 border-[#242b37] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Film Winding Lever */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative">
            <button
              onMouseDown={handleWindStart}
              onTouchStart={handleWindStart}
              onClick={triggerWind}
              disabled={isCocked || isExposing}
              className={`relative px-6 py-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-3 border ${
                isCocked
                  ? "bg-[#141820] text-[#4b5563] border-[#1e2430] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#28303e] to-[#1a1f28] text-[#f8f9fa] border-[#3d4757] hover:border-[#ffb703] hover:shadow-lg shadow-black active:scale-95 cursor-grab active:cursor-grabbing"
              }`}
            >
              <svg className="w-5 h-5 text-[#ffb703]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>{isCocked ? "SHUTTER COCKED [W]" : "WIND LEVER (감기) [W]"}</span>
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-mono text-[#64748b]">SPRING TENSION</span>
            <div className="w-32 h-2.5 bg-[#171b23] rounded-full overflow-hidden mt-1 border border-[#27303e]">
              <div
                className="h-full bg-gradient-to-r from-[#ffb703] to-[#00f5d4] transition-all duration-150"
                style={{ width: `${windProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Exposure Parameters Summary & Keyboard Guide */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6 font-mono text-xs text-[#94a3b8]">
            <div className="text-center">
              <div className="text-[#64748b]">LENS</div>
              <div className="text-sm font-bold text-[#f8f9fa]">{curLens.focalLength}</div>
            </div>
            <div className="h-6 w-px bg-[#242a35]" />
            <div className="text-center">
              <div className="text-[#64748b]">APERTURE</div>
              <div className="text-sm font-bold text-[#f8f9fa]">{curFStop.label}</div>
            </div>
            <div className="h-6 w-px bg-[#242a35]" />
            <div className="text-center">
              <div className="text-[#64748b]">SPEED</div>
              <div className="text-sm font-bold text-[#00f5d4]">{curShutter.label}</div>
            </div>
            <div className="h-6 w-px bg-[#242a35]" />
            <div className="text-center">
              <div className="text-[#64748b]">SENSITIVITY</div>
              <div className="text-sm font-bold text-[#ffb703]">ISO {iso}</div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#64748b] flex gap-3">
            <span className={keyHintActive === "SPACE" ? "text-[#00f5d4] font-bold" : ""}>[SPACE] Shutter</span>
            <span>·</span>
            <span className={keyHintActive === "W" ? "text-[#ffb703] font-bold" : ""}>[W] Wind</span>
            <span>·</span>
            <span className={keyHintActive === "UP" || keyHintActive === "DOWN" ? "text-white font-bold" : ""}>[↑/↓] Aperture</span>
            <span>·</span>
            <span className={keyHintActive === "LEFT" || keyHintActive === "RIGHT" ? "text-white font-bold" : ""}>[←/→] Speed</span>
          </div>
        </div>

        {/* Right: Mechanical Shutter Release Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onMouseDown={() => {
              if (curShutter.isBulb) fireShutter();
            }}
            onMouseUp={() => {
              if (curShutter.isBulb) releaseBulb();
            }}
            onClick={() => {
              if (!curShutter.isBulb) fireShutter();
            }}
            disabled={isExposing && !curShutter.isBulb}
            className={`relative group px-8 py-4 rounded-xl font-mono text-base font-extrabold tracking-widest uppercase transition-all flex items-center gap-3 border shadow-2xl ${
              isCocked || isBulbHolding
                ? "bg-gradient-to-b from-[#e63946] to-[#b91c1c] text-white border-[#ff6b6b] hover:shadow-red-900/50 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-[#151921] text-[#4b5563] border-[#1e2430] cursor-not-allowed"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-white group-hover:scale-125 transition-transform" />
            <span>{isExposing ? "EXPOSING..." : isBulbHolding ? "BULB HOLD..." : "RELEASE (셔터)"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
