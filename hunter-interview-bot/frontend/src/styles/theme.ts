import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#3b82f6', // Neon blue from App.css
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#e2e8f0',
  },
  secondary: {
    main: '#9333ea', // Neon purple from App.css
    light: '#a855f7',
    dark: '#7e22ce',
    contrastText: '#e2e8f0',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  background: {
    default: '#0a0f24', // Dark navy from App.css
    paper: 'rgba(15, 23, 42, 0.95)', // Semi-transparent dark from App.css
  },
  text: {
    primary: '#e2e8f0', // Light text from App.css
    secondary: '#94a3b8', // Muted text from App.css
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Custom typography
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (max-width: 600px)': {
      fontSize: '2rem',
    },
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
    '@media (max-width: 600px)': {
      fontSize: '1.75rem',
    },
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    '@media (max-width: 600px)': {
      fontSize: '1.5rem',
    },
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width: 600px)': {
      fontSize: '1.25rem',
    },
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width: 600px)': {
      fontSize: '1.125rem',
    },
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width: 600px)': {
      fontSize: '0.875rem',
    },
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
};

// Custom components
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
        },
      },
      outlined: {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        '&:hover': {
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          color: '#e2e8f0',
          '& fieldset': {
            borderColor: 'rgba(59, 130, 246, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: '#3b82f6',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.2)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#94a3b8',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#3b82f6',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        color: '#e2e8f0',
        '&:hover': {
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
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
    borderRadius: 8,
  },
  spacing: 8,
});

export default theme;