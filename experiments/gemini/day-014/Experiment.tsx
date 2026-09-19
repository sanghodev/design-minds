import React, { useState, useEffect, useRef, useCallback } from "react";

// Types
type ComplexClass = "Class I (Extinct)" | "Class II (Crystalline)" | "Class IV (Edge of Chaos)" | "Class III (Chaotic Noise)";

interface PresetPattern {
  name: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  cells: [number, number][];
}

export default function CellularAutomataTypography() {
  // Canvas & Simulation dimensions
  const GRID_COLS = 120;
  const GRID_ROWS = 70;
  const CELL_SIZE = 9;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [generation, setGeneration] = useState<number>(0);
  const [population, setPopulation] = useState<number>(0);
  const [speedMs, setSpeedMs] = useState<number>(40);
  const [lambdaMode, setLambdaMode] = useState<"standard" | "crystal" | "chaotic" | "extinct">("standard");
  const [activeTool, setActiveTool] = useState<"pen" | "eraser" | "glider">("pen");
  const [activePreset, setActivePreset] = useState<string>("LIFE");
  const [heatTrail, setHeatTrail] = useState<boolean>(true);

  // Grids held in refs for 60fps canvas performance
  const gridRef = useRef<Uint8Array>(new Uint8Array(GRID_COLS * GRID_ROWS));
  const nextGridRef = useRef<Uint8Array>(new Uint8Array(GRID_COLS * GRID_ROWS));
  const trailRef = useRef<Float32Array>(new Float32Array(GRID_COLS * GRID_ROWS));
  const isMouseDownRef = useRef<boolean>(false);

  // Shannon entropy calculation
  const p = population / (GRID_COLS * GRID_ROWS);
  const entropy = p > 0 && p < 1 ? (-p * Math.log2(p) - (1 - p) * Math.log2(1 - p)).toFixed(4) : "0.0000";

  const getComplexityClass = (): ComplexClass => {
    if (lambdaMode === "extinct" || population === 0) return "Class I (Extinct)";
    if (lambdaMode === "crystal") return "Class II (Crystalline)";
    if (lambdaMode === "chaotic") return "Class III (Chaotic Noise)";
    return "Class IV (Edge of Chaos)";
  };

  // Helper: index mapping
  const idx = (x: number, y: number): number => {
    const wx = (x + GRID_COLS) % GRID_COLS;
    const wy = (y + GRID_ROWS) % GRID_ROWS;
    return wy * GRID_COLS + wx;
  };

  // Preset Bitmaps (Letterforms & Classical Syntactic Structures)
  const presets: Record<string, PresetPattern> = {
    LIFE: {
      name: "LIFE (Typographic Emergence)",
      description: "Dense typographic glyphs 'LIFE' configured as cellular seeds that calve gliders.",
      gridWidth: GRID_COLS,
      gridHeight: GRID_ROWS,
      cells: [
        // L
        [20, 25], [20, 26], [20, 27], [20, 28], [20, 29], [20, 30], [20, 31], [20, 32], [20, 33], [20, 34],
        [21, 34], [22, 34], [23, 34], [24, 34], [25, 34], [26, 34],
        // I
        [32, 25], [33, 25], [34, 25], [35, 25], [36, 25],
        [34, 26], [34, 27], [34, 28], [34, 29], [34, 30], [34, 31], [34, 32], [34, 33],
        [32, 34], [33, 34], [34, 34], [35, 34], [36, 34],
        // F
        [43, 25], [43, 26], [43, 27], [43, 28], [43, 29], [43, 30], [43, 31], [43, 32], [43, 33], [43, 34],
        [44, 25], [45, 25], [46, 25], [47, 25], [48, 25], [49, 25],
        [44, 29], [45, 29], [46, 29], [47, 29],
        // E
        [56, 25], [56, 26], [56, 27], [56, 28], [56, 29], [56, 30], [56, 31], [56, 32], [56, 33], [56, 34],
        [57, 25], [58, 25], [59, 25], [60, 25], [61, 25], [62, 25],
        [57, 29], [58, 29], [59, 29], [60, 29],
        [57, 34], [58, 34], [59, 34], [60, 34], [61, 34], [62, 34],
        // Glider escort
        [10, 10], [11, 10], [12, 10], [12, 9], [11, 8]
      ]
    },
    GOSPER: {
      name: "Gosper Glider Gun",
      description: "Deterministic cellular engine firing infinite streams of gliders into typographic targets.",
      gridWidth: GRID_COLS,
      gridHeight: GRID_ROWS,
      cells: [
        // Left Square
        [5, 25], [5, 26], [6, 25], [6, 26],
        // Left Part
        [15, 25], [15, 26], [15, 27], [16, 24], [16, 28], [17, 23], [17, 29], [18, 23], [18, 29],
        [19, 26], [20, 24], [20, 28], [21, 25], [21, 26], [21, 27], [22, 26],
        // Right Part
        [25, 23], [25, 24], [25, 25], [26, 23], [26, 24], [26, 25], [27, 22], [27, 26],
        [29, 21], [29, 22], [29, 26], [29, 27],
        // Far Right Square
        [39, 23], [39, 24], [40, 23], [40, 24],
        // Target Typographic Wall "T"
        [80, 15], [81, 15], [82, 15], [83, 15], [84, 15], [85, 15], [86, 15], [87, 15],
        [83, 16], [83, 17], [83, 18], [83, 19], [83, 20], [83, 21], [83, 22], [83, 23], [83, 24], [83, 25]
      ]
    },
    PULSAR: {
      name: "Pulsar Clocks & Oscillators",
      description: "Period-3 harmonic clocks generating syntactic rhythm across margins.",
      gridWidth: GRID_COLS,
      gridHeight: GRID_ROWS,
      cells: [
        // Pulsar Center at (40, 35)
        [38, 30], [39, 30], [40, 30], [44, 30], [45, 30], [46, 30],
        [36, 32], [41, 32], [43, 32], [48, 32],
        [36, 33], [41, 33], [43, 33], [48, 33],
        [36, 34], [41, 34], [43, 34], [48, 34],
        [38, 35], [39, 35], [40, 35], [44, 35], [45, 35], [46, 35],
        [38, 37], [39, 37], [40, 37], [44, 37], [45, 37], [46, 37],
        [36, 38], [41, 38], [43, 38], [48, 38],
        [36, 39], [41, 39], [43, 39], [48, 39],
        [36, 40], [41, 40], [43, 40], [48, 40],
        [38, 42], [39, 42], [40, 42], [44, 42], [45, 42], [46, 42],
        // Second Pulsar at (80, 35)
        [78, 30], [79, 30], [80, 30], [84, 30], [85, 30], [86, 30],
        [76, 32], [81, 32], [83, 32], [88, 32],
        [76, 33], [81, 33], [83, 33], [88, 33],
        [76, 34], [81, 34], [83, 34], [88, 34],
        [78, 35], [79, 35], [80, 35], [84, 35], [85, 35], [86, 35],
        [78, 37], [79, 37], [80, 37], [84, 37], [85, 37], [86, 37],
        [76, 38], [81, 38], [83, 38], [88, 38],
        [76, 39], [81, 39], [83, 39], [88, 39],
        [76, 40], [81, 40], [83, 40], [88, 40],
        [78, 42], [79, 42], [80, 42], [84, 42], [85, 42], [86, 42]
      ]
    },
    GLIDER_CONVERGENCE: {
      name: "Glider Collision Synthesis",
      description: "Four gliders flying from four corners to collide at origin and synthesize new morphology.",
      gridWidth: GRID_COLS,
      gridHeight: GRID_ROWS,
      cells: [
        // Glider NW -> SE
        [30, 15], [31, 15], [32, 15], [32, 14], [31, 13],
        // Glider NE -> SW
        [90, 15], [89, 15], [88, 15], [88, 14], [89, 13],
        // Glider SW -> NE
        [30, 55], [31, 55], [32, 55], [32, 56], [31, 57],
        // Glider SE -> NW
        [90, 55], [89, 55], [88, 55], [88, 56], [89, 57]
      ]
    }
  };

  // Load Preset
  const loadPreset = useCallback((presetKey: string) => {
    const grid = gridRef.current;
    grid.fill(0);
    trailRef.current.fill(0);
    const pattern = presets[presetKey];
    if (pattern) {
      pattern.cells.forEach(([x, y]) => {
        if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
          grid[idx(x, y)] = 1;
        }
      });
    }
    setActivePreset(presetKey);
    setGeneration(0);
    countPopulation();
  }, []);

  const countPopulation = () => {
    let count = 0;
    const grid = gridRef.current;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === 1) count++;
    }
    setPopulation(count);
  };

  // Initialize
  useEffect(() => {
    loadPreset("LIFE");
  }, [loadPreset]);

  // Simulation Step Function
  const stepSimulation = useCallback(() => {
    const grid = gridRef.current;
    const nextGrid = nextGridRef.current;
    const trail = trailRef.current;
    let aliveCount = 0;

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const i = idx(x, y);

        // Moore Neighborhood count (8 neighbors)
        const neighbors =
          grid[idx(x - 1, y - 1)] +
          grid[idx(x, y - 1)] +
          grid[idx(x + 1, y - 1)] +
          grid[idx(x - 1, y)] +
          grid[idx(x + 1, y)] +
          grid[idx(x - 1, y + 1)] +
          grid[idx(x, y + 1)] +
          grid[idx(x + 1, y + 1)];

        const state = grid[i];
        let nextState = 0;

        // Transition Rules governed by Lambda Regime
        if (lambdaMode === "standard") {
          // B3/S23 (Conway Standard - Class IV)
          if (state === 1) {
            nextState = neighbors === 2 || neighbors === 3 ? 1 : 0;
          } else {
            nextState = neighbors === 3 ? 1 : 0;
          }
        } else if (lambdaMode === "crystal") {
          // B2/S234 (Class II - Highly dense crystal freezing)
          if (state === 1) {
            nextState = neighbors >= 2 && neighbors <= 4 ? 1 : 0;
          } else {
            nextState = neighbors === 2 || neighbors === 3 ? 1 : 0;
          }
        } else if (lambdaMode === "chaotic") {
          // B35678/S5678 (Class III - High-entropy explosion)
          if (state === 1) {
            nextState = neighbors >= 4 ? 1 : 0;
          } else {
            nextState = neighbors === 3 || neighbors === 6 || neighbors === 7 ? 1 : 0;
          }
        } else if (lambdaMode === "extinct") {
          // Class I - Extreme subcritical decay
          if (state === 1) {
            nextState = neighbors === 3 ? 1 : 0;
          } else {
            nextState = 0;
          }
        }

        nextGrid[i] = nextState;
        if (nextState === 1) {
          aliveCount++;
          trail[i] = 1.0; // Max heat
        } else {
          trail[i] = Math.max(0, trail[i] - 0.05); // Phosphor decay
        }
      }
    }

    // Swap buffers
    gridRef.current.set(nextGrid);
    setGeneration((g) => g + 1);
    setPopulation(aliveCount);
  }, [lambdaMode]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      stepSimulation();
    }, speedMs);
    return () => clearInterval(interval);
  }, [isRunning, speedMs, stepSimulation]);

  // Canvas Render Loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const grid = gridRef.current;
      const trail = trailRef.current;

      // Dark background
      ctx.fillStyle = "#090c13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid lines
      ctx.strokeStyle = "#131b2b";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= GRID_COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, GRID_ROWS * CELL_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= GRID_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(GRID_COLS * CELL_SIZE, y * CELL_SIZE);
        ctx.stroke();
      }

      // Draw Cells
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          const i = idx(x, y);
          const alive = grid[i] === 1;
          const heat = trail[i];

          const cx = x * CELL_SIZE;
          const cy = y * CELL_SIZE;

          if (alive) {
            // Active living cell
            if (lambdaMode === "standard") {
              ctx.fillStyle = "#10b981"; // Emerald
              ctx.shadowColor = "#34d399";
              ctx.shadowBlur = 4;
            } else if (lambdaMode === "crystal") {
              ctx.fillStyle = "#38bdf8"; // Cyan
              ctx.shadowColor = "#0ea5e9";
              ctx.shadowBlur = 3;
            } else if (lambdaMode === "chaotic") {
              ctx.fillStyle = "#f43f5e"; // Rose
              ctx.shadowColor = "#fb7185";
              ctx.shadowBlur = 5;
            } else {
              ctx.fillStyle = "#94a3b8"; // Slate
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(cx + 1, cy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.shadowBlur = 0; // Reset
          } else if (heatTrail && heat > 0.05) {
            // Phosphor decay trail
            ctx.fillStyle = `rgba(16, 185, 129, ${heat * 0.28})`;
            ctx.fillRect(cx + 1.5, cy + 1.5, CELL_SIZE - 3, CELL_SIZE - 3);
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [heatTrail, lambdaMode]);

  // Pointer Interaction
  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
      const grid = gridRef.current;

      if (activeTool === "pen") {
        grid[idx(x, y)] = 1;
      } else if (activeTool === "eraser") {
        grid[idx(x, y)] = 0;
      } else if (activeTool === "glider") {
        // Stamp a glider pointing SE
        grid[idx(x, y)] = 0;
        grid[idx(x + 1, y)] = 1;
        grid[idx(x + 2, y)] = 0;
        grid[idx(x, y + 1)] = 0;
        grid[idx(x + 1, y + 1)] = 0;
        grid[idx(x + 2, y + 1)] = 1;
        grid[idx(x, y + 2)] = 1;
        grid[idx(x + 1, y + 2)] = 1;
        grid[idx(x + 2, y + 2)] = 1;
      }
      countPopulation();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    handlePointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isMouseDownRef.current) {
      handlePointer(e);
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
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
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#10b981", fontWeight: 700, letterSpacing: 2 }}>
              DAY 014 · EMERGENT COMPLEX SYSTEMS
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px 0", color: "#f8fafc", letterSpacing: -0.5 }}>
              Cellular Automata &amp; Emergent Typographic Ecosystems
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 680, lineHeight: 1.5 }}>
              John Conway&apos;s Game of Life (B3/S23) operating as an active linguistic metabolism. Typographic glyphs act as Class IV cellular seeds
              balancing on the computational Edge of Chaos (Langton λ ≈ 0.273), calving directional gliders that transmit syntactic state transitions across empty layout margins.
            </p>
          </div>

          {/* Regime Badge */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              textAlign: "right"
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>COMPUTATIONAL REGIME</div>
            <div
              style={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                color: lambdaMode === "standard" ? "#10b981" : lambdaMode === "crystal" ? "#38bdf8" : lambdaMode === "chaotic" ? "#f43f5e" : "#94a3b8"
              }}
            >
              {getComplexityClass()}
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
              backgroundColor: isRunning ? "#f43f5e" : "#10b981",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {isRunning ? "PAUSE" : "EXECUTE"}
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
            onClick={() => loadPreset(activePreset)}
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
            RESET
          </button>
        </div>

        {/* Preset Selectors */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>SEEDS:</span>
          {Object.keys(presets).map((key) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              style={{
                padding: "5px 10px",
                borderRadius: 4,
                border: activePreset === key ? "1px solid #10b981" : "1px solid #1e293b",
                backgroundColor: activePreset === key ? "#064e3b" : "#0f172a",
                color: activePreset === key ? "#34d399" : "#94a3b8",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: activePreset === key ? 700 : 400,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Langton Lambda Regime */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>LAMBDA (λ):</span>
          <button
            onClick={() => setLambdaMode("standard")}
            style={{
              padding: "5px 9px",
              borderRadius: 4,
              border: lambdaMode === "standard" ? "1px solid #10b981" : "1px solid #1e293b",
              backgroundColor: lambdaMode === "standard" ? "#064e3b" : "#0f172a",
              color: lambdaMode === "standard" ? "#34d399" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            EDGE (B3/S23)
          </button>
          <button
            onClick={() => setLambdaMode("crystal")}
            style={{
              padding: "5px 9px",
              borderRadius: 4,
              border: lambdaMode === "crystal" ? "1px solid #38bdf8" : "1px solid #1e293b",
              backgroundColor: lambdaMode === "crystal" ? "#0c4a6e" : "#0f172a",
              color: lambdaMode === "crystal" ? "#7dd3fc" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            CRYSTAL
          </button>
          <button
            onClick={() => setLambdaMode("chaotic")}
            style={{
              padding: "5px 9px",
              borderRadius: 4,
              border: lambdaMode === "chaotic" ? "1px solid #f43f5e" : "1px solid #1e293b",
              backgroundColor: lambdaMode === "chaotic" ? "#881337" : "#0f172a",
              color: lambdaMode === "chaotic" ? "#fda4af" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            NOISE
          </button>
        </div>

        {/* Brush Tool */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>TOOL:</span>
          <button
            onClick={() => setActiveTool("pen")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: activeTool === "pen" ? "1px solid #10b981" : "1px solid #1e293b",
              backgroundColor: activeTool === "pen" ? "#064e3b" : "#0f172a",
              color: activeTool === "pen" ? "#34d399" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            PEN
          </button>
          <button
            onClick={() => setActiveTool("eraser")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: activeTool === "eraser" ? "1px solid #f43f5e" : "1px solid #1e293b",
              backgroundColor: activeTool === "eraser" ? "#881337" : "#0f172a",
              color: activeTool === "eraser" ? "#fda4af" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            ERASE
          </button>
          <button
            onClick={() => setActiveTool("glider")}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: activeTool === "glider" ? "1px solid #f59e0b" : "1px solid #1e293b",
              backgroundColor: activeTool === "glider" ? "#78350f" : "#0f172a",
              color: activeTool === "glider" ? "#fde68a" : "#94a3b8",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            +GLIDER
          </button>
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
          width={GRID_COLS * CELL_SIZE}
          height={GRID_ROWS * CELL_SIZE}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            cursor: activeTool === "pen" ? "crosshair" : activeTool === "eraser" ? "not-allowed" : "cell",
            display: "block",
            touchAction: "none"
          }}
        />
      </div>

      {/* Telemetry Metrics Bar */}
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
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>TEMPORAL GENERATION</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f8fafc" }}>
            T = {generation}
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>ACTIVE POPULATION</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#10b981" }}>
            {population.toLocaleString()} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>cells</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>SHANNON ENTROPY (H)</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>
            {entropy} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>bits/cell</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>PHOSPHOR PERSISTENCE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="trailCheck"
              checked={heatTrail}
              onChange={(e) => setHeatTrail(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="trailCheck" style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
              Decay Heatmap
            </label>
          </div>
        </div>
      </div>

      {/* Philosophical Annotation */}
      <footer style={{ maxWidth: 1100, width: "100%", marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
          * AXIOM 14 VALIDATION: Visual language at rest is an artificial freeze-frame. When released into cellular automaton dynamics,
          text operates as an open thermodynamic system. Still Lifes (nouns) maintain semantic continuity, Oscillators (rhythm) sustain syntax,
          and Gliders (verbs) project momentum across space. True typography lives only at the Edge of Chaos.
        </p>
      </footer>
    </div>
  );
}
