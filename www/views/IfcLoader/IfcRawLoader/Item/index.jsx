import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import IfcData from "./IfcData";

export default function Zones() {
  const { subscribe } = useCoreContext();
  const theme = useTheme();
  const [properties, setProperties] = React.useState({});

  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "CURRENT_SELECTION_PROPERTIES_CHANGED") {
        const { selectionPropertiesTree } = payload;
        setProperties(selectionPropertiesTree);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  return (
    <Box>
      <Box
        sx={{
          mt: 4,
        }}
      >
        <Typography variant="h1" sx={{ color: theme.palette.text.secondary }}>
          Selection
        </Typography>
      </Box>

      <Box>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: "18px",
              pb: 1,
              pt: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            Psets & Qtos :
          </Typography>

          <IfcData data={properties} />
        </Box>
      </Box>
    </Box>
  );
}
