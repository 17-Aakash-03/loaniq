import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') !== 'light'
  );

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.style.background  = isDark ? '#000308' : '#f0f4f8';
    document.body.style.color       = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,20,40,0.85)';
    document.body.style.transition  = 'all 0.3s ease';
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Inject global CSS override
    let styleEl = document.getElementById('theme-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-override';
      document.head.appendChild(styleEl);
    }
    if (!isDark) {
      styleEl.innerHTML = `
        /* LIGHT MODE GLOBAL OVERRIDES */
        div[style*="background: rgb(0, 3, 8)"],
        div[style*="background: rgba(0, 3, 8"],
        div[style*="background:#000308"],
        div[style*="background: #000308"] {
          background: #f0f4f8 !important;
        }
        div[style*="background: rgba(0, 3, 8, 0.85)"],
        div[style*="background:rgba(0,3,8,0.85)"] {
          background: rgba(255,255,255,0.95) !important;
        }
        canvas {
          opacity: 0.1 !important;
        }
      `;
    } else {
      styleEl.innerHTML = '';
    }
  }, [isDark]);

  const cyan   = isDark ? '#00fff7' : '#0055cc';
  const purple = isDark ? '#b537f2' : '#7722ee';
  const green  = isDark ? '#00ff96' : '#009944';
  const pink   = isDark ? '#ff2d9b' : '#cc0066';
  const amber  = isDark ? '#ffb800' : '#cc7700';
  const teal   = isDark ? '#00d4c8' : '#007788';

  const theme = {
    isDark,
    toggleTheme,
    cyan,
    purple,
    green,
    pink,
    amber,
    teal,
    bg:          isDark ? '#000308'                    : '#f0f4f8',
    bgCard:      isDark ? 'rgba(0,3,8,0.85)'           : 'rgba(255,255,255,0.95)',
    bgCardSolid: isDark ? '#050a10'                    : '#ffffff',
    bgCardHover: isDark ? 'rgba(0,255,247,0.04)'       : 'rgba(0,100,180,0.04)',
    bgInput:     isDark ? 'rgba(0,255,247,0.03)'       : 'rgba(0,100,180,0.04)',
    border:      isDark ? 'rgba(0,255,247,0.15)'       : 'rgba(0,100,180,0.2)',
    borderHover: isDark ? 'rgba(0,255,247,0.4)'        : 'rgba(0,100,180,0.5)',
    text:        isDark ? 'rgba(255,255,255,0.85)'     : 'rgba(0,20,40,0.85)',
    textMuted:   isDark ? 'rgba(255,255,255,0.45)'     : 'rgba(0,20,40,0.5)',
    textDim:     isDark ? 'rgba(255,255,255,0.2)'      : 'rgba(0,20,40,0.25)',
    textLabel:   isDark ? 'rgba(255,255,255,0.3)'      : 'rgba(0,20,40,0.4)',
    navBg:       isDark ? 'rgba(0,3,8,0.97)'           : 'rgba(255,255,255,0.97)',
    navBorder:   isDark ? 'rgba(0,255,247,0.12)'       : 'rgba(0,100,180,0.15)',
    inputBg:     isDark ? 'rgba(0,255,247,0.03)'       : 'rgba(0,100,180,0.04)',
    inputBorder: isDark ? 'rgba(0,255,247,0.2)'        : 'rgba(0,100,180,0.25)',
    inputColor:  isDark ? '#00fff7'                    : '#003388',
    scanColor:   isDark ? 'rgba(0,255,247,0.4)'        : 'rgba(0,100,180,0.3)',
    shadow:      isDark ? '0 4px 20px rgba(0,0,0,0.5)': '0 4px 20px rgba(0,100,180,0.1)',
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{
        background: theme.bg,
        minHeight:  '100vh',
        transition: 'all 0.3s ease',
        color:      theme.text,
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
