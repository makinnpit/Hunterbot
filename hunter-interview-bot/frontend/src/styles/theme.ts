import { createTheme } from '@mui/material/styles';

// Custom color palette
const colors = {
  primary: {
    main: '#f97316', // Orange from button
    light: '#fb923c',
    dark: '#ea580c',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1f2937', // Dark grey from navbar
    light: '#4b5563',
    dark: '#111827',
    contrastText: '#ffffff',
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
    default: '#ffffff', // White background
    paper: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white for papers
  },
  text: {
    primary: '#1f2937', // Dark grey for main text
    secondary: '#6b7280', // Light grey for secondary text
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
  fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (max-width: 600px)': {
      fontSize: '2rem',
    },
  },
  h2: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.3,
    '@media (max-width: 600px)': {
      fontSize: '1.75rem',
    },
  },
  h3: {
    fontSize: '2rem',
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
    fontWeight: 400,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 400,
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
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    fontSize: '0.875rem',
  },
};

// Custom components
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 20px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ea580c', // Darker orange on hover
        },
      },
      outlined: {
        borderColor: '#d1d5db',
        color: '#1f2937',
        '&:hover': {
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.05)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: 'none',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          color: '#1f2937',
          '& fieldset': {
            borderColor: '#d1d5db',
          },
          '&:hover fieldset': {
            borderColor: '#f97316',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f97316',
            boxShadow: '0 0 6px rgba(249, 115, 22, 0.2)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#6b7280',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#f97316',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
        color: '#1f2937',
        '&:hover': {
          backgroundColor: '#e5e7eb',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        '&.MuiAlert-standardSuccess': {
          backgroundColor: '#f0fdf4',
          color: '#15803d',
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
    borderRadius: 8,
  },
  spacing: 8,
});

export default theme;