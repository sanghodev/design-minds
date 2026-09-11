"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface TectonicPlate {
  id: string;
  x: number;
  y: number;
  elevation: number;
  width: number;
  title: string;
  body: string;
  code: string;
}

export default function DiscontinuousGridsExperiment() {
  const [plates, setPlates] = useState<TectonicPlate[]>([
    {
      id: "p1",
      x: 120,
      y: 140,
      elevation: 90,
      width: 440,
      title: "THE GRID DECONSTRUCTED",
      body: "Swiss orthodox typography assumes an unyielding, contiguous two-dimensional plane.",
      code: "GERSTNER-A1"
    },
    {
      id: "p2",
      x: 520,
      y: 280,
      elevation: 60,
      width: 480,
      title: "SPATIAL RUPTURE",
      body: "Fracture the architectural substrate, and semantic continuity dissolves into an abyss of negative space.",
      code: "EL-LISSITZKY-B2"
    },
    {
      id: "p3",
      x: 260,
      y: 480,
      elevation: 30,
      width: 460,
      title: "SHADOW SUTURE",
      body: "Hard-edge cast shadows physically bridge the void, guiding saccadic eye movements without explicit UI wayfinding.",
      code: "PROUN-C3"
    }
  ]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lightSource, setLightSource] = useState<{ x: number; y: number }>({ x: 200, y: 80 });

  // Handle direct grabbing and repositioning of tectonic plates
  const handlePlateDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingId(id);
    const plate = plates.find((p) => p.id === id);
    if (plate) {
      dragOffset.current = { x: e.clientX - plate.x, y: e.clientY - plate.y };
    }
  };

  const handlePointerUp = () => setDraggingId(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId) {
      const newX = Math.max(40, Math.min(window.innerWidth - 460, e.clientX - dragOffset.current.x));
      const newY = Math.max(90, Math.min(window.innerHeight - 200, e.clientY - dragOffset.current.y));
      setPlates((prev) => prev.map((p) => (p.id === draggingId ? { ...p, x: newX, y: newY } : p)));
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-screen h-screen overflow-hidden bg-[#f4f4ee] text-[#111111] font-mono select-none relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px"
      }}
    >
      {/* Constructivist Corner Anchor */}
      <div className="absolute top-6 left-6 z-30 pointer-events-auto">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest font-black px-2.5 py-1 bg-black text-white hover:bg-[#ff3300] transition-colors inline-block"
        >
          ← DM-002 // TECTONIC BROADSIDE
        </Link>
        <span className="text-[10px] text-[#777] uppercase tracking-wider block mt-1.5 font-bold">
          Karl Gerstner Permutational Layout
        </span>
      </div>

      <div className="absolute top-6 right-6 z-30 text-right font-bold text-xs pointer-events-none">
        <div className="text-[#ff3300]">DIRECT DRAG: REPOSITION TECTONIC PLATES</div>
        <div className="text-[10px] text-[#666] mt-0.5">RAYCASTING SUTURE VECTORS ACTIVE</div>
      </div>

      {/* SVG Raycasting Suture Ligatures */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {plates.map((p1, idx) => {
          if (idx >= plates.length - 1) return null;
          const p2 = plates[idx + 1];
          const x1 = p1.x + p1.width;
          const y1 = p1.y + 60;
          const x2 = p2.x;
          const y2 = p2.y + 40;
          const gap = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          const isAligned = gap < 180;

          return (
            <g key={`suture-${p1.id}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isAligned ? "#ff3300" : "rgba(0,0,0,0.2)"}
                strokeWidth={isAligned ? 3 : 1.5}
                strokeDasharray={isAligned ? "none" : "6 4"}
              />
              <circle cx={x1} cy={y1} r={4} fill={isAligned ? "#ff3300" : "#111"} />
              <circle cx={x2} cy={y2} r={4} fill={isAligned ? "#ff3300" : "#111"} />
              {isAligned && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} fill="#ff3300" fontSize="10" fontWeight="bold" textAnchor="middle">
                  SUTURE LOCKED ({gap.toFixed(0)}px)
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Draggable Tectonic Plates */}
      {plates.map((plate) => {
        // Hard constructivist zero-blur architectural cast shadow
        const shadowDist = (plate.elevation / 90) * 28;

        return (
          <div
            key={plate.id}
            onPointerDown={(e) => handlePlateDown(plate.id, e)}
            className="absolute p-8 border-4 border-black bg-white cursor-grab active:cursor-grabbing transition-shadow duration-75 z-20"
            style={{
              left: `${plate.x}px`,
              top: `${plate.y}px`,
              width: `${plate.width}px`,
              boxShadow: `${shadowDist}px ${shadowDist * 1.2}px 0px #111111`
            }}
          >
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#ff3300] mb-2 tracking-widest border-b border-black/20 pb-1">
              <span>{plate.code}</span>
              <span>ELEVATION +{plate.elevation}mm</span>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-3 font-sans">
              {plate.title}
            </h2>

            <p className="text-xs leading-relaxed text-[#333] font-serif">
              {plate.body}
            </p>
          </div>
        );
      })}

      <div className="absolute bottom-6 left-6 z-30 text-[10px] text-[#666] font-bold pointer-events-none">
        GESTALT LAW OF CLOSURE VIA NEGATIVE GAP SUTURE
      </div>

      <div className="absolute bottom-6 right-6 z-30 text-[10px] text-[#666] font-bold pointer-events-none">
        CHAPTER II: FRACTURED PLANES & THE SHADOW SUTURE
      </div>
    </div>
  );
}
