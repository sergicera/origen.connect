import * as THREE from "three";

export function parseWKTPolygon(wkt) {
    if (!wkt || typeof wkt !== 'string') {
      console.warn('Invalid WKT data:', wkt);
      return [];
    }
  
    // Handle different WKT polygon formats
    let inner;
    if (wkt.includes("POLYGON ((")) {
      inner = wkt.replace("POLYGON ((", "").replace("))", "").trim();
    } else if (wkt.includes("POLYGON((")) {
      inner = wkt.replace("POLYGON((", "").replace("))", "").trim();
    } else {
      console.warn('Unrecognized WKT format:', wkt);
      return [];
    }
  
    const coords = inner.split(",");
    const points = [];
  
    for (let i = 0; i < coords.length; i++) {
      const coordStr = coords[i].trim();
      // Split by any whitespace (space, tab, etc.)
      const parts = coordStr.split(/\s+/);
      
      if (parts.length < 2) {
        console.warn(`Invalid coordinate format at index ${i}:`, coordStr);
        continue; // Skip this coordinate
      }
  
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
  
      // Validate that both x and y are valid numbers
      if (isNaN(x) || isNaN(y)) {
        console.warn(`Invalid coordinate values at index ${i}:`, { x, y, original: coordStr });
        continue; // Skip this coordinate
      }
  
      points.push(new THREE.Vector2(x, y));
    }
  
    // Ensure we have at least 3 points to form a polygon
    if (points.length < 3) {
      console.warn('Not enough valid points to form a polygon:', points.length);
      return [];
    }
  
    return points;
  }