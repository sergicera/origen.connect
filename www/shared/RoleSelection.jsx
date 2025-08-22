import React, { useState, useMemo, useEffect } from "react";

import {
  FormControl,
  Divider,
  IconButton,
  Modal,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Button,
} from "@mui/material";

import { useAppContext } from "@/www/store/context-provider";

/* --- Constants --- */

const allOptions = [
  { id: "admin", label: "Administrator", type: "role", group: "it" },
  { id: "owner", label: "Associate", type: "role", group: "business" },
  {
    id: "team_manager",
    label: "Team Manager",
    type: "role",
    group: "business",
  },
  {
    id: "contributor",
    label: "Contributor",
    type: "role",
    group: "business",
  },
  { id: "dev", label: "Developer", type: "phase", group: "super" },
  { id: "test", label: "Tester", type: "phase", group: "super" },
  { id: "prod", label: "Production", type: "phase", group: "super" },
];

const visibilityConfigs = {
  role: {
    admin: true,
    owner: false,
    team_manager: false,
    contributor: false,
  },
  mode: {
    admin: false,
    owner: false,
    team_manager: false,
    contributor: false,
  },
};

/**
 * RoleSelection component allows a user to switch application roles and select a mode.
 * Role and mode selections are made via radio buttons within a modal.
 * The modal is closed by a dedicated button.
 * If the user is a superuser (`isSuperUser` is true), all selections are enabled.
 * Otherwise, the ability to change role or mode is determined by the `visibilityConfigs`
 * and the current `userRole`.
 * The selected role is lifted up to the parent through the `onRoleChange` callback.
 */
export default function RoleSelection({
  isSuperUser,
  selectedMode,
  selectedRole,
  onModeChange,
  onRoleChange,
}) {
  const [{ roles }] = useAppContext();

  const userRole = useMemo(() => {
    return roles.currentRoleId || "contributor";
  }, [roles.currentRoleId]);

  const availableRoles = allOptions.filter((option) => option.type === "role");
  const availableModes = allOptions.filter((option) => option.type === "phase");

  const [open, setOpen] = useState(false);

  // Determine if sections should be disabled
  const isRoleSelectionDisabled = isSuperUser
    ? false
    : !(visibilityConfigs.role[userRole] === true);
  const isModeSelectionDisabled = isSuperUser
    ? false
    : !(visibilityConfigs.mode[userRole] === true);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    if (onRoleChange) onRoleChange(newRole);
  };

  const handleModeChange = (event) => {
    const newMode = event.target.value;
    if (onModeChange) onModeChange(newMode);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <IconButton onClick={handleOpen} color="primary.main">
        <i className="fa-sharp fa-thin fa-gear" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="role-selection-modal-title"
        aria-describedby="role-selection-modal-description"
      >
        <Box sx={style}>
          <Typography
            variant="h6"
            id="role-selection-modal-title"
            sx={{ mb: 2 }}
          >
            Select Role & Mode
          </Typography>

          {/* Role Selection Section */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Role
            </Typography>
            <RadioGroup
              aria-label="role"
              name="role-radio-buttons-group"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              {availableRoles.map((role) => (
                <FormControlLabel
                  key={role.id}
                  value={role.id}
                  control={<Radio size="small" />}
                  label={role.label}
                  disabled={isRoleSelectionDisabled}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* Mode Selection Section */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Mode
            </Typography>
            <RadioGroup
              aria-label="mode"
              name="mode-radio-buttons-group"
              value={selectedMode}
              onChange={handleModeChange}
            >
              {availableModes.map((mode) => (
                <FormControlLabel
                  key={mode.id}
                  value={mode.id}
                  control={<Radio size="small" />}
                  label={mode.label}
                  disabled={isModeSelectionDisabled}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
