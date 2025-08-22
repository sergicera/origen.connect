/**
 * @fileoverview Initial state for the store.
 * @module store/initial-state
 *
 * @see {@link module:store/context-provider}
 * @see {@link module:store/reducers}
 * @see {@link module:store/actions}
 *
 */

export const initialState = {
  // TODO: Tenant state
  entreprises: {
    currentEntrepriseId: null,
  },

  members: {
    availableProjects: [],
    currentMemberId: null,
  },

  affaires: {
    currentAffaire: null,
  },

  // Exercices for the current affaire
  exercices: {
    list: [],
    currentExerciceId: null,
  },

  // Files for the current exercice
  files: {},

  // Models for the current exercice
  models: {
    list: [],
    currentModelId: null,
  },

  modes: {
    currentModeId: null,
    overrideModeId: null,
  },

  // Permissions state
  permissions: {
    userPermissions: {},
  },

  // TODO: There is duplicated state with Affaires
  projects: {
    list: [],
    currentProjectId: null,
  },

  roles: {
    currentRoleId: null,
    overrideRoleId: null,
  },

  docs: {
    tree: null,
    selectedFile: null,
    content: "",
  },

  ui: {
    studio: {
      bot: false,
      main: true,
      three: false,
      render: false,
      presets: false,
      edit: false,
      map: false,
      program: false,
      graph: false,
      description: false,
      quantities: false,
      costs: false
    }
  }
};
