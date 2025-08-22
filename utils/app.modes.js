export const getPermittedModes = (mode) => {
  if (mode === "dev") {
    return ["dev", "test", "prod"];
  } else if (mode === "test") {
    return ["test", "prod"];
  } else if (mode === "prod") {
    return ["prod"];
  }
  return ["prod"];
};
