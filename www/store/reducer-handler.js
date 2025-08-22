import reducers from "./reducers";

const reducerMap = {
  ...reducers,
};

export const reducer = (state, action) => {
  const reducerFunction = reducerMap[action.type];

  if (reducerFunction) {
    return reducerFunction(state, action.payload);
  }

  return { ...state };
};
