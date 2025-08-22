import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const heuresDb = {
  async getHeures(tenantId, memberId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for getHeures");
    if (!memberId) return Promise.reject("Member ID is required for getHeures");
    try {
      const memberHeuresRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/heures/${memberId}`
      );
      const snapshot = await get(memberHeuresRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(
        `Error fetching heures for member ${memberId} in tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async getHeuresByProject(tenantId, projectId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for getHeuresByProject");
    if (!projectId)
      return Promise.reject("Project ID is required for getHeuresByProject");
    try {
      const tenantHeuresRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/heures`
      );
      const snapshot = await get(tenantHeuresRef);
      if (!snapshot.exists()) return null;
      const allDataForTenant = snapshot.val();
      const result = {};
      for (const [memberId, years] of Object.entries(allDataForTenant)) {
        for (const [year, months] of Object.entries(years)) {
          for (const [month, projects] of Object.entries(months)) {
            if (projects && projects[projectId]) {
              if (!result[memberId]) result[memberId] = {};
              if (!result[memberId][year]) result[memberId][year] = {};
              result[memberId][year][month] = projects[projectId];
            }
          }
        }
      }
      return Object.keys(result).length ? result : null;
    } catch (error) {
      console.error(
        `Error fetching heures for project ${projectId} in tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async addHeure(tenantId, memberId, heuresData) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for addHeure");
    if (!memberId) return Promise.reject("Member ID is required for addHeure");
    try {
      const memberHeuresRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/heures/${memberId}`
      );
      await set(memberHeuresRef, heuresData);
      return true;
    } catch (error) {
      console.error(
        `Error adding heures for member ${memberId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateHeure(tenantId, memberId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateHeure");
    if (!memberId)
      return Promise.reject("Member ID is required for updateHeure");
    try {
      const memberHeuresRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/heures/${memberId}`
      );
      await update(memberHeuresRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating heures for member ${memberId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteHeure(tenantId, memberId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteHeure");
    if (!memberId)
      return Promise.reject("Member ID is required for deleteHeure");
    try {
      const memberHeuresRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/heures/${memberId}`
      );
      await remove(memberHeuresRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting heures for member ${memberId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 