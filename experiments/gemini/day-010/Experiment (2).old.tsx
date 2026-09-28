import React, { useState, useEffect, useRef } from "react";

export default function PhosphorescentPersistence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [decayRate, setDecayRate] = useState<number>(0.02);
  const [brushRadius, setBrushRadius] = useState<number>(45);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = canvas.width;
    const h = canvas.height;

    // Offscreen buffer storing phosphor energy (0.0 to 1.0)
    const energy = new Float32Array(w * h);

    const textToDraw = "UNTIL YOU LOOK, WORDS ROT IN SILENCE";
    const textCanvas = document.createElement("canvas");
    textCanvas.width = w;
    textCanvas.height = h;
    const tCtx = textCanvas.getContext("2d")!;
    tCtx.fillStyle = "#ffffff";
    tCtx.font = "900 48px Inter, sans-serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillText(textToDraw, w / 2, h / 2);
    const textData = tCtx.getImageData(0, 0, w, h).data;

    const render = () => {
      // 1. If mouse is moving, inject UV energy
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const r = brushRadius;
        const r2 = r * r;

        const minX = Math.max(0, Math.floor(mx - r));
        const maxX = Math.min(w, Math.ceil(mx + r));
        const minY = Math.max(0, Math.floor(my - r));
        const maxY = Math.min(h, Math.ceil(my + r));

        for (let y = minY; y < maxY; y++) {
          for (let x = minX; x < maxX; x++) {
            const d2 = (x - mx) * (x - mx) + (y - my) * (y - my);
            if (d2 < r2) {
              const idx = y * w + x;
              const intensity = (1 - Math.sqrt(d2) / r) * 0.4;
              energy[idx] = Math.min(1.0, energy[idx] + intensity);
            }
          }
        }
      }

      // 2. Becquerel Exponential Decay & Render to Canvas
      const img = ctx.createImageData(w, h);
      const data = img.data;

      for (let i = 0; i < energy.length; i++) {
        // Decay
        energy[i] *= (1.0 - decayRate);
        const e = energy[i];

        if (e > 0.01) {
          const isText = textData[i * 4 + 3] > 128;
          const pixelIdx = i * 4;

          if (isText) {
            // Bright phosphor emerald glow
            data[pixelIdx] = Math.min(255, e * 180);      // R
            data[pixelIdx + 1] = Math.min(255, e * 255);  // G (Emerald peak)
            data[pixelIdx + 2] = Math.min(255, e * 200);  // B
            data[pixelIdx + 3] = Math.min(255, e * 255);
          } else {
            // Subtle ambient scatter
            data[pixelIdx + 1] = Math.min(255, e * 60);
            data[pixelIdx + 3] = Math.min(255, e * 40);
          }
        }
      }

      ctx.putImageData(img, 0, 0);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [decayRate, brushRadius]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  return (
    <div className="relative min-h-screen bg-[#020402] text-[#80FFB0] p-8 md:p-16 font-mono select-none flex flex-col justify-between overflow-hidden">
      <header className="relative z-10 flex justify-between items-start border-b border-[#1A4028] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400">DAY 010 · 2026-09-11</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1 text-emerald-300">
            PHOSPHORESCENT PERSISTENCE
          </h1>
          <p className="text-xs text-emerald-600 mt-2 max-w-lg">
            Typography as an expiring photonic event. Sweep your UV cursor to excite electrons. Stop, and words decay into darkness.
          </p>
        </div>

        <div className="flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span>DECAY RATE:</span>
            <input type="range" min="0.005" max="0.05" step="0.005" value={decayRate} onChange={(e) => setDecayRate(Number(e.target.value))} className="w-20 accent-emerald-400 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <span>UV RADIUS:</span>
            <input type="range" min="20" max="80" value={brushRadius} onChange={(e) => setBrushRadius(Number(e.target.value))} className="w-20 accent-emerald-400 cursor-pointer" />
          </div>
        </div>
      </header>

      <main className="relative my-auto flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={400}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseRef.current.active = false; }}
          className="border border-[#1A4028] rounded-xl cursor-crosshair shadow-[0_0_80px_rgba(0,255,128,0.05)]"
        />
      </main>

      <footer className="relative z-10 border-t border-[#1A4028] pt-4 flex justify-between text-xs opacity-60">
        <span>QUANTUM TRIPLET STATE PHOTON DECAY · BECQUEREL EQUATION</span>
        <span>TEMPORAL TYPOGRAPHIC RITUAL</span>
      </footer>
    </div>
  );
}
