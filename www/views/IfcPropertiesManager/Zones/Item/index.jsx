import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import ItemProperties from "./Properties";
import ItemType from "./Type";
import ItemHierarchy from "./Hierarchy";
import IfcData from "./IfcData";

export default function Zone({
  setZonesList,
  zoneItem,
  zoneTypeOptions,
  hierarchyOptions,
  psets,
}) {
  const theme = useTheme();

  if (!zoneItem) return null;

  return (
    <Box>
      <Box>
        <Typography
          variant="body1"
          sx={{ fontSize: "18px", mb: 2 }}
          gutterBottom
        >
          Propietés de la zone :
        </Typography>
        <ItemProperties zoneItem={zoneItem} />
      </Box>

      <Box>
        <Typography
          variant="body1"
          sx={{ fontSize: "18px", mb: 2 }}
          gutterBottom
        >
          Type de zone :
        </Typography>
        <ItemType
          zoneItem={zoneItem}
          setZonesList={setZonesList}
          zoneTypeOptions={zoneTypeOptions}
        />
      </Box>

      <Box>
        <Typography
          variant="body1"
          sx={{ fontSize: "18px", mb: 3 }}
          gutterBottom
        >
          Hierarchie de la zone :
        </Typography>
        <ItemHierarchy
          zoneItem={zoneItem}
          setZonesList={setZonesList}
          hierarchyOptions={hierarchyOptions}
        />
      </Box>

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

        <IfcData data={psets} />
      </Box>
    </Box>
  );
}
