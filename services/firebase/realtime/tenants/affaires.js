import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const affairesDb = {
  async getProjects(tenantId) {
    if (!database) {
      console.error("getProjects: Database not initialized.");
      return Promise.reject("Database not initialized");
    }
    if (!tenantId) {
      console.error("getProjects: tenantId is required.");
      return Promise.reject("tenantId is required");
    }
    try {
      const tenantAffairesRef = ref(database, `tenants/${tenantId}/affaires`);
      const snapshot = await get(tenantAffairesRef);
      if (snapshot.exists()) {
        const dataObject = snapshot.val();
        return Object.keys(dataObject).map((key) => ({
          id: key,
          ...dataObject[key],
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching affaires for tenant ${tenantId}:`, error);
      return null;
    }
  },

  async addProject(tenantId, affaireId, affaireData) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addProject");
    if (!affaireId)
      return Promise.reject("Affaire ID is required for addProject");
    try {
      const newAffaireRef = ref(
        database,
        `tenants/${tenantId}/affaires/${affaireId}`
      );
      await set(newAffaireRef, affaireData);
      return true;
    } catch (error) {
      console.error(
        `Error adding affaire ${affaireId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateProject(tenantId, affaireId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateProject");
    if (!affaireId)
      return Promise.reject("Affaire ID is required for updateProject");
    try {
      const affaireRef = ref(
        database,
        `tenants/${tenantId}/affaires/${affaireId}`
      );
      await update(affaireRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating affaire ${affaireId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteProject(tenantId, affaireId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteProject");
    if (!affaireId)
      return Promise.reject("Affaire ID is required for deleteProject");
    try {
      const affaireRef = ref(
        database,
        `tenants/${tenantId}/affaires/${affaireId}`
      );
      await remove(affaireRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting affaire ${affaireId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 