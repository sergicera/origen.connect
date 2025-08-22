import Container from "@/core/src/Container";
import { CONFIGS, PALETTES, THEME } from "./constants.js";
import { isPointInPolygon } from "./utils.js";

export class Viewer {
  constructor(emitter, data, divElement, options) {
    this.emitter = emitter; // Store app reference for emitter
    this.data = data;
    this.container = new Container(divElement);
    this.configs = {
        ...CONFIGS,
        ...PALETTES[options.palette] || PALETTES[CONFIGS.palette],
        ...options, // Includes floorId, selectedSynoptiqueId, selectedCategoryId etc.
    };

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block'; // Prevent potential layout issues
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.container.setCanvas(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // --- Pan/Zoom State ---
    this.scale = 1.0;
    this.translation = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // --- Interaction State --- (Replaced selection)
    this.lastClickTime = 0;
    this.mouseDownPos = { x: 0, y: 0 };
    this.lastAssignedFeatureId = null; // Track last feature assigned/unassigned in a drag

    // --- Synoptique/Category State --- (From options)
    this.selectedSynoptiqueId = this.configs.selectedSynoptiqueId || null;
    this.selectedCategoryId = this.configs.selectedCategoryId || null;
    this.categoryColors = new Map(); // Cache category colors for the selected synoptique
    this.synoptiqueMapping = {}; // Cache mapping for the selected synoptique

    // --- Initial centering (only once) ---
    this.centerView();

    // --- Add Event Listeners ---
    this.addEventListeners();

    // --- Preload Synoptique Data --- (Initial load)
    this.updateSynoptiqueData();
  }

  // --- Update Methods for Synoptique/Category --- (Called by React wrapper)
  setSelectedSynoptique(synoptiqueId) {
    if (this.selectedSynoptiqueId !== synoptiqueId) {
        this.selectedSynoptiqueId = synoptiqueId || null;
        this.selectedCategoryId = null; // Reset category when synoptique changes
        this.updateSynoptiqueData();
        this.draw();
        // Update cursor based on new state (might have no category selected)
        this.updateCursor(); 
    }
  }

  setSelectedCategory(categoryId) {
    if (this.selectedCategoryId !== categoryId) {
        this.selectedCategoryId = categoryId || null;
        // No redraw needed just for category change, but update cursor
        this.updateCursor();
    }
  }

  // --- Helper to load/cache data for the current synoptique ---
  updateSynoptiqueData() {
      this.categoryColors.clear();
      this.synoptiqueMapping = {};

      if (this.selectedSynoptiqueId && this.data && this.data.attributes) {
          const synoptique = this.data.attributes.find(s => s.id === this.selectedSynoptiqueId);
          if (synoptique) {
              this.synoptiqueMapping = synoptique.mapping || {};
              const categories = synoptique.categories || [];
              categories.forEach(cat => {
                  this.categoryColors.set(cat.id, cat.color || '#808080'); // Use gray if no color
              });
          } else {
              console.warn(`Viewer: Synoptique with ID ${this.selectedSynoptiqueId} not found in attributes.`);
          }
      } else {
           console.log("Viewer: No synoptique selected or attributes not loaded.");
      }
  }

  // --- Cursor Management ---
  updateCursor() {
      if (this.isPanning) {
          this.canvas.style.cursor = 'grabbing';
      } else if (this.isSpacebarDown) {
          this.canvas.style.cursor = 'grab';
      } else if (this.isAssigning && this.selectedCategoryId) {
          this.canvas.style.cursor = 'crosshair'; // Assigning cursor
      } else if (this.isUnassigning) {
          this.canvas.style.cursor = 'cell'; // Unassigning cursor (eraser-like)
      } else if (this.selectedSynoptiqueId && this.selectedCategoryId) {
          // Ready to assign on click
          this.canvas.style.cursor = 'crosshair';
      } else {
          this.canvas.style.cursor = 'default';
      }
  }

  // Helper function to convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - this.translation.x) / this.scale;
    const worldY = (screenY - this.translation.y) / this.scale;
    return { x: worldX, y: worldY };
  }

  // Helper to calculate initial scale and translation to center content
  centerView() {
    if (!this.data || !this.data.features || !this.data.features.vertices || this.data.features.vertices.length === 0) return;

    const vertices = this.data.features.vertices;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    vertices.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    const dataWidth = maxX - minX;
    const dataHeight = maxY - minY;

    if (dataWidth <= 0 || dataHeight <= 0) return;

    const padding = 20;
    const effectiveCanvasWidth = this.canvas.width - 2 * padding;
    const effectiveCanvasHeight = this.canvas.height - 2 * padding;

    const scaleX = effectiveCanvasWidth / dataWidth;
    const scaleY = effectiveCanvasHeight / dataHeight;
    this.scale = Math.min(scaleX, scaleY);

    // Calculate offsets to center the drawing based on the new scale
    const centerX = minX + dataWidth / 2;
    const centerY = minY + dataHeight / 2;
    this.translation.x = this.canvas.width / 2 - centerX * this.scale;
    // Adjust Y translation for canvas coordinate system (Y increases downwards)
    this.translation.y = this.canvas.height / 2 - centerY * this.scale;

    this.draw(); // Initial draw after centering
  }

  // Helper method to check if a feature matches the active filters
  doesFeatureMatchFilters(featureId, metadataMap) {
    const filters = this.data?.activeFilters;
    // If no filters are active, everything matches
    if (!filters || Object.keys(filters).length === 0) {
        return true;
    }

    const metadata = metadataMap.get(featureId);
    if (!metadata) {
        return false; // Cannot filter if metadata is missing
    }

    // Check against each active filter key
    for (const key in filters) {
        const allowedValues = filters[key];
        // If the filter key has selected values and the feature's value isn't among them
        if (Array.isArray(allowedValues) && allowedValues.length > 0) {
            const featureValue = metadata[key];
            if (featureValue === null || featureValue === undefined || !allowedValues.includes(featureValue)) {
                return false; // Doesn't match this filter
            }
        }
        // If filter key exists but has no selected values (shouldn't happen with current UI logic, but handle defensively)
        else if (Array.isArray(allowedValues) && allowedValues.length === 0) {
           // Treat empty filter array as matching everything for that key? Or nothing? Let's say it matches.
           continue;
        }
    }

    return true; // Matches all active filters
  }

  draw() {
    if (!this.ctx || !this.canvas || !this.data || !this.data.features) return;

    const ctx = this.ctx;
    const canvas = this.canvas;
    const floorId = this.configs.floorId;
    const currentPalette = this.configs.palette || 'light'; // For potential future use with base styles

    // Default styling
    const defaultFillColor = this.configs.featureColor || 'rgba(150, 150, 150, 0.3)';
    const defaultStrokeColor = this.configs.featureStrokeColor || '#888';
    const defaultLineWidth = (this.configs.featureLineWidth || 0.5);
    const mutedStrokeColor = this.configs.mutedFeatureStrokeColor || 'rgba(150, 150, 150, 0.5)';
    const mutedLineWidth = (this.configs.mutedFeatureLineWidth || 0.2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Transformations
    ctx.save();
    ctx.translate(this.translation.x, this.translation.y);
    ctx.scale(this.scale, this.scale);

    // Get vertices array and features
    const vertices = this.data.features.vertices;
    const features = this.data.features.features;

    // Create metadata lookup map (for filtering)
    const metadataMap = new Map();
    if (Array.isArray(this.data.metadata)) {
      this.data.metadata.forEach(item => {
        if (item && item.id) {
          metadataMap.set(item.id, item);
        }
      });
    }

    // --- Single Drawing Pass --- (Replaces theme-based multi-pass)
    Object.entries(features).forEach(([featureId, featureData]) => {
        const metadata = metadataMap.get(featureId);

        // Skip if feature is on wrong floor
        if (metadata && !(floorId === null || floorId === undefined || metadata.floor_id === floorId)) {
            return;
        }

        // Check if feature matches active filters
        const matchesFilters = this.doesFeatureMatchFilters(featureId, metadataMap);

        let fillColor = defaultFillColor;
        let strokeColor = defaultStrokeColor;
        let lineWidth = defaultLineWidth;
        let isAssigned = false;

        // Determine styling based on synoptique selection and assignment
        if (this.selectedSynoptiqueId) {
            const assignedCategoryId = this.synoptiqueMapping[featureId];
            if (assignedCategoryId && this.categoryColors.has(assignedCategoryId)) {
                // Feature is assigned to a valid category in the current synoptique
                fillColor = this.categoryColors.get(assignedCategoryId);
                strokeColor = '#333'; // Example: Darker border for assigned items
                lineWidth = 0.7;
                isAssigned = true;
            } else {
                // Feature is NOT assigned in the current synoptique
                fillColor = 'transparent'; // No fill for unassigned when synoptique active
                strokeColor = defaultStrokeColor; // Use default border
                lineWidth = defaultLineWidth;
            }
        } else {
            // No synoptique selected - use default appearance for all
            fillColor = defaultFillColor;
            strokeColor = defaultStrokeColor;
            lineWidth = defaultLineWidth;
        }

        // Apply muted style if filtered out
        if (!matchesFilters) {
            fillColor = 'transparent'; // Always transparent if filtered out
            strokeColor = mutedStrokeColor;
            lineWidth = mutedLineWidth;
        }

        // Set styles (scaled line width)
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth / this.scale;

        // Draw geometry (shell and holes)
        featureData.polygons.forEach(polygon => {
            ctx.beginPath();

            // Draw shell
            const firstIndex = polygon.shell[0];
            const [startX, startY] = vertices[firstIndex];
            ctx.moveTo(startX, startY);
            for (let i = 1; i < polygon.shell.length; i++) {
                const vertexIndex = polygon.shell[i];
                const [x, y] = vertices[vertexIndex];
                ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Draw holes if any
            if (Array.isArray(polygon.holes)) {
                polygon.holes.forEach(holeIndices => {
                    const [holeStartX, holeStartY] = vertices[holeIndices[0]];
                    ctx.moveTo(holeStartX, holeStartY);
                    for (let i = 1; i < holeIndices.length; i++) {
                        const [x, y] = vertices[holeIndices[i]];
                        ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                });
            }

            // Fill and Stroke
            ctx.fill('evenodd'); // Use evenodd for holes
            ctx.stroke();
        });
    });

    // Restore transformation matrix
    ctx.restore();
  }

  // --- Event Handling Methods --- (Refactored)
  addEventListeners() {
    // Canvas Mouse Events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

    // Window Events for Dragging/Keys
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    window.addEventListener('mousemove', this.boundHandleMouseMove);
    window.addEventListener('mouseup', this.boundHandleMouseUp);
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);

    // Listen for external changes that require redraw
    this.boundHandleFilterChange = this.draw.bind(this);
    this.boundHandleAttributesUpdate = () => {
        this.updateSynoptiqueData(); // Reload mapping
        this.draw();                // Redraw with new assignments
    }
    this.emitter.on('ACTIVE_FILTERS_CHANGED', this.boundHandleFilterChange);
    this.emitter.on('CATEGORY_MAPPING_CHANGED', this.boundHandleAttributesUpdate);
  }

  removeEventListeners() {
     this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
     this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
     this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
     this.canvas.removeEventListener('contextmenu', this.handleContextMenu.bind(this));

     window.removeEventListener('mousemove', this.boundHandleMouseMove);
     window.removeEventListener('mouseup', this.boundHandleMouseUp);
     window.removeEventListener('keydown', this.boundHandleKeyDown);
     window.removeEventListener('keyup', this.boundHandleKeyUp);

     // Unsubscribe from emitter events
     this.emitter.off('ACTIVE_FILTERS_CHANGED', this.boundHandleFilterChange);
     this.emitter.off('CATEGORY_MAPPING_CHANGED', this.boundHandleAttributesUpdate);
  }

  handleMouseDown(event) {
    this.mouseDownPos.x = event.clientX;
    this.mouseDownPos.y = event.clientY;
    this.lastClickTime = Date.now();
    this.lastAssignedFeatureId = null; // Reset on new click/drag start
    this.isDragging = false; // Reset dragging flag

    // Left Click (button 0)
    if (event.button === 0) {
        if (this.isSpacebarDown) {
            // Start Panning
            this.isPanning = true;
            this.isAssigning = false;
            this.isUnassigning = false;
            this.dragStart.x = event.clientX;
            this.dragStart.y = event.clientY;
        } else if (this.selectedSynoptiqueId && this.selectedCategoryId) {
            // Start Assigning (if category is selected)
            this.isPanning = false;
            this.isAssigning = true;
            this.isUnassigning = false;
            // Perform assignment immediately on click down? Or wait for mouseUp?
            // Let's assign on mouseUp for clicks, and during drag for drags.
        } else {
             // No category selected, do nothing on left click (besides potential pan)
             this.isAssigning = false;
        }
    }
    // Right Click (button 2)
    else if (event.button === 2) {
        if (this.selectedSynoptiqueId) {
             // Start Unassigning (if a synoptique is selected)
            this.isPanning = false;
            this.isAssigning = false;
            this.isUnassigning = true;
            event.preventDefault(); // Prevent context menu only when unassigning
        } else {
             // No synoptique selected, allow context menu
             this.isUnassigning = false;
        }
    }
    this.updateCursor();
  }

  handleMouseMove(event) {
    // --- Panning --- (Highest priority)
    if (this.isPanning) {
        const dx = event.clientX - this.dragStart.x;
        const dy = event.clientY - this.dragStart.y;
        this.translation.x += dx;
        this.translation.y += dy;
        this.dragStart.x = event.clientX;
        this.dragStart.y = event.clientY;
        this.draw();
        return;
    }

    // Determine if dragging occurred (moved beyond threshold)
    if (!this.isDragging) {
        this.isDragging = Math.abs(event.clientX - this.mouseDownPos.x) > 3 ||
                          Math.abs(event.clientY - this.mouseDownPos.y) > 3;
    }

    // Only perform assignment/unassignment if dragging
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentScreenX = event.clientX - rect.left;
    const currentScreenY = event.clientY - rect.top;
    const worldPoint = this.screenToWorld(currentScreenX, currentScreenY);
    const currentFeatureId = this.getFeatureAtPoint(worldPoint.x, worldPoint.y);

    // --- Assigning --- (Left Drag)
    if (this.isAssigning && this.selectedSynoptiqueId && this.selectedCategoryId) {
        if (currentFeatureId && currentFeatureId !== this.lastAssignedFeatureId) {
            // Check if already assigned to this category to avoid redundant calls
            if (this.synoptiqueMapping[currentFeatureId] !== this.selectedCategoryId) {
                 const assigned = this.data.assignCategoryToFeature(this.selectedSynoptiqueId, this.selectedCategoryId, currentFeatureId);
                 if (assigned) {
                    // Optimistically update local map & redraw immediately IF data layer doesn't emit fast enough
                    // this.synoptiqueMapping[currentFeatureId] = this.selectedCategoryId;
                    // this.draw();
                    // console.log("Assigned via drag (optimistic)");
                    // Relying on CATEGORY_MAPPING_CHANGED event for redraw is safer
                     console.log("Viewer: Assign requested via drag");
                 }
            }
            this.lastAssignedFeatureId = currentFeatureId;
        } else if (!currentFeatureId) {
            this.lastAssignedFeatureId = null; // Reset if moved off features
        }
        return; // Processed assign drag
    }

    // --- Unassigning --- (Right Drag)
    if (this.isUnassigning && this.selectedSynoptiqueId) {
        if (currentFeatureId && currentFeatureId !== this.lastAssignedFeatureId) {
             // Check if it has *any* assignment in this synoptique before trying to remove
            if (this.synoptiqueMapping.hasOwnProperty(currentFeatureId)) {
                 const unassigned = this.data.assignCategoryToFeature(this.selectedSynoptiqueId, null, currentFeatureId);
                 if (unassigned) {
                     // Optimistic update & redraw (optional, see above)
                     // delete this.synoptiqueMapping[currentFeatureId];
                     // this.draw();
                     // console.log("Unassigned via drag (optimistic)");
                     console.log("Viewer: Unassign requested via drag");
                 }
            }
            this.lastAssignedFeatureId = currentFeatureId;
        } else if (!currentFeatureId) {
            this.lastAssignedFeatureId = null; // Reset if moved off features
        }
        return; // Processed unassign drag
    }
  }

  handleMouseUp(event) {
    const clickDuration = Date.now() - this.lastClickTime;
    // Use the isDragging flag set during mouseMove
    const isClick = !this.isDragging && clickDuration < 250;

    // --- Left Click/Drag Release --- (Assigning)
    if (event.button === 0) {
        if (this.isPanning) {
            // Just stop panning
            this.isPanning = false;
        } else if (this.isAssigning) {
            if (isClick && this.selectedSynoptiqueId && this.selectedCategoryId) {
                // Single Left Click: Assign category
                const rect = this.canvas.getBoundingClientRect();
                const screenX = event.clientX - rect.left;
                const screenY = event.clientY - rect.top;
                const worldPoint = this.screenToWorld(screenX, screenY);
                const clickedFeatureId = this.getFeatureAtPoint(worldPoint.x, worldPoint.y);

                if (clickedFeatureId) {
                    if (this.synoptiqueMapping[clickedFeatureId] !== this.selectedCategoryId) {
                         const assigned = this.data.assignCategoryToFeature(this.selectedSynoptiqueId, this.selectedCategoryId, clickedFeatureId);
                         if (assigned) {
                              console.log("Viewer: Assign requested via click");
                              // Redraw will happen via CATEGORY_MAPPING_CHANGED event
                         }
                    }
                }
            }
            // For drag-assign, the work was done in mouseMove
            this.isAssigning = false;
        }
    }
    // --- Right Click/Drag Release --- (Unassigning)
    else if (event.button === 2) {
        if (this.isUnassigning) {
             if (isClick && this.selectedSynoptiqueId) {
                // Single Right Click: Unassign category
                const rect = this.canvas.getBoundingClientRect();
                const screenX = event.clientX - rect.left;
                const screenY = event.clientY - rect.top;
                const worldPoint = this.screenToWorld(screenX, screenY);
                const clickedFeatureId = this.getFeatureAtPoint(worldPoint.x, worldPoint.y);

                if (clickedFeatureId) {
                     if (this.synoptiqueMapping.hasOwnProperty(clickedFeatureId)) {
                        const unassigned = this.data.assignCategoryToFeature(this.selectedSynoptiqueId, null, clickedFeatureId);
                        if (unassigned) {
                            console.log("Viewer: Unassign requested via click");
                            // Redraw will happen via CATEGORY_MAPPING_CHANGED event
                        }
                     }
                }
            }
            // For drag-unassign, the work was done in mouseMove
            this.isUnassigning = false;
        }
    }

    // Reset common state
    this.isPanning = false; // Ensure panning stops if mouse is released during pan
    this.lastAssignedFeatureId = null;
    this.isDragging = false;
    this.updateCursor(); // Reset cursor based on current state (e.g., spacebar might still be down)

    // Note: No emit from here. Data layer emits 'CATEGORY_MAPPING_CHANGED'
  }

  // --- Find Feature under a Point ---
  getFeatureAtPoint(worldX, worldY) {
    const vertices = this.data.features.vertices;
    const features = this.data.features.features;
    const floorId = this.configs.floorId;
    const candidates = [];

     // Create metadata lookup map for floor and filter checking
    const metadataMap = new Map();
    if (Array.isArray(this.data.metadata)) {
        this.data.metadata.forEach(item => {
            if (item && item.id) {
                metadataMap.set(item.id, item);
            }
        });
    }

    // Iterate features - consider drawing order if overlap becomes an issue
    const featureEntries = Object.entries(features);
    // Optional: Sort entries based on theme order or some priority if needed

    for (const [featureId, featureData] of featureEntries) {
        const metadata = metadataMap.get(featureId);

        // Skip features not on the current floor
        if (metadata && !(floorId === null || floorId === undefined || metadata.floor_id === floorId)) {
            continue;
        }

        // Skip features that are filtered out (shouldn't be interactive)
        if (!this.doesFeatureMatchFilters(featureId, metadataMap)) {
            continue;
        }

        for (const polygon of featureData.polygons) {
            const shellVertices = polygon.shell.map(index => vertices[index]);
            if (isPointInPolygon(worldX, worldY, shellVertices)) {
                // Point is inside the shell, now check holes
                let pointInHole = false;
                if (Array.isArray(polygon.holes)) {
                    for (const holeIndices of polygon.holes) {
                        const holeVertices = holeIndices.map(index => vertices[index]);
                        if (isPointInPolygon(worldX, worldY, holeVertices)) {
                            pointInHole = true;
                            break; // Point is inside a hole, stop checking holes for this polygon
                        }
                    }
                }
                if (!pointInHole) {
                    // Point is inside this polygon's shell and not in a hole
                    candidates.push(featureId);
                    // Optimization: If we only care about the 'topmost' based on iteration order,
                    // we could break here after finding the first hit for this feature.
                    // break; // Uncomment if only one hit per feature is needed
                }
            }
        }
    }

    // If multiple features overlap, return the last one found in the iteration.
    // A more robust solution might involve z-index or area calculations if needed.
    return candidates.length > 0 ? candidates[candidates.length - 1] : null;
  }

   handleMouseLeave(event) {
     // Stop any active interaction if mouse leaves canvas
     if (this.isPanning || this.isAssigning || this.isUnassigning) {
        this.isPanning = false;
        this.isAssigning = false;
        this.isUnassigning = false;
        this.lastAssignedFeatureId = null;
        this.isDragging = false; // Reset dragging state
        this.updateCursor(); // Reset cursor
     }
   }

  handleWheel(event) {
      event.preventDefault(); // Prevent default page scrolling

      const zoomIntensity = 0.1;
      const minScale = 0.1; // Allow zooming out a bit more maybe?
      const maxScale = 1000;

      // Determine the scale factor
      const delta = event.deltaY > 0 ? (1 - zoomIntensity) : (1 + zoomIntensity);
      const newScale = Math.max(minScale, Math.min(maxScale, this.scale * delta));

      // Get mouse position relative to canvas (screen coordinates)
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Convert mouse screen coordinates to world coordinates before zoom
      const worldBefore = this.screenToWorld(mouseX, mouseY);

      // Calculate the translation adjustment needed to keep the point under the mouse stationary
      this.translation.x = mouseX - worldBefore.x * newScale;
      this.translation.y = mouseY - worldBefore.y * newScale;

      // Update scale
      this.scale = newScale;

      // Redraw
      this.draw();
  }

  handleResize() {
    if (!this.container || !this.canvas) return;
    // Preserve current view center and scale during resize
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;
    const worldCenterX = (oldWidth / 2 - this.translation.x) / this.scale;
    const worldCenterY = (oldHeight / 2 - this.translation.y) / this.scale;

    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;

    // Recalculate translation to keep the world center point in the new screen center
    this.translation.x = this.canvas.width / 2 - worldCenterX * this.scale;
    this.translation.y = this.canvas.height / 2 - worldCenterY * this.scale;

    this.draw(); // Redraw with new dimensions and adjusted translation
    // Avoid calling centerView() on resize as it resets zoom/pan
  }

  // Dispose method (renamed from destroy for consistency?)
  dispose() { // Renamed from destroy
    this.removeEventListeners();
    if (this.container) {
        this.container.clear(); // Remove canvas from DOM
    }
    // Release references
    this.ctx = null;
    this.canvas = null;
    this.container = null;
    this.data = null;
    this.emitter = null;
    this.categoryColors = null;
    this.synoptiqueMapping = null;
  }

  // --- Keyboard Handlers --- (Adjust cursor logic)
  handleKeyDown(event) {
      if (event.repeat) return;

      // Check if the event target is an input, select, or textarea
      const targetTagName = event.target.tagName.toLowerCase();
      const isInputFocused = ['input', 'select', 'textarea'].includes(targetTagName);

      if (event.code === 'Space') {
          if (!isInputFocused) { // Only handle space if not typing in an input
              if (!this.isSpacebarDown) { 
                  this.isSpacebarDown = true;
                  this.updateCursor();
              }
              event.preventDefault(); // Prevent page scroll ONLY when not in an input
          } 
          // If an input IS focused, do nothing and let the space be typed
      }
  }

  handleKeyUp(event) {
      if (event.code === 'Space') {
          this.isSpacebarDown = false;
          // Update cursor based on whether an assignment/unassignment is *still* in progress
          this.updateCursor();
      }
  }

  handleContextMenu(event) {
      // Prevent context menu ONLY if we are actively unassigning or right-clicking
      // when a synoptique is selected (which triggers unassigning intention)
      if (this.isUnassigning || (event.button === 2 && this.selectedSynoptiqueId)) {
           event.preventDefault();
      }
      // Allow context menu otherwise (e.g., no synoptique selected)
  }
}
