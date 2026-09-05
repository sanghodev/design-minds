"use client";

import React, { useState, useRef, useId } from "react";
import Link from "next/link";

interface LightingPreset {
  name: string;
  azimuth: number;
  altitude: number;
  description: string;
}

const PRESETS: LightingPreset[] = [
  { name: "Dawn Grazing", azimuth: 45, altitude: 14, description: "Extreme horizontal relief; reveals micro-serif contours and letterform incisions." },
  { name: "Zenith Noon", azimuth: 180, altitude: 86, description: "Near-orthogonal illumination; counters collapse into uniform planar abstraction." },
  { name: "Oblique Raking", azimuth: 315, altitude: 38, description: "Optimal sculptural balance between stroke legibility and shadow projection." },
  { name: "Twilight Penumbra", azimuth: 260, altitude: 6, description: "Extended directional suture; shadow length exceeds glyph cap-height by 3.5x." }
];

export default function SolarGrammarExperiment() {
  const [azimuth, setAzimuth] = useState<number>(315);
  const [altitude, setAltitude] = useState<number>(38);
  const [reliefDepth, setReliefDepth] = useState<number>(6);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("Oblique Raking");

  const stageRef = useRef<HTMLDivElement>(null);
  const azimuthId = useId();
  const altitudeId = useId();
  const reliefId = useId();

  // Convert spherical angles (Azimuth & Altitude) into Cartesian vector components
  const radAzimuth = (azimuth * Math.PI) / 180;
  const radAltitude = (altitude * Math.PI) / 180;

  const lightX = Math.cos(radAltitude) * Math.sin(radAzimuth);
  const lightY = -Math.cos(radAltitude) * Math.cos(radAzimuth);
  const lightZ = Math.sin(radAltitude);

  // Shadow displacement calculations
  const shadowDistance = Math.tan((90 - altitude) * (Math.PI / 180)) * reliefDepth;
  const shadowX = -lightX * shadowDistance;
  const shadowY = -lightY * shadowDistance;
  const shadowBlur = Math.max(1, shadowDistance * 0.45);
  const shadowAlpha = Math.min(0.95, Math.max(0.15, (90 - altitude) / 90 * 0.9));

  // Dynamic variable typography parameters
  const dynamicWeight = Math.round(200 + (1 - lightZ) * 650);
  const dynamicTracking = ((lightZ * 0.08) - 0.02).toFixed(3);
  const contrastRatio = (1 / Math.max(0.08, lightZ * 0.9 + 0.1)).toFixed(2);

  const applyPreset = (preset: LightingPreset) => {
    setAzimuth(preset.azimuth);
    setAltitude(preset.altitude);
    setActivePreset(preset.name);
  };

  return (
    <div className="min-h-screen w-full bg-[#08090b] text-[#e8e8e4] font-sans antialiased flex flex-col justify-between selection:bg-[#d7ff45] selection:text-black">
      {/* Top Telemetry Header */}
      <header className="border-b border-neutral-800/80 bg-[#0c0e12]/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-[#d7ff45] transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Design Minds</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#d7ff45] animate-pulse" />
            <span className="text-neutral-200 font-semibold uppercase tracking-wider">Noon Mind</span>
            <span className="text-neutral-500">/ Day 001 Research Instrument</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
          <div className="hidden md:flex items-center gap-3">
            <span>AZM: <strong className="text-neutral-200">{azimuth}°</strong></span>
            <span>ALT: <strong className="text-neutral-200">{altitude}°</strong></span>
            <span>RATIO: <strong className="text-[#d7ff45]">{contrastRatio}:1</strong></span>
          </div>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
              showGrid ? "border-[#d7ff45] text-[#d7ff45] bg-[#d7ff45]/10" : "border-neutral-750 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            Grid: {showGrid ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-all ${
              showDiagnostics ? "border-[#d7ff45] text-[#d7ff45] bg-[#d7ff45]/10" : "border-neutral-750 text-neutral-400 hover:border-neutral-600"
            }`}
          >
            Telemetry: {showDiagnostics ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      {/* Main Laboratory Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
        
        {/* Left Interactive Control Deck */}
        <aside className="lg:col-span-3 border-r border-neutral-800/80 bg-[#0a0c10]/60 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#d7ff45] mb-1">Inquiry Core</p>
              <h2 className="text-sm font-semibold text-neutral-200 leading-tight">
                Solar Grammar: Epigraphic Shadow Mechanics
              </h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Examining the threshold where letterforms cease to be static flat shapes and function as sundials—rendered legible solely through changing incident light and cast relief.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 block">
                Historical & Solar Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className={`text-left p-2.5 rounded text-xs transition-all border ${
                      activePreset === p.name
                        ? "border-[#d7ff45] bg-[#d7ff45]/10 text-white font-medium"
                        : "border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="font-mono text-[11px]">{p.name}</div>
                    <div className="text-[9px] text-neutral-500 font-mono mt-0.5">{p.altitude}° Alt</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-neutral-800/60">
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={azimuthId}>Solar Azimuth</label>
                  <span className="text-neutral-200">{azimuth}°</span>
                </div>
                <input
                  id={azimuthId}
                  type="range"
                  min="0"
                  max="360"
                  value={azimuth}
                  onChange={(e) => {
                    setAzimuth(Number(e.target.value));
                    setActivePreset("Custom");
                  }}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={altitudeId}>Sun Altitude (Zenith)</label>
                  <span className="text-neutral-200">{altitude}°</span>
                </div>
                <input
                  id={altitudeId}
                  type="range"
                  min="2"
                  max="88"
                  value={altitude}
                  onChange={(e) => {
                    setAltitude(Number(e.target.value));
                    setActivePreset("Custom");
                  }}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
                  <label htmlFor={reliefId}>Incised Relief Depth</label>
                  <span className="text-neutral-200">{reliefDepth}mm</span>
                </div>
                <input
                  id={reliefId}
                  type="range"
                  min="1"
                  max="16"
                  value={reliefDepth}
                  onChange={(e) => setReliefDepth(Number(e.target.value))}
                  className="w-full accent-[#d7ff45] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4 text-[11px] font-mono text-neutral-500 space-y-1">
            <div>30-Day Avoidance: Circular cursor orbits</div>
            <div>Variable Axes: wght({dynamicWeight}), opsz(72)</div>
          </div>
        </aside>

        {/* Center Canvas Stage */}
        <main
          ref={stageRef}
          className="lg:col-span-6 relative flex flex-col justify-center items-center p-8 sm:p-14 overflow-hidden select-none bg-[#090a0d]"
        >
          {/* Subtle Grid Background */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                backgroundSize: "32px 32px"
              }}
            />
          )}

          {/* Virtual Sun Compass Projection */}
          <div className="absolute top-6 left-6 flex items-center gap-3 pointer-events-none opacity-80">
            <div className="relative w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center">
              <div className="absolute text-[8px] font-mono text-neutral-500 top-0.5">N</div>
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#d7ff45] shadow-[0_0_8px_#d7ff45] transition-transform duration-75"
                style={{
                  transform: `translate(${lightX * 18}px, ${lightY * 18}px)`
                }}
              />
              <div className="w-1 h-1 rounded-full bg-neutral-600" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400">
              <div>VEC: [{lightX.toFixed(2)}, {lightY.toFixed(2)}, {lightZ.toFixed(2)}]</div>
              <div>SHD: {shadowDistance.toFixed(1)}px</div>
            </div>
          </div>

          {/* The Typographic Specimen */}
          <div className="w-full max-w-2xl text-center z-10 my-auto py-12">
            <p className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#d7ff45] mb-6">
              Lapidary Typographic Specimen · Incised Relief
            </p>

            <h1
              className="text-5xl sm:text-7xl md:text-8xl tracking-tight transition-all duration-100 ease-out uppercase font-serif"
              style={{
                fontWeight: dynamicWeight,
                letterSpacing: `${dynamicTracking}em`,
                color: "#deded8",
                textShadow: `
                  ${shadowX * 0.25}px ${shadowY * 0.25}px 0px rgba(255,255,255,${Math.max(0.1, lightZ * 0.4)}),
                  ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}),
                  ${shadowX * 1.5}px ${shadowY * 1.5}px ${shadowBlur * 1.8}px rgba(0,0,0,${shadowAlpha * 0.6})
                `
              }}
            >
              Solar Grammar
            </h1>

            <p
              className="mt-8 text-sm sm:text-base text-neutral-300 max-w-lg mx-auto leading-relaxed transition-all duration-150 font-serif italic"
              style={{
                textShadow: `${shadowX * 0.3}px ${shadowY * 0.3}px ${shadowBlur * 0.4}px rgba(0,0,0,${shadowAlpha * 0.7})`
              }}
            >
              "Where light settles orthogonally, the letterform dissolves into silence. Only along the oblique raking edge of the cast shadow does the sentence awaken into legibility."
            </p>

            <div className="mt-8 inline-flex items-center gap-4 text-xs font-mono text-neutral-500 border border-neutral-800 bg-neutral-900/50 px-4 py-2 rounded">
              <span>Specimen Axis: <strong className="text-neutral-300">wght {dynamicWeight}</strong></span>
              <span>•</span>
              <span>Tracking: <strong className="text-neutral-300">{dynamicTracking}em</strong></span>
              <span>•</span>
              <span>Relief Offset: <strong className="text-neutral-300">{shadowDistance.toFixed(1)}px</strong></span>
            </div>
          </div>
        </main>

        {/* Right Observational Telemetry Deck */}
        <aside className="lg:col-span-3 border-l border-neutral-800/80 bg-[#0a0c10]/60 p-6 flex flex-col justify-between gap-6 z-20 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1">
                Theoretical Framework
              </p>
              <h3 className="text-xs font-semibold text-neutral-200">
                Tschichold vs. Epigraphic Roman Tradition
              </h3>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                In classical lapidary inscriptions (e.g. Trajan Column), characters cut into stone possess zero pigment contrast; they communicate entirely through specular reflection and cast shadow.
              </p>
            </div>

            {showDiagnostics && (
              <div className="space-y-4 border-t border-neutral-800/60 pt-4">
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#d7ff45]">
                  Live Visual Metrics
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>Solar Altitude</span>
                      <span className="text-neutral-200">{altitude}°</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#d7ff45]" style={{ width: `${(altitude / 90) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>Cognitive Friction (1-Lux)</span>
                      <span className="text-neutral-200">{((1 - lightZ) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-neutral-400" style={{ width: `${(1 - lightZ) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-neutral-400 text-[11px]">
                      <span>Effective Shadow Umbra</span>
                      <span className="text-neutral-200">{shadowDistance.toFixed(1)}px</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#d7ff45]" style={{ width: `${Math.min(100, (shadowDistance / 40) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed font-mono">
                  <div className="text-neutral-300 font-semibold mb-1">Self-Critique & Boundary:</div>
                  When altitude falls below 8°, cast shadows overlap adjacent character counters, degrading legibility from sculptural revelation into illegible distortion.
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800/60 pt-4">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
              Publication Chapter
            </p>
            <p className="text-xs text-neutral-300 font-medium">
              Chapter 1: Optical Constraints and the Genesis of Type
            </p>
          </div>
        </aside>

      </div>

      {/* Footer System Status */}
      <footer className="border-t border-neutral-800/80 bg-[#08090b] px-6 py-3 flex flex-wrap justify-between items-center text-xs font-mono text-neutral-500 z-30">
        <div>Design Minds · 365 Days of Speculative Design Inquiry</div>
        <div className="flex items-center gap-4">
          <span>Target: Visual & Typography Scholars</span>
          <span>•</span>
          <span>Status: Verified Interactive Instrument</span>
        </div>
      </footer>
    </div>
  );
}
