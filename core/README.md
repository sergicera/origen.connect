# @core

The `@core/` directory contains the heart of the application's business logic, architected to be framework-agnostic. All core functionalities are encapsulated within vanilla JavaScript classes, referred to as "modules," to ensure they remain independent from React.

This design decouples the complex business logic from the view layer, making the system more modular, maintainable, and easier to test in isolation.

## `CoreContextProvider`

The `CoreContextProvider.jsx` serves as the bridge between the vanilla JavaScript modules and the React component tree.

-   **Initialization**: It instantiates all defined modules using a `moduleFactory`.
-   **State Management**: It holds references to all module instances within a `useRef` hook. This ensures that the state of our vanilla JS classes persists throughout the component lifecycle without being affected by React's re-renders.
-   **Context API**: It exposes the modules and associated functionalities (like event subscription and module retrieval) to the entire application via a React Context. Components can then access the core logic using the `useCoreContext` hook.

