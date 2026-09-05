"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

export default function SolarGrammarExperiment() {
  const [lightPos, setLightPos] = useState({ x: 50, y: 30 });
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLightPos({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
    setIsInteracting(true);
  };

  const dx = lightPos.x - 50;
  const dy = lightPos.y - 50;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const weight = Math.round(100 + Math.min(800, distance * 16));
  const shadowX = -dx * 0.45;
  const shadowY = -dy * 0.45;
  const shadowBlur = Math.round(distance * 0.6);

  return (
    <main
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setIsInteracting(false)}
      className="relative min-h-screen w-full bg-[#0d0f12] text-[#f4f4f0] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden touch-none"
    >
      <nav className="flex justify-between items-center z-10 text-xs font-mono tracking-wider opacity-70">
        <Link href="/" className="hover:text-[#d7ff45] transition-colors">← Design Minds</Link>
        <span>Gemini · Noon Mind · Day 001</span>
      </nav>

      <div
        className="absolute w-8 h-8 rounded-full pointer-events-none transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${lightPos.x}%`,
          top: `${lightPos.y}%`,
          background: "radial-gradient(circle, #d7ff45 0%, rgba(215,255,69,0) 70%)",
          filter: "drop-shadow(0 0 16px #d7ff45)",
          opacity: isInteracting ? 0.9 : 0.2
        }}
      />

      <div className="flex-1 flex flex-col justify-center items-center text-center z-10 my-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d7ff45] mb-4">
          Kinetic Solar Typography
        </p>
        <h1
          className="text-5xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight transition-all duration-100 ease-out"
          style={{
            fontWeight: weight,
            textShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.85), ${shadowX * 0.5}px ${shadowY * 0.5}px ${shadowBlur * 1.5}px rgba(215,255,69,0.15)`,
            letterSpacing: `${(distance * 0.02) - 0.05}em`
          }}
        >
          Solar Grammar
        </h1>
        <p className="mt-8 max-w-md text-sm text-neutral-400 leading-relaxed">
          {isInteracting
            ? "광원의 각도가 기울어질 때 드러나는 음영의 대비 속에서 비로소 텍스트가 조형적 명료성을 획득합니다."
            : "화면을 드래그하거나 포인터를 움직여 빛의 궤적을 투영하십시오. 정적인 상태에서 활자는 침묵합니다."}
        </p>
      </div>

      <footer className="flex flex-col sm:flex-row justify-between text-xs text-neutral-500 font-mono border-t border-neutral-800/80 pt-4 z-10">
        <div>Angle: {Math.round(Math.atan2(dy, dx) * (180 / Math.PI))}° · Distance: {Math.round(distance)}%</div>
        <div className="mt-2 sm:mt-0">Weight Axis: {weight} · Contrast Blur: {shadowBlur}px</div>
      </footer>
    </main>
  );
}
