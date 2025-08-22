import * as OBC from "@thatopen/components";

export default class Hider {
  constructor(app) {
    this.app = app;
    this.hider = null;
    this.hidenEntities = [];
  }

  init() {
    this.hider = this.app.components.get(OBC.Hider);
  }

  get availableEntitiesNames() {
    const classes = {};
    const classNames = Object.keys(
      this.app.classifier.classifier.list.entities
    );
    for (const name of classNames) {
      classes[name] = true;
    }
    return classes;
  }

  getEntity(name) {
    const classifier = this.app.classifier.classifier;
    return classifier.find({ entities: [name] });
  }

  hideEntity(name) {
    const visible = false;
    const found = this.getEntity(name);
    this.hider.set(visible, found);

    if (!this.hidenEntities.includes(name)) {
      this.hidenEntities.push(name);
    }
  }

  unHideEntity(name) {
    const visible = true;
    const found = this.getEntity(name);
    this.hider.set(visible, found);

    const index = this.hidenEntities.indexOf(name);
    if (index > -1) {
      this.hidenEntities.splice(index, 1);
    }
  }

  isolateEntities(namesArray) {
    // First, hide every entity
    const allEntityNames = Object.keys(this.availableEntitiesNames);
    for (const entityName of allEntityNames) {
      this.hideEntity(entityName);
    }

    // Then, unhide only the specified entities
    for (const entityName of namesArray) {
      this.unHideEntity(entityName);
    }
  }

  resetEntitiesVisibility() {
    const hiddenEntitiesCopy = [...this.hidenEntities];
    for (const name of hiddenEntitiesCopy) {
      this.unHideEntity(name);
    }
  }
}
