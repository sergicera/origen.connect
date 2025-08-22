import {
  affairesDb,

  usersDb
} from "@/services/firebase";



export class Database {
  constructor() {
    // Root
    this.users = usersDb;

    // Tenants/Affaires
    this.projects = affairesDb;
    
  }

  /**
   * Dispose of all database service references to help with garbage collection
   * This method clears all references to Firebase database services
   */
  dispose() {
    // Clear all database service references
    this.users = null;
    this.projects = null;

  }
}
