import { BaseModule } from "@/core/src/BaseModule";
import { Viewer } from "./Viewer";
import { SynoptiquesFeature } from "./Synoptiques";
import { fileServerPaths } from "./files";
import { eventsList } from "./events";

export class IfcModule extends BaseModule {
  constructor() {
    // Services
    super("ifc", fileServerPaths, eventsList);

    // Model
    this.id = null;

    // Features
    this.viewer = null;
    this.synoptiques = new SynoptiquesFeature(this);
  }

  addViewer(divElement) {
    this.viewer = new Viewer(this, divElement);
    this.emitter.emit("CURRENT_VIEWER_CHANGED");
  }
}
