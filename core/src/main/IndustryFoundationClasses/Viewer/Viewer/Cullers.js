import * as OBC from "@thatopen/components";

export default class Cullers {
  constructor(app) {
    this.app = app;
    this.cullers = null;
    this.culler = null;
  }

  init() {
    this.cullers = this.app.components.get(OBC.Cullers);
  }

  setCullerWithFragments() {
    this.culler = this.cullers.create(this.app.world);
    this.culler.threshold = 200;
    for (const fragment of this.fragments.model.items) {
      this.culler.add(fragment.mesh);
    }
    this.culler.needsUpdate = true;
    this.app.world.camera.controls.addEventListener("sleep", () => {
      this.culler.needsUpdate = true;
    });
  }
}
