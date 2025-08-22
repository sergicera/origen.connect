import React from "react";
import { useCoreContext } from "@/core/CoreContextProvider";
import Files from "./Files";

export default function CurrentFileViewer() { 
  const { getModule } = useCoreContext();
  const ifc = React.useMemo(() => getModule("ifc"), [getModule]);

  const contents = React.useMemo(() => {
    return ifc?.files?.contents || null;
  }, [ifc]);

  return (
    <Files contents={contents} />
  );
}