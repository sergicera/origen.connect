import React from "react";
import { useAppContext } from "@/www/store/context-provider";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { useTheme } from "@mui/material/styles";
import { Box, Collapse, Grid, Paper, Typography } from "@mui/material";
import ViewHeader from "./Header";
import Actions from "./Actions";
import Settings from "./Settings";
import Viewer from "./Viewer";
import Legend from "./Legend";

export default function SamView() {
  const theme = useTheme();
  const [{ exercices, files, models }] = useAppContext();
  const { getModule, subscribe } = useCoreContext();

  const [showFiles, setShowFiles] = React.useState(false);
  const [contents, setContents] = React.useState(null);
  const [dataLinkConnections, setDataLinkConnections] = React.useState(null);
  const [fileToLoad, setFileToLoad] = React.useState(null);
  const [floorIds, setFloorIds] = React.useState([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [selectedViewer, setSelectedViewer] = React.useState({
    type: "axonometric",
    floorId: null,
  });

  const currentExerciceId = React.useMemo(
    () => exercices?.currentExerciceId || null,
    [exercices]
  );

  const currentModelId = React.useMemo(
    () => models?.currentModelId || null,
    [models]
  );

  const availableFilesForCurrentModel = React.useMemo(
    () => files || null,
    [files]
  );

  const sap = React.useMemo(() => getModule("sap"), [getModule]);
  const token = useAuthToken();

  // Step 1 - Initialize the file system
  React.useEffect(() => {
    if (
      !currentExerciceId ||
      !currentModelId ||
      !availableFilesForCurrentModel ||
      !sap
    )
      return;

    sap.files.initFileSystem(
      currentExerciceId,
      availableFilesForCurrentModel,
      currentModelId
    );
  }, [sap, currentExerciceId, currentModelId, availableFilesForCurrentModel]);

  // Step 2 - Subscribe to events
  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "CONTENTS_LOADED") {
        setContents(payload);
        setIsDataLoaded(false);
        setFloorIds([]);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  // Step 3 & 4 - Determine file to load and trigger data loading in DataManager
  React.useEffect(() => {
    if (!contents || !sap || !token) return;

    const { sap_csv } = sap.files.contents;
    const source = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-template"
        )
      : null;
    const currentFile = source ? contents[source.source] : sap_csv;
    setFileToLoad(currentFile);

    setSelectedViewer({ type: "axonometric", floorId: null });

    if (
      currentFile &&
      currentFile.loaded &&
      currentFile.path &&
      !isDataLoaded
    ) {
      const loadDataAndGetFloors = async () => {
        try {
          await sap.dataManager.loadSAMFile(currentFile.path, token);
          const uniqueIds = sap.dataManager.getUniqueFloorIds();
          setFloorIds(uniqueIds.sort());
          setIsDataLoaded(true);
        } catch (error) {
          console.error("Failed to load data or get floor IDs:", error);
          setIsDataLoaded(false);
          setFloorIds([]);
        }
      };
      loadDataAndGetFloors();
    } else if (currentFile && sap.dataManager.getData()) {
      const uniqueIds = sap.dataManager.getUniqueFloorIds();
      setFloorIds(uniqueIds.sort());
      setIsDataLoaded(true);
    }
  }, [sap, dataLinkConnections, contents, token, isDataLoaded]);

  const onToggleFiles = () => {
    setShowFiles((prev) => !prev);
  };

  const handleConnectionChange = React.useCallback((connections) => {
    setDataLinkConnections(connections);
  }, []);

  const handleSelectViewer = (type, floorId) => {
    setSelectedViewer({ type, floorId });
  };

  const allViewers = React.useMemo(() => {
    if (!fileToLoad) return [];
    const viewers = [
      { type: "axonometric", floorId: null, title: "Axonometric View" },
    ];
    if (isDataLoaded) {
      floorIds.forEach((id) => {
        viewers.push({ type: "floorplan", floorId: id, title: `Floor: ${id}` });
      });
    }
    return viewers;
  }, [fileToLoad, isDataLoaded, floorIds]);

  return (
    <ViewHeader
      taskName="Déssiner les plans"
      actions={<Actions onToggleFiles={onToggleFiles} />}
    >
      {/* Data Link */}
      <Collapse in={showFiles}>
        <Settings
          contents={contents}
          onConnectionChange={handleConnectionChange}
        />
      </Collapse>
      {/* Grid of Small Viewers */}
      <Typography
        variant="h6"
        sx={{
          mt: 2.5,
          fontWeight: 500,
          fontSize: "1.125rem",
          color: theme.palette.text.primary,
        }}
      >
        Données de base
      </Typography>
      {fileToLoad && (
        <Grid container spacing={2} mt={2.5}>
          {allViewers.map((viewerConfig) => (
            <Grid
              item
              key={`${viewerConfig.type}-${viewerConfig.floorId}`}
              xs={4}
              sm={3}
              md={2}
            >
              <Paper
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  position: "relative",
                  border:
                    selectedViewer.type === viewerConfig.type &&
                    selectedViewer.floorId === viewerConfig.floorId
                      ? "2px solid"
                      : "1px solid",
                  borderColor:
                    selectedViewer.type === viewerConfig.type &&
                    selectedViewer.floorId === viewerConfig.floorId
                      ? "primary.main"
                      : "divider",
                }}
                onClick={() =>
                  handleSelectViewer(viewerConfig.type, viewerConfig.floorId)
                }
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: "rgba(0,0,0,0.5)",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  {viewerConfig.title}
                </Box>
                <Viewer
                  fileToLoad={fileToLoad}
                  type={viewerConfig.type}
                  floorId={viewerConfig.floorId}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Main Viewer Area */}

      {fileToLoad && (
        <Box
          sx={{
            width: "100%",
            height: "800px",
            mb: 2,
          }}
        >
          <Viewer
            key={`main-${selectedViewer.type}-${selectedViewer.floorId}`}
            fileToLoad={fileToLoad}
            type={selectedViewer.type}
            floorId={selectedViewer.floorId}
            main={true}
          />
        </Box>
      )}

      {/* Legend */}
      {fileToLoad && isDataLoaded && (
        <Box sx={{ mt: 5 }}>
          {" "}
          <Legend />
        </Box>
      )}
    </ViewHeader>
  );
}
