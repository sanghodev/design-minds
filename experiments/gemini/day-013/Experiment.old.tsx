"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function GravitationalLensingExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [singularityMass, setSingularityMass] = useState<number>(65); // Solar mass units (x10^9 M_sun)
  const [showSpacetimeGrid, setShowSpacetimeGrid] = useState<boolean>(true);
  const [einsteinRadiusPx, setEinsteinRadiusPx] = useState<number>(140);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

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
      renderOffscreenBackground();
    };
    window.addEventListener("resize", handleResize);

    // Offscreen canvas storing the pristine unwarped background editorial text
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext("2d");

    const renderOffscreenBackground = () => {
      if (!offCtx) return;
      offCanvas.width = width;
      offCanvas.height = height;

      // Dark obsidian space background
      offCtx.fillStyle = "#080a0f";
      offCtx.fillRect(0, 0, width, height);

      // Subtle editorial newspaper / essay columns on truth, gravity, and ideology
      offCtx.fillStyle = "#8b949e";
      offCtx.font = "14px monospace";
      offCtx.textBaseline = "top";

      const lines = [
        "GENERAL RELATIVITY // EINSTEIN-EDDINGTON 1919 DEFLECTION SURVEY",
        "TRUTH BENDS IN THE VICINITY OF MASSIVE IDEOLOGICAL SINGULARITIES.",
        "A LIGHT RAY DOES NOT TRAVEL IN A STRAIGHT CARTESIAN TRAJECTORY;",
        "IT TRACES A GEODESIC MANIFOLD CURVED BY GRAVITATIONAL TENSOR T_uv.",
        "WHEN MEANING ACCUMULATES MASS, RECTILINEAR LANGUAGE WARPS INTO ARCS.",
        "THE OBSERVER SEES MULTIPLE MIRRORED GHOSTS OF A SINGLE HISTORICAL FACT.",
        "EINSTEIN RING ANGULAR RADIUS: THETA_E = SQRT( 4GM / c^2 * D_LS / (D_L * D_S) )",
        "CAN INFORMATION REMAIN OBJECTIVE UNDER EXTREME GRAVITATIONAL ACCELERATION?",
        "THE SINGULARITY DRAGS THE SURROUNDING EDITORIAL FABRIC INTO AN EVENT HORIZON.",
        "PHOTONS DEFLECT BY ANGLE ALPHA = 4GM / (c^2 * b) WHERE b IS THE IMPACT PARAMETER.",
        "LANGUAGE WARPED BY POWER CANNOT BE UN-BENT WITHOUT REVERSING THE GRAVITATIONAL FIELD.",
        "BEYOND THE SCHWARZSCHILD RADIUS R_s = 2GM / c^2, ALL PRINTED SYNTAX IS DESTROYED."
      ];

      // Repeated dense typographic background grid
      const colWidth = Math.min(380, width * 0.45);
      const cols = Math.max(2, Math.floor(width / colWidth));

      for (let c = 0; c < cols; c++) {
        const startX = 40 + c * (colWidth + 40);
        let curY = 40;
        for (let i = 0; i < 48; i++) {
          const textLine = lines[i % lines.length];
          offCtx.fillStyle = i % 4 === 0 ? "#e6edf3" : "#64748b";
          offCtx.fillText(textLine, startX, curY);
          curY += 24;
          if (curY > height - 40) break;
        }
      }
    };

    renderOffscreenBackground();

    // Initialize mass center at screen center
    mouseRef.current.x = width * 0.5;
    mouseRef.current.y = height * 0.5;

    // Render loop: Relativistic Gravitational Ray-Tracing Deflection
    const render = () => {
      ctx.fillStyle = "#080a0f";
      ctx.fillRect(0, 0, width, height);

      const m = mouseRef.current;
      const massScale = singularityMass / 100;
      // Einstein Radius in screen pixels: R_E = sqrt(4 * G * M)
      const rEinstein = Math.max(40, Math.min(260, Math.round(width * 0.14 * Math.sqrt(massScale))));
      setEinsteinRadiusPx(rEinstein);

      const rSchwarzschild = Math.round(rEinstein * 0.32); // Black hole event horizon radius

      // Draw warped background text using pixel displacement approximation
      // General relativistic deflection formula: r_source = r - (r_E^2 / r)
      ctx.drawImage(offCanvas, 0, 0);

      // Sample region around singularity and apply gravitational lensing deformation
      const lensDiameter = rEinstein * 2.8;
      const lensRadius = lensDiameter * 0.5;
      const lx = Math.max(0, Math.min(width - lensDiameter, m.x - lensRadius));
      const ly = Math.max(0, Math.min(height - lensDiameter, m.y - lensRadius));

      if (offCtx) {
        const sourceData = offCtx.getImageData(lx, ly, lensDiameter, lensDiameter);
        const targetData = ctx.createImageData(lensDiameter, lensDiameter);
        const sPix = sourceData.data;
        const tPix = targetData.data;
        const rE2 = rEinstein * rEinstein;
        const rSchw2 = rSchwarzschild * rSchwarzschild;

        for (let py = 0; py < lensDiameter; py++) {
          const dy = py - lensRadius;
          for (let px = 0; px < lensDiameter; px++) {
            const dx = px - lensRadius;
            const distSq = dx * dx + dy * dy;
            const pIdx = (py * Math.floor(lensDiameter) + px) * 4;

            if (distSq < rSchw2) {
              // Inside Schwarzschild Event Horizon: Pitch Black Singularity (All light absorbed)
              tPix[pIdx] = 2;
              tPix[pIdx + 1] = 3;
              tPix[pIdx + 2] = 5;
              tPix[pIdx + 3] = 255;
            } else if (distSq < lensRadius * lensRadius) {
              // Gravitational Lensing Ray Deflection: r_source = r - r_E^2 / r
              const dist = Math.sqrt(distSq);
              const deflectionDist = dist - (rE2 / dist);
              const factor = deflectionDist / dist;

              const srcX = Math.round(lensRadius + dx * factor);
              const srcY = Math.round(lensRadius + dy * factor);

              if (srcX >= 0 && srcX < lensDiameter && srcY >= 0 && srcY < lensDiameter) {
                const sIdx = (srcY * Math.floor(lensDiameter) + srcX) * 4;
                // Add slight chromatic blueshift near photon sphere
                const isNearHorizon = dist < rEinstein * 1.08 && dist > rEinstein * 0.92;
                tPix[pIdx] = isNearHorizon ? 255 : sPix[sIdx];
                tPix[pIdx + 1] = isNearHorizon ? 230 : sPix[sIdx + 1];
                tPix[pIdx + 2] = isNearHorizon ? 140 : Math.min(255, sPix[sIdx + 2] + 40);
                tPix[pIdx + 3] = 255;
              }
            } else {
              // Outside lensing zone
              const sIdx = (py * Math.floor(lensDiameter) + px) * 4;
              tPix[pIdx] = sPix[sIdx];
              tPix[pIdx + 1] = sPix[sIdx + 1];
              tPix[pIdx + 2] = sPix[sIdx + 2];
              tPix[pIdx + 3] = sPix[sIdx + 3];
            }
          }
        }

        createImageBitmap(targetData).then((bmp) => {
          ctx.drawImage(bmp, lx, ly);

          // Draw Spacetime Curvature Grid & Lensing Annotations
          if (showSpacetimeGrid) {
            ctx.save();
            // Einstein Ring Outline (Golden Luminous Ring)
            ctx.beginPath();
            ctx.arc(m.x, m.y, rEinstein, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();

            // Schwarzschild Event Horizon Core
            ctx.beginPath();
            ctx.arc(m.x, m.y, rSchwarzschild, 0, Math.PI * 2);
            ctx.fillStyle = "#020305";
            ctx.fill();
            ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
            ctx.stroke();

            // Concentric Spacetime Metric Geodesic Rings
            for (let r = rEinstein * 0.6; r <= rEinstein * 2.2; r += rEinstein * 0.4) {
              ctx.beginPath();
              ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            // Metric Annotation Callouts
            ctx.font = "11px monospace";
            ctx.fillStyle = "#f59e0b";
            ctx.fillText(`θ_E (EINSTEIN RING): ${rEinstein}px`, m.x + rEinstein + 12, m.y - 8);
            ctx.fillStyle = "#ef4444";
            ctx.fillText(`R_S (EVENT HORIZON): ${rSchwarzschild}px`, m.x + rSchwarzschild + 8, m.y + 16);
            ctx.restore();
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [singularityMass, showSpacetimeGrid]);

  const handlePointerMove = (e: React.PointerEvent) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#080a0f] select-none touch-none cursor-crosshair font-mono relative"
    >
      {/* Relativistic Spacetime Canvas (The Entire Viewport) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Arthur Eddington 1919 Relativistic Lensing Header (No Boilerplate Templates) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="text-xs text-[#8b949e] hover:text-[#f59e0b] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-013 // GRAVITATIONAL LENSING
        </Link>
        <span className="text-[10px] text-[#64748b] uppercase tracking-wider block mt-1">
          Albert Einstein General Relativity (1915) · Eddington Solar Eclipse (1919)
        </span>
      </div>

      {/* Relativistic Controls (Top Right) */}
      <div className="absolute top-8 right-8 z-30 flex items-center gap-6 pointer-events-auto">
        <div className="text-right text-xs">
          <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Singularity Mass (M)</div>
          <div className="text-[#f59e0b] font-bold text-base">{singularityMass} × 10⁹ M☉</div>
        </div>

        <button
          onClick={() => setShowSpacetimeGrid(!showSpacetimeGrid)}
          className={`px-3 py-1.5 rounded border text-xs uppercase font-bold transition-all ${
            showSpacetimeGrid
              ? "border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10"
              : "border-[#30363d] text-[#8b949e] hover:border-[#f59e0b]"
          }`}
        >
          {showSpacetimeGrid ? "🌐 GEODESIC MESH ON" : "🌐 MESH OFF"}
        </button>

        <button
          onClick={() => setSingularityMass((prev) => (prev >= 100 ? 25 : prev + 25))}
          className="px-3 py-1.5 rounded border border-[#30363d] text-[#8b949e] hover:border-white hover:text-white text-xs uppercase font-bold transition-all"
        >
          Mass: {singularityMass}
        </button>
      </div>

      {/* Theoretical Telemetry & Forensic Explanation (Bottom Bar) */}
      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#8b949e] pointer-events-none max-w-lg uppercase tracking-widest leading-relaxed">
        DRAG THE SUPERMASSIVE IDEOLOGICAL SINGULARITY ACROSS THE RECTILINEAR TEXT. OBSERVE HOW MASS CURVES SPACETIME GEODESICS, BENDING ORTHODOX EDITORIAL STATEMENTS INTO CONCENTRIC EINSTEIN RINGS.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#64748b] pointer-events-none text-right">
        <div>EINSTEIN DEFLECTION: <strong className="text-[#f59e0b]">α = 4GM / (c²·b)</strong></div>
        <div className="text-[9px] text-[#475569] mt-0.5">SCHWARZSCHILD RADIUS R_s = 2GM / c²</div>
      </div>
    </div>
  );
}
