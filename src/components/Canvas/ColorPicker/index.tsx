import React from "react";
import Animated, { Easing } from "react-native-reanimated";
import { State } from "react-native-gesture-handler";
import {
  useValues,
  withSpringTransition,
  withTransition
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "@redux/types";

import Button from "./Button";
import ColorWheel from "./Wheel";
import Popup from "./Popup";

const { set, or, eq, cond, call } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ColorPickerProps {
  visible: Animated.Value<0 | 1>;
}

export type ColorPickerConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (_: RootState) => ({});
const mapDispatchToProps = {};

const ColorPicker: React.FC<ColorPickerProps &
  ColorPickerConnectedProps> = React.memo(({ visible }) => {
  const [tapState, popupDragState] = useValues<State>(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );
  const [popupPositionX, popupPositionY] = useValues<number>([0, 0], []);

  const [openTransition, pressInTransition] = useMemoOne(
    () => [
      withSpringTransition(visible, config),
      withTransition(
        or(eq(tapState, State.ACTIVE), eq(tapState, State.BEGAN)),
        { duration: 200, easing: Easing.inOut(Easing.ease) }
      )
    ],
    []
  );

  return (
    <>
      <Button
        state={tapState}
        visible={visible}
        openTransition={openTransition}
      />
      <ColorWheel
        openTransition={openTransition}
        closeTransition={pressInTransition}
      />
      <Popup
        state={popupDragState}
        position={{ x: popupPositionX, y: popupPositionY }}
      />
    </>
  );
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorPicker);
