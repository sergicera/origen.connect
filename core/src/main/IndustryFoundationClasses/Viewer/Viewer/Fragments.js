import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";
import { apiService } from "@/services/fileSystemBackend";
import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
import * as THREE from "three";

export default class Fragments {
  constructor(app) {
    this.app = app;
    this.fragments = null;
    this.fragmentIfcLoader = null;
    this.model = null;
  }

  init() {
    this.fragments = this.app.components.get(OBC.FragmentsManager);
    this.fragmentIfcLoader = this.app.components.get(OBC.IfcLoader);
  }

  async loadIfc(path, fileName, exerciceId, token) {
    await this.fragmentIfcLoader.setup();
    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
    ];

    for (const cat of excludedCats) {
      this.fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    this.fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    const file = await fetch(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    this.model = await this.fragmentIfcLoader.load(buffer);
    this.model.name = fileName;
    this.app.world.scene.three.add(this.model);
    // Need to add the model to the meshes to enable clipping
    this.app.world.meshes.add(this.model);
  }

  async loadFragments(fragPath, propertiesPath, token) {
    const file = await fetch(fragPath, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    this.model = this.fragments.load(buffer);
    const properties = await fetch(propertiesPath, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.model.setLocalProperties(await properties.json());

    this.app.world.scene.three.add(this.model);
    // Need to add the model to the meshes to enable clipping
    this.app.world.meshes.add(this.model);
  }

  setWireFrameMode() {
    const modelRoot = this.model;

    modelRoot.traverse((child) => {
      if (child.isMesh) {
        // Ensure we have a backup of the original state
        if (!child.userData.originalWireframeState) {
          child.userData.originalWireframeState = Array.isArray(child.material)
            ? child.material.map((mat) => mat.wireframe)
            : child.material.wireframe;
        }

        // Set wireframe mode for the material
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => (mat.wireframe = true));
        } else {
          child.material.wireframe = true;
        }
      }
    });
  }

  unsetWireFrameMode() {
    const modelRoot = this.model;

    modelRoot.traverse((child) => {
      if (child.isMesh && child.userData.originalWireframeState !== undefined) {
        // Restore the original wireframe state
        if (Array.isArray(child.material)) {
          child.material.forEach((mat, index) => {
            mat.wireframe = child.userData.originalWireframeState[index];
          });
        } else {
          child.material.wireframe = child.userData.originalWireframeState;
        }

        // Optionally, clear the stored state if no longer needed
        delete child.userData.originalWireframeState;
      }
    });
  }

  async exportFragments(exerciceId, fileName, token) {
    if (!this.fragments.groups.size) {
      return;
    }
    const relativePath = "ifc/fragments";
    const group = Array.from(this.fragments.groups.values())[0];
    const data = this.fragments.export(group);

    // Create a FormData object
    const formData = new FormData();
    formData.append("path", `/${relativePath}`);

    const newFileName = fileName.split(".")[0];

    // Create a Blob from your data and append it to the FormData
    const dataFile = new Blob([data], { type: "application/octet-stream" });
    formData.append("files", dataFile, `${newFileName}.frag`);

    const properties = group.getLocalProperties();
    if (properties) {
      // Convert properties to a Blob and append with a different filename
      const propertiesFile = new Blob([JSON.stringify(properties)], {
        type: "application/json",
      });
      formData.append("files", propertiesFile, `${newFileName}.json`);
    }

    try {
      const response = await apiService.addFilesToExerciceOnFolder(
        exerciceId,
        formData,
        token
      );
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  }

  async exportOBJ(exerciceId, fileName, relativePath, token) {
    // Get the meshes from the fragments
    let meshes = this.fragments.meshes;

    // Create a scene to hold the meshes
    let outscene = new THREE.Scene();

    // Utility method to add a meshe to the scene
    let addMesh = (geometry, matrix, name) => {
      let g = geometry.clone();
      g.applyMatrix4(matrix);
      const mesh = new THREE.Mesh(g);
      mesh.name = name;
      outscene.add(mesh);
    };

    // Process meshes
    for (const m of meshes) {
      if (m.isInstancedMesh) {
        const expressIds = Array.from(m.fragment.ids);
        // Process all instances in parallel
        await Promise.all(
          Array.from({ length: m.count }, async (_, i) => {
            const expressID = expressIds[i];
            const element = await this.model.getProperties(expressID, true);
            const GlobalId = element.GlobalId.value || "___";
            const mat = new THREE.Matrix4();
            m.getMatrixAt(i, mat);
            addMesh(m.geometry, mat, GlobalId);
          })
        );
      } else {
        addMesh(m.geometry, m.matrixWorld, "___");
      }
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append("path", `/${relativePath}`);

    // Create a OBJExporter
    const exporter = new OBJExporter();
    let data = exporter.parse(outscene);

    const headerComment = [
      "# Exported with AfterPlan™",
      `# Generated on ${new Date().toLocaleString()}`,
      `# Object count: ${outscene.children.length}`,
    ].join("\n");

    data = headerComment + "\n" + data;

    // Create a Blob from your data and append it to the FormData
    const newFileName = fileName.split(".")[0];
    const dataFile = new Blob([data], { type: "application/octet-stream" });
    formData.append("files", dataFile, `${newFileName}.obj`);

    try {
      const response = await apiService.addFilesToExerciceOnFolder(
        exerciceId,
        formData,
        token
      );
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  }

  async exportCSV(exerciceId, fileName, relativePath, token) {
    if (!this.model) {
      console.error("No model loaded to export");
      return;
    }

    try {
      // Get all unique element IDs from the model
      const expressIds = new Set();
      const meshes = this.fragments.meshes;
      
      for (const mesh of meshes) {
        if (mesh.isInstancedMesh && mesh.fragment && mesh.fragment.ids) {
          for (const id of mesh.fragment.ids) {
            expressIds.add(id);
          }
        }
      }
      
      // Prepare CSV header and rows
      let csvHeader = [];
      let csvRows = [];
      
      // Process each element
      for (const expressId of expressIds) {
        try {
          const properties = await this.model.getProperties(expressId, true);
          if (!properties) continue;
          
          // For the first element, extract the property names for the header
          if (csvHeader.length === 0) {
            csvHeader = ['ExpressID', 'GlobalId', ...this.extractPropertyNames(properties)];
            csvRows.push(csvHeader.join(','));
          }
          
          // Extract the values for each property
          const globalId = properties.GlobalId?.value || '';
          const rowValues = [expressId, globalId, ...this.extractPropertyValues(properties, csvHeader.slice(2))];
          csvRows.push(rowValues.join(','));
        } catch (error) {
          console.warn(`Error processing element ${expressId}:`, error);
        }
      }
      
      // Join rows to form the CSV content
      const csvContent = csvRows.join('\n');
      
      // Create a FormData object
      const formData = new FormData();
      formData.append("path", `/${relativePath}`);

      const newFileName = fileName.split(".")[0];
      const dataFile = new Blob([csvContent], { type: "text/csv" });
      formData.append("files", dataFile, `${newFileName}.csv`);

      const response = await apiService.addFilesToExerciceOnFolder(
        exerciceId,
        formData,
        token
      );
      
      return csvContent;
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }

  // Helper methods for CSV export
  extractPropertyNames(properties, prefix = '', result = []) {
    for (const key in properties) {
      // Skip functions, arrays and null values
      if (typeof properties[key] === 'function' || properties[key] === null) {
        continue;
      }
      
      // For objects with value property (IFC properties)
      if (properties[key]?.value !== undefined) {
        result.push(prefix ? `${prefix}.${key}` : key);
      } 
      // For nested objects with properties (excluding specific properties)
      else if (typeof properties[key] === 'object' && 
               !Array.isArray(properties[key]) && 
               key !== 'expressID' && 
               key !== 'GlobalId') {
        this.extractPropertyNames(properties[key], prefix ? `${prefix}.${key}` : key, result);
      }
    }
    return result;
  }

  extractPropertyValues(properties, propertyNames) {
    return propertyNames.map(name => {
      const parts = name.split('.');
      let value = properties;
      
      // Navigate to the nested property
      for (const part of parts) {
        if (!value || value[part] === undefined) return '';
        value = value[part];
      }
      
      // Extract the value if it's an IFC property object
      if (value && typeof value === 'object' && 'value' in value) {
        return this.formatValueForCSV(value.value);
      }
      
      return this.formatValueForCSV(value);
    });
  }

  formatValueForCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      // Escape quotes and wrap in quotes if it contains commas, quotes or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).replace(/"/g, '""');
      } catch {
        return '';
      }
    }
    
    return String(value);
  }
}
