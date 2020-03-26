import React, { useCallback } from "react";
import { StyleSheet, View, Text, Platform, Button } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";

import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Canvas as CanvasVisualization } from "@components/Canvas";

import { StackParamList } from "../App";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib";

const mapStateToProps = (state: RootState) => ({
  canvas: selectors.canvas(state)
});
const mapDispatchToProps = {
  close: CanvasActions.close,
  draw: CanvasActions.draw,
  openCanvas: CanvasActions.open
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = ({
  navigation,
  draw,
  close,
  canvas,
  route,
  openCanvas
}) => {
  const handleOnPressCell = (cell: number, color: string) => {
    draw(cell, color);
  };

  return (
    <View style={styles.container}>
      <CanvasVisualization onPressCell={handleOnPressCell} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
