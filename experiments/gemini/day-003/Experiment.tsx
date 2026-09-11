"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ChromaticViscosityExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [velocityMeter, setVelocityMeter] = useState<number>(0);
  const mouseRef = useRef<{ x: number; y: number; px: number; py: number; v: number }>({ x: 0, y: 0, px: 0, py: 0, v: 0 });

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

    const text = "VISCOSITY";
    const charNodes = text.split("").map((ch, idx) => ({
      char: ch,
      baseX: (width * 0.5) + (idx - text.length / 2) * (Math.min(width * 0.08, 75)),
      baseY: height * 0.5,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    }));

    // Initialize positions
    charNodes.forEach((n) => {
      n.x = n.baseX;
      n.y = n.baseY;
    });

    let currentVelocity = 0;

    const render = () => {
      // Liquid mineral oil carrier background persistence
      ctx.fillStyle = "rgba(3, 5, 9, 0.28)";
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const dx = m.x - m.px;
      const dy = m.y - m.py;
      const instantV = Math.min(100, Math.sqrt(dx * dx + dy * dy) * 1.8);
      currentVelocity = currentVelocity * 0.9 + instantV * 0.1; // Damped velocity
      m.px = m.x;
      m.py = m.y;
      setVelocityMeter(currentVelocity);

      const isCondensed = currentVelocity > 15;
      const chromaticFringe = (currentVelocity * 0.25).toFixed(1);

      // Draw subtle fluid surface tension ripples
      if (currentVelocity > 5) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(0.3, currentVelocity * 0.005)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, currentVelocity * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update and render each fluid typographic node
      ctx.font = `900 ${Math.min(width * 0.12, 110)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const tensionPull = Math.min(0.85, currentVelocity * 0.015); // Capillary attraction pulling toward center

      charNodes.forEach((node, idx) => {
        // Target position: compresses toward center when velocity is high (Bouma droplet)
        const targetX = node.baseX * (1 - tensionPull) + (width * 0.5) * tensionPull;
        const targetY = node.baseY + Math.sin(Date.now() * 0.004 + idx * 0.8) * (currentVelocity * 0.3);

        // Spring physics with non-linear damping
        node.vx = (targetX - node.x) * 0.12;
        node.vy = (targetY - node.y) * 0.12;
        node.x += node.vx;
        node.y += node.vy;

        // Render Chromatic RGB Prism Dispersion on Canvas
        if (currentVelocity > 10) {
          const cOffset = Number(chromaticFringe);
          // Red channel offset
          ctx.fillStyle = "rgba(255, 30, 60, 0.85)";
          ctx.fillText(node.char, node.x + cOffset, node.y);

          // Cyan channel offset
          ctx.fillStyle = "rgba(0, 230, 255, 0.85)";
          ctx.fillText(node.char, node.x - cOffset, node.y);
        }

        // Core liquid obsidian glyph
        ctx.fillStyle = isCondensed ? "#ffffff" : "#cbd5e1";
        ctx.fillText(node.char, node.x, node.y);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#030509] select-none touch-none cursor-crosshair font-mono relative"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Fluid Chamber Corner Watermark */}
      <div className="absolute top-8 left-8 z-20 pointer-events-auto">
        <Link
          href="/"
          className="text-xs text-[#64748b] hover:text-[#00f0ff] uppercase tracking-widest transition-colors block font-bold"
        >
          ← DM-003 // FLUID TANK
        </Link>
        <span className="text-[10px] text-[#475569] uppercase tracking-wider block mt-1">
          John Maeda Non-Newtonian Rheology
        </span>
      </div>

      <div className="absolute top-8 right-8 z-20 text-right font-mono text-xs text-[#64748b] pointer-events-none">
        <div>KINETIC VELOCITY: <strong className="text-[#00f0ff]">{velocityMeter.toFixed(0)} px/ms</strong></div>
        <div className="text-[10px] text-[#475569] mt-0.5">
          STATE: <strong className={velocityMeter > 15 ? "text-[#ff0055]" : "text-white"}>{velocityMeter > 15 ? "BOUMA CONDENSATION" : "EQUILIBRIUM"}</strong>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-20 text-[11px] text-[#475569] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        STIR MOUSE SWIFTLY TO INDUCE CAPILLARY SURFACE TENSION CONDENSATION AND RGB PRISM ABERRATION. REST TO RELAX INTO SWISS HIERARCHY.
      </div>

      <div className="absolute bottom-8 right-8 z-20 text-[10px] text-[#475569] pointer-events-none">
        EMIL RUDER TYPOGRAPHIC TENSION · VISCOUS SHEAR DAMPING
      </div>
    </div>
  );
}
