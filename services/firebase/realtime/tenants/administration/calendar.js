import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const calendarDb = {
  // -----------------------------------------
  // --- OFFICE LEAVES OPERATIONS ---
  // -----------------------------------------

  async getOfficeLeaves(tenantId, year) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for getOfficeLeaves");
    if (!year) return Promise.reject("Year is required for getOfficeLeaves");
    try {
      const officeLeavesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/office/${year}`
      );
      const snapshot = await get(officeLeavesRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return {}; // Return empty object if no leaves for that year
      }
    } catch (error) {
      console.error(
        `Error fetching office leaves for tenant ${tenantId}, year ${year}:`,
        error
      );
      return null;
    }
  },

  async addOfficeLeave(tenantId, year, leaveId, data) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addOfficeLeave");
    if (!year) return Promise.reject("Year is required for addOfficeLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for addOfficeLeave");
    try {
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/office/${year}/${leaveId}`
      );
      await set(leaveRef, data);
      return true;
    } catch (error) {
      console.error(
        `Error adding office leave ${leaveId} for tenant ${tenantId}, year ${year}:`,
        error
      );
      return false;
    }
  },

  async updateOfficeLeave(tenantId, year, leaveId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateOfficeLeave");
    if (!year) return Promise.reject("Year is required for updateOfficeLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for updateOfficeLeave");
    try {
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/office/${year}/${leaveId}`
      );
      await update(leaveRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating office leave ${leaveId} for tenant ${tenantId}, year ${year}:`,
        error
      );
      return false;
    }
  },

  async deleteOfficeLeave(tenantId, year, leaveId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteOfficeLeave");
    if (!year) return Promise.reject("Year is required for deleteOfficeLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for deleteOfficeLeave");
    try {
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/office/${year}/${leaveId}`
      );
      await remove(leaveRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting office leave ${leaveId} for tenant ${tenantId}, year ${year}:`,
        error
      );
      return false;
    }
  },

  // -----------------------------------------
  // --- MEMBER LEAVES OPERATIONS ---
  // -----------------------------------------

  async getMemberLeaves(tenantId, memberId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for getMemberLeaves");
    if (!memberId)
      return Promise.reject("Member ID is required for getMemberLeaves");
    try {
      // Path fetches all data for the member; filtering by year will happen in middleware/client
      const memberLeavesRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/members/${memberId}`
      );
      const snapshot = await get(memberLeavesRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return {}; // Return empty object if no leaves for that member
      }
    } catch (error) {
      console.error(
        `Error fetching member leaves for member ${memberId}, tenant ${tenantId}:`,
        error
      );
      return null;
    }
  },

  async addMemberLeave(tenantId, memberId, leaveId, data) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for addMemberLeave");
    if (!memberId)
      return Promise.reject("Member ID is required for addMemberLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for addMemberLeave");
    try {
      // This path assumes leaves are structured under year, then leaveId or directly leaveId if data contains year
      // For simplicity, aligning with getMemberLeaves, storing directly under memberId/leaveId.
      // The data object itself should contain year information if needed for specific filtering later.
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/members/${memberId}/${leaveId}`
      );
      await set(leaveRef, data);
      return true;
    } catch (error) {
      console.error(
        `Error adding member leave ${leaveId} for member ${memberId}, tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async updateMemberLeave(tenantId, memberId, leaveId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateMemberLeave");
    if (!memberId)
      return Promise.reject("Member ID is required for updateMemberLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for updateMemberLeave");
    try {
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/members/${memberId}/${leaveId}`
      );
      await update(leaveRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating member leave ${leaveId} for member ${memberId}, tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  async deleteMemberLeave(tenantId, memberId, leaveId) {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteMemberLeave");
    if (!memberId)
      return Promise.reject("Member ID is required for deleteMemberLeave");
    if (!leaveId)
      return Promise.reject("Leave ID is required for deleteMemberLeave");
    try {
      const leaveRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/calendar/members/${memberId}/${leaveId}`
      );
      await remove(leaveRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting member leave ${leaveId} for member ${memberId}, tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 