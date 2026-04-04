import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'bigplate_theme';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  input: string;
  inputPlaceholder: string;
}

export const lightTheme: ThemeColors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1D1D1D',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  input: '#F9FAFB',
  inputPlaceholder: '#9CA3AF',
};

export const darkTheme: ThemeColors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  text: '#F5F5F5',
  textSecondary: '#9CA3AF',
  border: '#2D2D2D',
  input: '#2D2D2D',
  inputPlaceholder: '#6B7280',
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? darkTheme : lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
