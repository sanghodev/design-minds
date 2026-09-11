"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SolarGrammarExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sunRef = useRef<{ x: number; y: number; dragging: boolean }>({ x: 0.35, y: 0.25, dragging: false });
  const [telemetry, setTelemetry] = useState({ altitude: 38, azimuth: 315, contrast: "14.2:1" });

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
      buildHeightMap();
    };
    window.addEventListener("resize", handleResize);

    // Heightmap buffer for Trajan Roman Chiseled V-Cut Relief
    let heightMap: Float32Array;
    let mapW = 0;
    let mapH = 0;

    const buildHeightMap = () => {
      mapW = Math.floor(width * 0.5);
      mapH = Math.floor(height * 0.5);
      const off = document.createElement("canvas");
      off.width = mapW;
      off.height = mapH;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      // Draw Trajan Lapidary Typography
      offCtx.fillStyle = "#000000";
      offCtx.fillRect(0, 0, mapW, mapH);
      offCtx.fillStyle = "#ffffff";
      offCtx.font = `600 ${Math.min(mapW * 0.12, 88)}px "Times New Roman", Times, serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.letterSpacing = "0.18em";
      offCtx.fillText("SOLAR GRAMMAR", mapW * 0.5, mapH * 0.48);

      const raw = offCtx.getImageData(0, 0, mapW, mapH).data;
      heightMap = new Float32Array(mapW * mapH);

      // Convert binary text into a conical V-cut depth trench using distance-transform approximation
      for (let y = 1; y < mapH - 1; y++) {
        for (let x = 1; x < mapW - 1; x++) {
          const idx = (y * mapW + x) * 4;
          const val = raw[idx]; // 0 to 255
          if (val > 20) {
            // Edges form steep V-cut facets, center reaches maximum incision depth
            const neighborAvg = (raw[idx - 4] + raw[idx + 4] + raw[idx - mapW * 4] + raw[idx + mapW * 4]) / 4;
            heightMap[y * mapW + x] = Math.min(1.0, (val / 255) * (1 - Math.abs(val - neighborAvg) / 120));
          } else {
            heightMap[y * mapW + x] = 0;
          }
        }
      }
    };

    buildHeightMap();

    // Render loop: Real-time Phong Normal-Shaded Bas-Relief
    const render = () => {
      if (!heightMap) return;
      const sun = sunRef.current;
      const sunPixelX = sun.x * width;
      const sunPixelY = sun.y * height;

      // Calculate solar vector relative to stone center
      const dx = sun.x - 0.5;
      const dy = sun.y - 0.5;
      const distFromZenith = Math.min(1.0, Math.sqrt(dx * dx + dy * dy) * 2.2);
      const altitudeDeg = Math.max(4, Math.round((1 - distFromZenith) * 88));
      const azimuthDeg = Math.round((Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360);

      // Light direction vector L = [lx, ly, lz]
      const radAlt = (altitudeDeg * Math.PI) / 180;
      const radAz = (azimuthDeg * Math.PI) / 180;
      const lx = Math.cos(radAlt) * Math.sin(radAz);
      const ly = -Math.cos(radAlt) * Math.cos(radAz);
      const lz = Math.sin(radAlt); // 1 = orthogonal zenith, 0 = grazing

      // Generate frame on main canvas
      const imgData = ctx.createImageData(mapW, mapH);
      const data = imgData.data;

      // Basalt stone ambient tone
      const stoneR = 24, stoneG = 22, stoneB = 20;

      for (let y = 1; y < mapH - 1; y++) {
        for (let x = 1; x < mapW - 1; x++) {
          const i = y * mapW + x;
          const pixelIdx = i * 4;

          // Compute surface normal via Sobel/finite differences
          const dzdx = (heightMap[i + 1] - heightMap[i - 1]) * 6.0;
          const dzdy = (heightMap[i + mapW] - heightMap[i - mapW]) * 6.0;

          // Normal vector N = [-dzdx, -dzdy, 1] normalized
          const len = Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1.0);
          const nx = -dzdx / len;
          const ny = -dzdy / len;
          const nz = 1.0 / len;

          // Phong Diffuse: N . L
          const nDotL = Math.max(0, nx * lx + ny * ly + nz * lz);

          // In orthogonal zenith light (lz -> 1), flat stone and letter trench both receive identical normal light!
          // Only raking grazing light reveals the chiseled facets
          const reliefContrast = (1 - lz) * 1.8;
          const shade = nDotL * (0.6 + reliefContrast) + 0.15;

          data[pixelIdx] = Math.min(255, Math.floor(stoneR * shade + (nz > 0.95 ? 0 : (nDotL > 0.6 ? 45 * nDotL : 0))));
          data[pixelIdx + 1] = Math.min(255, Math.floor(stoneG * shade + (nz > 0.95 ? 0 : (nDotL > 0.6 ? 40 * nDotL : 0))));
          data[pixelIdx + 2] = Math.min(255, Math.floor(stoneB * shade + (nz > 0.95 ? 0 : (nDotL > 0.6 ? 35 * nDotL : 0))));
          data[pixelIdx + 3] = 255;
        }
      }

      // Render scaled image to canvas
      createImageBitmap(imgData).then((bmp) => {
        ctx.drawImage(bmp, 0, 0, width, height);

        // Draw Sun Orb on the celestial canvas
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunPixelX, sunPixelY, 26, 0, Math.PI * 2);
        ctx.fillStyle = "radial-gradient(circle, #fff4cc 0%, rgba(255, 230, 150, 0.4) 60%, transparent 100%)";
        ctx.fill();
        ctx.strokeStyle = "#e5c158";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sun ray vectors
        ctx.strokeStyle = "rgba(229, 193, 88, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sunPixelX, sunPixelY);
        ctx.lineTo(width * 0.5, height * 0.5);
        ctx.stroke();
        ctx.restore();
      });

      setTelemetry({
        altitude: altitudeDeg,
        azimuth: azimuthDeg,
        contrast: altitudeDeg > 75 ? "1.08:1 (Invisible)" : `${(18 / Math.max(1, altitudeDeg * 0.2)).toFixed(1)}:1`
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
    sunRef.current.dragging = true;
    updateSun(e);
  };

  const handlePointerUp = () => {
    sunRef.current.dragging = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (sunRef.current.dragging) {
      updateSun(e);
    }
  };

  const updateSun = (e: React.PointerEvent) => {
    sunRef.current.x = Math.max(0.08, Math.min(0.92, e.clientX / window.innerWidth));
    sunRef.current.y = Math.max(0.08, Math.min(0.92, e.clientY / window.innerHeight));
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="relative w-screen h-screen overflow-hidden bg-[#141210] select-none touch-none cursor-crosshair font-serif"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Epigraphic Corner Markers (No boilerplate sidebars or docks) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="font-mono text-xs text-[#a39788] hover:text-[#e5c158] uppercase tracking-[0.25em] transition-colors block font-semibold"
        >
          ← DM-001 // LAPIDARY STELE
        </Link>
        <span className="font-mono text-[10px] text-[#5e5549] uppercase tracking-widest block mt-1.5">
          V-Cut Bas-Relief Phong Shader
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 text-right font-mono text-xs text-[#a39788] pointer-events-none">
        <div>ALTITUDE: <strong className="text-[#e5c158]">{telemetry.altitude}°</strong> · AZIMUTH: <strong className="text-white">{telemetry.azimuth}°</strong></div>
        <div className="text-[10px] text-[#5e5549] mt-1">RELIEF CONTRAST: <strong className="text-[#e5c158]">{telemetry.contrast}</strong></div>
      </div>

      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#7a6f60] pointer-events-none max-w-md leading-relaxed">
        <p className="uppercase tracking-widest">
          DRAG THE SUN ACROSS THE STONE SKY. WHEN DIRECTLY OVERHEAD (ALT &gt; 75°), THE LETTERS VANISH INTO SMOOTH SLATE. RAKING GRAZING LIGHT SCULPTS CHISELED ROMAN CONTOURS.
        </p>
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#5e5549] pointer-events-none">
        <span>JAN TSCHICHOLD FUNCTIONAL CONTRAST · TRAJAN COLUMN EPIGRAPHY</span>
      </div>
    </div>
  );
}
