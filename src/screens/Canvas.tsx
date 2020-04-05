import React, { useCallback, useRef } from "react";
import { StyleSheet, View, Share } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useValues } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { CanvasActions, VisualizationActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Visualization, ColorPicker, LiveUsers } from "@components/Canvas";
import PaletteEditor, { PaletteEditorRef } from "@components/PaletteEditor";
import { Countdown, LoadingOverlay } from "@components/universal";
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  Colors,
  SB_HEIGHT,
  canvasUrl
} from "@lib";

import X from "@assets/svg/X.svg";
import Hamburger from "@assets/svg/hamburger.svg";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  loadingCanvas: selectors.isLoadingCanvas(state),
  canvas: selectors.activeCanvasEntity(state),
  canvasActiveAt: selectors.canvasActiveAt(state)
});
const mapDispatchToProps = {
  enable: VisualizationActions.enableCanvas,
  close: CanvasActions.close,
  open: CanvasActions.open
};

export type CanvasReduxProps = ConnectedProps<typeof connector>;
export interface CanvasProps {
  route: RouteProp<StackParamList, "CANVAS">;
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Canvas: React.FC<CanvasProps & CanvasReduxProps> = ({
  activeCanvas,
  loadingCanvas,
  canvasActiveAt,
  canvas,
  enable,
  open,
  close
}) => {
  const [positionsVisible, pickerVisible] = useValues<0 | 1>([0, 0], []);
  const paletteEditorRef = useRef<PaletteEditorRef>(null);

  useFocusEffect(
    useCallback(() => {
      open(activeCanvas);
    }, [])
  );

  const handleOnPressShare = () =>
    Share.share({
      title: `share ${canvas.name}`,
      message: canvasUrl(activeCanvas)
    });

  const handleOnPressUsers = () => {
    positionsVisible.setValue(1);
    pickerVisible.setValue(0);
  };

  const handleOnPressEdit = () => {
    paletteEditorRef.current?.open();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={close}>
            <X width={20} height={20} />
          </TouchableOpacity>
          <Countdown enable={enable} toDate={canvasActiveAt} />
          <TouchableOpacity onPress={handleOnPressShare}>
            <Hamburger width={20} height={20} />
          </TouchableOpacity>
        </View>
        <LiveUsers onPress={handleOnPressUsers} />
      </View>
      <Visualization
        pickerVisible={pickerVisible}
        positionsVisible={positionsVisible}
      />
      <ColorPicker visible={pickerVisible} onPressEdit={handleOnPressEdit} />
      <LoadingOverlay loading={loadingCanvas} />
      <PaletteEditor ref={paletteEditorRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    alignItems: "center",
    position: "absolute",
    left: 12,
    right: 12,
    top: SB_HEIGHT + 5
  },
  headerRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
