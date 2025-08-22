import * as OBC from "@thatopen/components";
//import * as OBCF from "@thatopen/components-front";

export default class Clipper {
  constructor(app) {
    this.app = app;
    this.clipper = null;
  }

  init() {
    this.clipper = this.app.components.get(OBC.Clipper);
    // this.clipper.Type = OBCF.EdgesPlane;
  }

  enable() {
    this.clipper.enabled = true;
    this.app.container.container.ondblclick = () => {
      this.clipper.create(this.app.world);
    };
  }

  disable() {
    if (this.clipper.enabled) {
      this.clipper.delete(this.app.world);
    }
    this.clipper.enabled = false;
  }
}
