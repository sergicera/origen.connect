import actions from "./actions";

const actionHandlers = {
  ...actions,
};

/**
 * Executes the specified action using its corresponding action handler.
 *
 * This function is an asynchronous operation that dynamically selects and
 * instantiates the appropriate action handler based on the action type.
 * Each action handler is expected to be a class that can be instantiated with a
 * dispatch function, allowing the handler to dispatch further actions as needed.
 *
 * @param {Object} action - The action object to be processed. This object should
 *                          include at least a `type` property to indicate the type
 *                          of action to execute.
 *
 * @param {Function} dispatch - The dispatch function that can be used by action
 *                              handlers to dispatch further actions. This function
 *                              should accept an action object as its parameter.
 *
 * @throws {Error} Throws an error if no action handler is found for the provided
 *                 action type, indicating a configuration or usage issue.
 *
 * Note: This function assumes the existence of a global `actionHandlers` object
 * that maps action types to their corresponding handler classes. Each handler class
 * must implement an `execute` method that performs the action's logic.
 */

export const executeCore = async (action, dispatch, firebaseServices) => {
  const Handler = actionHandlers[action.type];

  if (!Handler) {
    console.log("Action", action.type);
    console.log("ActionHandlers", actionHandlers);
    console.log("Handler", Handler);
    throw new Error(`No handler found for action type: ${action.type}`);
  }

  // Extract the needed services from Firebase
  const { database, storage } = firebaseServices;

  // Create an instance of the ActionHanler class, passing dispatch and services
  const handler = new Handler({ dispatch, database, storage });

  return handler.execute(action);
};
