import { createTheme } from "@mui/material/styles";
import { baseTheme } from "./baseTheme";

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      light: "rgba(6, 125, 117, 1)",
      main: "rgba(8, 168, 157, 1)",
      dark: "rgba(58, 219, 208, 1)",
    },
    secondary: {
      light: "rgba(182, 44, 54, 1)",
      main: "rgba(232, 77, 88, 1)",
      dark: "rgba(240, 121, 130, 1)",
    },
    background: {
      default: "rgba(15, 18, 20, 1)",
      paper: "rgba(17, 23, 29, 1)",
    },
    text: {
      primary: "rgba(179, 179, 179, 1)",
      secondary: "rgba(161, 161, 161, 1)",
      dimmed: "rgba(135, 135, 135, 1)",
      disabled: "rgba(255, 255, 255, 0.38)",
    },
    divider: "rgba(46, 46, 46, 1)",
    success: {
      main: "rgba(102, 187, 106, 1)",
    },
    error: {
      main: "rgba(239, 83, 80, 1)",
    },
    warning: {
      main: "rgba(255, 167, 38, 1)",
    },
    info: {
      main: "rgba(41, 182, 246, 1)",
    },
  },
  components: {
   MuiToggleButton: {
     styleOverrides: {
       root: ({ theme }) => ({
         color: theme.palette.primary.main,
         '&.Mui-selected': {
           color: theme.palette.primary.main,
         },
       }),
     },
   },
   MuiIconButton: {
     styleOverrides: {
       root: ({ theme }) => ({
         color: theme.palette.primary.main,
       }),
     },
   },
 },
});
