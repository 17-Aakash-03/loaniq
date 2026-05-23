import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState('');
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  const cyan   = '#00fff7';
  const purple = '#b537f2';
  const green  = '#00ff96';
  const pink   = '#ff2d9b';

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMsg('');
    try {
      await axios.post(`https://loaniq-backend-6dmd.onrender.com/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setMsg('Reset link sent! Check your email inbox.');
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(''); setMsg('');
    try {
      await axios.post(`https://loaniq-backend-6dmd.onrender.com/auth/reset-password?token=${token}&new_password=${encodeURIComponent(password)}`);
      setMsg('Password reset successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#000308', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Courier New',monospace", padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔐</div>
          <h1 style={{ fontSize:'20px', fontWeight:'900', color:cyan, margin:0, letterSpacing:'4px', textTransform:'uppercase', textShadow:`0 0 20px ${cyan}60` }}>
            {token ? 'RESET PASSWORD' : 'FORGOT PASSWORD'}
          </h1>
          <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.25)', letterSpacing:'2px', margin:'8px 0 0', textTransform:'uppercase' }}>
            LOANIQ SECURITY
          </p>
        </div>

        <div style={{ background:'rgba(0,3,8,0.9)', border:`1px solid ${cyan}30`, borderRadius:'4px', padding:'32px', position:'relative', overflow:'hidden' }}>

          {msg && (
            <div style={{ padding:'12px 16px', marginBottom:'20px', background:'rgba(0,255,150,0.08)', border:'1px solid rgba(0,255,150,0.3)', borderRadius:'4px', fontSize:'11px', color:green, letterSpacing:'1px', display:'flex', alignItems:'center', gap:'8px' }}>
              ✅ {msg}
            </div>
          )}
          {error && (
            <div style={{ padding:'12px 16px', marginBottom:'20px', background:'rgba(255,45,155,0.08)', border:'1px solid rgba(255,45,155,0.3)', borderRadius:'4px', fontSize:'11px', color:pink, letterSpacing:'1px', display:'flex', alignItems:'center', gap:'8px' }}>
              ⚠ {error}
            </div>
          )}

          {!token ? (
            /* Forgot password form */
            done ? (
              <div style={{ textAlign:'center', padding:'20px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>📧</div>
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:'1.8', margin:'0 0 24px' }}>
                  Check your inbox at <span style={{ color:cyan }}>{email}</span>.<br/>
                  Click the reset link in the email.
                </p>
                <button onClick={() => navigate('/')} style={{ padding:'12px 24px', background:'transparent', border:`1px solid ${cyan}40`, borderRadius:'4px', fontSize:'11px', fontWeight:'700', letterSpacing:'2px', color:cyan, cursor:'pointer', fontFamily:"'Courier New',monospace", textTransform:'uppercase' }}>
                  BACK TO LOGIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(0,255,247,0.4)', marginBottom:'8px', textTransform:'uppercase' }}>◈ YOUR EMAIL ADDRESS</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ width:'100%', padding:'13px 16px', background:'rgba(0,255,247,0.03)', border:'1px solid rgba(0,255,247,0.2)', borderRadius:'4px', color:cyan, fontSize:'13px', fontFamily:"'Courier New',monospace", outline:'none', marginBottom:'20px', boxSizing:'border-box', letterSpacing:'1px' }}
                />
                <button type="submit" disabled={loading} style={{
                  width:'100%', padding:'14px', background:`linear-gradient(135deg,${cyan},${purple})`,
                  border:'none', borderRadius:'4px', fontSize:'12px', fontWeight:'700',
                  letterSpacing:'3px', color:'#000', cursor:loading?'not-allowed':'pointer',
                  fontFamily:"'Courier New',monospace", textTransform:'uppercase', opacity:loading?0.6:1,
                }}>
                  {loading ? 'SENDING...' : '📧 SEND RESET LINK'}
                </button>
              </form>
            )
          ) : (
            /* Reset password form */
            <form onSubmit={handleReset}>
              {[
                { label:'New Password',     value:password, setter:setPassword, ph:'Enter new password'    },
                { label:'Confirm Password', value:confirm,  setter:setConfirm,  ph:'Confirm new password'  },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'10px', letterSpacing:'2px', color:'rgba(0,255,247,0.4)', marginBottom:'8px', textTransform:'uppercase' }}>◈ {f.label}</label>
                  <input type="password" required value={f.value} onChange={e => f.setter(e.target.value)}
                    placeholder={f.ph}
                    style={{ width:'100%', padding:'13px 16px', background:'rgba(0,255,247,0.03)', border:'1px solid rgba(0,255,247,0.2)', borderRadius:'4px', color:cyan, fontSize:'13px', fontFamily:"'Courier New',monospace", outline:'none', boxSizing:'border-box', letterSpacing:'1px' }}
                  />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{
                width:'100%', padding:'14px', background:`linear-gradient(135deg,${green},${cyan})`,
                border:'none', borderRadius:'4px', fontSize:'12px', fontWeight:'700',
                letterSpacing:'3px', color:'#000', cursor:loading?'not-allowed':'pointer',
                fontFamily:"'Courier New',monospace", textTransform:'uppercase', marginTop:'8px', opacity:loading?0.6:1,
              }}>
                {loading ? 'RESETTING...' : '🔐 RESET PASSWORD'}
              </button>
            </form>
          )}

          <div style={{ marginTop:'24px', textAlign:'center' }}>
            <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'10px', color:'rgba(0,255,247,0.3)', letterSpacing:'2px', fontFamily:"'Courier New',monospace", textTransform:'uppercase' }}>
              ← BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

