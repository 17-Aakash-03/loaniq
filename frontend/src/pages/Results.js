import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';
import PDFReport from '../components/PDFReport';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
  AreaChart, Area, CartesianGrid,
} from 'recharts';

export default function Results() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const theme     = useTheme();
  const result    = location.state?.result;

  const [mounted,     setMounted]     = useState(false);
  const [animScore,   setAnimScore]   = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [whatIf,      setWhatIf]      = useState(null);
  const [whatIfScore, setWhatIfScore] = useState(null);
  const [peerData,    setPeerData]    = useState(null);
  const [predData,    setPredData]    = useState(null);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);

  const cyan   = theme.cyan;
  const purple = theme.purple;
  const green  = theme.green;
  const pink   = theme.pink;
  const amber  = theme.amber;
  const teal   = theme.teal;

  const score      = result ? Math.round(result.score) : 0;
  const tier       = result?.risk_tier || 'Low';
  const scoreColor = score >= 65 ? green : score >= 40 ? amber : pink;

  const tierConfig = {
    Low:    { color:green,  label:'LOW RISK',    icon:'◉', bg:theme.isDark?'rgba(0,255,150,0.08)':'rgba(0,180,80,0.08)',  border:theme.isDark?'rgba(0,255,150,0.3)':'rgba(0,180,80,0.3)'   },
    Medium: { color:amber,  label:'MEDIUM RISK', icon:'◎', bg:theme.isDark?'rgba(255,184,0,0.08)':'rgba(200,140,0,0.08)', border:theme.isDark?'rgba(255,184,0,0.3)':'rgba(200,140,0,0.3)'  },
    High:   { color:pink,   label:'HIGH RISK',   icon:'◌', bg:theme.isDark?'rgba(255,45,155,0.08)':'rgba(200,0,80,0.08)', border:theme.isDark?'rgba(255,45,155,0.3)':'rgba(200,0,80,0.3)'  },
  }[tier] || { color:cyan, label:tier, icon:'◈', bg:'transparent', border:cyan };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fireConfetti = () => {
    confetti({ particleCount:80, angle:60, spread:70, origin:{x:0,y:0.7}, colors:['#00fff7','#00ff96','#b537f2','#ffb800','#ff2d9b'], zIndex:9999 });
    confetti({ particleCount:80, angle:120, spread:70, origin:{x:1,y:0.7}, colors:['#00fff7','#00ff96','#b537f2','#ffb800','#ff2d9b'], zIndex:9999 });
    setTimeout(() => confetti({ particleCount:120, spread:100, origin:{x:0.5,y:0.5}, colors:['#00fff7','#00ff96','#b537f2','#ffb800','#ff2d9b'], startVelocity:30, gravity:0.8, zIndex:9999 }), 500);
    setTimeout(() => confetti({ particleCount:60, spread:360, origin:{x:0.5,y:0.3}, colors:['#00fff7','#00ff96'], startVelocity:20, gravity:0.5, zIndex:9999, ticks:200 }), 1000);
  };

  const computeWhatIfScore = useCallback((newFeatures) => {
    if (!result?.shap_values) return;
    const baseline    = [0.3, 0.25, 0.5, 0.3, 0.5, 0.5];
    const shapWeights = [12.0, 6.0, 22.0, 8.0, 14.0, 20.0];
    const normalized  = [
      newFeatures.recharge_amount        / 1000.0,
      newFeatures.recharge_frequency     / 4.0,
      newFeatures.electricity_regularity,
      newFeatures.grocery_spend          / 10000.0,
      newFeatures.location_stability     / 100.0,
      newFeatures.social_trust,
    ];
    const newShap         = normalized.map((v,i) => (v - baseline[i]) * shapWeights[i]);
    const newShapSum      = newShap.reduce((a,b) => a+b, 0);
    const originalShapSum = result.shap_values.reduce((a,b) => a+b, 0);
    const delta           = newShapSum - originalShapSum;
    setWhatIfScore(Math.max(0, Math.min(100, Math.round(score + delta))));
  }, [result, score]);

  useEffect(() => {
    if (!result) { navigate('/apply'); return; }
    setTimeout(() => setMounted(true), 100);
    const initFeatures = {
      recharge_amount:        300,
      recharge_frequency:     2,
      electricity_regularity: 0.7,
      grocery_spend:          3000,
      location_stability:     60,
      social_trust:           0.6,
    };
    setWhatIf(initFeatures);
    setWhatIfScore(Math.round(result.score));
    const token = localStorage.getItem('token');
    axios.get('https://loaniq-backend-6dmd.onrender.com/stats/score-distribution', { headers:{ Authorization:`Bearer ${token}` } }).then(res => setPeerData(res.data)).catch(() => {});
    axios.get('https://loaniq-backend-6dmd.onrender.com/stats/score-prediction',   { headers:{ Authorization:`Bearer ${token}` } }).then(res => setPredData(res.data)).catch(() => {});
    const target   = Math.round(result.score);
    let   current  = 0;
    const step     = target / 60;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimScore(Math.round(current));
      if (current >= target) {
        clearInterval(interval);
        setTimeout(() => {
          setShowDetails(true);
          if (result.risk_tier === 'Low') fireConfetti();
        }, 300);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [result, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const cols  = Math.floor(W / 13);
    const drops = Array(cols).fill(1);
    const chars = '01アイウエオCREDITSCORE';
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

  if (!result) return null;

  const shapData = result.feature_names
    ? result.feature_names.map((n,i) => ({
        name:  n.replace(/_/g,' ').toUpperCase(),
        value: parseFloat((result.shap_values[i]).toFixed(2)),
      }))
    : [];
  const maxAbs = Math.max(...shapData.map(d => Math.abs(d.value)), 1);

  const R          = isMobile ? 80  : 110;
  const cx         = isMobile ? 110 : 150;
  const cy         = isMobile ? 110 : 150;
  const svgSize    = isMobile ? 220 : 300;
  const start      = Math.PI * 0.8;
  const end        = Math.PI * 2.2;
  const total      = end - start;
  const pct        = animScore / 100;
  const scoreAngle = start + total * pct;
  const arcX       = (a) => cx + R * Math.cos(a);
  const arcY       = (a) => cy + R * Math.sin(a);
  const describeArc = (s, e) => {
    const x1=arcX(s),y1=arcY(s),x2=arcX(e),y2=arcY(e);
    const large = e-s > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2}`;
  };

  const sliders = [
    { key:'recharge_amount',        label:'Recharge Amount',    min:0,   max:1000,  step:50,    color:cyan,   display:v=>`₹${v}`                          },
    { key:'recharge_frequency',     label:'Recharge Frequency', min:1,   max:4,     step:1,     color:purple, display:v=>`${v}x/mo`                       },
    { key:'electricity_regularity', label:'Electricity Bills',  min:0,   max:1,     step:0.083, color:green,  display:v=>`${Math.round(v*12)}/12 months`  },
    { key:'grocery_spend',          label:'Grocery Spend',      min:500, max:10000, step:500,   color:amber,  display:v=>`₹${Number(v).toLocaleString()}` },
    { key:'location_stability',     label:'Location Score',     min:0,   max:100,   step:5,     color:pink,   display:v=>`${v}/100`                       },
    { key:'social_trust',           label:'Social Trust',       min:0,   max:1,     step:0.05,  color:cyan,   display:v=>`${Math.round(v*100)}%`          },
  ];

  const trendColor = predData?.trend==='improving' ? green : predData?.trend==='declining' ? pink : amber;
  const trendIcon  = predData?.trend==='improving' ? '▲' : predData?.trend==='declining' ? '▼' : '▶';
  const predColor  = predData?.improvement >= 0 ? green : pink;

  const combinedChartData = predData?.has_data ? [
    ...predData.history.map(h => ({ name:h.day, actual:h.score, predicted:null, date:h.date })),
    { name:'Now', actual:predData.current_score, predicted:predData.current_score, date:'Today' },
    ...predData.prediction.map((p,i) => ({ name:p.day, actual:null, predicted:p.score, date:`+${(i+1)*3}d` })),
  ] : [];

  const confidence = score >= 65 ? Math.round(85 + score*0.1) : Math.round(75 + score*0.1);
  const scoreMin   = Math.max(0,   score - Math.round((100-confidence)/2));
  const scoreMax   = Math.min(100, score + Math.round((100-confidence)/2));

  const tooltipStyle = {
    contentStyle: { background:theme.isDark?'rgba(0,3,8,0.97)':'rgba(255,255,255,0.97)', border:`1px solid ${cyan}40`, borderRadius:'4px', fontFamily:"'Courier New',monospace", fontSize:'10px', color:theme.text },
    labelStyle:   { color:cyan },
  };

  const userName = localStorage.getItem('user_name') || 'OPERATOR';

  return (
    <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden', transition:'background 0.3s ease' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes borderScan{
          0%{border-color:${theme.isDark?'rgba(0,255,247,0.2)':'rgba(0,100,180,0.15)'}}
          33%{border-color:${theme.isDark?'rgba(181,55,242,0.2)':'rgba(100,50,200,0.15)'}}
          66%{border-color:${theme.isDark?'rgba(0,255,150,0.2)':'rgba(0,150,100,0.15)'}}
          100%{border-color:${theme.isDark?'rgba(0,255,247,0.2)':'rgba(0,100,180,0.15)'}}
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes neonPulse{0%,100%{filter:drop-shadow(0 0 8px currentColor)}50%{filter:drop-shadow(0 0 20px currentColor)}}
        @keyframes tipPop{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes countUp{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        .result-section{
          background:   ${theme.bgCard};
          border:       1px solid ${theme.border};
          border-radius:4px;
          padding:      24px;
          position:     relative;
          overflow:     hidden;
          animation:    borderScan 5s linear infinite;
          margin-bottom:16px;
          box-shadow:   ${theme.isDark?'none':'0 2px 12px rgba(0,100,180,0.08)'};
          transition:   all 0.3s ease;
        }
        .section-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:theme.isDark?0.4:0.15 }}/>

      {!isMobile && [
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,    borderLeft:`2px solid ${cyan}`    },
        { top:16,    right:16, borderTop:`2px solid ${purple}`,  borderRight:`2px solid ${purple}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${green}`,borderLeft:`2px solid ${green}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${pink}`, borderRight:`2px solid ${pink}`   },
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{
        maxWidth:   '760px',
        margin:     '0 auto',
        padding:    isMobile ? '16px 12px 40px' : '60px 20px 40px',
        position:   'relative',
        zIndex:     10,
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'3px', height:'28px', background:`linear-gradient(180deg,${scoreColor},${purple})`, boxShadow:`0 0 10px ${scoreColor}` }}/>
              <h1 style={{ fontSize:isMobile?'16px':'22px', fontWeight:'900', color:scoreColor, margin:0, letterSpacing:isMobile?'2px':'4px', textTransform:'uppercase', textShadow:theme.isDark?`0 0 20px ${scoreColor}60`:'none' }}>
                CREDIT ANALYSIS
              </h1>
            </div>
            <div style={{ padding:'4px 12px', border:`1px solid ${tierConfig.color}40`, borderRadius:'2px', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', color:tierConfig.color, background:tierConfig.bg }}>
              {tierConfig.icon} {tierConfig.label}
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${scoreColor}60,${purple}40,transparent)` }}/>
        </div>

        {/* Score Gauge + Stats */}
        <div className="result-section">
          <div className="section-scan" style={{ background:`linear-gradient(90deg,transparent,${scoreColor}40,transparent)` }}/>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'300px 1fr', gap:isMobile?'16px':'32px', alignItems:'center' }}>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <svg width={svgSize} height={200} viewBox={`0 0 ${svgSize} 200`}>
                <defs>
                  <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%"   stopColor={pink}  stopOpacity="0.3"/>
                    <stop offset="50%"  stopColor={amber} stopOpacity="0.3"/>
                    <stop offset="100%" stopColor={green} stopOpacity="0.3"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <path d={describeArc(start,end)} fill="none" stroke="url(#trackGrad)" strokeWidth="12" strokeLinecap="round"/>
                {animScore > 0 && (
                  <path d={describeArc(start,scoreAngle)} fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round" filter="url(#glow)"/>
                )}
                {[0,25,50,75,100].map(v => {
                  const a = start + total*(v/100);
                  return (
                    <g key={v}>
                      <line x1={cx+(R-8)*Math.cos(a)} y1={cy+(R-8)*Math.sin(a)} x2={cx+(R+8)*Math.cos(a)} y2={cy+(R+8)*Math.sin(a)} stroke={theme.isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'} strokeWidth="1.5"/>
                      <text x={cx+(R+20)*Math.cos(a)} y={cy+(R+20)*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={theme.isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)'} fontFamily="'Courier New',monospace">{v}</text>
                    </g>
                  );
                })}
                <line x1={cx} y1={cy} x2={cx+(R-20)*Math.cos(scoreAngle)} y2={cy+(R-20)*Math.sin(scoreAngle)} stroke={scoreColor} strokeWidth="2" strokeLinecap="round" filter="url(#glow)"/>
                <circle cx={cx} cy={cy} r="8" fill={scoreColor} filter="url(#glow)"/>
                <circle cx={cx} cy={cy} r="4" fill={theme.isDark?'#000308':'#f0f4f8'}/>
                <text x={cx} y={cy+38} textAnchor="middle" fontSize={isMobile?'36':'42'} fontWeight="900" fill={scoreColor} fontFamily="'Courier New',monospace" filter="url(#glow)">{animScore}</text>
                <text x={cx} y={cy+56} textAnchor="middle" fontSize="10" fill={theme.isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)'} fontFamily="'Courier New',monospace" letterSpacing="2">OUT OF 100</text>
              </svg>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div style={{ padding:'14px', background:tierConfig.bg, border:`1px solid ${tierConfig.border}`, borderRadius:'4px', display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'28px', color:tierConfig.color, textShadow:theme.isDark?`0 0 20px ${tierConfig.color}`:'none', animation:'neonPulse 2s ease-in-out infinite' }}>{tierConfig.icon}</span>
                <div>
                  <div style={{ fontSize:'9px', letterSpacing:'3px', color:theme.textMuted, marginBottom:'4px' }}>RISK CLASSIFICATION</div>
                  <div style={{ fontSize:isMobile?'16px':'20px', fontWeight:'900', color:tierConfig.color, letterSpacing:'2px', textShadow:theme.isDark?`0 0 15px ${tierConfig.color}`:'none' }}>{tierConfig.label}</div>
                </div>
              </div>
              {[
                { label:'SCORE PERCENTILE', value:`TOP ${100-score}%`,         color:cyan   },
                { label:'MODEL CONFIDENCE', value:`${confidence}%`,            color:purple },
                { label:'SCORE RANGE',      value:`${scoreMin} — ${scoreMax}`, color:amber  },
                { label:'FEATURES',         value:`${(result.feature_names||[]).length} ANALYZED`, color:green },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'2px' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted }}>{s.label}</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:s.color, textShadow:theme.isDark?`0 0 6px ${s.color}`:'none' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence interval bar */}
          {showDetails && (
            <div style={{ marginTop:'20px', padding:'14px 16px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px', animation:'fadeUp 0.5s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, textTransform:'uppercase' }}>◈ CONFIDENCE INTERVAL ({confidence}%)</span>
                <span style={{ fontSize:'10px', fontWeight:'700', color:amber, fontFamily:"'Courier New',monospace" }}>{scoreMin} — {scoreMax}</span>
              </div>
              <div style={{ position:'relative', height:'12px', background:theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)', borderRadius:'6px', overflow:'visible' }}>
                <div style={{ position:'absolute', left:`${scoreMin}%`, width:`${scoreMax-scoreMin}%`, height:'100%', background:`${amber}25`, borderRadius:'6px', border:`1px solid ${amber}40` }}/>
                <div style={{ position:'absolute', left:`${score}%`, top:'-4px', transform:'translateX(-50%)', width:'4px', height:'20px', background:scoreColor, borderRadius:'2px', boxShadow:`0 0 8px ${scoreColor}` }}/>
                <div style={{ position:'absolute', left:`${scoreMin}%`, top:'16px', transform:'translateX(-50%)', fontSize:'8px', color:`${amber}80`, fontFamily:"'Courier New',monospace" }}>{scoreMin}</div>
                <div style={{ position:'absolute', left:`${scoreMax}%`, top:'16px', transform:'translateX(-50%)', fontSize:'8px', color:`${amber}80`, fontFamily:"'Courier New',monospace" }}>{scoreMax}</div>
                <div style={{ position:'absolute', left:`${score}%`, top:'-18px', transform:'translateX(-50%)', fontSize:'9px', fontWeight:'700', color:scoreColor, fontFamily:"'Courier New',monospace" }}>{score}</div>
              </div>
              <p style={{ margin:'24px 0 0', fontSize:'10px', color:theme.textMuted, lineHeight:'1.6' }}>
                With {confidence}% confidence, your score likely falls between <span style={{ color:amber, fontWeight:'700' }}>{scoreMin}</span> and <span style={{ color:amber, fontWeight:'700' }}>{scoreMax}</span>. Central estimate: <span style={{ color:scoreColor, fontWeight:'700' }}>{score}</span>.
              </p>
            </div>
          )}
        </div>

        {/* SHAP Waterfall Chart */}
        {shapData.length > 0 && showDetails && (
          <div className="result-section" style={{ animation:'fadeUp 0.5s ease both' }}>
            <div className="section-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:purple, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${purple}`:'none' }}>◈ ANALYSIS</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>SHAP WATERFALL CHART</span>
            </div>
            <p style={{ fontSize:'10px', color:theme.textMuted, marginBottom:'20px', lineHeight:'1.6' }}>
              Each bar shows how much a feature pushed the score up (green) or down (pink) from the baseline.
            </p>

            {/* Baseline */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px', padding:'8px 12px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'2px' }}>
              <span style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'2px', width:'160px', flexShrink:0 }}>BASELINE SCORE</span>
              <div style={{ flex:1, height:'6px', background:theme.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)', borderRadius:'3px', position:'relative' }}>
                <div style={{ position:'absolute', left:'50%', top:'-3px', width:'2px', height:'12px', background:theme.isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)', borderRadius:'1px' }}/>
              </div>
              <span style={{ fontSize:'10px', fontWeight:'700', color:theme.textMuted, fontFamily:"'Courier New',monospace", width:'40px', textAlign:'right' }}>50</span>
            </div>

            {[...shapData].sort((a,b) => Math.abs(b.value)-Math.abs(a.value)).map((d,i) => {
              const pos   = d.value >= 0;
              const pct   = Math.abs(d.value) / maxAbs * 60;
              const col   = pos ? green : pink;
              let running = 50;
              shapData.slice(0,i).forEach(prev => { running += prev.value; });
              const runningPct = Math.max(0, Math.min(100, running));
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px', animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <span style={{ fontSize:'9px', color:theme.textMuted, letterSpacing:'0.5px', width:'160px', flexShrink:0, textTransform:'uppercase' }}>{d.name}</span>
                  <div style={{ flex:1, height:'20px', background:theme.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)', borderRadius:'3px', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', left:0, top:0, width:`${runningPct}%`, height:'100%', background:theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)' }}/>
                    <div style={{ position:'absolute', left:pos?`${Math.min(runningPct,100)}%`:`${Math.max(0,runningPct-pct)}%`, width:`${pct}%`, height:'100%', background:`linear-gradient(${pos?'90deg':'270deg'},${col}60,${col})`, boxShadow:`0 0 6px ${col}60`, minWidth:d.value!==0?'2px':'0' }}/>
                    <div style={{ position:'absolute', right:'4px', top:'50%', transform:'translateY(-50%)', fontSize:'8px', fontWeight:'700', color:theme.isDark?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.5)', fontFamily:"'Courier New',monospace" }}>
                      {pos?'+':''}{d.value.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:'700', color:col, fontFamily:"'Courier New',monospace", width:'40px', textAlign:'right', textShadow:theme.isDark?`0 0 4px ${col}`:'none' }}>
                    {pos?'+':''}{d.value.toFixed(1)}
                  </span>
                </div>
              );
            })}

            {/* Final score */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'8px', padding:'10px 12px', background:`${scoreColor}10`, border:`1px solid ${scoreColor}30`, borderRadius:'2px' }}>
              <span style={{ fontSize:'9px', color:scoreColor, letterSpacing:'2px', width:'160px', flexShrink:0, fontWeight:'700' }}>FINAL SCORE</span>
              <div style={{ flex:1, height:'8px', background:theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${score}%`, background:`linear-gradient(90deg,${scoreColor}60,${scoreColor})`, boxShadow:`0 0 8px ${scoreColor}`, borderRadius:'4px' }}/>
              </div>
              <span style={{ fontSize:'13px', fontWeight:'900', color:scoreColor, fontFamily:"'Courier New',monospace", width:'40px', textAlign:'right', textShadow:theme.isDark?`0 0 8px ${scoreColor}`:'none' }}>{score}</span>
            </div>

            <div style={{ display:'flex', gap:'20px', marginTop:'16px', paddingTop:'12px', borderTop:`1px solid ${theme.border}` }}>
              {[{color:green,label:'POSITIVE IMPACT'},{color:pink,label:'NEGATIVE IMPACT'}].map((l,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'9px', letterSpacing:'2px', color:theme.textMuted }}>
                  <div style={{ width:'20px', height:'3px', borderRadius:'2px', background:l.color, boxShadow:theme.isDark?`0 0 4px ${l.color}`:'none' }}/>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Rationale */}
        {showDetails && result.explanation?.length > 0 && (
          <div className="result-section" style={{ animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div className="section-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:cyan, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${cyan}`:'none' }}>◈ DIAGNOSTIC</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>DECISION RATIONALE</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {(Array.isArray(result.explanation)?result.explanation:[result.explanation]).map((line,i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'12px 14px', background:theme.isDark?'rgba(0,255,247,0.03)':'rgba(0,100,180,0.04)', border:`1px solid ${theme.border}`, borderRadius:'2px', animation:`tipPop 0.4s ease ${i*0.1}s both` }}>
                  <span style={{ color:cyan, fontSize:'12px', marginTop:'1px', flexShrink:0 }}>▸</span>
                  <p style={{ margin:0, fontSize:'12px', color:theme.textMuted, lineHeight:'1.6' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {showDetails && result.tips?.length > 0 && (
          <div style={{ background:theme.isDark?'rgba(255,184,0,0.04)':'rgba(255,184,0,0.06)', border:`1px solid ${amber}20`, borderRadius:'4px', padding:'24px', marginBottom:'16px', position:'relative', overflow:'hidden', animation:'fadeUp 0.5s ease 0.4s both', boxShadow:theme.isDark?'none':'0 2px 12px rgba(200,140,0,0.08)' }}>
            <div style={{ position:'absolute', left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${amber}40,transparent)`, animation:'scanH 4s linear infinite' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:amber, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${amber}`:'none' }}>◈ PROTOCOL</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>SCORE ENHANCEMENT DIRECTIVES</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {result.tips.map((tip,i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', animation:`tipPop 0.4s ease ${i*0.12}s both` }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'2px', background:`${amber}20`, border:`1px solid ${amber}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'900', color:amber, flexShrink:0 }}>{i+1}</div>
                  <p style={{ margin:0, fontSize:'12px', color:theme.isDark?`rgba(255,184,0,0.7)`:`rgba(160,110,0,0.9)`, lineHeight:'1.6', paddingTop:'2px' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email badge */}
        {showDetails && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', background:theme.isDark?'rgba(0,255,150,0.04)':'rgba(0,180,80,0.05)', border:`1px solid ${green}20`, borderRadius:'4px', marginBottom:'12px', animation:'fadeUp 0.5s ease 0.42s both' }}>
            <span style={{ fontSize:'16px' }}>📧</span>
            <p style={{ margin:0, fontSize:'10px', color:theme.isDark?'rgba(0,255,150,0.6)':'rgba(0,150,60,0.8)', letterSpacing:'1px', lineHeight:'1.5' }}>
              A detailed credit report has been sent to your registered email address.
            </p>
          </div>
        )}

        {/* Peer Comparison */}
        {showDetails && peerData && peerData.total_applicants > 0 && (
          <div className="result-section" style={{ animation:'fadeUp 0.5s ease 0.45s both' }}>
            <div className="section-scan" style={{ background:`linear-gradient(90deg,transparent,${green}60,transparent)` }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'10px', fontWeight:'700', color:green, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${green}`:'none' }}>◈ BENCHMARK</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>PEER COMPARISON</span>
              <span style={{ marginLeft:'auto', fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>{peerData.total_applicants} APPLICANTS</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:'12px', marginBottom:'20px' }}>
              <div style={{ padding:'16px', textAlign:'center', background:`${green}06`, border:`1px solid ${green}20`, borderRadius:'4px' }}>
                <div style={{ fontSize:isMobile?'36px':'48px', fontWeight:'900', color:green, lineHeight:1, textShadow:theme.isDark?`0 0 20px ${green}`:'none', fontFamily:"'Courier New',monospace", animation:'countUp 0.8s ease both' }}>
                  {peerData.beats_percent}<span style={{ fontSize:'16px' }}>%</span>
                </div>
                <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.isDark?'rgba(0,255,150,0.5)':'rgba(0,150,60,0.6)', marginTop:'8px', textTransform:'uppercase' }}>APPLICANTS BEATEN</div>
              </div>
              <div style={{ padding:'16px', textAlign:'center', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px' }}>
                <div style={{ display:'flex', justifyContent:'space-around', alignItems:'flex-end', marginBottom:'8px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:'900', color:scoreColor, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${scoreColor}`:'none' }}>{score}</div>
                    <div style={{ fontSize:'8px', color:theme.textMuted, letterSpacing:'1px', marginTop:'4px' }}>YOUR SCORE</div>
                  </div>
                  <div style={{ fontSize:'14px', color:theme.textDim, paddingBottom:'4px' }}>vs</div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:'900', color:cyan, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${cyan}`:'none' }}>{peerData.avg_score}</div>
                    <div style={{ fontSize:'8px', color:theme.textMuted, letterSpacing:'1px', marginTop:'4px' }}>AVG SCORE</div>
                  </div>
                </div>
                <div style={{ fontSize:'10px', fontWeight:'700', color:score>peerData.avg_score?green:pink }}>
                  {score>peerData.avg_score?`+${score-peerData.avg_score} above avg`:`${score-peerData.avg_score} below avg`}
                </div>
              </div>
              <div style={{ padding:'16px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px' }}>
                <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'10px', textTransform:'uppercase' }}>THRESHOLDS</div>
                {[
                  { label:'TOP 10%', value:peerData.top10_threshold,    color:green },
                  { label:'AVERAGE', value:peerData.avg_score,          color:cyan  },
                  { label:'BTM 10%', value:peerData.bottom10_threshold, color:pink  },
                ].map((t,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'9px', color:theme.textMuted }}>{t.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:'900', color:t.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 6px ${t.color}`:'none' }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'10px', textTransform:'uppercase' }}>SCORE DISTRIBUTION</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={peerData.distribution} margin={{ top:5, right:5, left:0, bottom:5 }} barCategoryGap="10%">
                <XAxis dataKey="label" tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:8, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={22} allowDecimals={false}/>
                <Tooltip {...tooltipStyle} formatter={v=>[`${v} applicants`,'COUNT']}/>
                <ReferenceLine x={`${Math.floor(score/10)*10}s`} stroke={scoreColor} strokeWidth={2} strokeDasharray="4 4"/>
                <Bar dataKey="count" radius={[2,2,0,0]}>
                  {peerData.distribution.map((entry,index) => {
                    const rs     = index * 10;
                    const isUser = Math.floor(score/10) === index;
                    const bc     = isUser ? scoreColor : rs>=65?`${green}60`:rs>=40?`${amber}60`:`${pink}60`;
                    return <Cell key={`cell-${index}`} fill={bc} style={{ filter:isUser&&theme.isDark?`drop-shadow(0 0 6px ${scoreColor})`:'none' }}/>;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 30-Day Prediction */}
        {showDetails && predData && (
          <div className="result-section" style={{ border:`1px solid ${predData.has_data?`${teal}40`:theme.border}`, animation:'fadeUp 0.5s ease 0.48s both' }}>
            <div className="section-scan" style={{ background:`linear-gradient(90deg,transparent,${teal}60,transparent)` }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'10px', fontWeight:'700', color:teal, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${teal}`:'none' }}>◈ FORECAST</span>
                <span style={{ fontSize:'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>30-DAY PREDICTION</span>
              </div>
              {predData.has_data && (
                <div style={{ padding:'4px 12px', background:`${trendColor}15`, border:`1px solid ${trendColor}40`, borderRadius:'2px', fontSize:'10px', fontWeight:'700', color:trendColor, letterSpacing:'2px' }}>
                  {trendIcon} {predData.trend?.toUpperCase()}
                </div>
              )}
            </div>
            {!predData.has_data ? (
              <div style={{ textAlign:'center', padding:'20px' }}>
                <div style={{ fontSize:'28px', marginBottom:'10px', opacity:0.4 }}>◈</div>
                <p style={{ fontSize:'11px', letterSpacing:'2px', color:theme.textMuted, margin:0 }}>{predData.message}</p>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:'10px', marginBottom:'16px' }}>
                  {[
                    { label:'CURRENT',   value:predData.current_score,   color:scoreColor },
                    { label:'PREDICTED', value:predData.predicted_score, color:predColor  },
                    { label:'BEST',      value:predData.best_score,      color:green      },
                    { label:'SCANS',     value:predData.total_scans,     color:cyan       },
                  ].map((s,i) => (
                    <div key={i} style={{ padding:'10px', textAlign:'center', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px' }}>
                      <div style={{ fontSize:'20px', fontWeight:'900', color:s.color, fontFamily:"'Courier New',monospace", textShadow:theme.isDark?`0 0 10px ${s.color}`:'none' }}>{s.value}</div>
                      <div style={{ fontSize:'8px', letterSpacing:'1px', color:theme.textMuted, marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'10px 14px', marginBottom:'14px', background:predData.improvement>=0?theme.isDark?'rgba(0,255,150,0.06)':'rgba(0,180,80,0.05)':theme.isDark?'rgba(255,45,155,0.06)':'rgba(200,0,80,0.05)', border:`1px solid ${predColor}30`, borderRadius:'4px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'16px', color:predColor }}>{predData.improvement>=0?'▲':'▼'}</span>
                  <p style={{ margin:0, fontSize:'10px', color:theme.textMuted, lineHeight:'1.6' }}>
                    Score predicted to <span style={{ color:predColor, fontWeight:'700' }}>{predData.improvement>=0?'improve':'decline'}</span> by <span style={{ color:predColor, fontWeight:'700' }}>{Math.abs(predData.improvement)} points</span> in 30 days.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={combinedChartData} margin={{ top:10, right:10, left:0, bottom:5 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={cyan}     stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={cyan}     stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={predColor} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={predColor} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark?'rgba(0,255,247,0.05)':'rgba(0,0,0,0.06)'} vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize:7, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{ fontSize:7, fill:theme.textMuted, fontFamily:"'Courier New',monospace" }} axisLine={false} tickLine={false} width={24}/>
                    <ReferenceLine y={65} stroke={`${green}40`} strokeDasharray="4 4" strokeWidth={1}/>
                    <ReferenceLine y={40} stroke={`${pink}40`}  strokeDasharray="4 4" strokeWidth={1}/>
                    <Tooltip {...tooltipStyle} formatter={(value,name) => {
                      if (value===null||value===undefined) return null;
                      const col = name==='actual' ? cyan : predColor;
                      return [<span style={{ color:col }}>{value}/100</span>, name==='actual'?'ACTUAL':'PREDICTED'];
                    }}/>
                    <Area type="monotone" dataKey="actual"    stroke={cyan}      strokeWidth={2} fill="url(#actualGrad)" dot={{ fill:cyan,      r:3, strokeWidth:0 }} connectNulls={false}/>
                    <Area type="monotone" dataKey="predicted" stroke={predColor} strokeWidth={2} strokeDasharray="6 3" fill="url(#predGrad)" dot={{ fill:predColor, r:3, strokeWidth:0 }} connectNulls={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}

        {/* What-If Simulator */}
        {showDetails && whatIf && (
          <div style={{ background:theme.bgCard, border:`1px solid ${purple}25`, borderRadius:'4px', padding:'24px', marginBottom:'16px', position:'relative', overflow:'hidden', animation:'fadeUp 0.5s ease 0.5s both', boxShadow:theme.isDark?'none':'0 2px 12px rgba(100,50,200,0.08)' }}>
            <div style={{ position:'absolute', left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${purple}60,transparent)`, animation:'scanH 3s linear infinite', pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'10px', fontWeight:'700', color:purple, letterSpacing:'3px', textShadow:theme.isDark?`0 0 8px ${purple}`:'none' }}>◈ SIMULATOR</span>
                <span style={{ fontSize:isMobile?'11px':'13px', fontWeight:'700', color:theme.text, letterSpacing:'2px' }}>WHAT-IF PREDICTOR</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'2px' }}>PREDICTED</div>
                  <div style={{ fontSize:'24px', fontWeight:'900', color:whatIfScore>=65?green:whatIfScore>=40?amber:pink, fontFamily:"'Courier New',monospace", lineHeight:1 }}>{whatIfScore}</div>
                </div>
                {whatIfScore !== score && (
                  <div style={{ padding:'5px 10px', borderRadius:'4px', background:whatIfScore>score?theme.isDark?'rgba(0,255,150,0.1)':'rgba(0,180,80,0.1)':theme.isDark?'rgba(255,45,155,0.1)':'rgba(200,0,80,0.1)', border:`1px solid ${whatIfScore>score?green:pink}40`, fontSize:'12px', fontWeight:'900', color:whatIfScore>score?green:pink, fontFamily:"'Courier New',monospace" }}>
                    {whatIfScore>score?'+':''}{whatIfScore-score}
                  </div>
                )}
                <button onClick={() => {
                  const reset = { recharge_amount:300, recharge_frequency:2, electricity_regularity:0.7, grocery_spend:3000, location_stability:60, social_trust:0.6 };
                  setWhatIf(reset); computeWhatIfScore(reset);
                }} style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${theme.border}`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:theme.textMuted, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${purple}50`; e.currentTarget.style.color=purple; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=theme.border; e.currentTarget.style.color=theme.textMuted; }}>
                  RESET
                </button>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:'16px 24px' }}>
              {sliders.map(slider => {
                const val = whatIf[slider.key] ?? slider.min;
                const p   = ((val-slider.min)/(slider.max-slider.min))*100;
                return (
                  <div key={slider.key}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                      <span style={{ fontSize:'9px', letterSpacing:'1px', color:theme.textMuted, textTransform:'uppercase' }}>{slider.label}</span>
                      <span style={{ fontSize:'10px', fontWeight:'700', color:slider.color, textShadow:theme.isDark?`0 0 6px ${slider.color}`:'none', fontFamily:"'Courier New',monospace" }}>{slider.display(val)}</span>
                    </div>
                    <div style={{ position:'relative', height:'16px' }}>
                      <div style={{ position:'absolute', top:'6px', left:0, right:0, height:'4px', background:theme.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)', borderRadius:'2px' }}/>
                      <div style={{ position:'absolute', top:'6px', left:0, width:`${p}%`, height:'4px', background:`linear-gradient(90deg,${slider.color}60,${slider.color})`, borderRadius:'2px', boxShadow:theme.isDark?`0 0 8px ${slider.color}60`:'none' }}/>
                      <div style={{ position:'absolute', top:'2px', left:`calc(${p}% - 6px)`, width:'12px', height:'12px', borderRadius:'50%', background:`radial-gradient(circle,#fff,${slider.color})`, boxShadow:`0 0 8px ${slider.color}`, pointerEvents:'none' }}/>
                      <input type="range" min={slider.min} max={slider.max} step={slider.step} value={val}
                        onChange={e => {
                          const updated = { ...whatIf, [slider.key]: parseFloat(e.target.value) };
                          setWhatIf(updated); computeWhatIfScore(updated);
                        }}
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', margin:0 }}
                      />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'3px' }}>
                      <span style={{ fontSize:'8px', color:theme.textDim, fontFamily:"'Courier New',monospace" }}>{slider.display(slider.min)}</span>
                      <span style={{ fontSize:'8px', color:theme.textDim, fontFamily:"'Courier New',monospace" }}>{slider.display(slider.max)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:'20px', padding:'14px', background:theme.isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)', border:`1px solid ${theme.border}`, borderRadius:'4px' }}>
              <div style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textMuted, marginBottom:'10px' }}>SCORE COMPARISON</div>
              {[
                { label:'CURRENT',   value:score,       color:scoreColor },
                { label:'PREDICTED', value:whatIfScore, color:whatIfScore>=65?green:whatIfScore>=40?amber:pink },
              ].map((s,i) => (
                <div key={i} style={{ marginBottom:i===0?'10px':'0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'9px', color:s.color, fontFamily:"'Courier New',monospace", fontWeight:'700' }}>{s.label}: {s.value}</span>
                    {i===1 && whatIfScore!==score && (
                      <span style={{ fontSize:'9px', color:whatIfScore>score?green:pink, fontFamily:"'Courier New',monospace" }}>
                        {whatIfScore>score?`+${whatIfScore-score} improvement`:`${whatIfScore-score} decrease`}
                      </span>
                    )}
                  </div>
                  <div style={{ height:'6px', background:theme.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${s.value}%`, background:`linear-gradient(90deg,${s.color}60,${s.color})`, boxShadow:theme.isDark?`0 0 8px ${s.color}60`:'none', borderRadius:'3px', transition:'width 0.3s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showDetails && (
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:'10px', animation:'fadeUp 0.5s ease 0.6s both' }}>
            <button onClick={() => navigate('/apply')} style={{ padding:'14px', background:'transparent', border:`1px solid ${cyan}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background=`${cyan}10`; e.currentTarget.style.boxShadow=`0 0 20px ${cyan}30`; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='none'; }}>
              ◈ NEW ANALYSIS
            </button>
            <button onClick={() => navigate('/history')} style={{ padding:'14px', background:`linear-gradient(135deg,${purple}20,${cyan}10)`, border:`1px solid ${purple}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:purple, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background=`${purple}20`; e.currentTarget.style.boxShadow=`0 0 20px ${purple}30`; }}
            onMouseLeave={e => { e.currentTarget.style.background=`linear-gradient(135deg,${purple}20,${cyan}10)`; e.currentTarget.style.boxShadow='none'; }}>
              ⬡ VIEW HISTORY
            </button>
            {/* PDF Download — using PDFReport component */}
            <PDFReport result={result} userName={userName}/>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'32px', paddingTop:'16px', borderTop:`1px solid ${theme.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>LOANIQ › CREDIT ANALYSIS</span>
          <span style={{ fontSize:'9px', letterSpacing:'2px', color:theme.textDim }}>TRANSFORMER + GAT · AUC 0.9618</span>
        </div>
      </div>
    </div>
  );
}

