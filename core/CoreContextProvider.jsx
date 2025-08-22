import { createContext, useContext } from "react";
import { useEffect, useRef, useCallback } from "react";
import { moduleFactories } from "./moduleFactory";

// New context for modules
const CoreContext = createContext(null);

export const CoreContextProvider = ({ children }) => {
  const modulesRef = useRef(null);

  // Initialize manager
  if (!modulesRef.current) {
    const manager = {};
    manager.modules = {};
    manager.subscriptions = [];
    modulesRef.current = manager;
  }

      // Attach event listeners
    const attachListeners = useCallback((domain) => {
    const manager = modulesRef.current;
    const module = manager.modules[domain];
    const emitter = manager.modules[domain].emitter;

    // Prioritize events defined within the module, fallback to central events file
    const moduleEvents =
      (module && module.events && module.events[domain]) || [];

    const unsubscribeFns = [];

    moduleEvents.forEach((eventName) => {
      const handler = (payload) => {
        manager.subscriptions.forEach((callback) => {
          callback(eventName, payload);
        });
      };

      emitter.on(eventName, handler);

      // Store an unsubscribe for cleanup
      unsubscribeFns.push(() => {
        emitter.off(eventName, handler);
      });
    });

    return unsubscribeFns;
  }, []);

  // Load all modules on initialization
  useEffect(() => {
    const manager = modulesRef.current;
    const allUnsubscribeFns = [];

    Object.keys(moduleFactories).forEach((moduleId) => {
      if (!manager.modules[moduleId]) {
        manager.modules[moduleId] = moduleFactories[moduleId]();

        // Attach event listeners for this module
        const unsubscribeFns = attachListeners(moduleId);
        allUnsubscribeFns.push(...unsubscribeFns);
      }
    });

    // Cleanup function – unsubscribe and dispose module resources
    return () => {
      try {
        allUnsubscribeFns.forEach((fn) => fn());
      } finally {
        // Clear all subscriptions first to prevent any late events
        manager.subscriptions = [];
        
        // Dispose modules (this will cascade and free internal resources)
        try {
          Object.entries(manager.modules).forEach(([moduleId, module]) => {
            // Remove all event listeners first
            if (module && module.emitter && module.emitter.removeAllListeners) {
              module.emitter.removeAllListeners();
            } else if (module && module.emitter && module.emitter.all) {
              // For mitt emitters, clear all handlers
              module.emitter.all.clear();
            }
            
            // Then dispose the module itself
            if (module && typeof module.dispose === "function") {
              module.dispose();
            }
          });
          
          // Clear the modules map
          manager.modules = {};
        } catch (e) {
          console.warn("Error during module cleanup:", e);
        }
      }
    };
  }, [attachListeners]);

  // Function to subscribe to module events
  const subscribe = useCallback((callback) => {
    if (!modulesRef.current) return () => {};
    
    modulesRef.current.subscriptions.push(callback);
    // Return unsubscribe function
    return () => {
      if (!modulesRef.current) return;
      const index = modulesRef.current.subscriptions.indexOf(callback);
      if (index !== -1) {
        modulesRef.current.subscriptions.splice(index, 1);
      }
    };
  }, []);

  // Function to get a loaded module
  const getModule = useCallback((moduleId) => {
    return modulesRef.current.modules[moduleId];
  }, []);

  // Function to reset all modules
  const resetModules = useCallback(() => {
    const manager = modulesRef.current;
    const allUnsubscribeFns = [];

    // Clean up any module resources
    Object.entries(manager.modules).forEach(([moduleId, module]) => {
      // Remove all event listeners first
      if (module && module.emitter) {
        if (module.emitter.removeAllListeners) {
          module.emitter.removeAllListeners();
        } else if (module.emitter.all) {
          // For mitt emitters, clear all handlers
          module.emitter.all.clear();
        }
      }
      
      // Then dispose the module
      if (module && typeof module.dispose === "function") {
        module.dispose();
      }
    });

    // Clear all modules
    manager.modules = {};

    // Clear all subscriptions
    manager.subscriptions = [];

    // Reload all modules
    Object.keys(moduleFactories).forEach((moduleId) => {
      manager.modules[moduleId] = moduleFactories[moduleId]();

      // Attach event listeners for this module
      const unsubscribeFns = attachListeners(moduleId);
      allUnsubscribeFns.push(...unsubscribeFns);
    });

    // Return cleanup function
    return () => {
      allUnsubscribeFns.forEach((fn) => fn());
    };
  }, [attachListeners]);

  return (
    <CoreContext.Provider
      value={{
        modules: modulesRef.current,
        subscribe,
        getModule,
        resetModules,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};

export const useCoreContext = () => {
  return useContext(CoreContext);
};
