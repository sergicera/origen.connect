const setCurrentEntreprise = (state, payload) => {
  return {
    ...state,
    entreprises: { ...state.entreprises, currentEntrepriseId: payload },
  };
};

const setCurrentAffaire = (state, payload) => {
  return {
    ...state,
    affaires: { ...state.affaires, currentAffaire: payload },
  };
};

const setCurrentMember = (state, payload) => {
  return {
    ...state,
    members: { ...state.members, currentMemberId: payload },
  };
};

const setCurrentMemberAvailableProjects = (state, payload) => {
  return {
    ...state,
    members: { ...state.members, availableProjects: payload },
  };
};

const setCurrentRole = (state, payload) => {
  return {
    ...state,
    roles: { ...state.roles, currentRoleId: payload },
  };
};

const getAllProjects = (state, payload) => {
  return {
    ...state,
    projects: {
      ...state.projects,
      list: payload,
    },
  };
};

const selectProject = (state, payload) => {
  const isSameProject = state.projects.currentProjectId === payload.projectId;

  return {
    ...state,
    projects: {
      ...state.projects,
      currentProjectId: isSameProject ? null : payload.projectId,
    },
    exercices: {
      ...state.exercices,
      list: isSameProject ? [] : state.exercices.list,
      currentExerciceId: null,
    },
    models: {
      ...state.models,
      list: isSameProject ? [] : state.models.list,
      currentModelId: null,
    },
  };
};

const getProjectExercices = (state, payload) => {
  return {
    ...state,
    exercices: {
      ...state.exercices,
      list: payload,
    },
  };
};

const resetExercices = (state) => {
  return {
    ...state,
    exercices: {
      list: [],
      currentExerciceId: null,
    },
  };
};

const selectExercice = (state, payload) => {
  const isSameExercice =
    state.exercices.currentExerciceId === payload.exerciceId;

  return {
    ...state,
    exercices: {
      ...state.exercices,
      currentExerciceId: isSameExercice ? null : payload.exerciceId,
    },
    models: {
      ...state.models,
      list: isSameExercice ? [] : state.models.list,
      currentModelId: null,
    },
  };
};

const listExerciceFiles = (state, payload) => {
  return {
    ...state,
    files: payload,
  };
};

const listExerciceModels = (state, payload) => {
  return {
    ...state,
    models: payload,
  };
};

const selectModel = (state, payload) => {
  const isSameModel = state.models.currentModelId === payload.modelId;
  return {
    ...state,
    models: {
      ...state.models,
      currentModelId: isSameModel ? null : payload.modelId,
    },
  };
};

const clearExerciceFiles = (state) => {
  return {
    ...state,
    files: {},
  };
};

const setPermissions = (state, payload) => {
  // Expects payload to be the userPermissions object directly
  return {
    ...state,
    permissions: {
      ...state.permissions, 
      userPermissions: payload.userPermissions, 
    },
  };
};

const setCurrentMode = (state, payload) => {
  return {
    ...state,
    modes: { ...state.modes, currentModeId: payload.currentModeId },
  };
};

const setModeOverride = (state, payload) => {
  return {
    ...state,
    modes: { ...state.modes, overrideModeId: payload.overrideModeId },
  };
};

const setRoleOverride = (state, payload) => {
  return {
    ...state,
    roles: { ...state.roles, overrideRoleId: payload.overrideRoleId },
  };
};

const docsUpdate = (state, payload) => {
  return {
    ...state,
    docs: { ...state.docs, ...payload },
  };
};

const uiUpdate = (state, payload) => {
  return {
    ...state,
    ui: {
      ...state.ui,
      ...payload,
    },
  };
};

const reducers = {
  FILE_SYSTEM_INIT: getAllProjects,
  FILE_SYSTEM_SELECT_PROJECT: selectProject,
  FILE_SYSTEM_GET_PROJECT_EXERCICES: getProjectExercices,
  FILE_SYSTEM_RESET_EXERCICES: resetExercices,
  FILE_SYSTEM_SELECT_EXERCICE: selectExercice,
  FILE_SYSTEM_LIST_EXERCICE_FILES: listExerciceFiles,
  FILE_SYSTEM_RESET_EXERCICE_FILES: clearExerciceFiles,
  FILE_SYSTEM_LIST_EXERCICE_MODELS: listExerciceModels,
  FILE_SYSTEM_SELECT_MODEL: selectModel,
  SET_CURRENT_ENTREPRISE: setCurrentEntreprise,
  SET_CURRENT_AFFAIRE: setCurrentAffaire,
  SET_CURRENT_MEMBER: setCurrentMember,
  SET_CURRENT_MEMBER_AVAILABLE_PROJECTS: setCurrentMemberAvailableProjects,
  SET_CURRENT_ROLE: setCurrentRole,
  SET_CURRENT_MODE: setCurrentMode,
  SET_PERMISSIONS: setPermissions,
  SET_MODE_OVERRIDE: setModeOverride,
  SET_ROLE_OVERRIDE: setRoleOverride,
  DOCS_UPDATE: docsUpdate,
  UI_UPDATE: uiUpdate,
};

export default reducers;
