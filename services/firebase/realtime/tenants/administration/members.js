import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const membersDb = {
  async getMembers(tenantId) {
    if (!database) {
      console.error("getMembers: Database not initialized.");
      return Promise.reject("Database not initialized");
    }
    if (!tenantId) {
      console.error("getMembers: tenantId is required.");
      return Promise.reject("tenantId is required");
    }
    try {
      const tenantMembersRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/members`
      );
      const snapshot = await get(tenantMembersRef);
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
      console.error(`Error fetching members for tenant ${tenantId}:`, error);
      return null;
    }
  },

  async addMember(tenantId, memberId, memberData) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for addMember");
    if (!memberId) return Promise.reject("Member ID is required for addMember");
    try {
      const newMemberRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/members/${memberId}`
      );
      await set(newMemberRef, memberData);
      return true;
    } catch (error) {
      console.error(
        `Error adding member ${memberId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateMember(tenantId, memberId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateMember");
    if (!memberId)
      return Promise.reject("Member ID is required for updateMember");
    try {
      const memberRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/members/${memberId}`
      );
      await update(memberRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating member ${memberId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteMember(tenantId, memberId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteMember");
    if (!memberId)
      return Promise.reject("Member ID is required for deleteMember");
    try {
      const memberRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/members/${memberId}`
      );
      await remove(memberRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting member ${memberId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 