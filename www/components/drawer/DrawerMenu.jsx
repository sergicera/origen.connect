import React from "react";

import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

// Navigation
import NavigationItems from "../Navigation";

// Connect
import ImporterItems from "./sections/Importer";

// AI Partner
import { ChatBot } from "@/www/components/AIPartner";

export default function DrawerMenu({
  isCollapsed,
  isResizing,
}) {
  const theme = useTheme();


  return (
    <Box
      sx={{
        display: "flex",
        px: 2,
        pt: 0,
        pb: 2,
        flexDirection: "column",
        flexGrow: 1,
        overflowY: "auto",
        transition: theme.transitions.create("opacity", {
          easing: theme.transitions.easing.sharp,
          duration: isResizing ? 0 : theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Navigation */}
      <NavigationItems
        drawerOpen={!isCollapsed}
        config={{ p: true, e: true, m: true }}
      />

      {/* Connect items */}
      <ImporterItems drawerOpen={!isCollapsed} />

      {/* AI Partner */}
      {!isCollapsed && (
        <ChatBot />
      )}
    </Box>
  );
}
