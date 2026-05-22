import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Legend,
} from 'recharts';

export default function ModelComparison() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mounted,   setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selected,  setSelected]  = useState(null);

  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;

  const modelColors = [cyan, green, purple, amber, pink];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    axios.get('https://loaniq-backend-6dmd.onrender.com/model/comparison', {
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
    const chars = '01MODELCOMPARE';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(0,255,150,${Math.random()*0.07+0.02})`
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
      background:   theme.isDark ? 'rgba(0,3,8,0.97)' : 'rgba(255,255,255,0.97)',
      border:       `1px solid ${green}40`,
      borderRadius: '4px',
      fontFamily:   "'Courier New',monospace",
      fontSize:     '10px',
      color:        theme.text,
    },
    labelStyle: { color:green },
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'50px', height:'50px', border:`2px solid ${green}30`, borderTopColor:green, borderRadius:'50%', margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }}/>
        <p style={{ color:theme.textMuted, fontSize:'11px', letterSpacing:'3px' }}>LOADING MODEL DATA...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!data) return null;

  const tabs = [
    { id:'overview', label:'OVERVIEW'      },
    { id:'metrics',  label:'METRICS'       },
    { id:'radar',    label:'RADAR CHART'   },
    { id:'detail',   label:'MODEL DETAILS' },
  ];

  const barData = ['auc','f1','precision','recall','accuracy'].map(metric => {
    const obj = { metric: metric.toUpperCase().replace('AUC','AUC-ROC').replace('F1','F1 Score') };
    data.models.forEach(m => { obj[m.short] = Math.round(m[metric] * 100); });
    return obj;
  });

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes winnerGlow{
          0%,100%{box-shadow:0 0 20px ${theme.isDark?`rgba(0,255,247,0.2)`:'rgba(0,100,180,0.15)'}}
          50%{box-shadow:0 0 40px ${theme.isDark?`rgba(0,255,247,0.5)`:'rgba(0,100,180,0.3)'},0 0 80px ${theme.isDark?`rgba(0,255,247,0.2)`:'rgba(0,100,180,0.1)'}}
        }
        .mc-card{
          background:   ${theme.bgCard};
          border:       1px solid ${theme.border};
          border-radius:4px;
          padding:      22px;
          position:     relative;
          overflow:     hidden;
          transition:   all 0.3s ease;
          box-shadow:   ${theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)'};
        }
        .mc-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
        .tab-btn{padding:10px 20px;background:transparent;border:none;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;text-transform:uppercase;transition:all 0.3s;border-bottom:2px solid transparent;}
        .model-card{border-radius:4px;padding:18px;cursor:pointer;transition:all 0.3s ease;position:relative;overflow:hidden;}
        .model-card:hover{transform:translateY(-3px);}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.3:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${green}`,  borderLeft:`2px solid ${green}`  },
        { top:16,    right:16, borderTop:`2px solid ${cyan}`,   borderRight:`2px solid ${cyan}`  },
        { bottom:16, left:16,  borderBottom:`2px solid ${cyan}`,borderLeft:`2px solid ${cyan}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${green}`,borderRight:`2px solid ${green}`},
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${green},${cyan})`, boxShadow:`0 0 10px ${green}` }}/>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:green, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${green}60`:'none' }}>MODEL COMPARISON</h1>
                <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>BENCHMARKING — TRANSFORMER+GAT vs BASELINES</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ padding:'4px 12px', border:`1px solid ${green}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:green, background:`${green}10` }}>
                ◈ {data.models.length} MODELS
              </div>
              <div style={{ padding:'4px 12px', border:`1px solid ${cyan}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:cyan, background:`${cyan}10` }}>
                ▲ +{data.improvement_over_baseline}% vs BASELINE
              </div>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${green}60,${cyan}40,transparent)` }}/>
        </div>

        {/* Winner banner */}
        <div style={{ marginBottom:'24px', padding:'16px 24px', background:theme.isDark?`linear-gradient(135deg,rgba(0,255,247,0.06),rgba(0,255,150,0.06))`:`linear-gradient(135deg,rgba(0,100,180,0.06),rgba(0,150,100,0.06))`, border:`1px solid ${cyan}30`, borderRadius:'4px', display:'flex', alignItems:'center', gap:'16px', animation:'winnerGlow 3s ease-in-out infinite' }}>
          <span style={{ fontSize:'28px' }}>🏆</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'11px', letterSpacing:'3px', color:theme.textMuted, marginBottom:'4px', textTransform:'uppercase' }}>BEST PERFORMING MODEL</div>
            <div style={{ fontSize:'18px', fontWeight:'900', color:cyan, letterSpacing:'2px', textShadow:theme.isDark?`0 0 15px ${cyan}`:'none' }}>{data.winner}</div>
          </div>
          <div style={{ display:'flex', gap:'16px' }}>
            {[
              { label:'AUC-ROC',     value:'0.9618',                          color:cyan   },
              { label:'F1 SCORE',    value:'0.9142',                          color:green  },
              { label:'VS BASELINE', value:`+${data.improvement_over_baseline}%`, color:amber },
              { label:'VS XGBOOST',  value:`+${data.improvement_over_xgboost}%`,  color:purple },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center', padding:'8px 14px', background:theme.isDark?'rgba(0,0,0,0.3)':theme.bgCardSolid, border:`1px solid ${s.color}20`, borderRadius:'4px', boxShadow:theme.isDark?'none':'0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:'16px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${s.color}`:'none' }}>{s.value}</div>
                <div style={{ fontSize:'8px', color:theme.textDim, letterSpacing:'1px', marginTop:'3px', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${theme.border}`, marginBottom:'24px' }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                color:             activeTab===t.id ? green : theme.textMuted,
                borderBottomColor: activeTab===t.id ? green : 'transparent',
                textShadow:        activeTab===t.id && theme.isDark ? `0 0 8px ${green}` : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'24px' }}>
              {data.models.map((m, i) => {
                const col = modelColors[i];
                return (
                  <div key={i} className="model-card"
                    onClick={() => { setSelected(selected===i?null:i); setActiveTab('detail'); }}
                    style={{
                      background: m.highlight
                        ? theme.isDark ? `rgba(0,255,247,0.06)` : 'rgba(0,100,180,0.06)'
                        : theme.bgCard,
                      border:     `1px solid ${m.highlight ? `${col}50` : `${col}20`}`,
                      boxShadow:  m.highlight
                        ? theme.isDark ? `0 0 20px ${col}20` : `0 4px 20px ${col}15`
                        : theme.isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                    {m.highlight && <div style={{ position:'absolute', top:8, right:8, fontSize:'14px' }}>🏆</div>}
                    <div style={{ fontSize:'9px', letterSpacing:'2px', color:`${col}${theme.isDark?'80':'99'}`, marginBottom:'6px', textTransform:'uppercase' }}>
                      {m.highlight?'◈ OUR MODEL':'◎ BASELINE'}
                    </div>
                    <div style={{ fontSize:'12px', fontWeight:'900', color:col, letterSpacing:'1px', marginBottom:'12px', textShadow:theme.isDark?`0 0 8px ${col}`:'none' }}>
                      {m.short}
                    </div>
                    {[
                      { label:'AUC', value:m.auc },
                      { label:'F1',  value:m.f1  },
                    ].map((met,j) => (
                      <div key={j} style={{ marginBottom:'8px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                          <span style={{ fontSize:'8px', color:theme.textMuted, letterSpacing:'1px' }}>{met.label}</span>
                          <span style={{ fontSize:'9px', fontWeight:'700', color:col, fontFamily:"'Courier New',monospace" }}>{met.value.toFixed(4)}</span>
                        </div>
                        <div style={{ height:'3px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.08)', borderRadius:'2px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${met.value*100}%`, background:`linear-gradient(90deg,${col}60,${col})`, borderRadius:'2px', transition:'width 1s ease' }}/>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop:'8px', padding:'4px 6px', background:`${col}10`, border:`1px solid ${col}20`, borderRadius:'2px', fontSize:'8px', color:`${col}${theme.isDark?'80':'99'}`, letterSpacing:'1px', textAlign:'center' }}>
                      {m.inference_ms}ms inference
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AUC comparison bars */}
            <div className="mc-card" style={{ marginBottom:'16px' }}>
              <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ AUC-ROC COMPARISON</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[...data.models].sort((a,b) => b.auc-a.auc).map((m,i) => {
                  const col = modelColors[data.models.findIndex(x=>x.name===m.name)];
                  const pct = m.auc * 100;
                  return (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          {m.highlight && <span style={{ fontSize:'12px' }}>🏆</span>}
                          <span style={{ fontSize:'11px', color:m.highlight?col:theme.text, fontWeight:m.highlight?'700':'400' }}>{m.name}</span>
                          {m.highlight && <span style={{ padding:'2px 8px', background:`${col}15`, border:`1px solid ${col}40`, borderRadius:'2px', fontSize:'9px', color:col }}>BEST</span>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <span style={{ fontSize:'13px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${col}`:'none' }}>{m.auc.toFixed(4)}</span>
                          {i > 0 && <span style={{ fontSize:'9px', color:pink, fontFamily:"'Courier New',monospace" }}>-{((data.models[0].auc - m.auc)*100).toFixed(1)}%</span>}
                        </div>
                      </div>
                      <div style={{ height:'10px', background:theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)', borderRadius:'5px', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'5px', width:`${pct}%`, background:`linear-gradient(90deg,${col}60,${col})`, boxShadow:m.highlight&&theme.isDark?`0 0 10px ${col}80`:`0 0 4px ${col}40`, transition:`width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i*0.1}s` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Improvement summary */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
              {[
                { label:'vs Logistic Regression', value:`+${data.improvement_over_baseline}%`, color:cyan,   icon:'▲' },
                { label:'vs XGBoost',              value:`+${data.improvement_over_xgboost}%`,  color:green,  icon:'▲' },
                { label:'vs LSTM Only',            value:'+10.2%',                              color:purple, icon:'▲' },
              ].map((s,i) => (
                <div key={i} className="mc-card">
                  <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'8px', textTransform:'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize:'32px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 15px ${s.color}`:'none', lineHeight:1, marginBottom:'6px' }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize:'9px', color:theme.textDim }}>AUC-ROC improvement</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── METRICS TAB ── */}
        {activeTab === 'metrics' && (
          <div style={{ animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="mc-card">
              <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ FULL METRICS TABLE</div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr repeat(5,1fr)', gap:'8px', marginBottom:'8px', paddingBottom:'8px', borderBottom:`1px solid ${theme.border}` }}>
                <div style={{ fontSize:'8px', letterSpacing:'2px', color:theme.textDim, textTransform:'uppercase' }}>METRIC</div>
                {data.models.map((m,i) => (
                  <div key={i} style={{ fontSize:'8px', letterSpacing:'1px', color:modelColors[i], textTransform:'uppercase', textAlign:'center', fontWeight:'700' }}>
                    {m.highlight?'★ ':''}{m.short}
                  </div>
                ))}
              </div>
              {[
                { label:'AUC-ROC',       key:'auc'          },
                { label:'F1 Score',      key:'f1'           },
                { label:'Precision',     key:'precision'    },
                { label:'Recall',        key:'recall'       },
                { label:'Accuracy',      key:'accuracy'     },
                { label:'Inference (ms)',key:'inference_ms', raw:true },
                { label:'Train Time (s)',key:'training_time',raw:true },
              ].map((row, ri) => {
                const vals = data.models.map(m => m[row.key]);
                const best = row.raw ? Math.min(...vals) : Math.max(...vals);
                return (
                  <div key={ri} style={{ display:'grid', gridTemplateColumns:'2fr repeat(5,1fr)', gap:'8px', padding:'10px 0', borderBottom:`1px solid ${theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)'}`, background:ri%2===0?theme.isDark?'rgba(255,255,255,0.01)':'rgba(0,0,0,0.01)':'transparent' }}>
                    <div style={{ fontSize:'10px', color:theme.textMuted }}>{row.label}</div>
                    {data.models.map((m, mi) => {
                      const val    = m[row.key];
                      const isBest = val === best;
                      const col    = modelColors[mi];
                      return (
                        <div key={mi} style={{ textAlign:'center' }}>
                          <span style={{ fontSize:'11px', fontWeight:isBest?'900':'400', color:isBest?col:theme.textMuted, fontFamily:"'Courier New',monospace", textShadow:isBest&&theme.isDark?`0 0 6px ${col}`:'none' }}>
                            {row.raw ? val : val.toFixed(4)}
                          </span>
                          {isBest && <span style={{ marginLeft:'4px', fontSize:'9px', color:col }}>★</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="mc-card">
              <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ METRIC SCORES (%)</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top:10, right:20, left:0, bottom:20 }} barCategoryGap="20%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                  <XAxis dataKey="metric" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                  <YAxis domain={[60,100]} tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={30} tickFormatter={v=>`${v}%`}/>
                  <Tooltip {...tooltipStyle} formatter={(v,name) => [`${v}%`, name]}/>
                  <Legend wrapperStyle={{ fontSize:'9px', fontFamily:"'Courier New',monospace", color:theme.text }}/>
                  {data.models.map((m,i) => (
                    <Bar key={i} dataKey={m.short} fill={modelColors[i]} radius={[2,2,0,0]} fillOpacity={m.highlight?1:0.6}/>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── RADAR TAB ── */}
        {activeTab === 'radar' && (
          <div style={{ animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="mc-card">
              <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ MULTI-METRIC RADAR</div>
              <ResponsiveContainer width="100%" height={420}>
                <RadarChart data={data.radar} margin={{ top:20, right:40, bottom:20, left:40 }}>
                  <PolarGrid stroke={theme.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'} gridType="polygon"/>
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:theme.text, fontFamily:"'Courier New',monospace", fontWeight:'700' }}/>
                  <PolarRadiusAxis domain={[60,100]} tick={{ fontSize:8, fill:theme.textDim }} axisLine={false} tickCount={5}/>
                  <Tooltip {...tooltipStyle}/>
                  <Radar name="Transformer+GAT" dataKey="Ours"    stroke={cyan}   fill={cyan}   fillOpacity={0.20} strokeWidth={3} dot={{ fill:cyan,   r:5 }}/>
                  <Radar name="XGBoost"         dataKey="XGBoost" stroke={green}  fill={green}  fillOpacity={0.08} strokeWidth={2} dot={{ fill:green,  r:4 }}/>
                  <Radar name="Random Forest"   dataKey="RF"      stroke={purple} fill={purple} fillOpacity={0.08} strokeWidth={2} dot={{ fill:purple, r:4 }}/>
                  <Radar name="LSTM"            dataKey="LSTM"    stroke={amber}  fill={amber}  fillOpacity={0.08} strokeWidth={2} dot={{ fill:amber,  r:4 }}/>
                  <Radar name="Logistic Reg"    dataKey="LR"      stroke={pink}   fill={pink}   fillOpacity={0.08} strokeWidth={2} dot={{ fill:pink,   r:4 }}/>
                  <Legend wrapperStyle={{ fontSize:'10px', fontFamily:"'Courier New',monospace", color:theme.text }}/>
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ marginTop:'16px', padding:'12px 16px', background:theme.isDark?'rgba(0,255,247,0.04)':'rgba(0,100,180,0.04)', border:`1px solid ${cyan}20`, borderRadius:'4px' }}>
                <p style={{ margin:0, fontSize:'10px', color:theme.textMuted, lineHeight:'1.8' }}>
                  ◈ The Transformer + GAT model dominates across all metrics. The gap is most pronounced in AUC-ROC (+7.7% over XGBoost) and F1 Score (+5.8% over XGBoost).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL TAB ── */}
        {activeTab === 'detail' && (
          <div style={{ animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {data.models.map((m,i) => {
                const col   = modelColors[i];
                const isSel = selected === i;
                return (
                  <button key={i} onClick={() => setSelected(isSel?null:i)} style={{
                    padding:      '8px 16px',
                    background:   isSel ? `${col}20` : theme.bgCard,
                    border:       `1px solid ${isSel?col:`${col}30`}`,
                    borderRadius: '2px',
                    cursor:       'pointer',
                    fontFamily:   "'Courier New',monospace",
                    fontSize:     '10px',
                    fontWeight:   '700',
                    letterSpacing:'2px',
                    color:        isSel ? col : `${col}${theme.isDark?'60':'80'}`,
                    textTransform:'uppercase',
                    transition:   'all 0.3s',
                    boxShadow:    isSel&&theme.isDark ? `0 0 12px ${col}30` : 'none',
                  }}>
                    {m.highlight?'★ ':''}{m.short}
                  </button>
                );
              })}
            </div>

            {data.models.map((m, i) => {
              if (selected !== null && selected !== i) return null;
              const col = modelColors[i];
              return (
                <div key={i} className="mc-card" style={{ border:`1px solid ${col}${m.highlight?'50':'20'}`, boxShadow:m.highlight&&theme.isDark?`0 0 20px ${col}15`:'none' }}>
                  <div className="mc-scan" style={{ background:`linear-gradient(90deg,transparent,${col}40,transparent)` }}/>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      {m.highlight && <span style={{ fontSize:'24px' }}>🏆</span>}
                      <div>
                        <div style={{ fontSize:'16px', fontWeight:'900', color:col, letterSpacing:'2px', textShadow:theme.isDark?`0 0 10px ${col}`:'none' }}>{m.name}</div>
                        <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'1px', marginTop:'4px' }}>
                          {m.params} parameters · {m.inference_ms}ms inference · {m.training_time}s training
                        </div>
                      </div>
                    </div>
                    {m.highlight && (
                      <div style={{ padding:'4px 12px', background:`${col}15`, border:`1px solid ${col}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', color:col, letterSpacing:'2px' }}>
                        ★ RECOMMENDED
                      </div>
                    )}
                  </div>

                  <p style={{ margin:'0 0 20px', fontSize:'11px', color:theme.textMuted, lineHeight:'1.8', padding:'12px 14px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px' }}>
                    {m.description}
                  </p>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px', marginBottom:'20px' }}>
                    {[
                      { label:'AUC-ROC',   value:m.auc       },
                      { label:'F1 Score',  value:m.f1        },
                      { label:'Precision', value:m.precision  },
                      { label:'Recall',    value:m.recall     },
                      { label:'Accuracy',  value:m.accuracy   },
                    ].map((met,j) => (
                      <div key={j} style={{ textAlign:'center', padding:'12px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${col}15`, borderRadius:'4px' }}>
                        <div style={{ fontSize:'18px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${col}`:'none' }}>{(met.value*100).toFixed(1)}<span style={{ fontSize:'10px' }}>%</span></div>
                        <div style={{ fontSize:'8px', color:theme.textMuted, letterSpacing:'1px', marginTop:'4px', textTransform:'uppercase' }}>{met.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                    <div>
                      <div style={{ fontSize:'9px', letterSpacing:'2px', color:green, marginBottom:'10px', textTransform:'uppercase' }}>◈ ADVANTAGES</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                        {m.pros.map((pro, j) => (
                          <div key={j} style={{ display:'flex', gap:'8px', alignItems:'flex-start', padding:'6px 10px', background:theme.isDark?'rgba(0,255,150,0.04)':'rgba(0,150,80,0.04)', border:`1px solid ${green}15`, borderRadius:'2px' }}>
                            <span style={{ color:green, fontSize:'10px', flexShrink:0, marginTop:'1px' }}>▸</span>
                            <span style={{ fontSize:'10px', color:theme.textMuted, lineHeight:'1.5' }}>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:'9px', letterSpacing:'2px', color:pink, marginBottom:'10px', textTransform:'uppercase' }}>◈ LIMITATIONS</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                        {m.cons.map((con, j) => (
                          <div key={j} style={{ display:'flex', gap:'8px', alignItems:'flex-start', padding:'6px 10px', background:theme.isDark?'rgba(255,45,155,0.04)':'rgba(200,0,80,0.04)', border:`1px solid ${pink}15`, borderRadius:'2px' }}>
                            <span style={{ color:pink, fontSize:'10px', flexShrink:0, marginTop:'1px' }}>▸</span>
                            <span style={{ fontSize:'10px', color:theme.textMuted, lineHeight:'1.5' }}>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>MICRO-LOAN.AI › MODEL COMPARISON</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>{data.models.length} MODELS · TRANSFORMER+GAT WINNER</span>
        </div>
      </div>
    </div>
  );
}
