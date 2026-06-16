import { createTheme, ThemeOptions } from '@mui/material/styles';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const FONT_FAMILY = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';

const palette = {
  primary: {
    main: '#0078D4',       // Microsoft Fluent blue
    light: '#2899F5',
    dark: '#005A9E',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6264A7',       // Teams purple
    light: '#8B8CC8',
    dark: '#464775',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#107C10',
    light: '#57A300',
    dark: '#0B5C0B',
  },
  warning: {
    main: '#D83B01',
    light: '#EA6A18',
    dark: '#A02B00',
  },
  error: {
    main: '#A4262C',
    light: '#C72B30',
    dark: '#771B1E',
  },
  info: {
    main: '#0078D4',
    light: '#2899F5',
    dark: '#005A9E',
  },
};

// ─── Light Theme ─────────────────────────────────────────────────────────────
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#F3F2F1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#201F1E',
      secondary: '#605E5C',
    },
    divider: '#EDEBE9',
  },
  typography: {
    fontFamily: FONT_FAMILY,
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#605E5C' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: 6 },
  shadows: [
    'none',
    '0px 1px 4px rgba(0,0,0,0.08)',
    '0px 2px 8px rgba(0,0,0,0.10)',
    '0px 4px 16px rgba(0,0,0,0.12)',
    '0px 8px 24px rgba(0,0,0,0.14)',
    ...Array(20).fill('none'),
  ] as ThemeOptions['shadows'],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: FONT_FAMILY,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#F3F2F1' },
          '&::-webkit-scrollbar-thumb': { background: '#C8C6C4', borderRadius: '3px' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '7px 16px',
          fontWeight: 600,
          transition: 'all 0.15s ease',
        },
        contained: {
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,120,212,0.35)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #EDEBE9',
          borderRadius: 8,
          transition: 'box-shadow 0.2s ease',
          '&:hover': { boxShadow: '0px 4px 16px rgba(0,0,0,0.10)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 4 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#F3F2F1',
            color: '#201F1E',
            fontSize: '0.8125rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
  },
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    mode: 'dark',
    ...palette,
    background: {
      default: '#1B1A19',
      paper: '#252423',
    },
    text: {
      primary: '#F3F2F1',
      secondary: '#A19F9D',
    },
    divider: '#3B3A39',
  },
  components: {
    ...lightThemeOptions.components,
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #3B3A39',
          borderRadius: 8,
          transition: 'box-shadow 0.2s ease',
          '&:hover': { boxShadow: '0px 4px 16px rgba(0,0,0,0.35)' },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#1B1A19',
            color: '#F3F2F1',
            fontSize: '0.8125rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
export default lightTheme;
