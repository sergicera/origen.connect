import { apiService } from "@/services/fileSystemBackend";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class Files {
  constructor(emitter,configs) {
    this.emitter = emitter;
    this.configs = configs; // Array of [relativePath, extensions]
    this.contents = {};
  }

  initFileSystem(exerciceId, filesData, modelId) {
    this.contents = {};

    const contentsTemplate = this.configs.reduce(
      (acc, [relativePath, extensions]) => {
        for (const ext of extensions) {
          const name = `${relativePath}_${ext}`;
          acc[name] = {
            fileName: "",
            path: "",
            loaded: false,
          };
        }
        return acc;
      },
      {}
    );

    // Initialize base structure for the specified modelId
    let contents = JSON.parse(JSON.stringify(contentsTemplate));

    // Populate with actual file data
    for (const [relativePath, extensions] of this.configs) {
      if (!filesData[relativePath]) continue;

      const directoryName = relativePath.split("_").join("/");

      for (const filename of filesData[relativePath]) {
        const extension = filename.slice(filename.lastIndexOf(".") + 1);
        const basename = filename.slice(0, filename.lastIndexOf("."));

        // Only process files that match the modelId
        if (basename !== modelId) continue;

        // Check if this extension is one we care about
        if (extensions.includes(extension)) {
          const key = `${relativePath}_${extension}`;
          const path = `${API_BASE_URL}/static/${exerciceId}/files/${directoryName}/${filename}`;
          
          contents[key] = {
            fileName: filename,
            path,
            loaded: true,
          };
        }
      }
    }
    
    // Set this.contents directly to the contents
    this.contents = contents;
    this.emitter.emit("CONTENTS_LOADED", contents);
  }

  async saveJsonData(exerciceId, relativePath, fileName, token, data) {
    const formData = new FormData();
    formData.append("path", `/${relativePath}`);
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("files", blob, `${fileName}.json`);

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

  /**
   * Dispose of all resources to help with garbage collection
   * This method clears cached file contents and references
   */
  dispose() {
    // Clear cached file contents
    if (this.contents) {
      this.contents = {};
    }

    // Clear configuration data
    this.configs = null;

    // Clear emitter reference
    // Note: We don't clear emitter's listeners here as that's handled by BaseModule
    this.emitter = null;
  }
}