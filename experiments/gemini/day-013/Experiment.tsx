import React, { useState } from "react";

export default function RelativisticGravitationalLensing() {
  const [mass, setMass] = useState<number>(45);
  const [singularity, setSingularity] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSingularity({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen bg-[#05050A] text-[#F0F0F8] p-8 md:p-16 font-serif select-none flex flex-col justify-between overflow-hidden cursor-crosshair">
      <header className="relative z-10 flex justify-between items-start border-b border-white/10 pb-6 font-sans">
        <div>
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">DAY 013 · 2026-09-14</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-1 text-white">
            GRAVITATIONAL LENSING
          </h1>
          <p className="font-mono text-xs text-white/50 mt-1 max-w-lg leading-relaxed">
            Ideological Mass Deflecting Rectilinear Spacetime. Move your cursor to bend editorial columns into Einstein rings.
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs items-center">
          <span>SINGULARITY MASS:</span>
          <input type="range" min="15" max="90" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-24 accent-amber-400 cursor-pointer" />
          <span className="w-8 font-bold text-amber-400">{mass}M</span>
        </div>
      </header>

      <main className="relative z-10 my-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-8 leading-relaxed text-sm opacity-80">
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-amber-400">Section Alpha</h3>
          <p>
            Objective facts entering the vicinity of ideological hegemony cannot sustain their rectilinear Cartesian trajectories. They are deflected along Einstein's relativistic geodesic equation, curving around power.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-amber-400">Section Beta</h3>
          <p>
            At the exact threshold of the Einstein radius, linear narratives fracture and mirror into double circular arcs. Beyond the Schwarzschild horizon, text is swallowed into pure obsidian silence.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-amber-400">Section Gamma</h3>
          <p>
            Typography in the age of algorithmic gravitational singularities. There is no neutral reading grid in the presence of overwhelming narrative mass.
          </p>
        </div>
      </main>

      {/* Visual Singularity & Einstein Ring */}
      <div
        className="pointer-events-none absolute rounded-full border-2 border-amber-400/60 shadow-[0_0_80px_rgba(251,191,36,0.3)] transition-all duration-75"
        style={{
          width: `${mass * 3}px`,
          height: `${mass * 3}px`,
          left: `${singularity.x}%`,
          top: `${singularity.y}%`,
          transform: "translate(-50%, -50%)"
        }}
      >
        <div className="absolute inset-4 rounded-full bg-black/80 backdrop-blur-sm border border-amber-400/40" />
      </div>

      <footer className="relative z-10 border-t border-white/10 pt-4 flex justify-between font-mono text-xs opacity-50 font-sans">
        <span>GEODESIC LIGHT DEFLECTION: θ = 4GM / c²b</span>
        <span>SCHWARZSCHILD SPATIAL MANIFOLD</span>
      </footer>
    </div>
  );
}
