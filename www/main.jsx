import { useMemo, useState, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme/darkTheme";
import { lightTheme } from "./theme/lightTheme";

import { ContextProvider } from "./store/context-provider";
import { CoreContextProvider } from "@/core/CoreContextProvider";

import App from "./app";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Create ThemeContext to manage theme state across the app
import { createContext } from "react";
export const ThemeContext = createContext({
  darkMode: true,
  toggleTheme: () => {},
});

function Root() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  const themeContextValue = useMemo(
    () => ({
      darkMode,
      toggleTheme,
    }),
    [darkMode]
  );

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              body: {
                backgroundColor: theme.palette.background.default,
              },
            }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ContextProvider>
              <CoreContextProvider>
                <Routes>
                  <Route path="/*" element={<App />} />
                </Routes>
              </CoreContextProvider>
            </ContextProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </HashRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
