"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AtmosphericHygrometryExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rhPercent, setRhPercent] = useState<number>(45);
  const mouseRef = useRef<{ x: number; y: number; spraying: boolean }>({ x: 0, y: 0, spraying: false });

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
      initPaper();
    };
    window.addEventListener("resize", handleResize);

    // 2D Moisture & Ink Concentration Grids (Downscaled for 60fps cellular diffusion)
    const simScale = 2;
    const simW = Math.floor(width / simScale);
    const simH = Math.floor(height / simScale);

    let inkGrid = new Float32Array(simW * simH);
    let moistureGrid = new Float32Array(simW * simH);
    let tempGrid = new Float32Array(simW * simH);

    const initPaper = () => {
      const off = document.createElement("canvas");
      off.width = simW;
      off.height = simH;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, simW, simH);
      offCtx.fillStyle = "#ffffff";
      offCtx.font = `600 ${Math.min(simW * 0.11, 75)}px "Times New Roman", Times, serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.letterSpacing = "0.08em";
      offCtx.fillText("HYGROMETRY", simW * 0.5, simH * 0.5);

      const raw = offCtx.getImageData(0, 0, simW, simH).data;
      inkGrid = new Float32Array(simW * simH);
      moistureGrid = new Float32Array(simW * simH);

      for (let i = 0; i < simW * simH; i++) {
        inkGrid[i] = raw[i * 4] / 255.0; // 0 to 1
        moistureGrid[i] = 0.2; // Baseline 20% ambient humidity
      }
    };

    initPaper();

    // Diffusion render loop (Lucas-Washburn Capillary Bleed)
    const render = () => {
      const m = mouseRef.current;
      const simMX = Math.floor(m.x / simScale);
      const simMY = Math.floor(m.y / simScale);

      // Deposit moisture on drag
      if (m.spraying && simMX > 5 && simMX < simW - 5 && simMY > 5 && simMY < simH - 5) {
        for (let dy = -18; dy <= 18; dy++) {
          for (let dx = -18; dx <= 18; dx++) {
            const distSq = dx * dx + dy * dy;
            if (distSq < 324) {
              const idx = (simMY + dy) * simW + (simMX + dx);
              moistureGrid[idx] = Math.min(1.0, moistureGrid[idx] + 0.15);
            }
          }
        }
      }

      // Calculate global RH average
      let totalMoisture = 0;
      for (let i = 0; i < 200; i++) {
        const randIdx = Math.floor(Math.random() * (simW * simH));
        totalMoisture += moistureGrid[randIdx];
      }
      setRhPercent(Math.round((totalMoisture / 200) * 100));

      // Cellular diffusion: Ink diffuses where moisture is high
      tempGrid.set(inkGrid);

      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const idx = y * simW + x;
          const localMoisture = moistureGrid[idx];

          if (localMoisture > 0.35) {
            // Lucas-Washburn diffusion rate proportional to local moisture content
            const rate = (localMoisture - 0.35) * 0.08;
            const laplacian = (
              tempGrid[idx - 1] + tempGrid[idx + 1] +
              tempGrid[idx - simW] + tempGrid[idx + simW] -
              4 * tempGrid[idx]
            );
            inkGrid[idx] = Math.max(0, Math.min(1.0, inkGrid[idx] + laplacian * rate));
          }

          // Natural evaporation
          moistureGrid[idx] = Math.max(0.15, moistureGrid[idx] * 0.996);
        }
      }

      // Draw paper & sumi ink to display buffer
      const imgData = ctx.createImageData(simW, simH);
      const d = imgData.data;

      // Fibrous washi base color #f7f4ec (247, 244, 236)
      for (let i = 0; i < simW * simH; i++) {
        const pIdx = i * 4;
        const ink = inkGrid[i];
        const wet = moistureGrid[i];

        // Paper color darkens slightly with water
        const paperR = 247 - wet * 20;
        const paperG = 244 - wet * 22;
        const paperB = 236 - wet * 24;

        // Sumi carbon soot ink #141312 (20, 19, 18)
        d[pIdx] = Math.floor(paperR * (1 - ink) + 20 * ink);
        d[pIdx + 1] = Math.floor(paperG * (1 - ink) + 19 * ink);
        d[pIdx + 2] = Math.floor(paperB * (1 - ink) + 18 * ink);
        d[pIdx + 3] = 255;
      }

      createImageBitmap(imgData).then((bmp) => {
        ctx.drawImage(bmp, 0, 0, width, height);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    mouseRef.current.spraying = true;
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handlePointerUp = () => {
    mouseRef.current.spraying = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#f7f4ec] select-none touch-none cursor-crosshair font-serif relative"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Atmospheric Washi Watermark */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="font-mono text-xs text-[#786e64] hover:text-[#1a1715] uppercase tracking-widest transition-colors font-semibold block"
        >
          ← DM-005 // WASHI HYGROMETRY
        </Link>
        <span className="font-mono text-[10px] text-[#9c9384] uppercase tracking-wider block mt-1">
          Lucas-Washburn Capillary Flow (1921)
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 text-right font-mono text-xs text-[#786e64] pointer-events-none">
        <div>SUBSTRATE MOISTURE: <strong className="text-[#1a1715]">{rhPercent}% RH</strong></div>
        <div className="text-[10px] text-[#9c9384] mt-0.5">
          STATE: <strong className={rhPercent > 65 ? "text-blue-700" : "text-[#1a1715]"}>{rhPercent > 65 ? "ACTIVE CAPILLARY BLEED" : "ARID EQUILIBRIUM"}</strong>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-30 text-[11px] font-mono text-[#8a8070] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        CLICK &amp; DRAG TO DEPOSIT ATMOSPHERIC MOISTURE ACROSS POROUS WASHI FIBERS. BLACK SUMI INK DIFFUSES OUTWARD IN REAL TIME AND PERMANENTLY STAINS UPON EVAPORATION.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#9c9384] pointer-events-none text-right">
        <span>PAUL KLEE FLUID DYNAMICS · EDWARD JOHNSTON VELLUM INK ABSORPTION</span>
      </div>
    </div>
  );
}
