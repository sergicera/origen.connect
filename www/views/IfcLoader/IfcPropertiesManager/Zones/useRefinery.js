import { useEffect, useMemo, useState } from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import { useAuthToken } from "@/www/hooks/useAuthToken";
import { getHierarchyOptions } from "./refineryUtils";

export function useRefinery() {
  const token = useAuthToken();
  const { getModule, subscribe } = useCoreContext();
  const ifc = useMemo(() => getModule("ifc"), [getModule]);
  const [zones, setZonesState] = useState();
  const [substitutions, setSubstitutionsState] = useState();
  const [isModelReady, setIsModelReady] = useState(false);
  const [isZonesReady, setIsZonesReady] = useState(false);
  const [isSubstitutionsReady, setIsSubstitutionsReady] = useState(false);

  console.log("useRefinery");

  const overrideSelectOptions = useMemo(() => {
    if (!isZonesReady || !isSubstitutionsReady || !zones || zones.length === 0)
      return {};
    const result = getHierarchyOptions(zones, substitutions);
    return result;
  }, [zones, isZonesReady, isSubstitutionsReady]);

  useEffect(() => {
    console.log("Zones", zones);
  }, [zones]);

  const hierarchyOptions = useMemo(() => {
    const newOptions = { ...overrideSelectOptions };
    const ignore = ["TYPE_DE_ZONE"];
    ignore.forEach((key) => {
      if (key in newOptions) {
        delete newOptions[key];
      }
    });
    return newOptions;
  }, [overrideSelectOptions]);

  const zoneTypeOptions = useMemo(() => {
    const { TYPE_DE_ZONE } = overrideSelectOptions || {};
    return TYPE_DE_ZONE;
  }, [overrideSelectOptions]);

  const currentModelFiles = useMemo(() => {
    return ifc.files.contents || {};
  }, [ifc.files.contents]);

  // --------------------------------------
  // On load effects
  // --------------------------------------

  /**
   * Create on first load a event listener to mark model as ready.
   * This readines is trigered by a emitter in the IFC Manager.
   */
  useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "MODEL_INDEXED") {
        setIsModelReady(true);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  /**
   * Create on first load a event listener to update the zones and the program tree and mark them as ready.
   * This is trigered when the zones are recalculated by the IFC Manager.
   */
  useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "SPACE_PLANNING_TREE_CHANGED") {
        console.log("SPACE_PLANNING_TREE_CHANGED");
        const zones = ifc.viewer.refinery.spacePlanning.zones;
        setZonesState(zones);
        setIsZonesReady(true);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  /**
   * Create on first load a event listener to set the overrides state and mark it as ready.
   * This is trigered when the overrides are updated on the IFC Manager.
   */
  useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "SPACE_PLANNING_SUBSTITUTIONS_CHANGED") {
        setSubstitutionsState(ifc.viewer.refinery.substitutions.dictionary);
        setIsSubstitutionsReady(true);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  // --------------------------------------
  // On isModelReady effects
  // --------------------------------------

  /**
   * Load the Program Overrides on the IFC Manager.
   */
  useEffect(() => {
    console.log("IsModelReady", isModelReady);
    console.log("CurrentModelFiles", currentModelFiles);
    console.log("Token", token);
    if (!isModelReady || !currentModelFiles || !token) return;

    console.log("loadProgramOverrides");

    const loadProgramOverrides = async (fileData, token) => {
      const { ifc_properties_program_substitutions_json } = fileData;
      setIsSubstitutionsReady(false);
      if (ifc_properties_program_substitutions_json.loaded) {
        await ifc.viewer.refinery.substitutions.loadSubstitutions(
          ifc_properties_program_substitutions_json.path,
          token
        );
      }
    };

    loadProgramOverrides(currentModelFiles, token);
  }, [isModelReady, currentModelFiles, token]);

  /**
   * Load or compute the Program on the IFC Manager.
   */
  useEffect(() => {
    if (!isModelReady || !isSubstitutionsReady || !currentModelFiles || !token)
      return;

    console.log("loadSpacePlanning");
    console.log("CurrentModelFiles", currentModelFiles);
    console.log("isSubstitutionsReady", isSubstitutionsReady);
    console.log("isModelReady", isModelReady);

    const loadSpacePlanning = async (fileData, token) => {
      const { ifc_properties_program_json } = fileData;
      setIsZonesReady(false);

      // 1) Load the stored program
      if (ifc_properties_program_json.loaded) {
        await ifc.viewer.refinery.spacePlanning.loadProgram(ifc_properties_program_json.path, token);

      // 2) Compute the program from scratch
      } else {
        await ifc.viewer.refinery.relationTree.compute()
        const tree = ifc.viewer.refinery.relationTree.tree || null;
        if (!tree) console.warn("There is no IFC relations tree yet");
        await ifc.viewer.refinery.spacePlanning.compute(tree);
        // TODO : we used to export the space planning here
      }
    };

    loadSpacePlanning(currentModelFiles, token);
  }, [isModelReady, isSubstitutionsReady, currentModelFiles, token]);

  // --------------------------------------
  // Shared methods
  // --------------------------------------

  /**
   * Highlight elements on the viewer given the IFC native expressID.
   *
   * @param {Object} payload - Contains:
   *    @prop {String} modelID
   *    @prop {String} expressID
   *    @prop {Array} relations
   */
  function highlightByID(payload) {
    ifc.viewer.highlighter.highlightByID(payload)
  }

  return {
    highlightByID,
    hierarchyOptions,
    isModelReady,
    isZonesReady,
    isSubstitutionsReady,
    substitutions,
    zones,
    zoneTypeOptions,
  };
}
