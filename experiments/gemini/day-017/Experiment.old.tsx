"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface WordParticle {
  id: number;
  text: string;
  baseX: number;
  baseY: number;
  currX: number;
  currY: number;
  vx: number;
  vy: number;
  temp: number; // Local temperature [0..100]
  cellIndex: number;
}

export default function NonEquilibriumDissipativeTypography() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Editorial Passage: Ilya Prigogine (1977) on Dissipative Structures & Order Out of Chaos
  const passageWords = [
    "Entropy", "is", "not", "merely", "a", "blind", "drift", "toward", "disorder,",
    "nor", "a", "fatal", "march", "toward", "the", "silence", "of", "cosmic", "heat", "death.",
    "In", "open", "systems", "driven", "far", "from", "thermodynamic", "equilibrium,",
    "continuous", "energy", "flux", "and", "entropy", "dissipation",
    "shatter", "linear", "uniformity.", "Past", "the", "critical", "bifurcation", "threshold,",
    "microscopic", "thermal", "fluctuations", "amplify", "into", "macroscopic", "coherence.",
    "Order", "emerges", "from", "chaos;", "dissipation", "becomes", "the", "architect", "of", "living", "form."
  ];

  // Thermodynamic Control Parameters
  const [thermalInputRate, setThermalInputRate] = useState<number>(1.2);
  const [dissipationRate, setDissipationRate] = useState<number>(0.035);
  const [convectionStrength, setConvectionStrength] = useState<number>(0.85);
  const [autoThermalPump, setAutoThermalPump] = useState<boolean>(true);
  const [criticalRa, setCriticalRa] = useState<number>(1708);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    rayleighNumber: 450,
    meanTemp: 24,
    entropyProduction: 0.12,
    entropyExport: 0.18,
    netEntropyDelta: -0.06,
    bifurcationState: "CONDUCTION REGIME (LINEAR)"
  });

  const wordsRef = useRef<WordParticle[]>([]);
  const heatSourcesRef = useRef<{ x: number; y: number; intensity: number }[]>([]);
  const pumpTimerRef = useRef<number>(0);
  const pumpWordIdxRef = useRef<number>(0);

  // Initialize Word Lattice Layout
  useEffect(() => {
    const words: WordParticle[] = [];
    const containerW = 920;
    let cx = 45;
    let cy = 65;
    const rowH = 50;

    passageWords.forEach((word, idx) => {
      const approxW = word.length * 13 + 16;
      if (cx + approxW > containerW - 40) {
        cx = 45;
        cy += rowH;
      }

      // Assign to one of 4 macroscopic Bénard convection cells
      const cell = Math.min(3, Math.floor(cx / 230));

      words.push({
        id: idx,
        text: word,
        baseX: cx,
        baseY: cy,
        currX: cx,
        currY: cy,
        vx: 0,
        vy: 0,
        temp: 20 + Math.random() * 5,
        cellIndex: cell
      });

      cx += approxW;
    });

    wordsRef.current = words;
  }, []);

  // Inject Heat at Position
  const injectThermalFriction = useCallback((x: number, y: number, amount: number) => {
    heatSourcesRef.current.push({ x, y, intensity: amount });

    wordsRef.current.forEach((word) => {
      const dx = word.currX - x;
      const dy = word.currY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const addedHeat = (1.0 - dist / 120) * amount * 18;
        word.temp = Math.min(100, word.temp + addedHeat);
      }
    });
  }, []);

  // 60fps Thermodynamic Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      const words = wordsRef.current;
      if (words.length === 0) {
        animId = requestAnimationFrame(loop);
        return;
      }

      // 1. Autonomous Saccadic Thermal Pump (Simulating Reader Gaze Friction)
      if (autoThermalPump) {
        pumpTimerRef.current += dt;
        if (pumpTimerRef.current > 240) {
          pumpTimerRef.current = 0;
          pumpWordIdxRef.current = (pumpWordIdxRef.current + 1) % words.length;
          const target = words[pumpWordIdxRef.current];
          if (target) {
            injectThermalFriction(target.currX + 30, target.currY, thermalInputRate * 2.5);
          }
        }
      }

      // Decay temporary heat sources
      heatSourcesRef.current = heatSourcesRef.current
        .map((src) => ({ ...src, intensity: src.intensity * 0.92 }))
        .filter((src) => src.intensity > 0.05);

      // 2. Thermodynamic Field Calculations
      let totalTemp = 0;
      let minTemp = 100;
      let maxTemp = 0;

      words.forEach((w) => {
        totalTemp += w.temp;
        if (w.temp < minTemp) minTemp = w.temp;
        if (w.temp > maxTemp) maxTemp = w.temp;
      });

      const meanT = totalTemp / words.length;
      const deltaT = maxTemp - minTemp;

      // Rayleigh Number: Ra proportional to deltaT * convectionStrength
      const currentRa = Math.round(deltaT * convectionStrength * 38 + meanT * 12);
      const isFarFromEquilibrium = currentRa >= criticalRa;

      // 3. Physical Mechanics & Bénard Hexagonal Convection Rolls
      const cellCenters = [160, 390, 620, 850]; // 4 convective roll centers
      const cellDirections = [1, -1, 1, -1]; // Alternating roll polarities (clockwise / counter-clockwise)

      words.forEach((w) => {
        // Continuous cooling dissipation toward ambient margin sink (T_sink = 20C)
        const cooling = (w.temp - 20) * dissipationRate;
        w.temp = Math.max(20, w.temp - cooling);

        if (!isFarFromEquilibrium) {
          // Conduction Regime (Sub-critical Ra): Linear restoring spring to baseline grid
          const fx = (w.baseX - w.currX) * 0.08;
          const fy = (w.baseY - w.currY) * 0.08;
          w.vx = (w.vx + fx) * 0.75;
          w.vy = (w.vy + fy) * 0.75;
        } else {
          // Dissipative Convection Regime (Super-critical Ra):
          // Hexagonal roll cells carry hot words upward (plume) and cold words downward (sink)
          const cellX = cellCenters[w.cellIndex % 4];
          const rollDir = cellDirections[w.cellIndex % 4];
          const dx = w.currX - cellX;
          const dy = w.currY - 240;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;

          // Tangential convective velocity: v_theta proportional to temperature above critical threshold
          const superCriticalFactor = (currentRa - criticalRa) / 1000;
          const orbitSpeed = Math.min(3.2, 0.4 + superCriticalFactor * 1.5) * rollDir;

          // Vortex force
          const fVortexX = (-dy / dist) * orbitSpeed;
          const fVortexY = (dx / dist) * orbitSpeed;

          // Buoyancy lift for hot letterforms (hot rises, cold descends)
          const buoyancy = ((w.temp - meanT) / 50) * -2.4;

          // Elastic boundary anchor preventing total disintegration
          const fAnchorX = (w.baseX - w.currX) * 0.018;
          const fAnchorY = (w.baseY - w.currY) * 0.018;

          w.vx = (w.vx + fVortexX * 0.25 + fAnchorX) * 0.88;
          w.vy = (w.vy + fVortexY * 0.25 + buoyancy * 0.25 + fAnchorY) * 0.88;
        }

        w.currX += w.vx;
        w.currY += w.vy;
      });

      // 4. Update Telemetry
      if (Math.random() < 0.1) {
        const prod = (thermalInputRate * (deltaT / 100)).toFixed(3);
        const exp = (dissipationRate * (meanT - 20) * 0.2).toFixed(3);
        const net = (parseFloat(prod) - parseFloat(exp)).toFixed(3);

        setTelemetry({
          rayleighNumber: currentRa,
          meanTemp: Math.round(meanT),
          entropyProduction: parseFloat(prod),
          entropyExport: parseFloat(exp),
          netEntropyDelta: parseFloat(net),
          bifurcationState: isFarFromEquilibrium
            ? "DISSIPATIVE STRUCTURE (MACROSCOPIC BÉNARD CELLS)"
            : "CONDUCTION REGIME (SUB-CRITICAL LINEAR)"
        });
      }

      // 5. Canvas Rendering: Thermal Heatmap, Bénard Streamlines & Radiative Margin Waves
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Render Margin Heat Radiators (Top & Bottom Negentropy Sinks)
          const marginAlpha = Math.min(0.85, (meanT - 20) / 55);
          ctx.fillStyle = `rgba(6, 182, 212, ${marginAlpha * 0.25})`;
          ctx.fillRect(0, 0, canvas.width, 24);
          ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

          // Shimmering Radiative Waves escaping to ambient space (Negentropy Export)
          if (marginAlpha > 0.08) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${marginAlpha * 0.55})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let wx = 0; wx < canvas.width; wx += 20) {
              const wy = 12 + Math.sin(time * 0.006 + wx * 0.05) * 5;
              if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();

            ctx.beginPath();
            for (let wx = 0; wx < canvas.width; wx += 20) {
              const wy = canvas.height - 12 + Math.sin(time * 0.006 + wx * 0.05 + Math.PI) * 5;
              if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
          }

          // Draw Bénard Convection Streamlines & Flow Particles if super-critical
          if (isFarFromEquilibrium) {
            cellCenters.forEach((cx, idx) => {
              const dir = cellDirections[idx];
              ctx.save();
              ctx.beginPath();
              ctx.arc(cx, 240, 75 + Math.sin(time * 0.003 + idx) * 8, 0, Math.PI * 2);
              ctx.strokeStyle = dir > 0 ? "rgba(249, 115, 22, 0.4)" : "rgba(6, 182, 212, 0.4)";
              ctx.lineWidth = 1.8;
              ctx.setLineDash([8, 6]);
              ctx.stroke();

              // Convective vortex center marker
              ctx.fillStyle = dir > 0 ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)";
              ctx.beginPath();
              ctx.arc(cx, 240, 4.5, 0, Math.PI * 2);
              ctx.fill();

              // Circulating Convective Flow Spark Particles
              for (let p = 0; p < 3; p++) {
                const angle = (time * 0.002 * dir) + (p * (Math.PI * 2 / 3));
                const px = cx + Math.cos(angle) * 75;
                const py = 240 + Math.sin(angle) * 75;
                ctx.fillStyle = dir > 0 ? "#fb923c" : "#38bdf8";
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            });
          }

          // Thermal Heatmap Aura around High-Temperature Words
          words.forEach((w) => {
            if (w.temp > 35) {
              const heatFrac = (w.temp - 35) / 65;
              const radius = 22 + heatFrac * 36;
              const grad = ctx.createRadialGradient(w.currX + 25, w.currY - 8, 2, w.currX + 25, w.currY - 8, radius);
              grad.addColorStop(0, `rgba(249, 115, 22, ${heatFrac * 0.45})`);
              grad.addColorStop(0.6, `rgba(239, 68, 68, ${heatFrac * 0.15})`);
              grad.addColorStop(1, "rgba(239, 68, 68, 0)");

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(w.currX + 25, w.currY - 8, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Heat Source Ripple Pulses
          heatSourcesRef.current.forEach((src) => {
            ctx.beginPath();
            ctx.arc(src.x, src.y, (1.0 - src.intensity) * 60, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(251, 146, 60, ${src.intensity * 0.75})`;
            ctx.lineWidth = 2.0;
            ctx.stroke();
          });
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoThermalPump, convectionStrength, criticalRa, dissipationRate, injectThermalFriction, thermalInputRate]);

  // Quench / Cool Document
  const handleQuench = () => {
    wordsRef.current.forEach((w) => {
      w.temp = 20;
      w.currX = w.baseX;
      w.currY = w.baseY;
      w.vx = 0;
      w.vy = 0;
    });
    heatSourcesRef.current = [];
  };

  // Thermal Shock (Inject Maximum Heat)
  const handleThermalShock = () => {
    wordsRef.current.forEach((w) => {
      w.temp = 85 + Math.random() * 15;
    });
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#07090e",
        color: "#e2e8f0",
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <header style={{ maxWidth: 1020, width: "100%", marginBottom: 16, borderBottom: "1px solid #1e293b", paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#f97316", fontWeight: 700, letterSpacing: 2 }}>
              DAY 017 · NON-EQUILIBRIUM THERMODYNAMICS · NOBEL 1977
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px 0", color: "#f8fafc", letterSpacing: -0.5 }}>
              Non-Equilibrium Dissipative Typography
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 740, lineHeight: 1.5 }}>
              Ilya Prigogine&apos;s Nobel-winning formulation of open dissipative systems: $dS = d_e S + d_i S$.
              Reading friction continuously injects thermal entropy ($d_i S &gt; 0$), while whitespace margins radiate heat outward ($d_e S &lt; 0$).
              Past the critical Rayleigh threshold ($Ra_c \approx 1708$), the linear text spontaneously bifurcates into macroscopic hexagonal
              B&eacute;nard convection cells, proving that order emerges out of chaos through continuous energy throughput.
            </p>
          </div>

          {/* Phase State Badge */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              textAlign: "right"
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>THERMODYNAMIC REGIME</div>
            <div
              style={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                color: telemetry.rayleighNumber >= criticalRa ? "#10b981" : "#38bdf8"
              }}
            >
              {telemetry.rayleighNumber >= criticalRa ? "BIFURCATED (DISSIPATIVE)" : "CONDUCTION (SUB-CRITICAL)"}
            </div>
          </div>
        </div>
      </header>

      {/* Control Console */}
      <div
        style={{
          maxWidth: 1020,
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "10px 16px",
          backgroundColor: "#0b0f19",
          borderRadius: 8,
          border: "1px solid #1e293b",
          boxSizing: "border-box"
        }}
      >
        {/* Buttons & Toggles */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setAutoThermalPump(!autoThermalPump)}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              border: "none",
              backgroundColor: autoThermalPump ? "#f97316" : "#334155",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {autoThermalPump ? "SACCADE PUMP ON" : "MANUAL FRICTION"}
          </button>
          <button
            onClick={handleThermalShock}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ef4444",
              backgroundColor: "#7f1d1d",
              color: "#fecaca",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            THERMAL SHOCK
          </button>
          <button
            onClick={handleQuench}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #0284c7",
              backgroundColor: "#0369a1",
              color: "#e0f2fe",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            QUENCH (COOL)
          </button>
        </div>

        {/* Sliders */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>Q_IN (HEAT):</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={thermalInputRate}
              onChange={(e) => setThermalInputRate(parseFloat(e.target.value))}
              style={{ width: 75, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#fb923c" }}>
              {thermalInputRate.toFixed(1)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>DISSIPATION (γ):</span>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.005"
              value={dissipationRate}
              onChange={(e) => setDissipationRate(parseFloat(e.target.value))}
              style={{ width: 75, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>
              {dissipationRate.toFixed(3)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>CRITICAL Ra:</span>
            <input
              type="range"
              min="800"
              max="2500"
              step="50"
              value={criticalRa}
              onChange={(e) => setCriticalRa(parseInt(e.target.value, 10))}
              style={{ width: 80, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#10b981" }}>
              {criticalRa}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Thermodynamic Stage Container */}
      <div
        style={{
          maxWidth: 1020,
          width: "100%",
          height: 480,
          borderRadius: 8,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#090c13",
          border: "1px solid #1e293b",
          boxShadow: "0 20px 40px rgba(0,0,0,0.8)"
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          injectThermalFriction(e.clientX - rect.left, e.clientY - rect.top, thermalInputRate);
        }}
      >
        {/* Canvas for Heatmap Glow & Convection Streamlines */}
        <canvas
          ref={canvasRef}
          width={1020}
          height={480}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}
        />

        {/* DOM Layer for Elastic Thermal Letterforms */}
        <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 2, pointerEvents: "auto" }}>
          {wordsRef.current.map((w) => {
            // Temperature scales font weight: 20C -> 100 (Hairline), 100C -> 900 (Ultra-Black)
            const tempFraction = Math.max(0, Math.min(1, (w.temp - 20) / 80));
            const fontWght = Math.round(100 + tempFraction * 800);
            const isSuperHeated = w.temp > 50;

            return (
              <span
                key={w.id}
                onPointerEnter={() => injectThermalFriction(w.currX + 30, w.currY, thermalInputRate * 2.0)}
                style={{
                  position: "absolute",
                  left: w.currX,
                  top: w.currY,
                  fontWeight: fontWght,
                  fontSize: `${17 + tempFraction * 7}px`,
                  color: isSuperHeated ? "#f97316" : tempFraction > 0.25 ? "#f8fafc" : "#94a3b8",
                  textShadow: isSuperHeated ? `0 0 14px rgba(249, 115, 22, ${tempFraction})` : "none",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "color 0.12s ease, text-shadow 0.12s ease",
                  letterSpacing: `${(1.0 - tempFraction) * 2}px`
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* Telemetry Dashboard */}
      <div
        style={{
          maxWidth: 1020,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginTop: 12
        }}
      >
        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>RAYLEIGH NUMBER (Ra)</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: telemetry.rayleighNumber >= criticalRa ? "#10b981" : "#38bdf8"
            }}
          >
            {telemetry.rayleighNumber}{" "}
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>
              {telemetry.rayleighNumber >= criticalRa ? "(SUPER-CRITICAL)" : "(SUB-CRITICAL)"}
            </span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>INTERNAL ENTROPY (d_i S / dt)</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f97316" }}>
            +{telemetry.entropyProduction} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>J/K·s (friction)</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>MARGIN RADIATION (d_e S / dt)</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#06b6d4" }}>
            -{telemetry.entropyExport} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>J/K·s (cooling)</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>MEAN TEMPERATURE &amp; NET dS</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: telemetry.netEntropyDelta <= 0 ? "#10b981" : "#ef4444"
            }}
          >
            {telemetry.meanTemp}&deg;C{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>
              [{telemetry.netEntropyDelta <= 0 ? "dS < 0 NEGENTROPY" : "dS > 0 DISSIPATING"}]
            </span>
          </div>
        </div>
      </div>

      {/* Philosophical Annotation */}
      <footer style={{ maxWidth: 1020, width: "100%", marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
          * AXIOM 17 VALIDATION: In classical isolated thermodynamics (Clausius, Boltzmann), entropy strictly increases toward thermal heat death.
          However, as Ilya Prigogine demonstrated in 1977, open systems exchange energy and matter with their surroundings (dS = d_e S + d_i S).
          When reading friction pumps entropy into digital typography, whitespace margins function as radiant thermal sinks (d_e S &lt; 0).
          Surpassing the critical Rayleigh threshold (Ra &gt; 1708) triggers a macroscopic bifurcation into hexagonal B&eacute;nard convection cells,
          proving that cognitive friction does not destroy typography—it forges living, self-organizing order out of chaos.
        </p>
      </footer>
    </div>
  );
}
