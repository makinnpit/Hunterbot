import { createTheme } from '@mui/material/styles';

// Vibrant modern color palette
const colors = {
  primary: {
    main: '#6366F1', // Indigo
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#EC4899', // Pink
    light: '#F472B6',
    dark: '#DB2777',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // Red
    light: '#F87171',
    dark: '#DC2626',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#FBBF24',
    dark: '#D97706',
  },
  info: {
    main: '#3B82F6', // Blue
    light: '#60A5FA',
    dark: '#2563EB',
  },
  success: {
    main: '#10B981', // Emerald
    light: '#34D399',
    dark: '#059669',
  },
  background: {
    default: '#F9FAFB', // Light gray with hint of blue
    paper: '#FFFFFF',
  },
  text: {
    primary: '#111827', // Near black
    secondary: '#4B5563',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Dark mode colors
const darkColors = {
  ...colors,
  primary: {
    ...colors.primary,
    main: '#818CF8', // Lighter indigo for dark mode
  },
  secondary: {
    ...colors.secondary,
    main: '#F472B6', // Lighter pink for dark mode
  },
  background: {
    default: '#111827', // Deep blue-gray for dark mode
    paper: '#1F2937',
  },
  text: {
    primary: '#F9FAFB', // Near white
    secondary: '#D1D5DB',
  },
};

// Animation durations and easings
const animation = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195,
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Modern typography
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.0075em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0.01071em',
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.02857em',
  },
};

// Enhanced modern component styles
const components = {
  MuiCssBaseline: {
    styleOverrides: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-in-out;
      }
      .animate-slide-up {
        animation: slideUp 0.5s ease-out;
      }
      .animate-pulse {
        animation: pulse 1.5s infinite;
      }
      .hover-scale {
        transition: transform 0.3s ease;
      }
      .hover-scale:hover {
        transform: scale(1.03);
      }
    `,
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '10px 20px',
        transition: 'all 0.3s ease',
      },
      contained: {
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.12)',
        '&:hover': {
          boxShadow: '0 6px 15px 0 rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      outlined: {
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
          background: 'rgba(99, 102, 241, 0.04)',
        },
      },
      text: {
        '&:hover': {
          background: 'rgba(99, 102, 241, 0.04)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.08)',
        },
      },
      elevation1: {
        boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
      },
      elevation2: {
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
      },
      elevation3: {
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.06)',
      },
      elevation4: {
        boxShadow: '0 8px 20px 0 rgba(0, 0, 0, 0.07)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'all 0.3s ease',
          '& fieldset': {
            borderWidth: '1.5px',
            transition: 'border-color 0.3s ease',
          },
          '&:hover fieldset': {
            borderWidth: '1.5px',
            borderColor: '#6366F1',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
          },
        },
        '& .MuiInputLabel-root': {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
        },
      },
      clickable: {
          '&:hover': {
          transform: 'translateY(-1px)',
          },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '16px 20px',
        boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.05)',
        animation: 'slideUp 0.5s ease-out',
      },
      standardSuccess: {
        borderLeft: '4px solid #10B981',
      },
      standardError: {
        borderLeft: '4px solid #EF4444',
      },
      standardWarning: {
        borderLeft: '4px solid #F59E0B',
      },
      standardInfo: {
        borderLeft: '4px solid #3B82F6',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 46,
        height: 26,
        padding: 0,
        margin: 8,
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: '#6366F1',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          width: 22,
          height: 22,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
        },
        '& .MuiSwitch-track': {
          opacity: 0.3,
          borderRadius: 13,
          backgroundColor: '#9CA3AF',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        '& .MuiTableRow-root': {
          transition: 'background-color 0.3s ease',
        },
        '& .MuiTableRow-root:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        '& .MuiTab-root': {
          transition: 'all 0.3s ease',
        },
        '& .MuiTabs-indicator': {
          height: '3px',
          borderRadius: '1.5px',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.3s ease',
        borderRadius: 8,
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
        },
      },
    },
  },
};

// Create and export the theme
const theme = createTheme({
  palette: colors,
  typography,
  components,
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: animation.shortest,
      shorter: animation.shorter,
      short: animation.short,
      standard: animation.standard,
      complex: animation.complex,
      enteringScreen: animation.enteringScreen,
      leavingScreen: animation.leavingScreen,
    },
    easing: animation.easing,
  },
});

// Create and export the dark theme
const darkTheme = createTheme({
  palette: darkColors,
  typography,
  components,
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: animation.shortest,
      shorter: animation.shorter,
      short: animation.short,
      standard: animation.standard,
      complex: animation.complex,
      enteringScreen: animation.enteringScreen,
      leavingScreen: animation.leavingScreen,
    },
    easing: animation.easing,
  },
});

export { theme, darkTheme };