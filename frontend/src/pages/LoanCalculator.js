import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function LoanCalculator() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [mounted,  setMounted]  = useState(false);
  const [score,    setScore]    = useState(75);
  const [amount,   setAmount]   = useState(50000);
  const [tenure,   setTenure]   = useState(12);
  const [purpose,  setPurpose]  = useState('business');

  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    setTimeout(() => setMounted(true), 100);
  }, [navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const cols  = Math.floor(W / 13);
    const drops = Array(cols).fill(1);
    const chars = '01LOANCALCEMI';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(255,184,0,${Math.random()*0.07+0.02})`
          : `rgba(0,100,180,${Math.random()*0.04+0.01})`;
        ctx.fillText(char, i*13, y*13);
        if (y*13>H && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [theme.isDark]);

  const getEligibility = () => {
    if (score >= 80) return { max:200000, rate:8.5,  label:'EXCELLENT', color:green,  tier:'Premium'    };
    if (score >= 65) return { max:150000, rate:12.0, label:'GOOD',      color:cyan,   tier:'Standard'   };
    if (score >= 50) return { max:75000,  rate:18.0, label:'FAIR',      color:amber,  tier:'Basic'      };
    if (score >= 40) return { max:25000,  rate:24.0, label:'POOR',      color:pink,   tier:'Restricted' };
    return { max:0, rate:0, label:'INELIGIBLE', color:pink, tier:'None' };
  };

  const elig        = getEligibility();
  const eligible    = amount <= elig.max && elig.max > 0;
  const monthlyRate = elig.rate / 12 / 100;
  const emi         = eligible && monthlyRate > 0
    ? Math.round(amount * monthlyRate * Math.pow(1+monthlyRate,tenure) / (Math.pow(1+monthlyRate,tenure)-1))
    : 0;
  const totalPayment  = emi * tenure;
  const totalInterest = totalPayment - amount;
  const interestPct   = totalPayment > 0 ? Math.round((totalInterest/totalPayment)*100) : 0;

  const purposes = [
    { value:'business',  label:'Business',    icon:'🏪' },
    { value:'education', label:'Education',   icon:'📚' },
    { value:'medical',   label:'Medical',     icon:'🏥' },
    { value:'home',      label:'Home Repair', icon:'🏠' },
    { value:'vehicle',   label:'Vehicle',     icon:'🚗' },
    { value:'other',     label:'Other',       icon:'📦' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes neonPulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .calc-card{
          background:   ${theme.bgCard};
          border:       1px solid ${theme.border};
          border-radius:4px;
          padding:      22px;
          position:     relative;
          overflow:     hidden;
          margin-bottom:16px;
          transition:   all 0.3s ease;
          box-shadow:   ${theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)'};
        }
        .calc-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
        .cyber-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:${theme.isDark?'rgba(255,255,255,0.06)':'rgba(0,100,180,0.1)'};outline:none;cursor:pointer;}
        .thumb-amber::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${amber};box-shadow:0 0 8px ${amber};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-cyan::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${cyan};box-shadow:0 0 8px ${cyan};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-purple::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${purple};box-shadow:0 0 8px ${purple};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-elig::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${elig.color};box-shadow:0 0 8px ${elig.color};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .purpose-btn{padding:10px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'Courier New',monospace;transition:all 0.3s;text-align:center;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.35:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${amber}`, borderLeft:`2px solid ${amber}` },
        { top:16,    right:16, borderTop:`2px solid ${cyan}`,  borderRight:`2px solid ${cyan}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${cyan}`,borderLeft:`2px solid ${cyan}` },
        { bottom:16, right:16, borderBottom:`2px solid ${amber}`,borderRight:`2px solid ${amber}`},
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${amber},${cyan})`, boxShadow:`0 0 10px ${amber}` }}/>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:amber, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${amber}60`:'none' }}>LOAN CALCULATOR</h1>
                <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>EMI & ELIGIBILITY BASED ON CREDIT SCORE</p>
              </div>
            </div>
            <button onClick={() => navigate('/apply')} style={{ padding:'8px 16px', background:'transparent', border:`1px solid ${cyan}30`, borderRadius:'4px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${cyan}10`; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
              ← BACK
            </button>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${amber}60,${cyan}40,transparent)` }}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

          {/* Left — Inputs */}
          <div>
            {/* Credit Score */}
            <div className="calc-card">
              <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${amber}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ YOUR CREDIT SCORE</div>
              <div style={{ textAlign:'center', marginBottom:'20px' }}>
                <div style={{ fontSize:'64px', fontWeight:'900', color:elig.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 20px ${elig.color}`:'none', lineHeight:1 }}>{score}</div>
                <div style={{ marginTop:'8px', padding:'4px 16px', display:'inline-block', background:`${elig.color}15`, border:`1px solid ${elig.color}40`, borderRadius:'20px', fontSize:'10px', fontWeight:'700', color:elig.color, letterSpacing:'2px' }}>
                  {elig.label} — {elig.tier}
                </div>
              </div>
              <input type="range" className="cyber-slider thumb-elig" min={0} max={100} step={1} value={score} onChange={e => setScore(parseInt(e.target.value))}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                <span style={{ fontSize:'9px', color:pink,  fontFamily:"'Courier New',monospace" }}>0</span>
                <span style={{ fontSize:'9px', color:amber, fontFamily:"'Courier New',monospace" }}>40</span>
                <span style={{ fontSize:'9px', color:cyan,  fontFamily:"'Courier New',monospace" }}>65</span>
                <span style={{ fontSize:'9px', color:green, fontFamily:"'Courier New',monospace" }}>100</span>
              </div>
              <div style={{ display:'flex', gap:'0', height:'6px', borderRadius:'3px', overflow:'hidden', marginTop:'8px' }}>
                <div style={{ width:'40%', background:`${pink}40`  }}/>
                <div style={{ width:'25%', background:`${amber}40` }}/>
                <div style={{ width:'35%', background:`${green}40` }}/>
              </div>
            </div>

            {/* Loan Amount */}
            <div className="calc-card">
              <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>◈ LOAN AMOUNT</span>
                <span style={{ fontSize:'16px', fontWeight:'900', color:cyan, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${cyan}`:'none' }}>₹{amount.toLocaleString()}</span>
              </div>
              <input type="range" className="cyber-slider thumb-cyan" min={5000} max={200000} step={5000} value={amount} onChange={e => setAmount(parseInt(e.target.value))}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                <span style={{ fontSize:'9px', color:theme.textDim, fontFamily:"'Courier New',monospace" }}>₹5,000</span>
                <span style={{ fontSize:'9px', color:theme.textDim, fontFamily:"'Courier New',monospace" }}>₹2,00,000</span>
              </div>
              {!eligible && elig.max > 0 && (
                <div style={{ marginTop:'10px', padding:'8px 12px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px', fontSize:'10px', color:pink }}>
                  ⚠ Max eligible: ₹{elig.max.toLocaleString()} for your score
                </div>
              )}
            </div>

            {/* Tenure */}
            <div className="calc-card">
              <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>◈ LOAN TENURE</span>
                <span style={{ fontSize:'16px', fontWeight:'900', color:purple, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${purple}`:'none' }}>{tenure} months</span>
              </div>
              <input type="range" className="cyber-slider thumb-purple" min={3} max={36} step={3} value={tenure} onChange={e => setTenure(parseInt(e.target.value))}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                {[3,6,12,18,24,36].map(m => (
                  <span key={m} onClick={() => setTenure(m)} style={{ fontSize:'9px', color:tenure===m?purple:theme.textDim, fontFamily:"'Courier New',monospace", cursor:'pointer', fontWeight:tenure===m?'700':'400' }}>{m}m</span>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="calc-card">
              <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'14px', textTransform:'uppercase' }}>◈ LOAN PURPOSE</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                {purposes.map(p => (
                  <button key={p.value} className="purpose-btn"
                    onClick={() => setPurpose(p.value)}
                    style={{
                      background: purpose===p.value ? `${green}15` : 'transparent',
                      border:     `1px solid ${purpose===p.value ? green : theme.border}`,
                      color:      purpose===p.value ? green : theme.textMuted,
                      boxShadow:  purpose===p.value&&theme.isDark ? `0 0 10px ${green}20` : 'none',
                    }}>
                    <div style={{ fontSize:'18px', marginBottom:'4px' }}>{p.icon}</div>
                    <div style={{ fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase' }}>{p.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Results */}
          <div>
            {/* Eligibility */}
            <div className="calc-card" style={{ border:`1px solid ${elig.color}30`, background:theme.isDark?`${elig.color}06`:`${elig.color}08` }}>
              <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${elig.color}60,transparent)` }}/>
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ fontSize:'40px', marginBottom:'8px', animation:'neonPulse 2s ease-in-out infinite' }}>
                  {elig.max===0?'❌':eligible?'✅':'⚠️'}
                </div>
                <div style={{ fontSize:'14px', fontWeight:'900', color:elig.color, letterSpacing:'3px', textShadow:theme.isDark?`0 0 15px ${elig.color}`:'none', marginBottom:'4px' }}>
                  {elig.max===0?'NOT ELIGIBLE':eligible?'LOAN APPROVED':'REDUCE AMOUNT'}
                </div>
                <div style={{ fontSize:'10px', color:theme.textMuted }}>
                  Max eligible: ₹{elig.max.toLocaleString()} at {elig.rate}% p.a.
                </div>
              </div>
            </div>

            {/* EMI Result */}
            {eligible && emi > 0 && (
              <>
                <div className="calc-card">
                  <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${amber}40,transparent)` }}/>
                  <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ EMI BREAKDOWN</div>
                  <div style={{ textAlign:'center', marginBottom:'24px', padding:'20px', background:theme.isDark?`${amber}08`:`${amber}06`, border:`1px solid ${amber}20`, borderRadius:'4px' }}>
                    <div style={{ fontSize:'9px', letterSpacing:'3px', color:theme.textMuted, marginBottom:'8px', textTransform:'uppercase' }}>MONTHLY EMI</div>
                    <div style={{ fontSize:'48px', fontWeight:'900', color:amber, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 20px ${amber}`:'none', lineHeight:1 }}>
                      ₹{emi.toLocaleString()}
                    </div>
                    <div style={{ fontSize:'10px', color:theme.textMuted, marginTop:'8px' }}>per month for {tenure} months</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {[
                      { label:'Principal Amount', value:`₹${amount.toLocaleString()}`,       color:cyan   },
                      { label:'Interest Rate',    value:`${elig.rate}% per annum`,            color:purple },
                      { label:'Total Interest',   value:`₹${totalInterest.toLocaleString()}`, color:pink   },
                      { label:'Total Payment',    value:`₹${totalPayment.toLocaleString()}`,  color:green  },
                      { label:'Tenure',           value:`${tenure} months`,                   color:amber  },
                    ].map((s,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'2px' }}>
                        <span style={{ fontSize:'10px', color:theme.textMuted }}>{s.label}</span>
                        <span style={{ fontSize:'11px', fontWeight:'700', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 4px ${s.color}`:'none' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment breakdown */}
                <div className="calc-card">
                  <div className="calc-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
                  <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'14px', textTransform:'uppercase' }}>◈ PAYMENT BREAKDOWN</div>
                  <div style={{ display:'flex', height:'28px', borderRadius:'4px', overflow:'hidden', marginBottom:'12px' }}>
                    <div style={{ width:`${100-interestPct}%`, background:`${cyan}60`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:theme.isDark?cyan:'#005588' }}>
                      {100-interestPct}%
                    </div>
                    <div style={{ width:`${interestPct}%`, background:`${pink}60`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:theme.isDark?pink:'#880044' }}>
                      {interestPct}%
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'20px', marginBottom:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'9px', color:theme.textMuted }}>
                      <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:cyan }}/>
                      Principal ({100-interestPct}%)
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'9px', color:theme.textMuted }}>
                      <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:pink }}/>
                      Interest ({interestPct}%)
                    </div>
                  </div>

                  {/* Amortization preview */}
                  <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'10px', textTransform:'uppercase' }}>REPAYMENT SCHEDULE (PREVIEW)</div>
                  {[1, Math.round(tenure/2), tenure].map((month, i) => {
                    const paid       = emi * month;
                    const interestP  = Math.round(amount * (elig.rate/100/12) * month);
                    const principalP = paid - interestP;
                    return (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'2px', marginBottom:'6px' }}>
                        <span style={{ fontSize:'9px', color:theme.textMuted }}>Month {month}</span>
                        <span style={{ fontSize:'9px', color:cyan, fontFamily:"'Courier New',monospace" }}>₹{emi.toLocaleString()} EMI</span>
                        <span style={{ fontSize:'9px', color:green, fontFamily:"'Courier New',monospace" }}>₹{Math.max(0,Math.min(amount,principalP)).toLocaleString()} paid</span>
                      </div>
                    );
                  })}
                </div>

                <button onClick={() => navigate('/apply')} style={{
                  width:'100%', padding:'16px',
                  background:`linear-gradient(135deg,${amber},${cyan},${amber})`,
                  backgroundSize:'300% 300%', animation:'gradShift 3s ease infinite',
                  border:'none', borderRadius:'4px',
                  fontSize:'13px', fontWeight:'900', letterSpacing:'3px', color:'#000',
                  cursor:'pointer', fontFamily:"'Courier New',monospace",
                  textTransform:'uppercase', transition:'all 0.3s',
                  boxShadow:`0 0 30px ${amber}40`,
                }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 0 50px ${amber}60`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 0 30px ${amber}40`; }}>
                  ⚡ APPLY FOR THIS LOAN
                </button>
              </>
            )}

            {elig.max === 0 && (
              <div className="calc-card" style={{ textAlign:'center', padding:'40px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>📊</div>
                <p style={{ fontSize:'12px', color:theme.textMuted, lineHeight:'1.8', margin:'0 0 20px' }}>
                  Your score of <span style={{ color:pink, fontWeight:'700' }}>{score}</span> does not qualify.<br/>
                  Improve to at least <span style={{ color:amber, fontWeight:'700' }}>40</span> to get started.
                </p>
                <button onClick={() => navigate('/apply')} style={{ padding:'12px 24px', background:'transparent', border:`1px solid ${cyan}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${cyan}10`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
                  ⚡ GET CREDIT ANALYSIS
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop:'24px', textAlign:'center' }}>
          <p style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim, margin:0 }}>
            MICRO-LOAN.AI · LOAN CALCULATOR · FOR INFORMATIONAL PURPOSES ONLY
          </p>
        </div>
      </div>
    </div>
  );
}