"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ChromaticGlassineExperiment() {
  const [cyanPos, setCyanPos] = useState<{ x: number; y: number }>({ x: -28, y: -14 });
  const [magentaPos, setMagentaPos] = useState<{ x: number; y: number }>({ x: 24, y: 16 });
  const [yellowPos, setYellowPos] = useState<{ x: number; y: number }>({ x: -8, y: 28 });
  const [activeSheet, setActiveSheet] = useState<"c" | "m" | "y" | null>(null);

  // Compute misregistration delta from center (0, 0)
  const misregDist = Math.sqrt(
    cyanPos.x * cyanPos.x + cyanPos.y * cyanPos.y +
    magentaPos.x * magentaPos.x + magentaPos.y * magentaPos.y +
    yellowPos.x * yellowPos.x + yellowPos.y * yellowPos.y
  );

  const registrationPurity = Math.max(0, Math.round(100 - misregDist * 1.5));
  const isRegistered = registrationPurity > 92;

  const handlePointerDown = (sheet: "c" | "m" | "y") => {
    setActiveSheet(sheet);
  };

  const handlePointerUp = () => {
    setActiveSheet(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeSheet) return;
    const dx = e.movementX * 0.6;
    const dy = e.movementY * 0.6;

    if (activeSheet === "c") {
      setCyanPos((prev) => ({ x: Math.max(-90, Math.min(90, prev.x + dx)), y: Math.max(-90, Math.min(90, prev.y + dy)) }));
    } else if (activeSheet === "m") {
      setMagentaPos((prev) => ({ x: Math.max(-90, Math.min(90, prev.x + dx)), y: Math.max(-90, Math.min(90, prev.y + dy)) }));
    } else if (activeSheet === "y") {
      setYellowPos((prev) => ({ x: Math.max(-90, Math.min(90, prev.x + dx)), y: Math.max(-90, Math.min(90, prev.y + dy)) }));
    }
  };

  return (
    <div
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      className="w-screen h-screen overflow-hidden bg-[#e6e4dc] select-none touch-none font-sans relative flex flex-col justify-between p-8 sm:p-14"
    >
      {/* Lightbox Framing Header */}
      <div className="absolute top-8 left-8 z-30 pointer-events-auto">
        <Link
          href="/"
          className="font-mono text-xs text-[#6e685a] hover:text-[#111110] uppercase tracking-widest transition-colors font-bold block"
        >
          ← DM-007 // GLASSINE LIGHT TABLE
        </Link>
        <span className="font-mono text-[10px] text-[#9c9380] uppercase tracking-wider block mt-1">
          Bruno Munari I Libri Illeggibili (1949)
        </span>
      </div>

      <div className="absolute top-8 right-8 z-30 text-right font-mono text-xs text-[#6e685a] pointer-events-none">
        <div>OPTICAL REGISTRATION: <strong className={isRegistered ? "text-emerald-700 font-bold" : "text-[#111110]"}>{registrationPurity}%</strong></div>
        <div className="text-[10px] text-[#9c9380] mt-0.5">
          SPECTRAL EXTINCTION: <strong className="text-[#111110]">{isRegistered ? "100% PITCH BLACK (K)" : "PRIMARY SEPARATION"}</strong>
        </div>
      </div>

      {/* The Luminous Light Table Surface (The Whole Canvas) */}
      <div
        className="flex-1 flex flex-col justify-center items-center my-auto relative z-10 w-full max-w-5xl mx-auto rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 0 120px rgba(255, 255, 255, 0.9), inset 0 0 60px rgba(0, 0, 0, 0.04)"
        }}
      >
        {/* Three Disjointed Glassine Tracing Paper Leaves */}
        <div className="relative w-full h-96 flex items-center justify-center">
          
          {/* Cyan Sheet: Vertical structural stems */}
          <div
            onPointerDown={() => handlePointerDown("c")}
            className="absolute p-8 cursor-grab active:cursor-grabbing mix-blend-multiply transition-transform duration-75 select-none"
            style={{
              transform: `translate(${cyanPos.x}px, ${cyanPos.y}px)`,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(1px)",
              border: "1px solid rgba(0, 163, 224, 0.3)"
            }}
          >
            <span className="absolute top-2 left-2 font-mono text-[9px] text-[#00a3e0] font-black uppercase">CYAN // STEMS</span>
            <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tight text-[#00a3e0] font-mono">
              | | | S | N |
            </h1>
          </div>

          {/* Magenta Sheet: Horizontal crossbars & terminals */}
          <div
            onPointerDown={() => handlePointerDown("m")}
            className="absolute p-8 cursor-grab active:cursor-grabbing mix-blend-multiply transition-transform duration-75 select-none"
            style={{
              transform: `translate(${magentaPos.x}px, ${magentaPos.y}px)`,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(1px)",
              border: "1px solid rgba(228, 0, 127, 0.3)"
            }}
          >
            <span className="absolute top-2 left-2 font-mono text-[9px] text-[#e4007f] font-black uppercase">MAGENTA // CROSSBARS</span>
            <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tight text-[#e4007f] font-mono">
              G — L — S — E
            </h1>
          </div>

          {/* Yellow Sheet: Curved bowls & counters */}
          <div
            onPointerDown={() => handlePointerDown("y")}
            className="absolute p-8 cursor-grab active:cursor-grabbing mix-blend-multiply transition-transform duration-75 select-none"
            style={{
              transform: `translate(${yellowPos.x}px, ${yellowPos.y}px)`,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(1px)",
              border: "1px solid rgba(255, 237, 0, 0.5)"
            }}
          >
            <span className="absolute top-2 left-2 font-mono text-[9px] text-[#cca000] font-black uppercase">YELLOW // BOWLS</span>
            <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tight text-[#ffed00] font-mono">
              ( ) A S S ( )
            </h1>
          </div>

          {/* Subtractive Quenched Composite Word (Appears in center when aligned) */}
          {isRegistered && (
            <div className="absolute pointer-events-none z-30 transition-opacity duration-200">
              <h1 className="text-7xl sm:text-9xl font-black uppercase tracking-tight text-[#0a0908] font-mono drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]">
                GLASSINE
              </h1>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-[#666050] font-serif italic max-w-md text-center">
          "Drag each colored glassine leaf directly. In isolation, each sheet carries only an unreadable abstract ghost; register them into alignment to extinguish the backlight into pitch-black language."
        </p>
      </div>

      <div className="absolute bottom-8 left-8 z-30 font-mono text-[11px] text-[#7d7564] pointer-events-none max-w-md uppercase tracking-widest leading-relaxed">
        DRAG CYAN, MAGENTA, AND YELLOW TRACING LEAVES ACROSS THE LIGHTBOX. PHYSICAL REGISTRATION ABSORBS ALL TRANSMITTED LIGHT ACCORDING TO BEER-LAMBERT SUBTRACTIVE OPTICS.
      </div>

      <div className="absolute bottom-8 right-8 z-30 font-mono text-[10px] text-[#9c9380] pointer-events-none text-right">
        <span>JOHANNES ITTEN SUBTRACTIVE MIXTURE · BEER-LAMBERT TRANSMISSION</span>
      </div>
    </div>
  );
}
