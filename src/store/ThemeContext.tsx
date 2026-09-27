import { createContext, useContext, useEffect, useMemo } from 'react';
import { applyMotionPref } from '../services/motionPref';

type Theme = 'dark';
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({
  theme: 'dark', setTheme: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    applyMotionPref();
  }, []);
  const value = useMemo(() => ({ theme: 'dark' as Theme, setTheme: () => {}, toggle: () => {} }), []);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
