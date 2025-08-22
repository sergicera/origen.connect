import { createTheme } from "@mui/material/styles";

// Base theme with shared properties across all themes
// This contains all common configuration and is extended by specific themes
export const baseTheme = createTheme({
  shape: {
    borderRadius: 3,
  },
  fontFamily: 'Tiempos, Arial, sans-serif',
  typography: {
    h1: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "20px",
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "18px",
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "16px",
      fontWeight: 500,
    },
    h4: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "14px",
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "14px",
    },
    subtitle2: {
      fontFamily: 'Styrene, Arial, sans-serif',
      fontSize: "12px",
    },
    body1: {
      fontSize: "14px",
    },
    body2: {
      fontSize: "12px",
    },
    button: {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "none",
    },
    caption: {
      fontSize: "10px",
    },
    overline: {
      fontSize: "10px",
      textTransform: "none",
    },
  },
  mixins: {
    toolbar: {
      minHeight: 80,
    },
  }
});
