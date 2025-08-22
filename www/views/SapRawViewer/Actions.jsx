import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { SettingsOutlined } from "@mui/icons-material";

export default function Actions({ onToggleFiles }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        alignSelf: "flex-start",
      }}
    >
      {/* Settings */}
      <Tooltip title="Fichiers">
        <IconButton onClick={onToggleFiles}>
          <SettingsOutlined fontSize="small" sx={{ color: "#08A89D" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
