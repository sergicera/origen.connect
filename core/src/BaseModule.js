import mitt from "mitt";
import { Files } from "./Files.js";
import { Database } from "./Database.js";
import { Storage } from "@/services/firebase/storage";

export class BaseModule {
  constructor(code, paths, events) {
    // Emitter
    this.emitter = mitt();

    // Services
    this.db = new Database(this.emitter);
    this.storage = Storage;
    this.files = new Files(this.emitter, paths);
    this.events = { [code]: events };
  }

  /**
   * Dispose of all resources to prevent memory leaks
   * This should be called when the module is no longer needed
   */
  dispose() {
    // Clear all event listeners from the emitter
    if (this.emitter) {
      this.emitter.all.clear();
      this.emitter = null;
    }

    // Dispose of services if they have dispose methods
    if (this.db && typeof this.db.dispose === 'function') {
      this.db.dispose();
    }
    this.db = null;

    if (this.files && typeof this.files.dispose === 'function') {
      this.files.dispose();
    }
    this.files = null;

    // Clear storage reference
    this.storage = null;

    // Clear events
    this.events = null;
  }
}
