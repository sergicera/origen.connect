export default class PostProduction {
  constructor(app) {
    this.app = app;
    this.postproduction = null;
    this.ao = null;
  }

  init() {
    const { postproduction } = this.app.world.renderer;
    const { grids } = this.app;
    this.postproduction = postproduction;
    this.postproduction.enabled = true;
    this.postproduction.customEffects.excludedMeshes.push(grids.grid.three);
    this.ao = this.postproduction.n8ao.configuration;
  }
}
