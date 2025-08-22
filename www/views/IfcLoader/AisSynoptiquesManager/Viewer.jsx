import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useTheme } from "@mui/material/styles";

export default function Viewer({
  type = "floorplan",
  floorId = null,
  isDataReady,
  selectedSynoptiqueId,
  selectedCategoryId,
}) {
  const theme = useTheme();
  const ref = React.useRef(null);
  const { getModule } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);
  const [error, setError] = React.useState(null);
  const viewerInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!ifc || !ref.current || !type) return;

    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    let viewerId = null;
    let isMounted = true;

    const setupViewerAndDraw = async () => {
      try {
        if (!isMounted) return;

        viewerId = ifc.synoptiques.addViewer(ref.current, {
          type: type,
          palette: theme.palette.mode || "light",
          floorId: floorId,
          selectedSynoptiqueId,
          selectedCategoryId,
        });

        viewerInstanceRef.current = ifc.synoptiques.getViewer(viewerId);

        if (!viewerInstanceRef.current) {
          throw new Error("Failed to create viewer instance.");
        }

        if (viewerInstanceRef.current && isMounted && isDataReady) {
          viewerInstanceRef.current.draw();
        } else if (viewerInstanceRef.current && isMounted && !isDataReady) {
          console.log("Viewer initialized, but waiting for data to draw...");
        }
      } catch (err) {
        console.error("Error setting up viewer or drawing:", err);
        if (isMounted) {
          setError(err.message || "Failed to setup or draw viewer");
        }
      }
    };

    setupViewerAndDraw();

    return () => {
      isMounted = false;

      if (ifc && viewerId) {
        console.log("Disposing viewer:", viewerId);
        const viewerToDispose = viewerInstanceRef.current;
        if (viewerToDispose && typeof viewerToDispose.dispose === "function") {
          viewerToDispose.dispose();
        }
        ifc.synoptiques.removeViewer(viewerId);
        viewerInstanceRef.current = null;
      }
    };
  }, [ifc, type, floorId, theme.palette.mode, isDataReady]);

  React.useEffect(() => {
    if (viewerInstanceRef.current) {
      if (typeof viewerInstanceRef.current.setSelectedSynoptique === 'function') {
        viewerInstanceRef.current.setSelectedSynoptique(selectedSynoptiqueId);
      }
      if (typeof viewerInstanceRef.current.setSelectedCategory === 'function') {
        viewerInstanceRef.current.setSelectedCategory(selectedCategoryId);
      }
    }
  }, [selectedSynoptiqueId, selectedCategoryId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%", // Restored height
        minWidth: 0,
        minHeight: 0,
        position: "relative",
        backgroundColor: theme.palette.background.default,
        padding: "5px",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 5px', fontSize: '10px' }}>
         Type: {type}, Floor: {floorId}
      </div>
    </div>
  );
}
