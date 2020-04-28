import React from "react";
import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import "react-native-gesture-handler";

import App from "./src/App";
import { name as appName } from "./app.json";

if (__DEV__) {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");

  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

enableScreens();
AppRegistry.registerComponent(appName, () => App);
