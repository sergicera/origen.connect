import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // Maybe just use pan/zoom?
import { zoningMapping, colorMapZoning } from "../colors.js";
import { PALETTES } from "../AxonometryViewer/palettes.js"; // Reuse palettes
import { parseWKTPolygon } from "../utils/parseWKTPolygon.js";
import { computeCentroid } from "../utils/geometry.js";
import Container from "../Container.js";
// import { createTextSprite } from "../AxonometryViewer/elements.js"; // Optional: Add labels?

export class FloorPlanViewer {
  constructor(manager, dataManager, divElement, options = {}) {
    this.id = null;
    this.manager = manager;
    this.dataManager = dataManager;
    this.container = new Container(this, divElement);
    this.options = {
      palette: "light",
      floorId: null, // Expecting this to be passed
      ...options,
    };

    if (this.options.floorId === null || this.options.floorId === undefined) {
      console.error("FloorPlanViewer requires a valid 'floorId' option.");
      // Potentially throw an error or handle gracefully
    }

    // Configs based on palette (reuse from AxonometryViewer for consistency)
    this.configs = PALETTES[this.options.palette] || PALETTES.light;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.floorGroup = null; // Group to hold floor elements

    this.handleResize = this.handleResize.bind(this);

    this.createScene();
    this.addEventListeners();
    this.animate();

    // Automatically build scene if data is already loaded
    if (this.dataManager.getData()) {
      this.buildSceneFromData();
    }
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.configs.backgroundColor);

    // --- Orthographic Camera for 2D Top View ---
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const viewSize = 100; // Adjust this based on typical floor plan size
    this.camera = new THREE.OrthographicCamera(
      (-aspect * viewSize) / 2,
      (aspect * viewSize) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1, // Near plane - can be close for 2D
      1000 // Far plane
    );
    this.camera.position.set(0, 0, 10); // Position above the scene, looking down (Z up)
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 1, 0); // Y is up in the camera's view for a standard 2D plane

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.setCanvas(this.renderer.domElement);

    // --- Controls (Simplified for 2D Pan/Zoom) ---
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false; // Disable rotation for 2D view
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.screenSpacePanning = true; // Pan across the screen plane
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY, // Zoom
      RIGHT: null // Disable default right-click rotation/pan
    };
    this.controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    // Optional: Add subtle ambient light if needed for materials
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // --- Add Infinite Grid ---
    const gridSize = 1000; // Large size for "infinite" feel
    const gridDivisions = 100; // Adjust for density
    const gridColorCenterLine = this.configs.gridColorCenterLine || 0xaaaaaa; // Use palette or default
    const gridColorGrid = this.configs.gridColorGrid || 0xdddddd; // Use palette or default

    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, gridColorCenterLine, gridColorGrid);
    gridHelper.rotation.x = Math.PI / 2; // Rotate to lie on the XY plane (Z=0)
    gridHelper.position.z = -0.01; // Slightly below floor elements to avoid z-fighting
    this.scene.add(gridHelper);
  }

  // Method to update palette (simplified for 2D)
  setPalette(palette) {
    if (PALETTES[palette]) {
      this.options.palette = palette;
      this.configs = PALETTES[palette];

      // Update scene background
      this.scene.background = new THREE.Color(this.configs.backgroundColor);

      // Update materials for existing floor elements
      if (this.floorGroup) {
        this.floorGroup.traverse((child) => {
          if (child.isMesh && child.material) {
            // Find the original color if stored, or re-calculate based on subtype
            // const subtype = child.userData.subtype; // Need to store this
            // const zoneCat = zoningMapping[subtype] || "Structure";
            // const colorHex = colorMapZoning[zoneCat] || "#cccccc";
            // child.material.color.set(colorHex); 
            // child.material.emissive.set(colorHex).multiplyScalar(this.configs.baseEmissiveMultiplier); 
            child.material.needsUpdate = true; // Request material update
          }
        });
      }
    }
  }

  buildSceneFromData() {
    // Get data filtered for this viewer's floorId
    const floorData = this.dataManager.getDataByFloorId(this.options.floorId);

    if (!floorData || floorData.length === 0) {
      console.warn(`FloorPlanViewer (${this.options.floorId}): No data found for this floor.`);
      // Clear previous elements if any
      if (this.floorGroup) {
        this.scene.remove(this.floorGroup);
        // Dispose geometry/materials if necessary
        this.floorGroup.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
        this.floorGroup = null;
      }
      return;
    }

    // Clear previous elements
    if (this.floorGroup) {
      this.scene.remove(this.floorGroup);
      this.floorGroup.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    }
    this.floorGroup = new THREE.Group();
    this.scene.add(this.floorGroup);

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    floorData.forEach((rowObj) => {
      const polygonMesh = this.createFloorPolygon(rowObj);
      if (polygonMesh) {
        this.floorGroup.add(polygonMesh);

        // Track bounds for centering/zooming
        if (rowObj.geom.includes("POLYGON")) {
          try {
            const points = parseWKTPolygon(rowObj.geom);
            points.forEach((pt) => {
              minX = Math.min(minX, pt.x);
              maxX = Math.max(maxX, pt.x);
              minY = Math.min(minY, pt.y);
              maxY = Math.max(maxY, pt.y);
            });
          } catch (e) { /* Ignore parsing errors here, handled in DataManager */ }
        }
      }
    });

    // Center and zoom the orthographic camera
    if (minX !== Infinity) {
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const sizeX = maxX - minX;
      const sizeY = maxY - minY;
      const padding = 1.1; // 10% padding

      // Adjust camera view to fit the bounds
      const aspect = (this.container.clientHeight === 0) ? 1 : this.container.clientWidth / this.container.clientHeight;
      const worldWidth = Math.max(sizeX * padding, (sizeY * padding) * aspect);
      const worldHeight = Math.max(sizeY * padding, (sizeX * padding) / aspect);

      this.camera.left = centerX - worldWidth / 2;
      this.camera.right = centerX + worldWidth / 2;
      this.camera.top = centerY + worldHeight / 2;
      this.camera.bottom = centerY - worldHeight / 2;

      this.camera.position.set(centerX, centerY, 10); // Look from above center
      this.controls.target.set(centerX, centerY, 0);

      this.camera.updateProjectionMatrix();
      this.controls.update();
    } else {
      // Default view if no bounds (e.g., no polygons found)
      this.camera.position.set(0, 0, 10);
      this.controls.target.set(0, 0, 0);
      this.camera.updateProjectionMatrix();
      this.controls.update();
    }
  }

  createFloorPolygon(row) {
    const subtype = row.entity_subtype?.toUpperCase() || "";
    const zoneCat = zoningMapping[subtype] || "Structure";
    const colorHex = colorMapZoning[zoneCat] || "#cccccc";

    if (!row.geom.includes("POLYGON")) return null;
    let shapePoints;
    try {
      shapePoints = parseWKTPolygon(row.geom);
    } catch (e) { return null; } // Skip if WKT is invalid
    if (shapePoints.length < 3) return null;

    // Create 2D shape
    const shape = new THREE.Shape(shapePoints);
    const geometry = new THREE.ShapeGeometry(shape);

    // Simple material for 2D
    const material = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      // Optional: Add slight transparency if needed
      // transparent: true,
      // opacity: 0.9 
    });

    const mesh = new THREE.Mesh(geometry, material);
    // mesh.userData.subtype = subtype; // Store subtype for potential palette changes

    // Polygons are on the Z=0 plane by default
    return mesh;
  }

  addEventListeners() {
    window.addEventListener("resize", this.handleResize);
    // Potentially listen for manager events like MODE_CHANGED if needed
    // this.manager.emitter.on('MODE_CHANGED', this.handleModeChange.bind(this));
  }

  removeEventListeners() {
    window.removeEventListener("resize", this.handleResize);
    // this.manager.emitter.off('MODE_CHANGED', this.handleModeChange.bind(this));
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.controls.update(); // Update controls (for damping)
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.renderer.setSize(width, height);

    // Adjust orthographic camera bounds on resize
    const viewSize = this.camera.top - this.camera.bottom; // Maintain current zoom level (view height)
    this.camera.left = (-aspect * viewSize) / 2;
    this.camera.right = (aspect * viewSize) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;

    // Recenter based on controls target
    const target = this.controls.target;
    this.camera.position.set(target.x, target.y, 10);
    this.camera.left += target.x;
    this.camera.right += target.x;
    this.camera.top += target.y;
    this.camera.bottom += target.y;

    this.camera.updateProjectionMatrix();
  }

  dispose() {
    // Stop animation frame loop to prevent memory leaks
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.removeEventListeners();
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();

    if (this.floorGroup) {
      this.scene.remove(this.floorGroup);
      this.floorGroup.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
      this.floorGroup = null;
    }

    if (this.container) this.container.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }
}
