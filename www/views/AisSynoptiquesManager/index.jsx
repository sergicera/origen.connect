import React from "react";
import { useAppContext } from "@/www/store/context-provider";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { Box, Collapse, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ViewHeader from "./Header";
import Actions from "./Actions";
import Settings from "./Settings";
import Viewer from "./Viewer";
import Filter from "./Filter";
import Floors from "./Floors";
import Synoptiques from "./Synoptiques";

export default function SynoptiquesView() {
  const [{ exercices, files, models }] = useAppContext();
  const { getModule, subscribe } = useCoreContext();
  const theme = useTheme();

  const [showFiles, setShowFiles] = React.useState(false);
  const [contents, setContents] = React.useState(null);
  const [dataLinkConnections, setDataLinkConnections] = React.useState(null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [selectedViewer, setSelectedViewer] = React.useState({
    type: "floorplan",
    floorId: null,
  });
  const [metadataPresets, setMetadataPresets] = React.useState({});
  const [activeFilters, setActiveFilters] = React.useState({});

  const [selectedSynoptiqueId, setSelectedSynoptiqueId] = React.useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(null);

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

  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);
  const token = useAuthToken();

  React.useEffect(() => {
    if (
      !currentExerciceId ||
      !currentModelId ||
      !availableFilesForCurrentModel ||
      !ifc
    )
      return;

      ifc.files.initFileSystem(
      currentExerciceId,
      availableFilesForCurrentModel,
      currentModelId
    );
  }, [ifc, currentExerciceId, currentModelId, availableFilesForCurrentModel]);

  // --- SUBSCRIPTIONS ---
  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "CONTENTS_LOADED") {
        setContents(payload);
        setIsDataLoaded(false);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  React.useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "DATA_LOADED" && isMounted) {
        setIsDataLoaded(true);
        const presets = ifc.synoptiques.data.getMetadataPresets();
        setMetadataPresets(presets);
        setSelectedSynoptiqueId(null);
        setSelectedCategoryId(null);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscribe, ifc]);

  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "ACTIVE_FILTERS_CHANGED") {
        setActiveFilters(payload);
      }
    });
    return () => unsubscribe();
  }, [subscribe]); 

  // --- DATA LOADING ---
  React.useEffect(() => {
    if (!contents || !ifc || !token) return;

    const {
      ais_attributes_json,
      ais_features_json,
      ais_metadata_json,
      ais_selections_json,
      ais_templates_json,
    } = ifc.files.contents;

    const attributesLink = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-attributes"
        )
      : null;

    const featuresLink = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-features"
        )
      : null;

    const metadataLink = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-metadata"
        )
      : null;

    const selectionsLink = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-selections"
        )
      : null;

    const templatesLink = dataLinkConnections
      ? dataLinkConnections.find(
          (conn) => conn.targetHandle === "input-templates"
        )
      : null;

    const attributesFile = attributesLink
      ? contents[attributesLink.source]
      : ais_attributes_json;
    const featuresFile = featuresLink
      ? contents[featuresLink.source]
      : ais_features_json;
    const metadataFile = metadataLink
      ? contents[metadataLink.source]
      : ais_metadata_json;
    const selectionsFile = selectionsLink
      ? contents[selectionsLink.source]
      : ais_selections_json;
    const templatesFile = templatesLink
      ? contents[templatesLink.source]
      : ais_templates_json;

    const loadData = async () => {
      try {
        await ifc.synoptiques.data.loadData(
          {
            attributes: attributesFile.path,
            features: featuresFile.path,
            metadata: metadataFile.path,
            selections: selectionsFile.path,
            templates: templatesFile.path,
          },
          token
        );
      } catch (error) {
        console.error("Failed to load data or get floor IDs:", error);
      }
    };

    if (featuresFile?.path && metadataFile?.path) {
      loadData();
    } else {
      console.log("Waiting for all file paths to be available...");
    }
  }, [ifc, dataLinkConnections, contents, token]);

  const onToggleFiles = () => {
    setShowFiles((prev) => !prev);
  };

  // --- HANDLERS ---
  const handleConnectionChange = React.useCallback((connections) => {
    setDataLinkConnections(connections);
  }, []);

  const handleFilterChange = React.useCallback(
    (key, values) => {
      const nextFilters = {
        ...activeFilters,
        [key]: values,
      };
      if (values.length === 0) {
        delete nextFilters[key];
      }
      console.log("UI: Sending filter change to core", nextFilters);
      ifc?.data?.setActiveFilters(nextFilters);
    },
    [ifc, activeFilters]
  );

  const handleSelectViewer = (type, floorId) => {
    setSelectedViewer({ type, floorId });
  };

  const handleSynoptiqueChange = (newId) => {
    setSelectedSynoptiqueId(newId);
    setSelectedCategoryId(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId((prevId) =>
      prevId === categoryId ? null : categoryId
    );
  };

  return (
    <ViewHeader
      taskName="Informer les plans"
      actions={<Actions onToggleFiles={onToggleFiles} />}
    >
      <Collapse in={showFiles}>
        <Settings
          contents={contents}
          onConnectionChange={handleConnectionChange}
        />
      </Collapse>

      {isDataLoaded || selectedViewer.floorId !== null ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 200px)",
            mt: 2,
          }}
        >
          {selectedViewer.floorId !== null ? (
            <Viewer
              type={selectedViewer.type}
              floorId={selectedViewer.floorId}
              isDataReady={isDataLoaded}
              selectedSynoptiqueId={selectedSynoptiqueId}
              selectedCategoryId={selectedCategoryId}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography sx={{ textAlign: "center" }}>
                Veuillez sélectionner un étage pour afficher le plan.
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              width: "250px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Sélection Principale
            </Typography>
            <Floors
              isDataLoaded={isDataLoaded}
              selectedFloorId={selectedViewer.floorId}
              onSelectFloor={(floorId) =>
                handleSelectViewer("floorplan", floorId)
              }
            />
            {selectedViewer.floorId !== null && (
              <Synoptiques
                isDataLoaded={isDataLoaded}
                selectedSynoptiqueId={selectedSynoptiqueId}
                onSynoptiqueChange={handleSynoptiqueChange}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
                exerciceId={currentExerciceId}
                modelId={currentModelId}
              />
            )}
          </Box>

          {selectedViewer.floorId !== null && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 10,
                width: "200px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ textAlign: "right" }}>
                Filtrer la sélection
              </Typography>
              <Filter
                allPresets={metadataPresets}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Typography sx={{ mt: 2 }}>
          {files ? "Loading data..." : "No floor plans available to display."}
        </Typography>
      )}
    </ViewHeader>
  );
}
