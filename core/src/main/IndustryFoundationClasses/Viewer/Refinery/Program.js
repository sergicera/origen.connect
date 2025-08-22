import { apiService } from "@/services/fileSystemBackend";

export default class Program {
  constructor(app) {
    this.app = app;
    this.zones = null;
    this.defaultTypeDeZone = "LOCAL";
  }

  get HIERARCHY() {
    return {
      IFCPROJECT: "PROJECT",
      IFCSITE: "SITE",
      ETAPE: "ETAPE",
      IFCBUILDING: "BATIMENT",
      IFCBUILDINGSTOREY: "ETAGE",
      PROGRAMME: "PROGRAMME",
      ENTITEE: "ENTITEE",
      LOCAL: "LOCAL",
    };
  }

  /**
   * Main workflow to collect, enrich, and transform IFCSPACE nodes.
   */
  async compute(tree) {
    const spaceEntries = this.collectSpacesAndPaths(tree);

    const allSpaces = [];

    for (const { spaceNode, ancestors } of spaceEntries) {
      await this.enrichSpaceNode(spaceNode);

      await this.enrichWithAncestorData(spaceNode, ancestors);
      const finalNode = this.finalTransform(spaceNode);
      allSpaces.push(finalNode);
    }

    this.zones = allSpaces;
    this.app.manager.emitter.emit("SPACE_PLANNING_TREE_CHANGED");
  }

  /**
   *  Collect all IFCSPACE nodes along with their full ancestor path.
   */
  collectSpacesAndPaths(roots) {
    const results = [];

    function dfs(node, pathSoFar) {
      if (!node || !node.data) return;
      const newPath = [...pathSoFar, node];

      if (node.data.Entity === "IFCSPACE") {
        results.push({ spaceNode: node, ancestors: [...newPath] });
      }

      // Recurse to children
      if (node.children) {
        for (const child of node.children) {
          dfs(child, newPath);
        }
      }
    }

    // Start DFS from each root
    roots.forEach((root) => dfs(root, []));
    return results;
  }

  /**
   *  Enrich an IFCSPACE node with typeDeZone plus any hierarchy-based substitutions.
   */
  async enrichSpaceNode(spaceNode) {
    const expressId = spaceNode.data.expressID;

    // 1) Fetch typeDeZone
    const typeDeZone =
      (await this.app.refinery.substitutions.getValue(
        "TYPE_DE_ZONE",
        expressId
      )) || this.defaultTypeDeZone;
    spaceNode.data.typeDeZone = typeDeZone;

    // 2) Fetch AfterPlan™ hierarchy substitution values
    const overrideObj = {};
    for (const key of ["ETAPE", "PROGRAMME", "ENTITEE", "LOCAL"]) {
      overrideObj[key] = await this.app.refinery.substitutions.getValue(
        key,
        expressId
      );
    }

    spaceNode.hierarchy = overrideObj;
  }

  /**
   *  Enrich the IFCSPACE node with ancestor data from the native IFC hierarchy.
   */
  async enrichWithAncestorData(spaceNode, ancestors) {
    const nodeHierarchy = {};

    for (const ancestorNode of ancestors) {
      const entity = ancestorNode.data.Entity;
      const name = ancestorNode.data.Name;
      const key = this.HIERARCHY[entity];

      let override = null;
      if (key) {
        override = await this.app.refinery.substitutions.getValue(
          key,
          ancestorNode.data.expressID,
          name
        );
      }

      // Fill nodeHierarchy according to the entity
      switch (entity) {
        case "IFCPROJECT":
          nodeHierarchy[this.HIERARCHY.IFCPROJECT] = override || name;
          break;
        case "IFCSITE":
          nodeHierarchy[this.HIERARCHY.IFCSITE] = override || name;
          break;
        case "IFCBUILDING":
          nodeHierarchy[this.HIERARCHY.IFCBUILDING] = override || name;
          break;
        case "IFCBUILDINGSTOREY":
          nodeHierarchy[this.HIERARCHY.IFCBUILDINGSTOREY] = override || name;
          break;
        // Add more cases if needed
        default:
          break;
      }
    }

    for (const key of ["PROJECT", "SITE", "BATIMENT", "ETAGE"]) {
      spaceNode.hierarchy[key] = nodeHierarchy[key] || "-";
    }
  }

  /**
   * Flatten and rename the node structure (including data).
   */
  finalTransform(node) {
    if (!node) return null;

    // 1) Flatten `data` onto node and omit `children`
    const { data = {}, children, ...other } = node;
    const merged = { ...other, ...data };

    // 2) Destructure & rename in one line
    let {
      typeDeZone: type,
      Entity: entity,
      Name: name,
      modelID: modelId,
      expressID: expressId,
      relations,
      hierarchy = {},
    } = merged;

    // 3) Parse relations if it’s a string
    if (typeof relations === "string") {
      try {
        relations = JSON.parse(relations);
      } catch {
        relations = [];
      }
    }

    // 4) Build the final object in desired order
    return {
      name,
      type,
      modelId,
      expressId,
      entity,
      relations,
      hierarchy: {
        PROJECT: hierarchy.PROJECT,
        SITE: hierarchy.SITE,
        ETAPE: hierarchy.ETAPE,
        BATIMENT: hierarchy.BATIMENT,
        ETAGE: hierarchy.ETAGE,
        PROGRAMME: hierarchy.PROGRAMME,
        ENTITEE: hierarchy.ENTITEE,
        LOCAL: hierarchy.LOCAL,
      },
    };
  }

  /**
   * Load program JSON from a given path (if needed).
   */
  async loadProgram(path, token) {
    const file = await fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.zones = await file.json();
    this.app.manager.emitter.emit("SPACE_PLANNING_TREE_CHANGED");
  }

  /**
   * Export current program tree to the server (if needed).
   */
  async exportProgram(exerciceId, fileName, token) {
    if (!this.zones) return;

    // Create a FormData object
    const formData = new FormData();
    const relativePath = "ifc/program";
    formData.append("path", `/${relativePath}`);

    // Create a Blob from your data and append it to the FormData
    const substitutionsFile = new Blob([JSON.stringify(this.zones)], {
      type: "application/json",
    });
    const baseName = fileName.split(".")[0];
    formData.append("files", substitutionsFile, `${baseName}.json`);

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
