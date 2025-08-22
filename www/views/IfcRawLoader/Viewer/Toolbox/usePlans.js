import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";

/**
 * Custom hook to manage the current viewer state.
 *
 * @returns {[string, Function]} An array containing the current viewer file name and a function to set it.
 */

export function usePlans() {
  const { getModule, subscribe } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);
  const [plansList, setPlansListState] = React.useState(
[]
  );

  const goToPlan = (plan) => ifc.viewer.plans.goToPlan(plan.id);

  React.useEffect(() => {
    const unsubscribe = subscribe((eventName, payload) => {
      if (eventName === "PLANS_LIST_CHANGED") {
        setPlansListState(ifc.viewer.plans.plans.list || []);
      }
    });
    return () => unsubscribe();
  }, [subscribe]);

  return { plansList, goToPlan };
}
