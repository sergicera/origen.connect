import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { MenuItem, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Box, ButtonGroup, FormControl, Select } from "@mui/material";
import { usePlans } from "./usePlans";

const plansList = [
  { id: "plan1", name: "Plan 1" },
  { id: "plan2", name: "Plan 2" },
  { id: "plan3", name: "Plan 3" },
];

export default function ViewMode() {
  const [viewMode, setViewMode] = React.useState("3d");
  const [selectedPlan, setSelectedPlan] = React.useState("");
  const { getModule } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);
  const { plansList, goToPlan } = usePlans();

  React.useEffect(() => {
    if (plansList && plansList.length > 0) {
      setSelectedPlan(plansList[0]);
    }
  }, [plansList]);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      const prev = viewMode;
      setViewMode(newMode);
      if (prev !== newMode) {
        if (newMode === "plan") {
          ifc.viewer.plans.enterPlanMode();
        }
        if (prev === "plan") {
          ifc.viewer.plans.exitPlanMode();
        } else {
          console.log("Exiting 3D mode");
        }
      }
    }
  };

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
    goToPlan(event.target.value);
  };

  return (
    <ButtonGroup>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        aria-label="view mode"
        style={{ display: "flex", alignItems: "center" }}
      >
        <ToggleButton value="3d" aria-label="3D">
          3D
        </ToggleButton>
        <ToggleButton value="plan" aria-label="Plan">
          Plan
        </ToggleButton>

        {/* PLans dropdown menu */}
        <Box sx={{ ml: 2 }}>
          {viewMode === "plan" && (
            <FormControl variant="outlined">
              <Select
                value={selectedPlan}
                onChange={handlePlanChange}
                displayEmpty
                variant="standard"
                inputProps={{ "aria-label": "Plan selectioné" }}
              >
                <MenuItem value="">
                  <em>Selectione un plan</em>
                </MenuItem>
                {plansList &&
                  plansList.map((plan) => (
                    <MenuItem value={plan} key={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </ToggleButtonGroup>
    </ButtonGroup>
  );
}
