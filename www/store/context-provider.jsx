import { createContext, useContext } from "react";
import { useReducer, useRef } from "react";
import { reducer } from "./reducer-handler";
import { initialState } from "./initial-state";
import { executeCore } from "./action-handler";
import { app, auth } from "@/firebaseConfig";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Initialize Firebase services from the single shared config
export { auth };
const database = getDatabase(app);
const storage = getStorage(app);

// AppContext that provides the global state and a custom dispatch function for state management using `useReducer`
const AppContext = createContext([initialState, () => {}]);

/**
 * ContextProvider component that wraps your application and provides the following contexts:
 *
 * - AppContext provides the global state and a custom dispatch function for state management using `useReducer`.
 * - Services (database and storage) are provided in the execution context to be used by the actions.
 *
 * @param {React.ReactNode} props.children - The child components that will have access to the provided contexts.
 */

export const ContextProvider = ({ children }) => {
  const [state, setState] = useReducer(reducer, initialState);

  // Initialize Firebase services (database and storage) only once using useRef
  const firebaseServicesRef = useRef(null);
  if (!firebaseServicesRef.current) {
    firebaseServicesRef.current = {
      database,
      storage,
    };
  }

  // Custom dispatch function to handle asynchronous actions
  const dispatch = async (value) => {
    // Pass the action to executeCore along with dispatch and Firebase services
    // Dispatch function can lead to its own re-invocation through the actions it processes.
    const action = await executeCore(
      value,
      dispatch,
      firebaseServicesRef.current
    );
    if (action) {
      // Update the state if an action is returned
      setState(action);
    }
  };

  return (
      <AppContext.Provider value={[state, dispatch]}>
        {children}
      </AppContext.Provider>
  );
};

/**
 * Custom hook to access the global state and dispatch function from AppContext.
 *
 * @returns {[Object, Function]} An array containing the current state and the dispatch function.
 *
 * @example
 * const [state, dispatch] = useAppContext();
 */

export const useAppContext = () => {
  return useContext(AppContext);
};