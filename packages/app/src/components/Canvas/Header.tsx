import React, { useCallback } from "react";
import { StyleSheet, View, Share } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import * as selectors from "@redux/selectors";
import { CanvasActions, DrawActions } from "@redux/modules";
import { RootState } from "@redux/types";
import { Countdown } from "@components/universal";
import { canvasURL } from "@global";
import { SB_HEIGHT } from "@lib";

import LiveUsers from "./LiveUsers";

import X from "@assets/svg/X.svg";
import Hamburger from "@assets/svg/hamburger.svg";

const mapStateToProps = (state: RootState) => ({
  activeCanvas: selectors.activeCanvas(state),
  canvas: selectors.activeCanvasEntity(state),
  canvasActiveAt: selectors.canvasActiveAt(state),
});
const mapDispatchToProps = {
  enable: DrawActions.enableCanvas,
  close: CanvasActions.close,
};

export type HeaderReduxProps = ConnectedProps<typeof connector>;
export interface HeaderProps {
  positionsVisible: Animated.Value<0 | 1>;
  pickerVisible: Animated.Value<0 | 1>;
}

const Header: React.FC<HeaderProps & HeaderReduxProps> = ({
  positionsVisible,
  pickerVisible,
  activeCanvas,
  canvasActiveAt,
  canvas,
  enable,
  close,
}) => {
  const handleOnPressShare = () =>
    Share.share({
      title: `share ${canvas.name}`,
      message: canvasURL(activeCanvas),
    });

  const handleOnPressUsers = useCallback(() => {
    positionsVisible.setValue(1);
    pickerVisible.setValue(0);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "absolute",
    left: 12,
    right: 12,
    top: SB_HEIGHT + 5,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Header);
