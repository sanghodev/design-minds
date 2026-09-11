"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ElectrostaticClingExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chargeVoltage, setChargeVoltage] = useState<number>(65); // kV
  const [clungCount, setClungCount] = useState<number>(0);
  const [grounded, setGrounded] = useState<boolean>(false);
  const [isFused, setIsFused] = useState<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number; scrubbing: boolean }>({ x: 0, y: 0, scrubbing: false });

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
      initPlate();
    };
    window.addEventListener("resize", handleResize);

    interface LatentChargePoint {
      x: number;
      y: number;
      charged: boolean;
    }

    interface TonerParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      clung: boolean;
      fused: boolean;
      targetIdx: number;
    }

    let chargePoints: LatentChargePoint[] = [];
    let tonerDust: TonerParticle[] = [];

    const initPlate = () => {
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, width, height);
      offCtx.fillStyle = "#ffffff";
      offCtx.font = `900 ${Math.min(width * 0.13, 130)}px "Helvetica Neue", Arial, sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.letterSpacing = "0.05em";
      offCtx.fillText("XEROGRAPHY", width * 0.5, height * 0.5);

      const raw = offCtx.getImageData(0, 0, width, height).data;
      chargePoints = [];
      const step = Math.max(3, Math.floor(width / 340));

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (raw[idx] > 180) {
            chargePoints.push({ x, y, charged: true });
          }
        }
      }

      // Initialize 4,200 dry airborne carbon toner particles
      const count = Math.min(4500, Math.floor(chargePoints.length * 1.6));
      tonerDust = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        clung: false,
        fused: false,
        targetIdx: Math.floor(Math.random() * chargePoints.length)
      }));
    };

    initPlate();

    // Render loop: Coulomb Electrostatic Cling & Thermal Fusing
    const render = () => {
      ctx.fillStyle = "rgba(18, 20, 24, 0.45)"; // Selenium photoconductor plate persistence
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const isScrubbing = m.scrubbing;

      // Triboelectric friction: scrubbing mouse across plate accumulates static charge
      if (isScrubbing && !grounded) {
        setChargeVoltage((prev) => Math.min(100, prev + 0.35));
      }

      // Draw latent electrostatic charge tracks
      ctx.fillStyle = isFused ? "rgba(245, 158, 11, 0.02)" : "rgba(245, 158, 11, 0.05)";
      for (let i = 0; i < chargePoints.length; i += 12) {
        const cp = chargePoints[i];
        ctx.fillRect(cp.x - 2, cp.y - 2, 4, 4);
      }

      // Draw Triboelectric Wool Pad cursor
      ctx.save();
      ctx.beginPath();
      ctx.arc(m.x, m.y, 24, 0, Math.PI * 2);
      ctx.strokeStyle = isScrubbing ? "rgba(245, 158, 11, 0.9)" : "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isScrubbing) {
        // Micro corona ionization spark filaments
        for (let i = 0; i < 4; i++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkLen = 10 + Math.random() * 16;
          ctx.strokeStyle = "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + Math.cos(sparkAngle) * sparkLen, m.y + Math.sin(sparkAngle) * sparkLen);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Update Toner Particles under Coulomb attraction: F = k * (q1 * q2) / r^2
      let activeCling = 0;
      const coulombK = grounded ? 0 : (chargeVoltage / 100) * 1.8;

      for (let i = 0; i < tonerDust.length; i++) {
        const p = tonerDust[i];
        const target = chargePoints[p.targetIdx];

        if (p.fused) {
          // Permanently heat-fused onto paper: immotile, glossy offset texture
          activeCling++;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(p.x, p.y, 2.2, 2.2);
          continue;
        }

        if (!grounded && target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < 4.5) {
            // Particle clings to latent charge site
            p.clung = true;
            p.x = target.x + (Math.random() - 0.5) * 1.2;
            p.y = target.y + (Math.random() - 0.5) * 1.2;
            activeCling++;
          } else {
            // Coulomb electrostatic pull toward target charge point
            const force = (coulombK * 180) / Math.max(25, distSq);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.clung = false;
          }
        } else {
          // Grounded / discharged: particles scatter freely like windblown dust
          p.clung = false;
          p.vx += (Math.random() - 0.5) * 2.2;
          p.vy += (Math.random() - 0.5) * 2.2;
        }

        // Damping / air friction
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Render carbon toner grain
        if (p.clung) {
          ctx.fillStyle = "#fafafa";
          ctx.fillRect(p.x, p.y, 2, 2);
        } else {
          ctx.fillStyle = "rgba(160, 174, 192, 0.45)";
          ctx.fillRect(p.x, p.y, 1.2, 1.2);
        }
      }

      setClungCount(activeCling);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [chargeVoltage, grounded, isFused]);

  const handlePointerDown = (e: React.PointerEvent) => {
    mouseRef.current.scrubbing = true;
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handlePointerUp = () => {
    mouseRef.current.scrubbing = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handleHeatFuse = () => {
    setIsFused(true);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#121418] select-none touch-none cursor-crosshair font-mono relative"
    >
      {/* Raw Electrostatic Photoconductor Canvas (The Entire Viewport) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Chester Carlson Laboratory Framing (No Template Sidebars or Bottom Docks) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="text-xs text-[#94a3b8] hover:text-[#f59e0b] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-009 // XEROGRAPHIC DRUM
        </Link>
        <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mt-1">
          Chester Carlson Electrophotography (1938)
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 flex items-center gap-4 pointer-events-auto">
        <div className="text-right text-xs">
          <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Dielectric Potential</div>
          <div className={chargeVoltage > 40 && !grounded ? "text-[#f59e0b] font-bold text-base" : "text-white"}>
            {grounded ? "0.0 kV (Grounded)" : `${chargeVoltage.toFixed(1)} kV`}
          </div>
        </div>

        <button
          onClick={() => setGrounded(!grounded)}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            grounded
              ? "border-red-500 text-red-400 bg-red-500/10"
              : "border-[#334155] text-[#94a3b8] hover:border-[#f59e0b] hover:text-[#f59e0b]"
          }`}
        >
          {grounded ? "⚡ DISCHARGED (GROUND)" : "🔌 GROUND PLATE"}
        </button>

        <button
          onClick={handleHeatFuse}
          disabled={isFused}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            isFused
              ? "border-amber-500 text-amber-400 bg-amber-500/10 opacity-75"
              : "border-[#334155] text-[#94a3b8] hover:border-amber-400 hover:text-amber-400"
          }`}
        >
          {isFused ? "🔥 FUSED (PERMANENT)" : "🔥 HEAT FUSE (180°C)"}
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#64748b] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        CLICK &amp; DRAG TO SCRUB TRIBOELECTRIC CHARGE ACROSS THE SELENIUM PLATE. AIRBORNE CARBON PARTICLES ACCELERATE ALONG COULOMB FORCE GRADIENTS, CLINGING TO THE LATENT TEXT MATRIX. HEAT FUSE MELTS TONER PERMANENTLY.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#64748b] pointer-events-none text-right">
        <div>CARBON CLING EFFICIENCY: <strong className="text-white">{clungCount} GRAINS</strong></div>
        <div className="text-[9px] text-[#475569] mt-0.5">COULOMB FORCE LAW F = k_e (q1·q2) / r²</div>
      </div>
    </div>
  );
}
