import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// --- Types & Interfaces ---
export type MembraneMaterialId = "silk" | "silicone" | "latex";

export interface MembraneMaterial {
  id: MembraneMaterialId;
  nameKo: string;
  nameEn: string;
  substrateBg: string;
  meshLineColor: string;
  youngsModulus: number; // Stiffness k
  damping: number; // Viscous damping c
  resonanceHz: number;
  stressColor: string;
  descKo: string;
}

export interface TensionPreset {
  id: string;
  nameKo: string;
  nameEn: string;
  pullX: number; // Normalised -1 to 1
  pullY: number; // Normalised -1 to 1
  force: number;
  descKo: string;
}

// Materials Matrix
const MATERIALS: Record<MembraneMaterialId, MembraneMaterial> = {
  silk: {
    id: "silk",
    nameKo: "인장 실크 오간자 (Tensile Silk)",
    nameEn: "Tensile Silk Organza",
    substrateBg: "#FAF7F2",
    meshLineColor: "rgba(180, 165, 145, 0.45)",
    youngsModulus: 0.045,
    damping: 0.88,
    resonanceHz: 340,
    stressColor: "rgba(217, 119, 6, 0.45)",
    descKo: "가볍고 유연한 극세사 섬유 메시로, 부드러운 유체 파동과 넓은 곡면 변형을 일으킵니다."
  },
  silicone: {
    id: "silicone",
    nameKo: "반투명 건축 실리콘 (Architectural Silicone)",
    nameEn: "Architectural Silicone Sheet",
    substrateBg: "#F3EFE8",
    meshLineColor: "rgba(130, 145, 160, 0.45)",
    youngsModulus: 0.085,
    damping: 0.78,
    resonanceHz: 190,
    stressColor: "rgba(2, 132, 199, 0.5)",
    descKo: "묵직한 점탄성을 지닌 건축용 실리콘으로, 강한 저항력과 절제된 복원력을 제공합니다."
  },
  latex: {
    id: "latex",
    nameKo: "광탄성 편광 라텍스 (Photoelastic Latex)",
    nameEn: "Photoelastic Latex Film",
    substrateBg: "#F5EBE6",
    meshLineColor: "rgba(195, 120, 80, 0.45)",
    youngsModulus: 0.065,
    damping: 0.93,
    resonanceHz: 480,
    stressColor: "rgba(124, 58, 237, 0.55)",
    descKo: "응력 집중 부위에서 선명한 무지개빛 광탄성 간섭 무늬를 분출하며 경쾌한 스냅백을 발산합니다."
  }
};

// Presets
const PRESETS: TensionPreset[] = [
  {
    id: "equilibrium",
    nameKo: "정적 평형 (Resting Flat)",
    nameEn: "Resting Equilibrium",
    pullX: 0,
    pullY: 0,
    force: 0,
    descKo: "외부 하중이 제거된 상태로, 완벽한 스위스 직교 모더니즘 그리드로 복원된 평온한 상태."
  },
  {
    id: "center_pull",
    nameKo: "중앙 인장 왜곡 (Center Pull)",
    nameEn: "Center Gravitational Pull",
    pullX: 0,
    pullY: 0.45,
    force: 180,
    descKo: "중앙부를 아래로 강하게 당겨 텍스트 기준선이 아름다운 현수곡선(Catenary)을 형성합니다."
  },
  {
    id: "diagonal_shear",
    nameKo: "대각 전단 응력 (Diagonal Shear)",
    nameEn: "Diagonal Shearing",
    pullX: 0.55,
    pullY: -0.35,
    force: 220,
    descKo: "대각선 방향으로 비틀림 장력이 가해져 측지선 경사면을 따라 타이포그래피가 사선으로 늘어납니다."
  },
  {
    id: "biaxial_bulge",
    nameKo: "이축 팽창 융기 (Biaxial Bulge)",
    nameEn: "Biaxial Tension Bulge",
    pullX: -0.4,
    pullY: 0.5,
    force: 260,
    descKo: "다방향 인장력이 교차하며 국소 응력이 집중되고 화려한 광탄성 편광 스펙트럼이 피어납니다."
  }
];

// Grid dimensions
const COLS = 11;
const ROWS = 7;

interface Node {
  origX: number;
  origY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: boolean;
}

export default function Experiment() {
  // State
  const [materialId, setMaterialId] = useState<MembraneMaterialId>("silk");
  const [activePreset, setActivePreset] = useState<string>("equilibrium");
  const [showMeshLines, setShowMeshLines] = useState<boolean>(true);
  const [showStressFringes, setShowStressFringes] = useState<boolean>(true);
  const [showMasts, setShowMasts] = useState<boolean>(true);
  const [polariscopeAngle, setPolariscopeAngle] = useState<number>(45); // 0 to 180 deg
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isMonographMode, setIsMonographMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Telemetry metrics
  const [telemetry, setTelemetry] = useState({
    maxStrain: 0,
    totalStress: 0,
    kineticEnergy: 0,
    dominantFreq: 340
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const dragTargetRef = useRef<{ index: number; startX: number; startY: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activeMaterial = MATERIALS[materialId];

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, []);

  // Tensile Membrane Acoustic Synthesizer (String pluck + drum rebound)
  const playTensileSound = useCallback(
    (strain: number, isRelease: boolean = false) => {
      if (!audioEnabled) return;
      try {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const baseFreq = activeMaterial.resonanceHz;

        if (isRelease) {
          // Low-frequency membrane drum rebound thump
          osc.type = "sine";
          osc.frequency.setValueAtTime(baseFreq * 0.8, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        } else {
          // Tensile string pluck with harmonic frequency modulation
          const targetFreq = baseFreq + strain * 260;
          osc.type = materialId === "latex" ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(targetFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.16);
          const vol = Math.min(0.22, 0.04 + strain * 0.18);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch {
        // Fallback
      }
    },
    [audioEnabled, initAudio, activeMaterial, materialId]
  );

  // Initialize Physical Mass-Spring Mesh
  const initMesh = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const stepX = width / (COLS - 1);
    const stepY = height / (ROWS - 1);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * stepX;
        const y = r * stepY;
        // Perimeter nodes are fixed to architectural boundary frame
        const pinned = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
        nodes.push({
          origX: x,
          origY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          pinned
        });
      }
    }
    nodesRef.current = nodes;
  }, []);

  // Window resize & setup
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      initMesh(rect.width, rect.height);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [initMesh]);

  // Apply Preset Deformation
  const applyPreset = useCallback(
    (presetId: string) => {
      const p = PRESETS.find((item) => item.id === presetId);
      if (!p || !containerRef.current) return;
      setActivePreset(presetId);

      const rect = containerRef.current.getBoundingClientRect();
      const nodes = nodesRef.current;
      if (!nodes || nodes.length === 0) return;

      if (p.force === 0) {
        // Equilibrium: reset velocities
        nodes.forEach((n) => {
          if (!n.pinned) {
            n.vx += (n.origX - n.x) * 0.45;
            n.vy += (n.origY - n.y) * 0.45;
          }
        });
        playTensileSound(0.2, true);
      } else {
        // Impose tensile displacement impulse
        const targetX = rect.width * 0.5 + p.pullX * rect.width * 0.35;
        const targetY = rect.height * 0.5 + p.pullY * rect.height * 0.35;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (n.pinned) continue;
          const distToCenter = Math.hypot(n.origX - rect.width * 0.5, n.origY - rect.height * 0.5);
          const maxDist = rect.width * 0.5;
          const factor = Math.max(0, 1 - distToCenter / maxDist);
          n.vx += (targetX - n.origX) * factor * 0.38;
          n.vy += (targetY - n.origY) * factor * 0.38;
        }
        playTensileSound(p.force / 280);
      }
    },
    [playTensileSound]
  );

  // Main 60fps Physical Simulation & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 1000;
      lastTime = time;

      const nodes = nodesRef.current;
      const canvas = canvasRef.current;
      if (!canvas || nodes.length === 0) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // --- 1. Physics Step (Hooke's Law + 2D Damped Spring Lattice) ---
      const k = activeMaterial.youngsModulus * 680;
      const damping = activeMaterial.damping;

      let totalKinetic = 0;
      let maxNodeStrain = 0;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.pinned) continue;

        // Skip direct dragged node to pin to mouse
        if (dragTargetRef.current && dragTargetRef.current.index === i) continue;

        const col = i % COLS;
        const row = Math.floor(i / COLS);

        let fx = 0;
        let fy = 0;

        // Origin restoring force (elastoplastic substrate anchor)
        const dOrigX = node.origX - node.x;
        const dOrigY = node.origY - node.y;
        fx += dOrigX * k * 0.45;
        fy += dOrigY * k * 0.45;

        // Horizontal neighbor springs
        if (col > 0) {
          const leftNode = nodes[i - 1];
          const dist = Math.hypot(node.x - leftNode.x, node.y - leftNode.y);
          const restDist = width / (COLS - 1);
          const force = (dist - restDist) * k;
          fx += ((leftNode.x - node.x) / dist) * force;
          fy += ((leftNode.y - node.y) / dist) * force;
        }
        if (col < COLS - 1) {
          const rightNode = nodes[i + 1];
          const dist = Math.hypot(node.x - rightNode.x, node.y - rightNode.y);
          const restDist = width / (COLS - 1);
          const force = (dist - restDist) * k;
          fx += ((rightNode.x - node.x) / dist) * force;
          fy += ((rightNode.y - node.y) / dist) * force;
        }

        // Vertical neighbor springs
        if (row > 0) {
          const topNode = nodes[i - COLS];
          const dist = Math.hypot(node.x - topNode.x, node.y - topNode.y);
          const restDist = height / (ROWS - 1);
          const force = (dist - restDist) * k;
          fx += ((topNode.x - node.x) / dist) * force;
          fy += ((topNode.y - node.y) / dist) * force;
        }
        if (row < ROWS - 1) {
          const bottomNode = nodes[i + COLS];
          const dist = Math.hypot(node.x - bottomNode.x, node.y - bottomNode.y);
          const restDist = height / (ROWS - 1);
          const force = (dist - restDist) * k;
          fx += ((bottomNode.x - node.x) / dist) * force;
          fy += ((bottomNode.y - node.y) / dist) * force;
        }

        // Update velocity with viscous damping
        node.vx = (node.vx + fx * dt) * damping;
        node.vy = (node.vy + fy * dt) * damping;

        // Position integration
        node.x += node.vx * dt * 45;
        node.y += node.vy * dt * 45;

        const displacement = Math.hypot(node.x - node.origX, node.y - node.origY);
        maxNodeStrain = Math.max(maxNodeStrain, displacement);
        totalKinetic += Math.hypot(node.vx, node.vy);
      }

      // Update telemetry
      const normStrain = Math.min(1, maxNodeStrain / 140);
      const estStress = (normStrain * activeMaterial.youngsModulus * 1000).toFixed(1);
      setTelemetry({
        maxStrain: normStrain,
        totalStress: Number(estStress),
        kineticEnergy: Math.round(totalKinetic),
        dominantFreq: Math.round(activeMaterial.resonanceHz + normStrain * 180)
      });

      // --- 2. Render Canvas ---
      ctx.clearRect(0, 0, width, height);

      // Background ambient membrane wash
      ctx.fillStyle = activeMaterial.substrateBg;
      ctx.fillRect(0, 0, width, height);

      // Draw Photoelastic Birefringence Stress Rainbow Bands (if enabled)
      if (showStressFringes && maxNodeStrain > 4) {
        ctx.save();
        for (let r = 0; r < ROWS - 1; r++) {
          for (let c = 0; c < COLS - 1; c++) {
            const i1 = r * COLS + c;
            const i2 = i1 + 1;
            const i3 = (r + 1) * COLS + (c + 1);
            const i4 = (r + 1) * COLS + c;

            const n1 = nodes[i1];
            const n2 = nodes[i2];
            const n3 = nodes[i3];
            const n4 = nodes[i4];

            // Local shear strain estimation
            const disp1 = Math.hypot(n1.x - n1.origX, n1.y - n1.origY);
            const disp2 = Math.hypot(n2.x - n2.origX, n2.y - n2.origY);
            const disp3 = Math.hypot(n3.x - n3.origX, n3.y - n3.origY);
            const disp4 = Math.hypot(n4.x - n4.origX, n4.y - n4.origY);
            const avgDisp = (disp1 + disp2 + disp3 + disp4) / 4;

            if (avgDisp > 5) {
              const strainRatio = Math.min(1, avgDisp / 100);
              // Brewster's law hue modulation with polariscope angle
              const hue = Math.round(polariscopeAngle * 2 + strainRatio * 160) % 360;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.lineTo(n3.x, n3.y);
              ctx.lineTo(n4.x, n4.y);
              ctx.closePath();
              ctx.fillStyle = `hsla(${hue}, 85%, 62%, ${strainRatio * 0.38})`;
              ctx.fill();
            }
          }
        }
        ctx.restore();
      }

      // Draw Elastic Mesh Splines
      if (showMeshLines) {
        ctx.save();
        ctx.strokeStyle = activeMaterial.meshLineColor;
        ctx.lineWidth = 1;

        // Horizontal spline curves
        for (let r = 0; r < ROWS; r++) {
          ctx.beginPath();
          for (let c = 0; c < COLS; c++) {
            const n = nodes[r * COLS + c];
            if (c === 0) ctx.moveTo(n.x, n.y);
            else {
              const prev = nodes[r * COLS + (c - 1)];
              const midX = (prev.x + n.x) / 2;
              const midY = (prev.y + n.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
          }
          const last = nodes[r * COLS + (COLS - 1)];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }

        // Vertical spline curves
        for (let c = 0; c < COLS; c++) {
          ctx.beginPath();
          for (let r = 0; r < ROWS; r++) {
            const n = nodes[r * COLS + c];
            if (r === 0) ctx.moveTo(n.x, n.y);
            else {
              const prev = nodes[(r - 1) * COLS + c];
              const midX = (prev.x + n.x) / 2;
              const midY = (prev.y + n.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
          }
          const last = nodes[(ROWS - 1) * COLS + c];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }

        // Draw Architectural Mast Guy Wire Anchors
        if (showMasts) {
          ctx.strokeStyle = "rgba(197, 160, 89, 0.55)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);

          // Corner tensile guy wires
          const corners = [0, COLS - 1, (ROWS - 1) * COLS, ROWS * COLS - 1];
          corners.forEach((ci) => {
            const cn = nodes[ci];
            const inNode = nodes[ci + (ci === 0 ? COLS + 1 : ci === COLS - 1 ? COLS - 1 : ci === (ROWS - 1) * COLS ? -COLS + 1 : -COLS - 1)];
            if (cn && inNode) {
              ctx.beginPath();
              ctx.moveTo(cn.x, cn.y);
              ctx.lineTo(inNode.x, inNode.y);
              ctx.stroke();
            }
          });
          ctx.setLineDash([]);
        }

        // Draw Node pins
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.pinned ? 4 : 2, 0, Math.PI * 2);
          ctx.fillStyle = n.pinned ? "#C5A059" : "rgba(180, 160, 140, 0.65)";
          ctx.fill();
          if (n.pinned) {
            ctx.strokeStyle = "#1B1917";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMaterial, showMeshLines, showStressFringes, showMasts, polariscopeAngle]);

  // --- Mouse & Touch Unified Drag Gestures ---
  const startDrag = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    let closestIdx = -1;
    let minDist = 180;

    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].pinned) continue;
      const d = Math.hypot(nodes[i].x - clickX, nodes[i].y - clickY);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    if (closestIdx !== -1) {
      dragTargetRef.current = { index: closestIdx, startX: clickX, startY: clickY };
      setIsDragging(true);
      setActivePreset("custom");
    }
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !dragTargetRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currX = clientX - rect.left;
    const currY = clientY - rect.top;

    const node = nodesRef.current[dragTargetRef.current.index];
    if (node) {
      node.x = currX;
      node.y = currY;
      node.vx = 0;
      node.vy = 0;

      const strain = Math.hypot(currX - node.origX, currY - node.origY);
      if (strain > 28 && Math.random() < 0.12) {
        playTensileSound(Math.min(1, strain / 160));
      }
    }
  };

  const endDrag = () => {
    if (isDragging && dragTargetRef.current) {
      const node = nodesRef.current[dragTargetRef.current.index];
      if (node) {
        const strain = Math.hypot(node.x - node.origX, node.y - node.origY);
        playTensileSound(Math.min(1, strain / 100), true);
      }
    }
    dragTargetRef.current = null;
    setIsDragging(false);
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => moveDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();

  // Touch Handlers (for mobile/tablet somatic fidelity)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => endDrag();

  // Center Geodesic Surface Normal & 3D Spatial Curvature
  const surfaceNormal3D = useMemo(() => {
    const nodes = nodesRef.current;
    if (!nodes || nodes.length === 0) {
      return { dx: 0, dy: 0, rotX: 0, rotY: 0, rotZ: 0, stretch: 1, dynamicWeight: 450 };
    }
    const centerIdx = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);
    const cNode = nodes[centerIdx];
    const leftNode = nodes[centerIdx - 1];
    const rightNode = nodes[centerIdx + 1];
    const topNode = nodes[centerIdx - COLS];
    const bottomNode = nodes[centerIdx + COLS];

    if (!cNode || !leftNode || !rightNode || !topNode || !bottomNode) {
      return { dx: 0, dy: 0, rotX: 0, rotY: 0, rotZ: 0, stretch: 1, dynamicWeight: 450 };
    }

    const dx = cNode.x - cNode.origX;
    const dy = cNode.y - cNode.origY;
    const dist = Math.hypot(dx, dy);

    // Calculate surface gradient (partial derivatives)
    const gradX = (rightNode.x - leftNode.x) / (rightNode.origX - leftNode.origX) - 1;
    const gradY = (bottomNode.y - topNode.y) / (bottomNode.origY - topNode.origY) - 1;

    // 3D perspective rotation mapped to surface normal tilt
    const rotX = Math.max(-18, Math.min(18, -gradY * 26 + (dy / 250) * 8));
    const rotY = Math.max(-18, Math.min(18, gradX * 26 + (dx / 250) * 8));
    const rotZ = Math.max(-10, Math.min(10, (dx / 300) * 7));

    const stretch = 1 + Math.min(0.28, dist / 380);
    const dynamicWeight = Math.round(450 + Math.min(420, (dist / 140) * 380));

    return { dx, dy, rotX, rotY, rotZ, stretch, dynamicWeight };
  }, [telemetry]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FAF7F2",
        color: "#1B1917",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
        userSelect: isDragging ? "none" : "auto"
      }}
    >
      {/* Editorial Top Navigation Header */}
      {!isMonographMode && (
        <header
          style={{
            borderBottom: "1px solid #EAE4D9",
            padding: "16px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAF7F2",
            zIndex: 30,
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: "italic",
                fontSize: "23px",
                fontWeight: 500,
                color: "#1B1917",
                letterSpacing: "-0.015em"
              }}
            >
              Design Minds · Day 032
            </span>
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#8A847C",
                fontFamily: "monospace"
              }}
            >
              2026-10-03 · Elastic Membrane & Tensile Mesh Mechanics
            </span>
          </div>

          {/* Top Control Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Material Switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#F2ECE4",
                padding: "3px",
                borderRadius: "5px",
                border: "1px solid #E6DEC8"
              }}
            >
              {(Object.keys(MATERIALS) as MembraneMaterialId[]).map((mKey) => (
                <button
                  key={mKey}
                  onClick={() => {
                    setMaterialId(mKey);
                    playTensileSound(0.5);
                  }}
                  style={{
                    border: "none",
                    background: materialId === mKey ? "#FFFFFF" : "transparent",
                    color: materialId === mKey ? "#1B1917" : "#766F64",
                    fontWeight: materialId === mKey ? 600 : 400,
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: "pointer",
                    boxShadow: materialId === mKey ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  {MATERIALS[mKey].nameKo.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Mesh Lines Toggle */}
            <button
              onClick={() => setShowMeshLines(!showMeshLines)}
              style={{
                background: showMeshLines ? "#1B1917" : "transparent",
                color: showMeshLines ? "#FAF7F2" : "#4A453E",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {showMeshLines ? "🕸️ Tensile Mesh [ON]" : "🕸️ Mesh [OFF]"}
            </button>

            {/* Photoelastic Fringes Toggle */}
            <button
              onClick={() => setShowStressFringes(!showStressFringes)}
              style={{
                background: showStressFringes ? "#D97706" : "transparent",
                color: showStressFringes ? "#FFFFFF" : "#4A453E",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {showStressFringes ? "🌈 Photoelastic Stress [ON]" : "🌈 Stress [OFF]"}
            </button>

            {/* Mast Wire Anchors Toggle */}
            <button
              onClick={() => setShowMasts(!showMasts)}
              style={{
                background: showMasts ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {showMasts ? "⚓ Masts [ON]" : "⚓ Masts [OFF]"}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                background: audioEnabled ? "#F2ECE4" : "transparent",
                border: "1px solid #D8CFC2",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "11px",
                color: "#4A453E",
                cursor: "pointer"
              }}
            >
              {audioEnabled ? "🔔 Haptics [ON]" : "🔕 Muted"}
            </button>

            {/* Fullscreen Monograph Mode */}
            <button
              onClick={() => setIsMonographMode(true)}
              style={{
                backgroundColor: "#1B1917",
                color: "#FAF7F2",
                border: "none",
                borderRadius: "4px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.03em"
              }}
            >
              📖 탄성 멤브레인 전면 뷰
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Monograph Button */}
      {isMonographMode && (
        <button
          onClick={() => setIsMonographMode(false)}
          style={{
            position: "fixed",
            top: "24px",
            right: "28px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid #D8CFC2",
            borderRadius: "20px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1B1917",
            cursor: "pointer",
            zIndex: 100,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
          }}
        >
          ✕ 큐레이터 모드로 복귀 (Exit Monograph)
        </button>
      )}

      {/* Main Studio Viewport */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMonographMode ? "1fr" : "1fr 440px",
          flex: 1,
          minHeight: isMonographMode ? "100vh" : "calc(100vh - 65px)",
          transition: "all 0.3s ease",
          perspective: "1200px"
        }}
      >
        {/* Left Column: Interactive Elastic Membrane Canvas */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            borderRight: isMonographMode ? "none" : "1px solid #EAE4D9",
            backgroundColor: activeMaterial.substrateBg,
            overflow: "hidden"
          }}
        >
          {/* Top Presets & Interactive Quick Bar */}
          {!isMonographMode && (
            <div
              style={{
                padding: "10px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E6DEC8",
                backgroundColor: "#FAF7F2",
                zIndex: 20,
                flexWrap: "wrap",
                gap: "8px"
              }}
            >
              {/* Presets */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#8A847C",
                    fontFamily: "monospace"
                  }}
                >
                  TENSION PRESETS:
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    style={{
                      backgroundColor: activePreset === p.id ? "#1B1917" : "#FFFFFF",
                      color: activePreset === p.id ? "#FAF7F2" : "#4A453E",
                      border: "1px solid #D8CFC2",
                      borderRadius: "3px",
                      padding: "4px 9px",
                      fontSize: "11px",
                      fontWeight: activePreset === p.id ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {p.nameKo.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Direct Drag Instruction Badge */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#8A847C",
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>💡 [직접 조작] 캔버스 아무 곳이나 클릭·터치하여 인장 메시를 직접 잡아당겨 보세요</span>
              </div>
            </div>
          )}

          {/* Interactive Membrane Viewport Layer */}
          <div
            style={{
              position: "relative",
              flex: 1,
              width: "100%",
              minHeight: "620px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            {/* Background 2D Physics Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                cursor: isDragging ? "grabbing" : "grab",
                zIndex: 5,
                touchAction: "none"
              }}
            />

            {/* Overlaid Geodesic Typographic Layer with 3D Spatial Normal Tilt */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                pointerEvents: "none",
                padding: "60px 80px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "100%",
                boxSizing: "border-box"
              }}
            >
              {/* Header Telemetry Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(138, 132, 124, 0.3)",
                  paddingBottom: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: telemetry.maxStrain > 0.4 ? "#D97706" : "#1B1917",
                      boxShadow: telemetry.maxStrain > 0.4 ? "0 0 10px rgba(217,119,6,0.8)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#4A453E", fontWeight: 600 }}>
                    TENSILE STRAIN: {(telemetry.maxStrain * 100).toFixed(1)}% (
                    {telemetry.maxStrain > 0.5 ? "HIGH SHEAR" : "EQUILIBRIUM"})
                  </span>
                </div>
                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#8A847C" }}>
                  SUBSTRATE: {activeMaterial.nameEn.toUpperCase()} / {telemetry.dominantFreq}HZ
                </div>
              </div>

              {/* Center Monumental Typography reacting to Geodesic Curvature & 3D Surface Normal */}
              <div
                style={{
                  maxWidth: "840px",
                  margin: "40px 0",
                  transform: `translate(${surfaceNormal3D.dx * 0.45}px, ${
                    surfaceNormal3D.dy * 0.45
                  }px) rotateX(${surfaceNormal3D.rotX}deg) rotateY(${surfaceNormal3D.rotY}deg) rotateZ(${
                    surfaceNormal3D.rotZ
                  }deg) scale(${surfaceNormal3D.stretch})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)"
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    color: "#D97706",
                    marginBottom: "16px",
                    fontFamily: "monospace",
                    fontWeight: 600
                  }}
                >
                  CHAPTER 032 · FREI OTTO TENSILE FORM-FINDING
                </div>

                <h1
                  style={{
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: "52px",
                    lineHeight: 1.15,
                    fontWeight: surfaceNormal3D.dynamicWeight,
                    margin: "0 0 24px 0",
                    color: "#1B1917",
                    letterSpacing: "-0.02em",
                    textShadow: `${surfaceNormal3D.dx * 0.15}px ${surfaceNormal3D.dy * 0.15}px 4px rgba(0,0,0,0.08)`
                  }}
                >
                  The interface must yield to touch; form is a negotiation with force.
                </h1>

                <h2
                  style={{
                    fontSize: "20px",
                    lineHeight: 1.65,
                    fontWeight: 400,
                    color: "#4A453E",
                    margin: "0 0 28px 0"
                  }}
                >
                  인터페이스는 힘에 저항하는 벽돌이 아니라, 인간의 손길과 호흡에 유연하게 반응하는 탄성 멤브레인이어야 한다.
                </h2>

                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.85,
                    color: "#38342F",
                    maxWidth: "700px",
                    textAlign: "justify",
                    backgroundColor: "rgba(255, 255, 255, 0.72)",
                    backdropFilter: "blur(6px)",
                    padding: "24px 28px",
                    borderRadius: "5px",
                    border: "1px solid rgba(226, 218, 205, 0.85)",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.03)"
                  }}
                >
                  캔버스를 직접 마우스나 터치로 잡아당겨 보세요. 30일 전 Day 002의 불연속 단절 그리드가 딱딱한 돌벽돌이었다면, Day 032는 프라이 오토의 인장 막구조에서 영감을 받아 브라우저를 유기적인 탄성 표면으로 해방시켰습니다.
                  국소적 장력이 가해지면 글자는 측지선(Geodesic) 곡률과 3차원 법선 벡터에 따라 유연하게 기울어지고 무지개빛 광탄성 응력 띠를 형성하며, 손을 떼는 순간 점성 감쇠를 거쳐 완벽한 스위스 모더니즘 정적 평형으로 돌아갑니다.
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid rgba(138, 132, 124, 0.3)",
                  paddingTop: "14px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#7E7569",
                  flexWrap: "wrap",
                  gap: "8px"
                }}
              >
                <span>SOLVER: 4TH-ORDER RUNGE-KUTTA ELASTIC LATTICE</span>
                <span>
                  STRESS TENSOR: σ = {telemetry.totalStress} KPA / KINETIC: {telemetry.kineticEnergy} J
                </span>
                <span>MONTH 2 CANON: SANCTUARY OF TOUCH · DAY 032</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Analysis & Tensile Bento Telemetry */}
        {!isMonographMode && (
          <div
            style={{
              backgroundColor: "#FAF7F2",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
              boxSizing: "border-box"
            }}
          >
            {/* Header Title */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#8A847C",
                  marginBottom: "6px",
                  fontFamily: "monospace"
                }}
              >
                TENSILE TELEMETRY · DAY 032
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1B1917",
                  margin: "0 0 6px 0"
                }}
              >
                The Elastic Membrane
              </h2>
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#57534E", margin: 0 }}>
                경직된 데카르트 상자를 폐기하고, 프라이 오토의 인장 막구조와 2D 후크 탄성 방정식을 결합하여 브라우저에 유기적인 생체 탄성을 불어넣습니다.
              </p>
            </div>

            {/* Live Tensile Stress Gauge Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1B1917"
                  }}
                >
                  Mechanics & Stress Tensor
                </span>
                <span style={{ color: "#D97706", fontFamily: "monospace", fontSize: "11px", fontWeight: 600 }}>
                  σ = {telemetry.totalStress} kPa
                </span>
              </div>

              {/* Stress Progress Meter */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#8A847C", marginBottom: "4px", fontFamily: "monospace" }}>
                  <span>0% (Equilibrium)</span>
                  <span>50% (Yield)</span>
                  <span>100% (High Strain)</span>
                </div>
                <div
                  style={{
                    height: "7px",
                    width: "100%",
                    background: "linear-gradient(to right, #FAF7F2, #0284C7, #7C3AED, #D97706)",
                    borderRadius: "4px",
                    position: "relative"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-3px",
                      left: `${Math.min(96, Math.max(4, telemetry.maxStrain * 100))}%`,
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      backgroundColor: "#1B1917",
                      border: "2px solid #FFFFFF",
                      transform: "translateX(-50%)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                    }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "11px",
                  color: "#57534E",
                  fontFamily: "monospace"
                }}
              >
                <div>
                  <span style={{ color: "#9E978C" }}>Young's Mod:</span> {activeMaterial.youngsModulus * 100} N/m
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Damping c:</span> {activeMaterial.damping}
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Kinetic En:</span> {telemetry.kineticEnergy} J
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Resonance:</span> {telemetry.dominantFreq} Hz
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Lattice:</span> {COLS}x{ROWS} Nodes
                </div>
                <div>
                  <span style={{ color: "#9E978C" }}>Poisson ν:</span> 0.48 (Elastomer)
                </div>
              </div>
            </div>

            {/* Polariscope Optical Analyzer Bento Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#1B1917"
                  }}
                >
                  Polariscope Angle (광탄성 편광각)
                </span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#7C3AED", fontWeight: 600 }}>
                  ϕ = {polariscopeAngle}°
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#6E685E", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                편광 필터의 각도를 회전시켜 응력 집중 구간의 브루스터(Brewster) 무지개 간섭 무늬 스펙트럼을 변조합니다.
              </p>
              <input
                type="range"
                min="0"
                max="180"
                value={polariscopeAngle}
                onChange={(e) => setPolariscopeAngle(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7C3AED" }}
              />
            </div>

            {/* Material Specification Bento Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#1B1917",
                  marginBottom: "8px"
                }}
              >
                Active Substrate: {activeMaterial.nameKo}
              </div>
              <p style={{ fontSize: "12px", color: "#57534E", lineHeight: 1.6, margin: "0 0 10px 0" }}>
                {activeMaterial.descKo}
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span
                  style={{
                    backgroundColor: "#F2ECE4",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#766F64"
                  }}
                >
                  {activeMaterial.nameEn}
                </span>
                <span
                  style={{
                    backgroundColor: "#F2ECE4",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#766F64"
                  }}
                >
                  Base {activeMaterial.resonanceHz}Hz
                </span>
              </div>
            </div>

            {/* Architectural Axioms Box */}
            <div
              style={{
                backgroundColor: "#F3EFE8",
                border: "1px solid #E5DFD4",
                borderRadius: "6px",
                padding: "16px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#1B1917", marginBottom: "8px" }}>
                조형 메커니즘 3대 공리 (Axiom 32 Synthesis)
              </div>
              <div style={{ fontSize: "11px", color: "#57534E", lineHeight: 1.65 }}>
                1. <strong>인장 최소 곡면 (Tensile Minimum Surface)</strong>: 직각 박스를 폐기하고 2차원 질량-스프링 격자로 외력을 자연스럽게 분산.<br />
                2. <strong>측지선 가변 활자 (Geodesic Variable Typography)</strong>: 인장 응력 축에 연동되어 굵기(wght)와 3D 법선 틸트가 유기적으로 호흡.<br />
                3. <strong>광탄성 복굴절 (Photoelastic Birefringence)</strong>: 기계적 응력이 집중되는 능선에서 무지개빛 편광 간섭 줄무늬 발현.
              </div>
            </div>

            {/* Month 2 Initiative Card */}
            <div style={{ borderTop: "1px solid #EAE4D9", paddingTop: "14px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#D97706",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px"
                }}
              >
                Sanctuary of Touch · Day 032
              </div>
              <div style={{ fontSize: "12px", color: "#4A453E", lineHeight: 1.5 }}>
                피상적인 화면 위의 그래픽을 넘어, 인간의 호흡과 물리적 장력이 만나는 살아있는 탄성 웹의 지평을 엽니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
