import React from "react";
import { Box } from "@mui/material";

import ArchitectureIcon from "@mui/icons-material/Architecture";

import MenuItem from "../MenuItem";

const itemList = [
  {
    id: "refs",
    label: "Modèle IFC",
    initialToggleOpen: false,
    children: [
      {
        id: "coordi-ifc-source",
        label: "Fichier source IFC",
        path: "/loader/ifc/file",
      },
      {
        id: "coordi-ifc-tree",
        label: "Arborescence du modèle",
        path: "/loader/ifc/properties",
      },
      {
        id: "coordi-ifc-plans",
        label: "Plans et coupes",
        path: "/loader/sap/plans",
      },
      {
        id: "des-synoptiques",
        label: "Synoptiques",
        path: "/descriptif/synoptiques",
      },
      {
        id: "des-quantites",
        label: "Quantités",
        path: "/calculation/metres",
      },
    ],
  },
];

export default function Dessins({ drawerOpen, initialTreeOpenState = true }) {
  return (
    <Box>
      <MenuItem
        drawerOpen={drawerOpen}
        initialTreeOpenState={initialTreeOpenState}
        MainIcon={ArchitectureIcon}
        mainLabel="Importer"
        itemList={itemList}
      />
    </Box>
  );
}
