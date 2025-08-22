import React from "react";
import PropTypes from "prop-types";
import {
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  ListItemText,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const NestedList = ({
  items,
  currentId,
  label,
  getItemId,
  getItemDisplayName,
  onSelect,
  renderChildren,
}) => {
  const theme = useTheme();

  if (!items || items.length === 0) return null;

  return (
    <List disablePadding dense>
      {items.map((item) => {
        const itemId = getItemId(item);
        const isSelected = currentId === itemId;

        return (
          <React.Fragment key={itemId}>
            <ListItemButton
              selected={isSelected}
              onClick={() => onSelect(item)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "transparent"
                },
              }}
            >
              <ListItemIcon>
                <Typography
                  sx={{
                    color: isSelected ? theme.palette.background.paper : "grey",
                    backgroundColor: isSelected ? "#08A89D" : "transparent",
                    borderRadius: "3px",
                    border: `1px solid ${theme.palette.divider}`,
                    px: 1,
                    mr: 2,
                  }}
                >
                  {label}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={getItemDisplayName(item)}
                primaryTypographyProps={{
                  sx: {
                    color: isSelected ? "inherit" : "grey",
                  },
                }}
              />
            </ListItemButton>
            {/* Only render children if this item is selected */}
            {isSelected && renderChildren && (
              <Box sx={{ pl: 4 }}>{renderChildren(item)}</Box>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );
};

NestedList.propTypes = {
  items: PropTypes.array.isRequired,
  currentId: PropTypes.string,
  label: PropTypes.string.isRequired,
  getItemId: PropTypes.func.isRequired,
  getItemDisplayName: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  renderChildren: PropTypes.func,
};
