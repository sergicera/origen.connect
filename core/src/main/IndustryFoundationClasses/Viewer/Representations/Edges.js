import * as OBCF from "@thatopen/components-front";

export default class Edges {
  constructor(app) {
    this.app = app;
    this.edges = null;
  }

  init() {
    this.edges = this.app.components.get(OBCF.ClipEdges);
  }
}
