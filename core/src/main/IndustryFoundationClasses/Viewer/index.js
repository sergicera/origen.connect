import * as OBC from "@thatopen/components";
// import * as OBCF from "@thatopen/components-front";

import Container from "./Viewer/Container";
import Grids from "./Viewer/Grids";
import Fragments from "./Viewer/Fragments";
import Classifier from "./Viewer/Classifier";
import Indexer from "./Viewer/Indexer";
import Highlighter from "./Viewer/Highlighter";
import Cullers from "./Viewer/Cullers";
import Casters from "./Viewer/Casters";
import Hider from "./Viewer/Hider";
import PostProduction from "./Viewer/PostProduction";

import Clipper from "./Representations/Clipper";
import Edges from "./Representations/Edges";
import Plans from "./Representations/Plans";

import IFCTree from "./Refinery/IFCTree";
import Substitutions from "./Refinery/ProgramSubstitutions";
import Program from "./Refinery/Program";

export class Viewer {
  constructor(manager, divElement) {
    this.id = null;
    this.manager = manager;
    this.metadata = { displayName: null, description: null };

    this.container = new Container(this, divElement);
    this.components = new OBC.Components();
    this.worlds = null;
    this.world = null;
    this.grids = new Grids(this);
    this.fragments = new Fragments(this);
    this.indexer = new Indexer(this);
    this.classifier = new Classifier(this);
    this.highlighter = new Highlighter(this);
    this.cullers = new Cullers(this);
    this.casters = new Casters(this);
    this.hider = new Hider(this);
    this.postproduction = new PostProduction(this);

    this.clipper = new Clipper(this);
    this.edges = new Edges(this);
    this.plans = new Plans(this);

    this.refinery = {
      relationTree: new IFCTree(this),
      substitutions: new Substitutions(this),
      spacePlanning: new Program(this),
    };

    this.defaultBackground = null;
    this.initializeWorld();
  }

  initializeWorld() {
    this.worlds = this.components.get(OBC.Worlds);
    this.createWorld();
    this.grids.create();
    this.components.init();
    this.fragments.init();
    this.indexer.init();
    this.plans.init();
    this.highlighter.init();
    // this.cullers.init();
    this.classifier.init();
    this.edges.init();
    this.casters.init();
    this.clipper.init();
    this.hider.init();
    // this.postproduction.init();
  }

  createWorld() {
    this.world = this.worlds.create();
    this.world.scene = new OBC.SimpleScene(this.components);
    // this.world.scene.three.background = null;
    // this.world.renderer = new OBCF.PostproductionRenderer(
    this.world.renderer = new OBC.SimpleRenderer(
      this.components,
      this.container.container
    );

    // Access the renderer and canvas element
    this.container.renderer = this.world.renderer.three;
    this.container.canvas = this.container.renderer.domElement;

    // Get the default background color
    // this.defaultBackground = this.world.scene.three.background;
    this.defaultBackground = null;

    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
    this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    this.world.scene.setup();

    // Set the background color to the default
    this.world.scene.three.background = this.defaultBackground;
  }

  resizeViewer() {
    if (
      !this.container ||
      !this.container.container ||
      !this.container.renderer ||
      !this.world ||
      !this.world.camera
    )
      return;

    // TODO: For some reason IFc viewer has some min with, it my be in the @thatopen core code

    // Resize the renderer and update the camera aspect ratio
    const width = this.container.container.clientWidth;
    const height = this.container.container.clientHeight;
    this.container.renderer.setSize(width, height);
    const camera = this.world.camera;
    camera.controls.camera.aspect = width / height;
    camera.controls.camera.updateProjectionMatrix();
  }

  zoomToFit(zoomFactor = 1) {
    const bbox = this.components.get(OBC.BoundingBoxer);
    bbox.add(this.fragments.model);
    const sphere = bbox.getSphere();
    sphere.radius *= zoomFactor;
    this.world.camera.controls.fitToSphere(sphere, true);
  }
}
