import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { signOut, signInWithPopup, OAuthProvider } from "firebase/auth";

import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

// MUI
import { ThemeContext } from "./main";
import { useTheme } from "@mui/material/styles";

import {
  AppBar,
  Box,
  Button,
  Drawer,
  CircularProgress,
  Avatar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Login as LoginIcon } from "@mui/icons-material";

// Hooks
import { useAppContext, auth } from "./store/context-provider";
import { useFirebaseIdToken } from "./hooks/useInitFirebaseIdToken";
import { useResizableDrawer } from "./hooks/useResizableDrawer";

// Routes
import { routes } from "./routes";
import Protected from "./shared/Protected";

// Teams specific (removed)

// Components
import DrawerMenu from "./components/drawer/DrawerMenu";
import ColorModeToggle from "./shared/ColorModeToggle";
import AppLogo from "./shared/AppLogo";

const MIN_DRAWER_WIDTH = 90;
const DEFAULT_DRAWER_WIDTH = 350;
const MAX_DRAWER_WIDTH = 600;

export default function App() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [, dispatch] = useAppContext();
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  /* **************************************************************************
   *                                                                          *
   *                             AUTHENTICATION                               *
   *                                                                          *
   * **************************************************************************
   *
   * Here is how we determine the current role and mode of the user that will be in the app:
   *
   * 1. FIREBASE AUTHENTICATION
   * 3. FINAL APP-WIDE ACCESS CONTROL DATA
   * 4. LOGIN & LOGOUT HANDLERS
   */

  /**
   * 1. FIREBASE AUTHENTICATION
   *
   * We use the useFirebaseIdToken hook to get the Firebase ID Token,
   * this is used to authenticate the user with Firebase, and to set the user's role and mode.
   */

  const firebaseIdToken = useFirebaseIdToken();

  /**
   * 4b. MICROSOFT LOGIN HANDLER (Firebase-only)
   *
   * Initiates Microsoft sign-in via Firebase. We no longer persist or use a Graph access token.
   */

  const handleMicrosoftLogin = async () => {
    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.addScope("offline_access");
      provider.addScope("openid");
      provider.addScope("profile");
      provider.addScope("email");
      provider.addScope("User.Read");

      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Microsoft Login Error:", error);
    }
  };

  /**
   * 4a. LOGOUT HANDLER
   *
   * Handles the user logout process.
   * This function signs the user out from Firebase authentication,
   * removes 'kogoApiToken' and 'graphToken' from localStorage,
   * and dispatches 'kogo-api-token-changed' and 'kogo-graph-token-changed' events with null details.
   * This function is intended to be used when the application is not running inside Microsoft Teams.
   */

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("kogoApiToken");
        window.dispatchEvent(
          new CustomEvent("kogo-api-token-changed", { detail: null })
        );
      })
      .catch((error) => {
        console.error("Logout Error:", error);
      });
  };

  /* **************************************************************************
   *                                                                          *
   *                              UI & NAVIGATION                             *
   *                                                                          *
   * **************************************************************************
   *
   * 1. MODULE STATE
   * 2. LOAD MODULE FROM LOCAL STORAGE
   * 1. DRAWER RESIZABLE
   * 2. MODULE SELECTION
   * 3. MODULE NAVIGATION
   */

  /**
   * 1. DRAWER RESIZABLE
   *
   * The drawer is resizable, and can be collapsed to a smaller width,
   * this is done with the useResizableDrawer hook.
   */

  const {
    isCollapsed,
    isResizing,
    sidebarRef,
    effectiveDrawerWidth,
    toggleCollapse,
    startResizing,
  } = useResizableDrawer(
    DEFAULT_DRAWER_WIDTH,
    MIN_DRAWER_WIDTH,
    MAX_DRAWER_WIDTH,
    false // Never start collapsed in fm mode
  );

  const handleThemeChange = () => {
    toggleTheme();
  };

  /* **************************************************************************
   *                                                                          *
   *                                FILE SYSTEM                               *
   *                                                                          *
   * **************************************************************************
   *
   * Here is where we initialise the file system.
   *
   * 1. GET ALL PROJECTS
   */

  // TODO: Might be the projects should be fetched form the database,
  // and then find the corresponding project files in the file system
  useEffect(() => {
    if (firebaseIdToken)
      dispatch({
        type: "FILE_SYSTEM_INIT",
        payload: { token: firebaseIdToken },
      });
  }, [firebaseIdToken]);

  /* **************************************************************************
   *                                                                          *
   *                                RENDER                                    *
   *                                                                          *
   * **************************************************************************
   *
   * 1. STATE CHECKS FOR RENDERING
   * 2. RENDER
   */

  // Loading state and authentication state
  const isLoading = false;
  const isAuthenticated = !!firebaseIdToken;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Application...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position={isAuthenticated ? "fixed" : "absolute"}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: "none",
          transition: theme.transitions.create(
            ["width", "margin", "top", "left", "transform", "opacity"],
            {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }
          ),
          ...(isAuthenticated
            ? {}
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 820,
                opacity: 0.95,
              }),
        }}
      >
        <Toolbar
          sx={{
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
            ...(!isAuthenticated && { justifyContent: "center" }),
          }}
        >
          {isAuthenticated ? (
            <>
              <AppLogo toggleCollapse={toggleCollapse} />
              <Box sx={{ flexGrow: 1 }} />
              <ColorModeToggle
                darkMode={darkMode}
                onChange={handleThemeChange}
              />
              <Tooltip title="Logout">
                <IconButton sx={{ ml: 1 }} onClick={handleLogout}>
                  <i className="fa-sharp fa-thin fa-right-from-bracket" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              size="small"
              sx={{ color: "#08A89D" }}
              onClick={handleMicrosoftLogin}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {isAuthenticated && (
        <Drawer
          variant="permanent"
          ref={sidebarRef}
          sx={{
            width: effectiveDrawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              pt: 2,
              width: effectiveDrawerWidth,
              boxSizing: "border-box",
              backgroundColor: theme.palette.background.default,
              overflow: "visible",
              borderRight: "none",
              position: "fixed",
              top: theme.mixins.toolbar.minHeight ?? 64,
              height: `calc(100vh - ${theme.mixins.toolbar.minHeight ?? 64}px)`,
              display: "flex",
              flexDirection: "column",
              transition: isResizing
                ? "none"
                : theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
            },
          }}
        >
          {!isCollapsed && (
            <Box
              onMouseDown={startResizing}
              sx={{
                width: "8px",
                height: "100%",
                position: "absolute",
                top: 0,
                right: "-4px",
                cursor: "col-resize",
                backgroundColor: isResizing
                  ? theme.palette.primary.main
                  : "transparent",
                zIndex: 1,
                "&:hover": {
                  backgroundColor: !isResizing
                    ? theme.palette.action.hover
                    : theme.palette.primary.main,
                },
                transition: "background-color 0.2s ease-in-out",
              }}
            />
          )}
          <DrawerMenu isCollapsed={isCollapsed} isResizing={isResizing} />
        </Drawer>
      )}

      {isAuthenticated && (
        <Box
          component="main"
          sx={{
            borderLeft: `1px solid ${theme.palette.divider}`,
            position: "absolute",
            top: theme.mixins.toolbar.minHeight ?? 64,
            left: `${effectiveDrawerWidth}px`,
            right: 0,
            bottom: 0,
            overflowY: "auto",
            pr: 3,
            pl: 3,
            pt: 3,
            transition: isResizing
              ? "none"
              : theme.transitions.create(["left"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              boxShadow: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.action.disabled,
              borderRadius: "2px",
            },
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.palette.action.disabled} transparent`,
          }}
        >
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Protected>
                    <route.component {...route.props} />
                  </Protected>
                }
              />
            ))}

            <Route
              path="*"
              element={<Navigate to="/loader/ifc/file" replace />}
            />
          </Routes>
        </Box>
      )}
    </Box>
  );
}
