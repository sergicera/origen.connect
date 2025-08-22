import * as THREE from "three";
import * as OBCF from "@thatopen/components-front";

/**
 * The `Plans` class handles the generation and management of plan views
 * in the IFC viewer application.
 * It interacts with the application's components to create plan representations from the IFC model fragments.
 */
export default class Plans {
  constructor(app) {
    this.app = app;
    this.plans = null;
    this.modelItems = null;
    this.thinItems = null;
    this.thickItems = null;
  }

  /**
   * Initializes the `Plans` component by retrieving it from the application's components.
   * Should be called after the application's components are set up.
   */
  init() {
    this.plans = this.app.components.get(OBCF.Plans);
  }

  /**
   * Generates plan representations from the IFC model fragments.
   * This method checks for the existence of the world and model before generating plans.
   * If the plans are already generated, it skips the generation.
   * @async
   */
  async generatePlansFromFragments() {
    if (!this.app.world) {
      console.warn("There is no world yet");
      return;
    }

    if (!this.app.fragments.model) {
      console.warn("There are no fragments yet");
      return;
    }

    const world = this.app.world;
    const model = this.app.fragments.model;

    this.plans.world = world;
    await this.plans.generate(model);
  }

  /**
   * Enters the plan mode by generating plans (if not already generated)
   * and navigating to the first plan in the list.
   * It also adjusts the scene's background and highlighter settings for plan mode visualization.
   * @async
   */
  async enterPlanMode() {
    if (this.plans.list.length === 0) {
      await this.generatePlansFromFragments();
      this.app.manager.emitter.emit("PLANS_LIST_CHANGED");
      this.classify();
      this.style();
    }

    // this.app.highlighter.backupColor = new THREE.Color("white");
    // this.app.classifier.classifier.setColor(
    //   this.modelItems,
    //   new THREE.Color("white")
    // );
    this.app.world.scene.three.background = new THREE.Color("#11171d");

    const plan = this.plans.list[0];
    await this.goToPlan(plan.id);
    // this.app.cullers.culler.needsUpdate.true;
  }

  /**
   * Navigates to a specific plan by its ID.
   * If the plan is found in the list, it switches to that plan view.
   * @param {string} id - The identifier of the plan to navigate to.
   * @async
   */
  async goToPlan(id) {
    let plan = null;

    if (this.plans) {
      plan = this.plans.list.find((p) => p.id === id);
    } else {
      console.warn("There are no plans yet");
      return;
    }

    if (plan) {
      await this.plans.goTo(id);
      this.app.manager.emitter.emit("currentPlanChanged");
    } else {
      console.warn("Plan not found");
      return;
    }
  }

  classify() {
    if (!this.app.fragments.model) {
      console.warn("There are no fragments yet");
      return;
    }

    const model = this.app.fragments.model;
    const classifier = this.app.classifier.classifier;

    // classifier.byModel(model.uuid, model);
    // classifier.byEntity(model);

    this.modelItems = classifier.find({ models: [model.uuid] });

    this.thickItems = classifier.find({
      entities: ["IFCWALLSTANDARDCASE", "IFCWALL", "IFCSPACE"],
    });

    this.thinItems = classifier.find({
      entities: ["IFCDOOR", "IFCWINDOW", "IFCPLATE", "IFCMEMBER"],
    });
  }

  async style() {
    const grayFill = new THREE.MeshBasicMaterial({ color: "gray", side: 2 });
    const blackLine = new THREE.LineBasicMaterial({ color: "black" });
    const blackOutline = new THREE.MeshBasicMaterial({
      color: "black",
      opacity: 0.5,
      side: 2,
      transparent: true,
    });

    const fragments = this.app.fragments.fragments;
    const edges = this.app.edges.edges;
    const world = this.app.world;

    if (!fragments || !edges || !world) {
      console.warn("Missing fragments, edges, or world");
      return;
    }

    edges.styles.create(
      "thick",
      new Set(),
      world,
      blackLine,
      grayFill,
      blackOutline
    );

    for (const fragID in this.thickItems) {
      const foundFrag = fragments.list.get(fragID);
      if (!foundFrag) continue;
      const { mesh } = foundFrag;
      edges.styles.list.thick.fragments[fragID] = new Set(
        this.thickItems[fragID]
      );
      edges.styles.list.thick.meshes.add(mesh);
    }

    edges.styles.create("thin", new Set(), world);

    for (const fragID in this.thinItems) {
      const foundFrag = fragments.list.get(fragID);
      if (!foundFrag) continue;
      const { mesh } = foundFrag;
      edges.styles.list.thin.fragments[fragID] = new Set(
        this.thinItems[fragID]
      );
      edges.styles.list.thin.meshes.add(mesh);
    }

    await edges.update(true);
  }

  /**
   * Exits the plan mode and restores the viewer to the default view.
   * Resets the scene background and highlighter color to their defaults.
   */
  async exitPlanMode() {
    this.app.highlighter.backupColor = null;
    this.app.world.scene.three.background = this.app.defaultBackground;
    this.plans.exitPlanView();
  }
}
