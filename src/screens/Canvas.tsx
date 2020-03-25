import React, { useCallback } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { StackParamList } from "../App";
import { useFocusEffect, RouteProp } from "@react-navigation/core";

const mapStateToProps = (state: RootState) => ({
  canvas: selectors.canvas(state)
});
const mapDispatchToProps = {
  openCanvas: CanvasActions.open
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = ({
  navigation,
  route,
  openCanvas
}) => {
  const { canvasId } = route.params;

  useFocusEffect(
    useCallback(() => {
      openCanvas(canvasId);
    }, [canvasId])
  );

  return <View></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
