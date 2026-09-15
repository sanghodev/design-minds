"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ScaleLevel {
  exponent: number;
  name: string;
  nameKr: string;
  description: string;
  metric: string;
  comparisonDomain: "micro" | "human" | "macro" | "cosmic";
}

const SCALE_LEVELS: ScaleLevel[] = [
  { exponent: -16, name: "Subatomic Quarks", nameKr: "소립자 쿼크와 글루온", description: "Proton interior; asymptotic freedom binding valence quarks.", metric: "0.1 Attometers (10⁻¹⁶ m)", comparisonDomain: "micro" },
  { exponent: -10, name: "DNA & Atomic Lattice", nameKr: "DNA 이중나선과 탄소 격자", description: "Hydrogen bond distance between nucleotide base pairs.", metric: "0.1 Nanometers (10⁻¹⁰ m)", comparisonDomain: "micro" },
  { exponent: -6, name: "Neural Synapse", nameKr: "인간 뇌신경 시냅스망", description: "Cortical pyramidal dendrites connecting 10¹⁵ synaptic junctions.", metric: "1 Micrometer (10⁻⁶ m)", comparisonDomain: "micro" },
  { exponent: 0, name: "Human Typographer", nameKr: "인간 척도와 활자 판형", description: "Physical reading distance of editorial broadside printing.", metric: "1 Meter (10⁰ m)", comparisonDomain: "human" },
  { exponent: 7, name: "Planetary Biosphere", nameKr: "지구 생태계와 도시 야경망", description: "Continental communication and highway fiber-optic networks.", metric: "10,000 Kilometers (10⁷ m)", comparisonDomain: "macro" },
  { exponent: 21, name: "Milky Way Galaxy", nameKr: "우리은하 나선팔", description: "Barred spiral stellar disk spanning 100,000 light years.", metric: "10²¹ Meters (1 Zettameter)", comparisonDomain: "cosmic" },
  { exponent: 26, name: "Cosmic Web", nameKr: "우주 거대구조 (라니아케아)", description: "Gravitational filaments connecting 10¹¹ observable galaxies.", metric: "10²⁶ Meters (Observable Universe)", comparisonDomain: "cosmic" }
];

export default function PowersOfTenExperiment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentExp, setCurrentExp] = useState<number>(-6); // Start at Neural Synapse
  const [displayMode, setDisplayMode] = useState<"continuous" | "dual-split">("continuous");
  const [showSpectralGraph, setShowSpectralGraph] = useState<boolean>(true);
  const expRef = useRef<number>(-6);
  expRef.current = currentExp;

  const closestLevel = SCALE_LEVELS.reduce((prev, curr) =>
    Math.abs(curr.exponent - currentExp) < Math.abs(prev.exponent - currentExp) ? curr : prev
  );

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

    // Procedural nodes for Neural vs Cosmic comparison
    const nodeCount = 190;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      mass: Math.random() * 2 + 1,
      connections: [] as number[]
    }));

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 95) {
          nodes[i].connections.push(j);
        }
      }
    }

    const render = () => {
      ctx.fillStyle = "rgba(5, 8, 14, 0.42)";
      ctx.fillRect(0, 0, width, height);

      const exp = expRef.current;
      const t = Date.now() * 0.001;

      if (displayMode === "dual-split") {
        // DUAL-SPLIT VIEW: Left = Neural Cortex (10^-6m), Right = Cosmic Web (10^+26m)
        const midX = width * 0.5;

        // Divider line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX, 90); ctx.lineTo(midX, height - 90);
        ctx.stroke();

        // Left Header: Neural Cortex (Amber)
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#f59e0b";
        ctx.textAlign = "center";
        ctx.fillText("HUMAN CEREBELLUM (10⁻⁶ m)", midX * 0.5, 120);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Power Spectrum γ = 2.47 ± 0.12 · Clustering C ≈ 0.38", midX * 0.5, 140);

        // Right Header: Cosmic Web (Cyan)
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("COSMIC WEB FILAMENTS (10⁺²⁶ m)", midX * 1.5, 120);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Power Spectrum γ = 2.56 ± 0.15 · Clustering C ≈ 0.38", midX * 1.5, 140);

        // Render nodes with split color domains
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          n1.x += n1.vx;
          n1.y += n1.vy;
          if (n1.x < 0 || n1.x > width) n1.vx *= -1;
          if (n1.y < 0 || n1.y > height) n1.vy *= -1;

          const isLeft = n1.x < midX;
          const nodeColor = isLeft ? "rgba(245, 158, 11, " : "rgba(56, 189, 248, ";

          ctx.beginPath();
          ctx.arc(n1.x, n1.y, n1.mass * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `${nodeColor}0.95)`;
          ctx.fill();

          for (let k = 0; k < n1.connections.length; k++) {
            const n2 = nodes[n1.connections[k]];
            const isN2Left = n2.x < midX;
            if (isLeft !== isN2Left) continue; // Don't bridge across split border

            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `${nodeColor}${(1 - dist / 100) * 0.75})`;
              ctx.lineWidth = 1.4;
              ctx.stroke();
            }
          }
        }
      } else {
        // CONTINUOUS 42-MAGNITUDE ZOOM VIEW
        const isNeuralOrCosmic = Math.abs(exp - -6) < 4 || Math.abs(exp - 26) < 4;
        const filamentColor = exp > 10 ? "rgba(147, 197, 253, " : "rgba(245, 158, 11, ";

        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          n1.x += n1.vx;
          n1.y += n1.vy;
          if (n1.x < 0 || n1.x > width) n1.vx *= -1;
          if (n1.y < 0 || n1.y > height) n1.vy *= -1;

          ctx.beginPath();
          const pulse = Math.sin(t * 2 + i) * 0.5 + 1;
          ctx.arc(n1.x, n1.y, (n1.mass * pulse * (isNeuralOrCosmic ? 1.8 : 1.0)), 0, Math.PI * 2);
          ctx.fillStyle = `${filamentColor}0.9)`;
          ctx.fill();

          for (let k = 0; k < n1.connections.length; k++) {
            const n2 = nodes[n1.connections[k]];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              const alpha = (1 - dist / 110) * (isNeuralOrCosmic ? 0.75 : 0.25);
              ctx.strokeStyle = `${filamentColor}${alpha})`;
              ctx.lineWidth = isNeuralOrCosmic ? 1.5 : 0.75;
              ctx.stroke();
            }
          }
        }

        // Central Reticle
        const cx = width * 0.5;
        const cy = height * 0.5;
        const reticleR = Math.min(width, height) * 0.36;

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, reticleR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
        ctx.stroke();
        ctx.restore();

        // Multi-Scale Typographic Core
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = `900 ${Math.min(width * 0.09, 82)}px "Courier New", monospace`;
        ctx.fillStyle = exp > 10 ? "#93c5fd" : exp < -2 ? "#fbbf24" : "#f8fafc";
        ctx.shadowColor = exp > 10 ? "#3b82f6" : "#f59e0b";
        ctx.shadowBlur = 24;

        const mainLabel = exp > 15 ? "COSMIC WEB" : exp < -8 ? "QUANTUM FOAM" : exp < 0 ? "NEURAL CORTEX" : "HUMAN SCALE";
        ctx.fillText(mainLabel, cx, cy - 15);
        ctx.shadowBlur = 0;

        ctx.font = "14px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(`10^${exp >= 0 ? "+" : ""}${exp} METERS · ${closestLevel.metric}`, cx, cy + 35);

        ctx.font = "italic 12px serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
        ctx.fillText(`"${closestLevel.description}"`, cx, cy + 60);
        ctx.restore();
      }

      // Render live Vazza-Feletti Power Spectrum Curve P(k) in bottom-right corner
      if (showSpectralGraph) {
        const gw = 180;
        const gh = 70;
        const gx = width - gw - 30;
        const gy = height - gh - 120;

        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, gw, gh);
        ctx.fillRect(gx, gy, gw, gh);

        ctx.font = "9px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "left";
        ctx.fillText("POWER DENSITY P(k) ∝ k⁻²·⁵", gx + 8, gy + 14);

        // Plot curve
        ctx.beginPath();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < gw - 20; x++) {
          const k = (x / (gw - 20)) * 4 + 1;
          const y = Math.pow(k, -1.8) * (gh - 30);
          if (x === 0) ctx.moveTo(gx + 10 + x, gy + gh - 8 - y);
          else ctx.lineTo(gx + 10 + x, gy + gh - 8 - y);
        }
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.fillText("Brain γ=2.47", gx + 10, gy + gh - 8);
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("Cosmic γ=2.56", gx + 95, gy + gh - 8);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [closestLevel, displayMode, showSpectralGraph]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 1 : -1;
    setCurrentExp((prev) => Math.min(26, Math.max(-16, prev + delta)));
  };

  return (
    <div
      onWheel={handleWheel}
      className="w-screen h-screen overflow-hidden bg-[#05080e] text-[#e6edf3] font-mono select-none relative flex flex-col justify-between p-6 sm:p-10"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Header Framing */}
      <header className="flex justify-between items-start z-30 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-[#38bdf8] text-black hover:bg-white transition-colors"
            >
              ← DM-012 // POWERS OF TEN
            </Link>
            <span className="text-[#94a3b8] text-xs font-bold tracking-widest">
              EAMES 1977 · VAZZA & FELETTI SCALE INVARIANCE
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1.5 max-w-xl font-sans">
            Quantifying scale invariance: The 10¹¹ neurons of the human cerebellum and the 10¹¹ galaxies of the cosmic web share identical power-law spectral density P(k) ∝ k⁻².⁵.
          </p>
        </div>

        {/* View Mode & Graph Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDisplayMode(displayMode === "continuous" ? "dual-split" : "continuous")}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded border transition-all ${
              displayMode === "dual-split"
                ? "bg-[#38bdf8] text-black border-[#38bdf8]"
                : "bg-[#161b22] text-[#94a3b8] border-[#30363d] hover:text-white"
            }`}
          >
            {displayMode === "dual-split" ? "⚖️ DUAL-SPLIT VIEW" : "🔭 CONTINUOUS ZOOM"}
          </button>

          <button
            onClick={() => setShowSpectralGraph(!showSpectralGraph)}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded border transition-all ${
              showSpectralGraph ? "border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10" : "border-[#30363d] text-[#64748b]"
            }`}
          >
            P(k) Spectrum
          </button>

          <div className="text-right pl-3 border-l border-[#1e293b]">
            <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Current Magnitude</div>
            <div className="text-xl font-black text-[#38bdf8]">
              10^{currentExp >= 0 ? `+${currentExp}` : currentExp} <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>
        </div>
      </header>

      {/* Logarithmic Scale Navigation Scrubbing Rail */}
      <footer className="z-30 border-t border-[#1e293b] pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-[#94a3b8]">
          <span className="text-[10px] uppercase tracking-widest text-[#64748b]">10⁻¹⁶m (Quarks)</span>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            SCROLL WHEEL OR DRAG TO ZOOM ACROSS 42 ORDERS OF MAGNITUDE
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#64748b]">10⁺²⁶m (Laniakea)</span>
        </div>

        <input
          type="range"
          min="-16"
          max="26"
          step="1"
          value={currentExp}
          onChange={(e) => setCurrentExp(Number(e.target.value))}
          className="w-full accent-[#38bdf8] cursor-pointer"
        />

        <div className="flex justify-between text-[9px] text-[#64748b]">
          {SCALE_LEVELS.map((lvl) => (
            <button
              key={lvl.exponent}
              onClick={() => setCurrentExp(lvl.exponent)}
              className={`hover:text-white transition-colors uppercase ${
                Math.abs(currentExp - lvl.exponent) <= 2 ? "text-[#38bdf8] font-bold" : ""
              }`}
            >
              10^{lvl.exponent >= 0 ? `+${lvl.exponent}` : lvl.exponent} {lvl.name}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
