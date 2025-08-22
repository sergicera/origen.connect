import shortUUID from "short-uuid";

export function getModelsFromFiles(files) {
  const uniqueBaseNames = new Set(
    Object.values(files).flatMap((fileArray) =>
      fileArray.map((file) => {
        const dotIndex = file.lastIndexOf(".");
        return dotIndex !== -1 ? file.substring(0, dotIndex) : file;
      })
    )
  );

  return {
    list: Array.from(uniqueBaseNames).map((model) => ({
      id: shortUUID.generate(),
      displayName: model,
      description: null,
    })),
    currentModelId: null,
  };
}
