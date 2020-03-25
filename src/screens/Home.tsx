import React, { useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";
import moment from "moment";

import { RootState } from "@redux/types";
import * as selectors from "@redux/selectors";
import { AppActions, CanvasActions } from "@redux/modules";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state)
});
const mapDispatchToProps = {
  logout: AppActions.logout,
  subscribe: CanvasActions.open,
  joinCanvas: CanvasActions.join,
  unsubscribe: CanvasActions.close,
  createCanvas: CanvasActions.create,
  draw: CanvasActions.draw
};

export type HomeReduxProps = ConnectedProps<typeof connector>;
export interface HomeProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Home: React.FC<HomeProps & HomeReduxProps> = ({
  activeCanvas,
  createCanvas,
  logout,
  subscribe,
  joinCanvas,
  unsubscribe,
  draw
}) => {
  //
  useFocusEffect(
    useCallback(() => {
      if (activeCanvas.length) unsubscribe();
    }, [activeCanvas])
  );

  const TEST_CANVAS: any = {
    name: "test",
    backgroundColor: "#FFFFFF",
    expiresAt: moment()
      .add(3, "days")
      .unix()
  };

  return (
    <View style={styles.container}>
      <Text>Home page</Text>
      <Button title="logout" onPress={logout} />
      <Button title="subscribe" onPress={() => subscribe("canvas_1")} />
      <Button title="test draw" onPress={() => draw(2, "#555555")} />
      <Button title="create canvas" onPress={() => createCanvas(TEST_CANVAS)} />
      <Button
        title="join canvas"
        onPress={() => joinCanvas("tHEpTuC5kxtAf5dYqyar")}
      />
      <Button title="unsubscribe" onPress={unsubscribe} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Home);
