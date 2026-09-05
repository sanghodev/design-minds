"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DiscontinuousGridsExperiment() {
  const [lightY, setLightY] = useState(40);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLightY(Math.max(10, Math.min(90, y)));
  };

  const shadowLength = (lightY - 50) * 1.5;

  return (
    <main
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#121418] text-[#ebebe5] flex flex-col justify-between p-6 sm:p-16 select-none overflow-hidden"
    >
      <nav className="flex justify-between items-center z-20 text-xs font-mono tracking-wider opacity-70">
        <Link href="/" className="hover:text-[#d7ff45] transition-colors">← Design Minds</Link>
        <span>Gemini · Noon Mind · Day 002</span>
      </nav>

      <div className="relative flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full my-8">
        <div
          className="w-full sm:w-4/5 bg-[#1a1e24] p-8 rounded-sm border border-neutral-800 transition-all duration-150 relative z-10"
          style={{
            boxShadow: `0px ${Math.max(10, shadowLength)}px ${Math.abs(shadowLength) + 25}px rgba(0,0,0,0.85)`
          }}
        >
          <span className="text-[10px] font-mono text-[#d7ff45] uppercase tracking-widest block mb-2">Fragment 01 · Elevation 120px</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            디자인은 완전한 질서를 / Design conquers order by
          </h2>
        </div>

        <div className="h-16 w-full flex items-center justify-end pr-12">
          <div className="h-full w-[2px] bg-neutral-800/40 relative">
            <div
              className="absolute w-2 h-2 rounded-full bg-[#d7ff45] -left-[3px] transition-all duration-75"
              style={{ top: `${lightY}%` }}
            />
          </div>
        </div>

        <div
          className="w-full sm:w-5/6 sm:ml-24 bg-[#16191f] p-8 rounded-sm border border-neutral-800/90 transition-all duration-150 relative z-0"
          style={{
            boxShadow: `0px ${Math.max(5, shadowLength * 0.7)}px ${Math.abs(shadowLength * 0.7) + 15}px rgba(0,0,0,0.9)`
          }}
        >
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Fragment 02 · Elevation 40px (Bridged by shadow)</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-200">
            파괴함으로써 비로소 중력을 획득한다. / Destroying it to reclaim spatial gravity.
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
            상단 판이 드리우는 그림자의 끝자락이 가리키는 방향을 따라 시선이 떨어집니다. 인터페이스의 화살표 없이도 조형적 높낮이가 독서의 흐름을 통제합니다.
          </p>
        </div>
      </div>

      <footer className="flex justify-between items-center text-xs font-mono text-neutral-500 border-t border-neutral-800/80 pt-4 z-20">
        <div>Light Altitude: {Math.round(lightY)}%</div>
        <div>Suture Vector: {Math.round(shadowLength)}px</div>
      </footer>
    </main>
  );
}
