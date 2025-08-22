import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { zoningMapping, colorMapZoning } from "../colors.js";
import { PALETTES } from "./palettes.js";
import { CONFIGS } from "./configs.js";
import { parseWKTPolygon } from "../utils/parseWKTPolygon.js";
import { computeCentroid } from "../utils/geometry.js";
import { createTextSprite } from "./elements.js";
import Container from "../Container.js";

export class AxonometryViewer {
  constructor(manager, dataManager, divElement, options = {}) {
    this.id = null;
    this.manager = manager;
    this.dataManager = dataManager;
    this.container = new Container(this, divElement);

    // Initialize options with defaults
    this.options = {
      palette: "light", // Default to light mode
      ...options
    };
    
    // Set the configs based on palette
    this.configs = PALETTES[this.options.palette] || PALETTES.light;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null; // For post-processing
    this.gridHelper = null;
    this.centralGroup = null;
    this._rafId = null;

    this.handleResize = this.handleResize.bind(this);

    this.createScene();
    this.addEventListeners();
    this.startAnimation();

    // Automatically build scene if data is already loaded
    if (this.dataManager.getData()) {
        this.buildSceneFromData();
    }
  }

  createScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.configs.backgroundColor);
    this.scene.fog = new THREE.FogExp2(this.configs.fogColor, this.configs.fogDensity);

    // Create camera with improved settings for architectural visualization
    this.camera = new THREE.PerspectiveCamera(
      CONFIGS.defaultCameraFOV,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      2000
    );

    // Tell Three.js that Z is "up"
    this.camera.up.set(0, 0, 1);

    // Initial camera position, will be adjusted after data loading
    this.camera.position.set(CONFIGS.cameraDistance, -CONFIGS.cameraDistance, 80);
    this.camera.lookAt(0, 0, 0);

    // Create renderer with enhanced settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      precision: "highp",
      powerPreference: "high-performance",
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2; // Slightly brighter
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Pass the renderer's canvas to container
    this.container.setCanvas(this.renderer.domElement);

    // Create controls with improved settings
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Add improved lighting setup
    this.setupLighting();

    // Add grid helper for better spatial reference
    this.addGridHelper();
  }

  setupLighting() {
    // Ambient light for gentle fill light
    const ambientLight = new THREE.AmbientLight(
      this.configs.ambientLight.color, 
      this.configs.ambientLight.intensity
    );
    this.scene.add(ambientLight);

    // Hemisphere light with more architectural colors
    const hemisphereLight = new THREE.HemisphereLight(
      this.configs.hemisphereLight.skyColor,
      this.configs.hemisphereLight.groundColor,
      this.configs.hemisphereLight.intensity
    );
    this.scene.add(hemisphereLight);

    // Main directional light (simulating sun)
    const directionalLight = new THREE.DirectionalLight(
      this.configs.directionalLight.color,
      this.configs.directionalLight.intensity
    );
    directionalLight.position.set(50, 50, 100);
    directionalLight.castShadow = true;

    // Improve shadow quality
    directionalLight.shadow.mapSize.width = CONFIGS.shadowMapSize;
    directionalLight.shadow.mapSize.height = CONFIGS.shadowMapSize;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = CONFIGS.shadowBias;

    // Set shadow camera dimensions
    const shadowSize = CONFIGS.shadowSize;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;

    this.scene.add(directionalLight);

    // Add a subtle fill light from another angle
    const fillLight = new THREE.DirectionalLight(
      this.configs.fillLight.color,
      this.configs.fillLight.intensity
    );
    fillLight.position.set(-50, -50, 80);
    this.scene.add(fillLight);

    // Add a subtle rim light for edge definition
    const rimLight = new THREE.DirectionalLight(
      this.configs.rimLight.color,
      this.configs.rimLight.intensity
    );
    rimLight.position.set(0, -100, 20);
    this.scene.add(rimLight);
  }

  addGridHelper() {
    // Add grid for better spatial awareness
    const gridSize = 1000; // Large size for "infinite" feel
    const gridDivisions = 100; // Adjust for density

    // Ensure palette configs for grid colors exist, or use defaults
    const gridColorPrimary = this.configs.gridHelper?.primaryColor || 0x888888; 
    const gridColorSecondary = this.configs.gridHelper?.secondaryColor || 0xcccccc;

    this.gridHelper = new THREE.GridHelper(
      gridSize, 
      gridDivisions, 
      gridColorPrimary, 
      gridColorSecondary
    );
    this.gridHelper.rotation.x = Math.PI / 2; // Rotate to match Z-up orientation
    // Use a default opacity if not specified in global CONFIGS
    this.gridHelper.material.opacity = CONFIGS.gridOpacity !== undefined ? CONFIGS.gridOpacity : 0.2;
    this.gridHelper.material.transparent = true;
    this.scene.add(this.gridHelper);
  }

  // Method to update palette
  setPalette(palette) {
    if (PALETTES[palette]) {
      this.options.palette = palette;
      this.configs = PALETTES[palette];
      
      // Update scene properties
      this.scene.background = new THREE.Color(this.configs.backgroundColor);
      this.scene.fog = new THREE.FogExp2(this.configs.fogColor, this.configs.fogDensity);
      
      // Clear current lights
      this.scene.traverse((child) => {
        if (child instanceof THREE.Light) {
          this.scene.remove(child);
        }
      });
      
      // Remove existing grid helper
      if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
      }
      
      // Re-setup lighting and grid
      this.setupLighting();
      this.addGridHelper();
      
      // Update materials for existing meshes if data is loaded
      if (this.centralGroup) {
          this.centralGroup.traverse((child) => {
            if (child.isMesh) {
              if (child.material instanceof THREE.MeshPhongMaterial) {
                // For base meshes with phong material
                const color = child.material.color.clone();
                child.material.emissive = color.clone().multiplyScalar(this.configs.baseEmissiveMultiplier);
                child.material.specular = new THREE.Color(this.configs.specularColor);
                child.material.shininess = this.configs.shininess;
                child.material.needsUpdate = true;
              } else if (child.material instanceof THREE.MeshPhysicalMaterial) {
                // For transparent extruded meshes - potentially update opacity/color based on palette
                 // Example: child.material.opacity = this.configs.extrudeOpacity || 0.15;
                child.material.needsUpdate = true;
              } else if (child.isSprite && child.material.map) {
                 // Update text sprite appearance if needed based on palette (e.g., text color)
              }
            } else if (child.isLineSegments) {
              // For edge highlight lines - potentially update color based on palette
              // Example: child.material.color.set(this.configs.edgeColor || child.material.color);
              child.material.needsUpdate = true;
            }
          });
      }
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.handleResize);
  }

  startAnimation() {
    if (this._rafId) return; // already running
    const tick = () => {
      this._rafId = requestAnimationFrame(tick);
      this.render();
    };
    tick();
  }

  stopAnimation() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }

  // --- NEW method to build scene from DataManager data ---
  buildSceneFromData() {
    const parsedData = this.dataManager.getData();
    const bounds = this.dataManager.getBounds();

    if (!parsedData || parsedData.length === 0) {
      console.warn("No parsed data available to build scene.");
      return;
    }

    // Clear previous model if it exists
    if (this.centralGroup) {
      this.scene.remove(this.centralGroup);
      // Optional: Dispose geometry/materials if needed
      this.centralGroup.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else if (object.material.dispose) {
                object.material.dispose();
            }
        }
      });
    }

    // Create a new central group
    this.centralGroup = new THREE.Group();
    this.scene.add(this.centralGroup);

    parsedData.forEach((rowObj) => {
      // Use the existing method to create geometry for each row
      const group = this.createPolygonGroup(rowObj);
      if (group) {
        this.centralGroup.add(group);
      }
    });

    // Center the camera on the model using bounds from DataManager
    if (bounds) {
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      // Optional: Use Z bounds for better vertical centering if needed
      // const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      const sizeX = bounds.maxX - bounds.minX;
      const sizeY = bounds.maxY - bounds.minY;
      const size = Math.max(sizeX, sizeY);

      // Update orbit controls target
      this.controls.target.set(centerX, centerY, 0); // Assuming target is on the ground plane

      // Position camera based on size and aspect ratio to fit the model
      const fov = this.camera.fov * (Math.PI / 180);
      const aspect = this.camera.aspect;
      /* Original calculation:
      const distanceY = size / 2 / Math.tan(fov / 2);
      const distanceX = (size * aspect) / 2 / Math.tan(fov / 2);
      const distance = Math.max(distanceX, distanceY) * 1.5; // Add some padding
      */

      // --- Revised Calculation ---
      // Distance required to fit the height (sizeY)
      const distanceForHeight = (sizeY / 2) / Math.tan(fov / 2);
      // Distance required to fit the width (sizeX)
      const distanceForWidth = (sizeX / 2) / (Math.tan(fov / 2) * aspect);
      // Use the maximum distance needed to fit either dimension
      let distance = Math.max(distanceForWidth, distanceForHeight);
      // Add padding (reducing from 1.5 to 1.2)
      distance *= 1.2; 
      // --- End Revised Calculation ---

      this.camera.position.set(
        centerX + distance * 0.7, // Adjust coefficients for desired angle
        centerY - distance * 0.7,
        distance * 0.6 // Adjust height based on distance
      );
      this.camera.lookAt(centerX, centerY, 0);
      this.controls.target.set(centerX, centerY, 0); // Ensure controls target is also set
      this.controls.update();

        // Adjust grid POSITION based on bounds, don't recreate it
        if (this.gridHelper) {
            this.gridHelper.position.set(centerX, centerY, 0); // Center grid on the model
        }

    } else {
         // Default camera positioning if no bounds available
        this.camera.position.set(CONFIGS.cameraDistance, -CONFIGS.cameraDistance, 80);
        this.controls.target.set(0, 0, 0);
        this.camera.lookAt(0, 0, 0);
        this.controls.update();
    }
  }

  // Create a Group with Flat base surface (opaque), transparent extruded "walls" and text label at the centroid
  createPolygonGroup(row) {
    const subtype = row.entity_subtype?.toUpperCase() || "";
    const zoneCat = zoningMapping[subtype] || "Structure";
    const colorHex = colorMapZoning[zoneCat] || "#cccccc";

    // Parse the geometry from "POLYGON ((x y, x y, ...))"
    if (!row.geom.includes("POLYGON")) return null;
    let shapePoints;
    try {
        shapePoints = parseWKTPolygon(row.geom);
    } catch(e) {
        console.warn("Could not parse WKT Polygon in createPolygonGroup:", row.geom, e);
        return null; // Skip if WKT is invalid
    }
    if (shapePoints.length < 3) return null;

    // Compute the centroid for text label placement
    const centroid = computeCentroid(shapePoints);

    // Create the base flat surface
    const shape = new THREE.Shape(shapePoints);
    const baseGeometry = new THREE.ShapeGeometry(shape);

    // Enhanced material with glow effect for dark background
    const baseColor = new THREE.Color(colorHex);

    const baseMaterial = new THREE.MeshPhongMaterial({
      color: baseColor,
      emissive: baseColor.clone().multiplyScalar(this.configs.baseEmissiveMultiplier),
      specular: new THREE.Color(this.configs.specularColor),
      shininess: this.configs.shininess,
      side: THREE.DoubleSide,
    });

    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.receiveShadow = true;

    // Use pre-calculated elevation and height from DataManager
    const elevation = row.elevation;
    const extrudeHeight = row.height;

    // Door offset
    let doorOffset = 0;
    if (subtype === "DOOR" || subtype === "ENTRANCE_DOOR") {
      doorOffset = 0.05;
    }

    baseMesh.position.z = elevation + doorOffset;

    const group = new THREE.Group();
    group.add(baseMesh);

    // Only create extrusions for non-Zone4 elements
    if (zoneCat !== "Zone4" && extrudeHeight > 0) { // Check height > 0
      // Create the extruded (transparent) geometry with improved visuals
      const extrudeSettings = {
        depth: extrudeHeight,
        bevelEnabled: false,
      };

      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const extrudeMaterial = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        metalness: 0.2,
        roughness: 0.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        clearcoat: 0.3,
        clearcoatRoughness: 0.25,
      });

      const extrudeMesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
      extrudeMesh.castShadow = true;
      extrudeMesh.receiveShadow = true;

      // Offset so the extruded piece sits just above the base (avoids z-fighting)
      extrudeMesh.position.z = elevation + doorOffset + 0.001;

      // Add edge highlighting for better visibility
      const edges = new THREE.EdgesGeometry(extrudeGeometry);
      const edgeColor = new THREE.Color(colorHex).lerp(
        new THREE.Color(0xffffff),
        0.5
      );
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: edgeColor,
        linewidth: 1,
        transparent: true,
        opacity: 0.5,
      });

      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
      edgeLines.position.z = elevation + doorOffset + 0.001;

      // Group them together
      group.add(extrudeMesh);
      group.add(edgeLines);

      // If entity_type === "area", add an enhanced text label at the centroid
      if (row.entity_type?.toLowerCase() === "area") {
        const textSprite = createTextSprite(subtype, {
          fontsize: 32,
          color: "#ffffff",
          backgroundColor: "rgba(10, 14, 18, 0.7)",
          padding: 8,
          borderRadius: 4,
        });

        // Position the sprite at centroid and in the middle of the extrude
        textSprite.position.set(
          centroid.x,
          centroid.y,
          elevation + extrudeHeight / 2 // Position vertically centered
        );

        group.add(textSprite);
      }
    }

    return group;
  }

  handleResize() {
    if (!this.renderer || !this.camera) return; // Guard against resize before init
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    // Adjust camera fit on resize might be needed if aspect ratio changes significantly
    // this.centerCameraOnData(); // Potentially re-center or adjust zoom
  }

  dispose() {
    this.stopAnimation();
    window.removeEventListener("resize", this.handleResize);
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();

    // Dispose of central group and its contents
    if (this.centralGroup) {
        this.scene.remove(this.centralGroup);
        this.centralGroup.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else if (object.material.dispose) {
                    object.material.dispose();
                }
            }
            if (object.texture) object.texture.dispose();
        });
        this.centralGroup = null;
    }

    // Dispose grid helper
     if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        if(this.gridHelper.geometry) this.gridHelper.geometry.dispose();
        if(this.gridHelper.material) this.gridHelper.material.dispose();
     }

    // Let container handle the removal of the canvas
    if (this.container) this.container.clear();
    this.scene = null; // Help GC
  }
}
