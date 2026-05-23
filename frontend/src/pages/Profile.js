import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [mounted,   setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [error,     setError]     = useState('');

  const [profile, setProfile] = useState({
    name:             localStorage.getItem('user_name') || '',
    email:            '',
    telegram_chat_id: '',
    role:             localStorage.getItem('user_role') || 'user',
  });

  const [passwords, setPasswords] = useState({
    current:  '',
    new:      '',
    confirm:  '',
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new:     false,
    confirm: false,
  });

  const cyan   = '#00fff7';
  const purple = '#b537f2';
  const green  = '#00ff96';
  const pink   = '#ff2d9b';
  const amber  = '#ffb800';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    // Fetch profile
    axios.get('https://loaniq-backend-6dmd.onrender.com/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(prev => ({
        ...prev,
        email:            res.data.email,
        telegram_chat_id: res.data.telegram_chat_id || '',
        role:             res.data.role,
      }));
    }).catch(() => {});

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
    const chars = '01PROFILESETTINGS';
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,8,0.07)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillStyle = `rgba(181,55,242,${Math.random()*0.07+0.02})`;
        ctx.fillText(char, i*13, y*13);
        if (y*13>H && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://loaniq-backend-6dmd.onrender.com/profile', {
        name:             profile.name,
        telegram_chat_id: profile.telegram_chat_id || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('user_name', profile.name);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMsg(''); setError('');
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://loaniq-backend-6dmd.onrender.com/profile/password', {
        current_password: passwords.current,
        new_password:     passwords.new,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Password changed successfully!');
      setPasswords({ current:'', new:'', confirm:'' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (focused) => ({
    width:'100%', padding:'12px 16px',
    background:'rgba(0,255,247,0.03)',
    border:`1px solid ${focused?cyan:'rgba(0,255,247,0.2)'}`,
    borderRadius:'4px', color:cyan,
    fontSize:'13px', fontFamily:"'Courier New',monospace",
    outline:'none', transition:'all 0.3s',
    boxSizing:'border-box', letterSpacing:'1px',
  });

  const tabs = [
    { id:'profile',  label:'PROFILE INFO' },
    { id:'password', label:'CHANGE PASSWORD' },
    { id:'security', label:'SECURITY' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#000308', fontFamily:"'Courier New',monospace", position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes cornerBlink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes borderScan{0%{border-color:rgba(181,55,242,0.2)}50%{border-color:rgba(0,255,247,0.2)}100%{border-color:rgba(181,55,242,0.2)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanH{0%{top:-2px}100%{top:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .profile-card{background:rgba(0,3,8,0.85);border:1px solid rgba(181,55,242,0.15);border-radius:4px;padding:24px;position:relative;overflow:hidden;margin-bottom:16px;}
        .profile-scan{position:absolute;left:0;right:0;height:1px;animation:scanH 4s linear infinite;pointer-events:none;}
        .tab-btn{padding:10px 20px;background:transparent;border:none;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;text-transform:uppercase;transition:all 0.3s;border-bottom:2px solid transparent;}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.35 }}/>

      {[
        { top:16,    left:16,  borderTop:`2px solid ${purple}`,  borderLeft:`2px solid ${purple}`  },
        { top:16,    right:16, borderTop:`2px solid ${cyan}`,    borderRight:`2px solid ${cyan}`   },
        { bottom:16, left:16,  borderBottom:`2px solid ${cyan}`, borderLeft:`2px solid ${cyan}`    },
        { bottom:16, right:16, borderBottom:`2px solid ${purple}`,borderRight:`2px solid ${purple}`},
      ].map((s,i) => (
        <div key={i} style={{ position:'fixed', width:32, height:32, zIndex:1, animation:`cornerBlink ${1.5+i*0.3}s ease-in-out infinite`, ...s }}/>
      ))}

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'60px 20px 40px', position:'relative', zIndex:10, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'8px' }}>
            {/* Avatar */}
            <div style={{ width:'56px', height:'56px', borderRadius:'8px', background:`linear-gradient(135deg,${purple}30,${cyan}20)`, border:`2px solid ${profile.role==='admin'?purple:cyan}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'900', color:profile.role==='admin'?purple:cyan, textShadow:`0 0 10px ${profile.role==='admin'?purple:cyan}`, flexShrink:0 }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize:'22px', fontWeight:'900', color:purple, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:`0 0 20px ${purple}60` }}>{profile.name}</h1>
              <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                <span style={{ fontSize:'9px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>{profile.email}</span>
                {profile.role === 'admin' && (
                  <span style={{ padding:'2px 8px', background:`${purple}20`, border:`1px solid ${purple}40`, borderRadius:'2px', fontSize:'9px', color:purple, letterSpacing:'1px' }}>ADMIN</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ height:'1px', background:`linear-gradient(90deg,${purple}60,${cyan}40,transparent)` }}/>
        </div>

        {/* Messages */}
        {msg && (
          <div style={{ padding:'12px 16px', marginBottom:'16px', background:'rgba(0,255,150,0.08)', border:'1px solid rgba(0,255,150,0.3)', borderRadius:'4px', fontSize:'11px', color:green, letterSpacing:'1px', animation:'fadeUp 0.3s ease', display:'flex', alignItems:'center', gap:'8px' }}>
            <span>✅</span> {msg}
          </div>
        )}
        {error && (
          <div style={{ padding:'12px 16px', marginBottom:'16px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px', fontSize:'11px', color:pink, letterSpacing:'1px', animation:'fadeUp 0.3s ease', display:'flex', alignItems:'center', gap:'8px' }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(181,55,242,0.15)', marginBottom:'24px' }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => { setActiveTab(t.id); setMsg(''); setError(''); }}
              style={{ color:activeTab===t.id?purple:'rgba(255,255,255,0.3)', borderBottomColor:activeTab===t.id?purple:'transparent', textShadow:activeTab===t.id?`0 0 8px ${purple}`:'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="profile-card">
              <div className="profile-scan" style={{ background:`linear-gradient(90deg,transparent,${purple}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginBottom:'20px', textTransform:'uppercase' }}>◈ PERSONAL INFORMATION</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {/* Name */}
                <div>
                  <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(181,55,242,0.6)', marginBottom:'8px', textTransform:'uppercase' }}>◈ Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name:e.target.value }))}
                    style={inputStyle(false)} placeholder="Your full name"/>
                </div>

                {/* Email (read only) */}
                <div>
                  <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(181,55,242,0.6)', marginBottom:'8px', textTransform:'uppercase' }}>◈ Email Address <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'9px' }}>(cannot change)</span></label>
                  <input type="email" value={profile.email} readOnly
                    style={{ ...inputStyle(false), opacity:0.5, cursor:'not-allowed' }}/>
                </div>

                {/* Telegram */}
                <div>
                  <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(181,55,242,0.6)', marginBottom:'8px', textTransform:'uppercase' }}>◈ Telegram Chat ID <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'9px' }}>(optional)</span></label>
                  <input type="text" value={profile.telegram_chat_id} onChange={e => setProfile(p => ({ ...p, telegram_chat_id:e.target.value }))}
                    style={inputStyle(false)} placeholder="123456789"/>
                  <p style={{ margin:'6px 0 0', fontSize:'9px', color:'rgba(0,255,247,0.3)', letterSpacing:'1px' }}>
                    Get your ID: Open Telegram → message @userinfobot
                  </p>
                </div>

                <button onClick={handleSaveProfile} disabled={saving} style={{
                  padding:'14px', background:saving?'rgba(181,55,242,0.1)':`linear-gradient(135deg,${purple},${cyan})`,
                  border:'none', borderRadius:'4px', fontSize:'12px', fontWeight:'700',
                  letterSpacing:'3px', color:saving?`${purple}60`:'#000', cursor:saving?'not-allowed':'pointer',
                  fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s',
                }}>
                  {saving ? '⚡ SAVING...' : '⚡ SAVE CHANGES'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="profile-card">
              <div className="profile-scan" style={{ background:`linear-gradient(90deg,transparent,${cyan}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginBottom:'20px', textTransform:'uppercase' }}>◈ CHANGE PASSWORD</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {[
                  { key:'current', label:'Current Password',  ph:'Enter current password'  },
                  { key:'new',     label:'New Password',      ph:'Enter new password'       },
                  { key:'confirm', label:'Confirm Password',  ph:'Confirm new password'     },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(0,255,247,0.5)', marginBottom:'8px', textTransform:'uppercase' }}>◈ {f.label}</label>
                    <div style={{ position:'relative' }}>
                      <input
                        type={showPass[f.key]?'text':'password'}
                        value={passwords[f.key]}
                        onChange={e => setPasswords(p => ({ ...p, [f.key]:e.target.value }))}
                        placeholder={f.ph}
                        style={{ ...inputStyle(false), paddingRight:'44px' }}
                      />
                      <button type="button" onClick={() => setShowPass(p => ({ ...p, [f.key]:!p[f.key] }))} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:showPass[f.key]?cyan:'rgba(0,255,247,0.4)', fontSize:'16px', padding:'4px' }}>
                        {showPass[f.key] ? '👁' : '🔒'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Password strength */}
                {passwords.new && (
                  <div>
                    <div style={{ fontSize:'9px', letterSpacing:'1px', color:'rgba(255,255,255,0.3)', marginBottom:'6px' }}>PASSWORD STRENGTH</div>
                    <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:'2px', transition:'width 0.3s ease',
                        width: passwords.new.length<6?'20%':passwords.new.length<10?'50%':passwords.new.length<14?'80%':'100%',
                        background: passwords.new.length<6?pink:passwords.new.length<10?amber:passwords.new.length<14?cyan:green,
                      }}/>
                    </div>
                    <span style={{ fontSize:'9px', color:passwords.new.length<6?pink:passwords.new.length<10?amber:passwords.new.length<14?cyan:green, letterSpacing:'1px', marginTop:'4px', display:'block' }}>
                      {passwords.new.length<6?'WEAK':passwords.new.length<10?'FAIR':passwords.new.length<14?'STRONG':'VERY STRONG'}
                    </span>
                  </div>
                )}

                <button onClick={handleChangePassword} disabled={saving||!passwords.current||!passwords.new||!passwords.confirm} style={{
                  padding:'14px',
                  background:saving||!passwords.current?'rgba(0,255,247,0.1)':`linear-gradient(135deg,${cyan},${purple})`,
                  border:'none', borderRadius:'4px', fontSize:'12px', fontWeight:'700',
                  letterSpacing:'3px', color:(saving||!passwords.current)?`${cyan}40`:'#000',
                  cursor:(saving||!passwords.current)?'not-allowed':'pointer',
                  fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s',
                }}>
                  {saving ? '⚡ UPDATING...' : '🔐 UPDATE PASSWORD'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ animation:'fadeUp 0.4s ease both' }}>
            <div className="profile-card">
              <div className="profile-scan" style={{ background:`linear-gradient(90deg,transparent,${green}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginBottom:'20px', textTransform:'uppercase' }}>◈ SECURITY OVERVIEW</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { label:'Account Status',    value:'ACTIVE',           color:green,  icon:'✅' },
                  { label:'Role',              value:profile.role.toUpperCase(), color:profile.role==='admin'?purple:cyan, icon:'👤' },
                  { label:'JWT Auth',          value:'ENABLED',          color:green,  icon:'🔐' },
                  { label:'Email',             value:profile.email||'—', color:cyan,   icon:'📧' },
                  { label:'Telegram',          value:profile.telegram_chat_id?'CONNECTED':'NOT CONNECTED', color:profile.telegram_chat_id?green:amber, icon:'✈️' },
                  { label:'Password Reset',    value:'VIA EMAIL',        color:amber,  icon:'🔑' },
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'4px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'16px' }}>{s.icon}</span>
                      <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.5)', letterSpacing:'1px' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:'11px', fontWeight:'700', color:s.color, letterSpacing:'1px', textShadow:`0 0 6px ${s.color}` }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="profile-card" style={{ border:'1px solid rgba(255,45,155,0.2)' }}>
              <div className="profile-scan" style={{ background:`linear-gradient(90deg,transparent,${pink}40,transparent)` }}/>
              <div style={{ fontSize:'10px', letterSpacing:'2px', color:pink, marginBottom:'16px', textTransform:'uppercase' }}>⚠ DANGER ZONE</div>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{
                width:'100%', padding:'12px', background:'rgba(255,45,155,0.08)',
                border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px',
                fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:pink,
                cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase', transition:'all 0.3s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,45,155,0.15)'; e.currentTarget.style.boxShadow=`0 0 15px ${pink}30`; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,45,155,0.08)'; e.currentTarget.style.boxShadow='none'; }}>
                🚪 LOGOUT FROM ALL DEVICES
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

