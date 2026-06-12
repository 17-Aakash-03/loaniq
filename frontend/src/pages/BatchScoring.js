import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BatchScoring() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [mounted,    setMounted]    = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [file,       setFile]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('results');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

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
    const chars = '01BATCHSCORECSV';
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

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { setError('Only CSV files are supported.'); return; }
    setFile(f); setError(''); setResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a CSV file.'); return; }
    setLoading(true); setError(''); setResults(null);
    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('http://127.0.0.1:8000/batch/predict', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type':'multipart/form-data' },
      });
      setResults(res.data); setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Batch scoring failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `name,recharge_amount,recharge_frequency,grocery_spend,electricity_paid,location_stability,months_at_address,trust_score
Rahul Kumar,500,3,5000,1,75,24,0.8
Priya Singh,200,1,2000,0,40,6,0.4
Amit Sharma,800,4,8000,1,90,36,0.9
Sunita Devi,150,1,1500,0,30,3,0.3
Vikram Patel,600,3,6000,1,80,18,0.75`;
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'batch_template.csv';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!results) return;
    const headers = ['Row','Name','Score','Risk Tier','Eligible','Recharge Amount','Recharge Frequency','Grocery Spend','Electricity Paid','Location Stability','Trust Score'];
    const rows = results.results.map(r => [r.row, r.name, r.score, r.risk_tier, r.eligible?'YES':'NO', r.recharge_amount, r.recharge_frequency, r.grocery_spend, r.electricity_paid, r.location_stability, r.trust_score]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `batch_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const scoreColor = (s) => s >= 65 ? green : s >= 40 ? amber : pink;

  const filtered = results?.results?.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier   = filterTier==='ALL' || r.risk_tier===filterTier;
    return matchSearch && matchTier;
  }) || [];

  const chartData = [
    { name:'Low Risk',    count:results?.low_risk    || 0, color:green  },
    { name:'Medium Risk', count:results?.medium_risk || 0, color:amber  },
    { name:'High Risk',   count:results?.high_risk   || 0, color:pink   },
  ];

  const tooltipStyle = {
    contentStyle: { background:theme.isDark?'rgba(0,3,8,0.97)':'rgba(255,255,255,0.97)', border:`1px solid ${cyan}40`, borderRadius:'4px', fontFamily:"'Courier New',monospace", fontSize:'10px', color:theme.text },
    labelStyle:   { color:cyan },
  };

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes dragPulse{0%,100%{border-color:${cyan}50}50%{border-color:${cyan}}}
        .batch-card{background:${theme.bgCard};border:1px solid ${theme.border};border-radius:4px;padding:22px;position:relative;overflow:hidden;margin-bottom:16px;transition:all 0.3s ease;box-shadow:${theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)'};}
        .batch-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
        .tab-btn{padding:10px 20px;background:transparent;border:none;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;text-transform:uppercase;transition:all 0.3s;border-bottom:2px solid transparent;}
        .result-row{display:grid;grid-template-columns:40px 1fr 80px 120px 80px;gap:8px;align-items:center;padding:10px 14px;border-bottom:1px solid ${theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)'};transition:background 0.2s;}
        .result-row:hover{background:${theme.isDark?'rgba(0,255,247,0.03)':'rgba(0,100,180,0.03)'};}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.3:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,    borderLeft:`2px solid ${cyan}`    },
        { top:16,    right:16, borderTop:`2px solid ${purple}`,  borderRight:`2px solid ${purple}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${green}`,borderLeft:`2px solid ${green}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${pink}`, borderRight:`2px solid ${pink}`   },
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${cyan},${purple})`, boxShadow:`0 0 10px ${cyan}` }}/>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:cyan, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${cyan}60`:'none' }}>BATCH CSV SCORING</h1>
                <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>SCORE MULTIPLE APPLICANTS AT ONCE</p>
              </div>
            </div>
            <button onClick={downloadTemplate} style={{ padding:'10px 16px', background:`${green}08`, border:`1px solid ${green}25`, borderRadius:'4px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', color:green, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${green}15`; e.currentTarget.style.boxShadow=`0 0 15px ${green}30`; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=`${green}08`; e.currentTarget.style.boxShadow='none'; }}>
              ⬇ DOWNLOAD TEMPLATE
            </button>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${cyan}60,${purple}40,transparent)` }}/>
        </div>

        {/* Upload area */}
        {!results && (
          <div className="batch-card">
            <div className="batch-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
            <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ UPLOAD CSV FILE</div>

            {/* Drop zone */}
            <div
              onDragOver={e=>{ e.preventDefault(); setDragging(true); }}
              onDragLeave={()=>setDragging(false)}
              onDrop={handleDrop}
              onClick={()=>fileRef.current?.click()}
              style={{
                border:       `2px dashed ${dragging?cyan:`${cyan}30`}`,
                borderRadius: '8px',
                padding:      '48px 24px',
                textAlign:    'center',
                cursor:       'pointer',
                background:   dragging
                  ? theme.isDark?'rgba(0,255,247,0.05)':'rgba(0,100,180,0.05)'
                  : theme.isDark?'rgba(0,255,247,0.02)':'rgba(0,100,180,0.02)',
                transition:   'all 0.3s ease',
                animation:    dragging?'dragPulse 1s ease infinite':'none',
                marginBottom: '20px',
              }}>
              <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>{file?'📄':'📁'}</div>
              {file ? (
                <>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:green, letterSpacing:'2px', marginBottom:'8px' }}>✅ {file.name}</div>
                  <div style={{ fontSize:'10px', color:theme.textMuted }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:'14px', fontWeight:'700', color:cyan, letterSpacing:'2px', marginBottom:'8px' }}>DROP CSV FILE HERE</div>
                  <div style={{ fontSize:'10px', color:theme.textMuted }}>or click to browse · CSV files only</div>
                </>
              )}
            </div>

            {/* Column info */}
            <div style={{ padding:'16px', background:theme.isDark?'rgba(255,184,0,0.04)':'rgba(255,184,0,0.06)', border:`1px solid ${amber}15`, borderRadius:'4px', marginBottom:'20px' }}>
              <div style={{ fontSize:'9px', letterSpacing:'2px', color:amber, marginBottom:'10px', textTransform:'uppercase' }}>◈ REQUIRED CSV COLUMNS</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {[
                  { col:'name',               desc:'Applicant name'        },
                  { col:'recharge_amount',     desc:'Monthly recharge (₹)'  },
                  { col:'recharge_frequency',  desc:'Times per month (1-4)' },
                  { col:'grocery_spend',       desc:'Monthly spend (₹)'     },
                  { col:'electricity_paid',    desc:'1=Yes, 0=No'           },
                  { col:'location_stability',  desc:'Score 0-100'           },
                  { col:'months_at_address',   desc:'Months at address'     },
                  { col:'trust_score',         desc:'Social trust 0-1'      },
                ].map((c,i) => (
                  <div key={i} style={{ padding:'8px', background:theme.isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.04)', borderRadius:'2px', border:`1px solid ${theme.border}` }}>
                    <div style={{ fontSize:'9px', fontWeight:'700', color:cyan, fontFamily:"'Courier New',monospace", marginBottom:'3px' }}>{c.col}</div>
                    <div style={{ fontSize:'8px', color:theme.textDim }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ padding:'10px 14px', marginBottom:'16px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px', fontSize:'11px', color:pink }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!file||loading} style={{
              width:'100%', padding:'16px',
              background: !file||loading
                ? theme.isDark?'rgba(0,255,247,0.08)':'rgba(0,100,180,0.08)'
                : `linear-gradient(135deg,${cyan},${purple},${pink},${cyan})`,
              backgroundSize:'300% 300%',
              animation:    !file||loading?'none':'gradShift 3s ease infinite',
              border:       'none', borderRadius:'4px',
              fontSize:'13px', fontWeight:'900', letterSpacing:'4px',
              color:        !file||loading?theme.textMuted:'#000',
              cursor:       !file||loading?'not-allowed':'pointer',
              fontFamily:   "'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s',
            }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                  <span style={{ width:'16px', height:'16px', border:`2px solid ${cyan}30`, borderTopColor:cyan, borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                  ANALYZING BATCH...
                </span>
              ) : '⚡ RUN BATCH ANALYSIS'}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ animation:'fadeUp 0.5s ease both' }}>

            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginBottom:'16px' }}>
              {[
                { label:'TOTAL',      value:results.total,               color:cyan   },
                { label:'AVG SCORE',  value:results.avg_score,           color:cyan   },
                { label:'LOW RISK',   value:results.low_risk,            color:green  },
                { label:'MEDIUM',     value:results.medium_risk,         color:amber  },
                { label:'HIGH RISK',  value:results.high_risk,           color:pink   },
                { label:'APPROVAL %', value:`${results.approval_rate}%`, color:green  },
              ].map((s,i) => (
                <div key={i} style={{ background:theme.bgCard, border:`1px solid ${s.color}25`, borderRadius:'4px', padding:'14px', textAlign:'center', position:'relative', overflow:'hidden', boxShadow:theme.isDark?'none':'0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ position:'absolute', left:0, right:0, height:'1px', top:0, background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'24px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${s.color}`:'none' }}>{s.value}</div>
                  <div style={{ fontSize:'8px', letterSpacing:'1px', color:theme.textDim, marginTop:'4px', textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Chart + Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
              <div className="batch-card">
                <div className="batch-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ RISK DISTRIBUTION</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top:5, right:5, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24} allowDecimals={false}/>
                    <Tooltip {...tooltipStyle}/>
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {chartData.map((d,i) => <Cell key={i} fill={d.color} fillOpacity={0.8}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="batch-card" style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div className="batch-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'4px', textTransform:'uppercase' }}>◈ ACTIONS</div>
                <button onClick={downloadResults} style={{ padding:'14px', background:`${green}08`, border:`1px solid ${green}25`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:green, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${green}15`; e.currentTarget.style.boxShadow=`0 0 15px ${green}30`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=`${green}08`; e.currentTarget.style.boxShadow='none'; }}>
                  ⬇ DOWNLOAD RESULTS CSV
                </button>
                <button onClick={()=>{ setResults(null); setFile(null); }} style={{ padding:'14px', background:'transparent', border:`1px solid ${cyan}30`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${cyan}10`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
                  ◈ SCORE NEW BATCH
                </button>
                <button onClick={()=>navigate('/apply')} style={{ padding:'14px', background:`${purple}08`, border:`1px solid ${purple}25`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:purple, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${purple}15`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=`${purple}08`; }}>
                  ⬡ SINGLE ANALYSIS
                </button>
                {results.errors > 0 && (
                  <div style={{ padding:'10px 14px', background:'rgba(255,45,155,0.06)', border:`1px solid ${pink}20`, borderRadius:'4px', fontSize:'10px', color:pink }}>
                    ⚠ {results.errors} rows had errors and were skipped
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:`1px solid ${theme.border}`, marginBottom:'16px' }}>
              {[
                { id:'results', label:'ALL RESULTS'                         },
                { id:'low',     label:`✅ LOW RISK (${results.low_risk})`    },
                { id:'medium',  label:`⚠️ MEDIUM (${results.medium_risk})`   },
                { id:'high',    label:`❌ HIGH RISK (${results.high_risk})`  },
              ].map(t => (
                <button key={t.id} className="tab-btn"
                  onClick={()=>{ setActiveTab(t.id); setFilterTier(t.id==='results'?'ALL':t.id.charAt(0).toUpperCase()+t.id.slice(1)); }}
                  style={{ color:activeTab===t.id?cyan:theme.textMuted, borderBottomColor:activeTab===t.id?cyan:'transparent', textShadow:activeTab===t.id&&theme.isDark?`0 0 8px ${cyan}`:'none' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom:'12px' }}>
              <input type="text" placeholder="SEARCH BY NAME..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width:'100%', padding:'10px 16px', background:theme.inputBg, border:`1px solid ${theme.inputBorder}`, borderRadius:'4px', color:theme.inputColor, fontSize:'12px', fontFamily:"'Courier New',monospace", outline:'none', boxSizing:'border-box', letterSpacing:'1px', transition:'all 0.3s' }}/>
            </div>

            {/* Table */}
            <div className="batch-card" style={{ padding:0, overflow:'hidden' }}>
              <div className="result-row" style={{ background:theme.isDark?'rgba(0,255,247,0.05)':'rgba(0,100,180,0.05)', borderBottom:`1px solid ${theme.border}` }}>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase' }}>#</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase' }}>NAME</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>SCORE</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>RISK TIER</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>ELIGIBLE</div>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:theme.textMuted, fontSize:'11px', letterSpacing:'2px' }}>NO RESULTS FOUND</div>
              ) : (
                filtered.map((r, i) => {
                  const col        = scoreColor(r.score);
                  const tierEmoji  = r.risk_tier==='Low'?'✅':r.risk_tier==='Medium'?'⚠️':'❌';
                  return (
                    <div key={i} className="result-row" style={{ animation:`fadeUp 0.3s ease ${i*0.03}s both` }}>
                      <div style={{ fontSize:'10px', color:theme.textDim, fontFamily:"'Courier New',monospace" }}>{r.row}</div>
                      <div style={{ fontSize:'11px', color:theme.text }}>{r.name}</div>
                      <div style={{ textAlign:'center' }}>
                        <span style={{ fontSize:'14px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${col}`:'none' }}>{r.score}</span>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <span style={{ padding:'3px 10px', background:`${col}15`, border:`1px solid ${col}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', color:col, letterSpacing:'1px' }}>
                          {tierEmoji} {r.risk_tier}
                        </span>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <span style={{ fontSize:'11px', fontWeight:'700', color:r.eligible?green:pink }}>
                          {r.eligible?'✅ YES':'❌ NO'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ marginTop:'10px', textAlign:'right', fontSize:'9px', color:theme.textDim, letterSpacing:'1px' }}>
              SHOWING {filtered.length} OF {results.total} APPLICANTS
            </div>
          </div>
        )}

        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>LOANIQ › BATCH SCORING</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>TRANSFORMER + GAT · AUC 0.9618</span>
        </div>
      </div>
    </div>
  );
}


