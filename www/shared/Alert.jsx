import { Alert } from "@mui/material";
import { Container } from "@mui/material";

export default function CustomAlert({
  maxWidth = "lg",
  severity = "warning",
  message,
}) {
  return (
    <Container maxWidth={false} disableGutters>
      <Alert severity={severity}>{message}</Alert>
    </Container>
  );
}
