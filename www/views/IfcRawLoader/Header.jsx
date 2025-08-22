import React, { useState } from "react";
import PropTypes from "prop-types";

import {
  Box,
  Container,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import AccountTreeIcon from "@mui/icons-material/AccountTree";

export default function Header({
  children,
  taskName,
  actions = null,
}) {

  return (
    <Container maxWidth={false} disableGutters>
      {/* Current task */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              backgroundColor: "transparent",
              py: 0,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: (theme) => theme.palette.text.secondary,
                fontWeight: "bold",
                display: "flex",
            alignItems: "center",
            gap: 1,
            m: 0,
              }}
            >
              {/* <CalculateIcon fontSize="large"/> */}
              {taskName}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {actions}
            </Box>
          </Box>
        </Box>

      {children}
    </Container>
  );
}

Header.propTypes = {
  children: PropTypes.node,
  taskName: PropTypes.string,
  showTask: PropTypes.bool,
  actions: PropTypes.node,
};
