import React from "react";
import Animated, { Easing } from "react-native-reanimated";
import { State } from "react-native-gesture-handler";
import {
  useValues,
  withSpringTransition,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import { View, StyleSheet } from "react-native";

import { RootState } from "@redux/types";
import { COLOR_WHEEL_RADIUS, COLOR_SIZE } from "@lib";

import Button from "./Button";
import Popup from "./Popup";
import ColorWheel from "./Wheel";

const { or, eq } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ColorPickerProps {
  onPressEdit: () => void;
  visible: Animated.Value<0 | 1>;
}

export type ColorPickerConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (_: RootState) => ({});
const mapDispatchToProps = {};

const ColorPicker: React.FC<
  ColorPickerProps & ColorPickerConnectedProps
> = React.memo(
  ({ visible, onPressEdit }) => {
    const [tapState, popupDragState] = useValues<State>(
      [State.UNDETERMINED, State.UNDETERMINED],
      []
    );
    const [popupPositionX, popupPositionY, rotation, activeIndex] = useValues<
      number
    >([0, 0, 0, -1], []);

    const [openTransition, closeTransition] = useMemoOne(
      () => [
        withSpringTransition(visible, config),
        withTransition(
          or(eq(tapState, State.ACTIVE), eq(tapState, State.BEGAN)),
          { duration: 200, easing: Easing.inOut(Easing.ease) }
        ),
      ],
      []
    );

    return (
      <View style={styles.container} pointerEvents={"box-none"}>
        <Button
          state={tapState}
          visible={visible}
          openTransition={openTransition}
          onPress={onPressEdit}
        />
        <ColorWheel
          angle={rotation}
          isDragging={eq(popupDragState, State.ACTIVE)}
          {...{ activeIndex, openTransition, closeTransition }}
        />
        <Popup
          state={popupDragState}
          position={{ x: popupPositionX, y: popupPositionY }}
          {...{ rotation, activeIndex, openTransition }}
        />
      </View>
    );
  },
  () => true
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    height: COLOR_WHEEL_RADIUS + COLOR_SIZE,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorPicker);
