import React, { useRef } from "react";
import { StatusBar } from "react-native";

import {
  NavigationContainer,
  NavigationContainerRef
} from "@react-navigation/native";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { Provider, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import CodePush, { CodePushOptions } from "react-native-code-push";

import { useNotificationEvents } from "@hooks";
import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import { Landing, Home, Canvas } from "./screens";

export type StackParamList = {
  HOME: undefined;
  CANVAS: undefined;
  LANDING: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

const Root = () => {
  const ref = useRef<NavigationContainerRef>(null);

  const isAuthenticated = useSelector(selectors.isAuthenticated);
  const activeCanvas = useSelector(selectors.activeCanvas);

  return (
    <NavigationContainer ref={ref}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          stackAnimation: "fade"
        }}
      >
        {isAuthenticated ? (
          activeCanvas.length ? (
            <Stack.Screen name="CANVAS" component={Canvas} />
          ) : (
            <Stack.Screen name="HOME" component={Home} />
          )
        ) : (
          <Stack.Screen name="LANDING" component={Landing} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const store = createStore();
  const persistor = persistStore(store);

  // persistor.purge();

  useNotificationEvents();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="dark-content" />
        <Root />
      </PersistGate>
    </Provider>
  );
};

const codePushOptions: CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME
};
export default CodePush(codePushOptions)(gestureHandlerRootHOC(App));
