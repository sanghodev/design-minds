import React, { useState, useMemo, useRef } from 'react';

// --- Web Audio Synthesizer for Metallurgy & Punch-Cutting Workshop ---
class PunchAcoustics {
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

  // Metallic Hammer Strike (Brass Mallet onto Hardened Steel Punch)
  playHammerClink(forceRatio: number = 0.8) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // High crystalline resonant ping (hard steel ringing)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2850, now);
      osc.frequency.exponentialRampToValueAtTime(1420, now + 0.06);

      gain.gain.setValueAtTime(0.5 * forceRatio, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      // Low thud (anvil mass)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      subGain.gain.setValueAtTime(0.6 * forceRatio, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.13);
      subOsc.stop(now + 0.1);
    } catch {
      // AudioContext restricted
    }
  }

  // Quenching Steam Hiss (Water Quench at 820°C)
  playQuenchHiss() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * 0.3 * env;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.45);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext restricted
    }
  }

  // Graver / Needle File Rasp
  playFileRasp() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext restricted
    }
  }
}

const acoustics = new PunchAcoustics();

type CounterType = 'e_eye' | 'o_bowl' | 'bq_shared' | 'nm_arch';

export default function PunchCuttingExperiment() {
  // --- Workshop Stage (1 to 4) ---
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1: Counter-Punch Strike State
  const [selectedCounter, setSelectedCounter] = useState<CounterType>('e_eye');
  const [hammerForce, setHammerForce] = useState<number>(22.0); // kN
  const [strikeDepth, setStrikeDepth] = useState<number>(0); // 0.0 to 1.0 mm
  const [strikeCount, setStrikeCount] = useState<number>(0);

  // Stage 2: Graver File Shaping State
  const [filingProgress, setFilingProgress] = useState<number>(0); // 0 to 100%
  const [draftAngle, setDraftAngle] = useState<number>(9.0); // degrees (7 to 14)

  // Stage 3: Heat Treatment & Tempering State
  const [heatTemp, setHeatTemp] = useState<number>(20); // Celsius
  const [isQuenched, setIsQuenched] = useState<boolean>(false);
  const [temperTemp, setTemperTemp] = useState<number>(20); // Reheat temp for tempering
  const [lockedTemper, setLockedTemper] = useState<number | null>(null);

  // Stage 4: Matrix Strike & Smoke Proof State
  const [matrixStruck, setMatrixStruck] = useState<boolean>(false);
  const [isSmoked, setIsSmoked] = useState<boolean>(false);
  const [proofPulled, setProofPulled] = useState<boolean>(false);

  // General Settings
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [punchTilt, setPunchTilt] = useState<{ x: number; y: number }>({ x: 18, y: -22 });

  // Calculate Plastic Displacement
  // Prandtl limit: P_indent ≈ 1335 MPa. Force 22 kN into area ~16 mm² => ~1375 MPa (exceeds yield)
  const plasticLipHeight = useMemo(() => {
    return (strikeDepth * 0.18).toFixed(2); // mm swelling
  }, [strikeDepth]);

  // Temper Color & Resulting Hardness
  const temperState = useMemo(() => {
    const t = lockedTemper ?? temperTemp;
    if (!isQuenched) return { colorName: 'Annealed (Raw)', colorHex: '#9499a3', hrc: 22, condition: 'SOFT' };
    if (t < 210) return { colorName: 'Untempered Martensite', colorHex: '#d4d4d8', hrc: 65, condition: 'BRITTLE' };
    if (t <= 230) return { colorName: 'Pale Straw (Optimal)', colorHex: '#fef08a', hrc: 60, condition: 'OPTIMAL' };
    if (t <= 250) return { colorName: 'Dark Straw', colorHex: '#fde047', hrc: 57, condition: 'GOOD' };
    if (t <= 270) return { colorName: 'Brown / Bronze', colorHex: '#d97706', hrc: 54, condition: 'TOUGH_SOFT' };
    return { colorName: 'Peacock Blue (Spring)', colorHex: '#2563eb', hrc: 48, condition: 'TOO_SOFT' };
  }, [temperTemp, lockedTemper, isQuenched]);

  // Handle Hammer Strike Action
  const handleStrike = () => {
    acoustics.playHammerClink(hammerForce / 30);
    const addedDepth = (hammerForce / 30) * 0.35;
    setStrikeDepth((prev) => Math.min(0.95, prev + addedDepth));
    setStrikeCount((c) => c + 1);
  };

  // Handle Graver Filing
  const handleFileStroke = () => {
    acoustics.playFileRasp();
    setFilingProgress((p) => Math.min(100, p + 20));
  };

  // Handle Forge Heating
  const handleHeatFurnace = (targetTemp: number) => {
    setHeatTemp(targetTemp);
  };

  // Quench from Forge
  const handleQuench = () => {
    if (heatTemp >= 780) {
      acoustics.playQuenchHiss();
      setIsQuenched(true);
      setHeatTemp(20);
      setTemperTemp(20);
    }
  };

  // Lock Tempering Quench
  const handleLockTemper = () => {
    if (isQuenched) {
      acoustics.playQuenchHiss();
      setLockedTemper(temperTemp);
    }
  };

  // Strike Copper Matrix
  const handleStrikeMatrix = () => {
    acoustics.playHammerClink(1.0);
    setMatrixStruck(true);
  };

  // Pull Smoke Proof
  const handleSmokeProof = () => {
    setIsSmoked(true);
    setProofPulled(true);
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#161719',
      color: '#e4e2dd',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Navigation / Atelier Header */}
      <header style={{
        padding: '12px 28px',
        backgroundColor: '#1f2126',
        borderBottom: '1px solid #2d313a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#475569',
            color: '#fef08a',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'serif',
            border: '1px solid #64748b'
          }}>CP</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
              {lang === 'ko' ? '16세기 강철 활자 조각 & 카운터펀치 공방' : "GARAMOND PUNCH-CUTTER'S ATELIER (c. 1540)"}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
              COLD-DISPLACEMENT PLASTICITY · PRANDTL FIELD · TEMPER-COLOR METALLURGY
            </div>
          </div>
        </div>

        {/* Stage Progression Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { s: 1, label: lang === 'ko' ? '1. 카운터펀치 타격' : '1. Counterpunch' },
            { s: 2, label: lang === 'ko' ? '2. 조각도 줄질' : '2. Graver Filing' },
            { s: 3, label: lang === 'ko' ? '3. 템퍼링 열처리' : '3. Tempering' },
            { s: 4, label: lang === 'ko' ? '4. 매트릭스 각인' : '4. Matrix Strike' }
          ].map(({ s, label }) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2 | 3 | 4)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeStage === s ? '#d97706' : '#282b33',
                border: `1px solid ${activeStage === s ? '#f59e0b' : '#3f4450'}`,
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

          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            style={{
              padding: '6px 12px',
              backgroundColor: '#282b33',
              border: '1px solid #3f4450',
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

      {/* Main Workshop Floor */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        background: 'radial-gradient(circle at 50% 30%, #202329 0%, #111214 100%)'
      }}>
        {/* Workspace Layout: 3D Steel Punch Vise (Left) + Interactive Stage Tooling (Right) */}
        <div style={{
          width: '100%',
          maxWidth: '1120px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Column: 3D Interactive Steel Punch View */}
          <div style={{
            backgroundColor: '#1b1d22',
            borderRadius: '8px',
            border: '1px solid #2e333d',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3efe6' }}>
                {lang === 'ko' ? '공구강 블랭크 (Tool Steel Blank · C80)' : 'Annealed C80 Steel Blank'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: temperState.colorHex, fontWeight: 700 }}>
                {temperState.colorName} ({temperState.hrc} HRC)
              </span>
            </div>

            {/* 3D Punch Canvas representation */}
            <div
              style={{
                width: '100%',
                height: '380px',
                backgroundColor: '#111215',
                borderRadius: '6px',
                border: '1px solid #282c35',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                perspective: '1000px',
                overflow: 'hidden',
                cursor: 'grab'
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  setPunchTilt({
                    x: Math.max(-40, Math.min(40, punchTilt.x + e.movementY * 0.5)),
                    y: Math.max(-60, Math.min(60, punchTilt.y + e.movementX * 0.5))
                  });
                }
              }}
            >
              {/* Iron Bench Vise Jaws */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                width: '260px',
                height: '90px',
                backgroundColor: '#272a30',
                border: '3px solid #1a1c20',
                borderRadius: '4px',
                boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '10px',
                fontFamily: 'monospace',
                letterSpacing: '1px'
              }}>
                FORGED BENCH VISE № 2
              </div>

              {/* 3D Steel Punch Bar */}
              <div style={{
                width: '110px',
                height: '240px',
                backgroundColor: isQuenched ? (lockedTemper ? temperState.colorHex : '#474b54') : '#9499a3',
                backgroundImage: heatTemp > 400
                  ? `radial-gradient(circle at 50% 30%, #ef4444 0%, #b91c1c 60%, #450a0a 100%)`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)',
                borderRadius: '2px',
                border: '1px solid #1f2229',
                transform: `rotateX(${punchTilt.x}deg) rotateY(${punchTilt.y}deg)`,
                transition: 'background-color 0.4s ease, transform 0.1s ease',
                boxShadow: heatTemp > 600
                  ? '0 0 40px #ef4444, 0 0 80px #b91c1c'
                  : '0 20px 40px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Punch Shank Label */}
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: heatTemp > 500 ? '#ffffff' : '#1e2025',
                  writingMode: 'vertical-rl',
                  letterSpacing: '2px',
                  fontWeight: 700
                }}>
                  C·GARAMOND · PARIS
                </div>

                {/* The Top Face: Cold-Displaced Cavity or Carved Letterform */}
                <div style={{
                  width: '90px',
                  height: '75px',
                  backgroundColor: '#1f2227',
                  marginTop: '10px',
                  borderRadius: '2px',
                  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.9)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: filingProgress > 0 ? `${12 - (filingProgress / 100) * 8}px solid #383c44` : 'none'
                }}>
                  {/* Visualizing Counterpunch Void Strike */}
                  {strikeDepth > 0 && (
                    <div style={{
                      width: '46px',
                      height: '42px',
                      backgroundColor: '#0a0a0c',
                      borderRadius: selectedCounter === 'o_bowl' ? '50%' : '6px',
                      boxShadow: `inset 0 0 ${strikeDepth * 14}px #000000`,
                      transform: `scale(${0.7 + strikeDepth * 0.3})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #454952'
                    }}>
                      {selectedCounter === 'e_eye' && (
                        <div style={{ width: '28px', height: '4px', backgroundColor: '#33373f' }}/>
                      )}
                    </div>
                  )}

                  {/* Finished Glyph emerging in relief after filing */}
                  {filingProgress >= 80 && (
                    <div style={{
                      position: 'absolute',
                      fontFamily: '"Cinzel", serif',
                      fontSize: '38px',
                      fontWeight: 700,
                      color: isSmoked ? '#000000' : '#fef08a',
                      textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                    }}>
                      e
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drag Tilt hint */}
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '10px', fontFamily: 'monospace' }}>
              {lang === 'ko' ? '마우스 드래그로 펀치 3D 회전' : 'Click and drag to rotate punch in 3D'}
            </div>

            {/* Punch Metrics HUD */}
            <div style={{
              width: '100%',
              marginTop: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <div style={{ backgroundColor: '#23272f', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>STRIKE DEPTH</div>
                <div style={{ color: '#f59e0b', fontWeight: 700 }}>{strikeDepth.toFixed(2)} mm</div>
              </div>
              <div style={{ backgroundColor: '#23272f', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>PLASTIC LIP</div>
                <div style={{ color: '#38bdf8', fontWeight: 700 }}>+{plasticLipHeight} mm</div>
              </div>
              <div style={{ backgroundColor: '#23272f', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#9ca3af', fontSize: '9px' }}>HARDNESS</div>
                <div style={{ color: temperState.colorHex, fontWeight: 700 }}>{temperState.hrc} HRC</div>
              </div>
            </div>
          </div>

          {/* Right Column: Stage Specific Interactive Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* STAGE 1: Counter-Punch Strike */}
            {activeStage === 1 && (
              <div style={{ backgroundColor: '#1b1d22', padding: '20px', borderRadius: '8px', border: '1px solid #2e333d' }}>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 1: 카운터펀치 선택 및 상온 타격' : 'Stage 1: Counter-Punch Selection & Strike'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '소문자 안공(Counter)은 밖에서 깎아낼 수 없습니다. 초경질(64 HRC) 카운터펀치를 부드러운 연화 강철 블랭크에 망치로 타격하여 내부 네거티브 공간을 소성 전단으로 각인하세요.'
                    : 'Interior letter counters cannot be filed from outside. Select a hardened counter-punch and strike it into the annealed blank to cold-displace the negative void.'}
                </p>

                {/* Counter Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { id: 'e_eye', label: "Eye of 'e' (타원 안공)" },
                    { id: 'o_bowl', label: "Bowl of 'o' (원형 안공)" },
                    { id: 'bq_shared', label: "'b, d, p, q' (공유 안공)" },
                    { id: 'nm_arch', label: "'n, m' Arch (아치 안공)" }
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedCounter(id as CounterType)}
                      style={{
                        padding: '10px',
                        backgroundColor: selectedCounter === id ? '#2d333f' : '#21242b',
                        border: `1px solid ${selectedCounter === id ? '#d97706' : '#374151'}`,
                        color: selectedCounter === id ? '#fef08a' : '#9ca3af',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Hammer Force Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '황동 망치 타격력' : 'Mallet Strike Force'}</span>
                    <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>{hammerForce.toFixed(1)} kN</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={hammerForce}
                    onChange={(e) => setHammerForce(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                </div>

                {/* Strike Button */}
                <button
                  onClick={handleStrike}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#d97706',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔨</span> {lang === 'ko' ? `카운터펀치 내리치기 (타격 횟수: ${strikeCount})` : `Strike Counter-Punch (Hits: ${strikeCount})`}
                </button>
              </div>
            )}

            {/* STAGE 2: Graver File Shaping */}
            {activeStage === 2 && (
              <div style={{ backgroundColor: '#1b1d22', padding: '20px', borderRadius: '8px', border: '1px solid #2e333d' }}>
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 2: 조각도 줄질 및 탈형 구배각 형성' : 'Stage 2: Graver Micro-Filing & Draft Angle'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '내부 여백이 형성되었으니, 세공 줄로 글자의 바깥쪽 어깨를 깎아냅니다. 구리 매트릭스에서 활자가 원활히 빠져나올 수 있도록 9도 탈형 구배 각도를 유지하세요.'
                    : 'With the counter cavity struck, file away exterior steel shoulders. Maintain a 9° draft angle so the punch can release cleanly from copper matrices.'}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '탈형 구배각 (Draft Angle)' : 'Draft Angle Slope'}</span>
                    <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>{draftAngle.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.5"
                    value={draftAngle}
                    onChange={(e) => setDraftAngle(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '외곽 조각 진행도' : 'Filing Progress'}</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>{filingProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#23272f', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${filingProgress}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.2s ease' }}/>
                  </div>
                </div>

                <button
                  onClick={handleFileStroke}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#059669',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🪓</span> {lang === 'ko' ? '조각도로 외곽선 깎기 (File Stroke)' : 'File Exterior Contour'}
                </button>
              </div>
            )}

            {/* STAGE 3: Forge Quench & Tempering */}
            {activeStage === 3 && (
              <div style={{ backgroundColor: '#1b1d22', padding: '20px', borderRadius: '8px', border: '1px solid #2e333d' }}>
                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 3: 담금질 급랭 & 템퍼링 열처리' : 'Stage 3: Martensitic Quench & Tempering'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '820°C 체리빛으로 가열 후 찬물에 급랭하여 65 HRC 마르텐사이트로 변태시킵니다. 이후 225°C 볏짚색 산화 피막에서 템퍼링하여 최적의 인성(59 HRC)을 획득하세요.'
                    : 'Heat to 820°C cherry-red and quench to form 65 HRC martensite. Then reheat to 225°C pale straw temper color to lock in tough 59 HRC.'}
                </p>

                {/* Step A: Heat to 820C */}
                <div style={{ marginBottom: '14px' }}>
                  <button
                    onClick={() => handleHeatFurnace(820)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: heatTemp >= 800 ? '#b91c1c' : '#374151',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '6px'
                    }}
                  >
                    🔥 {lang === 'ko' ? '숯 화덕에서 820°C로 가열' : 'Heat over Forge to 820°C (Cherry Red)'}
                  </button>
                  <button
                    onClick={handleQuench}
                    disabled={heatTemp < 780}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: heatTemp >= 780 ? '#2563eb' : '#23272f',
                      border: 'none',
                      color: heatTemp >= 780 ? '#fff' : '#6b7280',
                      borderRadius: '4px',
                      cursor: heatTemp >= 780 ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    💧 {lang === 'ko' ? '찬물에 급랭 (담금질 마르텐사이트 65 HRC)' : 'Quench in Water (Hardening 65 HRC)'}
                  </button>
                </div>

                {/* Step B: Reheat for Tempering */}
                {isQuenched && (
                  <div style={{ borderTop: '1px solid #2e333d', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: '#9ca3af' }}>{lang === 'ko' ? '템퍼링 재가열 온도' : 'Tempering Temperature'}</span>
                      <span style={{ color: temperState.colorHex, fontFamily: 'monospace', fontWeight: 700 }}>
                        {temperTemp}°C ({temperState.colorName})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="180"
                      max="320"
                      step="5"
                      value={temperTemp}
                      onChange={(e) => setTemperTemp(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: temperState.colorHex, cursor: 'pointer', marginBottom: '10px' }}
                    />
                    <button
                      onClick={handleLockTemper}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#d97706',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      🔒 {lang === 'ko' ? `이 산화 색상에서 뜨임 동결 (${temperState.hrc} HRC)` : `Lock Temper at this Color (${temperState.hrc} HRC)`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 4: Matrix Strike & Smoke Proof */}
            {activeStage === 4 && (
              <div style={{ backgroundColor: '#1b1d22', padding: '20px', borderRadius: '8px', border: '1px solid #2e333d' }}>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  {lang === 'ko' ? '단계 4: 구리 매트릭스 타격 & 스모크 프루프' : 'Stage 4: Strike Copper Matrix & Smoke Proof'}
                </div>
                <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {lang === 'ko'
                    ? '완성된 강철 펀치를 구리 바에 내리쳐 모형(Matrix)을 각인합니다. 또한 양초 불꽃에 그을려 종이에 찍는 16세기식 스모크 프루프를 확인해 보세요.'
                    : 'Drive the finished punch into a cold copper bar to forge the matrix, then hold over a candle flame to pull an authentic 16th-century smoke proof.'}
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={handleStrikeMatrix}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#c2410c',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    🔨 {lang === 'ko' ? '구리 매트릭스 각인' : 'Strike Matrix'}
                  </button>

                  <button
                    onClick={handleSmokeProof}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '4px',
                      color: '#fef08a',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    🕯️ {lang === 'ko' ? '스모크 프루프 찍기' : 'Smoke Proof'}
                  </button>
                </div>

                {/* Matrix / Smoke Proof Result Preview */}
                {proofPulled && (
                  <div style={{
                    backgroundColor: '#fefce8',
                    border: '1px solid #fde047',
                    padding: '14px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#1c1917'
                  }}>
                    <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace', marginBottom: '4px' }}>
                      ÉPREUVE DE FUMÉE (SMOKE PROOF) · 100% RAG PAPER
                    </div>
                    <div style={{ fontFamily: '"Cinzel", serif', fontSize: '48px', fontWeight: 700, color: '#000' }}>
                      e
                    </div>
                    <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                      {lang === 'ko' ? '완벽한 네거티브 여백 균형 확인' : 'Flawless Counter-Space Harmony Verified'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Academic Theoretical Insight Card */}
            <div style={{
              backgroundColor: '#1b1d22',
              borderRadius: '8px',
              border: '1px solid #2e333d',
              padding: '16px 20px',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: '#eab308', marginBottom: '8px', fontSize: '13px' }}>
                {lang === 'ko' ? '프레드 스마이어스의 카운터펀치 조형 철학' : 'Fred Smeijers Counterpunch Architecture'}
              </div>
              <p style={{ color: '#d1d5db', margin: '0 0 8px' }}>
                {lang === 'ko'
                  ? '카운터펀치는 글자 내부의 흰 공간을 3차원으로 깎아낸 도구입니다. 단 하나의 카운터펀치로 b, d, p, q의 내부를 공통 타격함으로써, 르네상스 서체는 인위적인 커닝 없이도 완벽한 시각적 리듬을 획득했습니다.'
                  : 'Counter-punches sculpted interior white spaces. By sharing a single counter-punch across b, d, p, and q, Renaissance typefaces achieved an organic rhythm that digital kerning algorithms struggle to match.'}
              </p>
              <div style={{ fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #2c3038', paddingTop: '8px', fontFamily: 'monospace' }}>
                FRED SMEIJERS (1996) · CLAUDE GARAMOND (1540) · P. S. FOURNIER
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
