import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function WireframeModeToggle() {
  const [viewMode, setViewMode] = useState("normal");

  const onChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);

      // Apply the wireframe or normal mode
      if (newViewMode === "wireframe") {
        console.log("Entering wireframe mode");
      } else {
        console.log("Entering normal mode");
      }
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={onChange}
      aria-label="view mode"
      orientation="vertical"
    >
      <ToggleButton value="normal" aria-label="normal view">
        <i className="fa-solid fa-layer-group" style={{ fontSize: "1rem" }} />
      </ToggleButton>
      <ToggleButton value="wireframe" aria-label="wireframe view">
        <i className="fa-solid fa-cubes" style={{ fontSize: "1rem" }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
