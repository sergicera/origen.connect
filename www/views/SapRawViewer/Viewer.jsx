import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

export default function Viewer({
  fileToLoad,
  type = "axonometric",
  floorId = null,
  main = false,
}) {
  const theme = useTheme();
  const token = useAuthToken();
  const ref = React.useRef(null);
  const { getModule } = useCoreContext();
  const sap = React.useMemo(() => getModule("sap"), [getModule]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const viewerInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!sap || !ref.current || !fileToLoad || !type || !token) return;

    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    let viewerId = null;
    let isMounted = true;
    let resizeObserver = null;

    const setupViewerAndLoadData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        viewerId = sap.addViewer(ref.current, {
          type: type,
          palette: theme.palette.mode || "light",
          floorId: floorId,
        });
        viewerInstanceRef.current = sap.getViewer(viewerId);

        if (!viewerInstanceRef.current) {
          throw new Error("Failed to create viewer instance.");
        }

        if (
          ref.current &&
          viewerInstanceRef.current &&
          typeof viewerInstanceRef.current.handleResize === "function"
        ) {
          resizeObserver = new ResizeObserver(() => {
            if (viewerInstanceRef.current) {
              viewerInstanceRef.current.handleResize();
            }
          });
          resizeObserver.observe(ref.current);
        }

        if (fileToLoad.loaded && fileToLoad.path) {
          await sap.dataManager.loadSAMFile(fileToLoad.path, token);
          if (viewerInstanceRef.current && isMounted) {
            viewerInstanceRef.current.buildSceneFromData();
          }
        }
        if (isMounted) setIsLoading(false);
      } catch (err) {
        console.error("Error setting up viewer or loading data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load model");
          setIsLoading(false);
        }
      }
    };

    setupViewerAndLoadData();

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (sap && viewerId) {
        const viewerToDispose = viewerInstanceRef.current;
        if (viewerToDispose && typeof viewerToDispose.dispose === "function") {
          viewerToDispose.dispose();
        }
        sap.removeViewer(viewerId);
        viewerInstanceRef.current = null;
      }
    };
  }, [sap, token, fileToLoad, type, floorId, theme.palette.mode]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        position: "relative",
      }}
    >
      {/* The Viewer will attach the Three.js canvas here */}
    </div>
  );
}
