import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { useFocusEffect, RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import moment from "moment";

import * as selectors from "@redux/selectors";
import { CanvasActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Canvas as CanvasVisualization } from "@components/Canvas";
import { Countdown } from "@components/universal";

import { SCREEN_HEIGHT, SCREEN_WIDTH, Colors, SB_HEIGHT } from "@lib";
import X from "@assets/svg/X.svg";
import Hamburger from "@assets/svg/hamburger.svg";

import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
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
  activeCanvas,
  openCanvas,
  draw
}) => {
  const canvasActiveAt = useSelector(selectors.canvasActiveAt);

  useFocusEffect(
    useCallback(() => {
      openCanvas(activeCanvas);
    }, [])
  );

  const enabled = canvasActiveAt < moment().unix();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <X width={20} height={20} />
        </TouchableOpacity>
        <Countdown enabled={enabled} toDate={canvasActiveAt} />
        <TouchableOpacity>
          <Hamburger width={20} height={20} />
        </TouchableOpacity>
      </View>

      <CanvasVisualization enabled={enabled} onPressCell={draw} />
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
