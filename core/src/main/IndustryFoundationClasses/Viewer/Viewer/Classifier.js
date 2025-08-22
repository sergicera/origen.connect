import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

export default class Classifier {
  constructor(app) {
    this.app = app;
    this.classifier = null;
  }

  init() {
    this.classifier = this.app.components.get(OBC.Classifier);
  }

  classify() {
    const model = this.app.fragments.model;

    if (!model) {
      console.warn("There is no model yet");
      return;
    }

    this.classifier.byModel(model.uuid, model);
    this.classifier.byEntity(model);
    this.classifier.byIfcRel(
      model,
      WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
      "storeys"
    );
  }
}
