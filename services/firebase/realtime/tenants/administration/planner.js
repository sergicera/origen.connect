import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const plannerDb = {
  // -----------------------------------------
  // --- HEADER OPERATIONS ---
  // -----------------------------------------

  async getHeader(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for getHeader");
    if (!projectId)
      return Promise.reject("Project ID is required for getHeader");
    try {
      const headerRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/header/${projectId}`
      );
      const snapshot = await get(headerRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(
        `Error fetching planner header for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async addHeader(tenantId, projectId, data) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for addHeader");
    if (!projectId)
      return Promise.reject("Project ID is required for addHeader");
    try {
      const headerRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/header/${projectId}`
      );
      await set(headerRef, data);
      return true;
    } catch (error) {
      console.error(
        `Error adding planner header for project ${projectId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateHeader(tenantId, projectId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateHeader");
    if (!projectId)
      return Promise.reject("Project ID is required for updateHeader");
    try {
      const headerRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/header/${projectId}`
      );
      await update(headerRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating planner header for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteHeader(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteHeader");
    if (!projectId)
      return Promise.reject("Project ID is required for deleteHeader");
    try {
      const headerRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/header/${projectId}`
      );
      await remove(headerRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting planner header for project ${projectId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  // -----------------------------------------
  // --- PRESTATIONS OPERATIONS ---
  // -----------------------------------------

  async getPrestations(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for getPrestations");
    if (!projectId)
      return Promise.reject("Project ID is required for getPrestations");
    try {
      const prestationsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/prestations/${projectId}`
      );
      const snapshot = await get(prestationsRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(
        `Error fetching planner prestations for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async addPrestations(tenantId, projectId, data) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addPrestations");
    if (!projectId)
      return Promise.reject("Project ID is required for addPrestations");
    try {
      const prestationsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/prestations/${projectId}`
      );
      await set(prestationsRef, data);
      return true;
    } catch (error) {
      console.error(
        `Error adding planner prestations for project ${projectId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updatePrestations(tenantId, projectId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updatePrestations");
    if (!projectId)
      return Promise.reject("Project ID is required for updatePrestations");
    try {
      const prestationsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/prestations/${projectId}`
      );
      await update(prestationsRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating planner prestations for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deletePrestations(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deletePrestations");
    if (!projectId)
      return Promise.reject("Project ID is required for deletePrestations");
    try {
      const prestationsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/prestations/${projectId}`
      );
      await remove(prestationsRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting planner prestations for project ${projectId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  // -----------------------------------------
  // --- RESOURCES OPERATIONS ---
  // -----------------------------------------

  async getResources(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for getResources");
    if (!projectId)
      return Promise.reject("Project ID is required for getResources");
    try {
      const resourcesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/resources/${projectId}`
      );
      const snapshot = await get(resourcesRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(
        `Error fetching planner resources for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async addResources(tenantId, projectId, data) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addResources");
    if (!projectId)
      return Promise.reject("Project ID is required for addResources");
    try {
      const resourcesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/resources/${projectId}`
      );
      await set(resourcesRef, data);
      return true;
    } catch (error) {
      console.error(
        `Error adding planner resources for project ${projectId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateResources(tenantId, projectId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateResources");
    if (!projectId)
      return Promise.reject("Project ID is required for updateResources");
    try {
      const resourcesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/resources/${projectId}`
      );
      await update(resourcesRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating planner resources for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteResources(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteResources");
    if (!projectId)
      return Promise.reject("Project ID is required for deleteResources");
    try {
      const resourcesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/planner/resources/${projectId}`
      );
      await remove(resourcesRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting planner resources for project ${projectId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 