import React, { useCallback } from "react";
import { StyleSheet, View, Share } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { TouchableOpacity } from "react-native-gesture-handler";

import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";
import CanvasVisualization from "@components/Canvas";
import { Countdown } from "@components/universal";
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
  canvas: selectors.canvas(state),
  canvasActiveAt: selectors.canvasActiveAt(state)
});
const mapDispatchToProps = {
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
  open,
  close
}) => {
  useFocusEffect(
    useCallback(() => {
      open(activeCanvas);
    }, [])
  );

  const onPressShare = async () => {
    const result = await Share.share({
      title: "share unexpected",
      message: canvasUrl(activeCanvas)
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={close}>
          <X width={20} height={20} />
        </TouchableOpacity>
        <Countdown toDate={canvasActiveAt} />
        <TouchableOpacity onPress={onPressShare}>
          <Hamburger width={20} height={20} />
        </TouchableOpacity>
      </View>
      <CanvasVisualization loading={loadingCanvas} />
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
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    flexDirection: "row",
    left: 12,
    right: 12,
    top: SB_HEIGHT + 5
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Canvas);
