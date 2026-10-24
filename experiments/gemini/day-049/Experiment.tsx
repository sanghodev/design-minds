"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// --- Deck Architecture Mode (Studer Open-Reel vs. Compact Cassette) ---
type DeckMode = "STUDER_OPEN_REEL" | "COMPACT_CASSETTE";

// --- Tape Speeds ---
interface TapeSpeed {
  id: string;
  ips: number;
  cms: number;
  label: string;
  wowFlutter: number; // percentage
  hissGain: number;
  saturationMult: number;
}

const TAPE_SPEEDS: TapeSpeed[] = [
  { id: "15ips", ips: 15, cms: 38.1, label: "15 IPS (Studio Master)", wowFlutter: 0.04, hissGain: 0.06, saturationMult: 1.0 },
  { id: "7.5ips", ips: 7.5, cms: 19.05, label: "7.5 IPS (High Fidelity)", wowFlutter: 0.08, hissGain: 0.10, saturationMult: 1.25 },
  { id: "1.875ips", ips: 1.875, cms: 4.76, label: "1⅞ IPS (Cassette C-90)", wowFlutter: 0.18, hissGain: 0.15, saturationMult: 1.6 },
];

// --- Studer Tape Audio Movements ---
interface TapeTrack {
  id: number;
  title: string;
  koTitle: string;
  freqs: number[];
  baseBpm: number;
}

const TAPE_TRACKS: TapeTrack[] = [
  {
    id: 1,
    title: "Analog Hysteresis in C Minor",
    koTitle: "제1악장: 자기 이력 서곡 (C Minor)",
    freqs: [130.81, 196.0, 261.63, 311.13, 392.0], // C3, G3, C4, Eb4, G4
    baseBpm: 72,
  },
  {
    id: 2,
    title: "Capstan Wow & Flutter Etude",
    koTitle: "제2악장: 캡스턴 와우-플러터 에튀드",
    freqs: [146.83, 220.0, 293.66, 349.23, 440.0], // D3, A3, D4, F4, A4
    baseBpm: 68,
  },
  {
    id: 3,
    title: "Studer Master Silence & Tape Hiss",
    koTitle: "제3악장: 스튜더 마스터 침묵과 테이프 히스",
    freqs: [110.0, 164.81, 220.0, 277.18, 329.63], // A2, E3, A3, C#4, E4
    baseBpm: 60,
  },
];

// --- High-Fidelity Web Audio Physical Sound Synthesizer ---
class MasterworkStuderAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private hissNode: AudioNode | null = null;
  private hissGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];

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

  // Solenoid mechanical "CLUNK" on PLAY/STOP
  playSolenoidClunk(isEngaging: boolean) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Heavy iron armature mechanical impact
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      filter1.type = "lowpass";
      filter1.frequency.setValueAtTime(isEngaging ? 480 : 360, t);

      osc1.type = "square";
      osc1.frequency.setValueAtTime(isEngaging ? 130 : 95, t);
      osc1.frequency.exponentialRampToValueAtTime(32, t + 0.045);

      gain1.gain.setValueAtTime(0.55, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.065);

      // 2. High-frequency latch click
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(2600, t);
      osc2.frequency.exponentialRampToValueAtTime(400, t + 0.015);

      gain2.gain.setValueAtTime(0.35, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t);
      osc2.stop(t + 0.025);
    } catch {}
  }

  // Ratchet click during manual pen winding
  playHubRatchet() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(2800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.008);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.015);
    } catch {}
  }

  // Analog tape hiss generator
  startHiss(gainVal: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.hissNode) this.stopHiss();

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.035;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(4500, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.hissGain = this.ctx.createGain();
      this.hissGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.hissGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.3);

      noiseSource.connect(filter);
      filter.connect(this.hissGain);
      this.hissGain.connect(this.ctx.destination);

      noiseSource.start();
      this.hissNode = noiseSource;
    } catch {}
  }

  stopHiss() {
    try {
      if (this.hissGain && this.ctx) {
        this.hissGain.gain.setValueAtTime(this.hissGain.gain.value, this.ctx.currentTime);
        this.hissGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      }
      setTimeout(() => {
        if (this.hissNode) {
          (this.hissNode as AudioBufferSourceNode).stop();
          this.hissNode.disconnect();
          this.hissNode = null;
        }
      }, 250);
    } catch {}
  }

  // Playback music synthesis with subtle wow/flutter modulation
  startMusic(track: TapeTrack, wowFlutterAmount: number) {
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
        osc.type = i === 0 ? "sawtooth" : i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t);

        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(1.2 + i * 0.4, t);
        lfoGain.gain.setValueAtTime(freq * (wowFlutterAmount * 0.05), t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(t);

        osc.connect(this.musicGain!);
        osc.start(t);
        return osc;
      });
    } catch {}
  }

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

export default function MasterworkStuderTapeTransportBento() {
  // --- States ---
  type TransportState = "STOP" | "PLAY" | "FF" | "REW";
  const [transportState, setTransportState] = useState<TransportState>("PLAY");
  const [deckMode, setDeckMode] = useState<DeckMode>("STUDER_OPEN_REEL");
  const [speedIdx, setSpeedIdx] = useState<number>(0);
  const [trackIdx, setTrackIdx] = useState<number>(0);
  const [tapePosition, setTapePosition] = useState<number>(0.35);
  const [isWindingManual, setIsWindingManual] = useState<boolean>(false);
  const [penAngle, setPenAngle] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [vuLeft, setVuLeft] = useState<number>(0.65);
  const [vuRight, setVuRight] = useState<number>(0.58);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  // Audio Engine & Canvas Refs
  const audioRef = useRef<MasterworkStuderAudio | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const manualDragStartRef = useRef<{ x: number; y: number; initialPos: number } | null>(null);

  useEffect(() => {
    audioRef.current = new MasterworkStuderAudio();
    audioRef.current.playSolenoidClunk(true);
    audioRef.current.startHiss(TAPE_SPEEDS[0].hissGain);
    audioRef.current.startMusic(TAPE_TRACKS[0], TAPE_SPEEDS[0].wowFlutter);

    return () => {
      audioRef.current?.stopHiss();
      audioRef.current?.stopMusic();
    };
  }, []);

  const curSpeed = TAPE_SPEEDS[speedIdx];
  const curTrack = TAPE_TRACKS[trackIdx];

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.isMuted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        audioRef.current.stopHiss();
        audioRef.current.stopMusic();
      } else if (transportState === "PLAY") {
        audioRef.current.startHiss(curSpeed.hissGain);
        audioRef.current.startMusic(curTrack, curSpeed.wowFlutter);
      }
    }
  };

  const setTransport = useCallback(
    (newState: TransportState) => {
      if (newState === transportState) return;
      const isEngaging = newState === "PLAY" || newState === "FF" || newState === "REW";
      audioRef.current?.playSolenoidClunk(isEngaging);

      if (newState === "PLAY") {
        audioRef.current?.startHiss(curSpeed.hissGain);
        audioRef.current?.startMusic(curTrack, curSpeed.wowFlutter);
      } else {
        audioRef.current?.stopMusic();
        if (newState === "STOP") {
          audioRef.current?.stopHiss();
        } else {
          audioRef.current?.startHiss(curSpeed.hissGain * 1.5);
        }
      }
      setTransportState(newState);
    },
    [transportState, curSpeed, curTrack]
  );

  const switchSpeed = (idx: number) => {
    setSpeedIdx(idx);
    audioRef.current?.playSolenoidClunk(false);
    if (transportState === "PLAY") {
      audioRef.current?.startHiss(TAPE_SPEEDS[idx].hissGain);
      audioRef.current?.startMusic(curTrack, TAPE_SPEEDS[idx].wowFlutter);
    }
  };

  const switchTrack = (idx: number) => {
    setTrackIdx(idx);
    if (transportState === "PLAY") {
      audioRef.current?.startMusic(TAPE_TRACKS[idx], curSpeed.wowFlutter);
    }
  };

  const toggleDeckMode = () => {
    audioRef.current?.playSolenoidClunk(false);
    setDeckMode((prev) => (prev === "STUDER_OPEN_REEL" ? "COMPACT_CASSETTE" : "STUDER_OPEN_REEL"));
  };

  // Spool Radius Conservation Calculation
  const { rSupply, rTakeup } = useMemo(() => {
    const minR = deckMode === "STUDER_OPEN_REEL" ? 24 : 16;
    const maxR = deckMode === "STUDER_OPEN_REEL" ? 68 : 46;
    const totalArea = maxR * maxR + minR * minR;
    const r1 = Math.sqrt(Math.max(minR * minR, (1 - tapePosition) * (maxR * maxR - minR * minR) + minR * minR));
    const r2 = Math.sqrt(Math.max(minR * minR, totalArea - r1 * r1));
    return { rSupply: r1, rTakeup: r2 };
  }, [tapePosition, deckMode]);

  const dynamicTypography = useMemo(() => {
    const isMoving = transportState !== "STOP";
    const speedFactor = transportState === "PLAY" ? 1.0 : transportState === "FF" ? 1.8 : transportState === "REW" ? -1.8 : 0;
    const baseWeight = isMoving ? 650 : 350;
    const wght = Math.round(baseWeight + speedFactor * 100 * curSpeed.saturationMult);
    const wdth = Math.round(95 + speedFactor * 15);
    return { wght: Math.max(300, Math.min(850, wght)), wdth: Math.max(85, Math.min(120, wdth)) };
  }, [transportState, curSpeed]);

  // Main 60fps Canvas Reel Transport Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let supplyRot = 0;
    let takeupRot = 0;

    const render = (now: number) => {
      const delta = (now - lastTimeRef.current) * 0.001;
      lastTimeRef.current = now;

      if (transportState === "PLAY") {
        const speedRate = (curSpeed.ips / 15) * 0.025;
        setTapePosition((prev) => {
          const next = prev + delta * speedRate;
          if (next >= 1.0) {
            setTransport("STOP");
            return 1.0;
          }
          return next;
        });
      } else if (transportState === "FF") {
        setTapePosition((prev) => {
          const next = prev + delta * 0.12;
          if (next >= 1.0) {
            setTransport("STOP");
            return 1.0;
          }
          return next;
        });
      } else if (transportState === "REW") {
        setTapePosition((prev) => {
          const next = prev - delta * 0.12;
          if (next <= 0.0) {
            setTransport("STOP");
            return 0.0;
          }
          return next;
        });
      }

      if (transportState === "PLAY") {
        const pulse = Math.sin(now * 0.008) * 0.25;
        setVuLeft(Math.max(0.1, Math.min(0.95, 0.6 + pulse + (Math.random() - 0.5) * 0.1)));
        setVuRight(Math.max(0.1, Math.min(0.95, 0.55 + pulse + (Math.random() - 0.5) * 0.12)));
      } else {
        setVuLeft((prev) => Math.max(0.05, prev * 0.9));
        setVuRight((prev) => Math.max(0.05, prev * 0.9));
      }

      const v = transportState === "PLAY" ? 38.1 : transportState === "FF" ? 110 : transportState === "REW" ? -110 : 0;
      const omega1 = v / rSupply;
      const omega2 = v / rTakeup;
      supplyRot += omega1 * delta * 2;
      takeupRot += omega2 * delta * 2;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (deckMode === "STUDER_OPEN_REEL") {
        // --- 1. Studer Open-Reel Deck Mode ---
        ctx.fillStyle = "#12151c";
        ctx.fillRect(0, 0, w, h);

        const reelY = h * 0.42;
        const leftReelX = w * 0.28;
        const rightReelX = w * 0.72;
        const headBlockY = h * 0.78;

        // Tape Ribbon
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(leftReelX, reelY + rSupply);
        ctx.lineTo(w * 0.32, headBlockY - 14);
        ctx.lineTo(w * 0.5, headBlockY);
        ctx.lineTo(w * 0.68, headBlockY - 14);
        ctx.lineTo(rightReelX, reelY + rTakeup);
        ctx.stroke();

        // Magnetic Heads
        const headX = [w * 0.44, w * 0.5, w * 0.56];
        const headLabels = ["E", "R", "P"];
        headX.forEach((hx, i) => {
          ctx.fillStyle = "#262d3d";
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 1.5;
          ctx.fillRect(hx - 8, headBlockY - 12, 16, 24);
          ctx.strokeRect(hx - 8, headBlockY - 12, 16, 24);

          ctx.fillStyle = "#00f0ff";
          ctx.fillRect(hx - 1, headBlockY - 10, 2, 20);

          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 9px monospace";
          ctx.fillText(headLabels[i], hx - 3, headBlockY + 22);
        });

        // Capstan & Rubber Pinch Roller
        const capstanX = w * 0.65;
        const capstanY = headBlockY - 8;
        const isEngaged = transportState === "PLAY";

        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(capstanX, capstanY, 5, 0, Math.PI * 2);
        ctx.fill();

        const rollerOffset = isEngaged ? 9 : 18;
        ctx.fillStyle = "#1c2028";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(capstanX, capstanY + rollerOffset, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // NAB Reel Renderer
        const drawStuderReel = (cx: number, cy: number, currentRadius: number, rotation: number, isSupply: boolean) => {
          const flangeRadius = 78;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotation);

          ctx.fillStyle = "#8b4513";
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#384152";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, flangeRadius, 0, Math.PI * 2);
          ctx.stroke();

          for (let i = 0; i < 3; i++) {
            const a = (i * Math.PI * 2) / 3;
            ctx.save();
            ctx.rotate(a);
            ctx.fillStyle = "rgba(10, 12, 16, 0.45)";
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.arc(38, 0, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          ctx.fillStyle = "#c5cad3";
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#12151c";
          for (let j = 0; j < 3; j++) {
            const slotA = (j * Math.PI * 2) / 3;
            ctx.save();
            ctx.rotate(slotA);
            ctx.fillRect(-3, 14, 6, 8);
            ctx.restore();
          }

          ctx.strokeStyle = isSupply ? "#ff6b35" : "#00f0ff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        };

        drawStuderReel(leftReelX, reelY, rSupply, supplyRot, true);
        drawStuderReel(rightReelX, reelY, rTakeup, takeupRot, false);
      } else {
        // --- 2. Compact Cassette Deck Mode (Iconic Smoked Shell) ---
        ctx.fillStyle = "#0c0e14";
        ctx.fillRect(0, 0, w, h);

        // Cassette Outer Shell
        const shellW = 420;
        const shellH = 240;
        const shellX = (w - shellW) / 2;
        const shellY = (h - shellH) / 2;

        ctx.fillStyle = "#1a1f29";
        ctx.strokeStyle = "#333d4e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(shellX, shellY, shellW, shellH, 12);
        ctx.fill();
        ctx.stroke();

        // J-Card Label Strip (Yellow & Black Bauhaus Stripe)
        ctx.fillStyle = "#facc15";
        ctx.fillRect(shellX + 30, shellY + 25, shellW - 60, 32);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 13px monospace";
        ctx.fillText("TYPE II HIGH-BIAS CHROME // C-90 MASTER", shellX + 45, shellY + 46);

        // Center Viewing Window
        const winW = 240;
        const winH = 110;
        const winX = (w - winW) / 2;
        const winY = shellY + 70;
        ctx.fillStyle = "#0a0c10";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, 8);
        ctx.fill();
        ctx.stroke();

        const leftHubX = winX + 55;
        const rightHubX = winX + winW - 55;
        const hubY = winY + winH / 2;

        // Tape Ribbon between cassette hubs
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftHubX, hubY + rSupply);
        ctx.lineTo(shellX + 60, shellY + shellH - 25);
        ctx.lineTo(shellX + shellW - 60, shellY + shellH - 25);
        ctx.lineTo(rightHubX, hubY + rTakeup);
        ctx.stroke();

        // Cassette 5-Tooth White Rosette Hubs
        const drawCassetteHub = (cx: number, cy: number, currentRadius: number, rotation: number) => {
          ctx.save();
          ctx.translate(cx, cy);

          // Tape Pack
          ctx.fillStyle = "#8b4513";
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // White Plastic Rosette Hub
          ctx.rotate(rotation);
          ctx.fillStyle = "#f8f9fa";
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();

          // 5 Hub Teeth
          ctx.fillStyle = "#0a0c10";
          for (let i = 0; i < 5; i++) {
            const toothA = (i * Math.PI * 2) / 5;
            ctx.save();
            ctx.rotate(toothA);
            ctx.fillRect(-2, 10, 4, 7);
            ctx.restore();
          }

          // Center Hole
          ctx.fillStyle = "#0a0c10";
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        };

        drawCassetteHub(leftHubX, hubY, rSupply, supplyRot);
        drawCassetteHub(rightHubX, hubY, rTakeup, takeupRot);

        // Visual Ballpoint Pen / Pencil Winding Indicator
        if (isWindingManual) {
          ctx.save();
          ctx.translate(leftHubX, hubY);
          ctx.rotate((penAngle * Math.PI) / 180);
          ctx.fillStyle = "#f59e0b"; // Yellow pencil body
          ctx.fillRect(-6, -60, 12, 120);
          ctx.fillStyle = "#ef4444"; // Eraser
          ctx.fillRect(-6, -70, 12, 10);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [transportState, curSpeed, rSupply, rTakeup, setTransport, deckMode, isWindingManual, penAngle]);

  // Pointer Dragging for Ballpoint Pen Hub Winding
  const handlePointerDownDeck = (e: React.PointerEvent) => {
    setIsWindingManual(true);
    manualDragStartRef.current = { x: e.clientX, y: e.clientY, initialPos: tapePosition };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDeck = (e: React.PointerEvent) => {
    if (!isWindingManual || !manualDragStartRef.current) return;
    const dx = e.clientX - manualDragStartRef.current.x;
    const sensitivity = 0.002;
    const nextPos = Math.max(0.0, Math.min(1.0, manualDragStartRef.current.initialPos + dx * sensitivity));

    setPenAngle((prev) => (prev + dx * 1.5) % 360);

    if (Math.abs(nextPos - tapePosition) > 0.012) {
      audioRef.current?.playHubRatchet();
    }
    setTapePosition(nextPos);
  };

  const handlePointerUpDeck = (e: React.PointerEvent) => {
    if (isWindingManual) {
      setIsWindingManual(false);
      manualDragStartRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setKeyHint("SPACE");
        setTransport(transportState === "PLAY" ? "STOP" : "PLAY");
      } else if (e.code === "KeyF") {
        e.preventDefault();
        setKeyHint("F");
        setTransport("FF");
      } else if (e.code === "KeyR") {
        e.preventDefault();
        setKeyHint("R");
        setTransport("REW");
      } else if (e.code === "KeyC") {
        e.preventDefault();
        setKeyHint("C");
        toggleDeckMode();
      } else if (e.key === "1") {
        switchSpeed(0);
      } else if (e.key === "2") {
        switchSpeed(1);
      } else if (e.key === "3") {
        switchSpeed(2);
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
  }, [transportState, setTransport]);

  return (
    <div className="relative min-h-screen w-full bg-[#080a0f] text-[#e2e5eb] font-sans antialiased selection:bg-[#ff6b35] selection:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Modernist Swiss Header Console (Studer A80 / Braun TG 60 Lineage) */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1b202c] pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#ff6b35] uppercase font-mono font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
            Day 049 · Gemini 4 Argon Masterwork Architecture
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#f8f9fa] mt-1">
            Magnetic Tape Spool Kinematics & Capstan Wow-Flutter Bento
          </h1>
          <p className="text-sm md:text-base text-[#8d96a5] mt-1 max-w-3xl">
            스위스 스튜더(Studer) 10.5인치 오픈릴과 필립스 카세트 볼펜 와인딩 햅틱, 15 IPS 캡스턴 핀치 롤러, 그리고 아날로그 자기 포화 에디토리얼 건축
          </p>
        </div>

        {/* Global Mechanical & Acoustic Telemetry */}
        <div className="flex flex-wrap items-center gap-3 bg-[#11141c] border border-[#212738] px-4 py-2.5 rounded-xl font-mono text-xs shadow-inner">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181d28] hover:bg-[#252d3d] text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>{isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}</span>
          </button>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">DECK: </span>
            <span className="text-[#ff6b35] font-bold">
              {deckMode === "STUDER_OPEN_REEL" ? "STUDER A80 OPEN REEL" : "COMPACT CASSETTE C-90"}
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">STATE: </span>
            <span className={transportState === "PLAY" ? "text-[#10b981] font-bold" : "text-[#ffb703] font-bold"}>
              {transportState} [{curSpeed.ips} IPS]
            </span>
          </div>
          <div className="h-4 w-px bg-[#212738]" />
          <div>
            <span className="text-[#64748b]">W&F: </span>
            <span className="text-[#f8f9fa] font-bold">{curSpeed.wowFlutter}% WRMS</span>
          </div>
        </div>
      </header>

      {/* Speed & Format Selector Rail */}
      <nav className="w-full max-w-7xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {TAPE_SPEEDS.map((sp, idx) => {
          const isSelected = idx === speedIdx;
          return (
            <button
              key={sp.id}
              onClick={() => switchSpeed(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#151a24] border-[#ff6b35] shadow-lg shadow-[#ff6b35]/10"
                  : "bg-[#0b0d13] border-[#1d222e] hover:border-[#2d3444] hover:bg-[#10131a]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#94a3b8]">SPEED 0{idx + 1}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${isSelected ? "bg-[#ff6b35] text-white" : "text-[#64748b]"}`}>
                  {sp.cms} cm/s
                </span>
              </div>
              <div className="text-sm md:text-base font-bold text-[#f8f9fa] mt-1">{sp.label}</div>
              <div className="text-xs text-[#71717a] mt-0.5">Flutter: {sp.wowFlutter}% WRMS · Saturation: {sp.saturationMult}x</div>
            </button>
          );
        })}
      </nav>

      {/* Main Asymmetrical Swiss Bento Stage */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Cell 1: Studer Dual-Spool Transport Canvas Deck (7 cols) */}
        <section
          onPointerDown={handlePointerDownDeck}
          onPointerMove={handlePointerMoveDeck}
          onPointerUp={handlePointerUpDeck}
          className="lg:col-span-7 bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none"
        >
          <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
            <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
              01 // {deckMode === "STUDER_OPEN_REEL" ? "Studer A80 10.5" Master Transport" : "Philips Compact Cassette C-90 Window"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDeckMode();
                }}
                className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#1d2332] text-[#ff6b35] hover:bg-[#283247] border border-[#ff6b35]/30 transition-all"
              >
                SWITCH TO {deckMode === "STUDER_OPEN_REEL" ? "CASSETTE [C]" : "STUDER [C]"}
              </button>
            </div>
          </div>

          {/* Interactive Reel Transport Canvas */}
          <div className="relative flex items-center justify-center py-2">
            <canvas
              ref={canvasRef}
              width={620}
              height={320}
              className="w-full h-[280px] md:h-[320px] rounded-xl cursor-ew-resize touch-none"
            />
          </div>

          {/* Transport Mechanical Keypads */}
          <div className="mt-4 pt-4 border-t border-[#181c26] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTransport("REW")}
                className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                  transportState === "REW"
                    ? "bg-[#ffb703] text-black border-[#ffb703]"
                    : "bg-[#141822] text-[#9ca3af] border-[#252c3c] hover:text-white"
                }`}
              >
                ◀◀ REW [R]
              </button>
              <button
                onClick={() => setTransport(transportState === "PLAY" ? "STOP" : "PLAY")}
                className={`px-5 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                  transportState === "PLAY"
                    ? "bg-[#10b981] text-black border-[#10b981] shadow-md shadow-[#10b981]/20"
                    : "bg-[#141822] text-[#f8f9fa] border-[#252c3c] hover:border-[#10b981]"
                }`}
              >
                {transportState === "PLAY" ? "❚❚ STOP [SPACE]" : "▶ PLAY [SPACE]"}
              </button>
              <button
                onClick={() => setTransport("FF")}
                className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                  transportState === "FF"
                    ? "bg-[#ffb703] text-black border-[#ffb703]"
                    : "bg-[#141822] text-[#9ca3af] border-[#252c3c] hover:text-white"
                }`}
              >
                ▶▶ FF [F]
              </button>
            </div>

            <div className="text-xs font-mono text-[#71717a]">
              <span>DRAG TAPE TO WIND WITH PEN</span>
            </div>
          </div>
        </section>

        {/* Cell 2 & 3: Dual Analog VU Meters & Editorial Kinetic Stage (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Top: Dual Analog VU Meters */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ffb703] rounded-full" />
                02 // Dual Analog VU Ballistics
              </span>
              <span className="text-xs font-mono text-[#00f0ff]">
                +3 dB OVERLOAD SATURATION
              </span>
            </div>

            {/* Twin Illuminated Analog VU Meters */}
            <div className="grid grid-cols-2 gap-4">
              {/* Channel 1 Left VU */}
              <div className="bg-[#fffbeb] p-3 rounded-xl border border-[#d97706] text-black font-mono shadow-inner relative overflow-hidden h-[105px] flex flex-col justify-between">
                <div className="flex justify-between text-[9px] font-bold text-[#78350f]">
                  <span>-20</span>
                  <span>-10</span>
                  <span>-7</span>
                  <span>-3</span>
                  <span>0</span>
                  <span className="text-[#dc2626]">+3</span>
                </div>
                <div className="relative h-12 w-full flex items-end justify-center">
                  <div
                    className="w-0.5 h-12 bg-black origin-bottom transition-transform duration-75 shadow-sm"
                    style={{ transform: `rotate(${(vuLeft - 0.5) * 80}deg)` }}
                  />
                  <div className="absolute bottom-0 w-3 h-3 rounded-full bg-black" />
                </div>
                <div className="text-center text-[10px] font-extrabold text-[#78350f]">
                  CH 1 (LEFT) VU
                </div>
              </div>

              {/* Channel 2 Right VU */}
              <div className="bg-[#fffbeb] p-3 rounded-xl border border-[#d97706] text-black font-mono shadow-inner relative overflow-hidden h-[105px] flex flex-col justify-between">
                <div className="flex justify-between text-[9px] font-bold text-[#78350f]">
                  <span>-20</span>
                  <span>-10</span>
                  <span>-7</span>
                  <span>-3</span>
                  <span>0</span>
                  <span className="text-[#dc2626]">+3</span>
                </div>
                <div className="relative h-12 w-full flex items-end justify-center">
                  <div
                    className="w-0.5 h-12 bg-black origin-bottom transition-transform duration-75 shadow-sm"
                    style={{ transform: `rotate(${(vuRight - 0.5) * 80}deg)` }}
                  />
                  <div className="absolute bottom-0 w-3 h-3 rounded-full bg-black" />
                </div>
                <div className="text-center text-[10px] font-extrabold text-[#78350f]">
                  CH 2 (RIGHT) VU
                </div>
              </div>
            </div>

            {/* Movement Selector */}
            <div className="mt-4 pt-3 border-t border-[#181c26] grid grid-cols-3 gap-2">
              {TAPE_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => switchTrack(idx)}
                  className={`p-2 rounded-lg text-left font-mono text-[11px] border transition-all ${
                    idx === trackIdx
                      ? "bg-[#181d29] border-[#ff6b35] text-white"
                      : "bg-[#0f1118] border-[#1d2330] text-[#71717a] hover:text-[#d1d5db]"
                  }`}
                >
                  <div className="text-[9px] text-[#64748b]">MVT 0{t.id}</div>
                  <div className="font-bold truncate mt-0.5">{t.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom: Swiss Audio-Editorial Variable Typography Specimen */}
          <div className="bg-[#0b0d13] border border-[#1b202c] rounded-2xl p-6 relative shadow-2xl flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#181c26] pb-3 mb-4">
              <span className="text-xs font-mono tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ff6b35] rounded-full" />
                03 // Wow-and-Flutter Kinetic Typography
              </span>
              <span className="text-xs font-mono text-[#788599]">
                wght: {dynamicTypography.wght} · wdth: {dynamicTypography.wdth}
              </span>
            </div>

            {/* Kinetic Typography Specimen responding to tape momentum */}
            <div className="py-4 relative min-h-[130px] flex items-center justify-center overflow-hidden">
              <div
                className="text-center transition-all duration-150 select-none"
                style={{
                  fontWeight: dynamicTypography.wght,
                  color: "#f8f9fa",
                  textShadow: transportState === "PLAY" ? "0 0 15px rgba(255, 107, 53, 0.4)" : "none",
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#ff6b35] mb-1.5 uppercase font-semibold">
                  Magnetic Flux Saturation (B = μH)
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight text-[#f8f9fa] tracking-tight">
                  시간의 무게를 테이프에 새겨 견인하다.
                </h2>
                <p className="text-xs md:text-sm text-[#94a3b8] mt-2.5 max-w-md mx-auto leading-relaxed">
                  산화철 리본이 재생 헤드를 스치는 순간, 캡스턴 롤러의 기계적 텐션과 테이프 포화도가 활자의 굵기와 자폭을 유연하게 호흡시킵니다.
                </p>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="pt-4 border-t border-[#181c26] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-[#788599]">
              <div>
                <span>STUDER TRANSPORT: </span>
                <span className="text-[#f8f9fa] font-bold">A80 Master Recorder</span>
              </div>
              <div>
                <span>TAPE SPEED: </span>
                <span className="text-[#ff6b35] font-bold">{curSpeed.label}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Tactile Control Console & Keyboard Guide */}
      <footer className="w-full max-w-7xl mt-8 bg-[#0d0f15] border-2 border-[#202636] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Transport Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="px-5 py-3 rounded-xl bg-[#141822] border border-[#232b3a] font-mono text-xs flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${transportState === "PLAY" ? "bg-[#10b981] animate-pulse" : "bg-[#ff6b35]"}`} />
            <span className="font-bold text-[#f8f9fa]">STATE: {transportState}</span>
            <span className="text-[#64748b]">|</span>
            <span className="text-[#ffb703]">POS: {(tapePosition * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Center: Keyboard Navigation Guide */}
        <div className="flex flex-col items-center gap-1.5 text-center font-mono text-xs text-[#8d96a5]">
          <div className="text-[#64748b]">EMBODIED PHYSICAL CONTROLS</div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className={keyHint === "SPACE" ? "text-[#10b981] font-bold" : ""}>[SPACE] Play/Stop</span>
            <span>·</span>
            <span className={keyHint === "F" ? "text-[#ffb703] font-bold" : ""}>[F] Fast Forward</span>
            <span>·</span>
            <span className={keyHint === "R" ? "text-[#ffb703] font-bold" : ""}>[R] Rewind</span>
            <span>·</span>
            <span className={keyHint === "C" ? "text-[#00f0ff] font-bold" : ""}>[C] Studer/Cassette</span>
            <span>·</span>
            <span>[1/2/3] Speed</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button
            onClick={() => setTapePosition(0)}
            className="px-5 py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all border bg-[#151924] text-[#8d96a5] border-[#273042] hover:text-white hover:border-[#ff6b35]"
          >
            <span>REWIND TO HEAD (0%)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
