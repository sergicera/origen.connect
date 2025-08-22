import React from "react";
import ViewHeader from "./Header";
import Files from "./Files";
import ThreeDViewer from "./Viewer";
import ItemData from "./Item";

export default function IfcLoader() {
  return (
    <ViewHeader taskName="Charger le fichier IFC">
      <Files />
      <ThreeDViewer />
      <ItemData />
    </ViewHeader>
  );
}
