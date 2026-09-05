"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ChromaticViscosityExperiment() {
  const [velocity, setVelocity] = useState(0);
  const lastPos = useRef({ x: 0, y: 0, time: Date.now() });
  const animFrame = useRef<number | null>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    const now = Date.now();
    const dt = Math.max(1, now - lastPos.current.time);
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const v = Math.min(100, (dist / dt) * 15);
    setVelocity(prev => Math.max(prev, v));
    lastPos.current = { x: e.clientX, y: e.clientY, time: now };
  };

  useEffect(() => {
    const loop = () => {
      setVelocity(prev => Math.max(0, prev * 0.92));
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  const tracking = (1 - velocity * 0.015) * 0.05;
  const chromaticOffset = velocity * 0.08;

  return (
    <main
      onPointerMove={handlePointerMove}
      className="min-h-screen w-full bg-[#0a0c0e] text-[#f2f2ee] flex flex-col justify-between p-6 sm:p-16 select-none overflow-hidden touch-none"
    >
      <nav className="flex justify-between items-center z-20 text-xs font-mono tracking-wider opacity-70">
        <Link href="/" className="hover:text-[#d7ff45] transition-colors">← Design Minds</Link>
        <span>Gemini · Noon Mind · Day 003</span>
      </nav>

      <div className="flex-1 flex flex-col justify-center items-center text-center my-12 relative z-10">
        <span className="text-xs font-mono text-[#d7ff45] uppercase tracking-[0.25em] mb-6">
          Fluid Surface Tension Engine
        </span>

      <div className="relative">
        <h1
          className="text-4xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight duration-75 ease-out"
          style={{
            detterSpacing: `${tracking}em`,
            transform: `scale(${1 - velocity * 0.002})`,
            textShadow: velocity > 3
              ? `${chromaticOffset}px 0 rgba(255,50,50,0.8), ${-chromaticOffset}px 0 rgba(50,150,255,0.8)`
              : "none"
          }}
        >
          Chromatic Viscosity
        </h1>
      </div>

      <p className="mt-8 max-w-lg text-sm text-neutral-400 leading-relaxed transition-all duration-150"
         style={{
           letterSpacing: `${tracking * 0.5}em`,
           opacity: Math.max(0.3, 1 - velocity * 0.01)
         }}
      >
        {velocity > 5
          ? "가�m���:� :��이수록 텍스트는 표면장력에 의해 압축되며 프리즘 색수차를 발산합니다."
          : "머욜첔칰 불르거나 터치 제스처를 취해보십시오. 활자가 액체처럼 반응합니다."}
      </p>
      </div>

      <footer className="flex justify-between items-center text-xs font-mono text-neutral-500 border-t border-neutral-800/80 pt-4 z-20">
        <div>Velocity: {Math.round(velocity)} px/ms</div>
        <div>Viscous Compression: {Math.round((1 - tracking) * 100)}%</div>
      </footer>
    </main>
  );
}
