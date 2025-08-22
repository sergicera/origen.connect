import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { icons } from "../../../assets/icons.jsx";
import {
  Box,
  Typography,
  Paper,
  alpha,
} from "@mui/material";
import { Handle, Position } from "reactflow";

// Custom node for input files
const InputFileNode = ({ data }) => {
  const theme = useTheme();
  const fileData = data.fileData || {};

  // Determine file type from fileName or id
  const getFileType = () => {
    const fileName = fileData.fileName || data.id || "";
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Map file extensions to icon types (only use extensions that exist in the icons object)
    if (extension === 'json' && icons.json) return 'json';
    if (extension === 'ifc' && icons.ifc) return 'ifc';
    if (extension === 'frag' && icons.frag) return 'frag';
    if ((extension === 'yaml' || extension === 'yml') && icons.yaml) return 'yaml';
    if ((extension === 'xlsx' || extension === 'xls') && icons.xlsx) return 'xlsx';
    
    // Default to json or the first available icon
    return 'json';
  };

  const fileType = getFileType();
  const FileIcon = icons[fileType] || null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        minWidth: 200,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.light,
        },
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: fileData.loaded ? theme.palette.success.main : theme.palette.warning.main,
            mr: 1,
          }}
        />
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ color: theme.palette.text.primary }}
        >
          {data.label || "Unnamed File"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", ml: 1, mb: 0.5 }}>
        {FileIcon && (
          <Box sx={{ width: 20, height: 20, mr: 1, display: "flex", alignItems: "center" }}>
            {FileIcon}
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.7rem",
          }}
        >
          {fileData.fileName || data.id}
        </Typography>
      </Box>

      {data.description && (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            mt: 0.5,
            ml: 1,
            fontStyle: "italic",
          }}
        >
          {data.description}
        </Typography>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: theme.palette.primary.main,
          border: `2px solid ${theme.palette.background.paper}`,
          width: 12,
          height: 12,
          right: -6,
        }}
      />
    </Paper>
  );
};

InputFileNode.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    description: PropTypes.string,
    fileData: PropTypes.object,
  }).isRequired,
};

export default InputFileNode; 