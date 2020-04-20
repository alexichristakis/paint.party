import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { useValues } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Visualization, Header } from "@components/Canvas";
import ColorPicker from "@components/ColorPicker";
import { LoadingOverlay } from "@components/universal";
import { DrawingProvider } from "@hooks";
import { SCREEN_HEIGHT, SCREEN_WIDTH, Colors } from "@lib";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  loadingCanvas: selectors.isLoadingCanvas(state),
});
const mapDispatchToProps = {};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = React.memo(
  ({ loadingCanvas }) => {
    const [positionsVisible, pickerVisible] = useValues<0 | 1>([0, 0], []);
    const captureRef = useRef<View>(null);

    return (
      <View style={styles.container}>
        <Header {...{ positionsVisible, pickerVisible }} />
        <DrawingProvider captureRef={captureRef}>
          <Visualization {...{ captureRef, pickerVisible, positionsVisible }} />
          <ColorPicker visible={pickerVisible} />
        </DrawingProvider>
        <LoadingOverlay loading={loadingCanvas} />
      </View>
    );
  },
  (p, n) => p.loadingCanvas === n.loadingCanvas
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
