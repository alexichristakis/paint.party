import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { useValues } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { CanvasActions, VisualizationActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Visualization, Header } from "@components/Canvas";
import ColorPicker from "@components/ColorPicker";
import { LoadingOverlay } from "@components/universal";
import { SCREEN_HEIGHT, SCREEN_WIDTH, Colors } from "@lib";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  loadingCanvas: selectors.isLoadingCanvas(state),
});
const mapDispatchToProps = {
  open: CanvasActions.open,
  capture: VisualizationActions.capturePreview,
  draw: VisualizationActions.draw,
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = ({
  activeCanvas,
  loadingCanvas,
  capture,
  draw,
  open,
}) => {
  const [positionsVisible, pickerVisible] = useValues<0 | 1>([0, 0], []);
  const captureRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      open(activeCanvas);
    }, [])
  );

  const handleOnDraw = () => {
    draw();
    capture(captureRef);
  };

  return (
    <View style={styles.container}>
      <Header {...{ positionsVisible, pickerVisible }} />
      <Visualization {...{ captureRef, pickerVisible, positionsVisible }} />
      <ColorPicker onDraw={handleOnDraw} visible={pickerVisible} />
      <LoadingOverlay loading={loadingCanvas} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.lightGray,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
