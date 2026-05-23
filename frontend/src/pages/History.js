import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function History() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [records,       setRecords]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [expanded,      setExpanded]      = useState(null);
  const [mounted,       setMounted]       = useState(false);
  const [filter,        setFilter]        = useState('ALL');
  const [deleting,      setDeleting]      = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmAll,    setConfirmAll]    = useState(false);
  const [deletingAll,   setDeletingAll]   = useState(false);

  const token  = localStorage.getItem('token');
  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;

  const fetchHistory = () => {
    if (!token) { navigate('/'); return; }
    axios.get('https://loaniq-backend-6dmd.onrender.com/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => { setRecords(res.data); setMounted(true); })
    .catch(() => navigate('/'))
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const cols  = Math.floor(W / 13);
    const drops = Array(cols).fill(1);
    const chars = '01HISTORYCREDITLOG';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(0,255,150,${Math.random()*0.1+0.02})`
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

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axios.delete(`https://loaniq-backend-6dmd.onrender.com/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(prev => prev.filter(r => r.id !== id));
      setExpanded(null); setConfirmDelete(null);
    } catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await axios.delete('https://loaniq-backend-6dmd.onrender.com/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords([]); setExpanded(null); setConfirmAll(false);
    } catch { alert('Failed to delete all.'); }
    finally { setDeletingAll(false); }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID','Score','Risk Tier','Date','Explanation','Tips'];
    const rows    = records.map(r => [
      r.id, r.score, r.risk_tier, r.created_at,
      Array.isArray(r.explanation) ? r.explanation.join(' | ') : r.explanation,
      Array.isArray(r.tips)        ? r.tips.join(' | ')        : r.tips,
    ]);
    const csv  = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `LoanIQ_History_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const tierConfig = (tier) => ({
    Low:    { color:green,  label:'LOW RISK',    icon:'◉', bg:theme.isDark?'rgba(0,255,150,0.08)':'rgba(0,180,80,0.08)',  border:theme.isDark?'rgba(0,255,150,0.25)':'rgba(0,180,80,0.3)'   },
    Medium: { color:amber,  label:'MEDIUM RISK', icon:'◎', bg:theme.isDark?'rgba(255,184,0,0.08)':'rgba(200,140,0,0.08)', border:theme.isDark?'rgba(255,184,0,0.25)':'rgba(200,140,0,0.3)'  },
    High:   { color:pink,   label:'HIGH RISK',   icon:'◌', bg:theme.isDark?'rgba(255,45,155,0.08)':'rgba(200,0,80,0.08)', border:theme.isDark?'rgba(255,45,155,0.25)':'rgba(200,0,80,0.3)'  },
  }[tier] || { color:cyan, label:tier, icon:'◈', bg:'transparent', border:cyan });

  const scoreColor  = (s) => s >= 65 ? green : s >= 40 ? amber : pink;
  const filtered    = filter==='ALL' ? records : records.filter(r => r.risk_tier===filter);
  const stats       = {
    total:  records.length,
    low:    records.filter(r=>r.risk_tier==='Low').length,
    medium: records.filter(r=>r.risk_tier==='Medium').length,
    high:   records.filter(r=>r.risk_tier==='High').length,
    avg:    records.length ? Math.round(records.reduce((s,r)=>s+r.score,0)/records.length) : 0,
  };
  const chartData = [...records].reverse().map((r,i) => ({
    scan:  `#${String(r.id).padStart(3,'0')}`,
    score: r.score,
    date:  r.created_at?.split(',')[0] || `Scan ${i+1}`,
    tier:  r.risk_tier,
  }));

  const tooltipStyle = {
    contentStyle: { background:theme.isDark?'rgba(0,3,8,0.97)':'rgba(255,255,255,0.97)', border:`1px solid ${cyan}50`, borderRadius:'4px', fontFamily:"'Courier New',monospace", fontSize:'11px', padding:'10px 14px', color:theme.text },
    labelStyle:   { color:theme.textMuted, letterSpacing:'2px', fontSize:'10px', marginBottom:'4px' },
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'50px', height:'50px', border:`2px solid ${cyan}20`, borderTopColor:cyan, borderRadius:'50%', margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }}/>
        <p style={{ color:theme.textMuted, fontSize:'11px', letterSpacing:'3px' }}>LOADING CREDIT HISTORY...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes recordSlide{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes expandDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        .stat-card{background:${theme.bgCard};border:1px solid ${theme.border};border-radius:4px;padding:16px;position:relative;overflow:hidden;text-align:center;box-shadow:${theme.isDark?'none':'0 2px 8px rgba(0,100,180,0.06)'};}
        .filter-btn{padding:7px 16px;background:transparent;border:1px solid ${theme.border};border-radius:2px;font-size:10px;font-weight:700;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.3s ease;text-transform:uppercase;}
        .record-row{background:${theme.bgCard};border:1px solid ${theme.border};border-radius:4px;overflow:hidden;transition:all 0.3s ease;box-shadow:${theme.isDark?'none':'0 2px 8px rgba(0,100,180,0.06)'};}
        .record-row:hover{border-color:${cyan}40;box-shadow:${theme.isDark?`0 0 20px ${cyan}08`:'0 4px 16px rgba(0,100,180,0.12)'};}
        .detail-line{display:flex;gap:12px;align-items:flex-start;padding:10px 14px;background:${theme.isDark?'rgba(0,255,247,0.02)':'rgba(0,100,180,0.03)'};border:1px solid ${theme.border};border-radius:2px;margin-bottom:8px;}
        .tip-line{display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;}
        .del-btn{background:${theme.isDark?'rgba(255,45,155,0.08)':'rgba(200,0,80,0.06)'};border:1px solid ${theme.isDark?'rgba(255,45,155,0.2)':'rgba(200,0,80,0.2)'};border-radius:2px;padding:6px 10px;color:${pink};cursor:pointer;font-size:10px;font-weight:700;letter-spacing:2px;font-family:'Courier New',monospace;text-transform:uppercase;transition:all 0.3s;}
        .del-btn:hover{background:rgba(255,45,155,0.2);box-shadow:0 0 12px rgba(255,45,155,0.3);}
        .confirm-box{background:${theme.isDark?'rgba(255,45,155,0.06)':'rgba(200,0,80,0.05)'};border:1px solid ${theme.isDark?'rgba(255,45,155,0.3)':'rgba(200,0,80,0.25)'};border-radius:4px;padding:14px 16px;display:flex;align-items:center;gap:12px;animation:shake 0.3s ease;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.4:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,    borderLeft:`2px solid ${cyan}`    },
        { top:16,    right:16, borderTop:`2px solid ${purple}`,  borderRight:`2px solid ${purple}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${green}`,borderLeft:`2px solid ${green}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${pink}`, borderRight:`2px solid ${pink}`   },
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'820px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${cyan},${purple})`, boxShadow:`0 0 10px ${cyan}` }}/>
              <h1 style={{ fontSize:'22px', fontWeight:'900', color:cyan, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${cyan}60`:'none' }}>CREDIT LOG ARCHIVE</h1>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {records.length > 0 && (
                <>
                  <button onClick={exportCSV} style={{ padding:'10px 16px', background:`${green}08`, border:`1px solid ${green}25`, borderRadius:'4px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', color:green, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${green}15`; e.currentTarget.style.boxShadow=`0 0 15px ${green}30`; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`${green}08`; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}>
                    ⬇ EXPORT CSV
                  </button>
                  <button className="del-btn" onClick={()=>setConfirmAll(true)} style={{ fontSize:'10px', padding:'10px 16px' }}>
                    ✕ CLEAR ALL
                  </button>
                </>
              )}
              <button onClick={()=>navigate('/apply')} style={{ padding:'10px 20px', background:`linear-gradient(135deg,${cyan},${purple},${pink},${cyan})`, backgroundSize:'300% 300%', animation:'gradShift 3s ease infinite', border:'none', borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'3px', color:'#000', cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 0 25px ${cyan}50`; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                ⚡ NEW SCAN
              </button>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${cyan}60,${purple}40,transparent)` }}/>
        </div>

        {/* Confirm delete ALL */}
        {confirmAll && (
          <div className="confirm-box" style={{ marginBottom:'16px' }}>
            <span style={{ fontSize:'18px', color:pink }}>⚠</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:'11px', color:pink, letterSpacing:'1px', fontWeight:'700' }}>DELETE ALL {records.length} RECORDS?</p>
              <p style={{ margin:'4px 0 0', fontSize:'10px', color:theme.textMuted }}>This action cannot be undone.</p>
            </div>
            <button onClick={handleDeleteAll} disabled={deletingAll} style={{ padding:'8px 16px', background:`${pink}20`, border:`1px solid ${pink}`, borderRadius:'2px', color:pink, cursor:'pointer', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', fontFamily:"'Courier New',monospace", opacity:deletingAll?0.5:1 }}>
              {deletingAll?'DELETING...':'CONFIRM'}
            </button>
            <button onClick={()=>setConfirmAll(false)} style={{ padding:'8px 16px', background:'transparent', border:`1px solid ${theme.border}`, borderRadius:'2px', color:theme.textMuted, cursor:'pointer', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', fontFamily:"'Courier New',monospace" }}>CANCEL</button>
          </div>
        )}

        {/* Score chart */}
        {records.length > 1 && (
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:'4px', padding:'24px', marginBottom:'16px', position:'relative', overflow:'hidden', boxShadow:theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)' }}>
            <div style={{ position:'absolute', left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${cyan}40,transparent)`, animation:'scanH 4s linear infinite', pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'10px', fontWeight:'700', color:cyan, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${cyan}`:'none' }}>◈ ANALYTICS</span>
                <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>SCORE PROGRESSION</span>
              </div>
              <span style={{ fontSize:'11px', fontWeight:'700', color:scoreColor(stats.avg), textShadow:theme.isDark?`0 0 6px ${scoreColor(stats.avg)}`:'none' }}>AVG: {stats.avg}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top:15, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(0,255,247,0.05)':'rgba(0,0,0,0.06)'} vertical={false}/>
                <ReferenceLine y={65} stroke={green} strokeDasharray="5 5" strokeWidth={1} strokeOpacity={0.6} label={{ value:'LOW RISK', position:'insideTopRight', fontSize:7, fill:green }}/>
                <ReferenceLine y={40} stroke={pink}  strokeDasharray="5 5" strokeWidth={1} strokeOpacity={0.6} label={{ value:'HIGH RISK', position:'insideBottomRight', fontSize:7, fill:pink }}/>
                <XAxis dataKey="scan" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={28}/>
                <Tooltip {...tooltipStyle}
                  formatter={(value) => {
                    const col  = value>=65?green:value>=40?amber:pink;
                    const tier = value>=65?'Low Risk':value>=40?'Medium Risk':'High Risk';
                    return [<span style={{ color:col, fontWeight:'700' }}>{value} / 100 — {tier}</span>,'SCORE'];
                  }}
                  labelFormatter={(label, payload) => payload&&payload[0]?`SCAN ${label}  |  ${payload[0].payload.date}`:label}
                />
                <Line type="monotone" dataKey="score" stroke={cyan} strokeWidth={2} strokeOpacity={0.8}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const col = payload.score>=65?green:payload.score>=40?amber:pink;
                    return (
                      <g key={`dot-${payload.scan}`}>
                        <circle cx={cx} cy={cy} r={7} fill={col} fillOpacity={0.15}/>
                        <circle cx={cx} cy={cy} r={4} fill={col} stroke={theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)'} strokeWidth={2} style={{ filter:`drop-shadow(0 0 4px ${col})` }}/>
                      </g>
                    );
                  }}
                  activeDot={{ r:7, fill:cyan, stroke:theme.isDark?'rgba(0,3,8,0.9)':'rgba(255,255,255,0.9)', strokeWidth:2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'TOTAL SCANS', value:stats.total,  color:cyan                  },
            { label:'AVG SCORE',   value:stats.avg,    color:scoreColor(stats.avg) },
            { label:'LOW RISK',    value:stats.low,    color:green                 },
            { label:'MEDIUM RISK', value:stats.medium, color:amber                 },
            { label:'HIGH RISK',   value:stats.high,   color:pink                  },
          ].map((s,i) => (
            <div key={i} className="stat-card" style={{ animation:`fadeUp 0.5s ease ${i*0.08}s both` }}>
              <div style={{ position:'absolute', left:0, right:0, height:'1px', top:0, background:`linear-gradient(90deg,transparent,${s.color}40,transparent)`, animation:'scanH 4s linear infinite' }}/>
              <div style={{ fontSize:'26px', fontWeight:'900', color:s.color, textShadow:theme.isDark?`0 0 15px ${s.color}`:'none', marginBottom:'4px', fontFamily:"'Courier New',monospace" }}>{s.value}</div>
              <div style={{ fontSize:'8px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', padding:'12px 16px', background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:'4px', flexWrap:'wrap', boxShadow:theme.isDark?'none':'0 2px 8px rgba(0,100,180,0.06)' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginRight:'8px' }}>FILTER:</span>
          {[
            { label:'ALL',    color:cyan  },
            { label:'Low',    color:green },
            { label:'Medium', color:amber },
            { label:'High',   color:pink  },
          ].map(f => (
            <button key={f.label} className="filter-btn"
              onClick={() => setFilter(f.label)}
              style={{ color:filter===f.label?'#000':`${f.color}80`, background:filter===f.label?f.color:'transparent', borderColor:filter===f.label?'transparent':`${f.color}30`, boxShadow:filter===f.label?`0 0 15px ${f.color}50`:'none' }}>
              {f.label==='Low'?'◉ LOW':f.label==='Medium'?'◎ MEDIUM':f.label==='High'?'◌ HIGH':'◈ ALL'}
            </button>
          ))}
          <span style={{ marginLeft:'auto', fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>
            {filtered.length} RECORD{filtered.length!==1?'S':''}
          </span>
        </div>

        {/* Records */}
        {filtered.length === 0 ? (
          <div style={{ background:theme.bgCard, border:`1px solid ${theme.border}`, borderRadius:'4px', padding:'60px', textAlign:'center', animation:'fadeUp 0.5s ease both' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px', opacity:0.4 }}>◈</div>
            <p style={{ fontSize:'12px', letterSpacing:'3px', color:theme.textMuted, textTransform:'uppercase', margin:0 }}>
              {records.length===0?'NO RECORDS FOUND — INITIATE FIRST SCAN':`NO ${filter.toUpperCase()} RISK RECORDS`}
            </p>
            <button onClick={()=>navigate('/apply')} style={{ marginTop:'24px', padding:'12px 24px', background:'transparent', border:`1px solid ${cyan}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'3px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${cyan}10`; e.currentTarget.style.boxShadow=`0 0 20px ${cyan}30`; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='none'; }}>
              ⚡ INITIATE SCAN
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtered.map((r, i) => {
              const tc   = tierConfig(r.risk_tier);
              const sc   = scoreColor(r.score);
              const open = expanded === r.id;
              const pct  = r.score;
              const isConfirmingDelete = confirmDelete === r.id;

              return (
                <div key={r.id} className="record-row" style={{ animation:`recordSlide 0.4s ease ${i*0.06}s both` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto auto', gap:'12px', alignItems:'center', padding:'16px 20px', cursor:'pointer' }}>

                    {/* Score circle */}
                    <div style={{ position:'relative', width:'52px', height:'52px' }} onClick={()=>setExpanded(open?null:r.id)}>
                      <svg width="52" height="52" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="22" fill="none" stroke={theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.08)'} strokeWidth="3"/>
                        <circle cx="26" cy="26" r="22" fill="none" stroke={sc} strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${2*Math.PI*22*pct/100} ${2*Math.PI*22}`}
                          strokeDashoffset={2*Math.PI*22*0.25}
                          style={{ filter:`drop-shadow(0 0 4px ${sc})` }}/>
                        <text x="26" y="30" textAnchor="middle" fontSize="13" fontWeight="900" fill={sc} fontFamily="'Courier New',monospace">{r.score}</text>
                      </svg>
                    </div>

                    {/* Info */}
                    <div onClick={()=>setExpanded(open?null:r.id)}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                        <span style={{ padding:'2px 10px', background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:tc.color, boxShadow:theme.isDark?`0 0 8px ${tc.color}20`:'none' }}>{tc.icon} {tc.label}</span>
                        <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textDim }}>SCAN #{String(r.id).padStart(4,'0')}</span>
                      </div>
                      <div style={{ height:'3px', width:'200px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.08)', borderRadius:'2px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${sc}60,${sc})`, boxShadow:theme.isDark?`0 0 6px ${sc}`:'none', borderRadius:'2px' }}/>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div style={{ textAlign:'right' }} onClick={()=>setExpanded(open?null:r.id)}>
                      <div style={{ fontSize:'10px', fontWeight:'700', color:theme.textMuted, letterSpacing:'1px', marginBottom:'4px' }}>{r.created_at?.split(',')[0]}</div>
                      <div style={{ fontSize:'9px', color:theme.textDim, letterSpacing:'1px' }}>{r.created_at?.split(',')[1]}</div>
                    </div>

                    {/* Delete button */}
                    <button className="del-btn" onClick={(e)=>{ e.stopPropagation(); setConfirmDelete(isConfirmingDelete?null:r.id); }} style={{ padding:'6px 10px', fontSize:'9px' }}>✕</button>

                    {/* Expand toggle */}
                    <div onClick={()=>setExpanded(open?null:r.id)} style={{ width:'28px', height:'28px', border:`1px solid ${open?cyan:`${cyan}20`}`, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', color:open?cyan:theme.textDim, fontSize:'12px', fontWeight:'900', background:open?`${cyan}10`:'transparent', boxShadow:open&&theme.isDark?`0 0 10px ${cyan}30`:'none', transition:'all 0.3s', transform:open?'rotate(180deg)':'rotate(0deg)', cursor:'pointer' }}>▾</div>
                  </div>

                  {/* Confirm delete individual */}
                  {isConfirmingDelete && (
                    <div style={{ padding:'12px 20px', borderTop:`1px solid ${pink}15` }}>
                      <div className="confirm-box">
                        <span style={{ fontSize:'14px', color:pink }}>⚠</span>
                        <p style={{ margin:0, fontSize:'10px', color:pink, letterSpacing:'1px', flex:1 }}>
                          DELETE SCAN #{String(r.id).padStart(4,'0')}?
                        </p>
                        <button onClick={()=>handleDelete(r.id)} disabled={deleting===r.id} style={{ padding:'6px 14px', background:`${pink}20`, border:`1px solid ${pink}`, borderRadius:'2px', color:pink, cursor:'pointer', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', fontFamily:"'Courier New',monospace", opacity:deleting===r.id?0.5:1 }}>
                          {deleting===r.id?'DELETING...':'CONFIRM'}
                        </button>
                        <button onClick={()=>setConfirmDelete(null)} style={{ padding:'6px 14px', background:'transparent', border:`1px solid ${theme.border}`, borderRadius:'2px', color:theme.textMuted, cursor:'pointer', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', fontFamily:"'Courier New',monospace" }}>CANCEL</button>
                      </div>
                    </div>
                  )}

                  {/* Expanded details */}
                  {open && (
                    <div style={{ borderTop:`1px solid ${theme.border}`, padding:'20px', background:theme.isDark?'rgba(0,255,247,0.01)':'rgba(0,100,180,0.02)', animation:'expandDown 0.3s ease' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                        <div>
                          <div style={{ fontSize:'9px', fontWeight:'700', color:cyan, letterSpacing:'2px', marginBottom:'12px' }}>◈ DECISION RATIONALE</div>
                          {(Array.isArray(r.explanation)?r.explanation:[r.explanation]).map((line,j) => (
                            <div key={j} className="detail-line" style={{ animation:`fadeUp 0.3s ease ${j*0.08}s both` }}>
                              <span style={{ color:cyan, fontSize:'10px', flexShrink:0, marginTop:'1px' }}>▸</span>
                              <p style={{ margin:0, fontSize:'11px', color:theme.textMuted, lineHeight:'1.6' }}>{line}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize:'9px', fontWeight:'700', color:amber, letterSpacing:'2px', marginBottom:'12px' }}>◈ ENHANCEMENT PROTOCOL</div>
                          {(Array.isArray(r.tips)?r.tips:[r.tips]).map((tip,j) => (
                            <div key={j} className="tip-line" style={{ animation:`fadeUp 0.3s ease ${j*0.08}s both` }}>
                              <div style={{ width:'18px', height:'18px', background:`${amber}20`, border:`1px solid ${amber}40`, borderRadius:'2px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'900', color:amber, flexShrink:0 }}>{j+1}</div>
                              <p style={{ margin:0, fontSize:'11px', color:theme.textMuted, lineHeight:'1.6', paddingTop:'1px' }}>{tip}</p>
                            </div>
                          ))}
                          <button onClick={()=>navigate('/apply')} style={{ marginTop:'16px', width:'100%', padding:'10px', background:'transparent', border:`1px solid ${purple}40`, borderRadius:'2px', fontSize:'10px', fontWeight:'700', letterSpacing:'3px', color:purple, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=`${purple}15`; e.currentTarget.style.boxShadow=`0 0 15px ${purple}30`; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='none'; }}>
                            ⬡ RE-ANALYZE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>LOANIQ › CREDIT LOG ARCHIVE</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>{records.length} TOTAL RECORDS</span>
        </div>
      </div>
    </div>
  );
}

