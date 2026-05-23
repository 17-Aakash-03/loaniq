import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const QUARTERS = {
  Q1: [0,1,2],
  Q2: [3,4,5],
  Q3: [6,7,8],
  Q4: [9,10,11],
};

const defaultMonth = () => ({
  recharge_amount:    300,
  recharge_frequency: 2,
  grocery_spend:      3000,
  electricity_paid:   1,
});

export default function Application() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [mounted,    setMounted]    = useState(false);
  const [activeQ,    setActiveQ]    = useState('Q1');
  const [submitting, setSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error,      setError]      = useState('');

  const [location, setLocation] = useState({
    stability:         60,
    months_at_address: 24,
  });

  const [months, setMonths] = useState(
    Array.from({ length:12 }, defaultMonth)
  );

  const [references, setReferences] = useState([{
    relationship_type: 'guarantor',
    trust_score:       0.7,
  }]);

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
    const chars = '01LOANAPPLYCREDIT';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(181,55,242,${Math.random()*0.08+0.02})`
          : `rgba(0,80,180,${Math.random()*0.05+0.01})`;
        ctx.fillText(char, i*13, y*13);
        if (y*13>H && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [theme.isDark]);

  const updateMonth = (idx, field, value) => {
    setMonths(prev => {
      const next = [...prev];
      next[idx]  = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addReference = () => {
    if (references.length >= 3) return;
    setReferences(prev => [...prev, { relationship_type:'neighbor', trust_score:0.5 }]);
  };

  const updateReference = (idx, field, value) => {
    setReferences(prev => {
      const next = [...prev];
      next[idx]  = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeReference = (idx) => {
    if (references.length <= 1) return;
    setReferences(prev => prev.filter((_,i) => i !== idx));
  };

  const loadingMessages = [
    '⚡ INITIATING NEURAL CREDIT ANALYSIS...',
    '🧠 PROCESSING 12-MONTH BEHAVIORAL SEQUENCES...',
    '🔗 RUNNING GRAPH ATTENTION NETWORK...',
    '📊 COMPUTING SHAP FEATURE IMPORTANCE...',
    '🎯 CALCULATING CREDIT SCORE...',
    '✅ FINALIZING REPORT...',
  ];

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 800);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        location_stability: location.stability,
        months_at_address:  location.months_at_address,
        monthly_behavior:   months.map(m => ({
          recharge_amount:    m.recharge_amount,
          recharge_frequency: m.recharge_frequency,
          grocery_spend:      m.grocery_spend,
          electricity_paid:   m.electricity_paid,
        })),
        social_references: references.map(r => ({
          relationship_type: r.relationship_type,
          trust_score:       r.trust_score,
        })),
      };
      const res = await axios.post('https://loaniq-backend-6dmd.onrender.com/predict', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      clearInterval(msgInterval);
      navigate('/results', { state: { result: res.data } });
    } catch (err) {
      clearInterval(msgInterval);
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight:  '100vh',
      background: theme.bg,
      fontFamily: "'Courier New',monospace",
      position:   'relative',
      overflow:   'hidden',
      transition: 'background 0.3s ease',
    }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.98)}}
        @keyframes msgFade{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        .app-card{
          background:   ${theme.bgCard};
          border:       1px solid ${theme.border};
          border-radius:4px;
          padding:      24px;
          position:     relative;
          overflow:     hidden;
          margin-bottom:16px;
          transition:   all 0.3s ease;
          box-shadow:   ${theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)'};
        }
        .app-scan{
          position:  absolute;
          left:      0;
          right:     0;
          height:    1px;
          animation: scanH 4s linear infinite;
          pointer-events:none;
        }
        .cyber-slider{
          -webkit-appearance:none;
          appearance:none;
          width:        100%;
          height:       4px;
          border-radius:2px;
          background:   ${theme.isDark?'rgba(255,255,255,0.06)':'rgba(0,100,180,0.1)'};
          outline:      none;
          cursor:       pointer;
          transition:   background 0.3s ease;
        }
        .thumb-green::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${green};box-shadow:0 0 8px ${green};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-purple::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${purple};box-shadow:0 0 8px ${purple};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-cyan::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${cyan};box-shadow:0 0 8px ${cyan};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-amber::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${amber};box-shadow:0 0 8px ${amber};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
        .thumb-pink::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${pink};box-shadow:0 0 8px ${pink};cursor:pointer;border:2px solid ${theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'};}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.4:0.15 }}/>

      {/* Corner decorations */}
      {[
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,    borderLeft:`2px solid ${cyan}`    },
        { top:16,    right:16, borderTop:`2px solid ${purple}`,  borderRight:`2px solid ${purple}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${green}`,borderLeft:`2px solid ${green}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${pink}`, borderRight:`2px solid ${pink}`   },
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      {/* Loading Overlay */}
      {submitting && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          background:    theme.isDark ? 'rgba(0,3,8,0.95)' : 'rgba(240,244,248,0.97)',
          zIndex:        1000,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent:'center',
          backdropFilter:'blur(10px)',
        }}>
          <div style={{ position:'relative', width:'160px', height:'160px', marginBottom:'40px' }}>
            {[
              { size:160, color:cyan,   dur:'2s'   },
              { size:130, color:purple, dur:'3s'   },
              { size:100, color:green,  dur:'1.5s' },
            ].map((r,i) => (
              <div key={i} style={{
                position:     'absolute',
                top:          `${(160-r.size)/2}px`,
                left:         `${(160-r.size)/2}px`,
                width:        `${r.size}px`,
                height:       `${r.size}px`,
                borderRadius: '50%',
                border:       `2px solid ${r.color}`,
                animation:    `spin ${r.dur} linear infinite ${i%2===1?'reverse':''}`,
                boxShadow:    `0 0 15px ${r.color}40`,
                opacity:      0.8,
              }}/>
            ))}
            <div style={{
              position:       'absolute',
              top:            '50%',
              left:           '50%',
              transform:      'translate(-50%,-50%)',
              width:          '60px',
              height:         '60px',
              borderRadius:   '12px',
              background:     `linear-gradient(135deg,${cyan}20,${purple}20)`,
              border:         `1px solid ${cyan}60`,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '28px',
              animation:      'pulse 1s ease-in-out infinite',
            }}>💳</div>
          </div>
          <div style={{ fontSize:'14px', fontWeight:'900', color:cyan, letterSpacing:'4px', textTransform:'uppercase', textShadow:`0 0 20px ${cyan}`, marginBottom:'16px' }}>
            NEURAL ANALYSIS IN PROGRESS
          </div>
          <div key={loadingMsg} style={{ fontSize:'11px', color:theme.isDark?`rgba(0,255,247,0.6)`:`rgba(0,80,180,0.7)`, letterSpacing:'2px', marginBottom:'32px', animation:'msgFade 0.4s ease', textAlign:'center', maxWidth:'400px', lineHeight:'1.6' }}>
            {loadingMsg}
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:cyan, boxShadow:`0 0 6px ${cyan}`, animation:`pulse 1s ease-in-out ${i*0.2}s infinite` }}/>
            ))}
          </div>
          <div style={{ position:'absolute', bottom:'40px', fontSize:'9px', letterSpacing:'2px', color:theme.textDim, textAlign:'center' }}>
            TRANSFORMER + GRAPH ATTENTION NETWORK v2.0 · AUC 0.9618
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth:   '760px',
        margin:     '0 auto',
        padding:    '60px 20px 40px',
        position:   'relative',
        zIndex:     10,
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
            <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${purple},${cyan})`, boxShadow:`0 0 10px ${purple}` }}/>
            <div>
              <h1 style={{ fontSize:'22px', fontWeight:'900', color:purple, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${purple}60`:'none' }}>
                LOAN APPLICATION
              </h1>
              <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>
                NEURAL CREDIT ANALYSIS v2.0
              </p>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${purple}60,${cyan}40,transparent)` }}/>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding:'12px 16px', marginBottom:'16px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px', fontSize:'11px', color:pink, letterSpacing:'1px', animation:'fadeUp 0.3s ease' }}>
            ⚠ {error}
          </div>
        )}

        {/* MODULE 01 — Location & Stability */}
        <div className="app-card">
          <div className="app-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <span style={{ fontSize:'10px', fontWeight:'700', color:pink, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${pink}`:'none' }}>◈ MODULE 01</span>
            <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>LOCATION & STABILITY</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
            {[
              { label:'LOCATION STABILITY SCORE',  value:location.stability,         min:0, max:100, step:1,  color:green,  key:'stability',         display:v=>`${v}`,      cls:'thumb-green'  },
              { label:'MONTHS AT CURRENT ADDRESS', value:location.months_at_address,  min:1, max:120, step:1,  color:purple, key:'months_at_address', display:v=>`${v} mo`,   cls:'thumb-purple' },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>{s.label}</span>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${s.color}`:'none' }}>{s.display(s.value)}</span>
                </div>
                <input type="range" className={`cyber-slider ${s.cls}`}
                  min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => setLocation(prev => ({ ...prev, [s.key]: parseFloat(e.target.value) }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 02 — 12-Month Behavioral Data */}
        <div className="app-card">
          <div className="app-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:cyan, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${cyan}`:'none' }}>◈ MODULE 02</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>12-MONTH BEHAVIORAL DATA</span>
            </div>
            {/* Quarter tabs */}
            <div style={{ display:'flex', gap:'4px' }}>
              {['Q1','Q2','Q3','Q4'].map(q => (
                <button key={q} onClick={() => setActiveQ(q)} style={{
                  padding:      '6px 14px',
                  background:   activeQ===q ? `linear-gradient(135deg,${cyan},${purple})` : 'transparent',
                  border:       `1px solid ${activeQ===q ? 'transparent' : `${cyan}30`}`,
                  borderRadius: '2px',
                  fontSize:     '10px',
                  fontWeight:   '700',
                  letterSpacing:'1px',
                  color:        activeQ===q ? '#000' : theme.textMuted,
                  cursor:       'pointer',
                  fontFamily:   "'Courier New',monospace",
                  transition:   'all 0.3s',
                  boxShadow:    activeQ===q ? `0 0 12px ${cyan}40` : 'none',
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Month cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {QUARTERS[activeQ].map(idx => (
              <div key={idx} style={{
                padding:      '16px',
                background:   theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,100,180,0.03)',
                border:       `1px solid ${theme.isDark ? 'rgba(0,255,247,0.08)' : 'rgba(0,100,180,0.1)'}`,
                borderRadius: '4px',
                transition:   'all 0.3s ease',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <span style={{ fontSize:'12px', fontWeight:'900', color:cyan, letterSpacing:'3px', padding:'4px 10px', background:theme.isDark?`${cyan}10`:'rgba(0,100,180,0.08)', border:`1px solid ${cyan}30`, borderRadius:'2px' }}>
                    {MONTHS[idx]}
                  </span>
                  <span style={{ fontSize:'9px', color:theme.textDim, letterSpacing:'2px' }}>
                    MONTH {idx+1} / 12
                  </span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                  {/* Recharge Amount */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted, textTransform:'uppercase' }}>RECHARGE AMOUNT</span>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:green, fontFamily:"'Courier New',monospace" }}>{months[idx].recharge_amount}₹</span>
                    </div>
                    <input type="range" className="cyber-slider thumb-green"
                      min={0} max={1000} step={50}
                      value={months[idx].recharge_amount}
                      onChange={e => updateMonth(idx, 'recharge_amount', parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Recharge Frequency */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted, textTransform:'uppercase' }}>RECHARGE FREQUENCY</span>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:purple, fontFamily:"'Courier New',monospace" }}>{months[idx].recharge_frequency}x</span>
                    </div>
                    <input type="range" className="cyber-slider thumb-purple"
                      min={1} max={4} step={1}
                      value={months[idx].recharge_frequency}
                      onChange={e => updateMonth(idx, 'recharge_frequency', parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Grocery Spend */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted, textTransform:'uppercase' }}>GROCERY SPEND</span>
                      <span style={{ fontSize:'11px', fontWeight:'700', color:amber, fontFamily:"'Courier New',monospace" }}>{months[idx].grocery_spend}₹</span>
                    </div>
                    <input type="range" className="cyber-slider thumb-amber"
                      min={500} max={10000} step={500}
                      value={months[idx].grocery_spend}
                      onChange={e => updateMonth(idx, 'grocery_spend', parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Electricity Paid */}
                  <div>
                    <div style={{ marginBottom:'6px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted, textTransform:'uppercase' }}>ELECTRICITY PAID</span>
                    </div>
                    <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                      {[
                        { label:'✓ YES', value:1, color:green },
                        { label:'✗ NO',  value:0, color:pink  },
                      ].map(opt => (
                        <button key={opt.value}
                          onClick={() => updateMonth(idx, 'electricity_paid', opt.value)}
                          style={{
                            flex:         1,
                            padding:      '10px',
                            background:   months[idx].electricity_paid===opt.value ? `${opt.color}20` : 'transparent',
                            border:       `1px solid ${months[idx].electricity_paid===opt.value ? opt.color : `${opt.color}30`}`,
                            borderRadius: '2px',
                            fontSize:     '11px',
                            fontWeight:   '700',
                            color:        months[idx].electricity_paid===opt.value ? opt.color : `${opt.color}50`,
                            cursor:       'pointer',
                            fontFamily:   "'Courier New',monospace",
                            letterSpacing:'1px',
                            transition:   'all 0.3s',
                            boxShadow:    months[idx].electricity_paid===opt.value ? `0 0 12px ${opt.color}30` : 'none',
                          }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 03 — Social Trust Graph */}
        <div className="app-card">
          <div className="app-scan" style={{ background:`linear-gradient(90deg,transparent,${amber}40,transparent)` }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:pink, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${pink}`:'none' }}>◈ MODULE 03</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>SOCIAL TRUST GRAPH</span>
            </div>
            {references.length < 3 && (
              <button onClick={addReference} style={{
                padding:       '8px 16px',
                background:    `${amber}10`,
                border:        `1px solid ${amber}40`,
                borderRadius:  '2px',
                fontSize:      '10px',
                fontWeight:    '700',
                letterSpacing: '2px',
                color:         amber,
                cursor:        'pointer',
                fontFamily:    "'Courier New',monospace",
                textTransform: 'uppercase',
                transition:    'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background=`${amber}20`; e.currentTarget.style.boxShadow=`0 0 10px ${amber}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background=`${amber}10`; e.currentTarget.style.boxShadow='none'; }}>
                + ADD NODE
              </button>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {references.map((ref, idx) => (
              <div key={idx} style={{
                padding:      '16px',
                paddingTop:   references.length > 1 ? '44px' : '16px',
                background:   theme.isDark ? 'rgba(255,184,0,0.04)' : 'rgba(255,184,0,0.06)',
                border:       `1px solid ${amber}25`,
                borderRadius: '4px',
                position:     'relative',
                transition:   'all 0.3s ease',
              }}>

                {/* Node header — label + remove button */}
                {references.length > 1 && (
                  <div style={{
                    position:       'absolute',
                    top:            '10px',
                    left:           '16px',
                    right:          '16px',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize:'9px', fontWeight:'700', color:`${amber}80`, letterSpacing:'2px', textTransform:'uppercase' }}>
                      ◈ NODE {idx + 1}
                    </span>
                    <button
                      onClick={() => removeReference(idx)}
                      style={{
                        background:    `${pink}10`,
                        border:        `1px solid ${pink}30`,
                        borderRadius:  '2px',
                        color:         pink,
                        cursor:        'pointer',
                        fontSize:      '9px',
                        fontWeight:    '700',
                        padding:       '3px 10px',
                        fontFamily:    "'Courier New',monospace",
                        letterSpacing: '1px',
                        transition:    'all 0.3s',
                        whiteSpace:    'nowrap',
                        display:       'flex',
                        alignItems:    'center',
                        gap:           '4px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background=`${pink}25`; e.currentTarget.style.boxShadow=`0 0 8px ${pink}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background=`${pink}10`; e.currentTarget.style.boxShadow='none'; }}>
                      ✕ REMOVE
                    </button>
                  </div>
                )}

                {/* Node content */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                  {/* Node type */}
                  <div>
                    <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'8px', textTransform:'uppercase' }}>NODE TYPE</div>
                    <select
                      value={ref.relationship_type}
                      onChange={e => updateReference(idx, 'relationship_type', e.target.value)}
                      style={{
                        width:         '100%',
                        padding:       '10px 14px',
                        background:    theme.isDark ? 'rgba(0,3,8,0.9)' : 'rgba(255,255,255,0.95)',
                        border:        `1px solid ${amber}30`,
                        borderRadius:  '4px',
                        color:         amber,
                        fontSize:      '12px',
                        fontFamily:    "'Courier New',monospace",
                        cursor:        'pointer',
                        outline:       'none',
                        letterSpacing: '1px',
                      }}>
                      <option value="guarantor">GUARANTOR</option>
                      <option value="employer">EMPLOYER</option>
                      <option value="neighbor">NEIGHBOR</option>
                    </select>
                  </div>

                  {/* Trust score */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>TRUST SCORE</span>
                      <span style={{ fontSize:'13px', fontWeight:'700', color:amber, fontFamily:"'Courier New',monospace" }}>{Math.round(ref.trust_score*100)}%</span>
                    </div>
                    <input type="range" className="cyber-slider thumb-amber"
                      min={0} max={1} step={0.05}
                      value={ref.trust_score}
                      onChange={e => updateReference(idx, 'trust_score', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width:          '100%',
            padding:        '18px',
            background:     submitting
              ? theme.isDark ? 'rgba(0,255,247,0.08)' : 'rgba(0,100,180,0.08)'
              : `linear-gradient(135deg,${cyan},${purple},${pink},${cyan})`,
            backgroundSize: '300% 300%',
            animation:      submitting ? 'none' : 'gradShift 3s ease infinite',
            border:         `1px solid ${submitting ? `${cyan}30` : 'transparent'}`,
            borderRadius:   '4px',
            fontSize:       '14px',
            fontWeight:     '900',
            letterSpacing:  '4px',
            color:          submitting ? `${cyan}60` : '#000',
            cursor:         submitting ? 'not-allowed' : 'pointer',
            fontFamily:     "'Courier New',monospace",
            textTransform:  'uppercase',
            transition:     'all 0.3s',
            boxShadow:      submitting ? 'none' : `0 0 30px ${cyan}30`,
            marginTop:      '8px',
          }}
          onMouseEnter={e => { if(!submitting){ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 0 40px ${cyan}50`; }}}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=submitting?'none':`0 0 30px ${cyan}30`; }}>
          {submitting ? '⚡ ANALYZING...' : '⚡ INITIATE CREDIT ANALYSIS'}
        </button>

        {/* Footer */}
        <div style={{ marginTop:'20px', textAlign:'center' }}>
          <p style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim, margin:0, textTransform:'uppercase' }}>
            LOANIQ · NEURAL CREDIT INTELLIGENCE · AUC 0.9618
          </p>
        </div>
      </div>
    </div>
  );
}

