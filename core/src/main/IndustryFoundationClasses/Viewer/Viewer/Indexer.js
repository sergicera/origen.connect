import * as OBC from "@thatopen/components";
import { apiService } from "@/services/fileSystemBackend";

export default class Indexer {
  constructor(app) {
    this.app = app;
    this.indexer = null;
  }

  init() {
    this.indexer = this.app.components.get(OBC.IfcRelationsIndexer);
  }

  async process() {
    const model = this.app.fragments.model;

    if (!model) {
      console.warn("There is no model yet");
      return;
    }
    await this.indexer.process(model);
    this.app.manager.emitter.emit("MODEL_INDEXED");
  }

  async loadIndexation(path, token) {
    const model = this.app.fragments.model;

    if (!model) {
      console.warn("There is no model yet");
      return;
    }

    const file = await fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const relations = this.indexer.getRelationsMapFromJSON(await file.text());
    this.indexer.setRelationMap(model, relations);
  }

  async exportIndexation(exerciceId, fileName, token) {
    const model = this.app.fragments.model;

    if (!model) {
      console.warn("There is no model yet");
      return;
    }

    // Create a FormData object
    const formData = new FormData();
    const relativePath = "ifc/indexation";
    formData.append("path", `/${relativePath}`);

    const newFileName = fileName.split(".")[0];
    const jsonData = this.indexer.serializeModelRelations(model);
    const file = new Blob([JSON.stringify(jsonData)], {
      type: "application/json",
    });
    formData.append("files", file, `${newFileName}.json`);

    try {
      const response = await apiService.addFilesToExerciceOnFolder(
        exerciceId,
        formData,
        token
      );
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  }
}
