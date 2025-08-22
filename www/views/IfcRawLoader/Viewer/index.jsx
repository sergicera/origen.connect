import React from "react";
import { useAppContext } from "@/www/store/context-provider";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useAuthToken } from "@/www/hooks/useAuthToken";

export default function ThreeDViewer() {
  const theme = useTheme();
  const ref = React.useRef(null);
  const token = useAuthToken();
  const [{ exercices, files, models }] = useAppContext();

  const { getModule } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);

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

  React.useEffect(() => {
    if (
      !ref.current ||
      !currentExerciceId ||
      !currentModelId ||
      !availableFilesForCurrentModel ||
      !ifc
    )
      return;

    // Cleanup any existing canvases before creating a new one
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    ifc.files.initFileSystem(
      currentExerciceId,
      availableFilesForCurrentModel,
      currentModelId
    );

    ifc.addViewer(ref.current);

    const { ifc_fragments_frag, ifc_fragments_json, ifc_indexation_json } =
    ifc.files.contents;

    const loadFragments = async () => {
      await ifc.viewer.fragments.loadFragments(
        ifc_fragments_frag.path,
        ifc_fragments_json.path,
        token
      );
      ifc.viewer.clipper.enable();
      // TODO : load indexatrion instead of process it
      await ifc.viewer.indexer.process();
      await new Promise((resolve) => setTimeout(resolve, 5000));
      ifc.viewer.classifier.classify();
    };

    if (
      ifc_fragments_frag.loaded &&
      ifc_fragments_json.loaded &&
      ifc_indexation_json.loaded
    ) {
      loadFragments();
    }
  }, [
    ifc,
    currentExerciceId,
    currentModelId,
    availableFilesForCurrentModel,
    token,
  ]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "500px",
      }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* The IfcViewer will attach the Three.js canvas here */}
      </div>
    </Box>
  );
}
