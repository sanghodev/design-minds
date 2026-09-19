"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface WordNode {
  id: number;
  text: string;
  x: number; // baseline resting position
  y: number;
  currX: number;
  currY: number;
  activation: number; // current neural firing [0..1]
  accumulatedFiring: number;
  lastFiredTime: number;
}

interface Synapse {
  i: number;
  j: number;
  weight: number; // [0..1]
}

export default function HebbianTypographyConnectome() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial Editorial Passage (Donald Hebb's Postulate on Neuroplasticity)
  const initialWords = [
    "When", "an", "axon", "of", "cell", "A",
    "is", "near", "enough", "to", "excite", "cell", "B",
    "and", "repeatedly", "or", "persistently", "takes", "part", "in", "firing", "it,",
    "some", "growth", "process", "or", "metabolic", "change",
    "takes", "place", "in", "one", "or", "both", "cells",
    "such", "that", "A's", "efficiency,", "as", "one", "of", "the", "cells", "firing", "B,",
    "is", "increased.", "Neurons", "that", "fire", "together,", "wire", "together."
  ];

  // System Parameters
  const [learningRate, setLearningRate] = useState<number>(0.15);
  const [decayRate, setDecayRate] = useState<number>(0.003);
  const [autoSaccade, setAutoSaccade] = useState<boolean>(true);
  const [lastFixation, setLastFixation] = useState<number>(-1);
  const [springTension, setSpringTension] = useState<number>(0.04);
  const [telemetry, setTelemetry] = useState({
    activeSynapses: 0,
    meanWeight: 0,
    meanFontWght: 400,
    saccadeCount: 0
  });

  // Nodes & Synaptic Matrix held in refs for 60fps physics
  const nodesRef = useRef<WordNode[]>([]);
  const synapsesRef = useRef<Map<string, Synapse>>(new Map());
  const saccadeTimerRef = useRef<number>(0);
  const saccadeIndexRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Helper key
  const synKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  // Initialize Word Layout Positions
  useEffect(() => {
    const nodes: WordNode[] = [];
    const containerWidth = 900;
    let curX = 40;
    let curY = 60;
    const lineHeight = 54;

    initialWords.forEach((word, index) => {
      const approxWidth = word.length * 14 + 18;
      if (curX + approxWidth > containerWidth - 40) {
        curX = 40;
        curY += lineHeight;
      }

      nodes.push({
        id: index,
        text: word,
        x: curX,
        y: curY,
        currX: curX,
        currY: curY,
        activation: 0,
        accumulatedFiring: 0.1,
        lastFiredTime: 0
      });

      curX += approxWidth;
    });

    nodesRef.current = nodes;
  }, []);

  // Activate Word Node & Trigger STDP Potentiation
  const triggerFixation = useCallback(
    (nodeId: number, timestamp: number) => {
      const nodes = nodesRef.current;
      const synapses = synapsesRef.current;
      const target = nodes[nodeId];
      if (!target) return;

      target.activation = 1.0;
      target.accumulatedFiring = Math.min(1.0, target.accumulatedFiring + 0.15);
      target.lastFiredTime = timestamp;

      // Check temporal co-activation with previous fixation
      if (lastFixation >= 0 && lastFixation !== nodeId) {
        const prev = nodes[lastFixation];
        const dt = timestamp - prev.lastFiredTime;

        // Asymmetric STDP Learning Window (dt in ms)
        // If dt < 450ms, strong Potentiation
        if (dt < 450) {
          const key = synKey(lastFixation, nodeId);
          const currentSyn = synapses.get(key) || { i: lastFixation, j: nodeId, weight: 0.05 };

          // Hebbian Increment: dw = eta * x_i * x_j
          const dw = learningRate * (1.0 - currentSyn.weight);
          currentSyn.weight = Math.min(1.0, currentSyn.weight + dw);
          synapses.set(key, currentSyn);
        }
      }

      setLastFixation(nodeId);
    },
    [lastFixation, learningRate]
  );

  // Saccade & Physics Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      const nodes = nodesRef.current;
      const synapses = synapsesRef.current;

      // 1. Auto-Saccade Engine (Simulating Human Eye Fixations)
      if (autoSaccade) {
        saccadeTimerRef.current += dt;
        if (saccadeTimerRef.current > 280) {
          // 280ms average human reading fixation duration
          saccadeTimerRef.current = 0;

          // 85% forward reading saccade, 15% regressive rereading jump
          let nextIdx: number;
          if (Math.random() < 0.85) {
            nextIdx = (saccadeIndexRef.current + 1) % nodes.length;
          } else {
            // Regressive jump backwards 2 to 4 words
            nextIdx = Math.max(0, saccadeIndexRef.current - Math.floor(Math.random() * 3 + 1));
          }

          saccadeIndexRef.current = nextIdx;
          triggerFixation(nextIdx, time);

          setTelemetry((prev) => ({ ...prev, saccadeCount: prev.saccadeCount + 1 }));
        }
      }

      // 2. Synaptic Decay (Oja / Forgetting factor)
      let totalWeight = 0;
      let activeCount = 0;

      synapses.forEach((syn, key) => {
        syn.weight = Math.max(0.01, syn.weight - decayRate * 0.05);
        if (syn.weight > 0.05) {
          activeCount++;
          totalWeight += syn.weight;
        }
        if (syn.weight <= 0.01) {
          synapses.delete(key);
        }
      });

      // 3. Node Physics: Spring Contraction along Synaptic Bonds
      nodes.forEach((node) => {
        // Activation decay
        node.activation = Math.max(0, node.activation - 0.02);
        node.accumulatedFiring = Math.max(0.05, node.accumulatedFiring - 0.0003);

        // Spring pull towards resting home position
        let fx = (node.x - node.currX) * 0.05;
        let fy = (node.y - node.currY) * 0.05;

        // Attracted towards strongly connected synaptic partners
        synapses.forEach((syn) => {
          if (syn.i === node.id || syn.j === node.id) {
            const partnerId = syn.i === node.id ? syn.j : syn.i;
            const partner = nodes[partnerId];
            if (partner && syn.weight > 0.15) {
              const dx = partner.currX - node.currX;
              const dy = partner.currY - node.currY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > 10) {
                const pull = syn.weight * springTension;
                fx += (dx / dist) * pull * 4;
                fy += (dy / dist) * pull * 4;
              }
            }
          }
        });

        node.currX += fx;
        node.currY += fy;
      });

      // 4. Telemetry Update (throttled)
      if (Math.random() < 0.08) {
        let totalWght = 0;
        nodes.forEach((n) => {
          totalWght += 100 + n.accumulatedFiring * 800;
        });

        setTelemetry((prev) => ({
          ...prev,
          activeSynapses: activeCount,
          meanWeight: activeCount > 0 ? totalWeight / activeCount : 0,
          meanFontWght: Math.round(totalWght / (nodes.length || 1))
        }));
      }

            // 5. Render Canvas Synapses & Biological Saccade Vectors
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw Saccadic Trajectory Vector if active
          if (lastFixation >= 0 && nodes[lastFixation]) {
            const fixNode = nodes[lastFixation];
            const fx = fixNode.currX + 32;
            const fy = fixNode.currY - 8;

            // Foveal Fixation Reticle
            ctx.beginPath();
            ctx.arc(fx, fy, 16 + Math.sin(time * 0.008) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Crosshair ticks
            ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
            ctx.beginPath();
            ctx.moveTo(fx - 22, fy);
            ctx.lineTo(fx - 14, fy);
            ctx.moveTo(fx + 14, fy);
            ctx.lineTo(fx + 22, fy);
            ctx.moveTo(fx, fy - 22);
            ctx.lineTo(fx, fy - 14);
            ctx.moveTo(fx, fy + 14);
            ctx.lineTo(fx, fy + 22);
            ctx.stroke();
          }

          // Draw Synaptic Axon Filaments
          synapses.forEach((syn) => {
            const nodeA = nodes[syn.i];
            const nodeB = nodes[syn.j];
            if (!nodeA || !nodeB) return;

            const w = syn.weight;
            const isFiring = nodeA.activation > 0.2 || nodeB.activation > 0.2;

            ctx.beginPath();
            ctx.moveTo(nodeA.currX + 30, nodeA.currY - 10);

            // Curved biological axon path
            const midX = (nodeA.currX + nodeB.currX) / 2 + 30;
            const midY = (nodeA.currY + nodeB.currY) / 2 - 10 - (w * 18);
            ctx.quadraticCurveTo(midX, midY, nodeB.currX + 30, nodeB.currY - 10);

            if (isFiring) {
              ctx.strokeStyle = `rgba(16, 185, 129, ${Math.min(1.0, w * 1.5)})`;
              ctx.lineWidth = 1.0 + w * 4.5;
              ctx.shadowColor = "#10b981";
              ctx.shadowBlur = 8;
            } else {
              ctx.strokeStyle = `rgba(139, 92, 246, ${w * 0.7})`;
              ctx.lineWidth = 0.8 + w * 2.5;
              ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset

            // Synaptic Bouton Terminals
            if (w > 0.2) {
              ctx.fillStyle = isFiring ? "#10b981" : "rgba(139, 92, 246, 0.8)";
              ctx.beginPath();
              ctx.arc(nodeA.currX + 30, nodeA.currY - 10, 2 + w * 2.5, 0, Math.PI * 2);
              ctx.arc(nodeB.currX + 30, nodeB.currY - 10, 2 + w * 2.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Action Potential Spark
            if (isFiring && Math.random() < 0.3) {
              const tSpark = (time % 500) / 500;
              const sparkX = (1 - tSpark) * (1 - tSpark) * (nodeA.currX + 30) + 2 * (1 - tSpark) * tSpark * midX + tSpark * tSpark * (nodeB.currX + 30);
              const sparkY = (1 - tSpark) * (1 - tSpark) * (nodeA.currY - 10) + 2 * (1 - tSpark) * tSpark * midY + tSpark * tSpark * (nodeB.currY - 10);

              ctx.fillStyle = "#38bdf8";
              ctx.beginPath();
              ctx.arc(sparkX, sparkY, 2.5 + w * 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoSaccade, decayRate, springTension, triggerFixation]);

  // Reset Synapses
  const handleReset = () => {
    synapsesRef.current.clear();
    nodesRef.current.forEach((n) => {
      n.currX = n.x;
      n.currY = n.y;
      n.activation = 0;
      n.accumulatedFiring = 0.1;
    });
    setLastFixation(-1);
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
      <header style={{ maxWidth: 1000, width: "100%", marginBottom: 16, borderBottom: "1px solid #1e293b", paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#8b5cf6", fontWeight: 700, letterSpacing: 2 }}>
              DAY 016 · COGNITIVE NEUROSCIENCE
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0 6px 0", color: "#f8fafc", letterSpacing: -0.5 }}>
              Synaptic Plasticity &amp; Hebbian Learning Typography
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", maxWidth: 720, lineHeight: 1.5 }}>
              Donald Hebb&apos;s 1949 neurobiological postulate operating on living typographic language.
              Words that are co-activated by saccadic gaze sequences undergo Long-Term Potentiation (LTP), physically contracting their kerning
              and thickening font weight from Hairline (100) to Ultra-Black (900) as synaptic bonds solidify into consolidated meaning.
            </p>
          </div>

          {/* Connectome Badge */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              textAlign: "right"
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>CONNECTOME STATE</div>
            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "#10b981" }}>
              {telemetry.activeSynapses > 15 ? "CONSOLIDATED" : "PLASTIC ADAPTING"}
            </div>
          </div>
        </div>
      </header>

      {/* Control Console */}
      <div
        style={{
          maxWidth: 1000,
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
        {/* Toggle & Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setAutoSaccade(!autoSaccade)}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              border: "none",
              backgroundColor: autoSaccade ? "#8b5cf6" : "#334155",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {autoSaccade ? "AUTO SACCADE ON" : "MANUAL GAZE"}
          </button>
          <button
            onClick={handleReset}
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
            RESET SYNAPSES
          </button>
        </div>

        {/* Sliders */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>η (LEARNING):</span>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              style={{ width: 80, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a78bfa" }}>
              {learningRate.toFixed(2)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>γ (DECAY):</span>
            <input
              type="range"
              min="0.001"
              max="0.010"
              step="0.001"
              value={decayRate}
              onChange={(e) => setDecayRate(parseFloat(e.target.value))}
              style={{ width: 80, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>
              {decayRate.toFixed(3)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>KERNING TENSION:</span>
            <input
              type="range"
              min="0.01"
              max="0.10"
              step="0.01"
              value={springTension}
              onChange={(e) => setSpringTension(parseFloat(e.target.value))}
              style={{ width: 80, cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#10b981" }}>
              {springTension.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div
        style={{
          maxWidth: 1000,
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
          mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onPointerLeave={() => {
          mousePosRef.current = null;
        }}
      >
        {/* Canvas for Dendritic Synapse Lines */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={480}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1 }}
        />

        {/* DOM Layer for Elastic Typographic Words */}
        <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 2, pointerEvents: "auto" }}>
          {nodesRef.current.map((node) => {
            // Font weight mapped from accumulated firing (100 -> 900)
            const wght = Math.round(100 + node.accumulatedFiring * 800);
            const isFiring = node.activation > 0.15;

            return (
              <span
                key={node.id}
                onPointerEnter={() => triggerFixation(node.id, performance.now())}
                style={{
                  position: "absolute",
                  left: node.currX,
                  top: node.currY,
                  fontWeight: wght,
                  fontSize: `${18 + node.accumulatedFiring * 6}px`,
                  color: isFiring ? "#10b981" : node.accumulatedFiring > 0.4 ? "#f8fafc" : "#64748b",
                  textShadow: isFiring ? "0 0 12px rgba(16, 185, 129, 0.8)" : "none",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "color 0.15s ease, text-shadow 0.15s ease",
                  transform: `scale(${1.0 + node.activation * 0.12})`,
                  letterSpacing: `${(1.0 - node.accumulatedFiring) * 2}px`
                }}
              >
                {node.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* Telemetry Bar */}
      <div
        style={{
          maxWidth: 1000,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 12
        }}
      >
        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>SYNAPSE CONNECTIONS</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#8b5cf6" }}>
            {telemetry.activeSynapses} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>axons</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>MEAN SYNAPSE POTENCY</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8" }}>
            {(telemetry.meanWeight * 100).toFixed(1)}% <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>affinity</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>ADAPTIVE WEIGHT AXIS</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#10b981" }}>
            wght {telemetry.meanFontWght} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>/ 900</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px", backgroundColor: "#0b0f19", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>SACCADIC FIXATIONS</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f59e0b" }}>
            {telemetry.saccadeCount} <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>jumps</span>
          </div>
        </div>
      </div>

      {/* Philosophical Annotation */}
      <footer style={{ maxWidth: 1000, width: "100%", marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
          * AXIOM 16 VALIDATION: Traditional typography enforces Gutenberg&apos;s immutable lead block.
          When coupled with Donald Hebb&apos;s synaptic learning postulate, text becomes a plastic neural connectome.
          Temporal co-fixation strengthens inter-word synaptic weights, pulling related thoughts into physical proximity
          and consolidating memory into heavy typographic hierarchy. Reading rewires the page.
        </p>
      </footer>
    </div>
  );
}
