import shortUUID from "short-uuid";
import { Data } from "./DataManager.js";
import { Viewer } from "./Viewer";

export class SynoptiquesFeature {
  constructor(app) {
    this.id = null;
    this.data = new Data(app);
    this.emitter = app.emitter;
    this.mode = app.mode || "light";
    this.viewers = {};
  }

  getViewer(ID) {
    return this.viewers[ID] || null;
  }

  addViewer(divElement, options = {}) {
    const ID = shortUUID.generate();
    this.viewers[ID] = new Viewer(this.emitter, this.data, divElement, options);
    this.viewers[ID].id = ID;

    return ID;
  }

  removeViewer(ID) {
    delete this.viewers[ID];
  }
}
