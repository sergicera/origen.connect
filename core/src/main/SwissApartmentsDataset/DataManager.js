import { parseCSVLine } from "./Viewer/utils/parseCSVLine";
import { parseWKTPolygon } from "./Viewer/utils/parseWKTPolygon";

export class DataManager {
  constructor(manager) {
    this.manager = manager; // Reference to the main SapModel module if needed
    this.rawData = null;
    this.parsedData = null;
    this.bounds = null;
    this.isLoading = false;
    this.loadPromise = null;
  }

  async loadSAMFile(path, token) {
    if (this.isLoading) {
      return this.loadPromise; // Return existing promise if already loading
    }
    if (this.parsedData) {
      return Promise.resolve({ parsedData: this.parsedData, bounds: this.bounds }); // Return cached data if available
    }

    this.isLoading = true;
    this.loadPromise = fetch(path, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        return resp.text();
      })
      .then((csvText) => {
        this.rawData = csvText;
        const { parsedData, bounds } = this.parseCSVData(csvText);
        this.parsedData = parsedData;
        this.bounds = bounds;
        this.isLoading = false;
        return { parsedData, bounds };
      })
      .catch((err) => {
        console.error(`Failed to load or parse CSV (${path}):`, err);
        this.isLoading = false;
        this.loadPromise = null; // Reset promise on error
        throw err; // Re-throw error for the caller
      });

    return this.loadPromise;
  }

  // Parse the CSV text and return structured data and bounds
  parseCSVData(csvText) {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      console.warn("No data lines or only header present in CSV.");
      return { parsedData: [], bounds: null };
    }

    // skip the header
    const dataLines = lines.slice(1);
    const parsedData = [];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity; // Track Z bounds as well

    dataLines.forEach((line) => {
      if (!line || line.startsWith("#")) return; // ignore comments or empty lines
      const rowObj = parseCSVLine(line);

      // Add elevation and height to the object for easier access
      rowObj.elevation = parseFloat(rowObj.elevation) || 0;
      rowObj.height = parseFloat(rowObj.height) || 0.1; // Default height if not specified

      parsedData.push(rowObj);

      // Track bounds for each polygon
      if (rowObj.geom.includes("POLYGON")) {
        try {
            const points = parseWKTPolygon(rowObj.geom);
            points.forEach((pt) => {
              minX = Math.min(minX, pt.x);
              maxX = Math.max(maxX, pt.x);
              minY = Math.min(minY, pt.y);
              maxY = Math.max(maxY, pt.y);
            });
            // Update Z bounds based on elevation and height
             minZ = Math.min(minZ, rowObj.elevation);
             maxZ = Math.max(maxZ, rowObj.elevation + rowObj.height);
        } catch(e) {
            console.warn("Could not parse WKT Polygon:", rowObj.geom, e);
        }
      }
    });

    const bounds = (minX === Infinity) ? null : { minX, maxX, minY, maxY, minZ, maxZ };

    return { parsedData, bounds };
  }

  getData() {
    return this.parsedData;
  }

  getBounds() {
    return this.bounds;
  }

  // New method to get unique floor IDs
  getUniqueFloorIds() {
    if (!this.parsedData || this.parsedData.length === 0) {
      console.warn("No parsed data available to get floor IDs.");
      return [];
    }

    const floorIds = new Set();
    this.parsedData.forEach(row => {
      if (row && row.floor_id !== undefined && row.floor_id !== null) {
        floorIds.add(row.floor_id);
      }
    });

    return Array.from(floorIds);
  }

  // New method to filter data by floor ID
  getDataByFloorId(floorId) {
    if (!this.parsedData || this.parsedData.length === 0) {
      console.warn("No parsed data available to filter by floor ID.");
      return [];
    }
    
    if (floorId === undefined || floorId === null) {
        console.warn("Floor ID is undefined or null, cannot filter.");
        return []; // Or return all data? Decide based on desired behavior.
    }

    // Ensure consistent type comparison if floorId might be number/string
    const targetFloorId = String(floorId); 

    return this.parsedData.filter(row => {
      // Assuming the property name is 'floor_id'
      return row && row.floor_id !== undefined && row.floor_id !== null && String(row.floor_id) === targetFloorId;
    });
  }

  clearData() {
    this.rawData = null;
    this.parsedData = null;
    this.bounds = null;
    this.isLoading = false;
    this.loadPromise = null;
  }
} 