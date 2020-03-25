import AsyncStorage from "@react-native-community/async-storage";
import { createEpicMiddleware } from "redux-observable";
import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createMigrate, persistReducer } from "redux-persist";

import migrations from "./migrations";
import { rootReducer } from "./modules";
import rootEpic from "./epics";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  migrate: createMigrate(migrations as any, { debug: __DEV__ }),
  version: 0
};

export default () => {
  const epicMiddleware = createEpicMiddleware();

  const middleware = [epicMiddleware];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(...middleware))
  );

  epicMiddleware.run(rootEpic as any);

  return store;
};
