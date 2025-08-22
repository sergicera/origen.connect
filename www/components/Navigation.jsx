import React, { useMemo, useState, useEffect } from "react";
import { useAppContext } from "@/www/store/context-provider";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useAuthToken } from "@/www/hooks/useAuthToken";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";

import AppsIcon from "@mui/icons-material/Apps";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function Navigation({
  drawerOpen,
  config = { p: true, e: true, m: true },
}) {
  const theme = useTheme();
  const token = useAuthToken();
  const [{ projects, exercices, models, members }, dispatch] = useAppContext();

  const [appsOpen, setAppsOpen] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [exercicesExpanded, setExercicesExpanded] = useState(false);
  const [modelsExpanded, setModelsExpanded] = useState(false);

  // Filter projects according to current member's allowed list
  const visibleProjects = useMemo(() => {
    const list = Array.isArray(projects?.list) ? projects.list : [];
    const allowed = members?.availableProjects;
    if (!Array.isArray(allowed) || allowed.length === 0) return list;
    return list.filter((p) => allowed.includes(p.id));
  }, [projects?.list, members?.availableProjects]);

  const currentProjectId = projects?.currentProjectId ?? null;
  const currentExerciceId = exercices?.currentExerciceId ?? null;
  const currentModelId = models?.currentModelId ?? null;

  useEffect(() => {
    if (!token || !projects?.list?.length) return;
    const savedProjectId = localStorage.getItem("currentProjectId");
    if (savedProjectId && !currentProjectId) {
      const projectExists = projects.list.some((p) => p.id === savedProjectId);
      if (projectExists) {
        dispatch({
          type: "FILE_SYSTEM_SELECT_PROJECT",
          payload: { projectId: savedProjectId, token },
        });
      } else {
        localStorage.removeItem("currentProjectId");
        localStorage.removeItem("currentExerciceId");
        localStorage.removeItem("currentModelId");
      }
    }
  }, [token, projects.list, currentProjectId, dispatch]);

  useEffect(() => {
    if (!token || !currentProjectId || !exercices?.list?.length) return;
    const savedExerciceId = localStorage.getItem("currentExerciceId");
    if (savedExerciceId && !currentExerciceId) {
      const exerciceExists = exercices.list.some(
        (e) => e.id === savedExerciceId
      );
      if (exerciceExists) {
        dispatch({
          type: "FILE_SYSTEM_SELECT_EXERCICE",
          payload: { exerciceId: savedExerciceId, token },
        });
      } else {
        localStorage.removeItem("currentExerciceId");
        localStorage.removeItem("currentModelId");
      }
    }
  }, [token, currentProjectId, exercices.list, currentExerciceId, dispatch]);

  useEffect(() => {
    if (!token || !currentExerciceId || !models?.list?.length) return;
    const savedModelId = localStorage.getItem("currentModelId");
    if (savedModelId && !currentModelId) {
      const modelExists = models.list.some(
        (m) => m.displayName === savedModelId
      );
      if (modelExists) {
        dispatch({
          type: "FILE_SYSTEM_SELECT_MODEL",
          payload: { modelId: savedModelId, token },
        });
      } else {
        localStorage.removeItem("currentModelId");
      }
    }
  }, [token, currentExerciceId, models.list, currentModelId, dispatch]);

  const currentProjectName = useMemo(() => {
    const project = Array.isArray(projects?.list)
      ? projects.list.find((p) => p.id === currentProjectId) || null
      : null;
    return project?.displayName || null;
  }, [projects, currentProjectId]);

  const currentExerciceName = useMemo(() => {
    const exercice = Array.isArray(exercices?.list)
      ? exercices.list.find((e) => e.id === currentExerciceId) || null
      : null;
    return exercice?.displayName || null;
  }, [exercices, currentExerciceId]);

  const handleSelectProject = (project) => {
    if (!token) return;

    const isSameProject = currentProjectId === project.id;
    if (isSameProject) {
      localStorage.removeItem("currentProjectId");
    } else {
      localStorage.setItem("currentProjectId", project.id);
    }
    localStorage.removeItem("currentExerciceId");
    localStorage.removeItem("currentModelId");

    dispatch({
      type: "FILE_SYSTEM_SELECT_PROJECT",
      payload: { projectId: project.id, token },
    });
    setProjectsExpanded(false);
  };

  const handleSelectExercice = (exercice) => {
    if (!token) return;

    const isSameExercice = currentExerciceId === exercice.id;
    if (isSameExercice) {
      localStorage.removeItem("currentExerciceId");
    } else {
      localStorage.setItem("currentExerciceId", exercice.id);
    }
    localStorage.removeItem("currentModelId");

    dispatch({
      type: "FILE_SYSTEM_SELECT_EXERCICE",
      payload: { exerciceId: exercice.id, token },
    });
    setExercicesExpanded(false);
  };

  const handleSelectModel = (model) => {
    if (!token) return;

    const isSameModel = currentModelId === model.displayName;
    if (isSameModel) {
      localStorage.removeItem("currentModelId");
    } else {
      localStorage.setItem("currentModelId", model.displayName);
    }

    dispatch({
      type: "FILE_SYSTEM_SELECT_MODEL",
      payload: { modelId: model.displayName, token },
    });
    setModelsExpanded(false);
  };

  // Determine warning states
  const showProjectWarning = config.p && !currentProjectId;
  const showExerciceWarning =
    config.e && currentProjectId && !currentExerciceId;
  const showModelWarning =
    config.m && currentProjectId && currentExerciceId && !currentModelId;

  return (
    <Box>
      <List dense>
        <ListItemButton onClick={() => setAppsOpen(!appsOpen)}>
          <ListItemIcon>
            <AppsIcon
              sx={{
                color:
                  theme.palette.mode === "light"
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
              }}
            />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      theme.palette.mode === "light"
                        ? theme.palette.text.secondary
                        : theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Navigateur
                </Typography>
              }
            />
          )}
        </ListItemButton>
      </List>

      {drawerOpen && (
        <Collapse in={appsOpen} timeout="auto" unmountOnExit>
          <Box
            sx={{
              py: 1,
              background: alpha(theme.palette.background.paper, 0),
              borderRadius: 2.5,
            }}
          >
            <List disablePadding dense>
              {/* Project Item */}
              {config.p && (
                <>
                  <ListItemButton
                    onClick={() => setProjectsExpanded(!projectsExpanded)}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "transparent" },
                      alignItems: "center",
                    }}
                  >
                    <ListItemIcon>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            color: currentProjectId
                              ? theme.palette.background.paper
                              : showProjectWarning
                              ? theme.palette.warning.main
                              : "text.disabled",
                            backgroundColor: currentProjectId
                              ? "#08A89D"
                              : showProjectWarning
                              ? alpha(theme.palette.warning.main, 0.1)
                              : "transparent",
                            borderRadius: "3px",
                            border: `1px solid ${
                              currentProjectId
                                ? "#08A89D"
                                : showProjectWarning
                                ? theme.palette.warning.main
                                : theme.palette.divider
                            }`,
                            px: 1,
                            mr: 2,
                            width: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          P
                        </Typography>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={currentProjectName || "Sélectionner un projet"}
                      primaryTypographyProps={{
                        sx: {
                          color: currentProjectId
                            ? "text.secondary"
                            : showProjectWarning
                            ? theme.palette.warning.dark
                            : "text.secondary",
                          fontWeight:
                            showProjectWarning && !currentProjectId ? 500 : 400,
                        },
                      }}
                    />
                    {projectsExpanded ? (
                      <ExpandLess sx={{ color: "text.disabled" }} />
                    ) : (
                      <ExpandMore sx={{ color: "text.disabled" }} />
                    )}
                  </ListItemButton>

                  <Collapse in={projectsExpanded} timeout="auto" unmountOnExit>
                    <List disablePadding dense sx={{ pl: 7 }}>
                      {visibleProjects.map((project) => (
                        <ListItemButton
                          key={project.id}
                          onClick={() => handleSelectProject(project)}
                          selected={currentProjectId === project.id}
                          sx={{
                            py: 0.5,
                            "&.Mui-selected": {
                              backgroundColor: "background.paper",
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "background.paper",
                            },
                          }}
                        >
                          <ListItemText
                            primary={project.displayName}
                            primaryTypographyProps={{
                              sx: {
                                color:
                                  currentProjectId === project.id
                                    ? "text.secondary"
                                    : "text.disabled",
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}

              {/* Exercise Item */}
              {config.e && (
                <>
                  <ListItemButton
                    onClick={() => setExercicesExpanded(!exercicesExpanded)}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "transparent" },
                      alignItems: "center",
                    }}
                    disabled={!currentProjectId}
                  >
                    <ListItemIcon>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            color: currentExerciceId
                              ? theme.palette.background.paper
                              : showExerciceWarning
                              ? theme.palette.warning.main
                              : "text.disabled",
                            backgroundColor: currentExerciceId
                              ? "#08A89D"
                              : showExerciceWarning
                              ? alpha(theme.palette.warning.main, 0.1)
                              : "transparent",
                            borderRadius: "3px",
                            border: `1px solid ${
                              currentExerciceId
                                ? "#08A89D"
                                : showExerciceWarning
                                ? theme.palette.warning.main
                                : theme.palette.divider
                            }`,
                            px: 1,
                            mr: 2,
                            width: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          E
                        </Typography>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        currentExerciceName || "Sélectionner un exercice"
                      }
                      primaryTypographyProps={{
                        sx: {
                          color: currentExerciceId
                            ? "text.secondary"
                            : showExerciceWarning
                            ? theme.palette.warning.dark
                            : "text.secondary",
                          fontWeight:
                            showExerciceWarning && !currentExerciceId
                              ? 500
                              : 400,
                        },
                      }}
                    />
                    {currentProjectId &&
                      (exercicesExpanded ? (
                        <ExpandLess sx={{ color: "text.disabled" }} />
                      ) : (
                        <ExpandMore sx={{ color: "text.disabled" }} />
                      ))}
                  </ListItemButton>

                  <Collapse
                    in={exercicesExpanded && currentProjectId}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List disablePadding dense sx={{ pl: 7 }}>
                      {exercices?.list?.map((exercice) => (
                        <ListItemButton
                          key={exercice.id}
                          onClick={() => handleSelectExercice(exercice)}
                          selected={currentExerciceId === exercice.id}
                          sx={{
                            py: 0.5,
                            "&.Mui-selected": {
                              backgroundColor: "background.paper",
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "background.paper",
                            },
                          }}
                        >
                          <ListItemText
                            primary={exercice.displayName}
                            primaryTypographyProps={{
                              sx: {
                                color:
                                  currentExerciceId === exercice.id
                                    ? "text.secondary"
                                    : "text.disabled",
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}

              {/* Model Item */}
              {config.m && (
                <>
                  <ListItemButton
                    onClick={() => setModelsExpanded(!modelsExpanded)}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "transparent" },
                      alignItems: "center",
                    }}
                    disabled={!currentExerciceId}
                  >
                    <ListItemIcon>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            color: currentModelId
                              ? theme.palette.background.paper
                              : showModelWarning
                              ? theme.palette.warning.main
                              : "text.disabled",
                            backgroundColor: currentModelId
                              ? "#08A89D"
                              : showModelWarning
                              ? alpha(theme.palette.warning.main, 0.1)
                              : "transparent",
                            borderRadius: "3px",
                            border: `1px solid ${
                              currentModelId
                                ? "#08A89D"
                                : showModelWarning
                                ? theme.palette.warning.main
                                : theme.palette.divider
                            }`,
                            px: 1,
                            mr: 2,
                            width: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          M
                        </Typography>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={currentModelId || "Sélectionner un modèle"}
                      primaryTypographyProps={{
                        sx: {
                          color: currentModelId
                            ? "text.secondary"
                            : showModelWarning
                            ? theme.palette.warning.dark
                            : "text.secondary",
                          fontWeight:
                            showModelWarning && !currentModelId ? 500 : 400,
                        },
                      }}
                    />
                    {currentExerciceId &&
                      (modelsExpanded ? (
                        <ExpandLess sx={{ color: "text.disabled" }} />
                      ) : (
                        <ExpandMore sx={{ color: "text.disabled" }} />
                      ))}
                  </ListItemButton>

                  <Collapse
                    in={modelsExpanded && currentExerciceId}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List disablePadding dense sx={{ pl: 7 }}>
                      {models?.list?.map((model) => (
                        <ListItemButton
                          key={model.displayName}
                          onClick={() => handleSelectModel(model)}
                          selected={currentModelId === model.displayName}
                          sx={{
                            py: 0.5,
                            "&.Mui-selected": {
                              backgroundColor: "background.paper",
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "background.paper",
                            },
                          }}
                        >
                          <ListItemText
                            primary={model.displayName}
                            primaryTypographyProps={{
                              sx: {
                                color:
                                  currentModelId === model.displayName
                                    ? "text.secondary"
                                    : "text.disabled",
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </List>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
