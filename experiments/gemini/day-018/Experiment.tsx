import React, { useState, useRef } from "react";

type ViewMode = "editorial" | "axonometric" | "exploded";

export default function KineticArchitecturalLayout() {
  const [viewMode, setViewMode] = useState<ViewMode>("axonometric");
  const [sunAngle, setSunAngle] = useState<number>(45); // Sun azimuth in degrees
  const [lightElevation, setLightElevation] = useState<number>(35); // Sun altitude in degrees
  const [modulorScale, setModulorScale] = useState<number>(1829); // 1829mm standard Modulor
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isHinged, setIsHinged] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute Modulor Golden Ratios (Φ = 1.618033)
  const phi = 1.61803398875;
  const redSeries = [
    Math.round(modulorScale / (phi * phi * phi)),
    Math.round(modulorScale / (phi * phi)),
    Math.round(modulorScale / phi),
    modulorScale,
    Math.round(modulorScale * phi)
  ];

  // Calculate Sun Shadow Vectors for Tactile Deboss
  const rad = (sunAngle * Math.PI) / 180;
  const shadowDist = Math.max(2, Math.round((90 - lightElevation) * 0.18));
  const shadowX = Math.round(Math.cos(rad) * shadowDist);
  const shadowY = Math.round(Math.sin(rad) * shadowDist);

  // Deboss text shadow style (sunlit upper highlight, shadowed bottom recess)
  const debossStyle: React.CSSProperties = {
    textShadow: `${-shadowX}px ${-shadowY}px 1px rgba(255,255,255,0.85), ${shadowX}px ${shadowY}px 2px rgba(20,20,19,0.35)`
  };

  // Card shadow style based on light
  const planeShadow: string = `${shadowX * 2}px ${shadowY * 2 + 6}px 20px rgba(20,20,19,0.09), 0 1px 3px rgba(20,20,19,0.05)`;
  const deepShadow: string = `${shadowX * 3}px ${shadowY * 3 + 12}px 32px rgba(0,47,167,0.18), 0 2px 6px rgba(0,47,167,0.08)`;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f7f5f0",
        color: "#141413",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        boxSizing: "border-box",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}
    >
      {/* Top Architectural Drafting Bar */}
      <header
        style={{
          maxWidth: 1120,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "14px 24px",
          backgroundColor: "#ffffff",
          borderRadius: 4,
          border: "1px solid #d6d3d1",
          boxShadow: planeShadow,
          marginBottom: 20
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              backgroundColor: "#002fa7"
            }}
          />
          <div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#002fa7", fontWeight: 700, letterSpacing: 1.5 }}>
              ARCHITECTURAL FRONT-END SYSTEM · DAY 018
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#141413", fontFamily: "Georgia, serif", letterSpacing: -0.3 }}>
              Kinetic Architectural Editorial Layouts
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: "flex", gap: 6, backgroundColor: "#f5f2eb", padding: 4, borderRadius: 4, border: "1px solid #e7e5e4" }}>
          {(["editorial", "axonometric", "exploded"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: 2,
                backgroundColor: viewMode === mode ? "#141413" : "transparent",
                color: viewMode === mode ? "#ffffff" : "#78716c",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.15s ease"
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Spatial Control Toolbelt */}
      <div
        style={{
          maxWidth: 1120,
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          backgroundColor: "#ffffff",
          borderRadius: 4,
          border: "1px solid #e7e5e4",
          marginBottom: 24,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#78716c" }}>AZIMUTH (θ):</span>
            <input
              type="range"
              min="0"
              max="360"
              value={sunAngle}
              onChange={(e) => setSunAngle(parseInt(e.target.value, 10))}
              style={{ width: 90, accentColor: "#002fa7" }}
            />
            <span style={{ fontWeight: 700, color: "#002fa7", minWidth: 32 }}>{sunAngle}&deg;</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#78716c" }}>ELEVATION:</span>
            <input
              type="range"
              min="10"
              max="80"
              value={lightElevation}
              onChange={(e) => setLightElevation(parseInt(e.target.value, 10))}
              style={{ width: 80, accentColor: "#ff3b00" }}
            />
            <span style={{ fontWeight: 700, color: "#ff3b00", minWidth: 28 }}>{lightElevation}&deg;</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#78716c" }}>MODULOR BASE:</span>
            <input
              type="range"
              min="1600"
              max="2000"
              step="10"
              value={modulorScale}
              onChange={(e) => setModulorScale(parseInt(e.target.value, 10))}
              style={{ width: 80, accentColor: "#141413" }}
            />
            <span style={{ fontWeight: 700, color: "#141413", minWidth: 44 }}>{modulorScale}mm</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setIsHinged(!isHinged)}
            style={{
              padding: "5px 12px",
              backgroundColor: isHinged ? "#002fa7" : "#ede8dd",
              color: isHinged ? "#ffffff" : "#141413",
              border: "1px solid #d6d3d1",
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {isHinged ? "3D HINGE: ENGAGED" : "3D HINGE: FLATTENED"}
          </button>
        </div>
      </div>

      {/* Main Architectural Stage Container */}
      <div
        ref={containerRef}
        style={{
          maxWidth: 1120,
          width: "100%",
          minHeight: 640,
          position: "relative",
          perspective: viewMode === "editorial" ? "none" : "1400px",
          perspectiveOrigin: "50% 35%",
          transition: "perspective 0.4s ease"
        }}
      >
        {/* TECTONIC ASSEMBLY (Wrapped in 3D Transforming Wrapper) */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 20,
            transformStyle: "preserve-3d",
            transform:
              viewMode === "axonometric"
                ? "rotateX(14deg) rotateY(-8deg) rotateZ(1.5deg)"
                : viewMode === "exploded"
                ? "rotateX(22deg) rotateY(-18deg) translateZ(40px)"
                : "none",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* PLANE 1: The Hero Monolith (Cols 1-7) */}
          <div
            style={{
              gridColumn: "span 7",
              backgroundColor: "#ffffff",
              padding: "36px 32px",
              borderRadius: 4,
              border: "1px solid #e7e5e4",
              boxShadow: planeShadow,
              transform: isHinged && viewMode !== "editorial" ? "translateZ(20px)" : "none",
              transition: "transform 0.5s ease, box-shadow 0.2s ease",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Top Registration Crosshairs */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid #f5f2eb", paddingBottom: 10 }}>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a8a29e" }}>
                PLN-01 // COORD [X: 1130 · Y: 698 · Z: +20]
              </span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#002fa7", fontWeight: 700 }}>
                MODULOR Φ² HARMONIC
              </span>
            </div>

            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "36px",
                lineHeight: "1.15",
                margin: "0 0 16px 0",
                color: "#141413",
                letterSpacing: "-0.8px",
                ...debossStyle
              }}
            >
              Architecture is the masterly, correct and magnificent play of masses brought together in light.
            </h1>

            <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#44403c", margin: "0 0 24px 0", maxWidth: 540 }}>
              For decades, web design has suffered from the tyranny of the frictionless 12-column scroll. We build digital pages like endless
              paper receipt tapes, stripping typography of physical resistance, gravitational presence, and architectural gravitas.
              By reformulating the viewport as a series of kinetic folding planes, typography ceases to be passive text on glass—it becomes
              monumental spatial structure.
            </p>

            {/* Le Modulor Scale Ratio Diagram */}
            <div style={{ padding: "16px", backgroundColor: "#fafaf9", borderRadius: 4, border: "1px solid #f5f2eb" }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#78716c", marginBottom: 8, fontWeight: 700 }}>
                PROPORTIONAL HARMONIC SERIES (LE CORBUSIER 1948):
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {redSeries.map((val, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: Math.min(80, Math.round(val * 0.04)),
                        height: 6,
                        backgroundColor: idx === 3 ? "#002fa7" : "#d6d3d1",
                        marginBottom: 4
                      }}
                    />
                    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: idx === 3 ? "#002fa7" : "#141413" }}>
                      {val}
                    </div>
                    <div style={{ fontSize: 9, color: "#a8a29e" }}>Φ^{idx - 3}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PLANE 2: The Cantilevered Terrace (Cols 8-12) */}
          <div
            style={{
              gridColumn: "span 5",
              backgroundColor: "#002fa7",
              color: "#ffffff",
              padding: "36px 28px",
              borderRadius: 4,
              border: "1px solid #001a61",
              boxShadow: deepShadow,
              transform:
                isHinged && viewMode !== "editorial"
                  ? viewMode === "exploded"
                    ? "translateZ(80px) rotateY(-12deg)"
                    : "translateZ(45px) rotateY(-6deg)"
                  : "none",
              transition: "transform 0.5s ease, box-shadow 0.2s ease",
              position: "relative"
            }}
          >
            {/* Folio Accent */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 24, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1 }}>
                № 18
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 8px",
                  backgroundColor: "#ffffff",
                  color: "#002fa7",
                  fontWeight: 800,
                  borderRadius: 2
                }}
              >
                CANTILEVER
              </span>
            </div>

            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#93c5fd", marginBottom: 8, letterSpacing: 1 }}>
              EL LISSITZKY · PROUN 1920
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, lineHeight: 1.25, margin: "0 0 16px 0", color: "#ffffff" }}>
              The Station for the Transposition of Space
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "#dbeafe", margin: "0 0 24px 0" }}>
              The Proun acts as an interchange between painting and architecture. It breaks through the two-dimensional picture plane into
              multidimensional architectural space, treating letters as weight-bearing beams and cantilevers.
            </p>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: 16 }}>
              <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#bfdbfe" }}>
                STRUCTURAL INTEGRITY: 100% VALIDATED
              </div>
              <div style={{ fontSize: 11, color: "#ffffff", marginTop: 4, fontWeight: 600 }}>
                Asymmetrical load balanced by negative white space.
              </div>
            </div>
          </div>

          {/* PLANE 3: The Tactile Deboss Matrix (Cols 1-8) */}
          <div
            style={{
              gridColumn: "span 8",
              backgroundColor: "#ede8dd",
              padding: "32px 30px",
              borderRadius: 4,
              border: "1px solid #d6d3d1",
              boxShadow: planeShadow,
              transform:
                isHinged && viewMode !== "editorial"
                  ? viewMode === "exploded"
                    ? "translateZ(120px) rotateX(-8deg)"
                    : "translateZ(10px) rotateX(-4deg)"
                  : "none",
              transition: "transform 0.5s ease, box-shadow 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#78716c", fontWeight: 700 }}>
                TACTILE DEBOSS MATRIX // RAKING SUNLIGHT SHADOW VECTORS
              </span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#ff3b00", fontWeight: 800 }}>
                θ = {sunAngle}&deg; · Δh = {lightElevation}&deg;
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px 0", color: "#141413", fontFamily: "Georgia, serif" }}>
                  1. Negative Spatial Cleave
                </h3>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#44403c", margin: 0 }}>
                  Whitespace in architectural typography is not emptiness; it is the load-bearing concrete volume that prevents adjacent editorial
                  columns from collapsing under their own visual mass.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px 0", color: "#141413", fontFamily: "Georgia, serif" }}>
                  2. Tactile Material Friction
                </h3>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#44403c", margin: 0 }}>
                  By computing real-time cast shadows from the virtual sun, digital text acquires the physical relief of 600gsm cotton paper blind-debossing.
                  The eye reads through touch before it reads through syntax.
                </p>
              </div>
            </div>
          </div>

          {/* PLANE 4: The Spatial Index & Section Cut (Cols 9-12) */}
          <div
            style={{
              gridColumn: "span 4",
              backgroundColor: "#ffffff",
              padding: "28px 24px",
              borderRadius: 4,
              border: "1px solid #e7e5e4",
              boxShadow: planeShadow,
              transform:
                isHinged && viewMode !== "editorial"
                  ? viewMode === "exploded"
                    ? "translateZ(60px) rotateY(10deg)"
                    : "translateZ(30px) rotateY(4deg)"
                  : "none",
              transition: "transform 0.5s ease, box-shadow 0.2s ease"
            }}
          >
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a8a29e", marginBottom: 12 }}>
              ARCHITECTURAL MANIFESTO // INDEX
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { no: "01", title: "Dismantle the 12-Col Tape", tag: "GRID" },
                { no: "02", title: "Cantilevered Hierarchy", tag: "MASS" },
                { no: "03", title: "Physical Paper Relief", tag: "TEXTURE" },
                { no: "04", title: "Non-Linear Promenade", tag: "PATH" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: activeTab === idx ? "#f5f2eb" : "transparent",
                    borderRadius: 2,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: activeTab === idx ? "2px solid #002fa7" : "2px solid transparent"
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#a8a29e" }}>{item.no}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#141413" }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#78716c", fontWeight: 600 }}>
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f5f2eb", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#a8a29e" }}>
                LE CORBUSIER · PROMENADE ARCHITECTURALE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Footnote Monograph */}
      <footer
        style={{
          maxWidth: 1120,
          width: "100%",
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid #d6d3d1",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: "#78716c", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
          * AXIOM 18 VALIDATION: Digital web typography is not an endless flat parchment tape.
          By structuring the viewport as a series of interlocking 3D architectural planes, editorial hierarchy acquires
          cantilevered structural tension, physical letterpress relief, and the poetic spatial gravity of real architecture.
        </p>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#002fa7", fontWeight: 700 }}>
          DESIGN MINDS · GEMINI (NOON MIND)
        </div>
      </footer>
    </div>
  );
}
