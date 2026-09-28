import React, { useState, useEffect, useRef } from "react";

interface CardItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  metric: string;
  aspect: string;
  accent: string;
}

const CARDS: CardItem[] = [
  {
    id: "01",
    category: "SPATIAL ARCHITECTURE",
    title: "Unigrid Void",
    subtitle: "Mathematical sub-divisions across non-Euclidean perspective planes.",
    metric: "1.618 Φ",
    aspect: "16:9",
    accent: "#E63946"
  },
  {
    id: "02",
    category: "KINETIC VECTOR",
    title: "Monochrome Velocity",
    subtitle: "High-contrast variable weight transitions linked to cursor acceleration.",
    metric: "0.24ms",
    aspect: "4:5",
    accent: "#2A9D8F"
  },
  {
    id: "03",
    category: "TACTILE SHADOW",
    title: "Zero-Blur Occlusion",
    subtitle: "Hard geometric cast shadows establishing authentic elevation hierarchy.",
    metric: "6.0px Δ",
    aspect: "1:1",
    accent: "#E76F51"
  },
  {
    id: "04",
    category: "REDUCTIVE ORDER",
    title: "Dieter Rams Metric",
    subtitle: "Purity through subtraction. As little design as possible.",
    metric: "10 Principles",
    aspect: "3:4",
    accent: "#457B9D"
  }
];

export default function SpatialCanvasExperiment() {
  const [rotation, setRotation] = useState({ x: 12, y: -15 });
  const [activeCard, setActiveCard] = useState<string>("01");
  const [depth, setDepth] = useState<number>(40);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth angle bounds (-25deg to +25deg)
    const rotY = (x / (rect.width / 2)) * 24;
    const rotX = -(y / (rect.height / 2)) * 24;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 8, y: -10 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full min-h-screen p-8 md:p-16 flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-700 ${
        isDarkMode ? "bg-[#0A0A0A] text-[#F5F5F5]" : "bg-[#F4F4F0] text-[#111111]"
      }`}
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full grid grid-cols-12 grid-rows-6 border-collapse">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border border-current" />
          ))}
        </div>
      </div>

      {/* Header / Brand & Day Identifier */}
      <header className="relative z-10 flex justify-between items-start border-b border-current/15 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs tracking-[0.25em] font-mono uppercase opacity-60">
              Design Minds · Day 025 · 2026-09-26
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-2 uppercase">
            Minimalist 3D Spatial Canvas
          </h1>
          <p className="text-sm font-light tracking-wide opacity-50 mt-1 max-w-xl">
            Gyroscopic perspective planes and physical depth hierarchy. Move your cursor to tilt reality.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-3 py-1.5 border border-current/30 rounded hover:border-current transition-colors"
          >
            {isDarkMode ? "LIGHT MODE" : "DARK MODE"}
          </button>
          <div className="hidden md:flex items-center gap-2 border border-current/20 px-3 py-1.5 rounded">
            <span>Z-DEPTH:</span>
            <input
              type="range"
              min="10"
              max="80"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="w-8 text-right">{depth}px</span>
          </div>
        </div>
      </header>

      {/* 3D Interactive Stage */}
      <main className="relative z-10 my-auto flex items-center justify-center py-12" style={{ perspective: "1400px" }}>
        <div
          className="relative grid grid-cols-1 md:grid-cols-4 gap-6 transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d"
          }}
        >
          {CARDS.map((card, idx) => {
            const isActive = activeCard === card.id;
            const cardZ = isActive ? depth * 2.2 : depth * (idx * 0.2 + 0.5);

            return (
              <div
                key={card.id}
                onClick={() => setActiveCard(card.id)}
                style={{
                  transform: `translateZ(${cardZ}px)`,
                  transformStyle: "preserve-3d"
                }}
                className={`group cursor-pointer relative p-7 rounded-2xl border transition-all duration-500 backdrop-blur-md ${
                  isDarkMode
                    ? "bg-[#141414]/90 border-white/10 hover:border-white/30"
                    : "bg-white/90 border-black/10 hover:border-black/30"
                } ${
                  isActive
                    ? isDarkMode
                      ? "ring-2 ring-emerald-400/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                      : "ring-2 ring-emerald-600/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]"
                    : "shadow-lg"
                }`}
              >
                {/* Micro Indicator */}
                <div className="flex justify-between items-center mb-8">
                  <span className="font-mono text-xs tracking-widest opacity-40">
                    N° {card.id}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ backgroundColor: card.accent }}
                  />
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono tracking-widest uppercase opacity-40">
                    {card.category}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs leading-relaxed opacity-60">
                    {card.subtitle}
                  </p>
                </div>

                {/* Footer Metric */}
                <div className="mt-10 pt-5 border-t border-current/10 flex justify-between items-baseline font-mono">
                  <span className="text-xs opacity-40">CALIBRATION</span>
                  <span className="text-sm font-semibold tracking-wider">
                    {card.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer / Status Telemetry */}
      <footer className="relative z-10 border-t border-current/15 pt-5 flex flex-col md:flex-row justify-between items-center text-xs font-mono opacity-50 gap-3">
        <div className="flex items-center gap-6">
          <span>VECTOR PERSPECTIVE: 1400px</span>
          <span>TILT X: {rotation.x.toFixed(1)}°</span>
          <span>TILT Y: {rotation.y.toFixed(1)}°</span>
        </div>
        <div className="tracking-widest uppercase">
          Autonomous Visual Systems · Gemini Noon Mind
        </div>
      </footer>
    </div>
  );
}
