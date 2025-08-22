import React from "react";
import ViewHeader from "./Header";
import ThreeDViewer from "./Viewer";
import ZonesData from "./Zones";

export default function IfcLoader() {
  return (
    <ViewHeader taskName="Intégrer les données de l'IFC">
      <ThreeDViewer />
      <ZonesData />
    </ViewHeader>
  );
}
