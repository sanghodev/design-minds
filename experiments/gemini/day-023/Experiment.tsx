import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Web Audio Synthesizer for Albion Hand Press & Inking Tack Acoustics ---
class LetterpressAcoustics {
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

  // Heavy Cast-Iron Platen Toggle Impact Thud
  playPlatenImpact(pressureRatio: number = 0.7) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Low-frequency sub-bass thud (iron platen mass)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * (0.8 + pressureRatio * 0.4), now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

      gain.gain.setValueAtTime(0.6 * pressureRatio, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      // Noise burst for metal-paper-bed contact
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(600, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35 * pressureRatio, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
      noise.start(now);
    } catch {
      // AudioContext unavailable
    }
  }

  // High-Tack Linseed Oil Paper Peel sound (adhesive suction)
  playPaperPeel() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * 0.2 * env;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext unavailable
    }
  }

  // Mechanical Toggle Lever Creak
  playLeverCreak() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // AudioContext unavailable
    }
  }
}

const acoustics = new LetterpressAcoustics();

export default function PlatenInkSquashExperiment() {
  // --- Simulation State ---
  // Impression Pressure: 0.0 to 30.0 MPa
  const [pressure, setPressure] = useState<number>(22.4); // William Morris default: 22.4 MPa
  // Makeready Tissue Packing (0 to 4 layers)
  const [makereadyLayers, setMakereadyLayers] = useState<number>(2);
  // Paper Dampness: 'DRY' (12% RH) vs 'DAMP' (38% moisture)
  const [paperDampness, setPaperDampness] = useState<'DRY' | 'DAMP'>('DAMP');
  // Inspection Loupe Zoom (1x to 40x)
  const [loupeZoom, setLoupeZoom] = useState<number>(25);
  // Selected Technology Mode: 'LETTERPRESS' | 'OFFSET' | 'DIGITAL'
  const [techMode, setTechMode] = useState<'LETTERPRESS' | 'OFFSET' | 'DIGITAL'>('LETTERPRESS');
  // Raking Light Sun Angle (Azimuth: 0 to 360 deg, Elevation: 5 to 60 deg)
  const [sunAzimuth, setSunAzimuth] = useState<number>(315);
  const [sunElevation, setSunElevation] = useState<number>(18);
  // Language Toggle
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  // Active Macro Loupe position on canvas (normalized 0 to 1)
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 0.52, y: 0.42 });

  const prevPressureRef = useRef<number>(pressure);

  // --- Derived Physical Parameters ---
  // Effective Nip Pressure with Makeready Boost: P_eff = P * (1 + 0.12 * makeready)
  const effectivePressure = useMemo(() => {
    return Math.min(35, pressure * (1 + 0.12 * makereadyLayers));
  }, [pressure, makereadyLayers]);

  // Paper Deboss Indentation Depth: h_deboss = h_max * (1 - exp(-P_eff / E_pulp))
  // Damp paper is softer (E_pulp = 18 MPa), Dry paper is stiffer (E_pulp = 38 MPa)
  const debossDepth = useMemo(() => {
    if (techMode !== 'LETTERPRESS') return 0;
    const Ep = paperDampness === 'DAMP' ? 18.0 : 38.0;
    const maxDeboss = paperDampness === 'DAMP' ? 0.22 : 0.12; // mm
    return maxDeboss * (1 - Math.exp(-effectivePressure / Ep));
  }, [effectivePressure, paperDampness, techMode]);

  // Ink Squash Halo Rim Width & Optical Density
  // Stefan-Reynolds squeeze flow: h_core thins, h_rim swells
  const squashMetrics = useMemo(() => {
    if (techMode === 'OFFSET') {
      return { rimWidth: 0, haloDensity: 1.45, coreDensity: 1.45, haloHeight: 0, status: 'FLAT_UNIFORM' };
    }
    if (techMode === 'DIGITAL') {
      return { rimWidth: 0, haloDensity: 1.0, coreDensity: 1.0, haloHeight: 0, status: 'ZERO_THICKNESS' };
    }

    if (effectivePressure < 8.0) {
      return {
        rimWidth: 0.01,
        haloDensity: 1.15,
        coreDensity: 0.85,
        haloHeight: 2,
        status: 'UNDER_IMPRESSED (HOLIDAYS)'
      };
    } else if (effectivePressure <= 26.0) {
      const pFactor = (effectivePressure - 8.0) / 18.0;
      return {
        rimWidth: 0.035 + pFactor * 0.045, // 0.035 to 0.080 mm
        haloDensity: 1.65 + pFactor * 0.25, // up to 1.90 OD
        coreDensity: 1.35 + pFactor * 0.10, // 1.35 to 1.45 OD
        haloHeight: 6 + pFactor * 10, // up to 16 μm
        status: 'OPTIMAL BITE (KELMSCOTT PROPORTION)'
      };
    } else {
      return {
        rimWidth: 0.12,
        haloDensity: 1.95,
        coreDensity: 1.55,
        haloHeight: 22,
        status: 'OVER_IMPRESSED (BLOWOUT SQUEEZE)'
      };
    }
  }, [effectivePressure, techMode]);

  // Handle Lever Pressure Drag with Ratchet Acoustics
  const handlePressureChange = (val: number) => {
    const rounded = Math.round(val * 10) / 10;
    if (Math.abs(rounded - prevPressureRef.current) >= 1.5) {
      acoustics.playLeverCreak();
      prevPressureRef.current = rounded;
    }
    setPressure(rounded);
  };

  // Trigger Platen Impression
  const triggerImpression = () => {
    acoustics.playPlatenImpact(effectivePressure / 30);
    setTimeout(() => {
      acoustics.playPaperPeel();
    }, 180);
  };

  // Light Shadow Vectors from Azimuth & Elevation
  const rad = (sunAzimuth * Math.PI) / 180;
  const shadowDist = (debossDepth * 28) / Math.tan((sunElevation * Math.PI) / 180);
  const shadowX = -Math.cos(rad) * shadowDist;
  const shadowY = Math.sin(rad) * shadowDist;

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#161719',
      color: '#e7e5e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Header & Navigation */}
      <header style={{
        padding: '14px 28px',
        backgroundColor: '#1e2024',
        borderBottom: '1px solid #2e323b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#b45309',
            color: '#fff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'serif'
          }}>P</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
              {lang === 'ko' ? '활판 인쇄 압판 각인 & 잉크 스쿼시 연구소' : 'PLATEN PRESS IMPRESSION & INK SQUASH LABORATORY'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              STEFAN-REYNOLDS SQUEEZE (F_nip = 3πηR⁴/2h³·dh/dt) · BINGHAM PLASTICITY · QUETSCHRAND
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2b2e35',
              border: '1px solid #3e4450',
              color: '#d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {lang === 'ko' ? 'EN' : '한국어'}
          </button>

          <button
            onClick={triggerImpression}
            style={{
              padding: '6px 18px',
              backgroundColor: '#b45309',
              border: 'none',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💥</span> {lang === 'ko' ? '압판 타격 각인 (Pull Lever)' : 'Pull Platen Lever'}
          </button>

          <div style={{ display: 'flex', border: '1px solid #3e4450', borderRadius: '4px', overflow: 'hidden' }}>
            {(['LETTERPRESS', 'OFFSET', 'DIGITAL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTechMode(t)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: techMode === t ? '#2563eb' : '#2b2e35',
                  border: 'none',
                  color: techMode === t ? '#fff' : '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        background: 'radial-gradient(circle at 50% 30%, #22252a 0%, #121315 100%)'
      }}>
        {/* Top Control Dashboard: Pressure, Makeready, Paper Dampness, Raking Light */}
        <div style={{
          width: '100%',
          maxWidth: '1080px',
          padding: '16px 22px',
          backgroundColor: '#1e2126',
          borderRadius: '8px',
          border: '1px solid #2e333d',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '18px'
        }}>
          {/* Pressure Lever Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
                {lang === 'ko' ? '압판 수직 압력 (Platen Pressure)' : 'Vertical Platen Pressure'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
                {pressure.toFixed(1)} MPa
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="30.0"
              step="0.5"
              value={pressure}
              onChange={(e) => handlePressureChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              <span>0 MPa (Kiss)</span>
              <span>18-25 MPa (Morris)</span>
              <span>30 MPa (Crush)</span>
            </div>
          </div>

          {/* Makeready Tissue Packing */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
                {lang === 'ko' ? '메이크레디 한지 덧댐 (Tissue Packing)' : 'Makeready Tissue Packing'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>
                {makereadyLayers} {lang === 'ko' ? '겹 (+24%)' : 'Layers (+24%)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={makereadyLayers}
              onChange={(e) => setMakereadyLayers(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              <span>0 (Bare Tympan)</span>
              <span>2 (French Silk)</span>
              <span>4 (Heavy Spot)</span>
            </div>
          </div>

          {/* Paper Substrate Moisture */}
          <div>
            <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
              {lang === 'ko' ? '면섬유 수분 함유도 (Rag Moisture)' : 'Paper Moisture Content'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPaperDampness('DRY')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: paperDampness === 'DRY' ? '#374151' : '#23272f',
                  border: `1px solid ${paperDampness === 'DRY' ? '#9ca3af' : '#374151'}`,
                  color: paperDampness === 'DRY' ? '#fff' : '#9ca3af',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                {lang === 'ko' ? '건조 (Dry 12%)' : 'Dry (12% RH)'}
              </button>
              <button
                onClick={() => setPaperDampness('DAMP')}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: paperDampness === 'DAMP' ? '#047857' : '#23272f',
                  border: `1px solid ${paperDampness === 'DAMP' ? '#10b981' : '#374151'}`,
                  color: paperDampness === 'DAMP' ? '#fff' : '#9ca3af',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                {lang === 'ko' ? '축축함 (Damp 38%)' : 'Damp (38% H2O)'}
              </button>
            </div>
          </div>

          {/* Raking Light Azimuth */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
                {lang === 'ko' ? '사광 조명 각도 (Raking Light)' : 'Raking Sunlight Azimuth'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#eab308', fontSize: '13px' }}>
                {sunAzimuth}° ({sunElevation}° Elev)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={sunAzimuth}
              onChange={(e) => setSunAzimuth(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#eab308', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Central Display: Hand-Pulled Proof Sheet & Floating Micro-Loupe */}
        <div style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Proof Sheet Canvas (Left Side) */}
          <div style={{
            backgroundColor: '#fbfaf5',
            backgroundImage: 'radial-gradient(#ded7c6 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            borderRadius: '6px',
            padding: '40px 36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid #d9d1be',
            cursor: 'crosshair'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setLoupePos({
              x: (e.clientX - rect.left) / rect.width,
              y: (e.clientY - rect.top) / rect.height
            });
          }}
          >
            {/* Watermark Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#a8a29e', fontFamily: 'monospace' }}>
              <span>BATCHELOR HANDMADE RAG · WATERMARK: KELMSCOTT</span>
              <span>PRESSURE: {effectivePressure.toFixed(1)} MPa</span>
            </div>

            {/* Kelmscott Printed Title & Text with Dynamic Ink Squash & Deboss Relinquish */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{
                fontFamily: '"Cinzel", serif',
                fontSize: '44px',
                fontWeight: 700,
                letterSpacing: '3px',
                lineHeight: 1.1,
                color: techMode === 'DIGITAL' 
                  ? '#000000' 
                  : (techMode === 'OFFSET' ? '#27272a' : '#141416'),
                textShadow: techMode === 'LETTERPRESS' ? `
                  ${shadowX}px ${shadowY}px ${debossDepth * 18}px rgba(0,0,0,0.35),
                  0 0 ${squashMetrics.rimWidth * 40}px rgba(0,0,0,0.9),
                  inset 0 1px 2px rgba(255,255,255,0.4)
                ` : 'none',
                filter: techMode === 'LETTERPRESS' ? `drop-shadow(0 1px 1px rgba(0,0,0,0.4))` : 'none',
                transition: 'all 0.15s ease'
              }}>
                CHAUCER
              </div>

              <div style={{
                fontFamily: '"Newsreader", serif',
                fontStyle: 'italic',
                fontSize: '20px',
                color: '#3f3f46',
                margin: '12px 0 24px',
                textShadow: techMode === 'LETTERPRESS' ? `${shadowX * 0.4}px ${shadowY * 0.4}px 2px rgba(0,0,0,0.2)` : 'none'
              }}>
                The Works of Geoffrey Chaucer now newly imprinted
              </div>

              {/* Classic Middle English Poetry Stanza */}
              <div style={{
                fontFamily: '"Newsreader", serif',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#262626',
                maxWidth: '480px',
                margin: '0 auto',
                textAlign: 'left',
                borderLeft: '2px solid #d6cfbe',
                paddingLeft: '16px',
                textShadow: techMode === 'LETTERPRESS' ? `${shadowX * 0.3}px ${shadowY * 0.3}px 1.5px rgba(0,0,0,0.15)` : 'none'
              }}>
                <p style={{ margin: '0 0 6px' }}>
                  Whan that Aprille with his shoures soote,<br/>
                  The droghte of March hath perced to the roote,<br/>
                  And bathed every veyne in swich licóur,<br/>
                  Of which vertú engendred is the flour...
                </p>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#78716c', marginTop: '10px' }}>
                  HAMMERSMITH · M DCCC XCVI · KELMSCOTT PRESS
                </div>
              </div>
            </div>

            {/* Target Reticle Pin indicating where Loupe is sampling */}
            <div style={{
              position: 'absolute',
              left: `${loupePos.x * 100}%`,
              top: `${loupePos.y * 100}%`,
              width: '16px',
              height: '16px',
              transform: 'translate(-50%, -50%)',
              border: '1.5px solid #dc2626',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}>
              <div style={{ position: 'absolute', left: '50%', top: '-6px', width: '1px', height: '5px', backgroundColor: '#dc2626' }}/>
              <div style={{ position: 'absolute', left: '50%', bottom: '-6px', width: '1px', height: '5px', backgroundColor: '#dc2626' }}/>
              <div style={{ position: 'absolute', top: '50%', left: '-6px', height: '1px', width: '5px', backgroundColor: '#dc2626' }}/>
              <div style={{ position: 'absolute', top: '50%', right: '-6px', height: '1px', width: '5px', backgroundColor: '#dc2626' }}/>
            </div>

            {/* Bottom Status Ribbon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e7e2d4', paddingTop: '10px', fontSize: '11px', color: '#78716c', fontFamily: 'monospace' }}>
              <span>DEBOSS DEPTH: {(debossDepth * 1000).toFixed(0)} μm</span>
              <span>HALO RIM: +{squashMetrics.haloHeight.toFixed(0)} μm (D={squashMetrics.haloDensity.toFixed(2)})</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{squashMetrics.status}</span>
            </div>
          </div>

          {/* Right Panel: 40× Microscopic Loupe & Physical Cross-Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 40x Loupe Viewport */}
            <div style={{
              backgroundColor: '#1b1d22',
              borderRadius: '8px',
              border: '1px solid #2e333d',
              padding: '18px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3efe6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔬</span> {lang === 'ko' ? '40배율 현미경 루페 (Quetschrand 검사)' : '40× Microscopic Loupe Inspection'}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#eab308' }}>
                  STEM PROFILE (1200×)
                </span>
              </div>

              {/* Circular Loupe Window */}
              <div style={{
                width: '100%',
                height: '240px',
                backgroundColor: '#f5f2e9',
                borderRadius: '6px',
                border: '4px solid #2c3038',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Visualizing the Letterpress Stroke Cross Section at Micro Scale */}
                <svg width="100%" height="100%" viewBox="0 0 320 200">
                  {/* Paper Fiber Base with Deboss Depression */}
                  <path d={`M 0 130 L 70 130 Q 85 130 90 ${130 + debossDepth * 90} L 230 ${130 + debossDepth * 90} Q 235 130 250 130 L 320 130 L 320 200 L 0 200 Z`} fill="#e5dfd0"/>
                  
                  {techMode === 'LETTERPRESS' && (
                    <>
                      {/* Left Elevated Ink Squash Ridge */}
                      <path d={`M 85 130 Q 92 ${115 - squashMetrics.haloHeight * 1.5} 100 ${130 + debossDepth * 90} L 100 ${136 + debossDepth * 90} L 85 132 Z`} fill="#000000"/>
                      {/* Central Squeezed Ink Film */}
                      <rect x="100" y={130 + debossDepth * 90 - 2} width="120" height="5" fill="#1c1917"/>
                      {/* Right Elevated Ink Squash Ridge */}
                      <path d={`M 220 ${130 + debossDepth * 90} Q 228 ${115 - squashMetrics.haloHeight * 1.5} 235 130 L 235 132 L 220 ${136 + debossDepth * 90} Z`} fill="#000000"/>

                      {/* Labels on SVG */}
                      <circle cx="92" cy={118 - squashMetrics.haloHeight * 1.5} r="3" fill="#dc2626"/>
                      <circle cx="228" cy={118 - squashMetrics.haloHeight * 1.5} r="3" fill="#dc2626"/>
                      <text x="160" y="55" textAnchor="middle" fill="#18181b" fontSize="10" fontFamily="monospace" fontWeight="700">
                        {lang === 'ko' ? '크베치란트 (잉크 능선)' : 'QUETSCHRAND HALO'}
                      </text>
                      <text x="160" y="70" textAnchor="middle" fill="#dc2626" fontSize="9" fontFamily="monospace">
                        ΔD = +0.38 OD · +{squashMetrics.haloHeight} μm
                      </text>
                    </>
                  )}

                  {techMode === 'OFFSET' && (
                    <>
                      {/* Flat Uniform Thin Ink Film */}
                      <rect x="90" y="126" width="140" height="4" fill="#3f3f46"/>
                      <text x="160" y="60" textAnchor="middle" fill="#d97706" fontSize="10" fontFamily="monospace" fontWeight="700">
                        OFFSET: UNIFORM THIN FILM
                      </text>
                      <text x="160" y="75" textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                        Zero Deboss · Zero Squash Rim
                      </text>
                    </>
                  )}

                  {techMode === 'DIGITAL' && (
                    <>
                      {/* Zero-thickness Subpixels */}
                      <rect x="90" y="110" width="40" height="20" fill="#38bdf8"/>
                      <rect x="140" y="110" width="40" height="20" fill="#38bdf8"/>
                      <rect x="190" y="110" width="40" height="20" fill="#38bdf8"/>
                      <text x="160" y="60" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="700">
                        DIGITAL SUBPIXEL GLOW
                      </text>
                      <text x="160" y="75" textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
                        Zero Material · Zero Friction
                      </text>
                    </>
                  )}
                </svg>
              </div>

              {/* Analytical Micro Data */}
              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ backgroundColor: '#23272f', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{lang === 'ko' ? '테두리 광학 농도 (Halo OD)' : 'Halo Optical Density'}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                    {squashMetrics.haloDensity.toFixed(2)} OD
                  </div>
                </div>
                <div style={{ backgroundColor: '#23272f', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{lang === 'ko' ? '중앙부 광학 농도 (Core OD)' : 'Core Optical Density'}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {squashMetrics.coreDensity.toFixed(2)} OD
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Historical Card: William Morris & Stanley Morison */}
            <div style={{
              backgroundColor: '#1b1d22',
              borderRadius: '8px',
              border: '1px solid #2e333d',
              padding: '16px 20px',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: '#eab308', marginBottom: '8px', fontSize: '13px' }}>
                {lang === 'ko' ? '활판 인쇄술의 마흐 밴드 효과' : 'The Somatic Mach-Band Effect'}
              </div>
              <p style={{ color: '#d1d5db', margin: '0 0 10px' }}>
                {lang === 'ko'
                  ? '인쇄 압판이 종이를 짓누를 때 빠져나갈 곳 없는 고점도 잉크가 획의 모서리로 밀려나 짙은 능선을 형성합니다. 이 미세 잉크 스쿼시(Quetschrand)는 인간 시각 망막에서 측두 억제(Lateral Inhibition)를 유발하여, 글자가 마치 살아있는 조각처럼 또렷하게 떠오르게 만듭니다.'
                  : 'As the platen descends, high-viscosity ink shears outward into an elevated perimeter ridge. This microscopic Quetschrand triggers lateral retinal inhibition, giving letterpress typography its legendary sculptural presence.'}
              </p>
              <div style={{ fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #2c3038', paddingTop: '8px', fontFamily: 'monospace' }}>
                STANLEY MORISON (1936) · WILLIAM MORRIS (1892) · D. B. UPDIKE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
