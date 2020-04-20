import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { useValues, string } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { CanvasActions, VisualizationActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Visualization, Header } from "@components/Canvas";
import ColorPicker from "@components/ColorPicker";
import { LoadingOverlay } from "@components/universal";
import { useDrawingState, DrawContext, DrawingProvider } from "@hooks";
import { SCREEN_HEIGHT, SCREEN_WIDTH, Colors } from "@lib";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  loadingCanvas: selectors.isLoadingCanvas(state),
});
const mapDispatchToProps = {
  open: CanvasActions.open,
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = React.memo(
  ({ activeCanvas, loadingCanvas, open }) => {
    const [positionsVisible, pickerVisible] = useValues<0 | 1>([0, 0], []);
    const captureRef = useRef<View>(null);

    useFocusEffect(
      useCallback(() => {
        open(activeCanvas);
      }, [])
    );

    // const initialDrawingState = useDrawingState(captureRef);
    // console.log(initialDrawingState);
    return useMemo(
      () => (
        <View style={styles.container}>
          <Header {...{ positionsVisible, pickerVisible }} />
          <DrawingProvider captureRef={captureRef}>
            <Visualization
              {...{ captureRef, pickerVisible, positionsVisible }}
            />
            <ColorPicker visible={pickerVisible} />
          </DrawingProvider>
          <LoadingOverlay loading={loadingCanvas} />
        </View>
      ),
      [positionsVisible, pickerVisible]
    );
  },
  (p, n) =>
    p.activeCanvas === n.activeCanvas && p.loadingCanvas === n.loadingCanvas
);

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
