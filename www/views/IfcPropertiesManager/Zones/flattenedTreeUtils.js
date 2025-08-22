import shortUUID from "short-uuid";

// --------------------------------------
// Build Tree from Zones
// --------------------------------------

/**
 * Maps raw entity keys to display-friendly names.
 */
const ENTITY_DISPLAY_NAME_MAP = {
  IFCPROJECT: "Project",
  IFCSITE: "Site",
  IFCBUILDING: "Bâtiment",
  IFCBUILDINGSTOREY: "Etage",
  IFCSPACE: "Zone",
  PROGRAMME: "Programme",
  ENTITEE: "Entitée",
  LOCAL: "Local",
  ETAPE: "Etape",
};

/**
 * Defines the hierarchy chain for rebuilding IFC Spaces in the desired structure.
 */
const ENTITY_HIERARCHY = [
  { entity: "IFCPROJECT", key: "PROJECT" },
  { entity: "IFCSITE", key: "SITE" },
  { entity: "ETAPE", key: "ETAPE" },
  { entity: "IFCBUILDING", key: "BATIMENT" },
  { entity: "IFCBUILDINGSTOREY", key: "ETAGE" },
  { entity: "PROGRAMME", key: "PROGRAMME" },
  { entity: "ENTITEE", key: "ENTITEE" },
  { entity: "LOCAL", key: "LOCAL" },
];

/**
 * Generates a new unique identifier using `short-uuid`.
 * @returns {string} A new unique identifier.
 */
function generateNewId() {
  return shortUUID.generate();
}

/**
 * Returns a user-friendly display name for a given IFC entity type.
 * @param {string} rawEntity - The raw entity type (e.g., "IFCPROJECT").
 * @returns {string} Display-friendly name, or the original entity if not found.
 */
function getDisplayName(rawEntity) {
  return ENTITY_DISPLAY_NAME_MAP[rawEntity] || rawEntity;
}

/**
 * Retrieves a value from a space node, checking `substitutions` first, then `hierarchy`.
 * @param {Object} spaceNode - The space node to retrieve a value from.
 * @param {string} key - The key to look up in `substitutions` or `hierarchy`.
 * @returns {string} The found value, or an empty string if not present.
 */
function getFinalValue(spaceNode, key) {
  if (spaceNode.substitutions?.[key]) {
    return spaceNode.substitutions[key];
  }
  if (spaceNode.hierarchy?.[key]) {
    return spaceNode.hierarchy[key];
  }
  return "";
}

/**
 * Searches through an array of children to find or create a node by its entity and name.
 * @param {Array} children - An array of child nodes.
 * @param {string} entity - The IFC entity type (e.g., "IFCBUILDINGSTOREY").
 * @param {string} name - The name of the node (e.g., "Ground Floor").
 * @returns {Object} The existing or newly created node.
 */
function findOrCreateNode(children, entity, name) {
  let found = children.find(
    (child) => child.entity === entity && child.name === name
  );

  if (!found) {
    found = {
      id: generateNewId(),
      name,
      type: getDisplayName(entity),
      entity,
      children: [],
    };
    children.push(found);
  }

  return found;
}

/**
 * Rebuilds a hierarchical tree of IFC Spaces from a set of root nodes,
 * grouping them according to the predefined ENTITY_HIERARCHY.
 * @param {Array} rootNodes - Array of root nodes from the IFC model.
 * @returns {Array} A new array of root nodes representing the hierarchical tree.
 */
export function rebuildTreeFromZones(ifcSpaces = []) {
  const newRoots = [];

  ifcSpaces.forEach((spaceNode) => {
    let currentChildren = newRoots;
    let currentParent = null;

    // Find the target hierarchy entry based on the zone's type
    const targetEntry = ENTITY_HIERARCHY.find(
      (entry) => entry.key === spaceNode.type
    );
    const targetDepth = targetEntry
      ? ENTITY_HIERARCHY.indexOf(targetEntry)
      : ENTITY_HIERARCHY.length - 1;

    // Loop only up to the target hierarchy level
    for (let i = 0; i <= targetDepth; i++) {
      const { entity, key } = ENTITY_HIERARCHY[i];
      const finalName = getFinalValue(spaceNode, key);
      currentParent = findOrCreateNode(currentChildren, entity, finalName);
      currentChildren = currentParent.children;
    }

    currentChildren.push({
      ...spaceNode,
      id: spaceNode.id ?? generateNewId(),
    });
  });

  return newRoots;
}

// --------------------------------------
// Flatten tree
// --------------------------------------

export function flattenTree(nodes, expandedIds, parentId = null, depth = 0) {
  return nodes.reduce((acc, node) => {
    const isExpanded = expandedIds.has(node.id);

    acc.push({
      ...node,
      parentId,
      depth,
      hasChildren: node.children?.length > 0,
    });

    if (node.children && isExpanded) {
      acc.push(...flattenTree(node.children, expandedIds, node.id, depth + 1));
    }
    return acc;
  }, []);
}

// --------------------------------------
// Utilities
// --------------------------------------

export function findNodeByExpressId(flattenedNodes, targetExpressId) {
  if (!targetExpressId) return null;
  return flattenedNodes.find(
    (node) =>
      typeof node.expressId === "number" && node.expressId === targetExpressId
  );
}
