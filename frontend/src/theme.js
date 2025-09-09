import { createTheme } from '@mui/material/styles';

// Create a theme instance for a premium, modern UI.
const theme = createTheme({
  palette: {
    primary: {
      main: '#5E35B1', 
      light: '#7E57C2',
      dark: '#4527A0',
    },
    secondary: {
      main: '#03A9F4', 
    },
    background: {
      default: '#f4f6f8', 
      paper: '#ffffff',
    },
    text: {
        primary: '#212121',
        secondary: '#424242',
    },
    // Custom colors for gradients and accents
    custom: {
        gradient1: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', // Pink/Orange
        gradient2: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', // Blue
        gradient3: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)', // Green
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            }
        }
    },
    MuiCard: {
      styleOverrides: {
          root: {
              borderRadius: 16,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e0e0e0',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
              }
          }
      }
  },
    MuiAppBar: {
        styleOverrides: {
            root: {
                background: 'linear-gradient(45deg, #4527A0 30%, #673AB7 90%)',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            }
        }
    }
  },
});

export default theme;