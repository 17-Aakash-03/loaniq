import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isLogin,      setIsLogin]      = useState(true);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [name,         setName]         = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [focused,      setFocused]      = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [mousePos,     setMousePos]     = useState({ x:0, y:0 });
  const [glitching,    setGlitching]    = useState(false);
  const [isDark,       setIsDark]       = useState(localStorage.getItem('theme') !== 'light');

  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const navigate  = useNavigate();

  const cyan        = isDark ? '#00fff7' : '#0055cc';
  const purple      = isDark ? '#b537f2' : '#7722ee';
  const green       = isDark ? '#00ff96' : '#009944';
  const pink        = isDark ? '#ff2d9b' : '#cc0066';
  const bg          = isDark ? '#000308' : '#f0f4f8';
  const cardBg      = isDark ? 'rgba(0,3,8,0.85)'     : 'rgba(255,255,255,0.95)';
  const inputBg     = isDark ? 'rgba(0,255,247,0.03)'  : 'rgba(0,100,180,0.04)';
  const inputBorder = isDark ? 'rgba(0,255,247,0.2)'   : 'rgba(0,100,180,0.25)';
  const inputColor  = isDark ? '#00fff7'                : '#003388';

  // Auto-login if remembered
  useEffect(() => {
    const token      = localStorage.getItem('token');
    const remembered = localStorage.getItem('remember_me') === 'true';
    if (token && remembered) navigate('/apply');
  }, [navigate]);

  // Load saved email
  useEffect(() => {
    const savedEmail    = localStorage.getItem('saved_email');
    const savedRemember = localStorage.getItem('remember_me') === 'true';
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    setTimeout(() => setMounted(true), 200);
  }, []);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handle = (e) => setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  // Canvas matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W      = canvas.width;
    const H      = canvas.height;
    const fontSize = 14;
    const cols     = Math.floor(W / fontSize);
    const drops    = Array(cols).fill(1);
    const chars    = '01アイウエオカキクケコサシスセソ';
    const N        = 80;
    const dots     = Array.from({ length:N }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.5,
      vy:  (Math.random() - 0.5) * 0.5,
      r:   Math.random() * 2 + 1,
      hue: Math.random() * 60 + 200,
    }));
    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = isDark ? 'rgba(0,0,8,0.08)' : 'rgba(240,244,248,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = isDark
          ? `rgba(0,255,150,${Math.random()*0.15+0.03})`
          : `rgba(0,100,180,${Math.random()*0.08+0.02})`;
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        const pulse = Math.sin(frame * 0.02 + d.hue) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${d.hue},100%,70%,0.6)`
          : `hsla(${d.hue},80%,50%,0.3)`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isDark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData    = new FormData(e.target);
    const emailVal    = formData.get('email')    || email;
    const passwordVal = formData.get('password') || password;
    const nameVal     = formData.get('name')     || name;

    if (!emailVal || !passwordVal) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('https://loaniq-backend-6dmd.onrender.com/login', {
          email:    emailVal,
          password: passwordVal,
        });
        const token = res.data.access_token;
        if (rememberMe) {
          localStorage.setItem('token',        token);
          localStorage.setItem('user_name',    res.data.user_name);
          localStorage.setItem('user_role',    res.data.user_role || 'user');
          localStorage.setItem('remember_me',  'true');
          localStorage.setItem('saved_email',  emailVal);
        } else {
          localStorage.setItem('token',      token);
          localStorage.setItem('user_name',  res.data.user_name);
          localStorage.setItem('user_role',  res.data.user_role || 'user');
          localStorage.removeItem('remember_me');
          localStorage.removeItem('saved_email');
        }
        navigate('/apply');
      } else {
        await axios.post('https://loaniq-backend-6dmd.onrender.com/register', {
          name:     nameVal,
          email:    emailVal,
          password: passwordVal,
        });
        setIsLogin(true);
        setError('ACCESS GRANTED — Please authenticate.');
        setEmail(''); setPassword(''); setName('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'ACCESS DENIED');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <div style={{
      minHeight:   '100vh',
      background:  bg,
      display:     'flex',
      alignItems:  'center',
      justifyContent:'center',
      fontFamily:  "'Courier New',monospace",
      overflow:    'hidden',
      position:    'relative',
      transition:  'background 0.3s ease',
    }}>
      <style>{`
        @keyframes glitch1{0%,100%{clip-path:inset(0 0 98% 0);transform:translate(-4px)}20%{clip-path:inset(30% 0 50% 0);transform:translate(4px)}40%{clip-path:inset(60% 0 20% 0);transform:translate(-2px)}60%{clip-path:inset(10% 0 80% 0);transform:translate(3px)}80%{clip-path:inset(80% 0 5% 0);transform:translate(-3px)}}
        @keyframes glitch2{0%,100%{clip-path:inset(50% 0 30% 0);transform:translate(4px);color:${pink}}33%{clip-path:inset(20% 0 60% 0);transform:translate(-4px);color:${cyan}}66%{clip-path:inset(70% 0 10% 0);transform:translate(2px);color:${purple}}}
        @keyframes neonPulse{0%,100%{text-shadow:0 0 7px ${cyan},0 0 21px ${cyan}}50%{text-shadow:0 0 14px ${purple},0 0 42px ${purple}}}
        @keyframes borderScan{
          0%{border-color:${isDark?'rgba(0,255,247,0.35)':'rgba(0,100,180,0.3)'}}
          33%{border-color:${isDark?'rgba(181,55,242,0.35)':'rgba(100,50,200,0.3)'}}
          66%{border-color:${isDark?'rgba(0,255,150,0.35)':'rgba(0,150,100,0.3)'}}
          100%{border-color:${isDark?'rgba(0,255,247,0.35)':'rgba(0,100,180,0.3)'}}
        }
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes hexRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes badgePop{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
        .cyber-input{
          width:100%;
          padding:13px 48px 13px 46px;
          background:${inputBg};
          border:1px solid ${inputBorder};
          border-radius:4px;
          color:${inputColor};
          font-size:13px;
          font-family:'Courier New',monospace;
          outline:none;
          transition:all 0.3s ease;
          box-sizing:border-box;
          letter-spacing:1px;
        }
        .cyber-input::placeholder{
          color:${isDark?'rgba(0,255,247,0.25)':'rgba(0,100,180,0.35)'};
        }
        .cyber-input:focus{
          border-color:${cyan};
          background:${isDark?'rgba(0,255,247,0.06)':'rgba(0,100,180,0.08)'};
          box-shadow:0 0 0 1px ${cyan}30, 0 0 20px ${cyan}15;
        }
        .cyber-btn{
          width:100%;
          padding:15px;
          border:1px solid transparent;
          border-radius:4px;
          font-size:13px;
          font-weight:700;
          font-family:'Courier New',monospace;
          cursor:pointer;
          letter-spacing:3px;
          text-transform:uppercase;
          position:relative;
          overflow:hidden;
          background:linear-gradient(135deg,${cyan},${purple},${pink},${cyan});
          background-size:300% 300%;
          animation:gradShift 3s ease infinite;
          color:#000;
          transition:all 0.3s ease;
        }
        .cyber-btn:hover:not(:disabled){
          transform:translateY(-3px);
          box-shadow:0 0 30px ${cyan}50;
        }
        .cyber-btn:disabled{
          opacity:0.4;
          cursor:not-allowed;
          animation:none;
          background:${isDark?'#1a1a2e':'#d0dce8'};
          color:${isDark?'#444':'#888'};
        }
        .tab-cyber{
          flex:1;
          padding:10px;
          background:transparent;
          border:none;
          cursor:pointer;
          font-size:12px;
          font-weight:700;
          font-family:'Courier New',monospace;
          letter-spacing:2px;
          text-transform:uppercase;
          border-radius:2px;
          transition:all 0.3s ease;
        }
        .label-cyber{
          display:block;
          font-size:10px;
          font-weight:700;
          letter-spacing:2px;
          text-transform:uppercase;
          margin-bottom:8px;
          transition:color 0.3s ease;
        }
        .eye-btn{
          position:absolute;
          right:12px;
          top:50%;
          transform:translateY(-50%);
          background:none;
          border:none;
          cursor:pointer;
          padding:4px;
          display:flex;
          align-items:center;
          justify-content:center;
          transition:all 0.3s ease;
          border-radius:4px;
        }
        .remember-checkbox{position:relative;width:18px;height:18px;cursor:pointer;flex-shrink:0;}
        .remember-checkbox input{position:absolute;opacity:0;width:0;height:0;}
        .remember-checkmark{
          position:absolute;top:0;left:0;
          width:18px;height:18px;
          background:${isDark?'rgba(0,255,247,0.05)':'rgba(0,100,180,0.05)'};
          border:1px solid ${isDark?'rgba(0,255,247,0.3)':'rgba(0,100,180,0.3)'};
          border-radius:3px;
          transition:all 0.3s ease;
        }
        .remember-checkbox input:checked ~ .remember-checkmark{
          background:${isDark?'rgba(0,255,247,0.15)':'rgba(0,100,180,0.15)'};
          border-color:${cyan};
          box-shadow:0 0 8px ${cyan}40;
        }
        .remember-checkmark:after{
          content:'';position:absolute;display:none;
          left:5px;top:2px;width:5px;height:9px;
          border:2px solid ${cyan};border-width:0 2px 2px 0;
          transform:rotate(45deg);
        }
        .remember-checkbox input:checked ~ .remember-checkmark:after{
          display:block;animation:checkPop 0.2s ease;
        }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:isDark?0.7:0.4 }}/>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position:     'fixed',
          top:          '16px',
          right:        '16px',
          zIndex:       100,
          padding:      '8px 12px',
          background:   isDark ? 'rgba(255,184,0,0.1)' : 'rgba(0,80,180,0.08)',
          border:       `1px solid ${isDark?'rgba(255,184,0,0.35)':'rgba(0,80,180,0.2)'}`,
          borderRadius: '4px',
          cursor:       'pointer',
          fontSize:     '18px',
          transition:   'all 0.3s ease',
          lineHeight:   1,
        }}>
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Corner decorations */}
      {[
        { top:16,    left:16,  borderTop:`2px solid ${cyan}`,    borderLeft:`2px solid ${cyan}`    },
        { top:16,    right:16, borderTop:`2px solid ${purple}`,  borderRight:`2px solid ${purple}` },
        { bottom:16, left:16,  borderBottom:`2px solid ${green}`,borderLeft:`2px solid ${green}`   },
        { bottom:16, right:16, borderBottom:`2px solid ${pink}`, borderRight:`2px solid ${pink}`   },
      ].map((s,i) => (
        <div key={i} style={{ position:'absolute', width:40, height:40, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, zIndex:1, ...s }}/>
      ))}

      <div style={{
        width:      '100%',
        maxWidth:   '440px',
        margin:     '20px',
        zIndex:     10,
        opacity:    mounted ? 1 : 0,
        transform:  mounted
          ? `translate(${mousePos.x*0.3}px,${mousePos.y*0.3}px)`
          : 'translateY(50px)',
        transition: mounted
          ? 'transform 0.1s ease, opacity 0.8s cubic-bezier(0.34,1.56,0.64,1)'
          : 'opacity 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'90px', height:'90px', margin:'0 auto 20px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {[
              { size:90, color:cyan,   dur:'4s', border:'2px solid' },
              { size:72, color:purple, dur:'6s', border:'1px solid' },
              { size:54, color:green,  dur:'3s', border:'1px dashed'},
            ].map((r,i) => (
              <div key={i} style={{ position:'absolute', width:`${r.size}px`, height:`${r.size}px`, borderRadius:'50%', border:`${r.border} ${r.color}`, animation:`hexRotate ${r.dur} linear infinite ${i%2===1?'reverse':''}`, opacity:0.6 }}/>
            ))}
            <div style={{ width:'42px', height:'42px', background:`linear-gradient(135deg,${cyan}22,${purple}22)`, border:`1px solid ${cyan}`, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', position:'relative', zIndex:1 }}>
              💳
            </div>
          </div>

          <div style={{ position:'relative', display:'inline-block', marginBottom:'8px' }}>
            <h1 style={{ fontSize:'26px', fontWeight:'900', color:cyan, margin:0, letterSpacing:'4px', textTransform:'uppercase', animation:isDark?'neonPulse 3s ease-in-out infinite':'none', fontFamily:"'Courier New',monospace" }}>
              MICRO-LOAN.AI
            </h1>
            {glitching && isDark && (
              <>
                <h1 style={{ position:'absolute', top:0, left:0, fontSize:'26px', fontWeight:'900', color:pink,  margin:0, letterSpacing:'4px', textTransform:'uppercase', animation:'glitch1 0.3s steps(1) infinite', fontFamily:"'Courier New',monospace", pointerEvents:'none' }}>MICRO-LOAN.AI</h1>
                <h1 style={{ position:'absolute', top:0, left:0, fontSize:'26px', fontWeight:'900', color:green, margin:0, letterSpacing:'4px', textTransform:'uppercase', animation:'glitch2 0.3s steps(1) infinite', fontFamily:"'Courier New',monospace", pointerEvents:'none' }}>MICRO-LOAN.AI</h1>
              </>
            )}
          </div>

          <p style={{ fontSize:'10px', letterSpacing:'3px', color:isDark?'rgba(0,255,247,0.4)':'rgba(0,100,180,0.5)', margin:'0 0 20px', textTransform:'uppercase' }}>
            ◈ NEURAL CREDIT INTELLIGENCE SYSTEM ◈
          </p>

          <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { label:'AUC › 0.9618', color:green,  delay:'0s'   },
              { label:'TRANSFORMER',  color:cyan,   delay:'0.1s' },
              { label:'GAT NEURAL',   color:purple, delay:'0.2s' },
              { label:'SHAP XAI',     color:pink,   delay:'0.3s' },
            ].map((b,i) => (
              <div key={i} style={{ padding:'4px 12px', border:`1px solid ${b.color}40`, borderRadius:'2px', fontSize:'9px', fontWeight:'700', letterSpacing:'2px', color:b.color, background:`${b.color}08`, animation:`badgePop 0.5s ease ${b.delay} both` }}>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ background:cardBg, backdropFilter:'blur(20px)', border:`1px solid ${isDark?'rgba(0,255,247,0.25)':'rgba(0,100,180,0.2)'}`, borderRadius:'4px', padding:'32px', position:'relative', overflow:'hidden', animation:'borderScan 4s linear infinite', boxShadow:isDark?'none':'0 4px 24px rgba(0,100,180,0.12)' }}>
          <div style={{ position:'absolute', left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${cyan}60,transparent)`, animation:'scanH 3s linear infinite', pointerEvents:'none' }}/>

          {/* Inner corners */}
          {[
            { top:8,    left:8,  borderTop:`1px solid ${cyan}`,   borderLeft:`1px solid ${cyan}`   },
            { top:8,    right:8, borderTop:`1px solid ${cyan}`,   borderRight:`1px solid ${cyan}`  },
            { bottom:8, left:8,  borderBottom:`1px solid ${cyan}`,borderLeft:`1px solid ${cyan}`   },
            { bottom:8, right:8, borderBottom:`1px solid ${cyan}`,borderRight:`1px solid ${cyan}`  },
          ].map((s,i) => (
            <div key={i} style={{ position:'absolute', width:16, height:16, ...s }}/>
          ))}

          {/* Tabs */}
          <div style={{ display:'flex', background:isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.05)', borderRadius:'2px', padding:'3px', marginBottom:'28px', border:`1px solid ${isDark?'rgba(0,255,247,0.06)':'rgba(0,100,180,0.1)'}`, position:'relative', zIndex:1 }}>
            {['// LOGIN','// REGISTER'].map((tab,i) => (
              <button key={tab} className="tab-cyber"
                onClick={() => { setIsLogin(i===0); setError(''); }}
                style={{ color:isLogin===(i===0)?'#000':isDark?'rgba(0,255,247,0.3)':'rgba(0,100,180,0.4)', background:isLogin===(i===0)?`linear-gradient(135deg,${cyan},${purple})`:'transparent' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Status line */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px', padding:'8px 12px', background:isDark?'rgba(0,255,150,0.04)':'rgba(0,150,100,0.05)', border:`1px solid ${isDark?'rgba(0,255,150,0.1)':'rgba(0,150,100,0.15)'}`, borderRadius:'2px', position:'relative', zIndex:1 }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:green, animation:'cornerBlink 1s ease-in-out infinite', flexShrink:0 }}/>
            <span style={{ fontSize:'10px', letterSpacing:'2px', color:isDark?'rgba(0,255,150,0.6)':'rgba(0,150,100,0.7)' }}>
              {isLogin ? 'SYSTEM READY › ENTER CREDENTIALS' : 'REGISTRATION MODULE › CREATE PROFILE'}
            </span>
          </div>

          {/* Error / Success message */}
          {error && (
            <div style={{
              padding:       '10px 14px',
              marginBottom:  '20px',
              borderRadius:  '2px',
              fontSize:      '11px',
              letterSpacing: '2px',
              fontWeight:    '700',
              textTransform: 'uppercase',
              animation:     'fadeUp 0.3s ease',
              display:       'flex',
              alignItems:    'center',
              gap:           '10px',
              position:      'relative',
              zIndex:        1,
              background:    error.includes('GRANTED')
                ? isDark?'rgba(0,255,150,0.08)':'rgba(0,150,100,0.08)'
                : isDark?'rgba(255,45,155,0.08)':'rgba(200,0,80,0.06)',
              border:        `1px solid ${error.includes('GRANTED')?green:pink}40`,
              color:         error.includes('GRANTED') ? green : pink,
            }}>
              <span style={{ fontSize:'16px', flexShrink:0 }}>
                {error.includes('GRANTED') ? '◉' : '⚠'}
              </span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

              {/* Name — register only */}
              <div style={{ maxHeight:!isLogin?'90px':'0', opacity:!isLogin?1:0, overflow:'hidden', transition:'all 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
                <label className="label-cyber" style={{ color:focused==='name'?cyan:isDark?'rgba(0,255,247,0.35)':'rgba(0,100,180,0.5)' }}>
                  ◈ Operator Name
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:cyan, opacity:focused==='name'?1:0.3, pointerEvents:'none' }}>▸</span>
                  <input
                    className="cyber-input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="ENTER_OPERATOR_NAME"
                    value={name}
                    required={!isLogin}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    style={{ paddingRight:'16px' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label-cyber" style={{ color:focused==='email'?cyan:isDark?'rgba(0,255,247,0.35)':'rgba(0,100,180,0.5)' }}>
                  ◈ Neural ID (Email)
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:cyan, opacity:focused==='email'?1:0.3, pointerEvents:'none' }}>@</span>
                  <input
                    className="cyber-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="ID@NEURAL.NET"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    style={{ paddingRight:'16px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-cyber" style={{ color:focused==='password'?cyan:isDark?'rgba(0,255,247,0.35)':'rgba(0,100,180,0.5)' }}>
                  ◈ Access Key
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:cyan, opacity:focused==='password'?1:0.3, pointerEvents:'none' }}>⬡</span>
                  <input
                    className="cyber-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ color:showPassword ? cyan : isDark?'rgba(0,255,247,0.4)':'rgba(0,100,180,0.4)' }}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password — login only */}
              {isLogin && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', userSelect:'none' }}>
                    <div className="remember-checkbox">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                      />
                      <span className="remember-checkmark"/>
                    </div>
                    <span style={{ fontSize:'10px', letterSpacing:'2px', color:rememberMe?cyan:isDark?'rgba(0,255,247,0.4)':'rgba(0,100,180,0.5)', textTransform:'uppercase', transition:'color 0.3s', fontWeight:rememberMe?'700':'400' }}>
                      Remember Me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'9px', letterSpacing:'1px', color:isDark?'rgba(0,255,247,0.4)':'rgba(0,100,180,0.5)', fontFamily:"'Courier New',monospace", textTransform:'uppercase', textDecoration:'underline', textDecorationColor:isDark?'rgba(0,255,247,0.2)':'rgba(0,100,180,0.2)', padding:0 }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button type="submit" disabled={loading} className="cyber-btn" style={{ marginTop:'4px' }}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                    <span style={{ width:'16px', height:'16px', border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin 0.6s linear infinite' }}/>
                    AUTHENTICATING...
                  </span>
                ) : (isLogin ? '⚡ INITIATE ACCESS' : '◈ CREATE PROFILE')}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0 16px', position:'relative', zIndex:1 }}>
            <div style={{ flex:1, height:'1px', background:`linear-gradient(90deg,transparent,${cyan}20)` }}/>
            <span style={{ fontSize:'9px', letterSpacing:'3px', color:isDark?'rgba(0,255,247,0.2)':'rgba(0,100,180,0.25)' }}>◈◈◈</span>
            <div style={{ flex:1, height:'1px', background:`linear-gradient(90deg,${cyan}20,transparent)` }}/>
          </div>

          <p style={{ textAlign:'center', fontSize:'10px', letterSpacing:'1px', color:isDark?'rgba(0,255,247,0.25)':'rgba(0,100,180,0.35)', margin:0, textTransform:'uppercase', position:'relative', zIndex:1 }}>
            {isLogin ? 'No profile? ' : 'Have access? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'10px', fontWeight:'700', letterSpacing:'2px', color:purple, textDecoration:'underline', fontFamily:"'Courier New',monospace", textTransform:'uppercase' }}>
              {isLogin ? '[ REGISTER ]' : '[ LOGIN ]'}
            </button>
          </p>
        </div>

        {/* Bottom security badges */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px', padding:'0 4px' }}>
          {[
            { label:'JWT',     color:green  },
            { label:'AES-256', color:cyan   },
            { label:'TLS-1.3', color:purple },
            { label:'SHAP-XAI',color:pink   },
          ].map((t,i) => (
            <span key={i} style={{ fontSize:'9px', letterSpacing:'2px', color:t.color, opacity:0.5, display:'flex', alignItems:'center', gap:'4px' }}>
              <span style={{ width:'4px', height:'4px', borderRadius:'50%', background:t.color, display:'inline-block' }}/>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
