import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Web Audio Synthesizer for Mechanical Quoin Ratchets and Planer Taps ---
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

  // Ratchet click of the mechanical steel quoin cam
  playRatchetClick(pitchMult: number = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Metallic resonant impulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 * pitchMult, now);
      osc.frequency.exponentialRampToValueAtTime(320 * pitchMult, now + 0.035);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      // Noise click for mechanical metal friction
      const bufferSize = this.ctx.sampleRate * 0.015;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      noise.start(now);
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  // Wooden mallet planer tap on metal type
  playPlanerTap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext unavailable
    }
  }

  // Paper press peel sound for pulling proofs
  playProofPull() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15 * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext unavailable
    }
  }
}

const acoustics = new LetterpressAcoustics();

// Latin Vulgate text lines in historical metal slugs
const FORME_LINES = [
  { id: 'l1', text: 'IN · PRINCIPIO · ERAT · VERBUM', size: '26px', weight: 700 },
  { id: 'l2', text: 'ET · VERBUM · ERAT · APUD · DEUM', size: '22px', weight: 600 },
  { id: 'l3', text: 'ET · DEUS · ERAT · VERBUM · HOC · ERAT', size: '19px', weight: 600 },
  { id: 'l4', text: 'OMNIA · PER · IPSUM · FACTA · SUNT', size: '22px', weight: 600 },
  { id: 'l5', text: 'ET · SINE · IPSO · FACTUM · EST · NIHIL', size: '19px', weight: 600 },
  { id: 'l6', text: 'QUOD · FACTUM · EST · IN · IPSO · VITA · ERAT', size: '17px', weight: 500 },
  { id: 'l7', text: 'ET · VITA · ERAT · LUX · HOMINUM', size: '22px', weight: 600 },
  { id: 'l8', text: 'ET · LUX · IN · TENEBRIS · LUCET', size: '24px', weight: 700 },
  { id: 'l9', text: 'ET · TENEBRAE · EAM · NON · COMPREHENDERUNT', size: '17px', weight: 500 },
  { id: 'l10', text: '— JOHANNES GUTENBERG · MAINZ MCCCCL —', size: '14px', weight: 700 }
];

export default function LetterpressQuoinExperiment() {
  // Lockup Pressure (0.0 to 6.0 MPa / N·m equivalent)
  const [pressure, setPressure] = useState<number>(3.2); // Start at optimal
  const [isLifting, setIsLifting] = useState<boolean>(false);
  const [isSpilled, setIsSpilled] = useState<boolean>(false);
  const [isProofPulled, setIsProofPulled] = useState<boolean>(false);
  const [isPlaned, setIsPlaned] = useState<boolean>(true);
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  // Interactive Quoin Key Dragging state
  const prevPressureRef = useRef<number>(pressure);

  // Determine Mechanical Regime
  const regime = useMemo(() => {
    if (pressure < 1.6) return 'LOOSE';
    if (pressure <= 4.2) return 'OPTIMAL';
    return 'BUCKLED';
  }, [pressure]);

  // Handle Quoin Pressure Changes with Ratchet sound
  const handlePressureChange = (newVal: number) => {
    const rounded = Math.round(newVal * 10) / 10;
    if (Math.abs(rounded - prevPressureRef.current) >= 0.2) {
      const pitch = 0.8 + (rounded / 6.0) * 0.6;
      acoustics.playRatchetClick(pitch);
      prevPressureRef.current = rounded;
    }
    setPressure(rounded);
    if (rounded >= 1.6 && isSpilled) {
      setIsSpilled(false);
    }
  };

  // Perform Lift Test
  const toggleLiftTest = () => {
    if (regime === 'LOOSE') {
      // Catastrophic collapse into 'pi'
      setIsSpilled(true);
      setIsLifting(false);
      acoustics.playRatchetClick(0.5);
    } else {
      setIsLifting(!isLifting);
    }
  };

  // Tap with Planer Mallet
  const handlePlaneForme = () => {
    acoustics.playPlanerTap();
    setIsPlaned(true);
  };

  // Pull Proof Print
  const handlePullProof = () => {
    acoustics.playProofPull();
    setIsProofPulled(!isProofPulled);
  };

  // Reset Forme
  const handleResetForme = () => {
    setPressure(3.2);
    setIsSpilled(false);
    setIsLifting(false);
    setIsProofPulled(false);
    setIsPlaned(true);
  };

  // Calculate furniture strain contraction (Hooke: epsilon = sigma / E)
  // Hard maple E ≈ 12.5 GPa. At 4 MPa, strain ≈ 0.032 (3.2% compression)
  const furnitureShrinkage = Math.min(6, (pressure / 6.0) * 5); // in pixels
  // Letter tracking tightness
  const trackingPx = Math.max(-0.5, (1.8 - pressure * 0.45)); // from loose positive tracking to tight negative
  // Euler Buckling Arching (out-of-plane displacement)
  const bucklingDisplacement = regime === 'BUCKLED' ? Math.pow(pressure - 4.2, 1.6) * 12 : 0;

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#181a1c',
      color: '#e5e7eb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Header / Control Bar */}
      <header style={{
        padding: '14px 28px',
        backgroundColor: '#1f2226',
        borderBottom: '1px solid #2d3138',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#d97706',
            color: '#111',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'serif'
          }}>Q</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
              {lang === 'ko' ? '활판 인쇄 체이스 & 쿼인 락업 정반' : 'LETTERPRESS CHASE & QUOIN IMPOSITION STONE'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              HOOKIAN COMPRESSION (σ = E·ε) · EULER BUCKLING · TYPE-HEIGHT: 0.918 in
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2b2f36',
              border: '1px solid #3f444e',
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
            onClick={handlePlaneForme}
            style={{
              padding: '6px 14px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              color: '#f9fafb',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔨</span> {lang === 'ko' ? '조판 평탄화 (Planer)' : 'Plane Forme'}
          </button>

          <button
            onClick={toggleLiftTest}
            style={{
              padding: '6px 16px',
              backgroundColor: isLifting ? '#059669' : '#d97706',
              border: 'none',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚖️</span> {isLifting 
              ? (lang === 'ko' ? '정반에 내려놓기' : 'Lower to Stone') 
              : (lang === 'ko' ? '리프트 테스트 실행 (Lift Test)' : 'Test Forme Lift')}
          </button>

          <button
            onClick={handlePullProof}
            style={{
              padding: '6px 14px',
              backgroundColor: isProofPulled ? '#111827' : '#2563eb',
              border: '1px solid #3b82f6',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {isProofPulled 
              ? (lang === 'ko' ? '인쇄 교정지 떼어내기' : 'Remove Proof') 
              : (lang === 'ko' ? '인쇄 교정지 찍기 (Pull Proof)' : 'Pull Proof Print')}
          </button>

          <button
            onClick={() => setShowTheory(!showTheory)}
            style={{
              padding: '6px 12px',
              backgroundColor: showTheory ? '#4f46e5' : '#2b2f36',
              border: '1px solid #3f444e',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {lang === 'ko' ? '역학 해석도' : 'Mechanics'}
          </button>

          <button
            onClick={handleResetForme}
            style={{
              padding: '6px 10px',
              backgroundColor: 'transparent',
              border: '1px solid #4b5563',
              color: '#9ca3af',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title={lang === 'ko' ? '조판 초기화' : 'Reset Forme'}
          >
            ↺
          </button>
        </div>
      </header>

      {/* Main Workspace / Imposing Stone */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 40%, #25282e 0%, #151618 100%)'
      }}>
        {/* Torque Dial / Pressure Indicator Bar */}
        <div style={{
          width: '100%',
          maxWidth: '920px',
          marginBottom: '20px',
          padding: '14px 20px',
          backgroundColor: '#212429',
          borderRadius: '8px',
          border: '1px solid #2f343d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Slider & Value */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>
                {lang === 'ko' ? '황동 쿼인 키 조임 토크 (Quoin Torque / Pressure)' : 'Brass Quoin Key Torque / Lockup Pressure'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
                {pressure.toFixed(1)} MPa ({(pressure * 1.15).toFixed(1)} N·m)
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="6.0"
              step="0.1"
              value={pressure}
              onChange={(e) => handlePressureChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: regime === 'LOOSE' ? '#f59e0b' : (regime === 'OPTIMAL' ? '#10b981' : '#e11d48'),
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: regime === 'LOOSE' 
                ? 'rgba(245, 158, 11, 0.15)' 
                : (regime === 'OPTIMAL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)'),
              border: `1px solid ${regime === 'LOOSE' ? '#f59e0b' : (regime === 'OPTIMAL' ? '#10b981' : '#e11d48')}`,
              color: regime === 'LOOSE' ? '#f59e0b' : (regime === 'OPTIMAL' ? '#10b981' : '#e11d48')
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: regime === 'LOOSE' ? '#f59e0b' : (regime === 'OPTIMAL' ? '#10b981' : '#e11d48')
              }}/>
              {regime === 'LOOSE' && (lang === 'ko' ? '느슨함: 낙하 파이(Pi) 위험' : 'ZONE I: LOOSE (PI RISK)')}
              {regime === 'OPTIMAL' && (lang === 'ko' ? '최적 결속: 리프트 테스트 통과' : 'ZONE II: MONOLITHIC LIFT OK')}
              {regime === 'BUCKLED' && (lang === 'ko' ? '과토크: 오일러 좌굴 스프링잉' : 'ZONE III: FORM SPRINGING')}
            </div>
          </div>
        </div>

        {/* 3D Imposing Stone Surface Container */}
        <div style={{
          perspective: '1200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* The 50-Pound Forged Iron Chase */}
          <div style={{
            position: 'relative',
            width: '880px',
            minHeight: '620px',
            backgroundColor: '#26292e',
            border: '28px solid #1c1d20',
            borderRadius: '10px',
            boxShadow: isLifting 
              ? '0 60px 80px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6)' 
              : '0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.5)',
            transform: isLifting 
              ? 'translateY(-40px) rotateX(28deg) rotateY(-8deg) scale(0.98)' 
              : 'none',
            transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}>
            {/* Cast Iron Engraving Labels on Frame */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '20px',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#6b7280',
              letterSpacing: '1px'
            }}>
              FORGED CHASE № 4B · 64×48 PICA · CHILLED CAST IRON
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-22px',
              right: '20px',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#6b7280',
              letterSpacing: '1px'
            }}>
              HOOKE ELASTICITY σ = E·ε · TYPE HIGH 0.918 in
            </div>

            {/* Corner Screws */}
            {['-6px -6px', 'auto -6px -6px auto', '-6px auto auto -6px', 'auto auto -6px -6px'].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: i < 2 ? '-18px' : 'auto',
                bottom: i >= 2 ? '-18px' : 'auto',
                left: i % 2 === 0 ? '-18px' : 'auto',
                right: i % 2 === 1 ? '-18px' : 'auto',
                width: '14px',
                height: '14px',
                backgroundColor: '#374151',
                borderRadius: '50%',
                border: '2px solid #111827',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
              }}/>
            ))}

            {/* Inside the Chase: Marble Bed Surface */}
            <div style={{
              flex: 1,
              backgroundColor: '#e8e4dc',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px',
              position: 'relative',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              {/* Head Furniture (Hard Rock Maple Wood) */}
              <div style={{
                height: `${55 - furnitureShrinkage * 0.4}px`,
                backgroundColor: '#c9a473',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139, 90, 43, 0.12) 40px, rgba(139, 90, 43, 0.12) 80px)',
                border: '1px solid #9c7344',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                color: '#452a15',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 600,
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.2)',
                marginBottom: '10px',
                transition: 'height 0.2s ease'
              }}>
                <span>HEAD FURNITURE (8×50 PICA MAPLE)</span>
                <span>E = 12.5 GPa</span>
              </div>

              {/* Middle Section: Gutter Furniture + Type Forme + Side Furniture & Quoins */}
              <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                {/* Gutter Furniture (Left Margin Wood) */}
                <div style={{
                  width: `${60 - furnitureShrinkage * 0.5}px`,
                  backgroundColor: '#be9865',
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(120, 75, 30, 0.1) 35px, rgba(120, 75, 30, 0.1) 70px)',
                  border: '1px solid #916839',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  writingMode: 'vertical-rl',
                  color: '#452a15',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3)',
                  transition: 'width 0.2s ease'
                }}>
                  GUTTER (6×38 PICA)
                </div>

                {/* Central Forme: Hand-Set Lead Type Lines */}
                <div style={{
                  flex: 1,
                  backgroundColor: '#303338',
                  borderRadius: '3px',
                  border: '2px dashed #4b5563',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* If Spilled ("Pi" disaster) */}
                  {isSpilled ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#f87171',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                      <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'serif' }}>
                        {lang === 'ko' ? '조판 대참사: 활자 쏟아짐 (PI DISASTER)' : 'DISASTER: FORME COLLAPSED INTO PI'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '6px', maxWidth: '420px' }}>
                        {lang === 'ko' 
                          ? '쿼인 조임 압력이 1.6 MPa 미만인 상태에서 체이스를 들어 올렸습니다! 결속되지 못한 수천 개의 납 활자가 정반 위로 쏟아졌습니다.' 
                          : 'The chase was lifted with insufficient quoin pressure (< 1.6 MPa)! Loose lead type slugs slid out and scattered across the stone.'}
                      </div>
                      <button
                        onClick={handleResetForme}
                        style={{
                          marginTop: '14px',
                          padding: '6px 16px',
                          backgroundColor: '#e11d48',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}
                      >
                        {lang === 'ko' ? '다시 식자하기 (Re-compose)' : 'Re-compose Forme'}
                      </button>
                    </div>
                  ) : (
                    FORME_LINES.map((line, idx) => {
                      // Buckling displacement maximum at center lines (l4, l5, l6)
                      const centerDist = Math.abs(idx - 4.5);
                      const lineBuckle = Math.max(0, (4.5 - centerDist) * (bucklingDisplacement / 4.5));
                      const isCenter = idx >= 3 && idx <= 6;

                      return (
                        <div
                          key={line.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#25272a',
                            border: '1px solid #444850',
                            borderRadius: '2px',
                            padding: '3px 8px',
                            margin: '2px 0',
                            boxShadow: regime === 'BUCKLED' && isCenter
                              ? `0 ${lineBuckle}px ${lineBuckle * 2}px rgba(225, 29, 72, 0.45), inset 0 1px 2px rgba(255,255,255,0.2)`
                              : 'inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
                            transform: regime === 'BUCKLED' && isCenter
                              ? `scaleY(${1 + lineBuckle * 0.02}) translateY(-${lineBuckle * 0.8}px)`
                              : 'none',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          <span style={{
                            fontFamily: '"Cinzel", serif',
                            fontSize: line.size,
                            fontWeight: line.weight,
                            color: regime === 'BUCKLED' && isCenter ? '#fca5a5' : '#f3efe6',
                            letterSpacing: `${trackingPx}px`,
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          }}>
                            {line.text}
                          </span>
                        </div>
                      );
                    })
                  )}

                  {/* Over-Torque Warning Overlay */}
                  {regime === 'BUCKLED' && !isSpilled && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(225, 29, 72, 0.9)',
                      color: '#ffffff',
                      padding: '4px 14px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}>
                      ⚠️ {lang === 'ko' ? '오일러 기둥 좌굴: 활자열 중앙부 0.035인치 돌출' : 'EULER BUCKLING: CENTER ARCHING +0.035 in'}
                    </div>
                  )}

                  {/* Printed Proof Sheet Overlay (When Pull Proof is active) */}
                  {isProofPulled && !isSpilled && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#fbfbf8',
                      backgroundImage: 'radial-gradient(#ebe5d8 1px, transparent 1px)',
                      backgroundSize: '8px 8px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                      <div style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'monospace', textAlign: 'right' }}>
                        PROOF PULL · 100% COTTON PAPER · OIL-BASED CARBON BLACK
                      </div>
                      {FORME_LINES.map((line) => (
                        <div key={line.id} style={{ textAlign: 'center' }}>
                          <span style={{
                            fontFamily: '"Cinzel", serif',
                            fontSize: line.size,
                            fontWeight: line.weight,
                            color: '#111111',
                            letterSpacing: `${trackingPx}px`,
                            textShadow: regime === 'BUCKLED' 
                              ? '1px 0 2px rgba(0,0,0,0.5), -1px 0 2px rgba(0,0,0,0.5)' 
                              : '0 0 1px rgba(0,0,0,0.3)'
                          }}>
                            {line.text}
                          </span>
                        </div>
                      ))}
                      <div style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'monospace', textAlign: 'center' }}>
                        DEBOSS RELIEF: 0.12 mm · INK SQUASH RATIO: {regime === 'BUCKLED' ? '2.4 (HEAVY SQUEEZE)' : '1.05 (CRISP)'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Margin Reglet & Wickersham Quoins */}
                <div style={{ width: '90px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Reglet */}
                  <div style={{
                    height: '100%',
                    backgroundColor: '#d8b482',
                    border: '1px solid #b6925e',
                    borderRadius: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    padding: '8px 4px',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                  }}>
                    {/* Quoin 1 (Top Side Quoin) */}
                    <div style={{
                      height: '75px',
                      backgroundColor: '#52565e',
                      border: '2px solid #282a2e',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1f2023',
                        border: '2px solid #374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* Square Keyhole */}
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#0a0a0c',
                          transform: `rotate(${pressure * 60}deg)`,
                          transition: 'transform 0.1s ease'
                        }}/>
                      </div>
                      <span style={{ fontSize: '8px', color: '#d1d5db', fontFamily: 'monospace', marginTop: '4px' }}>
                        QUOIN №1
                      </span>
                    </div>

                    {/* Quoin 2 (Bottom Side Quoin) */}
                    <div style={{
                      height: '75px',
                      backgroundColor: '#52565e',
                      border: '2px solid #282a2e',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1f2023',
                        border: '2px solid #374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* Square Keyhole */}
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#0a0a0c',
                          transform: `rotate(${pressure * 60}deg)`,
                          transition: 'transform 0.1s ease'
                        }}/>
                      </div>
                      <span style={{ fontSize: '8px', color: '#d1d5db', fontFamily: 'monospace', marginTop: '4px' }}>
                        QUOIN №2
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foot Furniture and Foot Quoin (Bottom Section) */}
              <div style={{
                height: `${45 - furnitureShrinkage * 0.3}px`,
                backgroundColor: '#c9a473',
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(139, 90, 43, 0.12) 40px, rgba(139, 90, 43, 0.12) 80px)',
                border: '1px solid #9c7344',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                color: '#452a15',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 600,
                marginTop: '10px',
                transition: 'height 0.2s ease'
              }}>
                <span>FOOT FURNITURE (6×50 PICA)</span>
                <span>VERTICAL PRE-LOAD: {(pressure * 0.85).toFixed(1)} MPa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Analytical Data Cards */}
        <div style={{
          width: '100%',
          maxWidth: '920px',
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{ backgroundColor: '#1e2126', padding: '12px 16px', borderRadius: '6px', border: '1px solid #2d313a' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ko' ? '조판목 탄성 변형률 (Strain ε)' : 'Wood Furniture Strain (ε)'}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
              {(pressure / 12.5 * 10).toFixed(2)} %
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Hard Rock Maple (E = 12.5 GPa)</div>
          </div>

          <div style={{ backgroundColor: '#1e2126', padding: '12px 16px', borderRadius: '6px', border: '1px solid #2d313a' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ko' ? '활자 간 접촉 압축력' : 'Inter-Slug Compressive Stress'}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
              {pressure.toFixed(2)} MPa
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Lead Alloy 80/15/5 (E = 28 GPa)</div>
          </div>

          <div style={{ backgroundColor: '#1e2126', padding: '12px 16px', borderRadius: '6px', border: '1px solid #2d313a' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ko' ? '오일러 좌굴 임계 마진' : 'Euler Buckling Safety Margin'}</div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: regime === 'BUCKLED' ? '#ef4444' : '#3b82f6',
              fontFamily: 'monospace'
            }}>
              {regime === 'BUCKLED' ? 'EXCEEDED' : `+${(4.2 - pressure).toFixed(1)} MPa`}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>P_cr ≈ 4.25 MPa (10-line span)</div>
          </div>

          <div style={{ backgroundColor: '#1e2126', padding: '12px 16px', borderRadius: '6px', border: '1px solid #2d313a' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{lang === 'ko' ? '구텐베르크 리프트 상태' : 'Lift-Test Verification'}</div>
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: isSpilled ? '#ef4444' : (isLifting ? '#10b981' : '#9ca3af'),
              fontFamily: 'monospace'
            }}>
              {isSpilled ? 'COLLAPSED' : (isLifting ? 'AIRBORNE OK' : 'ON STONE')}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>50 lb Cast Iron Chase № 4B</div>
          </div>
        </div>

        {/* Deep Dive Theory Drawer Modal */}
        {showTheory && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '440px',
            maxHeight: '80vh',
            backgroundColor: '#1f2228',
            border: '1px solid #3b4250',
            borderRadius: '8px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            padding: '20px',
            overflowY: 'auto',
            zIndex: 100,
            fontSize: '13px',
            lineHeight: 1.6
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>
                {lang === 'ko' ? '활판 인쇄 조판 역학 원리' : 'Letterpress Imposition Mechanics'}
              </span>
              <button
                onClick={() => setShowTheory(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}
              >✕</button>
            </div>
            
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>
              {lang === 'ko'
                ? '활판 인쇄에서 낱알 활자들은 자체적인 접착제가 없습니다. 주철 체이스 테두리 안에서 단풍나무 조판목과 팽창식 쿼인이 가하는 수평·수직 압축 응력(Hooke 탄성 공식 σ = E·ε)에 의해서만 결속됩니다.'
                : 'Movable type possesses no intrinsic adhesive. Letters exist as a coherent editorial block solely through lateral and vertical compressive stress (Hooke elasticity σ = E·ε) exerted by hardwood furniture and expanding quoins against cast-iron chase walls.'}
            </p>

            <div style={{ backgroundColor: '#16181c', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontFamily: 'monospace', fontSize: '11px' }}>
              <div>σ = E_composite · ε</div>
              <div>P_cr = (π² · E · I) / (K · L)²</div>
              <div>Lift Threshold: P ≥ 1.6 MPa</div>
              <div>Euler Springing: P &gt; 4.2 MPa</div>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '12px' }}>
              {lang === 'ko'
                ? '얀 치홀트가 갈파했듯, 조판의 규율은 무제한적인 유동성이 아니라 물리적 구속이 만들어내는 긴장감에서 나옵니다. 쿼인 토크를 조절하여 활자가 단일 강체로 단결하는 경이로운 순간을 직접 확인해 보세요.'
                : 'As Jan Tschichold articulated, typographic discipline stems not from unconstrained fluidity, but from structural tension forged under physical boundary limits.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
