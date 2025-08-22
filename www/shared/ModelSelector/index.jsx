import { useTheme } from "@mui/material/styles";
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { useAppContext } from "@/www/store/context-provider";
import Alert from "@/www/shared/Alert";
import { NestedList } from "./NestedList";
import { Box, Divider, Snackbar, Alert as MuiAlert } from "@mui/material";
import { useEffect, useState, forwardRef, useMemo } from "react";

// Use MUI's Alert component with forwardRef to fix the ref issue
const SnackbarAlert = forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function FileSystemViewer() {
  const theme = useTheme();
  const token = useAuthToken();
  const [{ projects, exercices, models, members }, dispatch] = useAppContext();

  // Filter projects according to current member's allowed list (availableProjects)
  const visibleProjects = useMemo(() => {
    const list = projects?.list || [];
    const allowed = members?.availableProjects;
    if (!Array.isArray(allowed) || allowed.length === 0) return list;
    return list.filter((p) => allowed.includes(p.id));
  }, [projects?.list, members?.availableProjects]);

  // 1) PROJECTS
  const currentProjectId = projects?.currentProjectId ?? null;
  const handleSelectProject = (project) => {
    if (!token) return;
    const projectId = project.id;
    const newProjectId = projectId === currentProjectId ? null : projectId;

    dispatch({
      type: "FILE_SYSTEM_SELECT_PROJECT",
      payload: { projectId: newProjectId, token },
    });
  };

  // 2) EXERCICES
  const currentExerciceId = exercices?.currentExerciceId ?? null;
  const handleSelectExercice = (exercice) => {
    if (!token) return;
    const exerciceId = exercice.id;
    const newExerciceId = exerciceId === currentExerciceId ? null : exerciceId;

    dispatch({
      type: "FILE_SYSTEM_SELECT_EXERCICE",
      payload: { exerciceId: newExerciceId, token },
    });
  };

  // 3) MODELS
  const currentModelId = models?.currentModelId ?? null;
  const handleSelectModel = (model) => {
    if (!token) return;
    const modelId = model.displayName; // or model.id if that's how you identify it
    const newModelId = modelId === currentModelId ? null : modelId;

    dispatch({
      type: "FILE_SYSTEM_SELECT_MODEL",
      payload: { modelId: newModelId, token },
    });
  };

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Update Snackbar message based on selection state
  useEffect(() => {
    if (!currentProjectId) {
      setSnackbarMessage("S'il te plaît, sélectionne un projet !");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    } else if (!currentExerciceId) {
      setSnackbarMessage("S'il te plaît, sélectionne un exercice !");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    } else if (!currentModelId) {
      setSnackbarMessage("S'il te plaît, sélectionne un modèle !");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    } else {
      setSnackbarOpen(false);
    }
  }, [currentProjectId, currentExerciceId, currentModelId]);

  if (!visibleProjects || visibleProjects.length === 0) {
    return <Alert message="Aucun projet n'est disponible." />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* File System Viewer */}
      <Box
        sx={{
          py: 1,
          background: theme.palette.background.paper,
          borderRadius: 2.5,
        }}
      >
        <NestedList
          items={visibleProjects}
          currentId={currentProjectId}
          label="Projet"
          getItemId={(project) => project.id}
          getItemDisplayName={(project) => project.displayName}
          onSelect={handleSelectProject}
          renderChildren={(selectedProject) => {
            // Only render the exercices list if a project is selected
            // but also check if `selectedProject.id` is indeed the currentProjectId
            if (
              currentProjectId === null ||
              selectedProject.id !== currentProjectId
            ) {
              return null;
            }

            // If no exercices, show a message
            if (!exercices.list || exercices.list.length === 0) {
              return (
                <Alert message="Il n'y a pas encore d'exercices pour ce projet !" />
              );
            }

            return (
              <NestedList
                items={exercices.list}
                currentId={currentExerciceId}
                label="Exercice"
                getItemId={(exercice) => exercice.id}
                getItemDisplayName={(exercice) => exercice.displayName}
                onSelect={handleSelectExercice}
                renderChildren={(selectedExercice) => {
                  // Only render the models list if an exercice is selected
                  if (
                    currentExerciceId === null ||
                    selectedExercice.id !== currentExerciceId
                  ) {
                    return null;
                  }

                  // If no models, you could show a message or return null
                  if (!models.list || models.list.length === 0) {
                    return (
                      <Alert message="Il n'y a pas encore de modèles pour cet exercice !" />
                    );
                  }

                  return (
                    <NestedList
                      items={models.list}
                      currentId={currentModelId}
                      label="Modèle"
                      getItemId={(model) => model.displayName}
                      getItemDisplayName={(model) => model.displayName}
                      onSelect={handleSelectModel}
                    />
                  );
                }}
              />
            );
          }}
        />
      </Box>

      {/* Snackbar with properly forwarded ref */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarAlert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>
    </Box>
  );
}
