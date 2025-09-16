import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeService } from '../services/themeService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    // Initialize theme from localStorage
    const savedScheme = themeService.getColorScheme();
    setColorScheme(savedScheme);
  }, []);

  const toggleColorScheme = () => {
    const newScheme = themeService.toggleColorScheme();
    setColorScheme(newScheme);
  };

  const setColorSchemeValue = (scheme) => {
    themeService.setColorScheme(scheme);
    setColorScheme(scheme);
  };

  const value = {
    colorScheme,
    toggleColorScheme,
    setColorScheme: setColorSchemeValue,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 