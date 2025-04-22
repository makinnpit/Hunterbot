import { createTheme } from '@mui/material/styles';

// Simplified futuristic color palette
const colors = {
  primary: {
    main: '#00D4FF', // Soft neon cyan for primary actions
    light: '#4DEEFF',
    dark: '#00A3CC',
    contrastText: '#0A0A0A', // Near-black for contrast
  },
  secondary: {
    main: '#A1BFFA', // Soft lavender for secondary actions
    light: '#C3D7FF',
    dark: '#7F9CF5',
    contrastText: '#0A0A0A',
  },
  error: {
    main: '#FF5252', // Soft neon red for errors
    light: '#FF8A80',
    dark: '#C41C1C',
  },
  warning: {
    main: '#FFAB00', // Soft neon orange for warnings
    light: '#FFD149',
    dark: '#C77C00',
  },
  info: {
    main: '#00D4FF', // Same as primary for consistency
    light: '#4DEEFF',
    dark: '#00A3CC',
  },
  success: {
    main: '#00E676', // Soft neon green for success
    light: '#5EFF9B',
    dark: '#00B34C',
  },
  background: {
    default: '#0A0A0A', // Solid near-black background
    paper: '#151515', // Dark gray for paper surfaces
  },
  text: {
    primary: '#E0E0E0', // Light gray for primary text
    secondary: '#A0A0A0', // Mid-gray for secondary text
  },
  grey: {
    50: '#1A1A1A',
    100: '#2A2A2A',
    200: '#3A3A3A',
    300: '#4A4A4A',
    400: '#5A5A5A',
    500: '#6A6A6A',
    600: '#7A7A7A',
    700: '#8A8A8A',
    800: '#9A9A9A',
    900: '#B0B0B0',
  },
};

// Simplified typography for a futuristic look
const typography = {
  fontFamily: '"Inter", sans-serif', // Clean, modern font
  h1: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
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
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    textTransform: 'none' as 'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined,
    fontWeight: 500,
    fontSize: '0.875rem',
  },
};

// Simplified components with a futuristic yet minimalistic aesthetic
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '8px 16px',
        transition: 'all 0.3s ease',
      },
      contained: {
        backgroundColor: '#00D4FF', // Solid neon cyan
        color: '#0A0A0A',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: '#4DEEFF',
          boxShadow: '0 0 8px rgba(0, 212, 255, 0.5)', // Subtle glow on hover
        },
      },
      outlined: {
        borderColor: 'rgba(0, 212, 255, 0.3)', // Subtle cyan border
        color: '#00D4FF',
        '&:hover': {
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#151515',
        border: '1px solid rgba(0, 212, 255, 0.2)', // Minimal cyan border
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(0, 212, 255, 0.4)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: '#151515',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: 'none',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6,
          backgroundColor: '#1A1A1A',
          color: '#E0E0E0',
          '& fieldset': {
            borderColor: 'rgba(0, 212, 255, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 212, 255, 0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#00D4FF',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#A0A0A0',
          fontSize: '0.875rem',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#00D4FF',
        },
        '& .MuiInputBase-input': {
          color: '#E0E0E0',
          fontSize: '0.875rem',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 212, 255, 0.2)',
          borderColor: 'rgba(0, 212, 255, 0.4)',
        },
        '& .MuiChip-deleteIcon': {
          color: '#A0A0A0',
          '&:hover': {
            color: '#FF5252',
          },
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(255, 82, 82, 0.2)',
      },
      standardSuccess: {
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(0, 230, 118, 0.2)',
        '& .MuiAlert-icon': {
          color: '#00E676',
        },
      },
      standardError: {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(255, 82, 82, 0.2)',
        '& .MuiAlert-icon': {
          color: '#FF5252',
        },
      },
      standardWarning: {
        backgroundColor: 'rgba(255, 171, 0, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(255, 171, 0, 0.2)',
        '& .MuiAlert-icon': {
          color: '#FFAB00',
        },
      },
      standardInfo: {
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        color: '#E0E0E0',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        '& .MuiAlert-icon': {
          color: '#00D4FF',
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
    borderRadius: 6,
  },
  spacing: 8,
});

export default theme;