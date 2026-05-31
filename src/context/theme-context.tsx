'use client';

import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext<'dark' | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
  }, []);

  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return { theme: context };
}
