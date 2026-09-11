"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function CymaticResonanceExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frequency, setFrequency] = useState<number>(440);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const freqRef = useRef<number>(440);
  freqRef.current = frequency;

  // Web Audio synthesis
  const toggleAudio = () => {
    if (!isAudioActive) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      setIsAudioActive(true);
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsAudioActive(false);
    }
  };

  useEffect(() => {
    if (audioCtxRef.current && oscRef.current) {
      oscRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.04);
    }
  }, [frequency]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize 3500 brass sand particles
    const particleCount = Math.min(3500, Math.floor((width * height) / 380));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));

    const render = () => {
      ctx.fillStyle = "rgba(8, 10, 15, 0.35)"; // Acoustic dark slate persistence
      ctx.fillRect(0, 0, width, height);

      const f = freqRef.current;
      // Chladni modal parameters m, n based on frequency bands
      const n = Math.max(1, Math.floor(f / 110));
      const m = n + 1;

      // Check if frequency is at a resonant harmonic lock (multiples of 110Hz)
      const harmonicDelta = Math.min(
        Math.abs(f - 110), Math.abs(f - 220), Math.abs(f - 330),
        Math.abs(f - 440), Math.abs(f - 528), Math.abs(f - 660), Math.abs(f - 880)
      );
      const isResonant = harmonicDelta < 10;

      // Draw subtle circular brass Chladni plate boundary
      ctx.strokeStyle = isResonant ? "rgba(229, 193, 88, 0.35)" : "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, Math.min(width, height) * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Update and draw Chladni sand grains
      ctx.fillStyle = isResonant ? "#e5c158" : "#94a3b8";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Normalize plate coordinates (-1 to 1)
        const nx = (p.x - width * 0.5) / (width * 0.4);
        const ny = (p.y - height * 0.5) / (height * 0.4);

        // Chladni 2D standing wave equation: w = cos(n*pi*x)*cos(m*pi*y) - cos(m*pi*x)*cos(n*pi*y)
        const w = Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
                  Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny);

        // Particles are pushed away from high vibration regions (|w| > 0) toward nodal lines (w = 0)
        const force = w * (isResonant ? 1.4 : 4.2);
        p.vx += (Math.random() - 0.5) * force * 0.8;
        p.vy += (Math.random() - 0.5) * force * 0.8;

        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Keep inside bounds
        if (p.x < 20) p.x = width - 20;
        if (p.x > width - 20) p.x = 20;
        if (p.y < 20) p.y = height - 20;
        if (p.y > height - 20) p.y = 20;

        ctx.fillRect(p.x, p.y, 2, 2);
      }

      // Draw resonant typographic center
      ctx.font = `900 ${Math.min(width * 0.12, 110)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isResonant ? "rgba(255, 255, 255, 0.95)" : "rgba(148, 163, 184, 0.35)";
      if (!isResonant) {
        // Blur text during acoustic turbulence
        ctx.shadowColor = "#e5c158";
        ctx.shadowBlur = Math.min(25, harmonicDelta * 1.5);
      } else {
        ctx.shadowColor = "#e5c158";
        ctx.shadowBlur = 30;
      }
      ctx.fillText("CYMATICS", width * 0.5, height * 0.5);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    // Vertical scrubbing across the screen directly tunes frequency
    const ratio = Math.max(0, Math.min(1, 1 - e.clientY / window.innerHeight));
    setFrequency(Math.round(80 + ratio * 800)); // 80Hz to 880Hz
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#080a0f] select-none touch-none cursor-ns-resize font-mono relative"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Minimal Corner HUD (No Sidebars) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="text-xs text-[#94a3b8] hover:text-[#e5c158] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-004 // CHLADNI ACOUSTICS
        </Link>
        <span className="text-[10px] text-[#475569] uppercase tracking-wider block mt-1">
          Ernst Chladni Nodal Physics (1787)
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 flex items-center gap-6 pointer-events-auto">
        <div className="text-right text-xs">
          <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Acoustic Pitch</div>
          <div className="text-[#e5c158] text-lg font-bold">{frequency} Hz</div>
        </div>
        <button
          onClick={toggleAudio}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            isAudioActive ? "border-emerald-400 text-emerald-400 bg-emerald-400/10" : "border-[#334155] text-[#94a3b8]"
          }`}
        >
          {isAudioActive ? "🔊 TONE ACTIVE" : "🔇 AUDIO MUTED"}
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-30 text-[11px] text-[#475569] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        DRAG VERTICALLY TO SWEEP FREQUENCY. HARMONIC STANDING WAVES (110, 220, 440, 528 HZ) DRIVE SCATTERED SAND GRAINS INTO CRYSTALLINE NODAL FORM.
      </div>

      <div className="absolute bottom-8 right-8 z-30 text-[10px] text-[#475569] pointer-events-none text-right">
        <span>BESSEL NORMAL-FIELD HARMONICS J_m(kr) = 0</span>
      </div>
    </div>
  );
}
