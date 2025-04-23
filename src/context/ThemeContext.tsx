import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme as MuiTheme, createTheme } from '@mui/material/styles';

interface ThemeContextType {
  theme: MuiTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode; theme: MuiTheme }> = ({ children, theme }) => {
  const [currentTheme, setCurrentTheme] = useState<MuiTheme>(theme);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => 
      createTheme({
        ...prevTheme,
        palette: {
          ...prevTheme.palette,
          mode: prevTheme.palette.mode === 'dark' ? 'light' : 'dark',
        },
      })
    );
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 