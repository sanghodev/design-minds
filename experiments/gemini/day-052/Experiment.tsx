"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Transit Alphanumeric Character Wheel for Solari Flap Kinematics ---
const ALPHANUMERIC_WHEEL = [
  " ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", 
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "/", ":", "."
];

// --- Transit Departure Row Definition ---
interface DepartureItem {
  id: number;
  time: string;
  train: string;
  dest: string;
  platform: string;
  status: string;
  gate: string;
}

const PRESET_SCHEDULES: { [key: string]: { name: string; items: DepartureItem[] } } = {
  alpine: {
    name: "01 // SBB Alpine Network (Zürich HB Concourse)",
    items: [
      { id: 1, time: "12:04", train: "IC 1", dest: "ZÜRICH HB", platform: "03", status: "ON TIME", gate: "A12" },
      { id: 2, time: "12:12", train: "TGV 92", dest: "PARIS GARE LYON", platform: "07", status: "BOARDING", gate: "B04" },
      { id: 3, time: "12:18", train: "EC 44", dest: "MILANO CENTRALE", platform: "02", status: "ON TIME", gate: "A08" },
      { id: 4, time: "12:25", train: "ICE 70", dest: "FRANKFURT HBF", platform: "05", status: "DELAY 5M", gate: "C02" },
      { id: 5, time: "12:34", train: "RJX 16", dest: "WIEN HBF", platform: "09", status: "ON TIME", gate: "B14" },
      { id: 6, time: "12:42", train: "IR 36", dest: "BASEL SBB", platform: "04", status: "ON TIME", gate: "A03" },
      { id: 7, time: "12:50", train: "PE 22", dest: "GLACIER EXPRESS", platform: "01", status: "GATE OPEN", gate: "D01" },
      { id: 8, time: "13:00", train: "IC 8", dest: "GENÈVE CORNAVIN", platform: "08", status: "PREPARING", gate: "B09" },
    ]
  },
  transcontinental: {
    name: "02 // Trans-European Express & World Gateways",
    items: [
      { id: 1, time: "13:04", train: "IC 1", dest: "ST. MORITZ", platform: "03", status: "ON TIME", gate: "A12" },
      { id: 2, time: "13:12", train: "EST 94", dest: "LONDON PANCRAS", platform: "07", status: "GATE OPEN", gate: "B04" },
      { id: 3, time: "13:18", train: "EC 46", dest: "ROMA TERMINI", platform: "02", status: "BOARDING", gate: "A08" },
      { id: 4, time: "13:25", train: "ICE 72", dest: "BERLIN HBF", platform: "05", status: "ON TIME", gate: "C02" },
      { id: 5, time: "13:34", train: "RJX 18", dest: "BUDAPEST KELETI", platform: "09", status: "DELAY 10M", gate: "B14" },
      { id: 6, time: "13:42", train: "IR 38", dest: "LUZERN BAHNHOF", platform: "04", status: "ON TIME", gate: "A03" },
      { id: 7, time: "13:50", train: "PE 24", dest: "BERNINA EXPRESS", platform: "01", status: "ON TIME", gate: "D01" },
      { id: 8, time: "14:00", train: "IC 10", dest: "INTERLAKEN OST", platform: "08", status: "PREPARING", gate: "B09" },
    ]
  },
  nocturne: {
    name: "03 // Nightjet Sleepers & Midnight Crossings",
    items: [
      { id: 1, time: "22:15", train: "NJ 468", dest: "WIEN HBF", platform: "06", status: "ON TIME", gate: "C10" },
      { id: 2, time: "22:40", train: "NJ 408", dest: "BERLIN CHARLOTT", platform: "04", status: "BOARDING", gate: "A04" },
      { id: 3, time: "23:05", train: "EN 294", dest: "AMSTERDAM CENTR", platform: "09", status: "ON TIME", gate: "B02" },
      { id: 4, time: "23:20", train: "NJ 402", dest: "HAMBURG ALTONA", platform: "07", status: "GATE OPEN", gate: "B12" },
      { id: 5, time: "23:45", train: "EN 414", dest: "ZAGREB GLAVNI", platform: "02", status: "ON TIME", gate: "A15" },
      { id: 6, time: "00:10", train: "ICN 19", dest: "LUGANO CENTRO", platform: "03", status: "PREPARING", gate: "A01" },
      { id: 7, time: "00:35", train: "TGV 98", dest: "PARIS GARE LYON", platform: "05", status: "ON TIME", gate: "C06" },
      { id: 8, time: "01:00", train: "S 12", dest: "ZÜRICH FLUGHAFEN", platform: "01", status: "ON TIME", gate: "D02" },
    ]
  }
};

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MasterworkSolariAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Single Solari Ratchet Flap Snap with mechanical plastic leaf impact and pan
  playFlapClick(pitch = 1.0, pan = 0.0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Noise burst for mechanical ratchet flick
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(2600 * pitch, t);
      noiseFilter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.014);

      // Low mechanical thud (solenoid / axle stepper impact)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(70 * pitch, t + 0.012);

      oscGain.gain.setValueAtTime(0.24, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      // Spatial stereo panner if available
      let panner: StereoPannerNode | null = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-0.9, Math.min(0.9, pan)), t);
      }

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      osc.connect(oscGain);

      if (panner) {
        noiseGain.connect(panner);
        oscGain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        noiseGain.connect(this.ctx.destination);
        oscGain.connect(this.ctx.destination);
      }

      noise.start(t);
      osc.start(t);
      noise.stop(t + 0.018);
      osc.stop(t + 0.018);
    } catch {}
  }

  // Cascading flap flutter cascade (batch of micro clicks)
  playFlapCascade(count = 16) {
    if (this.isMuted) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const pitch = 0.88 + Math.random() * 0.3;
        const pan = (Math.random() - 0.5) * 1.2;
        this.playFlapClick(pitch, pan);
      }, i * 20 + Math.random() * 8);
    }
  }

  // SBB Stop2Go minute-advance authoritative mechanical tick (24V Impulse Master Clock)
  playStop2GoMinuteTick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy solenoid armature stroke
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.05);

      gain.gain.setValueAtTime(0.42, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);

      // High latch click
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(3400, t);
      osc2.frequency.exponentialRampToValueAtTime(750, t + 0.012);
      gain2.gain.setValueAtTime(0.28, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.02);
    } catch {}
  }

  // European Railway Station Two-Tone Chime (A4 -> C#5) with warm reverb overtone
  playStationChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Tone 1: A4 (440Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, t);
      gain1.gain.setValueAtTime(0.26, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.65);

      // Tone 2: C#5 (554.37Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(554.37, t + 0.38);
      gain2.gain.setValueAtTime(0.3, t + 0.38);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.38);
      osc2.stop(t + 1.15);
    } catch {}
  }
}

// --- Split-Flap Character Tile with Authentic 3D Hinge Physics & Alphanumeric Stepping ---
interface SplitFlapTileProps {
  targetChar: string;
  isRowFlipping?: boolean;
  staggerMs?: number;
  speedMs?: number;
  audioEngine?: MasterworkSolariAudioEngine | null;
  onFlipStep?: () => void;
  panPosition?: number;
}

const SplitFlapTile: React.FC<SplitFlapTileProps> = React.memo(({
  targetChar,
  isRowFlipping = false,
  staggerMs = 0,
  speedMs = 38,
  audioEngine = null,
  onFlipStep,
  panPosition = 0,
}) => {
  const [currentChar, setCurrentChar] = useState<string>(targetChar || " ");
  const [isFlippingLeaf, setIsFlippingLeaf] = useState<boolean>(false);
  const targetCharRef = useRef<string>(targetChar || " ");
  targetCharRef.current = targetChar || " ";

  // Stepping Animation Effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const startCycling = () => {
      const step = () => {
        if (isCancelled) return;
        const target = (targetCharRef.current || " ").toUpperCase();
        setCurrentChar((prev) => {
          if (prev === target && !isRowFlipping) {
            setIsFlippingLeaf(false);
            return prev;
          }

          const currentIdx = ALPHANUMERIC_WHEEL.indexOf(prev);
          const nextIdx = (currentIdx + 1) % ALPHANUMERIC_WHEEL.length;
          const nextChar = ALPHANUMERIC_WHEEL[nextIdx];

          // Trigger physical acoustic click and 3D leaf flip
          setIsFlippingLeaf(true);
          audioEngine?.playFlapClick(0.9 + Math.random() * 0.25, panPosition);
          onFlipStep?.();

          // Reset leaf after half step
          setTimeout(() => {
            if (!isCancelled) setIsFlippingLeaf(false);
          }, speedMs * 0.7);

          if (nextChar !== target) {
            timeoutId = setTimeout(step, speedMs);
          }
          return nextChar;
        });
      };

      timeoutId = setTimeout(step, staggerMs);
    };

    if (currentChar !== (targetChar || " ").toUpperCase() || isRowFlipping) {
      startCycling();
    }

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [targetChar, isRowFlipping, staggerMs, speedMs, audioEngine, panPosition, onFlipStep]);

  const displayChar = currentChar || " ";

  return (
    <div className="relative w-6 h-9 sm:w-7 sm:h-10 md:w-8 md:h-11 bg-[#0e1017] border border-[#232736] rounded-[3px] flex flex-col overflow-hidden shadow-md select-none perspective-500">
      {/* Top Half Flap (Static Backplate) */}
      <div className="h-1/2 w-full bg-[#141722] border-b border-[#08090d] relative overflow-hidden flex items-end justify-center">
        <span className="font-mono text-xs sm:text-sm md:text-base font-extrabold text-[#f8f9fa] translate-y-1/2">
          {displayChar}
        </span>
        {/* Subtle top edge specular highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 pointer-events-none" />
      </div>

      {/* Bottom Half Flap (Static Baseplate) */}
      <div className="h-1/2 w-full bg-[#0f1118] relative overflow-hidden flex items-start justify-center">
        <span className="font-mono text-xs sm:text-sm md:text-base font-extrabold text-[#f8f9fa] -translate-y-1/2">
          {displayChar}
        </span>
        {/* Subtle bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-black/40 pointer-events-none" />
      </div>

      {/* Horizontal Split Seam Shadow with Brass Hinge Notch Details */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[#050608] shadow-sm z-20 pointer-events-none flex items-center justify-between px-[2px]">
        <div className="w-[1.5px] h-[3px] bg-[#3a4154] rounded-full" />
        <div className="w-[1.5px] h-[3px] bg-[#3a4154] rounded-full" />
      </div>

      {/* Dynamic 3D Folding Flap Leaf on Flip */}
      {isFlippingLeaf && (
        <div
          className="absolute inset-x-0 top-0 h-1/2 bg-[#1c2130] origin-bottom z-30 pointer-events-none border-b border-[#08090d] flex items-end justify-center shadow-lg"
          style={{
            animation: `solariFlapDown ${speedMs * 0.8}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="font-mono text-xs sm:text-sm md:text-base font-extrabold text-[#f8f9fa] translate-y-1/2 opacity-80">
            {displayChar}
          </span>
        </div>
      )}
    </div>
  );
});
SplitFlapTile.displayName = "SplitFlapTile";

export default function SplitFlapDestinationBentoExperiment() {
  // --- States ---
  const [currentPresetKey, setCurrentPresetKey] = useState<string>("alpine");
  const [schedule, setSchedule] = useState<DepartureItem[]>(PRESET_SCHEDULES.alpine.items);
  const [flippingRows, setFlippingRows] = useState<{ [rowId: number]: boolean }>({});
  const [totalFlapsFlipped, setTotalFlapsFlipped] = useState<number>(1240);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [motorSpeedMs, setMotorSpeedMs] = useState<number>(36); // 20ms (Turbo), 36ms (Authentic), 80ms (Slow-Mo)
  
  // Custom Destination Dispatcher Input State
  const [customCityInput, setCustomCityInput] = useState<string>("");

  // Clock state
  const [clockSeconds, setClockSeconds] = useState<number>(54.0); // 0.0 to 60.0s
  const [clockMinutes, setClockMinutes] = useState<number>(4);
  const [clockHours, setClockHours] = useState<number>(12);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  // Audio Engine & Refs
  const audioRef = useRef<MasterworkSolariAudioEngine | null>(null);
  const prevSecRef = useRef<number>(54.0);

  useEffect(() => {
    audioRef.current = new MasterworkSolariAudioEngine();
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // --- SBB Stop2Go Railway Chronometry Loop ---
  // The red second hand sweeps 360° in exactly 58.0 seconds, pauses at 12 o'clock for 2.0 seconds,
  // and on the 60th second, the minute hand jumps forward with an audible solenoid click!
  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedTotalSec = (now - startTime) * 0.001;
      const currentCycleSec = (54.0 + elapsedTotalSec) % 60.0;
      setClockSeconds(currentCycleSec);

      // Minute advance check at 60s (transition from >58.5s to <1.0s)
      if (prevSecRef.current > 58.5 && currentCycleSec < 1.0) {
        audioRef.current?.playStop2GoMinuteTick();
        setClockMinutes((prev) => (prev + 1) % 60);
      }
      prevSecRef.current = currentCycleSec;
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Fast-Forward to Stop2Go Sync Test (sets to 56.5s to experience the 2s pause and minute jump immediately!)
  const triggerStop2GoTest = useCallback(() => {
    setClockSeconds(56.8);
    prevSecRef.current = 56.8;
  }, []);

  // Stop2Go Second Hand Angle: sweeps 0 to 360° over 58s, stays at 360° (0°) for seconds 58 to 60!
  const stop2GoAngle = useMemo(() => {
    if (clockSeconds <= 58.0) {
      return (clockSeconds / 58.0) * 360;
    }
    return 360; // Paused at zenith for 2.0 seconds!
  }, [clockSeconds]);

  // Minute Hand Angle with crisp jumping
  const minuteAngle = useMemo(() => {
    return (clockMinutes / 60) * 360;
  }, [clockMinutes]);

  // Hour Hand Angle
  const hourAngle = useMemo(() => {
    return ((clockHours % 12) / 12) * 360 + (clockMinutes / 60) * 30;
  }, [clockHours, clockMinutes]);

  // Handle Incremental Flap Counter
  const handleFlapIncrement = useCallback(() => {
    setTotalFlapsFlipped((prev) => prev + 1);
  }, []);

  // Switch Schedule Preset with Cascading Ripple
  const switchPreset = useCallback((presetKey: string) => {
    if (presetKey === currentPresetKey) return;
    audioRef.current?.playStationChime();
    setTimeout(() => {
      audioRef.current?.playFlapCascade(32);
    }, 380);

    setCurrentPresetKey(presetKey);
    const targetItems = PRESET_SCHEDULES[presetKey].items;

    // Stagger row updates
    targetItems.forEach((item, idx) => {
      setTimeout(() => {
        setFlippingRows((prev) => ({ ...prev, [item.id]: true }));
        setSchedule((prev) => prev.map((old) => (old.id === item.id ? item : old)));
      }, 300 + idx * 75);

      setTimeout(() => {
        setFlippingRows((prev) => ({ ...prev, [item.id]: false }));
      }, 900 + idx * 75);
    });
  }, [currentPresetKey]);

  // Refresh Single Row
  const refreshSingleRow = useCallback((rowId: number) => {
    audioRef.current?.playFlapCascade(14);
    setFlippingRows((prev) => ({ ...prev, [rowId]: true }));

    // Alternate just that row
    const pool = currentPresetKey === "alpine" 
      ? PRESET_SCHEDULES.transcontinental.items 
      : PRESET_SCHEDULES.alpine.items;
    const replacement = pool.find((p) => p.id === rowId);

    if (replacement) {
      setTimeout(() => {
        setSchedule((prev) => prev.map((item) => (item.id === rowId ? replacement : item)));
      }, 150);
    }

    setTimeout(() => {
      setFlippingRows((prev) => ({ ...prev, [rowId]: false }));
    }, 850);
  }, [currentPresetKey]);

  // Custom Destination Dispatcher (Updates Row 1 with User Typed City)
  const dispatchCustomCity = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const city = customCityInput.trim().toUpperCase() || "TOKYO SHINJUKU";
    audioRef.current?.playStationChime();
    setTimeout(() => {
      audioRef.current?.playFlapCascade(22);
    }, 350);

    setFlippingRows((prev) => ({ ...prev, 1: true }));
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === 1
          ? {
              ...item,
              dest: city.slice(0, 14),
              status: "EXP DISPATCH",
              platform: "01",
            }
          : item
      )
    );
    setCustomCityInput("");

    setTimeout(() => {
      setFlippingRows((prev) => ({ ...prev, 1: false }));
    }, 950);
  }, [customCityInput]);

  // Global Cascade Trigger
  const triggerGlobalCascade = useCallback(() => {
    const keys = Object.keys(PRESET_SCHEDULES);
    const nextKey = keys[(keys.indexOf(currentPresetKey) + 1) % keys.length];
    switchPreset(nextKey);
  }, [currentPresetKey, switchPreset]);

  // Kinetic Variable Typography font weight dynamically based on active flap fluttering
  const dynamicTypography = useMemo(() => {
    const activeCount = Object.values(flippingRows).filter(Boolean).length;
    const wght = Math.round(300 + (activeCount / 8) * 500);
    const wdth = Math.round(85 + (activeCount / 8) * 30);
    return { wght, wdth, activeCount };
  }, [flippingRows]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        triggerGlobalCascade();
      } else if (e.key >= "1" && e.key <= "8") {
        const rowId = parseInt(e.key, 10);
        refreshSingleRow(rowId);
      } else if (e.code === "KeyM") {
        toggleMute();
      } else if (e.code === "KeyT") {
        triggerStop2GoTest();
      }
    };

    const handleKeyUp = () => setKeyHint(null);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerGlobalCascade, refreshSingleRow, triggerStop2GoTest]);

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] text-[#e2e5eb] font-sans antialiased selection:bg-[#e63946] selection:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Embedded CSS 3D Flap Down Keyframes */}
      <style>{`
        @keyframes solariFlapDown {
          0% {
            transform: perspective(350px) rotateX(0deg);
            filter: brightness(1.2);
          }
          50% {
            transform: perspective(350px) rotateX(-90deg);
            filter: brightness(0.65);
          }
          100% {
            transform: perspective(350px) rotateX(-180deg);
            filter: brightness(0.4);
          }
        }
      `}</style>

      {/* Modernist Swiss Transit Header (Müller-Brockmann & SBB Wayfinding) */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b1f2c] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#e63946] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
            Day 052 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Mechanical Split-Flap Destination Matrix & Stop2Go Chronometry
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            솔라리 디 우디네(Solari di Udine) 8행 스플릿 플랩 힌지 역학, 한스 힐피커 SBB 정밀 철도 시계, 그리고 스위스 트랜짓-에디토리얼 건축
          </p>
        </div>

        {/* Global Mechanical & Chronometric Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#10121a] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181d28] hover:bg-[#252d3d] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">STOP2GO: </span>
            <span className={clockSeconds > 58.0 ? "text-[#e63946] font-bold animate-pulse" : "text-[#00f0ff] font-bold"}>
              {clockSeconds > 58.0 ? "PAUSED 2S AT 12" : `${clockSeconds.toFixed(1)}s / 58s`}
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">FLAPS FLIPPED: </span>
            <span className="text-[#ffb703] font-bold">{totalFlapsFlipped}</span>
          </div>
        </div>
      </header>

      {/* Preset Selector & Custom City Dispatcher Toolbar */}
      <section className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-[#0c0e15] border border-[#1b1f2d] p-4 rounded-xl">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-mono text-[#64748b] mr-1 uppercase">NETWORK PRESETS:</span>
          {Object.entries(PRESET_SCHEDULES).map(([key, data]) => (
            <button
              key={key}
              onClick={() => switchPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                currentPresetKey === key
                  ? "bg-[#e63946] text-white border-[#e63946] shadow-md shadow-[#e63946]/20"
                  : "bg-[#141822] text-[#8d96a5] border-[#222838] hover:text-white hover:border-[#384259]"
              }`}
            >
              {data.name.split("//")[1]?.trim() || key}
            </button>
          ))}
        </div>

        {/* Custom Destination Input */}
        <form onSubmit={dispatchCustomCity} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={customCityInput}
            onChange={(e) => setCustomCityInput(e.target.value)}
            placeholder="CUSTOM DESTINATION..."
            maxLength={14}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#141822] border border-[#262d40] text-white placeholder-[#525f7a] focus:outline-none focus:border-[#00f0ff] uppercase w-48 md:w-56"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff] hover:text-black transition-all"
          >
            DISPATCH
          </button>
        </form>
      </section>

      {/* Main Asymmetrical Transit Station Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: 8-Row Solari Split-Flap Departure Board Matrix (8 cols) */}
        <section className="lg:col-span-8 bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative select-none">
          <div className="flex flex-wrap items-center justify-between border-b border-[#181b26] pb-3 mb-4 gap-2">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffb703]" />
              01 // Solari di Udine Master Departure Board (Zürich HB Concourse)
            </span>
            <div className="flex items-center gap-2">
              {/* Motor Speed Selector */}
              <div className="hidden sm:flex items-center gap-1 bg-[#131620] border border-[#212738] px-2 py-0.5 rounded text-[10px] font-mono">
                <span className="text-[#64748b]">MOTOR:</span>
                <button
                  onClick={() => setMotorSpeedMs(20)}
                  className={`px-1.5 py-0.5 rounded ${motorSpeedMs === 20 ? "bg-[#00f0ff] text-black font-bold" : "text-[#8d96a5]"}`}
                >
                  TURBO
                </button>
                <button
                  onClick={() => setMotorSpeedMs(36)}
                  className={`px-1.5 py-0.5 rounded ${motorSpeedMs === 36 ? "bg-[#00f0ff] text-black font-bold" : "text-[#8d96a5]"}`}
                >
                  REAL
                </button>
                <button
                  onClick={() => setMotorSpeedMs(80)}
                  className={`px-1.5 py-0.5 rounded ${motorSpeedMs === 80 ? "bg-[#00f0ff] text-black font-bold" : "text-[#8d96a5]"}`}
                >
                  SLOW
                </button>
              </div>

              <button
                onClick={triggerGlobalCascade}
                className="px-3 py-1 rounded text-xs font-mono font-bold bg-[#e63946] text-white hover:bg-[#d62839] shadow-md shadow-[#e63946]/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>↻ CASCADE BOARD [SPACE]</span>
              </button>
            </div>
          </div>

          {/* Schedule Column Headers */}
          <div className="grid grid-cols-12 gap-1 sm:gap-2 text-[10px] font-mono text-[#64748b] font-bold px-2 sm:px-3 py-1 mb-2 border-b border-[#161922] uppercase tracking-wider">
            <span className="col-span-2">TIME</span>
            <span className="col-span-2">TRAIN</span>
            <span className="col-span-5 sm:col-span-4">DESTINATION</span>
            <span className="col-span-1 text-center">PL</span>
            <span className="col-span-2 sm:col-span-3 text-right">STATUS</span>
          </div>

          {/* 8 Departure Rows */}
          <div className="space-y-2 sm:space-y-2.5">
            {schedule.map((item, rowIdx) => {
              const isFlipping = !!flippingRows[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => refreshSingleRow(item.id)}
                  className={`grid grid-cols-12 gap-1 sm:gap-2 items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#0e1017] border border-[#1b202d] hover:border-[#ffb703]/50 cursor-pointer transition-all ${
                    isFlipping ? "bg-[#141822] shadow-lg shadow-[#00f0ff]/5" : ""
                  }`}
                >
                  {/* Time (5 chars, e.g. "12:04") */}
                  <div className="col-span-2 flex gap-0.5 sm:gap-1">
                    {item.time.split("").map((c, i) => (
                      <SplitFlapTile
                        key={i}
                        targetChar={c}
                        isRowFlipping={isFlipping}
                        staggerMs={rowIdx * 20 + i * 15}
                        speedMs={motorSpeedMs}
                        audioEngine={audioRef.current}
                        onFlipStep={handleFlapIncrement}
                        panPosition={-0.6 + i * 0.15}
                      />
                    ))}
                  </div>

                  {/* Train (6 chars, e.g. "IC 1  ") */}
                  <div className="col-span-2 flex gap-0.5 sm:gap-1">
                    {item.train.padEnd(6, " ").slice(0, 6).split("").map((c, i) => (
                      <SplitFlapTile
                        key={i}
                        targetChar={c}
                        isRowFlipping={isFlipping}
                        staggerMs={rowIdx * 20 + i * 15}
                        speedMs={motorSpeedMs}
                        audioEngine={audioRef.current}
                        onFlipStep={handleFlapIncrement}
                        panPosition={-0.3 + i * 0.1}
                      />
                    ))}
                  </div>

                  {/* Destination (14 chars) */}
                  <div className="col-span-5 sm:col-span-4 flex gap-[1px] sm:gap-0.5 overflow-hidden">
                    {item.dest.padEnd(14, " ").slice(0, 14).split("").map((c, i) => (
                      <SplitFlapTile
                        key={i}
                        targetChar={c}
                        isRowFlipping={isFlipping}
                        staggerMs={rowIdx * 25 + i * 20}
                        speedMs={motorSpeedMs}
                        audioEngine={audioRef.current}
                        onFlipStep={handleFlapIncrement}
                        panPosition={-0.1 + i * 0.05}
                      />
                    ))}
                  </div>

                  {/* Platform (2 chars) */}
                  <div className="col-span-1 flex justify-center gap-0.5 sm:gap-1">
                    {item.platform.split("").map((c, i) => (
                      <SplitFlapTile
                        key={i}
                        targetChar={c}
                        isRowFlipping={isFlipping}
                        staggerMs={rowIdx * 20 + i * 15}
                        speedMs={motorSpeedMs}
                        audioEngine={audioRef.current}
                        onFlipStep={handleFlapIncrement}
                        panPosition={0.4 + i * 0.1}
                      />
                    ))}
                  </div>

                  {/* Status (9 chars) */}
                  <div className="col-span-2 sm:col-span-3 flex justify-end gap-[1px] sm:gap-1">
                    {item.status.padEnd(9, " ").slice(0, 9).split("").map((c, i) => (
                      <SplitFlapTile
                        key={i}
                        targetChar={c}
                        isRowFlipping={isFlipping}
                        staggerMs={rowIdx * 20 + i * 15}
                        speedMs={motorSpeedMs}
                        audioEngine={audioRef.current}
                        onFlipStep={handleFlapIncrement}
                        panPosition={0.6 + i * 0.05}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Departure Deck Footer */}
          <div className="mt-4 pt-3 border-t border-[#181b26] flex flex-wrap items-center justify-between text-xs font-mono text-[#71717a] gap-2">
            <span>CLICK ANY ROW OR PRESS [1-8] TO CYCLE FLAPS</span>
            <span>SYSTEM: SOLARI DI UDINE CIP 5 (1956)</span>
          </div>
        </section>

        {/* Cell 2 & 3: Hans Hilfiker SBB Stop2Go Clock & Kinetic Editorial Stage (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Top: SBB Stop2Go Swiss Railway Clock (Hans Hilfiker 1944) */}
          <div className="bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-6 relative shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-[#181b26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e63946]" />
                02 // SBB Stop2Go Chronometer
              </span>
              <button
                onClick={triggerStop2GoTest}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e63946]/10 text-[#e63946] border border-[#e63946]/30 hover:bg-[#e63946] hover:text-white transition-all"
                title="Jump to 56.8s to witness the 2-second stop and minute jump!"
              >
                TEST SYNC [T]
              </button>
            </div>

            {/* Authentic Swiss Railway Clock Face */}
            <div className="relative w-52 h-52 rounded-full bg-[#f8f9fa] border-4 border-[#333d4e] shadow-2xl flex items-center justify-center select-none">
              {/* Dial Minute Ticks (60 subdivisions) */}
              {Array.from({ length: 60 }).map((_, i) => {
                if (i % 5 === 0) return null; // Hour batons handled separately
                const deg = i * 6;
                return (
                  <div
                    key={`min-${deg}`}
                    className="absolute top-2 left-1/2 -translate-x-1/2 origin-bottom h-[98px] pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div className="w-[1px] h-2 bg-[#4b5563]" />
                  </div>
                );
              })}

              {/* Dial Hour Batons (12 subdivisions) */}
              {Array.from({ length: 12 }).map((_, i) => {
                const deg = i * 30;
                return (
                  <div
                    key={`hr-${deg}`}
                    className="absolute top-2 left-1/2 -translate-x-1/2 origin-bottom h-[98px] pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div className="w-1.5 h-4 bg-black rounded-[1px]" />
                  </div>
                );
              })}

              {/* Hour Hand */}
              <div
                className="absolute w-2 h-16 bg-black origin-bottom rounded-t-sm z-10 transition-transform duration-300"
                style={{
                  top: "42px",
                  left: "calc(50% - 4px)",
                  transform: `rotate(${hourAngle}deg)`,
                }}
              />

              {/* Minute Hand */}
              <div
                className="absolute w-1.5 h-22 bg-black origin-bottom rounded-t-sm z-20 transition-transform duration-200"
                style={{
                  top: "20px",
                  left: "calc(50% - 3px)",
                  transform: `rotate(${minuteAngle}deg)`,
                }}
              />

              {/* Iconic Red Second Hand with Round Disc Pointer (Stop2Go) */}
              <div
                className="absolute w-0.5 h-24 bg-[#e63946] origin-bottom z-30 transition-transform duration-75"
                style={{
                  top: "14px",
                  left: "calc(50% - 1px)",
                  transform: `rotate(${stop2GoAngle}deg)`,
                }}
              >
                {/* Red Circular Disc Target Pointer */}
                <div className="absolute -top-1 -left-[6px] w-3.5 h-3.5 rounded-full bg-[#e63946] shadow-sm" />
              </div>

              {/* Central Pivot Cap */}
              <div className="absolute w-3 h-3 rounded-full bg-black z-40 border border-white" />
            </div>

            {/* Stop2Go Synchronizer Explanation */}
            <div className="mt-4 text-center font-mono text-xs">
              <div className="text-[#f8f9fa] font-bold">
                {String(clockHours).padStart(2, "0")}:{String(clockMinutes).padStart(2, "0")}:
                {String(Math.floor(clockSeconds)).padStart(2, "0")} SBB MASTER TIME
              </div>
              <div className="text-[11px] text-[#8d96a5] mt-1">
                58s sweep + 2s pause at 12 o&apos;clock for electrical master synchronization
              </div>
            </div>
          </div>

          {/* Bottom: Swiss Transit-Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0c12] border-2 border-[#1c202d] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181b26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full" />
                03 // Kinetic Transit Typography
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicTypography.wght} · wdth: {dynamicTypography.wdth}
              </span>
            </div>

            {/* Kinetic Variable Typography Specimen */}
            <div className="py-4 relative min-h-[130px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: dynamicTypography.wght,
                  color: "#f8f9fa",
                  textShadow: dynamicTypography.activeCount > 0 ? "0 0 20px rgba(230, 57, 70, 0.4)" : "none",
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ffb703] mb-1.5 uppercase font-semibold">
                  Solari Flap Cascade Kinematics
                </div>
                <h2 className="text-2xl md:text-3xl leading-tight text-[#f8f9fa] tracking-tight">
                  시간의 플랩을 넘겨 미지의 세계로.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2.5 max-w-sm mx-auto leading-relaxed">
                  수천 장의 플랩이 뒤집히며 새로운 목적지를 알릴 때, 스위스 에디토리얼 활자는 기계식 회전 관성에 공명하여 굵기를 유기적으로 호흡합니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181b26] flex items-center justify-between font-mono text-xs text-[#788599]">
              <div>
                <span>TYPOGRAPHY: </span>
                <span className="text-[#f8f9fa] font-bold">Adrian Frutiger SBB</span>
              </div>
              <div>
                <span>FLAP ACTIVE: </span>
                <span className="text-[#00f0ff] font-bold">{dynamicTypography.activeCount} / 8 ROWS</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Quick Cascade Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={triggerGlobalCascade}
            className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all border flex items-center gap-2 bg-[#161a25] text-[#00f0ff] border-[#00f0ff] hover:bg-[#00f0ff] hover:text-black shadow-lg shadow-[#00f0ff]/10 active:scale-95"
          >
            <span>↻ CASCADE ALL ROWS [SPACE]</span>
          </button>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL SHORTCUTS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#00f0ff] font-bold" : ""}>[SPACE] Cascade All</span>
            <span>·</span>
            <span>[1-8] Row Refresh</span>
            <span>·</span>
            <span className={keyHint === "T" ? "text-[#e63946] font-bold" : ""}>[T] Test Stop2Go</span>
            <span>·</span>
            <span>[M] Mute Audio</span>
          </div>
        </div>

        {/* Right: Station Announce Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              audioRef.current?.playStationChime();
            }}
            className="px-5 py-3.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border bg-[#1a1215] text-[#e63946] border-[#e63946] hover:bg-[#e63946] hover:text-white"
          >
            <span>PLAY SBB STATION CHIME</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
