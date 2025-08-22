import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Collapse,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

// Helper function to initialize the openMap based on initialTreeOpenState
const initializeOpenMap = (items, initialOpen) => {
  let map = {};
  const stack = [...items];
  while (stack.length > 0) {
    const item = stack.pop();
    if (item.children && item.children.length > 0) {
      if (Object.prototype.hasOwnProperty.call(item, "initialToggleOpen")) {
        map[item.id] = item.initialToggleOpen;
      } else {
        map[item.id] = initialOpen;
      }
      item.children.forEach((child) => stack.push(child));
    }
  }
  return map;
};

// Recursive component
function RecursiveNavItems({ items, openMap, toggleItem, navigate, theme }) {
  return items.map((item) => {
    const { id, label, path, icon, children } = item;
    const hasChildren = Array.isArray(children) && children.length > 0;
    const isOpen = !!openMap[id];

    return (
      <React.Fragment key={id}>
        <ListItemButton
          onClick={() =>
            hasChildren ? toggleItem(id) : path && navigate(path)
          }
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  color: hasChildren ? "text.secondary" : "text.disabled",
                }}
              >
                {label}
              </Typography>
            }
          />
          {hasChildren &&
            (isOpen ? (
              <ExpandLess sx={{ color: "text.disabled" }} />
            ) : (
              <ExpandMore sx={{ color: "text.disabled" }} />
            ))}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List
              dense
              sx={{ backgroundColor: theme.palette.background.default }}
            >
              <RecursiveNavItems
                items={children}
                openMap={openMap}
                toggleItem={toggleItem}
                navigate={navigate}
                theme={theme}
              />
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  });
}

export default function MenuItem({
  drawerOpen,
  initialTreeOpenState = true,
  MainIcon,
  mainLabel,
  itemList,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [openMap, setOpenMap] = useState(() =>
    initializeOpenMap(itemList, initialTreeOpenState)
  );
  const [appsOpen, setAppsOpen] = useState(initialTreeOpenState);

  const toggleItem = (id) => {
    setOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAppsClick = () => {
    setAppsOpen((prev) => !prev);
  };

  return (
    <Box>
      <List dense>
        <ListItemButton onClick={handleAppsClick}>
          <ListItemIcon>
            <MainIcon
              sx={{
                color:
                  theme.palette.mode === "light"
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
              }}
            />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      theme.palette.mode === "light"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {mainLabel}
                </Typography>
              }
            />
          )}
        </ListItemButton>
      </List>

      {drawerOpen && (
        <Collapse in={appsOpen} timeout="auto" unmountOnExit>
          <List
            dense
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.background.paper, 0),
            }}
          >
            <RecursiveNavItems
              items={itemList}
              openMap={openMap}
              toggleItem={toggleItem}
              navigate={navigate}
              theme={theme}
            />
          </List>
        </Collapse>
      )}
    </Box>
  );
}
