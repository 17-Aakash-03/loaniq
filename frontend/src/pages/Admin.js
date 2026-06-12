import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts';

export default function Admin() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mounted,   setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting,  setDeleting]  = useState(null);
  const [error,     setError]     = useState('');

  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;
  const teal   = theme.teal;

  const fetchStats = () => {
    const token    = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');
    if (!token) { navigate('/'); return; }
    if (userRole !== 'admin') { navigate('/apply'); return; }

    axios.get('http://127.0.0.1:8000/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data);
      setMounted(true);
    })
    .catch(err => {
      setError(err.response?.data?.detail || 'Failed to load admin data.');
      setMounted(true);
    })
    .finally(() => setLoading(false));
  };

 useEffect(() => { fetchStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const cols  = Math.floor(W / 13);
    const drops = Array(cols).fill(1);
    const chars = '01ADMINPANEL';
    const draw = () => {
      ctx.fillStyle = theme.isDark ? 'rgba(0,0,8,0.07)' : 'rgba(240,244,248,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = theme.isDark
          ? `rgba(181,55,242,${Math.random()*0.07+0.02})`
          : `rgba(100,50,200,${Math.random()*0.04+0.01})`;
        ctx.fillText(char, i*13, y*13);
        if (y*13>H && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [theme.isDark]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their applications?')) return;
    setDeleting(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  const tooltipStyle = {
    contentStyle: {
      background:   theme.isDark ? 'rgba(0,3,8,0.97)' : 'rgba(255,255,255,0.97)',
      border:       `1px solid ${purple}40`,
      borderRadius: '4px',
      fontFamily:   "'Courier New',monospace",
      fontSize:     '10px',
      color:        theme.text,
    },
    labelStyle: { color:purple },
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'50px', height:'50px', border:`2px solid ${purple}30`, borderTopColor:purple, borderRadius:'50%', margin:'0 auto 20px', animation:'spin 0.8s linear infinite' }}/>
        <p style={{ color:theme.textMuted, fontSize:'11px', letterSpacing:'3px' }}>LOADING ADMIN DATA...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:theme.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace" }}>
      <div style={{ textAlign:'center', maxWidth:'400px', padding:'40px' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
        <p style={{ color:pink, fontSize:'12px', letterSpacing:'2px', marginBottom:'20px' }}>{error}</p>
        <button onClick={() => navigate('/apply')} style={{ padding:'12px 24px', background:'transparent', border:`1px solid ${cyan}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace" }}>
          ← GO BACK
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const tabs = [
    { id:'overview',  label:'OVERVIEW'  },
    { id:'users',     label:'USERS'     },
    { id:'analytics', label:'ANALYTICS' },
  ];

  const riskData = [
    { name:'Low Risk',    value:data.low_risk    || 0, color:green  },
    { name:'Medium Risk', value:data.medium_risk || 0, color:amber  },
    { name:'High Risk',   value:data.high_risk   || 0, color:pink   },
  ];

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .admin-card{
          background:   ${theme.bgCard};
          border:       1px solid ${theme.border};
          border-radius:4px;
          padding:      22px;
          position:     relative;
          overflow:     hidden;
          margin-bottom:16px;
          transition:   all 0.3s ease;
          box-shadow:   ${theme.isDark?'none':'0 2px 12px rgba(100,50,200,0.08)'};
        }
        .admin-scan{
          position:       absolute;
          left:           0;
          right:          0;
          height:         1px;
          animation:      scanH 4s linear infinite;
          pointer-events: none;
        }
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
        .user-row{
          display:         grid;
          grid-template-columns: 1.2fr 1.5fr 80px 70px 80px 100px;
          gap:             8px;
          align-items:     center;
          padding:         12px 16px;
          border-bottom:   1px solid ${theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)'};
          transition:      background 0.2s;
        }
        .user-row:hover{
          background: ${theme.isDark?'rgba(181,55,242,0.04)':'rgba(100,50,200,0.03)'};
        }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.3:0.1 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${purple}`,  borderLeft:`2px solid ${purple}`  },
        { top:16,    right:16, borderTop:`2px solid ${cyan}`,    borderRight:`2px solid ${cyan}`   },
        { bottom:16, left:16,  borderBottom:`2px solid ${cyan}`, borderLeft:`2px solid ${cyan}`    },
        { bottom:16, right:16, borderBottom:`2px solid ${purple}`,borderRight:`2px solid ${purple}`},
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{
        maxWidth:   '1100px',
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
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${purple},${cyan})`, boxShadow:`0 0 10px ${purple}` }}/>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:purple, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${purple}60`:'none' }}>
                  ADMIN CONSOLE
                </h1>
                <p style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'3px', margin:'4px 0 0', textTransform:'uppercase' }}>
                  SYSTEM OVERVIEW — AUTHORIZED ACCESS ONLY
                </p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <div style={{ padding:'4px 12px', border:`1px solid ${purple}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:purple, background:`${purple}10` }}>
                ◈ {data.total_users} USERS
              </div>
              <div style={{ padding:'4px 12px', border:`1px solid ${cyan}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:cyan, background:`${cyan}10` }}>
                {data.total_applications} APPLICATIONS
              </div>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${purple}60,${cyan}40,transparent)` }}/>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:`1px solid ${theme.border}`, marginBottom:'24px' }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                color:             activeTab===t.id ? purple : theme.textMuted,
                borderBottomColor: activeTab===t.id ? purple : 'transparent',
                textShadow:        activeTab===t.id && theme.isDark ? `0 0 8px ${purple}` : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>

            {/* KPI Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
              {[
                { label:'TOTAL USERS',        value:data.total_users,        color:purple },
                { label:'TOTAL APPLICATIONS', value:data.total_applications, color:cyan   },
                { label:'AVG SCORE',          value:data.avg_score,          color:data.avg_score>=65?green:data.avg_score>=40?amber:pink },
                { label:'APPROVAL RATE',      value:`${data.approval_rate}%`,color:green  },
              ].map((s,i) => (
                <div key={i} className="admin-card" style={{ textAlign:'center', padding:'20px', animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'32px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 15px ${s.color}`:'none', marginBottom:'8px' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Risk breakdown */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' }}>
              {[
                { label:'LOW RISK',    value:data.low_risk,    color:green, pct:data.total_applications?Math.round(data.low_risk/data.total_applications*100):0 },
                { label:'MEDIUM RISK', value:data.medium_risk, color:amber, pct:data.total_applications?Math.round(data.medium_risk/data.total_applications*100):0 },
                { label:'HIGH RISK',   value:data.high_risk,   color:pink,  pct:data.total_applications?Math.round(data.high_risk/data.total_applications*100):0 },
              ].map((s,i) => (
                <div key={i} className="admin-card" style={{ padding:'18px' }}>
                  <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                    <div>
                      <div style={{ fontSize:'28px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${s.color}`:'none' }}>{s.value}</div>
                      <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase', marginTop:'4px' }}>{s.label}</div>
                    </div>
                    <div style={{ fontSize:'22px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", opacity:0.7 }}>{s.pct}%</div>
                  </div>
                  <div style={{ height:'4px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.08)', borderRadius:'2px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${s.pct}%`, background:`linear-gradient(90deg,${s.color}60,${s.color})`, borderRadius:'2px', transition:'width 1s ease' }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily applications chart */}
            <div className="admin-card">
              <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>
                ◈ DAILY APPLICATIONS — LAST 7 DAYS
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.daily_applications || []} margin={{ top:5, right:5, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                  <XAxis dataKey="date" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24} allowDecimals={false}/>
                  <Tooltip {...tooltipStyle} formatter={v=>[`${v} applications`,'COUNT']}/>
                  <Bar dataKey="count" fill={purple} fillOpacity={0.7} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Model performance info */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'MODEL AUC-ROC',  value:'0.9618', color:cyan   },
                { label:'F1 SCORE',       value:'0.9142', color:green  },
                { label:'PRECISION',      value:'0.9280', color:purple },
                { label:'RECALL',         value:'0.9010', color:amber  },
              ].map((s,i) => (
                <div key={i} className="admin-card" style={{ textAlign:'center', padding:'16px' }}>
                  <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${s.color}40,transparent)` }}/>
                  <div style={{ fontSize:'20px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 8px ${s.color}`:'none', marginBottom:'6px' }}>{s.value}</div>
                  <div style={{ fontSize:'8px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="admin-card" style={{ padding:0, overflow:'hidden' }}>

              {/* Table header */}
              <div className="user-row" style={{ background:theme.isDark?'rgba(181,55,242,0.08)':'rgba(100,50,200,0.06)', borderBottom:`1px solid ${theme.border}` }}>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase' }}>NAME</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase' }}>EMAIL</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>ROLE</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>APPS</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>AVG SCORE</div>
                <div style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', textTransform:'uppercase', textAlign:'center' }}>ACTION</div>
              </div>

              {/* User rows */}
              {(data.users || []).map((u, i) => (
                <div key={u.id} className="user-row" style={{ animation:`fadeUp 0.3s ease ${i*0.05}s both` }}>
                  <div>
                    <div style={{ fontSize:'11px', fontWeight:'700', color:theme.text }}>{u.name}</div>
                    <div style={{ fontSize:'9px', color:theme.textDim, marginTop:'2px' }}>Joined {u.joined}</div>
                  </div>
                  <div style={{ fontSize:'10px', color:theme.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {u.email}
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ padding:'2px 8px', background:u.role==='admin'?`${purple}20`:`${cyan}10`, border:`1px solid ${u.role==='admin'?purple:cyan}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', color:u.role==='admin'?purple:cyan, letterSpacing:'1px' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ textAlign:'center', fontSize:'12px', fontWeight:'700', color:cyan, fontFamily:"'Courier New',monospace" }}>
                    {u.apps}
                  </div>
                  <div style={{ textAlign:'center' }}>
                    {u.avg_score > 0 ? (
                      <span style={{ fontSize:'12px', fontWeight:'900', color:u.avg_score>=65?green:u.avg_score>=40?amber:pink, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${u.avg_score>=65?green:u.avg_score>=40?amber:pink}`:'none' }}>
                        {u.avg_score}
                      </span>
                    ) : (
                      <span style={{ fontSize:'10px', color:theme.textDim }}>—</span>
                    )}
                  </div>
                  <div style={{ textAlign:'center' }}>
                    {u.role !== 'admin' ? (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={deleting === u.id}
                        style={{ padding:'5px 10px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.2)', borderRadius:'2px', color:pink, cursor:'pointer', fontSize:'9px', fontWeight:'700', letterSpacing:'1px', fontFamily:"'Courier New',monospace", transition:'all 0.3s', opacity:deleting===u.id?0.5:1 }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,45,155,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,45,155,0.08)'; }}>
                        {deleting===u.id ? '...' : '✕ DELETE'}
                      </button>
                    ) : (
                      <span style={{ fontSize:'9px', color:purple, letterSpacing:'1px' }}>ADMIN</span>
                    )}
                  </div>
                </div>
              ))}

              {(!data.users || data.users.length === 0) && (
                <div style={{ padding:'40px', textAlign:'center', color:theme.textMuted, fontSize:'11px', letterSpacing:'2px' }}>
                  NO USERS FOUND
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div style={{ animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* Score distribution + Risk bars */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

              <div className="admin-card">
                <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ SCORE DISTRIBUTION</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.score_distribution || []} margin={{ top:5, right:5, left:0, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                    <XAxis dataKey="range" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24} allowDecimals={false}/>
                    <Tooltip {...tooltipStyle} formatter={v=>[`${v} applications`,'COUNT']}/>
                    <Bar dataKey="count" radius={[3,3,0,0]}>
                      {(data.score_distribution || []).map((entry, i) => {
                        const score = i * 10;
                        const col   = score >= 60 ? green : score >= 40 ? amber : pink;
                        return <Cell key={i} fill={col} fillOpacity={0.75}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-card">
                <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
                <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'20px', textTransform:'uppercase' }}>◈ RISK TIER BREAKDOWN</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginTop:'8px' }}>
                  {riskData.map((r, i) => {
                    const total = data.total_applications || 1;
                    const pct   = Math.round((r.value / total) * 100);
                    return (
                      <div key={i}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                          <span style={{ fontSize:'11px', color:theme.text, fontWeight:'600' }}>{r.name}</span>
                          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                            <span style={{ fontSize:'10px', color:theme.textMuted }}>{r.value} applicants</span>
                            <span style={{ fontSize:'12px', fontWeight:'900', color:r.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${r.color}`:'none' }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ height:'10px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', borderRadius:'5px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${r.color}60,${r.color})`, borderRadius:'5px', boxShadow:theme.isDark?`0 0 8px ${r.color}60`:'none', transition:`width 0.8s ease ${i*0.1}s` }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.total_applications === 0 && (
                  <div style={{ textAlign:'center', padding:'20px', color:theme.textDim, fontSize:'11px', letterSpacing:'2px' }}>
                    NO DATA YET
                  </div>
                )}
              </div>
            </div>

            {/* Daily trend line chart */}
            <div className="admin-card">
              <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${teal}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>
                ◈ APPLICATION TREND — LAST 7 DAYS
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.daily_applications || []} margin={{ top:10, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)'} vertical={false}/>
                  <XAxis dataKey="date" tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:9, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24} allowDecimals={false}/>
                  <Tooltip {...tooltipStyle} formatter={v=>[`${v} applications`,'COUNT']}/>
                  <Line type="monotone" dataKey="count" stroke={teal} strokeWidth={2} dot={{ fill:teal, r:4, strokeWidth:0 }} activeDot={{ r:6, fill:teal }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* User activity summary */}
            <div className="admin-card">
              <div className="admin-scan" style={{ background:`linear-gradient(90deg,transparent,${amber}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'16px', textTransform:'uppercase' }}>◈ TOP USERS BY APPLICATIONS</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[...(data.users || [])]
                  .sort((a,b) => b.apps - a.apps)
                  .slice(0, 5)
                  .map((u, i) => {
                    const maxApps = Math.max(...(data.users||[]).map(x=>x.apps), 1);
                    const pct     = Math.round((u.apps / maxApps) * 100);
                    const col     = u.avg_score >= 65 ? green : u.avg_score >= 40 ? amber : pink;
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', animation:`fadeUp 0.3s ease ${i*0.06}s both` }}>
                        <div style={{ width:'24px', height:'24px', borderRadius:'4px', background:`${purple}20`, border:`1px solid ${purple}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'900', color:purple, flexShrink:0 }}>
                          {i+1}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                            <span style={{ fontSize:'11px', color:theme.text, fontWeight:'600' }}>{u.name}</span>
                            <span style={{ fontSize:'10px', color:amber, fontFamily:"'Courier New',monospace", fontWeight:'700' }}>{u.apps} apps</span>
                          </div>
                          <div style={{ height:'4px', background:theme.isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)', borderRadius:'2px', overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${purple}60,${purple})`, borderRadius:'2px', transition:`width 0.8s ease ${i*0.08}s` }}/>
                          </div>
                        </div>
                        {u.avg_score > 0 && (
                          <span style={{ fontSize:'11px', fontWeight:'900', color:col, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${col}`:'none', flexShrink:0 }}>
                            {u.avg_score}
                          </span>
                        )}
                      </div>
                    );
                  })}
                {(!data.users || data.users.length === 0) && (
                  <div style={{ textAlign:'center', padding:'20px', color:theme.textDim, fontSize:'11px', letterSpacing:'2px' }}>NO USER DATA</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>LOANIQ › ADMIN CONSOLE</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>{data.total_users} USERS · {data.total_applications} APPLICATIONS</span>
        </div>
      </div>
    </div>
  );
}


