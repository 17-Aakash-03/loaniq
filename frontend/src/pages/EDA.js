import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend,
} from 'recharts';

export default function EDA() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mounted,   setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;
  const teal   = theme.teal;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    axios.get('https://loaniq-backend-6dmd.onrender.com/eda/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => { setData(res.data); setMounted(true); })
    .catch(() => navigate('/apply'))
    .finally(() => setLoading(false));
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
    const chars = '01EDAANALYTICS';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(0,212,200,${Math.random()*0.07+0.02})`
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

  const tooltipStyle = {
    contentStyle: {
      background:  theme.isDark ? 'rgba(0,3,8,0.97)' : 'rgba(255,255,255,0.97)',
      border:      `1px solid ${cyan}40`,
      borderRadius:'4px',
      fontFamily:  "'Courier New',monospace",
      fontSize:    '10px',
      color:       theme.text,
    },
    labelStyle: { color:cyan },
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'50px', height:'50px', border:`2px solid ${cyan}30`, borderTopColor:cyan, borderRadius:'50%', margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }}/>
        <p style={{ color:theme.textMuted, fontSize:'11px', letterSpacing:'3px' }}>LOADING EDA DATA...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!data) return null;

  const colorMap = { cyan, purple, green, amber, pink, teal };
  const tabs = [
    { id:'overview',  label:'OVERVIEW'        },
    { id:'features',  label:'FEATURE ANALYSIS'},
    { id:'metrics',   label:'MODEL METRICS'   },
    { id:'temporal',  label:'TEMPORAL DATA'   },
  ];

  const tierColors = [green, amber, pink];

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes borderScan{
          0%{border-color:${theme.isDark?'rgba(0,212,200,0.2)':'rgba(0,100,180,0.15)'}}
          50%{border-color:${theme.isDark?'rgba(0,255,247,0.2)':'rgba(0,150,220,0.25)'}}
          100%{border-color:${theme.isDark?'rgba(0,212,200,0.2)':'rgba(0,100,180,0.15)'}}
        }
        .eda-card{
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
        .eda-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
        .tab-btn{
          padding:        10px 20px;
          background:     transparent;
          border:         none;
          cursor:         pointer;
          font-size:      10px;
          font-weight:    700;
          letter-spacing: 3px;
          font-family:    'Courier New',monospace;
          text-transform: uppercase;
          transition:     all 0.3s;
          border-bottom:  2px solid transparent;
        }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.3:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,   borderLeft:`2px solid ${cyan}`   },
        { top:16,    right:16, borderTop:`2px solid ${purple}`, borderRight:`2px solid ${purple}`},
        { bottom:16, left:16,  borderBottom:`2px solid ${teal}`,borderLeft:`2px solid ${teal}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${green}`,borderRight:`2px solid ${green}`},
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${teal},${cyan})`, boxShadow:`0 0 10px ${teal}` }}/>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:teal, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${teal}60`:'none' }}>EDA CONSOLE</h1>
                <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>EXPLORATORY DATA ANALYSIS — TRANSFORMER + GAT</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ padding:'4px 12px', border:`1px solid ${teal}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:teal, background:`${teal}10` }}>
                ◈ {data.training_samples?.toLocaleString()} SAMPLES
              </div>
              <div style={{ padding:'4px 12px', border:`1px solid ${cyan}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:cyan, background:`${cyan}10` }}>
                {data.model_architecture}
              </div>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${teal}60,${cyan}40,transparent)` }}/>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${theme.border}`, marginBottom:'24px' }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                color:             activeTab===t.id ? teal : theme.textMuted,
                borderBottomColor: activeTab===t.id ? teal : 'transparent',
                textShadow:        activeTab===t.id && theme.isDark ? `0 0 8px ${teal}` : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            {/* KPI Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
              {[
                { label:'TOTAL RECORDS',   value:data.total_records,      color:cyan   },
                { label:'AVG SCORE',       value:data.avg_score,          color:teal   },
                { label:'TRAINING SAMPLES',value:data.training_samples?.toLocaleString(), color:purple },
                { label:'FEATURES',        value:'6 ANALYZED',            color:green  },
              ].map((s,i) => (
                <div key={i} className="eda-card" style={{ textAlign:'center', padding:'18px' }}>
                  <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'28px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${s.color}`:'none', marginBottom:'6px' }}>{s.value}</div>
                  <div style={{ fontSize:'8px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Score distribution + Tier breakdown */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div className="eda-card">
                <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ SCORE DISTRIBUTION</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.score_distribution} margin={{ top:5, right:5, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                    <XAxis dataKey="label" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24} allowDecimals={false}/>
                    <Tooltip {...tooltipStyle} formatter={v=>[`${v} records`,'COUNT']}/>
                    <Bar dataKey="count" radius={[3,3,0,0]}>
                      {data.score_distribution.map((entry,i) => {
                        const score = i * 10;
                        const col   = score >= 65 ? green : score >= 40 ? amber : pink;
                        return <Cell key={i} fill={col} fillOpacity={0.75}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="eda-card">
                <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ RISK TIER BREAKDOWN</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'8px' }}>
                  {data.tier_breakdown.map((tier,i) => (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'10px', color:theme.text, fontWeight:'700' }}>{tier.tier}</span>
                        <span style={{ fontSize:'11px', fontWeight:'900', color:tierColors[i], fontFamily:"'Courier New',monospace" }}>{tier.pct}%</span>
                      </div>
                      <div style={{ height:'8px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${tier.pct}%`, background:`linear-gradient(90deg,${tierColors[i]}60,${tierColors[i]})`, borderRadius:'4px', boxShadow:theme.isDark?`0 0 8px ${tierColors[i]}60`:'none', transition:'width 1s ease' }}/>
                      </div>
                      <div style={{ fontSize:'8px', color:theme.textDim, marginTop:'3px', letterSpacing:'1px' }}>{tier.count} records</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FEATURE ANALYSIS TAB ── */}
        {activeTab === 'features' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="eda-card">
              <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ FEATURE IMPORTANCE (SHAP WEIGHTS)</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {data.feature_importance.map((f,i) => {
                  const col = colorMap[f.color] || cyan;
                  const pct = (f.importance / 22) * 100;
                  return (
                    <div key={i} style={{ animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'11px', color:theme.text, fontWeight:'600' }}>{f.feature}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <span style={{ fontSize:'10px', color:theme.textMuted }}>weight: {f.importance}</span>
                          <span style={{ fontSize:'12px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${col}`:'none' }}>{f.importance}%</span>
                        </div>
                      </div>
                      <div style={{ height:'10px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', borderRadius:'5px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${col}60,${col})`, boxShadow:theme.isDark?`0 0 8px ${col}60`:'none', borderRadius:'5px', transition:`width 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i*0.08}s` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:'20px', padding:'14px 16px', background:theme.isDark?'rgba(181,55,242,0.06)':'rgba(100,50,200,0.05)', border:`1px solid ${purple}20`, borderRadius:'4px' }}>
                <p style={{ margin:0, fontSize:'10px', color:theme.textMuted, lineHeight:'1.8', letterSpacing:'0.5px' }}>
                  ◈ Electricity Regularity has the highest SHAP weight (22%) followed by Social Trust (20%). These two features together account for 42% of the credit decision, reflecting the importance of utility payment discipline and community trust networks for unbanked populations.
                </p>
              </div>
            </div>

            {/* Feature correlation */}
            <div className="eda-card">
              <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${amber}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ FEATURE WEIGHT COMPARISON</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.feature_importance} layout="vertical" margin={{ top:5, right:40, left:120, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="feature" tick={{ fontSize:9, fill:theme.text, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={115}/>
                  <Tooltip {...tooltipStyle} formatter={v=>[`${v}%`,'IMPORTANCE']}/>
                  <Bar dataKey="importance" radius={[0,4,4,0]}>
                    {data.feature_importance.map((f,i) => (
                      <Cell key={i} fill={colorMap[f.color]||cyan} fillOpacity={0.8}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── MODEL METRICS TAB ── */}
        {activeTab === 'metrics' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="eda-card">
              <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ MODEL PERFORMANCE METRICS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {data.model_metrics.map((m,i) => {
                  const colors = [cyan, green, purple, amber, teal];
                  const col    = colors[i % colors.length];
                  const pct    = m.value * 100;
                  return (
                    <div key={i} style={{ animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                        <span style={{ fontSize:'12px', color:theme.text, fontWeight:'700', letterSpacing:'1px' }}>{m.metric}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <span style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'1px' }}>
                            {pct >= 90 ? '🏆 EXCELLENT' : pct >= 80 ? '✅ GOOD' : '⚠️ FAIR'}
                          </span>
                          <span style={{ fontSize:'18px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${col}`:'none' }}>
                            {m.value.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <div style={{ height:'12px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', borderRadius:'6px', overflow:'hidden', position:'relative' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${col}60,${col})`, borderRadius:'6px', boxShadow:theme.isDark?`0 0 10px ${col}60`:'none', transition:`width 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i*0.1}s` }}/>
                        <div style={{ position:'absolute', right:'6px', top:'50%', transform:'translateY(-50%)', fontSize:'8px', color:theme.isDark?'rgba(0,0,0,0.7)':'rgba(0,0,0,0.5)', fontWeight:'700' }}>{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar chart */}
            <div className="eda-card">
              <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${teal}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ METRICS RADAR</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data.model_metrics.map(m => ({ metric:m.metric, value:Math.round(m.value*100) }))}>
                  <PolarGrid stroke={theme.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'} gridType="polygon"/>
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize:10, fill:theme.text, fontFamily:"'Courier New',monospace", fontWeight:'700' }}/>
                  <PolarRadiusAxis domain={[85,100]} tick={{ fontSize:8, fill:theme.textDim }} axisLine={false} tickCount={4}/>
                  <Radar name="Score" dataKey="value" stroke={cyan} fill={cyan} fillOpacity={0.15} strokeWidth={2} dot={{ fill:cyan, r:4 }}/>
                  <Tooltip {...tooltipStyle} formatter={v=>[`${v}%`,'VALUE']}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TEMPORAL TAB ── */}
        {activeTab === 'temporal' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="eda-card">
              <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ MONTHLY BEHAVIORAL TRENDS</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.synthetic_feature_dist} margin={{ top:10, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="left" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={40}/>
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={40}/>
                  <Tooltip {...tooltipStyle}/>
                  <Legend wrapperStyle={{ fontSize:'10px', fontFamily:"'Courier New',monospace", color:theme.text }}/>
                  <Line yAxisId="left"  type="monotone" dataKey="recharge"     stroke={cyan}   strokeWidth={2} dot={{ fill:cyan,   r:3 }} name="Recharge (₹)"/>
                  <Line yAxisId="left"  type="monotone" dataKey="grocery"      stroke={green}  strokeWidth={2} dot={{ fill:green,  r:3 }} name="Grocery (₹)"/>
                  <Line yAxisId="right" type="monotone" dataKey="electricity"  stroke={amber}  strokeWidth={2} dot={{ fill:amber,  r:3 }} name="Electricity Rate"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly stats summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
              {[
                { label:'AVG RECHARGE',    value:'₹316',  color:cyan,   desc:'Monthly average across all applicants'  },
                { label:'AVG GROCERY',     value:'₹3,133',color:green,  desc:'Monthly household spending average'       },
                { label:'ELECTRICITY RATE',value:'80.1%', color:amber,  desc:'Average bill payment consistency rate'   },
              ].map((s,i) => (
                <div key={i} className="eda-card" style={{ textAlign:'center', padding:'20px' }}>
                  <div className="eda-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'24px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${s.color}`:'none', marginBottom:'6px' }}>{s.value}</div>
                  <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase', marginBottom:'8px' }}>{s.label}</div>
                  <div style={{ fontSize:'10px', color:theme.textMuted, lineHeight:'1.5' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>MICRO-LOAN.AI › EDA CONSOLE</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>TRANSFORMER + GAT · AUC 0.9618</span>
        </div>
      </div>
    </div>
  );
}
