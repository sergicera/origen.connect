import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const functionsDb = {
  async getFunctions(tenantId) {
    if (!database) {
      console.error("getFunctions: Database not initialized.");
      return Promise.reject("Database not initialized");
    }
    if (!tenantId) {
      console.error("getFunctions: tenantId is required.");
      return Promise.reject("tenantId is required");
    }
    try {
      const tenantFunctionsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/functions`
      );
      const snapshot = await get(tenantFunctionsRef);
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
      console.error(`Error fetching functions for tenant ${tenantId}:`, error);
      return null;
    }
  },

  async addFunction(tenantId, functionId, functionData) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addFunction");
    if (!functionId)
      return Promise.reject("Function ID is required for addFunction");
    try {
      const newFunctionRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/functions/${functionId}`
      );
      await set(newFunctionRef, functionData);
      return true;
    } catch (error) {
      console.error(
        `Error adding function ${functionId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateFunction(tenantId, functionId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateFunction");
    if (!functionId)
      return Promise.reject("Function ID is required for updateFunction");
    try {
      const functionRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/functions/${functionId}`
      );
      await update(functionRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating function ${functionId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteFunction(tenantId, functionId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteFunction");
    if (!functionId)
      return Promise.reject("Function ID is required for deleteFunction");
    try {
      const functionRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/functions/${functionId}`
      );
      await remove(functionRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting function ${functionId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 