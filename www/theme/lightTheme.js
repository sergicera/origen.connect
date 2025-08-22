import { createTheme } from '@mui/material/styles';
import { baseTheme } from "./baseTheme";
import { green, blue } from '@mui/material/colors';

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: 'rgba(0, 0, 0, 1)',
      light: 'rgba(51, 51, 51, 1)',
      dark: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: 'rgba(255, 255, 255, 1)',
      light: 'rgba(255, 255, 255, 0.87)',
      dark: 'rgba(224, 224, 224, 1)',
    },
    background: {
      default: 'rgba(248, 246, 242, 1)',
      paper: 'rgba(255, 255, 255, 1)',
    },
    text: {
      primary: 'rgba(0, 0, 0, 1)', 
      secondary: 'rgba(85, 85, 85, 1)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    action: {
      selected: 'rgba(224,218,204,1)', 
      hover: 'rgba(224,218,204,0.5)',   
      // active: baseTheme.palette.action.active,
      // disabled: baseTheme.palette.action.disabled,
      // disabledBackground: baseTheme.palette.action.disabledBackground,
    },
  },
});

