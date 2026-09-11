"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function FerromagneticFluxExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gauss, setGauss] = useState<number>(75);
  const [pole, setPole] = useState<1 | -1>(1); // 1 = North, -1 = South
  const [particleCount, setParticleCount] = useState<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    mouseRef.current.x = width * 0.5;
    mouseRef.current.y = height * 0.32;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    // Off-screen canvas to rasterize typography into target particle coordinates
    interface SpikeParticle {
      bx: number; // base x
      by: number; // base y
      x: number;  // current x
      y: number;  // current y
      vx: number;
      vy: number;
      spikeLen: number;
      angle: number;
    }

    let particles: SpikeParticle[] = [];

    const initParticles = () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCtx.fillStyle = "#ffffff";
      offCtx.font = `900 ${Math.min(width * 0.14, 140)}px monospace`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillText("FERROFLUX", width * 0.5, height * 0.52);

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      particles = [];
      const step = Math.max(3, Math.floor(width / 320));

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx] > 180) {
            particles.push({
              bx: x,
              by: y,
              x: x,
              y: y,
              vx: 0,
              vy: 0,
              spikeLen: 0,
              angle: 0
            });
          }
        }
      }
      setParticleCount(particles.length);
    };

    initParticles();

    // Render loop: Real-time Rosensweig Instability & Magnetic Dipole Field Lines
    const render = () => {
      ctx.fillStyle = "rgba(5, 7, 10, 0.35)"; // Liquid carrier fluid persistence
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const B_field = gauss; // 0 to 100
      const isRosensweigActive = B_field > 35; // Critical threshold Bc

      // Draw faint curved Faraday magnetic flux vectors connecting to the magnet
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.quadraticCurveTo(mx + i * 90, my + 180, width * 0.5 + i * 120, height);
        ctx.stroke();
      }

      // Draw Neodymium Actuator Core
      ctx.save();
      const ringPulse = Math.sin(Date.now() * 0.005) * 4;
      ctx.beginPath();
      ctx.arc(mx, my, 22 + ringPulse, 0, Math.PI * 2);
      ctx.fillStyle = pole === 1 ? "rgba(0, 240, 255, 0.15)" : "rgba(239, 68, 68, 0.15)";
      ctx.fill();
      ctx.strokeStyle = pole === 1 ? "#00f0ff" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "10px monospace";
      ctx.fillStyle = pole === 1 ? "#00f0ff" : "#ef4444";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pole === 1 ? "N-POLE" : "S-POLE", mx, my);
      ctx.restore();

      // Render physical Rosensweig Ferrofluid Spikes
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = isRosensweigActive ? "rgba(0, 240, 255, 0.85)" : "#334155";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mx - p.bx;
        const dy = my - p.by;
        const dist = Math.max(12, Math.sqrt(dx * dx + dy * dy));

        // Dipole field strength at particle location: B ~ B_0 / r^2
        const localField = (B_field * 450) / (dist * 1.4);
        const targetAngle = Math.atan2(dy, dx) + (pole === -1 ? Math.PI : 0);

        if (isRosensweigActive && localField > 18) {
          // Normal-field spike eruption length
          const targetSpike = Math.min(28, ((localField - 18) / 32) * 22);
          p.spikeLen += (targetSpike - p.spikeLen) * 0.15;
          p.angle = targetAngle;
        } else {
          // Sub-critical colloidal relaxation back to base glyph
          p.spikeLen *= 0.82;
        }

        // Compute spiked needle tip
        const tipX = p.bx + Math.cos(p.angle) * p.spikeLen;
        const tipY = p.by + Math.sin(p.angle) * p.spikeLen;

        // Draw individual needle spike
        if (p.spikeLen > 1.5) {
          ctx.lineWidth = Math.max(1, (1 - p.spikeLen / 30) * 2.2);
          ctx.beginPath();
          ctx.moveTo(p.bx, p.by);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
        } else {
          // Dense resting particle droplet
          ctx.fillRect(p.bx - 1, p.by - 1, 2.5, 2.5);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [gauss, pole]);

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setGauss((prev) => Math.min(100, Math.max(10, prev - e.deltaY * 0.05)));
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onWheel={handleWheel}
      className="relative w-screen h-screen overflow-hidden bg-[#05070a] select-none touch-none"
    >
      {/* Raw Fullscreen WebGL/Canvas Ferrofluid Stage */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Unobtrusive Minimal Corner HUD (No Sidebars, No Central Templates) */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto">
        <Link
          href="/"
          className="font-mono text-xs text-[#94a3b8] hover:text-[#00f0ff] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-008
        </Link>
        <span className="font-mono text-[10px] text-[#475569] uppercase tracking-wider block mt-1">
          {particleCount.toLocaleString()} Colloidal Nanoparticles
        </span>
      </div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-4 font-mono text-xs">
        <div className="text-right">
          <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Dipole Field</div>
          <div className={gauss > 35 ? "text-[#00f0ff] font-bold" : "text-white"}>{gauss.toFixed(0)} G</div>
        </div>
        <button
          onClick={() => setPole((prev) => (prev === 1 ? -1 : 1))}
          className="px-3 py-1.5 rounded border border-[#1e293b] bg-[#090d16]/80 text-[#00f0ff] hover:border-[#00f0ff] transition-all font-mono text-xs uppercase font-bold"
        >
          Flip Pole ({pole === 1 ? "N" : "S"})
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-20 font-mono text-[11px] text-[#64748b] pointer-events-none">
        <p className="tracking-widest uppercase">
          MOVE POINTER = POSITION MAGNET · SCROLL WHEEL = MODULATE GAUSS (Bc = 35G)
        </p>
      </div>

      <div className="absolute bottom-6 right-6 z-20 font-mono text-[11px] text-[#475569] pointer-events-none text-right">
        <span>COWLEY & ROSENSWEIG FERROHYDRODYNAMICS</span>
      </div>
    </div>
  );
}
