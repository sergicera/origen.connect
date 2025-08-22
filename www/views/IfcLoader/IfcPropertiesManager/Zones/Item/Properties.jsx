import { Typography, Box, Grid } from "@mui/material";

export default function ItemProperties({ zoneItem }) {
  return (
    <Box
      sx={{
        mb: 4,
        p: 2,
        bgcolor: "background.paper",
        color: "text.disabled",
        "& .MuiTypography-root": {
          color: "inherit",
        },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>
            <strong>Nom :</strong> {zoneItem.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            <strong>Express ID :</strong> {zoneItem.expressId}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            <strong>Model ID :</strong> {zoneItem.modelId}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
