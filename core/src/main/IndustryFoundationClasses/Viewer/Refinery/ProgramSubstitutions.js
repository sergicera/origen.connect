import { apiService } from "@/services/fileSystemBackend";

export default class Substitutions {
  constructor(app) {
    this.app = app;
    this.dictionary = {};
  }

  get defaultSubstitutions() {
    return {
      PROJECT: {
        source: null,
        select: [],
        overrides: null,
      },
      SITE: {
        source: null,
        select: [],
        overrides: null,
      },
      ETAPE: {
        source: null,
        select: ["Existant", "Démolition", "Construction"],
        overrides: null,
      },
      BATIMENT: {
        source: null,
        select: [],
        overrides: null,
      },
      ETAGE: {
        source: null,
        select: [],
        overrides: null,
      },
      PROGRAMME: {
        source: null,
        select: [
          "Administratif",
          "Education",
          "Industrie",
          "Habitation",
          "Parking",
        ],
        overrides: null,
      },
      ENTITEE: {
        source: null,
        select: [],
        overrides: null,
      },
      LOCAL: {
        source: null,
        select: [],
        overrides: null,
      },
      TYPE_DE_ZONE: {
        source: null,
        select: ["BATIMENT", "ETAGE", "PROGRAME", "ENTITEE", "LOCAL"],
        overrides: null,
      },
    };
  }

  async loadSubstitutions(path, token) {
    const file = await fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.dictionary = (await file.json()) || {};
    this.app.manager.emitter.emit("SPACE_PLANNING_SUBSTITUTIONS_CHANGED");
  }

  patchSubstitutions(substitution) {
    this.dictionary = { ...this.dictionary, ...substitution };
  }

  /**
   * The main method for processing dictionary entries to extract and translate IFC property data.
   * If the associated dictionary entry specifies `type: "Property"`, this method calls `getPsetPropertyValue()`
   * to fetch the property and applies any translator array defined in the dictionary.
   *
   * @param {string} key - The label representing the property or stage (e.g. "Etape").
   * @param {number} expressId - The IFC Express ID of the target element.
   * @param {string} originalValue - The original value of the property to be translated.
   * @returns {?any} The translated property value, or null if no match is found.
   */
  async getValue(key, expressId, originalValue = null) {
    const dictEntry = this.dictionary[key];
    const { source, overrides } = dictEntry;

    let value = originalValue;

    // 1) Fetch the original value from the IFC model
    if (source) {
      switch (source.type) {
        case "pset":
          value = await this.getPsetPropertyValue(
            expressId,
            source.name,
            source.property
          );
          break;

        case "qtos":
          value = await this.getPsetQuantityValue(
            expressId,
            source.name,
            source.property
          );
          break;
        default:
          value = null;
          console.warn(`Unsupported type: ${source.type}`);
      }
    }

    // 2) Apply user override
    if (!overrides) return value;

    if (typeof overrides === "string") {
      value = overrides;
    }

    if (Array.isArray(overrides)) {
      for (const override of overrides) {
        const [valuesToCheck, translatedValue] = override;
        value = valuesToCheck.includes(value) ? translatedValue : value;
      }
    }

    return value;
  }

  /**
   * Retrieves the nominal value of a specified property from a given IFC property set (Pset).
   *
   * @param {number} expressId - The IFC Express ID of the element.
   * @param {string} psetName - The name of the Pset to look up.
   * @param {string} propertyName - The name of the property within that Pset.
   * @returns {any} Returns the NominalValue if found, otherwise undefined.
   */
  async getPsetPropertyValue(expressId, psetName, propertyName) {
    const psetIds = this.app.indexer.indexer.getEntityRelations(
      this.app.fragments.model,
      expressId,
      "IsDefinedBy"
    );
    if (!psetIds || psetIds.length === 0) {
      return null;
    }

    for (const psetId of psetIds) {
      const pset = await this.app.fragments.model.getProperties(psetId);
      if (!pset) continue;

      // Check if the pset's "Name.value" matches the psetName we're looking for
      if (pset.Name && pset.Name.value === psetName) {
        if (pset.HasProperties && pset.HasProperties.length > 0) {
          pset.ResolvedHasProperties = await Promise.all(
            pset.HasProperties.map(async (hasPropEntry) => {
              const subPropId = hasPropEntry.value;
              return await this.app.fragments.model.getProperties(subPropId);
            })
          );

          // Find the property whose Name.value matches propertyName
          const matchedProperty = pset.ResolvedHasProperties.find(
            (p) => p?.Name?.value === propertyName
          );

          // If found and it has a NominalValue, return it
          if (matchedProperty?.NominalValue?.value) {
            return matchedProperty.NominalValue.value;
          }
        }
      }
    }

    // If we exhaust everything and don't find a match, return null
    return null;
  }

  /**
   * Retrieves a quantity (e.g., an IFCQuantityLength) from a specified IFC property set (Pset).
   * Similar logic to getPsetPropertyValue, but focusing on "Quantities"
   * rather than "HasProperties".
   *
   * @param {number} expressId   - The IFC Express ID of the element.
   * @param {string} psetName    - The name of the Pset to look up.
   * @param {string} quantityName - The name of the quantity within that Pset.
   * @returns {any} Returns the quantity value if found (e.g., .Value of an IFCQuantityLength), otherwise null.
   */
  async getPsetQuantityValue(expressId, psetName, quantityName) {
    const psetIds = this.app.indexer.indexer.getEntityRelations(
      this.app.fragments.model,
      expressId,
      "IsDefinedBy"
    );
    if (!psetIds || psetIds.length === 0) {
      return null;
    }

    // Loop over each Pset ID and check if its Name.value matches the one we want
    for (const psetId of psetIds) {
      const pset = await this.app.fragments.model.getProperties(psetId);
      if (!pset) continue;

      if (pset.Name?.value !== psetName) continue;

      // If we found a matching Pset, check if it has Quantities
      if (pset.Quantities && pset.Quantities.length > 0) {
        // Resolve the quantity objects
        pset.ResolvedQuantities = await Promise.all(
          pset.Quantities.map(async (quantityEntry) => {
            const subQuantityId = quantityEntry.value;
            return await this.app.fragments.model.getProperties(subQuantityId);
          })
        );

        // Find the quantity whose Name.value matches quantityName
        const matchedQuantity = pset.ResolvedQuantities.find(
          (q) => q?.Name?.value === quantityName
        );

        // For IFCQuantityLength, IFCQuantityArea, IFCQuantityVolume, etc.,
        // the actual numeric value might be in matchedQuantity?.Value
        if (matchedQuantity?.LenghtValue !== undefined) {
          return matchedQuantity.LenghtValue;
        }
      }
    }

    // If no match found, return null
    return null;
  }

  async exportSubstitutions(exerciceId, fileName, token) {
    if (!this.dictionary) return;

    // Create a FormData object
    const formData = new FormData();
    const relativePath = "ifc/program/substitutions";
    formData.append("path", `/${relativePath}`);

    // Create a Blob from your data and append it to the FormData
    const baseName = fileName.split(".")[0];
    const substitutionsFile = new Blob([JSON.stringify(this.dictionary)], {
      type: "application/json",
    });
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
