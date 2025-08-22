import { useTheme } from "@mui/material/styles";
import { Box, Avatar, Typography } from "@mui/material";
import { Hub as HubIcon } from "@mui/icons-material";

export default function AppLogo({ toggleCollapse }) {
  const theme = useTheme();

  return (
    <>
      <Avatar
        alt="Logo"
        sx={{
          mr: 2,
          height: 45,
          width: 45,
          bgcolor: theme.palette.primary.main,
          cursor: "pointer",
        }}
        onClick={toggleCollapse}
      >
        <HubIcon fontSize="large" />
      </Avatar>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h2" color={theme.palette.text.primary}>
          <strong>Kogo™</strong>
        </Typography>
        <Typography
          variant="h3"
          sx={{
            mt: 0.5,
            color: theme.palette.primary.main,
            cursor: "pointer",
            userSelect: "none",
          }}
        ></Typography>
      </Box>
    </>
  );
}
