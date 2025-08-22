import { apiService } from "@/services/fileSystemBackend";
import { getModelsFromFiles } from "./action-utils";

class ActionHandler {
  constructor({ dispatch, databse, storage }) {
    this.dispatch = dispatch;
    this.database = databse;
    this.storage = storage;
  }

  async execute(action) {
    // This method will be overridden by subclasses
    // Here 'this.dispatch' can be used to dispatch further actions to the store
    throw new Error("Not implemented");
  }
}

class SetCurrentEntreprise extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetCurrentAffaire extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetCurrentMember extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetCurrentMemberAvailableProjects extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetCurrentRole extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class GetAllProjects extends ActionHandler {
  async execute(action) {
    const projects = await apiService.getAllProjects(action.payload.token);
    return { type: action.type, payload: projects };
  }
}

class SelectProject extends ActionHandler {
  async execute(action) {
    const selectedProjectId = action.payload.projectId;
    if (selectedProjectId) {
      this.dispatch({
        type: "FILE_SYSTEM_GET_PROJECT_EXERCICES",
        payload: { projectId: selectedProjectId, token: action.payload.token },
      });
    } else {
      this.dispatch({ type: "FILE_SYSTEM_RESET_EXERCICES" });
    }
    return { type: action.type, payload: action.payload };
  }
}

class GetProjectExercices extends ActionHandler {
  async execute(action) {
    const exercices = await apiService.getProjectExercices(
      action.payload.projectId,
      action.payload.token
    );
    return { type: action.type, payload: exercices };
  }
}

class ResetExercices extends ActionHandler {
  async execute(action) {
    this.dispatch({ type: "FILE_SYSTEM_RESET_EXERCICE_FILES" });
    return { type: action.type, payload: null };
  }
}

class SelectExercice extends ActionHandler {
  async execute(action) {
    const selectedExerciceId = action.payload.exerciceId;
    if (selectedExerciceId) {
      this.dispatch({
        type: "FILE_SYSTEM_LIST_EXERCICE_FILES",
        payload: {
          exerciceId: selectedExerciceId,
          token: action.payload.token,
        },
      });
    } else {
      this.dispatch({ type: "FILE_SYSTEM_RESET_EXERCICE_FILES" });
    }
    return { type: action.type, payload: action.payload };
  }
}

class ListExerciceFiles extends ActionHandler {
  async execute(action) {
    const files = await apiService.listExerciceFiles(
      action.payload.exerciceId,
      action.payload.token
    );
    if (files) {
      this.dispatch({
        type: "FILE_SYSTEM_LIST_EXERCICE_MODELS",
        payload: { files },
      });
    }
    return {
      type: action.type,
      payload: files,
    };
  }
}

class ListExerciceModels extends ActionHandler {
  async execute(action) {
    const models = getModelsFromFiles(action.payload.files);
    return { type: action.type, payload: models };
  }
}

class SelectModel extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class ResetExerciceFiles extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: null };
  }
}

class SetPermissions extends ActionHandler {
  async execute(action) {
    // Payload should be { permissions: object, isLoadingPermissions: boolean }
    return { type: action.type, payload: action.payload };
  }
}

class SetCurrentMode extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetModeOverride extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class SetRoleOverride extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class DocsUpdate extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

class UiUpdate extends ActionHandler {
  async execute(action) {
    return { type: action.type, payload: action.payload };
  }
}

const actions = {
  FILE_SYSTEM_INIT: GetAllProjects,
  FILE_SYSTEM_SELECT_PROJECT: SelectProject,
  FILE_SYSTEM_GET_PROJECT_EXERCICES: GetProjectExercices,
  FILE_SYSTEM_RESET_EXERCICES: ResetExercices,
  FILE_SYSTEM_SELECT_EXERCICE: SelectExercice,
  FILE_SYSTEM_LIST_EXERCICE_FILES: ListExerciceFiles,
  FILE_SYSTEM_RESET_EXERCICE_FILES: ResetExerciceFiles,
  FILE_SYSTEM_LIST_EXERCICE_MODELS: ListExerciceModels,
  FILE_SYSTEM_SELECT_MODEL: SelectModel,
  SET_CURRENT_ENTREPRISE: SetCurrentEntreprise,
  SET_CURRENT_AFFAIRE: SetCurrentAffaire,
  SET_CURRENT_MEMBER: SetCurrentMember,
  SET_CURRENT_MEMBER_AVAILABLE_PROJECTS: SetCurrentMemberAvailableProjects,
  SET_CURRENT_ROLE: SetCurrentRole,
  SET_CURRENT_MODE: SetCurrentMode,
  SET_PERMISSIONS: SetPermissions,
  SET_MODE_OVERRIDE: SetModeOverride,
  SET_ROLE_OVERRIDE: SetRoleOverride,
  DOCS_UPDATE: DocsUpdate,
  UI_UPDATE: UiUpdate,
};

export default actions;
