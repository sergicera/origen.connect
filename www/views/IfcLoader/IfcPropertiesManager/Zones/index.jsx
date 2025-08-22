import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import Zone from "./Item";
import ZonesTree from "./Tree";
import { useRefinery } from "./useRefinery";
import { findNodeByExpressId } from "./flattenedTreeUtils";

export default function Zones() {
  const { subscribe } = useCoreContext();
  const theme = useTheme();
  const {
    highlightByID,
    hierarchyOptions,
    isZonesReady,
    zones,
    zoneTypeOptions,
  } = useRefinery();

  const [properties, setProperties] = React.useState({});
  const [zonesList, setZonesList] = React.useState(zones);
  const [selectedZoneExpressId, setSelectedZoneExpressId] =
    React.useState(null);

  const selectedZone = React.useMemo(() => {
    if (!selectedZoneExpressId) return null;
    if (!zonesList) return null;
    return zonesList.find((node) => node.expressId === selectedZoneExpressId);
  }, [selectedZoneExpressId, zonesList]);

  const viewerSelection = React.useMemo(() => {
    if (!properties) return null;
    const entries = Object.values(properties);
    return entries.flatMap((itemsArray) =>
      itemsArray.map((item) => item.mainProperty?.expressID)
    );
  }, [properties]);

  React.useEffect(() => {
    if (viewerSelection) {
      // TODO : handle multiple selection
      const firstId = viewerSelection[0];
      const currentSelectedNode = findNodeByExpressId(zonesList, firstId);
      if (currentSelectedNode) {
        setSelectedZoneExpressId(currentSelectedNode.expressId);
      }
    }
  }, [viewerSelection]);

  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "CURRENT_SELECTION_PROPERTIES_CHANGED") {
        const { selectionPropertiesTree } = payload;
        setProperties(selectionPropertiesTree);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  React.useEffect(() => {
    if (!zones || !isZonesReady) return;
    setZonesList(zones);
  }, [zones, isZonesReady]);

  return (
    <Box>
      <Box
        sx={{
          mt: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h1" sx={{ color: theme.palette.text.secondary }}>
          Zones
        </Typography>
        <i
          className="fa-regular fa-diagram-lean-canvas"
          style={{
            fontSize: "1.25rem",
            paddingRight: "1.5rem",
            color: theme.palette.text.secondary,
          }}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: selectedZone ? "1fr 1fr" : "1fr",
          gap: 4,
          width: "100%",
          height: "100%",
          paddingTop: 2,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box
          sx={{
            transition: "all 0.3s ease-in-out",
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "18px", mb: 2 }}
            gutterBottom
          >
            Planification spatiale :
          </Typography>

          <ZonesTree
            zonesList={zonesList}
            selectedZoneExpressId={selectedZoneExpressId}
            setSelectedZoneExpressId={setSelectedZoneExpressId}
            highlightByID={highlightByID}
          />
        </Box>

        {selectedZone && (
          <Box
            sx={{
              opacity: 1,
              transform: "translateX(0)",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Zone
              zoneItem={selectedZone}
              setZonesList={setZonesList}
              zoneTypeOptions={zoneTypeOptions}
              hierarchyOptions={hierarchyOptions}
              psets={properties}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
