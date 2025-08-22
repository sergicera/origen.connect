import { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import DataLink from "@/www/shared/DataLink";

export default function Settings({ contents, handleConnectionChange }) {
  const visibleContents = useMemo(
    () => [
      "ais_attributes_json",
      "ais_features_json",
      "ais_metadata_json",
      "ais_selections_json",
      "ais_templates_json",
    ],
    []
  );

  const fileMetadata = useMemo(
    () => ({
      ais_attributes_json: {
        displayName: "AIS Attributes",
        description: "AIS Attributes JSON",
      },
      ais_features_json: {
        displayName: "AIS Features",
        description: "AIS Features JSON",
      },
      ais_metadata_json: {
        displayName: "AIS Metadata",
        description: "AIS Metadata JSON",
      },
      ais_selections_json: {
        displayName: "AIS Selections",
        description: "AIS Selections JSON",
      },  
      ais_templates_json: {
        displayName: "AIS Templates",
        description: "AIS Templates JSON",
      },
    }),
    []
  );

  const appInputs = useMemo(
    () => ({
      attributes: {
        displayName: "Attributes",
        description: "AIS Attributes",
        allowedContents: ["ais_attributes_json"],
      },
      features: {
        displayName: "Features",
        description: "AIS Features",
        allowedContents: ["ais_features_json"],
      },
      metadata: {
        displayName: "Metadata",
        description: "AIS Metadata",
        allowedContents: ["ais_metadata_json"],
      },
      selections: {
        displayName: "Selections",
        description: "AIS Selections",
        allowedContents: ["ais_selections_json"],
      },
      templates: {
        displayName: "Templates",
        description: "AIS Templates",
        allowedContents: ["ais_templates_json"],
      },
    }),
    []
  );

  const defaultConnections = useMemo(
    () => [
      {
        source: "ais_attributes_json",
        target: "app",
        targetHandle: "input-attributes",
      },
      {
        source: "ais_features_json",
        target: "app",
        targetHandle: "input-features",
      },
      {
        source: "ais_metadata_json",
        target: "app",
        targetHandle: "input-metadata",
      },
      {
        source: "ais_selections_json",
        target: "app",
        targetHandle: "input-selections",
      },
      {
        source: "ais_templates_json",
        target: "app",
        targetHandle: "input-templates",
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
