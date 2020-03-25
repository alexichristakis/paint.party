import AsyncStorage from '@react-native-community/async-storage';
import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {createMigrate, persistReducer} from 'redux-persist';

import migrations from './migrations';
import root from './reducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  migrate: createMigrate(migrations as any, {debug: __DEV__}),
  version: 0,
};

export default () => {
  const middleware = [] as any;
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  const persistedReducer = persistReducer(persistConfig, root);

  const store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  return store;
};
