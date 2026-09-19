import React, { useState, useEffect, useRef, useCallback } from "react";

// Types
type PearsonRegime = "Labyrinth Stripes (Zebra)" | "Solitary Spots (Cheetah)" | "Mitotic Dividing Cells" | "Pulsating Waves" | "Stable Structural Font";

interface PresetMorph {
  name: string;
  F: number;
  k: number;
  description: string;
}

export default function TuringMorphogenesisTypography() {
  // Grid parameters
  const WIDTH = 180;
  const HEIGHT = 110;
  const CELL_SCALE = 6;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation Parameters (Gray-Scott System)
  const [Du, setDu] = useState<number>(0.2097);
  const [Dv, setDv] = useState<number>(0.105);
  const [feedRate, setFeedRate] = useState<number>(0.037);
  const [killRate, setKillRate] = useState<number>(0.06);
  const [stepsPerFrame, setStepsPerFrame] = useState<number>(8);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>("STRIPES");
  const [activeWordSeed, setActiveWordSeed] = useState<string>("TURING");
  const [colorScheme, setColorScheme] = useState<"biolum" | "emerald" | "amber" | "monochrome">("biolum");
  const [activeTool, setActiveTool] = useState<"activator" | "inhibitor" | "erase">("activator");
  const [brushSize, setBrushSize] = useState<number>(3);

  // Telemetry metrics
  const [generation, setGeneration] = useState<number>(0);
  const [meanActivator, setMeanActivator] = useState<number>(0);

  // 2D Array Buffers in Float32 for 60fps performance
  const uRef = useRef<Float32Array>(new Float32Array(WIDTH * HEIGHT));
  const vRef = useRef<Float32Array>(new Float32Array(WIDTH * HEIGHT));
  const nextURef = useRef<Float32Array>(new Float32Array(WIDTH * HEIGHT));
  const nextVRef = useRef<Float32Array>(new Float32Array(WIDTH * HEIGHT));
  const isPointerDownRef = useRef<boolean>(false);

  // Helper index
  const idx = (x: number, y: number): number => {
    const wx = (x + WIDTH) % WIDTH;
    const wy = (y + HEIGHT) % HEIGHT;
    return wy * WIDTH + wx;
  };

  // Pearson Parameter Presets
  const morphPresets: Record<string, PresetMorph> = {
    STRIPES: {
      name: "Labyrinth Stripes",
      F: 0.037,
      k: 0.06,
      description: "Zebra-like continuous labyrinthine corridors maintaining stem connectivity."
    },
    SPOTS: {
      name: "Solitary Spots",
      F: 0.03,
      k: 0.062,
      description: "Cheetah dappling: letterform strokes break down into self-organizing organic dot matrices."
    },
    MITOSIS: {
      name: "Mitotic Division",
      F: 0.026,
      k: 0.055,
      description: "Cellular mitosis: glyph stems autonomously split into dual self-replicating clones."
    },
    WAVES: {
      name: "Pulsating Waves",
      F: 0.018,
      k: 0.051,
      description: "Spiral chemical target waves propagating across typographic margins."
    },
    STABLE: {
      name: "Structural Font",
      F: 0.054,
      k: 0.063,
      description: "Sharp homeostatic equilibrium preserving classic Roman capital proportions."
    }
  };

  // Determine current Pearson Regime name
  const getRegimeName = (): PearsonRegime => {
    if (Math.abs(feedRate - 0.037) < 0.005 && Math.abs(killRate - 0.06) < 0.003) return "Labyrinth Stripes (Zebra)";
    if (Math.abs(feedRate - 0.03) < 0.006 && Math.abs(killRate - 0.062) < 0.004) return "Solitary Spots (Cheetah)";
    if (Math.abs(feedRate - 0.026) < 0.005 && Math.abs(killRate - 0.055) < 0.003) return "Mitotic Dividing Cells";
    if (feedRate < 0.022) return "Pulsating Waves";
    return "Stable Structural Font";
  };

  // Seed Glyph Letterforms into Activator Buffer V
  const seedTypography = useCallback((word: string) => {
    const u = uRef.current;
    const v = vRef.current;

    // Fill U = 1.0 (substrate abundant), V = 0.0 (no activator)
    u.fill(1.0);
    v.fill(0.0);

    // Create an offscreen canvas to render text into a clean binary mask
    const offscreen = document.createElement("canvas");
    offscreen.width = WIDTH;
    offscreen.height = HEIGHT;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 34px 'Inter', sans-serif";
      ctx.fillText(word, WIDTH / 2, HEIGHT / 2);

      const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const data = imgData.data;

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const pixelIndex = (y * WIDTH + x) * 4;
          const brightness = data[pixelIndex] / 255;

          if (brightness > 0.4) {
            const i = idx(x, y);
            // Inoculate activator V
            v[i] = 0.75 + Math.random() * 0.15;
            u[i] = 0.35 + Math.random() * 0.1;
          }
        }
      }
    }

    setGeneration(0);
    setActiveWordSeed(word);
  }, []);

  // Initialize on mount
  useEffect(() => {
    seedTypography("TURING");
  }, [seedTypography]);

  // Apply Preset
  const handleApplyPreset = (key: string) => {
    const p = morphPresets[key];
    if (p) {
      setFeedRate(p.F);
      setKillRate(p.k);
      setActivePreset(key);
    }
  };

  // Gray-Scott Simulation Step
  const stepSimulation = useCallback(() => {
    const u = uRef.current;
    const v = vRef.current;
    const nextU = nextURef.current;
    const nextV = nextVRef.current;

    const F = feedRate;
    const k = killRate;
    const dt = 1.0;

    let totalV = 0;

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const i = idx(x, y);

        const uVal = u[i];
        const vVal = v[i];

        // 9-Point Discrete Laplacian
        // Weights: Center: -1.0, Orthogonal: 0.20, Diagonal: 0.05
        const lapU =
          0.2 * (u[idx(x + 1, y)] + u[idx(x - 1, y)] + u[idx(x, y + 1)] + u[idx(x, y - 1)]) +
          0.05 * (u[idx(x + 1, y + 1)] + u[idx(x - 1, y + 1)] + u[idx(x + 1, y - 1)] + u[idx(x - 1, y - 1)]) -
          uVal;

        const lapV =
          0.2 * (v[idx(x + 1, y)] + v[idx(x - 1, y)] + v[idx(x, y + 1)] + v[idx(x, y - 1)]) +
          0.05 * (v[idx(x + 1, y + 1)] + v[idx(x - 1, y + 1)] + v[idx(x + 1, y - 1)] + v[idx(x - 1, y - 1)]) -
          vVal;

        // Non-linear reaction term: uv^2
        const reaction = uVal * vVal * vVal;

        // Gray-Scott Partial Differential Equations
        const du = Du * lapU - reaction + F * (1.0 - uVal);
        const dv = Dv * lapV + reaction - (F + k) * vVal;

        const updatedU = Math.min(1.0, Math.max(0.0, uVal + du * dt));
        const updatedV = Math.min(1.0, Math.max(0.0, vVal + dv * dt));

        nextU[i] = updatedU;
        nextV[i] = updatedV;

        totalV += updatedV;
      }
    }

    // Swap buffers
    uRef.current.set(nextU);
    vRef.current.set(nextV);

    setGeneration((g) => g + 1);
    setMeanActivator(totalV / (WIDTH * HEIGHT));
  }, [Du, Dv, feedRate, killRate]);

  // Simulation execution loop
  useEffect(() => {
    if (!isRunning) return;

    let frameId: number;
    const loop = () => {
      for (let s = 0; s < stepsPerFrame; s++) {
        stepSimulation();
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, stepsPerFrame, stepSimulation]);

  // Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const v = vRef.current;
      const u = uRef.current;

      const imgData = ctx.createImageData(WIDTH, HEIGHT);
      const data = imgData.data;

      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const vVal = v[i];
        const uVal = u[i];
        const pIndex = i * 4;

        if (colorScheme === "biolum") {
          // Deep slate background, neon cyan-magenta morphogen
          // Substrate U maps to deep navy; Activator V maps to bright magenta/cyan
          const r = Math.floor(vVal * 255 * 1.2);
          const g = Math.floor((1.0 - uVal) * 200);
          const b = Math.floor(vVal * 240 + (1.0 - uVal) * 60);

          data[pIndex] = r > 255 ? 255 : r;
          data[pIndex + 1] = g > 255 ? 255 : g;
          data[pIndex + 2] = b > 255 ? 255 : b;
          data[pIndex + 3] = 255;
        } else if (colorScheme === "emerald") {
          // Phosphor emerald & mint
          const val = Math.floor(vVal * 255);
          data[pIndex] = Math.floor(val * 0.1);
          data[pIndex + 1] = val;
          data[pIndex + 2] = Math.floor(val * 0.6);
          data[pIndex + 3] = 255;
        } else if (colorScheme === "amber") {
          // Golden solar amber & obsidian
          const val = Math.floor(vVal * 255);
          data[pIndex] = val;
          data[pIndex + 1] = Math.floor(val * 0.65);
          data[pIndex + 2] = Math.floor(val * 0.1);
          data[pIndex + 3] = 255;
        } else {
          // Monochrome high-contrast print ink
          const val = vVal > 0.3 ? 245 : 10;
          data[pIndex] = val;
          data[pIndex + 1] = val;
          data[pIndex + 2] = val;
          data[pIndex + 3] = 255;
        }
      }

      // Draw image to canvas scaled
      // We render offscreen first or scale using drawImage
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = WIDTH;
      tempCanvas.height = HEIGHT;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.putImageData(imgData, 0, 0);

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [colorScheme]);

  // Pointer Interaction: Inoculate or Inhibit Chemical
  const handlePointerAction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / canvas.width) * WIDTH);
    const y = Math.floor(((clientY - rect.top) / canvas.height) * HEIGHT);

    const u = uRef.current;
    const v = vRef.current;

    for (let dy = -brushSize; dy <= brushSize; dy++) {
      for (let dx = -brushSize; dx <= brushSize; dx++) {
        if (dx * dx + dy * dy <= brushSize * brushSize) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
            const i = idx(px, py);
            if (activeTool === "activator") {
              v[i] = 0.85;
              u[i] = 0.2;
            } else if (activeTool === "inhibitor") {
              v[i] = 0.0;
              u[i] = 1.0;
            } else {
              v[i] = 0.0;
              u[i] = 0.5;
            }
          }
        }
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    handlePointerAction(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPointerDownRef.current) {
      handlePointerAction(e.clientX, e.clientY);
    }
  };

  const onPointerUp = () => {
    isPointerDownRef.current = false;
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
      {/* Editorial Header */}
      <header style={{ maxWidth: 1100, width: "100%", marginBottom: 16, borderBottom: "1px solid #1e293b", paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#06b6d4", fontWeight: 700, letterSpacing: 2 }}>
              DAY 015 · BIOCHEMICAL MORPHOGENESIS
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px 0", color: "#f8fafc", letterSpacing: -0.5 }}>
              Turing Morphogenesis &amp; Reaction-Diffusion Typography
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 700, lineHeight: 1.5 }}>
              Alan Turing&apos;s 1952 non-linear chemical reaction-diffusion equations operating on typographic letterforms.
              Inoculated glyphs navigate Pearson parameter space (F, k), organically transforming between stable bone skeletons,
              zebra labyrinth corridors, and mitotic self-replicating cells.
            </p>
          </div>

          {/* Regime Telemetry Badge */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              textAlign: "right"
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>PEARSON REGIME</div>
            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "#06b6d4" }}>
              {getRegimeName()}
            </div>
          </div>
        </div>
      </header>

      {/* Control Console */}
      <div
        style={{
          maxWidth: 1100,
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
        {/* Playback Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              border: "none",
              backgroundColor: isRunning ? "#f43f5e" : "#06b6d4",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {isRunning ? "PAUSE" : "DIFFUSE"}
          </button>
          <button
            onClick={stepSimulation}
            disabled={isRunning}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #334155",
              backgroundColor: "#1e293b",
              color: isRunning ? "#64748b" : "#f1f5f9",
              fontSize: 12,
              cursor: isRunning ? "not-allowed" : "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            STEP +1
          </button>
          <button
            onClick={() => seedTypography(activeWordSeed)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #334155",
              backgroundColor: "#1e293b",
              color: "#f1f5f9",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            RE-SEED
          </button>
        </div>

        {/* Word Seed Buttons */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>SEEDS:</span>
          {["TURING", "MORPH", "ZEBRA", "SKIN"].map((word) => (
            <button
              key={word}
              onClick={() => seedTypography(word)}
              style={{
                padding: "5px 10px",
                borderRadius: 4,
                border: activeWordSeed === word ? "1px solid #06b6d4" : "1px solid #1e293b",
                backgroundColor: activeWordSeed === word ? "#083344" : "#0f172a",
                color: activeWordSeed === word ? "#67e8f9" : "#94a3b8",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: activeWordSeed === word ? 700 : 400,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Morph Presets */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>REGIMES:</span>
          {Object.keys(morphPresets).map((key) => (
            <button
              key={key}
              onClick={() => handleApplyPreset(key)}
              style={{
                padding: "5px 9px",
                borderRadius: 4,
                border: activePreset === key ? "1px solid #a855f7" : "1px solid #1e293b",
                backgroundColor: activePreset === key ? "#581c87" : "#0f172a",
                color: activePreset === key ? "#d8b4fe" : "#94a3b8",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Tool Selector */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>PIPETER:</span>
          <button
            onClick={() => setActiveTool("activator")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: activeTool === "activator" ? "1px solid #ec4899" : "1px solid #1e293b",
              backgroundColor: activeTool === "activator" ? "#831843" : "#0f172a",
              color: activeTool === "activator" ? "#fbcfe8" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            +ACTIVATOR (V)
          </button>
          <button
            onClick={() => setActiveTool("inhibitor")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: activeTool === "inhibitor" ? "1px solid #38bdf8" : "1px solid #1e293b",
              backgroundColor: activeTool === "inhibitor" ? "#0c4a6e" : "#0f172a",
              color: activeTool === "inhibitor" ? "#bae6fd" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            +INHIBITOR (U)
          </button>
        </div>
      </div>

      {/* Parameter Sliders Bar */}
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 12,
          padding: "12px 16px",
          backgroundColor: "#0b0f19",
          borderRadius: 8,
          border: "1px solid #1e293b",
          boxSizing: "border-box"
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>
            <span>FEED RATE (F)</span>
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>{feedRate.toFixed(4)}</span>
          </div>
          <input
            type="range"
            min="0.010"
            max="0.080"
            step="0.001"
            value={feedRate}
            onChange={(e) => setFeedRate(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>
            <span>KILL RATE (k)</span>
            <span style={{ color: "#ec4899", fontWeight: 700 }}>{killRate.toFixed(4)}</span>
          </div>
          <input
            type="range"
            min="0.040"
            max="0.070"
            step="0.001"
            value={killRate}
            onChange={(e) => setKillRate(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>
            <span>DIFFUSION SPEED (STEPS/FRAME)</span>
            <span style={{ color: "#10b981", fontWeight: 700 }}>{stepsPerFrame}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="16"
            step="1"
            value={stepsPerFrame}
            onChange={(e) => setStepsPerFrame(parseInt(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>
            <span>SPECTRAL PALETTE</span>
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{colorScheme.toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {(["biolum", "emerald", "amber", "monochrome"] as const).map((scheme) => (
              <button
                key={scheme}
                onClick={() => setColorScheme(scheme)}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  fontSize: 9,
                  borderRadius: 3,
                  border: colorScheme === scheme ? "1px solid #f59e0b" : "1px solid #334155",
                  backgroundColor: colorScheme === scheme ? "#78350f" : "#1e293b",
                  color: colorScheme === scheme ? "#fef3c7" : "#94a3b8",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {scheme.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #1e293b",
          boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
          position: "relative"
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH * CELL_SCALE}
          height={HEIGHT * CELL_SCALE}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            cursor: activeTool === "activator" ? "crosshair" : "cell",
            display: "block",
            touchAction: "none"
          }}
        />
      </div>

      {/* Telemetry Bar */}
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 12
        }}
      >
        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>DIFFUSION ITERATION</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f8fafc" }}>
            T = {generation}
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>ACTIVATOR DENSITY (V̄)</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#ec4899" }}>
            {(meanActivator * 100).toFixed(2)}% <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>saturation</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>DIFFUSION COEFFICIENTS</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>
            Du/Dv = {(Du / Dv).toFixed(2)} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>(2:1 ratio)</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>TURING WAVELENGTH (λ_T)</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#10b981" }}>
            ≈ {(2 * Math.PI * Math.sqrt((Du * Dv) / (feedRate * killRate))).toFixed(1)} px
          </div>
        </div>
      </div>

      {/* Philosophical Annotation */}
      <footer style={{ maxWidth: 1100, width: "100%", marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
          * AXIOM 15 VALIDATION: Static Bézier vectors treat typography as an inert monument. When seeded into Gray-Scott non-linear reaction-diffusion kinetics,
          letterforms operate as self-organizing biochemical membranes. Short-range activation preserves structural glyph cores, while long-range inhibition sculpts
          Turing zebra-stripes and cheetah-spots along typographic boundaries, proving that living language is an organic morphogenetic equilibrium.
        </p>
      </footer>
    </div>
  );
}
