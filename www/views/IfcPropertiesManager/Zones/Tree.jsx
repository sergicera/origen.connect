import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Paper,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import { flattenTree, rebuildTreeFromZones } from "./flattenedTreeUtils";

const displayName = {
  IFCPROJECT: "Projet (IFCPROJECT)",
  IFCSITE: "Site (IFCSITE)",
  ETAPE: "Etape",
  IFCBUILDING: "Bâtiment (IFCBUILDING)",
  IFCBUILDINGSTOREY: "Etage (IFCBUILDINGSTOREY)",
  PROGRAMME: "Programme",
  ENTITEE: "Entitée",
  LOCAL: "Local",
  IFCSPACE: "Zone (IFCSPACE)",
};

// Map entity types to chip colors
const entityColors = {
  IFCPROJECT: "primary",
  IFCSITE: "secondary",
  ETAPE: "info",
  IFCBUILDING: "warning",
  IFCBUILDINGSTOREY: "success",
  PROGRAMME: "default",
  ENTITEE: "default",
  LOCAL: "info",
  IFCSPACE: "error",
};

export default function TreeList({
  zonesList,
  selectedZoneExpressId,
  setSelectedZoneExpressId,
  highlightByID,
}) {
  const theme = useTheme();

  const [expandedIds, setExpandedIds] = useState(new Set());

  const tree = useMemo(
    () => (zonesList?.length > 0 ? rebuildTreeFromZones(zonesList) : []),
    [zonesList]
  );

  // Calculate all node IDs for initial expansion
  const allIds = useMemo(() => {
    const ids = new Set();
    const collectIds = (nodes) => {
      nodes.forEach((node) => {
        ids.add(node.id);
        if (node.children) collectIds(node.children);
      });
    };
    if (tree.length) collectIds(tree);
    return ids;
  }, [tree]);

  // Initialize expandedIds to all IDs when tree changes
  useEffect(() => {
    setExpandedIds(allIds);
  }, [allIds]);

  // Memoize the flattened items based on tree and expandedIds
  const items = useMemo(
    () => (tree.length ? flattenTree(tree, expandedIds) : []),
    [tree, expandedIds]
  );

  // Toggle expanded state
  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedIds);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const handleItemClick = (item) => {
    if (item.entity === "IFCSPACE") {
      highlightByID({
        expressID: item.expressId,
        modelID: item.modelId,
        relations: JSON.stringify(item.relations),
      });
      setSelectedZoneExpressId(item.expressId);
    }
  };

  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        my: 1
      }}
    >
      <List dense sx={{ width: "100%", p: 0 }}>
        {items.map((item) => {
          const isSelected = item.entity === "IFCSPACE" && item.expressId === selectedZoneExpressId;
          
          return (
            <Box key={item.id} sx={{ paddingLeft: item.depth * 2 }}>
              <ListItem
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  cursor: item.entity === "IFCSPACE" ? "pointer" : "default",
                  py: 0.5,
                  px: 1,
                  backgroundColor: isSelected 
                    ? alpha(theme.palette.warning.light, 0.15)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected 
                      ? alpha(theme.palette.warning.light, 0.2)
                      : alpha(theme.palette.action.hover, 0.1),
                  },
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => handleItemClick(item)}
              >
                {item.hasChildren ? (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(item.id);
                    }}
                    size="small"
                    sx={{ 
                      mr: 1, 
                      color: theme.palette.text.secondary,
                      transform: expandedIds.has(item.id) ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    {expandedIds.has(item.id) ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </IconButton>
                ) : item.entity === "IFCSPACE" ? (
                  <IconButton
                    size="small"
                    sx={{
                      mr: 1,
                      color: isSelected 
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                    }}
                  >
                    <i
                      className="fa-thin fa-cube fa-xs"
                      style={{ fontSize: "1rem" }}
                    />
                  </IconButton>
                ) : (
                  <Box sx={{ width: 40, ml: 0.5, mr: 1, display: 'flex', justifyContent: 'center' }}>
                    {expandedIds.has(item.id) ? (
                      <FolderOpenIcon fontSize="small" color="action" />
                    ) : (
                      <FolderIcon fontSize="small" color="action" />
                    )}
                  </Box>
                )}
                
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isSelected ? 'medium' : 'regular',
                        color: isSelected ? theme.palette.text.primary : theme.palette.text.secondary
                      }}
                    >
                      {displayName[item.entity]}
                    </Typography>
                  }
                />
                
                <Chip
                  label={item.name}
                  size="small"
                  color={entityColors[item.entity] || "default"}
                  variant={isSelected ? "filled" : "outlined"}
                  sx={{ 
                    ml: 'auto',
                    maxWidth: '40%',
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }
                  }}
                />
              </ListItem>
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}
