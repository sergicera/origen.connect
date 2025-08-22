import * as OBCF from "@thatopen/components-front";

export default class Highlighter {
  constructor(app) {
    this.app = app;
    this.manager = this.app.manager;
    this.emitter = this.manager.emitter;
    this.highlighter = null;
    this.propertiesTree = {};
  }

  init() {
    this.highlighter = this.app.components.get(OBCF.Highlighter);
    this.highlighter.setup({ world: this.app.world });

    // Listen for on highlight events
    this.highlighter.events.select.onHighlight.add((fragmentIdMap) => {
      this.getSelectionProperties(fragmentIdMap)
        .then((selectionPropertiesTree) => {
          this.propertiesTree = selectionPropertiesTree;
          this.emitter.emit("CURRENT_SELECTION_PROPERTIES_CHANGED", {
            selectionPropertiesTree,
          });
        })
        .catch((error) => {
          console.warn(error);
        });
    });

    // Listen for on clear events
    this.highlighter.events.select.onClear.add((fragmentIdMap) => {
      this.propertiesTree = {};
      this.emitter.emit("CURRENT_SELECTION_PROPERTIES_CHANGED", {
        selectionPropertiesTree: {},
      });
    });
  }

  async getSelectionProperties(fragmentIdMap) {
    const model = this.app.fragments.model;
    const tree = {};

    if (!model) {
      console.warn("There is no model yet");
      return;
    }

    // For each fragment, we will build a structure
    for (const fragmentId in fragmentIdMap) {
      const expressIds = fragmentIdMap[fragmentId];

      // Ensure there's a place to store data for this fragmentId
      if (!tree[fragmentId]) {
        tree[fragmentId] = [];
      }

      for (const id of expressIds) {
        // Main property
        const mainProp = await model.getProperties(id);

        // Fetch psets
        const psets = this.app.indexer.indexer.getEntityRelations(
          model,
          id,
          "IsDefinedBy"
        );

        // Prepare the data structure for this particular id
        const entry = {
          id: id,
          mainProperty: mainProp,
          psets: [],
        };

        if (psets) {
          for (const expressId of psets) {
            const prop = await model.getProperties(expressId);

            if (!prop) {
              continue;
            }

            // Resolve HasProperties (one level)
            if (prop.HasProperties && prop.HasProperties.length > 0) {
              const subPropsPromises = prop.HasProperties.map(
                async (hasPropEntry) => {
                  const subPropId = hasPropEntry.value;
                  const subProp = await model.getProperties(subPropId);
                  return subProp;
                }
              );
              prop.ResolvedHasProperties = await Promise.all(subPropsPromises);
            }

            // Resolve Quantities (one level)
            if (prop.Quantities && prop.Quantities.length > 0) {
              const subQuantitiesPromises = prop.Quantities.map(
                async (quantityEntry) => {
                  const subPropId = quantityEntry.value;
                  const subProp = await model.getProperties(subPropId);
                  return subProp;
                }
              );
              prop.ResolvedQuantities = await Promise.all(
                subQuantitiesPromises
              );
            }

            // Add this pset info to the entry
            entry.psets.push(prop);
          }
        }

        // Add the fully built entry to the fragment's array
        // TODO: there are duplicates here, we should merge them
        tree[fragmentId].push(entry);
      }
    }
    return tree;
  }

  getFragmentIdMap(payload) {
    const { modelID, expressID, relations } = payload;
    if (!modelID) return null;
    const model = this.app.fragments.fragments.groups.get(modelID);
    if (!model) return null;
    const fragmentIDMap = model.getFragmentMap([
      expressID,
      ...JSON.parse(relations ?? "[]"),
    ]);
    return fragmentIDMap;
  }

  highlightByID(payload) {
    const { modelID, expressID, relations } = payload;
    const fragmentIDMap = this.getFragmentIdMap(payload);

    // 1. Filter out fragments that do NOT include this single expressID
    for (const key of Object.keys(fragmentIDMap)) {
      const expressIds = fragmentIDMap[key];
      if (!expressIds.has(expressID)) {
        delete fragmentIDMap[key];
      }
    }

    // 2. If there's nothing left, exit
    if (!fragmentIDMap || Object.keys(fragmentIDMap).length === 0) {
      return;
    }

    // 3. Highlight only the filtered fragmentIDMap
    this.highlighter.highlightByID("select", fragmentIDMap, true, false);

    // 4. Fetch properties for what remains
    this.getSelectionProperties(fragmentIDMap)
      .then((selectionPropertiesTree) => {
        this.propertiesTree = selectionPropertiesTree;
        this.emitter.emit("CURRENT_SELECTION_PROPERTIES_CHANGED", {
          selectionPropertiesTree,
        });
      })
      .catch((error) => {
        console.warn(error);
      });
  }
}
