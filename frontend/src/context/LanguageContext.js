import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Navbar
    apply:   'APPLY',
    history: 'HISTORY',
    eda:     'EDA',
    models:  'MODELS',
    admin:   'ADMIN',
    profile: 'PROFILE',
    calc:    'CALCULATOR',
    logout:  'LOGOUT',
    // Login
    login:         'LOGIN',
    register:      'REGISTER',
    email:         'Email',
    password:      'Password',
    name:          'Full Name',
    rememberMe:    'Remember Me',
    signIn:        'INITIATE ACCESS',
    signUp:        'CREATE PROFILE',
    forgotPass:    'Forgot Password?',
    // Apply
    loanApplication: 'LOAN APPLICATION',
    locationStability: 'LOCATION & STABILITY',
    behavioralData:  '12-MONTH BEHAVIORAL DATA',
    socialTrust:     'SOCIAL TRUST GRAPH',
    submit:          'INITIATE CREDIT ANALYSIS',
    // Results
    creditAnalysis:  'CREDIT ANALYSIS REPORT',
    lowRisk:         'LOW RISK',
    mediumRisk:      'MEDIUM RISK',
    highRisk:        'HIGH RISK',
    downloadPDF:     'DOWNLOAD PDF',
    newAnalysis:     'NEW ANALYSIS',
    viewHistory:     'VIEW HISTORY',
    // History
    creditLog:       'CREDIT LOG ARCHIVE',
    newScan:         'NEW SCAN',
    exportCSV:       'EXPORT CSV',
    clearAll:        'CLEAR ALL',
    totalScans:      'TOTAL SCANS',
    avgScore:        'AVG SCORE',
    // Common
    loading:         'LOADING...',
    error:           'ERROR',
    save:            'SAVE',
    cancel:          'CANCEL',
    delete:          'DELETE',
    confirm:         'CONFIRM',
  },
  hi: {
    // Navbar
    apply:   'आवेदन',
    history: 'इतिहास',
    eda:     'डेटा विश्लेषण',
    models:  'मॉडल',
    admin:   'व्यवस्थापक',
    profile: 'प्रोफ़ाइल',
    calc:    'कैलकुलेटर',
    logout:  'लॉगआउट',
    // Login
    login:         'लॉगिन',
    register:      'पंजीकरण',
    email:         'ईमेल',
    password:      'पासवर्ड',
    name:          'पूरा नाम',
    rememberMe:    'मुझे याद रखें',
    signIn:        'प्रवेश करें',
    signUp:        'प्रोफ़ाइल बनाएं',
    forgotPass:    'पासवर्ड भूल गए?',
    // Apply
    loanApplication: 'ऋण आवेदन',
    locationStability: 'स्थान और स्थिरता',
    behavioralData:  '12-महीने का व्यवहार डेटा',
    socialTrust:     'सामाजिक विश्वास ग्राफ',
    submit:          'क्रेडिट विश्लेषण शुरू करें',
    // Results
    creditAnalysis:  'क्रेडिट विश्लेषण रिपोर्ट',
    lowRisk:         'कम जोखिम',
    mediumRisk:      'मध्यम जोखिम',
    highRisk:        'अधिक जोखिम',
    downloadPDF:     'PDF डाउनलोड करें',
    newAnalysis:     'नया विश्लेषण',
    viewHistory:     'इतिहास देखें',
    // History
    creditLog:       'क्रेडिट लॉग संग्रह',
    newScan:         'नया स्कैन',
    exportCSV:       'CSV निर्यात',
    clearAll:        'सब हटाएं',
    totalScans:      'कुल स्कैन',
    avgScore:        'औसत स्कोर',
    // Common
    loading:         'लोड हो रहा है...',
    error:           'त्रुटि',
    save:            'सहेजें',
    cancel:          'रद्द करें',
    delete:          'हटाएं',
    confirm:         'पुष्टि करें',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
