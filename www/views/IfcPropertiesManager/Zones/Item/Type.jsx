import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

export default function ItemType({ zoneItem, setZonesList, zoneTypeOptions }) {
  const handleChange = (event, newType) => {
    setZonesList((prevList) =>
      prevList.map((node) =>
        node.expressId === zoneItem.expressId
          ? { ...node, type: newType }
          : node
      )
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <ToggleButtonGroup
        fullWidth
        value={zoneItem.type}
        exclusive
        onChange={handleChange}
        aria-label="Type de zone"
      >
        {zoneTypeOptions.map((option) => (
          <ToggleButton key={option} value={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
