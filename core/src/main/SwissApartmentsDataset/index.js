import { BaseModule } from "@/core/src/BaseModule";
import { AxonometryViewer } from "./Viewer/AxonometryViewer";
import { FloorPlanViewer } from "./Viewer/FloorPlanViewer";
import { DataManager } from "./DataManager.js";
import shortUUID from "short-uuid";
import { fileServerPaths } from "./files";
import { eventsList } from "./events";

export class SapModule extends BaseModule {
  constructor() {
    // Services
    super("sap", fileServerPaths, eventsList);

    // Model
    this.id = null;

    // Features
    this.viewers = {};
    this.dataManager = new DataManager(this);

    // Default configurations
    this.mode = "dark";
  }

  getViewer(ID) {
    return this.viewers[ID] || null;
  }

  addViewer(divElement, options = {}) {
    const ID = shortUUID.generate();

    // Default configurations
    options = {
      type: "axonometric",
      palette: "light",
      floorId: null,
      ...options
    };

    switch (options.type) {
      case "axonometric":
        this.viewers[ID] = new AxonometryViewer(this, this.dataManager, divElement, options);
        this.viewers[ID].id = ID;
        break;
      case "floorplan":
        this.viewers[ID] = new FloorPlanViewer(this, this.dataManager, divElement, options);
        this.viewers[ID].id = ID;
        break;
      default:
        throw new Error(`Viewer type "${this.options.type}" is not supported.`);
    }
    return ID;
  }

  removeViewer(ID) {
    delete this.viewers[ID];
  }

  setMode(mode) {
    this.mode = mode;
    this.emitter.emit("MODE_CHANGED", mode);
  }
}
