import React, { useRef, useMemo } from "react";
import { StatusBar } from "react-native";

import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "react-native-screens/native-stack";
import { Provider, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import CodePush, { CodePushOptions } from "react-native-code-push";

import {
  useNotificationEvents,
  useColorEditorState,
  ColorEditorContext,
} from "@hooks";
import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import PaletteEditor from "@components/PaletteEditor";
import CreateCanvas from "@components/CreateCanvas";
import ColorEditor from "@components/ColorEditor";

import { Home, Canvas, Landing } from "./screens";

export type StackParamList = {
  HOME: undefined;
  CANVAS: undefined;
  LANDING: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: false,
  stackAnimation: "fade",
};

const Root: React.FC = () => {
  const ref = useRef<NavigationContainerRef>(null);

  const isAuthenticated = useSelector(selectors.isAuthenticated);
  const activeCanvas = useSelector(selectors.activeCanvas);

  const showHome = !!activeCanvas.length;
  return useMemo(
    () => (
      <NavigationContainer ref={ref}>
        <Stack.Navigator screenOptions={screenOptions}>
          {isAuthenticated ? (
            showHome ? (
              <Stack.Screen name="CANVAS" component={Canvas} />
            ) : (
              <Stack.Screen name="HOME" component={Home} />
            )
          ) : (
            <Stack.Screen name="LANDING" component={Landing} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    ),
    [isAuthenticated, showHome]
  );
};

const App: React.FC = () => {
  const colorEditorState = useColorEditorState();
  return useMemo(
    () => (
      <ColorEditorContext.Provider value={colorEditorState}>
        <Root />
        <CreateCanvas />
        <PaletteEditor />
        <ColorEditor />
      </ColorEditorContext.Provider>
    ),
    [colorEditorState.visible]
  );
};

const Connected: React.FC = () => {
  const store = createStore();
  const persistor = persistStore(store);

  useNotificationEvents();
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="dark-content" />
        <App />
      </PersistGate>
    </Provider>
  );
};

const codePushOptions: CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
};
export default CodePush(codePushOptions)(gestureHandlerRootHOC(Connected));
