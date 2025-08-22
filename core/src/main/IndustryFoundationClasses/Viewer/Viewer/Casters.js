import * as OBC from "@thatopen/components";

export default class Casters {
  constructor(app) {
    this.app = app;
    this.casters = null;
    this.caster = null;
  }

  init() {
    this.casters = this.app.components.get(OBC.Raycasters);

    if (!this.app.world) {
      console.warn("No world found");
      return;
    }

    this.caster = this.casters.get(this.app.world);
  }
}
