"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PhosphorescentDecayExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uvIntensity, setUvIntensity] = useState<number>(85); // mW/cm^2
  const [halfLifeSec, setHalfLifeSec] = useState<number>(4.5); // Decay time constant
  const [ambientDarkness, setAmbientDarkness] = useState<boolean>(true);
  const [toolMode, setToolMode] = useState<"uv-laser" | "heat-wand">("uv-laser");
  const [currentFlux, setCurrentFlux] = useState<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // References for external triggers
  const triggerFlashRef = useRef<boolean>(false);

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
      initPhosphorGrid();
    };
    window.addEventListener("resize", handleResize);

    // Phosphor Emulsion Energy Grid (Downscaled for 60fps quantum decay calculations)
    const simScale = 2;
    const simW = Math.floor(width / simScale);
    const simH = Math.floor(height / simScale);

    let energyGrid = new Float32Array(simW * simH);
    let glyphMask = new Uint8Array(simW * simH);

    const initPhosphorGrid = () => {
      const off = document.createElement("canvas");
      off.width = simW;
      off.height = simH;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, simW, simH);
      offCtx.fillStyle = "#ffffff";
      offCtx.font = `900 ${Math.min(simW * 0.12, 100)}px "Courier New", monospace`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.letterSpacing = "0.08em";
      offCtx.fillText("PHOSPHOR", simW * 0.5, simH * 0.5);

      const raw = offCtx.getImageData(0, 0, simW, simH).data;
      glyphMask = new Uint8Array(simW * simH);
      energyGrid = new Float32Array(simW * simH);

      for (let i = 0; i < simW * simH; i++) {
        glyphMask[i] = raw[i * 4] > 140 ? 1 : 0;
        // Pre-excite letters slightly so initial screen isn't pitch black
        energyGrid[i] = glyphMask[i] ? 0.85 : 0.0;
      }
    };

    initPhosphorGrid();

    // Render loop: Quantum Triplet-State Phosphorescent Decay & Thermal Quenching
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const m = mouseRef.current;
      const simMX = Math.floor(m.x / simScale);
      const simMY = Math.floor(m.y / simScale);

      // Handle Full-Plate Xenon Strobe Flash Trigger
      if (triggerFlashRef.current) {
        for (let i = 0; i < simW * simH; i++) {
          energyGrid[i] = glyphMask[i] ? 1.0 : 0.45;
        }
        triggerFlashRef.current = false;
      }

      // Pointer interaction: UV Laser (Excite) vs. Heat Wand (Thermal Quenching)
      if (m.active && simMX > 2 && simMX < simW - 2 && simMY > 2 && simMY < simH - 2) {
        const radius = Math.floor(24 / simScale);
        const radiusSq = radius * radius;

        if (toolMode === "uv-laser") {
          // 365nm UV beam deposits photonic energy into triplet electron traps
          const beamPower = (uvIntensity / 100) * 1.9;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const distSq = dx * dx + dy * dy;
              if (distSq < radiusSq) {
                const idx = (simMY + dy) * simW + (simMX + dx);
                const factor = (1 - distSq / radiusSq) * beamPower;
                const sensitivity = glyphMask[idx] ? 1.0 : 0.25;
                energyGrid[idx] = Math.min(1.0, energyGrid[idx] + factor * sensitivity * dt * 9);
              }
            }
          }
        } else {
          // Thermal Quenching: Heat accelerates electron detrapping, causing immediate light release and extinction
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const distSq = dx * dx + dy * dy;
              if (distSq < radiusSq) {
                const idx = (simMY + dy) * simW + (simMX + dx);
                energyGrid[idx] = Math.max(0, energyGrid[idx] - dt * 6.5);
              }
            }
          }
        }
      }

      // Exponential Half-life decay: b = ln(2) / halfLife
      const decayCoeff = Math.exp((-Math.LN2 / halfLifeSec) * dt);
      let totalLuminescence = 0;

      for (let i = 0; i < simW * simH; i++) {
        energyGrid[i] *= decayCoeff;
        totalLuminescence += energyGrid[i];
      }

      setCurrentFlux(Math.round((totalLuminescence / (simW * simH)) * 1200));

      // Draw luminescent photon emission to display buffer
      const imgData = ctx.createImageData(simW, simH);
      const d = imgData.data;

      // Darkroom baseline tone
      const baseR = ambientDarkness ? 4 : 26;
      const baseG = ambientDarkness ? 6 : 30;
      const baseB = ambientDarkness ? 8 : 36;

      for (let i = 0; i < simW * simH; i++) {
        const pIdx = i * 4;
        const e = energyGrid[i];

        if (e > 0.005) {
          // Phosphorescent spectral emission: Zinc Sulfide / Copper doped peak at 530nm (Emerald Green)
          const glowR = Math.floor(Math.min(255, e * 180 + Math.pow(e, 3) * 75));
          const glowG = Math.floor(Math.min(255, e * 255 + Math.pow(e, 2) * 50));
          const glowB = Math.floor(Math.min(255, e * 140 + Math.pow(e, 4) * 115));

          d[pIdx] = glowR;
          d[pIdx + 1] = glowG;
          d[pIdx + 2] = glowB;
          d[pIdx + 3] = 255;
        } else {
          d[pIdx] = baseR;
          d[pIdx + 1] = baseG;
          d[pIdx + 2] = baseB;
          d[pIdx + 3] = 255;
        }
      }

      createImageBitmap(imgData).then((bmp) => {
        ctx.drawImage(bmp, 0, 0, width, height);

        // Draw Interactive Tool Head Indicator (UV Laser vs. Thermal Heat Wand)
        ctx.save();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = toolMode === "uv-laser"
          ? (m.active ? "#a855f7" : "rgba(168, 85, 247, 0.35)")
          : (m.active ? "#f97316" : "rgba(249, 115, 22, 0.35)");
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (m.active) {
          ctx.beginPath();
          ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = toolMode === "uv-laser" ? "#c084fc" : "#fdba74";
          ctx.shadowColor = toolMode === "uv-laser" ? "#a855f7" : "#f97316";
          ctx.shadowBlur = 18;
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [uvIntensity, halfLifeSec, ambientDarkness, toolMode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    mouseRef.current.active = true;
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handlePointerUp = () => {
    mouseRef.current.active = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handleStrobeFlash = () => {
    triggerFlashRef.current = true;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#040608] select-none touch-none cursor-crosshair font-mono relative"
    >
      {/* Phosphorescent Emulsion Screen (The Entire Viewport) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Becquerel Photoluminescence Darkroom HUD (No Boilerplate Templates) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="text-xs text-[#64748b] hover:text-[#00ffa2] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-010 // PHOSPHOR LAB
        </Link>
        <span className="text-[10px] text-[#475569] uppercase tracking-wider block mt-1">
          Alexandre-Edmond Becquerel Phosphoroscope (1858)
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 flex items-center gap-4 pointer-events-auto">
        <div className="text-right text-xs">
          <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Emission Flux</div>
          <div className="text-[#00ffa2] font-bold text-base">{currentFlux} μW/cm²</div>
        </div>

        <button
          onClick={handleStrobeFlash}
          className="px-3 py-1.5 rounded border border-[#334155] text-amber-300 hover:border-amber-400 bg-amber-400/10 text-xs uppercase font-bold transition-all"
        >
          ⚡ STROBE FLASH
        </button>

        <button
          onClick={() => setToolMode(toolMode === "uv-laser" ? "heat-wand" : "uv-laser")}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            toolMode === "uv-laser"
              ? "border-[#a855f7] text-[#c084fc] bg-[#a855f7]/10"
              : "border-[#f97316] text-[#fdba74] bg-[#f97316]/10"
          }`}
        >
          {toolMode === "uv-laser" ? "🟣 365NM UV LASER" : "🔥 THERMAL QUENCH WAND"}
        </button>

        <button
          onClick={() => setAmbientDarkness(!ambientDarkness)}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            ambientDarkness
              ? "border-[#00ffa2] text-[#00ffa2] bg-[#00ffa2]/10"
              : "border-[#334155] text-[#94a3b8] hover:border-[#00ffa2]"
          }`}
        >
          {ambientDarkness ? "🌑 DARKROOM" : "💡 AMBIENT"}
        </button>

        <button
          onClick={() => setHalfLifeSec((prev) => (prev >= 8 ? 2.0 : prev + 2.0))}
          className="px-3 py-1.5 rounded border border-[#334155] text-[#94a3b8] hover:border-[#00ffa2] text-xs uppercase font-bold transition-all"
        >
          t½: {halfLifeSec.toFixed(1)}s
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#475569] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        DRAG 365NM UV LASER ACROSS ZINC-SULFIDE EMULSION TO EXCITE TRIPLET ELECTRON TRAPS (530NM EMERALD). SWITCH TO THERMAL QUENCH WAND TO ACCELERATE DETRAPPING AND EXTINGUISH TEXT.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#475569] pointer-events-none text-right">
        <div>DECAY RATE λ: <strong className="text-[#00ffa2]">{(Math.LN2 / halfLifeSec).toFixed(3)} s⁻¹</strong></div>
        <div className="text-[9px] text-[#334155] mt-0.5">BECQUEREL POWER LAW I(t) = I_0 / (1 + αt)^m</div>
      </div>
    </div>
  );
}
