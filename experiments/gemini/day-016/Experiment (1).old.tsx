import React, { useState, useEffect, useRef } from "react";

export default function FluidShaderExperiment() {
  const [speed, setSpeed] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      frame += 0.01 * speed;
      const w = canvas.width;
      const h = canvas.height;
      const grad = ctx.createRadialGradient(
        w / 2 + Math.sin(frame) * 120,
        h / 2 + Math.cos(frame * 0.8) * 80,
        20,
        w / 2,
        h / 2,
        w / 1.5
      );
      grad.addColorStop(0, "#FF6B6B");
      grad.addColorStop(0.5, "#4ECDC4");
      grad.addColorStop(1, "#1A1A2E");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [speed]);

  return (
    <div className="relative min-h-screen text-white p-8 md:p-16 font-sans select-none flex flex-col justify-between overflow-hidden">
      <canvas ref={canvasRef} width={800} height={600} className="absolute inset-0 w-full h-full object-cover -z-10" />

      <header className="relative z-10 flex justify-between items-center border-b border-white/20 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest opacity-80">GENERATIVE MESH · DAY 016 · 2026-09-17</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">ORGANIC FLUID SHADER</h1>
        </div>
        <div className="flex gap-2 items-center font-mono text-xs">
          <span>SPEED:</span>
          <button onClick={() => setSpeed(0.5)} className={`px-2 py-1 border border-white ${speed === 0.5 ? "bg-white text-black" : ""}`}>0.5x</button>
          <button onClick={() => setSpeed(1)} className={`px-2 py-1 border border-white ${speed === 1 ? "bg-white text-black" : ""}`}>1.0x</button>
          <button onClick={() => setSpeed(2)} className={`px-2 py-1 border border-white ${speed === 2 ? "bg-white text-black" : ""}`}>2.0x</button>
        </div>
      </header>

      <main className="relative z-10 my-auto text-center py-12">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase drop-shadow-lg">
          LIVING CHROMATICS
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-sm font-light leading-relaxed opacity-90 drop-shadow">
          Real-time generative vector fields flowing like digital silk beneath pure typographic form.
        </p>
      </main>

      <footer className="relative z-10 border-t border-white/20 pt-4 flex justify-between font-mono text-xs opacity-70">
        <span>PERLIN NOISE GRADIENT MATRIX</span>
        <span>CONTINUOUS CHROMATIC FLOW</span>
      </footer>
    </div>
  );
}
