import { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function WireframeModeToggle() {
  const activeTabIndex = 0;
  const [viewMode, setViewMode] = useState("restore");

  useEffect(() => {
    let newViewMode;

    if (activeTabIndex === 0) {
      newViewMode = "restore";
    } else if (activeTabIndex === 1) {
      newViewMode = "zones";
    } else if (activeTabIndex === 2) {
      newViewMode = "openings";
    } else if (activeTabIndex === 3) {
      newViewMode = "sep";
    } else if (activeTabIndex === 4) {
      newViewMode = "terrain";
    }

    setViewMode(newViewMode);

    switch (newViewMode) {
      case "restore":
        console.log("restore");
        break;

      case "zones":
        console.log("zones");
        break;

      case "openings":
        console.log("openings");
        break;

      case "sep":
        console.log("sep");
        break;

      case "terrain":
        console.log("terrain");
        break;

      default:
        break;
    }
  }, [activeTabIndex]);

  const onChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);

      switch (newViewMode) {
        case "restore":
          break;

        case "zones":
          break;

        case "openings":
          break;

        case "sep":
          break;

        case "terrain":
          break;

        default:
          break;
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
      {/* "restore" - Show all */}
      <ToggleButton value="restore" aria-label="restore view">
        <i
          className="fa-thin fa-globe"
          style={{ fontSize: "1rem" }}
        />
      </ToggleButton>

      {/* "zones" - Show zones */}
      <ToggleButton value="zones" aria-label="zones view">
      <i className="fa-sharp fa-thin fa-diagram-lean-canvas" style={{ fontSize: "1rem" }} />
      </ToggleButton>

      {/* "openings" - Show openings */}
      <ToggleButton value="openings" aria-label="openings view">
        <i className="fa-thin fa-door-open" style={{ fontSize: "1rem" }} />
      </ToggleButton>

      {/* "sep" - External floor surfaces */}
      <ToggleButton value="sep" aria-label="external floors view">
        <i className="fa-thin fa-barcode"  style={{ fontSize: "1rem" }}/>
      </ToggleButton>

      {/* "terrain" - Show terrain */}
      <ToggleButton value="terrain" aria-label="terrain view">
        <i className="fa-thin fa-mountain" style={{ fontSize: "1rem" }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
