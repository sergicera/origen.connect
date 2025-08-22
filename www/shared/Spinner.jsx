import CircularProgress from "@mui/material/CircularProgress";

function Spinner() {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px" }}>
      <CircularProgress size={32} />
    </div>
  );
}

export default Spinner;
