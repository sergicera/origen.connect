import * as OBC from "@thatopen/components";

export default class Grids {
  constructor(app) {
    this.app = app;
    this.grids = null;
    this.grid = null;
  }

  create() {
    this.grids = this.app.components.get(OBC.Grids);
    this.grid = this.grids.create(this.app.world);
  }
}
