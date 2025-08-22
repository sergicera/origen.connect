import { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import DataLink from "@/www/shared/DataLink";

export default function Settings({ contents, handleConnectionChange }) {
  const visibleContents = useMemo(
    () => ["sap_csv"],
    []
  );

  const fileMetadata = useMemo(
    () => ({
      sap_csv: {
        displayName: "SAP - Swiss Apartments Plan",
        description: "Swiss Apartments Plan CSV fromated",
      },
    }),
    []
  );

  const appInputs = useMemo(
    () => ({
      sap: {
        displayName: "SAP - Swiss Apartments Plan",
        description: "Swiss Apartments Plan CSV fromated",
        allowedContents: ["sap_csv"],
      },
    }),
    []
  );

  const defaultConnections = useMemo(
    () => [
      {
        source: "sap_csv",
        target: "app",
        targetHandle: "input-sap",
      },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%", my: 3 }}>
      <DataLink
        contents={contents}
        appDisplayName="SAP Loader"
        handleConnectionChange={handleConnectionChange}
        visibleContents={visibleContents}
        fileMetadata={fileMetadata}
        appInputs={appInputs}
        defaultConnections={defaultConnections}
      />
    </Box>
  );
}

Settings.propTypes = {
  contents: PropTypes.object,
  handleConnectionChange: PropTypes.func,
};
