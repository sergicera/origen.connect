import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

export const teamsDb = {
  getTeams: async (tenantId) => {
    if (!database) {
      console.error("getTeams: Database not initialized.");
      return Promise.reject("Database not initialized");
    }
    if (!tenantId) {
      console.error("getTeams: tenantId is required.");
      return Promise.reject("tenantId is required");
    }
    try {
      const tenantTeamsRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/teams`
      );
      const snapshot = await get(tenantTeamsRef);
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
      console.error(`Error fetching teams for tenant ${tenantId}:`, error);
      return null;
    }
  },

  addTeam: async (tenantId, teamId, teamData) => {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId) return Promise.reject("Tenant ID is required for addTeam");
    if (!teamId) return Promise.reject("Team ID is required for addTeam");
    try {
      const newTeamRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/teams/${teamId}`
      );
      await set(newTeamRef, teamData);
      return true;
    } catch (error) {
      console.error(
        `Error adding team ${teamId} to tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  updateTeam: async (tenantId, teamId, updates) => {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for updateTeam");
    if (!teamId) return Promise.reject("Team ID is required for updateTeam");
    try {
      const teamRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/teams/${teamId}`
      );
      await update(teamRef, updates);
      return true;
    } catch (error) {
      console.error(
        `Error updating team ${teamId} in tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },

  deleteTeam: async (tenantId, teamId) => {
    if (!database) return Promise.reject("Database not initialized");
    if (!tenantId)
      return Promise.reject("Tenant ID is required for deleteTeam");
    if (!teamId) return Promise.reject("Team ID is required for deleteTeam");
    try {
      const teamRef = ref(
        database,
        `tenants/${tenantId}/administration/erp/teams/${teamId}`
      );
      await remove(teamRef);
      return true;
    } catch (error) {
      console.error(
        `Error deleting team ${teamId} from tenant ${tenantId}:`,
        error
      );
      return false;
    }
  },
}; 