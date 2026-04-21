'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES } from './i18n';

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('prod-lang');
    if (saved && LANGUAGES[saved]) setLangState(saved);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('prod-lang', l);
    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir  = LANGUAGES[l]?.dir  || 'ltr';
      document.documentElement.lang = l;
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
