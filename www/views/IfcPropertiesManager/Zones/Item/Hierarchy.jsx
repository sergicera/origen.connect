import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ItemHierarchy({
  zoneItem,
  setZonesList,
  hierarchyOptions,
}) {
  const handleChange = (level, value) => {
    setZonesList((prevList) => {
      return prevList.map((node) => {
        // If current node is the target item, update its hierarchy
        if (node.expressId === zoneItem.expressId) {
          return {
            ...node,
            hierarchy: {
              ...node.hierarchy,
              [level]: value,
            },
          };
        }
        // Otherwise, return the node as is
        return node;
      });
    });
  };

  const handleEdit = (e, option) => {
    e.stopPropagation();
    // Add your edit logic here
  };

  const handleDelete = (e, option) => {
    e.stopPropagation();
    // Add your delete logic here
  };

  const handleAdd = (e, level) => {
    e.stopPropagation();
    // Add your add logic here
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      {Object.keys(hierarchyOptions).map((level) => (
        <Box
          key={level}
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
        >
          <IconButton sx={{ color: "text.disabled" }} aria-label="settings">
            <SettingsIcon />
          </IconButton>
          <TextField
            variant="standard"
            size="small"
            select
            value={zoneItem.hierarchy[level] || ""}
            label={level}
            onChange={(e) => handleChange(level, e.target.value)}
            disabled={hierarchyOptions[level].length === 0}
            sx={{ typography: "body2", width: "100%" }}
            SelectProps={{
              // This ensures only the value shows in the input
              renderValue: (value) => value,
            }}
          >
            {hierarchyOptions[level].map((option) => (
              <MenuItem key={option} value={option}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pr: 2,
                  }}
                >
                  <span>{option}</span>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleEdit(e, option)}
                      sx={{ p: 0, color: "text.secondary" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(e, option)}
                      sx={{ p: 0, color: "text.secondary" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </MenuItem>
            ))}

            {/* Add Button at the end */}
            {hierarchyOptions[level].length > 0 && (
              <MenuItem onClick={(e) => handleAdd(e, level)}>
                <Button
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    color: "primary.main",
                    fontWeight: "medium",
                  }}
                >
                  Add New
                </Button>
              </MenuItem>
            )}

            {hierarchyOptions[level].length === 0 && (
              <MenuItem disabled>No options available</MenuItem>
            )}
          </TextField>
        </Box>
      ))}
    </Box>
  );
}
