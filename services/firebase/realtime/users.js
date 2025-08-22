import { ref, get, set, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

const usersRef = ref(database, "users");

export const usersDb = {
  async getUsers() {
    if (!database || !usersRef) {
      console.error("getUsers: Database not initialized.");
      return Promise.reject("Database not initialized");
    }
    try {
      const snapshot = await get(usersRef);
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
      console.error("Error fetching users:", error);
      return null;
    }
  },

  async addUser(userId, userData) {
    if (!database) return Promise.reject("Database not initialized");
    if (!userId) return Promise.reject("User ID is required for addUser");
    try {
      const newUserRef = ref(database, `users/${userId}`);
      await set(newUserRef, userData);
      return true;
    } catch (error) {
      console.error(`Error adding user ${userId}:`, error);
      return false;
    }
  },

  async updateUser(userId, updates) {
    if (!database) return Promise.reject("Database not initialized");
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, updates);
      return true;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      return false;
    }
  },

  async deleteUser(userId) {
    if (!database) return Promise.reject("Database not initialized");
    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  },
}; 