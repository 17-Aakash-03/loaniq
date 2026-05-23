import React from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  useNavigate, useLocation
} from 'react-router-dom';
import Login           from './pages/Login';
import Application     from './pages/Application';
import Results         from './pages/Results';
import History         from './pages/History';
import Admin           from './pages/Admin';
import EDA             from './pages/EDA';
import ModelComparison from './pages/ModelComparison';
import LoanCalculator  from './pages/LoanCalculator';
import Profile         from './pages/Profile';
import ForgotPassword  from './pages/ForgotPassword';
import BatchScoring    from './pages/BatchScoring';
import { useLanguage } from './context/LanguageContext';
import { useTheme }    from './context/ThemeContext';

function NavBar() {
  const navigate                = useNavigate();
  const location                = useLocation();
  const { lang, toggleLang, t } = useLanguage();
  const theme                   = useTheme();
  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('user_name');
  const userRole = localStorage.getItem('user_role');
  const isMobile = window.innerWidth < 768;

  const hiddenPaths = ['/', '/forgot-password', '/reset-password'];
  if (!token || hiddenPaths.includes(location.pathname)) return null;

  const cyan   = '#00fff7';
  const purple = '#b537f2';
  const pink   = '#ff2d9b';
  const green  = '#00ff96';
  const teal   = '#00d4c8';
  const amber  = '#ffb800';

  const navLinks = [
    { label: t('apply'),   path: '/apply'   },
    { label: t('history'), path: '/history' },
    { label: t('eda'),     path: '/eda'     },
    { label: t('models'),  path: '/models'  },
    { label: t('calc'),    path: '/calc'    },
    { label: 'BATCH',      path: '/batch'   },
    ...(userRole === 'admin' ? [{ label: t('admin'), path: '/admin' }] : []),
  ];

  const getLinkColor = (path, active) => {
    if (!active) return theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,20,40,0.5)';
    if (path === '/admin')  return purple;
    if (path === '/eda')    return teal;
    if (path === '/models') return green;
    if (path === '/calc')   return amber;
    if (path === '/batch')  return pink;
    return cyan;
  };

  const getActiveBg = (path) => {
    if (path === '/admin')  return `${purple}15`;
    if (path === '/eda')    return `${teal}15`;
    if (path === '/models') return `${green}15`;
    if (path === '/calc')   return `${amber}15`;
    if (path === '/batch')  return `${pink}15`;
    return `${cyan}15`;
  };

  return (
    <nav style={{
      background:     theme.isDark
        ? 'rgba(0,3,8,0.97)'
        : 'rgba(255,255,255,0.97)',
      borderBottom:   theme.isDark
        ? '1px solid rgba(0,255,247,0.12)'
        : '1px solid rgba(0,100,180,0.15)',
      padding:        isMobile ? '8px 12px' : '0 24px',
      display:        'flex',
      alignItems:     'center',
      flexWrap:       isMobile ? 'wrap' : 'nowrap',
      gap:            isMobile ? '6px' : '0',
      minHeight:      '48px',
      position:       'sticky',
      top:            0,
      zIndex:         100,
      backdropFilter: 'blur(12px)',
      transition:     'all 0.3s ease',
      boxShadow:      theme.isDark
        ? '0 2px 20px rgba(0,0,0,0.5)'
        : '0 2px 20px rgba(0,100,180,0.1)',
    }}>

      {/* Logo */}
      <span
        onClick={() => navigate('/apply')}
        style={{
          fontFamily:    "'Courier New',monospace",
          fontWeight:    '900',
          fontSize:      isMobile ? '11px' : '14px',
          color:         theme.isDark ? cyan : '#0055aa',
          letterSpacing: isMobile ? '1px' : '3px',
          textShadow:    theme.isDark ? '0 0 10px #00fff780' : 'none',
          cursor:        'pointer',
          textTransform: 'uppercase',
          marginRight:   isMobile ? '8px' : '24px',
          flexShrink:    0,
          transition:    'all 0.3s ease',
        }}>
        {isMobile ? 'ML.AI' : 'LOANIQ'}
      </span>

      {/* Nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:'2px', flex:1, flexWrap:'wrap' }}>
        {navLinks.map(item => {
          const active = location.pathname === item.path;
          const color  = getLinkColor(item.path, active);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background:    active ? getActiveBg(item.path) : 'transparent',
                border:        active
                  ? `1px solid ${color}40`
                  : '1px solid transparent',
                borderRadius:  '3px',
                padding:       isMobile ? '4px 7px' : '6px 12px',
                cursor:        'pointer',
                fontFamily:    "'Courier New',monospace",
                fontSize:      isMobile ? '8px' : '10px',
                fontWeight:    '700',
                letterSpacing: isMobile ? '0.5px' : '1.5px',
                textTransform: 'uppercase',
                color:         color,
                textShadow:    active && theme.isDark ? `0 0 8px ${color}` : 'none',
                transition:    'all 0.25s ease',
                whiteSpace:    'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color      = theme.isDark ? cyan : '#0055aa';
                  e.currentTarget.style.background = theme.isDark
                    ? 'rgba(0,255,247,0.06)'
                    : 'rgba(0,100,180,0.08)';
                  e.currentTarget.style.borderColor = theme.isDark
                    ? 'rgba(0,255,247,0.15)'
                    : 'rgba(0,100,180,0.15)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color       = getLinkColor(item.path, false);
                  e.currentTarget.style.background  = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:isMobile?'4px':'8px', flexShrink:0 }}>

        {/* Theme toggle */}
        <button
          onClick={theme.toggleTheme}
          title={theme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            padding:      isMobile ? '4px 7px' : '5px 11px',
            background:   theme.isDark
              ? 'rgba(255,184,0,0.1)'
              : 'rgba(0,80,180,0.08)',
            border:       theme.isDark
              ? '1px solid rgba(255,184,0,0.35)'
              : '1px solid rgba(0,80,180,0.2)',
            borderRadius: '4px',
            cursor:       'pointer',
            fontSize:     isMobile ? '13px' : '15px',
            transition:   'all 0.3s ease',
            lineHeight:   1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = theme.isDark
              ? '0 0 10px rgba(255,184,0,0.3)'
              : '0 0 10px rgba(0,80,180,0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'scale(1)';
          }}>
          {theme.isDark ? '☀️' : '🌙'}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          style={{
            padding:      isMobile ? '4px 6px' : '5px 10px',
            background:   lang === 'hi'
              ? 'rgba(255,184,0,0.12)'
              : theme.isDark ? 'rgba(0,255,247,0.06)' : 'rgba(0,80,180,0.06)',
            border:       `1px solid ${lang==='hi'
              ? 'rgba(255,184,0,0.35)'
              : theme.isDark ? 'rgba(0,255,247,0.25)' : 'rgba(0,80,180,0.2)'}`,
            borderRadius: '4px',
            cursor:       'pointer',
            fontFamily:   "'Courier New',monospace",
            fontSize:     isMobile ? '8px' : '10px',
            fontWeight:   '700',
            letterSpacing:'0.5px',
            color:        lang === 'hi'
              ? amber
              : theme.isDark ? cyan : '#0055aa',
            transition:   'all 0.3s ease',
            whiteSpace:   'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 8px ${lang==='hi'
              ? 'rgba(255,184,0,0.3)'
              : theme.isDark ? 'rgba(0,255,247,0.2)' : 'rgba(0,80,180,0.15)'}`;
          }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
          {lang === 'hi' ? '🇬🇧 ENG' : '🇮🇳 हिंदी'}
        </button>

        {/* Avatar + name */}
        <div
          onClick={() => navigate('/profile')}
          style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
          <div style={{
            width:          isMobile ? '24px' : '28px',
            height:         isMobile ? '24px' : '28px',
            borderRadius:   '4px',
            background:     theme.isDark
              ? 'linear-gradient(135deg,rgba(0,255,247,0.15),rgba(181,55,242,0.15))'
              : 'linear-gradient(135deg,rgba(0,100,180,0.15),rgba(120,50,200,0.15))',
            border:         `1px solid ${userRole==='admin'
              ? 'rgba(181,55,242,0.5)'
              : theme.isDark ? 'rgba(0,255,247,0.25)' : 'rgba(0,100,180,0.3)'}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       isMobile ? '10px' : '11px',
            fontWeight:     '900',
            color:          userRole==='admin'
              ? purple
              : theme.isDark ? cyan : '#0055aa',
            fontFamily:     "'Courier New',monospace",
            flexShrink:     0,
            transition:     'all 0.3s ease',
          }}>
            {(userName||'U').charAt(0).toUpperCase()}
          </div>
          {!isMobile && (
            <div>
              <div style={{
                fontSize:      '10px',
                fontWeight:    '700',
                color:         theme.isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,20,40,0.8)',
                fontFamily:    "'Courier New',monospace",
                letterSpacing: '0.5px',
                whiteSpace:    'nowrap',
                transition:    'color 0.3s ease',
              }}>
                {userName}
              </div>
              {userRole === 'admin' && (
                <div style={{
                  fontSize:      '8px',
                  color:         purple,
                  letterSpacing: '2px',
                  fontFamily:    "'Courier New',monospace",
                }}>
                  ADMIN
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => { localStorage.clear(); navigate('/'); }}
          style={{
            background:    'rgba(255,45,155,0.08)',
            border:        '1px solid rgba(255,45,155,0.25)',
            borderRadius:  '3px',
            padding:       isMobile ? '5px 7px' : '6px 12px',
            cursor:        'pointer',
            fontFamily:    "'Courier New',monospace",
            fontSize:      isMobile ? '8px' : '10px',
            fontWeight:    '700',
            letterSpacing: isMobile ? '0.5px' : '1.5px',
            color:         pink,
            textTransform: 'uppercase',
            transition:    'all 0.3s ease',
            whiteSpace:    'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,45,155,0.18)';
            e.currentTarget.style.boxShadow  = '0 0 12px rgba(255,45,155,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,45,155,0.08)';
            e.currentTarget.style.boxShadow  = 'none';
          }}>
          {t('logout')}
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/"                element={<Login />}           />
        <Route path="/apply"           element={<Application />}     />
        <Route path="/results"         element={<Results />}         />
        <Route path="/history"         element={<History />}         />
        <Route path="/admin"           element={<Admin />}           />
        <Route path="/eda"             element={<EDA />}             />
        <Route path="/models"          element={<ModelComparison />} />
        <Route path="/calc"            element={<LoanCalculator />}  />
        <Route path="/profile"         element={<Profile />}         />
        <Route path="/forgot-password" element={<ForgotPassword />}  />
        <Route path="/reset-password"  element={<ForgotPassword />}  />
        <Route path="/batch"           element={<BatchScoring />}    />
      </Routes>
    </Router>
  );
}

export default App;
