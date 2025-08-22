import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Tooltip,
  Paper,
  Chip,
  alpha,
} from "@mui/material";
import { Handle, Position, useStoreApi } from "reactflow";
import { useState } from "react";

// Custom node for the app
const AppNode = ({ data }) => {
  // Get the current edges to check which inputs are already connected
  const store = useStoreApi();
  const [hoveredHandle, setHoveredHandle] = useState(null);
  const theme = useTheme();

  // Get all current edges
  const edges = store.getState().edges;

  // Get connected input handles
  const connectedHandles = edges.map((edge) => edge.targetHandle);

  // Get the active source node when dragging a connection
  const connectionStartNodeId = store.getState().connectionStartHandle
    ? store.getState().connectionStartHandle.nodeId
    : null;

  // Determine if a file is allowed for the target input
  const isFileAllowedForInput = (fileId, inputId) => {
    const input = data.inputs[inputId];
    if (!input) return false;

    const allowedContents = input.allowedContents || [];
    // If no allowed files specified, all files are allowed
    if (allowedContents.length === 0) return true;

    return allowedContents.includes(fileId);
  };

  // Handle mouse events for visual feedback
  const handleMouseEnter = (inputId) => {
    setHoveredHandle(inputId);
  };

  const handleMouseLeave = () => {
    setHoveredHandle(null);
  };

  // Determine handle style based on connection state and constraints
  const getHandleStyle = (inputId) => {
    const isConnected = connectedHandles.includes(`input-${inputId}`);
    const isHovered = hoveredHandle === inputId;
    const isActiveConnection = connectionStartNodeId !== null;
    const isAllowed =
      isActiveConnection &&
      isFileAllowedForInput(connectionStartNodeId, inputId);

    // Base style
    const style = {
      background: theme.palette.grey[500],
      left: -6,
      top: "50%",
      transform: "translateY(-50%)",
      width: 12,
      height: 12,
      borderRadius: "50%",
      transition: "all 0.2s ease",
      border: `2px solid ${theme.palette.background.paper}`,
    };

    // Already connected - show in a different color
    if (isConnected) {
      style.background = theme.palette.success.main;
      style.boxShadow = `0 0 8px ${alpha(theme.palette.success.main, 0.6)}`;
    }

    // When actively trying to connect
    if (isActiveConnection && isHovered) {
      if (isAllowed) {
        style.background = theme.palette.primary.main;
        style.width = 14;
        style.height = 14;
        style.boxShadow = `0 0 12px ${alpha(theme.palette.primary.main, 0.7)}`;
      } else {
        style.background = theme.palette.error.main;
        style.width = 14;
        style.height = 14;
        style.boxShadow = `0 0 12px ${alpha(theme.palette.error.main, 0.7)}`;
      }
    }

    return style;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        border: 1,
        borderColor: theme.palette.primary.main,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        minWidth: 200,
        boxShadow: theme.shadows[3],
        position: "relative",
        transition: "all 0.2s ease",
        background: `linear-gradient(to bottom, ${alpha(
          theme.palette.primary.light,
          0.1
        )}, ${alpha(theme.palette.background.paper, 0.95)})`,
      }}
    >
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          p: 1,
          borderRadius: 1,
          mb: 1.5,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: theme.palette.primary.contrastText }}
        >
          {data.displayName || "App"}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, pt: 1 }}>
        {Object.entries(data.inputs || {}).map(([inputId, input]) => {
          const isConnected = connectedHandles.includes(`input-${inputId}`);
          const tooltipTitle = isConnected
            ? `${input.description || ""} (Connected)`
            : input.description || "";

          return (
            <Box
              key={inputId}
              sx={{
                mb: 2,
                position: "relative",
                display: "flex",
                alignItems: "center",
                height: 36,
                pl: 2,
                bgcolor: isConnected
                  ? alpha(theme.palette.success.light, 0.15)
                  : "transparent",
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: isConnected
                    ? alpha(theme.palette.success.light, 0.2)
                    : alpha(theme.palette.primary.light, 0.1),
                },
              }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${inputId}`}
                style={getHandleStyle(inputId)}
                onMouseEnter={() => handleMouseEnter(inputId)}
                onMouseLeave={handleMouseLeave}
              />
              <Tooltip title={tooltipTitle} arrow placement="left">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isConnected ? "bold" : "normal",
                      color: isConnected
                        ? theme.palette.success.dark
                        : theme.palette.text.primary,
                    }}
                  >
                    {input.displayName || inputId}
                  </Typography>

                  {isConnected && (
                    <Chip
                      size="small"
                      label="Connected"
                      color="success"
                      variant="outlined"
                      sx={{
                        ml: "auto",
                        height: 20,
                        fontSize: "0.65rem",
                      }}
                    />
                  )}

                  {!isConnected &&
                    input.allowedContents &&
                    input.allowedContents.length > 0 && (
                      <Tooltip
                        title={`Allowed files: ${input.allowedContents.join(
                          ", "
                        )}`}
                        placement="top"
                      >
                        <Chip
                          size="small"
                          label={`${input.allowedContents.length} allowed`}
                          color="info"
                          variant="outlined"
                          sx={{
                            ml: "auto",
                            height: 20,
                            fontSize: "0.65rem",
                          }}
                        />
                      </Tooltip>
                    )}
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

AppNode.propTypes = {
  data: PropTypes.shape({
    displayName: PropTypes.string,
    inputs: PropTypes.objectOf(
      PropTypes.shape({
        displayName: PropTypes.string,
        description: PropTypes.string,
        allowedContents: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }).isRequired,
};

export default AppNode; 