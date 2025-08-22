import { shortUUID } from "short-uuid";

export class Data {
  constructor(app) {
    this.files = app.files;
    this.emitter = app.emitter;

    // Geometry
    this.features = null;
    this.metadata = null;

    // Synoptiques
    this.attributes = null;
    this.selections = null;
    this.templates = null;

    // Selected Features
    this.selectedFeatures = new Set();
    this.activeFilters = {};
  }

  async loadData(paths, token) {
    await this.loadAttributes(paths["attributes"], token);
    await this.loadFeatures(paths["features"], token);
    await this.loadMetadata(paths["metadata"], token);
    await this.loadSelections(paths["selections"], token);
    await this.loadTemplates(paths["templates"], token);
    this.emitter.emit("DATA_LOADED");
  }

  async loadAttributes(path, token) {
    if (!path) {
      console.warn("No path provided for attributes");
      return;
    }
    const data = await this.loadFileData(path, token);
    this.attributes = data;
  }

  async saveAttributes(exerciceId, modelId, token) {
    if (!this.attributes) {
      console.warn("No attributes to save");
      return;
    }
    await this.files.saveJsonData(exerciceId, "ais/attributes", modelId, token, this.attributes);
  }

  async loadFeatures(path, token) {
    if (!path) {
      console.warn("No path provided for features");
      return;
    }
    const data = await this.loadFileData(path, token);
    this.features = data;
  }

  async loadMetadata(path, token) {
    if (!path) {
      console.warn("No path provided for metadata");
      return;
    }
    const data = await this.loadFileData(path, token);
    this.metadata = data;
  }

  async loadSelections(path, token) {
    if (!path) {
      console.warn("No path provided for selections");
      return;
    }
    const data = await this.loadFileData(path, token);
    this.selections = data;
  }

  async loadTemplates(path, token) {
    if (!path) {
      console.warn("No path provided for templates");
      return;
    }
    const data = await this.loadFileData(path, token);
    this.templates = data;
  }

  async loadFileData(path, token) {
    const response = await fetch(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  }

  getData() {
    return {
      attributes: this.attributes,
      features: this.features,
      metadata: this.metadata,
      selections: this.selections,
      templates: this.templates,
    };
  }

  clearData() {
    this.attributes = null;
    this.features = null;
    this.metadata = null;
    this.selections = null;
    this.templates = null;
    this.selectedFeatures.clear();
    this.activeFilters = {};
  }

  getUniqueFloorIds() {
    if (!this.metadata || this.metadata.length === 0) {
      console.warn("No parsed data available to get floor IDs.");
      return [];
    }

    const floorIds = new Set();
    this.metadata.forEach((row) => {
      if (row && row.floor_id !== undefined && row.floor_id !== null) {
        floorIds.add(row.floor_id);
      }
    });

    return Array.from(floorIds);
  }

  getMetadataPresets() {
    if (
      !this.metadata ||
      !Array.isArray(this.metadata) ||
      this.metadata.length === 0
    ) {
      console.warn("No metadata available to generate presets.");
      return {};
    }

    const keysToExtract = [
      "facility_id",
      "unit_id",
      "facility_type",
      "unit_type",
      "entity_group",
      "entity_type",
      "entity_subtype",
    ];

    const presets = {};
    keysToExtract.forEach((key) => (presets[key] = new Set()));

    this.metadata.forEach((item) => {
      if (!item) return; // Skip null/undefined items
      keysToExtract.forEach((key) => {
        const value = item[key];
        // Add value only if it's not null, undefined, or an empty string
        if (value !== null && value !== undefined && value !== "") {
          presets[key].add(value);
        }
      });
    });

    // Convert Sets to sorted Arrays
    const result = {};
    Object.keys(presets).forEach((key) => {
      result[key] = Array.from(presets[key]).sort();
    });

    return result;
  }

  getAvailablePresets(activeFilters) {
    if (
      !this.metadata ||
      !Array.isArray(this.metadata) ||
      this.metadata.length === 0
    ) {
      console.warn("No metadata available to generate available presets.");
      return {};
    }

    const keysToExtract = [
      "facility_id",
      "unit_id",
      "facility_type",
      "unit_type",
      "entity_group",
      "entity_type",
      "entity_subtype",
    ];

    // Filter metadata based on active filters
    const filteredMetadata = this.metadata.filter((item) => {
      if (!item) return false;
      return Object.entries(activeFilters).every(([key, values]) => {
        // If a filter key exists but has no selected values, it doesn't filter anything for that key
        if (!values || values.length === 0) {
          return true;
        }
        // Check if the item's value for the key is included in the selected filter values
        return values.includes(item[key]);
      });
    });

    // Extract presets from the filtered metadata
    const availablePresets = {};
    keysToExtract.forEach((key) => (availablePresets[key] = new Set()));

    filteredMetadata.forEach((item) => {
      if (!item) return;
      keysToExtract.forEach((key) => {
        const value = item[key];
        if (value !== null && value !== undefined && value !== "") {
          availablePresets[key].add(value);
        }
      });
    });

    // Convert Sets to sorted Arrays
    const result = {};
    Object.keys(availablePresets).forEach((key) => {
      result[key] = Array.from(availablePresets[key]).sort();
    });

    return result;
  }

  setActiveFilters(newFilters) {
    this.activeFilters = newFilters;
    this.emitter.emit("ACTIVE_FILTERS_CHANGED", this.activeFilters);
  }

  // --- Synoptique/Category Methods ---

  getSynoptiques() {
    return this.attributes || [];
  }

  getCategoriesForSynoptique(synoptiqueId) {
    if (!this.attributes) return [];
    const synoptique = this.attributes.find((s) => s.id === synoptiqueId);
    return synoptique ? synoptique.categories || [] : [];
  }

  async addSynoptique(name, exerciceId, modelId, token) {
    if (!name || !exerciceId || !modelId || !token) {
      console.error(
        "Missing required parameters (name, exerciceId, modelId, token) to add a synoptique."
      );
      return null;
    }

    const newSynoptique = {
      id: shortUUID.generate(),
      name: name,
      categories: [],
      mapping: {},
    };

    this.attributes.push(newSynoptique);
    this.emitter.emit("SYNOPTIQUES_LIST_CHANGED", this.attributes);

    await this.files.saveJsonData(
      exerciceId,
      "ais/attributes",
      modelId,
      token,
      this.attributes
    );
    return newSynoptique.id;
  }

  async addCategoryToSynoptique(synoptiqueId, categoryName, categoryColor, exerciceId, modelId, token) {
    if (!this.attributes || !synoptiqueId || !categoryName || !categoryColor || !exerciceId || !modelId || !token) {
        console.error("Missing required parameters to add category.");
        return null;
    }

    const synoptiqueIndex = this.attributes.findIndex((s) => s.id === synoptiqueId);
    if (synoptiqueIndex === -1) {
        console.error(`Synoptique with ID ${synoptiqueId} not found.`);
        return null;
    }

    const synoptique = this.attributes[synoptiqueIndex];

    // Ensure categories array exists
    if (!Array.isArray(synoptique.categories)) {
        synoptique.categories = [];
    }

    // Basic check for duplicate category name within the same synoptique
    if (synoptique.categories.some(cat => cat.name === categoryName)) {
        console.warn(`Category with name "${categoryName}" already exists in synoptique ${synoptiqueId}.`);
        // Decide how to handle duplicates - return null, return existing, throw error? Returning null for now.
        return null; 
    }

    const newCategory = {
        id: shortUUID.generate(),
        name: categoryName,
        color: categoryColor,
    };

    synoptique.categories.push(newCategory);

    // Update the attributes array
    this.attributes[synoptiqueIndex] = synoptique;

    // Save the entire attributes file (since categories are nested)
    try {
        await this.files.saveJsonData(
            exerciceId,
            "ais/attributes",
            modelId, // Use modelId as the file name base
            token,
            this.attributes // Save the whole updated attributes array
        );
        
        // Emit list changed event so UI can refetch/update category lists
        this.emitter.emit("CATEGORY_LIST_CHANGED", { synoptiqueId: synoptiqueId, attributes: this.attributes });
        
        return newCategory; // Return the newly created category object
    } catch (error) {
        console.error(`Core: Failed to save attributes after adding category ${newCategory.id}:`, error);
        // Attempt to revert the change in memory? Might be complex.
        // For now, just log the error and return null.
        synoptique.categories.pop(); // Basic revert
        this.attributes[synoptiqueIndex] = synoptique;
        return null;
    }
  }

  assignCategoryToFeature(synoptiqueId, categoryId, featureId) {
    if (!this.attributes || !synoptiqueId || !featureId) return false;

    const synoptiqueIndex = this.attributes.findIndex(
      (s) => s.id === synoptiqueId
    );
    if (synoptiqueIndex === -1) return false;

    const synoptique = this.attributes[synoptiqueIndex];

    // Ensure mapping object exists
    if (!synoptique.mapping) {
      synoptique.mapping = {};
    }

    let changed = false;
    // If categoryId is null/undefined, we are clearing the assignment
    if (categoryId === null || categoryId === undefined) {
      if (synoptique.mapping.hasOwnProperty(featureId)) {
        delete synoptique.mapping[featureId];
        changed = true;
      }
    } else {
      // Assign or update the category
      if (synoptique.mapping[featureId] !== categoryId) {
        synoptique.mapping[featureId] = categoryId;
        changed = true;
      }
    }

    // Only emit if a change actually occurred
    if (changed) {
      // Ensure the change is reflected in the main attributes array
      this.attributes[synoptiqueIndex] = synoptique;
      this.emitter.emit("CATEGORY_MAPPING_CHANGED", this.attributes);

      return true;
    }
    return false; 
  }
}
