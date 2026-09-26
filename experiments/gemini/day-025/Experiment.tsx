import React, { useState, useMemo } from 'react';

// --- Web Audio Synthesizer for Gutenberg Typefoundry ---
class FounderAcoustics {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Metallic Latch / Spring Bow Snap (Ressor Clamping)
  playSpringSnap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1850, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Sliding Mold L-Halves Friction
  playSlideClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // Molten Pour Sizzle
  playPourSizzle() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }

  // The Founder's Jerk (Le Coup de Main / Der Wurf)
  playJerkSnap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Low air whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.06);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      // Sharp inertial metallic clack
      const clack = this.ctx.createOscillator();
      const clackGain = this.ctx.createGain();
      clack.type = 'triangle';
      clack.frequency.setValueAtTime(3200, now + 0.04);
      clack.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      clackGain.gain.setValueAtTime(0.6, now + 0.04);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      clack.connect(clackGain);
      clackGain.connect(this.ctx.destination);

      osc.start(now);
      clack.start(now + 0.04);
      osc.stop(now + 0.1);
      clack.stop(now + 0.15);
    } catch {}
  }

  // Type Sort Ejection Clink (Silver lead piece dropping)
  playSortDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4200, now);
      osc.frequency.exponentialRampToValueAtTime(2100, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }
}

const acoustics = new FounderAcoustics();

type GlyphChoice = 'i' | 't' | 'g' | 'M';

export default function HandMoldExperiment() {
  // --- Workshop Stage (1 to 4) ---
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // Station 1: Mold Geometry & Clamping
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphChoice>('g');
  const [setWidth, setSetWidth] = useState<number>(4.2); // mm (2.0 to 9.0)
  const [isSpringClamped, setIsSpringClamped] = useState<boolean>(true);

  // Station 2: Ladle Pour & The Founder's Jerk
  const [meltTemp, setMeltTemp] = useState<number>(285); // Celsius
  const [jerkForce, setJerkForce] = useState<number>(4.5); // g acceleration
  const [isPoured, setIsPoured] = useState<boolean>(false);
  const [jerkExecuted, setJerkExecuted] = useState<boolean>(false);

  // Station 3: Alloy Metallurgy
  const [leadPct, setLeadPct] = useState<number>(78);
  const [antimonyPct, setAntimonyPct] = useState<number>(17);
  const [tinPct, setTinPct] = useState<number>(5);

  // Station 4: Ejection & Proofing
  const [isEjected, setIsEjected] = useState<boolean>(false);
  const [jetBroken, setJetBroken] = useState<boolean>(false);
  const [proofPrinted, setProofPrinted] = useState<boolean>(false);

  // Advanced Academic Modals
  const [showYoungLaplace, setShowYoungLaplace] = useState<boolean>(false);
  const [showInterchangeableTable, setShowInterchangeableTable] = useState<boolean>(false);
  const [showFluidShockwave, setShowFluidShockwave] = useState<boolean>(false);
  const [showDendriticCooling, setShowDendriticCooling] = useState<boolean>(false);

  // UI Settings
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  // Handle Glyph Preset
  const handleGlyphSelect = (glyph: GlyphChoice) => {
    acoustics.playSlideClick();
    setSelectedGlyph(glyph);
    if (glyph === 'i') setSetWidth(2.4);
    else if (glyph === 't') setSetWidth(3.6);
    else if (glyph === 'g') setSetWidth(4.2);
    else if (glyph === 'M') setSetWidth(8.2);
  };

  // Toggle Spring Bow
  const handleToggleSpring = () => {
    acoustics.playSpringSnap();
    setIsSpringClamped(!isSpringClamped);
  };

  // Pour Metal
  const handlePour = () => {
    acoustics.playPourSizzle();
    setIsPoured(true);
    setJerkExecuted(false);
  };

  // Execute Founder's Jerk
  const handleJerk = () => {
    acoustics.playJerkSnap();
    setJerkExecuted(true);
  };

  // Eject Sort
  const handleEject = () => {
    acoustics.playSortDrop();
    setIsEjected(true);
  };

  // Break Jet
  const handleBreakJet = () => {
    acoustics.playSpringSnap();
    setJetBroken(true);
  };

  // Proof Print
  const handleProof = () => {
    acoustics.playSortDrop();
    setProofPrinted(true);
  };

  // Metallurgical Calculations
  // Volume change: Pure Pb shrinks -3.4%, pure Sb expands +3.0%.
  const volumeDelta = useMemo(() => {
    const delta = (leadPct * -0.034) + (antimonyPct * 0.030) + (tinPct * -0.020);
    return delta;
  }, [leadPct, antimonyPct, tinPct]);

  // Young-Laplace Hydrodynamic Penetration:
  // Pressure with jerk: Delta P = rho * a_jerk * h ≈ 10500 kg/m³ * (jerkForce * 9.81) * 0.024 m
  const hydrodynamicPressure = useMemo(() => {
    const p = (10500 * (jerkForce * 9.81) * 0.024) / 1000; // kPa
    return p;
  }, [jerkForce]);

  // Minimum resolvable serif radius: r_min = 2 * gamma / Delta P (gamma = 0.45 N/m)
  const resolvableRadius = useMemo(() => {
    if (!jerkExecuted) return 45; // Blunted 45um under pure gravity
    const r = (2 * 0.45) / (hydrodynamicPressure * 1000); // meters
    return Math.max(5.0, r * 1e6); // micrometers
  }, [hydrodynamicPressure, jerkExecuted]);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#121316',
      color: '#e4e2dd',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Header Navigation */}
      <header style={{
        padding: '12px 28px',
        backgroundColor: '#191b22',
        borderBottom: '1px solid #2a2e38',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#452a17',
            color: '#f59e0b',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'serif',
            border: '1px solid #78350f'
          }}>HM</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
              {lang === 'ko' ? '구텐베르크 2분할 조절식 수동 활자 주조소' : "GUTENBERG HAND MOLD KINEMATICS (c. 1450)"}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              SLIDING L-FRAME · LE COUP DE MAIN · ANTIMONY EXPANSION (Pb-Sb-Sn)
            </div>
          </div>
        </div>

        {/* Stage Progression Selector */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { s: 1, label: lang === 'ko' ? '1. 주조기 자폭 조절' : '1. L-Mold Width' },
            { s: 2, label: lang === 'ko' ? '2. 쇳물 주입 & 반동 도약' : '2. Pour & Jerk' },
            { s: 3, label: lang === 'ko' ? '3. 안티몬 응고 팽창' : '3. Metallurgy' },
            { s: 4, label: lang === 'ko' ? '4. 탈형 & 인쇄 검증' : '4. Eject & Proof' }
          ].map(({ s, label }) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2 | 3 | 4)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeStage === s ? '#d97706' : '#232731',
                border: `1px solid ${activeStage === s ? '#f59e0b' : '#374151'}`,
                color: activeStage === s ? '#ffffff' : '#9ca3af',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {label}
            </button>
          ))}

          {/* Theoretical Modals */}
          <button
            onClick={() => setShowFluidShockwave(!showFluidShockwave)}
            style={{
              padding: '6px 10px',
              backgroundColor: showFluidShockwave ? '#ea580c' : '#232731',
              border: `1px solid ${showFluidShockwave ? '#f97316' : '#374151'}`,
              color: showFluidShockwave ? '#ffffff' : '#fdba74',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              marginLeft: '4px'
            }}
          >
            {lang === 'ko' ? '유체 충격파 관성압' : 'Fluid Shockwave'}
          </button>

          <button
            onClick={() => setShowDendriticCooling(!showDendriticCooling)}
            style={{
              padding: '6px 10px',
              backgroundColor: showDendriticCooling ? '#059669' : '#232731',
              border: `1px solid ${showDendriticCooling ? '#10b981' : '#374151'}`,
              color: showDendriticCooling ? '#ffffff' : '#a7f3d0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {lang === 'ko' ? '180ms 급랭 팽창 곡선' : '180ms Chill Curve'}
          </button>

          <button
            onClick={() => setShowYoungLaplace(!showYoungLaplace)}
            style={{
              padding: '6px 10px',
              backgroundColor: showYoungLaplace ? '#0284c7' : '#232731',
              border: `1px solid ${showYoungLaplace ? '#38bdf8' : '#374151'}`,
              color: showYoungLaplace ? '#ffffff' : '#7dd3fc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {lang === 'ko' ? '영-라플라스 식' : 'Young-Laplace'}
          </button>

          <button
            onClick={() => setShowInterchangeableTable(!showInterchangeableTable)}
            style={{
              padding: '6px 10px',
              backgroundColor: showInterchangeableTable ? '#7c3aed' : '#232731',
              border: `1px solid ${showInterchangeableTable ? '#a78bfa' : '#374151'}`,
              color: showInterchangeableTable ? '#ffffff' : '#ddd6fe',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {lang === 'ko' ? '호환 부품 규격' : 'Parts Standards'}
          </button>

          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#232731',
              border: '1px solid #374151',
              color: '#d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              marginLeft: '8px'
            }}
          >
            {lang === 'ko' ? 'EN' : '한국어'}
          </button>
        </div>
      </header>

      {/* Main Typefoundry Workshop View */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        background: 'radial-gradient(circle at 50% 30%, #1e2028 0%, #0e0f12 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1140px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Column: 3D Hand Mold Visualizer & Cross Section */}
          <div style={{
            backgroundColor: '#171920',
            borderRadius: '8px',
            border: '1px solid #2a2e38',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3efe6' }}>
                {lang === 'ko' ? '구텐베르크 수동 주조기 (Handgießinstrument)' : 'Sliding Two-Part Hand Mold Assembly'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f59e0b', fontWeight: 700 }}>
                {isSpringClamped ? (lang === 'ko' ? '스프링 보우 고정됨 (35 N)' : 'Spring Bow Clamped (35 N)') : (lang === 'ko' ? '금형 개방됨' : 'Mold Unclamped')}
              </span>
            </div>

            {/* Interactive Hand Mold Visual Display */}
            <div style={{
              width: '100%',
              height: '380px',
              backgroundColor: '#0c0d10',
              borderRadius: '6px',
              border: '1px solid #232731',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {/* Funnel Throat Sprue (Top) */}
              <div style={{
                position: 'absolute',
                top: '25px',
                width: '120px',
                height: '40px',
                background: 'linear-gradient(180deg, #4b5563 0%, #2d3340 100%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 70% 100%, 30% 100%)',
                border: '1px solid #64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isPoured && (
                  <div style={{
                    width: '30px',
                    height: '100%',
                    backgroundColor: '#f97316',
                    boxShadow: '0 0 15px #f97316'
                  }}/>
                )}
              </div>

              {/* Two Interlocking L-Mold Halves */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginTop: '15px'
              }}>
                {/* Left Half (Male Carriage in Wood Casing) */}
                <div style={{
                  width: '110px',
                  height: '220px',
                  backgroundColor: '#4a2e18',
                  border: '2px solid #2c1a0e',
                  borderRadius: '4px 0 0 4px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), -5px 10px 20px rgba(0,0,0,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  paddingRight: '6px',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '9px',
                    color: '#a16207',
                    fontWeight: 700,
                    writingMode: 'vertical-rl',
                    position: 'absolute',
                    left: '8px',
                    top: '20px'
                  }}>
                    WALNUT CASING
                  </div>
                  {/* Steel Carriage Surface */}
                  <div style={{
                    width: '35px',
                    height: '180px',
                    backgroundColor: '#525866',
                    border: '1px solid #1f2229',
                    borderRadius: '2px 0 0 2px'
                  }}/>
                </div>

                {/* Variable Gap: The Type Body Cavity */}
                <div style={{
                  width: `${setWidth * 10}px`,
                  height: '180px',
                  backgroundColor: isPoured ? (volumeDelta >= 0 ? '#94a3b8' : '#475569') : '#08080a',
                  border: '1px dashed #f59e0b',
                  transition: 'width 0.2s ease, background-color 0.4s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isPoured ? 'inset 0 0 10px #f97316' : 'none'
                }}>
                  {/* Internal Liquid/Solid Molten Metal */}
                  {isPoured && (
                    <div style={{
                      position: 'absolute',
                      fontFamily: '"UnifrakturMaguntia", "Cinzel", serif',
                      fontSize: `${Math.min(32, setWidth * 6)}px`,
                      fontWeight: 800,
                      color: jerkExecuted ? (volumeDelta >= 0 ? '#10b981' : '#f59e0b') : '#ef4444',
                      textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                    }}>
                      {selectedGlyph}
                    </div>
                  )}

                  {/* Width Label */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    color: '#fef08a'
                  }}>
                    {setWidth.toFixed(1)}mm
                  </div>
                </div>

                {/* Right Half (Female Carriage in Wood Casing) */}
                <div style={{
                  width: '110px',
                  height: '220px',
                  backgroundColor: '#4a2e18',
                  border: '2px solid #2c1a0e',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 5px 10px 20px rgba(0,0,0,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  paddingLeft: '6px',
                  position: 'relative'
                }}>
                  {/* Steel Carriage Surface */}
                  <div style={{
                    width: '35px',
                    height: '180px',
                    backgroundColor: '#3b3f4a',
                    border: '1px solid #1f2229',
                    borderRadius: '0 2px 2px 0'
                  }}/>
                  <div style={{
                    fontSize: '9px',
                    color: '#a16207',
                    fontWeight: 700,
                    writingMode: 'vertical-rl',
                    position: 'absolute',
                    right: '8px',
                    top: '20px'
                  }}>
                    STEEL L-SLIDE
                  </div>
                </div>
              </div>

              {/* Bottom Copper Matrix Bar */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                width: '140px',
                height: '35px',
                backgroundColor: '#b45339',
                borderRadius: '3px',
                border: '1px solid #7c2d12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.7)'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#fef08a', fontFamily: 'monospace' }}>
                  COPPER MATRIX [{selectedGlyph}]
                </span>
              </div>

              {/* Spring Bow (Ressor) Overlay Wire */}
              {isSpringClamped && (
                <div style={{
                  position: 'absolute',
                  bottom: '18px',
                  width: '260px',
                  height: '30px',
                  border: '3px solid #94a3b8',
                  borderTop: 'none',
                  borderRadius: '0 0 130px 130px',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
                }}/>
              )}
            </div>

            {/* Kinetic Telemetry HUD */}
            <div style={{
              width: '100%',
              marginTop: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <div style={{ backgroundColor: '#1e212b', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>SET WIDTH</div>
                <div style={{ color: '#f59e0b', fontWeight: 700 }}>{setWidth.toFixed(1)} mm</div>
              </div>
              <div style={{ backgroundColor: '#1e212b', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>JERK HEAD</div>
                <div style={{ color: jerkExecuted ? '#10b981' : '#6b7280', fontWeight: 700 }}>
                  {jerkExecuted ? `${hydrodynamicPressure.toFixed(0)} kPa` : '1.0 g (0 kPa)'}
                </div>
              </div>
              <div style={{ backgroundColor: '#1e212b', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>SERIF RESOLUTION</div>
                <div style={{ color: resolvableRadius <= 10 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  {resolvableRadius.toFixed(1)} μm
                </div>
              </div>
              <div style={{ backgroundColor: '#1e212b', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>VOLUME DELTA</div>
                <div style={{ color: volumeDelta >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  {volumeDelta >= 0 ? `+${volumeDelta.toFixed(2)}%` : `${volumeDelta.toFixed(2)}%`}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stage Controls & Interactive Stations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ADVANCED MODAL 1: FLUID SHOCKWAVE INSPECTOR */}
            {showFluidShockwave && (
              <div style={{
                backgroundColor: '#26140e',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #ea580c',
                boxShadow: '0 10px 25px rgba(234, 88, 12, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#fb923c', fontSize: '13px' }}>
                    {lang === 'ko' ? '르 쿠 드 맹 유체 동역학 관성 충격파 단면' : 'Le Coup de Main Hydrodynamic Shockwave'}
                  </span>
                  <button onClick={() => setShowFluidShockwave(false)} style={{ background: 'none', border: 'none', color: '#fdba74', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ fontSize: '11px', color: '#fed7aa', lineHeight: 1.6, marginBottom: '8px' }}>
                  {lang === 'ko'
                    ? '주조사의 4.5g 상향 가속도는 쇳물 기둥에 120 kPa의 동적 압력파를 유도하여, 레이놀즈 수 Re ≈ 1,420의 층류 분출을 일으키며 7 μm 미세 세리프 음각 구석까지 완벽히 충진합니다.'
                    : "The founder's 4.5g upward jerk drives a 120 kPa dynamic shockwave down the molten column (Re ≈ 1,420), completely overcoming surface tension in 7 μm corners."}
                </div>
                <div style={{ backgroundColor: '#170c08', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', color: '#fb923c' }}>
                  Re = 1,420 (Laminar) · We = 280 · Capillary Number Ca = 0.042 · Jet Head ΔP = 120.4 kPa
                </div>
              </div>
            )}

            {/* ADVANCED MODAL 2: 180MS DENDRITIC COOLING CURVE */}
            {showDendriticCooling && (
              <div style={{
                backgroundColor: '#0c241b',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #059669',
                boxShadow: '0 10px 25px rgba(5, 150, 105, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#34d399', fontSize: '13px' }}>
                    {lang === 'ko' ? '180ms 급랭 및 안티몬(Sb) 능면체 결정 팽창' : '180ms Chill Curve & Rhombohedral Antimony Expansion'}
                  </span>
                  <button onClick={() => setShowDendriticCooling(false)} style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ fontSize: '11px', color: '#d1fae5', lineHeight: 1.6, marginBottom: '8px' }}>
                  {lang === 'ko'
                    ? '구리 매트릭스의 높은 열전도(390 W/m·K)로 인해 활자 페이스가 180ms 만에 240°C 공정점으로 급랭됩니다. 안티몬 결정이 +3.0% 팽창하여 42 MPa의 벽면 밀착 압력을 형성합니다.'
                    : "Copper's high thermal diffusivity (390 W/m·K) freezes the face in 180ms at the 240°C eutectic plateau. Antimony expands +3.0%, locking the sort with 42 MPa wall pressure."}
                </div>
                <div style={{ backgroundColor: '#061611', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', color: '#34d399' }}>
                  t_freeze = 180 ms · Plateau = 240°C Eutectic · Contact Stress = 42.1 MPa · Zero Flash
                </div>
              </div>
            )}

            {/* Theoretical Modals */}
            {showYoungLaplace && (
              <div style={{
                backgroundColor: '#0f2027',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #0284c7',
                boxShadow: '0 10px 25px rgba(2, 132, 199, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>
                    {lang === 'ko' ? '영-라플라스 모세관 표면장력 한계식' : 'Young-Laplace Capillary Barrier Equation'}
                  </span>
                  <button onClick={() => setShowYoungLaplace(false)} style={{ background: 'none', border: 'none', color: '#7dd3fc', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ fontSize: '11px', color: '#bae6fd', lineHeight: 1.6, marginBottom: '8px' }}>
                  {lang === 'ko'
                    ? '액체 납 표면장력(γ = 0.45 N/m)으로 인해 1g 중력만으로는 미세 세리프(7 μm) 진입 압력(80 kPa)을 넘지 못합니다. 주조사의 4.5g 상향 반동 도약만이 120 kPa 관성압을 만들어 면도날 모서리를 완성합니다.'
                    : "Molten alloy surface tension (γ = 0.45 N/m) blocks entry into 7 μm serifs under 1g gravity. The founder's 4.5g upward jerk delivers 120 kPa of dynamic inertial pressure, shattering the capillary barrier."}
                </div>
                <div style={{ backgroundColor: '#081419', padding: '6px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8' }}>
                  ΔP_net = ρ·a_jerk·h - (2γ·cos θ / r) ≥ 0
                </div>
              </div>
            )}

            {showInterchangeableTable && (
              <div style={{
                backgroundColor: '#20162b',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #7c3aed',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '13px' }}>
                    {lang === 'ko' ? '구텐베르크 호환 부품 공업 표준 규격 (1450)' : 'Gutenberg Precision Interchangeability Standards'}
                  </span>
                  <button onClick={() => setShowInterchangeableTable(false)} style={{ background: 'none', border: 'none', color: '#c4b5fd', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ fontSize: '11px', color: '#ddd6fe', lineHeight: 1.6 }}>
                  {lang === 'ko'
                    ? '높이-투-페이퍼(23.56 mm)와 본체 두께(Point Size)는 절대 상수로 고정되고, 가로 자폭(Set-width)만 슬라이딩 조절되어 5,000개의 낱글자가 하나의 직사각형 활자판에 완벽히 묶입니다.'
                    : 'Height-to-paper (23.56 mm) and point size are locked as immutable constants, while set-width slides horizontally, allowing 5,000 distinct pieces to lock together in a chase without a single gap.'}
                </div>
              </div>
            )}

            {/* STAGE 1: L-Mold Geometry & Clamping */}
            {activeStage === 1 && (
              <div style={{ backgroundColor: '#171920', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e38' }}>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 1: L-금형 슬라이딩 자폭 조절 및 매트릭스 고정' : 'Stage 1: Sliding L-Mold Set-Width & Clamping'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '글자의 폭에 맞춰 두 개의 L자형 강철 금형을 미끄러뜨립니다. 높이(23.56mm)와 두께는 고정된 채, 가로 너비만 정밀하게 조절됩니다.'
                    : 'Slide the two interlocking L-shaped steel carriages to set the character width. Height-to-paper remains locked as an immutable constant.'}
                </p>

                {/* Glyph Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { id: 'i', label: "'i' (2.4mm)" },
                    { id: 't', label: "'t' (3.6mm)" },
                    { id: 'g', label: "'g' (4.2mm)" },
                    { id: 'M', label: "'M' (8.2mm)" }
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleGlyphSelect(id as GlyphChoice)}
                      style={{
                        padding: '8px',
                        backgroundColor: selectedGlyph === id ? '#2d3340' : '#1f2129',
                        border: `1px solid ${selectedGlyph === id ? '#f59e0b' : '#374151'}`,
                        color: selectedGlyph === id ? '#fef08a' : '#9ca3af',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Continuous Set-Width Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '미세 자폭 조절 (Chasse)' : 'Micrometric Set-Width'}</span>
                    <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>{setWidth.toFixed(2)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="1.8"
                    max="9.0"
                    step="0.1"
                    value={setWidth}
                    onChange={(e) => setSetWidth(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                </div>

                {/* Spring Bow Toggle */}
                <button
                  onClick={handleToggleSpring}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isSpringClamped ? '#059669' : '#d97706',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🧲</span>
                  {isSpringClamped
                    ? (lang === 'ko' ? '스프링 보우 해제하기 (주조기 열기)' : 'Release Spring Bow (Open Mold)')
                    : (lang === 'ko' ? '스프링 보우 걸기 (35N 구리 매트릭스 고정)' : 'Clamp Spring Bow (35N Matrix Lock)')}
                </button>
              </div>
            )}

            {/* STAGE 2: Ladle Pour & Coup de Main */}
            {activeStage === 2 && (
              <div style={{ backgroundColor: '#171920', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e38' }}>
                <div style={{ fontWeight: 700, color: '#f97316', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 2: 쇳물 주입 및 주조사의 반동 도약 (Le Coup de Main)' : "Stage 2: Ladle Pour & The Founder's Jerk"}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '285°C 쇳물을 주조기에 붓는 찰나, 주조사는 손목을 위로 낚아채는 도약(Wurf)을 가해야 합니다. 반동이 없으면 표면장력으로 모서리가 둥글게 뭉개집니다.'
                    : 'At the exact instant of ladle pouring, snap the wrist upward. Without this jerk, liquid surface tension prevents metal from filling the razor serifs.'}
                </p>

                {/* Jerk Acceleration Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '손목 상향 반동 가속도' : 'Wrist Jerk Acceleration'}</span>
                    <span style={{ color: '#f97316', fontFamily: 'monospace', fontWeight: 700 }}>{jerkForce.toFixed(1)} g</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.2"
                    value={jerkForce}
                    onChange={(e) => setJerkForce(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handlePour}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#ea580c',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🔥 {lang === 'ko' ? '쇳물 붓기 (Pour 285°C)' : 'Pour Ladle'}
                  </button>

                  <button
                    onClick={handleJerk}
                    disabled={!isPoured}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: isPoured ? '#d97706' : '#232731',
                      border: 'none',
                      borderRadius: '4px',
                      color: isPoured ? '#fff' : '#6b7280',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: isPoured ? 'pointer' : 'not-allowed'
                    }}
                  >
                    ⚡ {lang === 'ko' ? '반동 도약! (Coup de Main)' : 'Snap Jerk!'}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: Ternary Alloy Solidification */}
            {activeStage === 3 && (
              <div style={{ backgroundColor: '#171920', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e38' }}>
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 3: 안티몬(Sb) 비정상 응고 팽창 배합' : 'Stage 3: Antimony Solidification Expansion'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '납의 수축(-3.4%)을 안티몬의 결정 팽창(+3.0%)으로 상쇄하여 구리 매트릭스 벽면에 42 MPa의 밀착 압력을 형성합니다. 안티몬이 부족하면 글자 면이 함몰됩니다.'
                    : "Antimony expands +3.0% upon crystallization, counteracting lead's -3.4% shrinkage and pressing the cooling sort against the matrix with 42 MPa internal stress."}
                </p>

                {/* Antimony Slider */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '안티몬 (Antimony Sb)' : 'Antimony (Sb) %'}</span>
                    <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>{antimonyPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="28"
                    step="1"
                    value={antimonyPct}
                    onChange={(e) => {
                      const sb = parseInt(e.target.value);
                      setAntimonyPct(sb);
                      setLeadPct(95 - sb);
                    }}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>

                <div style={{
                  padding: '10px 14px',
                  backgroundColor: volumeDelta >= 0 ? '#064e3b' : '#7f1d1d',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: volumeDelta >= 0 ? '#a7f3d0' : '#fecaca',
                  fontWeight: 600
                }}>
                  {volumeDelta >= 0
                    ? (lang === 'ko' ? `✓ 응고 팽창 (+${volumeDelta.toFixed(2)}%): 면도날처럼 날카로운 활자 복제 성공` : `✓ Solidification Expansion (+${volumeDelta.toFixed(2)}%): Razor-sharp matrix replication`)
                    : (lang === 'ko' ? `✕ 열수축 결함 (${volumeDelta.toFixed(2)}%): 글자 인쇄면 수축 분화구 발생` : `✕ Shrinkage Cavity (${volumeDelta.toFixed(2)}%): Sunken pipe void on typeface`)}
                </div>
              </div>
            )}

            {/* STAGE 4: Ejection & Proof Pull */}
            {activeStage === 4 && (
              <div style={{ backgroundColor: '#171920', padding: '20px', borderRadius: '8px', border: '1px solid #2a2e38' }}>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 4: 활자 탈형, 제트 절단 및 시험 인쇄' : 'Stage 4: Mold Release, Eject & Proof Print'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '스프링을 젖히고 금형을 열어 은빛 금속 활자를 꺼냅니다. 탕구 찌꺼기(Jet)를 꺾어낸 뒤 42행 성서의 텍스투라 글자를 시험 인쇄하세요.'
                    : 'Open the mold and drop the finished sort. Break off the casting jet, ink with black varnish, and stamp a crisp 1450 Gutenberg proof.'}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <button
                    onClick={handleEject}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#475569',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    🪙 {lang === 'ko' ? '활자 떨어뜨리기 (Eject)' : 'Eject Sort'}
                  </button>

                  <button
                    onClick={handleBreakJet}
                    disabled={!isEjected}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: isEjected ? '#b45309' : '#232731',
                      border: 'none',
                      borderRadius: '4px',
                      color: isEjected ? '#fff' : '#6b7280',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: isEjected ? 'pointer' : 'not-allowed'
                    }}
                  >
                    ✂️ {lang === 'ko' ? '제트 꺾어내기 (Break)' : 'Break Jet'}
                  </button>

                  <button
                    onClick={handleProof}
                    disabled={!jetBroken}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: jetBroken ? '#059669' : '#232731',
                      border: 'none',
                      borderRadius: '4px',
                      color: jetBroken ? '#fff' : '#6b7280',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: jetBroken ? 'pointer' : 'not-allowed'
                    }}
                  >
                    📜 {lang === 'ko' ? '시험 인쇄 (Proof)' : 'Proof Print'}
                  </button>
                </div>

                {/* Proof Print Preview */}
                {proofPrinted && (
                  <div style={{
                    backgroundColor: '#faf8f2',
                    border: '1px solid #e2d9c8',
                    padding: '14px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#1a1816'
                  }}>
                    <div style={{ fontSize: '9px', color: '#78716c', fontFamily: 'monospace', marginBottom: '4px' }}>
                      MAINZ BIBLE PROOF · RAG PAPER · LINSEED OIL VARNISH
                    </div>
                    <div style={{
                      fontFamily: '"UnifrakturMaguntia", "Cinzel", serif',
                      fontSize: '52px',
                      fontWeight: 900,
                      color: '#000000',
                      filter: resolvableRadius <= 10 ? 'none' : 'blur(2px)'
                    }}>
                      {selectedGlyph}
                    </div>
                    <div style={{ fontSize: '10px', color: resolvableRadius <= 10 ? '#15803d' : '#b91c1c', fontWeight: 700, marginTop: '4px' }}>
                      {resolvableRadius <= 10
                        ? (lang === 'ko' ? '완벽한 7μm 면도날 세리프 해상도 달성' : 'Flawless 7μm Razor-Sharp Serifs Verified')
                        : (lang === 'ko' ? '표면장력 미극복으로 인한 뭉툭한 글자' : 'Blunted Edges: Surface Tension Not Overcome')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Academic Theoretical Insight Card */}
            <div style={{
              backgroundColor: '#171920',
              borderRadius: '8px',
              border: '1px solid #2a2e38',
              padding: '16px 20px',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '6px', fontSize: '13px' }}>
                {lang === 'ko' ? '구텐베르크 주조기의 기구학적 위대함' : 'Gutenberg Precision Jig Legacy'}
              </div>
              <p style={{ color: '#d1d5db', margin: 0 }}>
                {lang === 'ko'
                  ? '구텐베르크의 진정한 혁명은 가동 활자가 아니라 2분할 슬라이딩 주조기였습니다. 활자 높이를 23.56mm로 엄격히 고정하면서 글자 폭만 유동 조절함으로써, 인류 최초로 완벽히 호환 가능한 대량 생산 규격 부품 시스템을 탄생시켰습니다.'
                  : "Gutenberg's true revolution was the sliding two-part hand mold. By holding height-to-paper rigidly at 23.56 mm while allowing horizontal width to slide, he engineered the world's first precision interchangeable mass-production system."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
