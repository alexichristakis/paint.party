import React, { useRef } from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import {
  State,
  PanGestureHandler,
  TapGestureHandler
} from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withDecay,
  withSpringTransition,
  useSpringTransition,
  withTransition
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { FillColors } from "@lib";
import CloseIcon from "@assets/svg/close.svg";
import { RootState } from "@redux/types";

import ColorWheel from "./ColorWheel";

const {
  divide,
  atan,
  defined,
  set,
  or,
  eq,
  sub,
  cond,
  add,
  call,
  multiply
} = Animated;

const COLOR_SIZE = 60;
const ANGLE_INCREMENT = (2 * Math.PI) / FillColors.length;

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

const mapStateToProps = (state: RootState) => ({});

const ColorPicker: React.FC<ColorPickerProps & ColorPickerConnectedProps> = ({
  visible
}) => {
  const [tapState] = useValues<State>([State.UNDETERMINED], []);

  const [openTransition, closeTransition] = useMemoOne(
    () => [
      withSpringTransition(visible, config),
      withTransition(
        or(eq(tapState, State.ACTIVE), eq(tapState, State.BEGAN)),
        { duration: 200, easing: Easing.inOut(Easing.ease) }
      )
    ],
    []
  );

  const [tapHandler] = useMemoOne(
    () => [onGestureEvent({ state: tapState })],
    []
  );

  useCode(
    () => [onChange(tapState, cond(eq(tapState, State.END), set(visible, 0)))],
    []
  );

  const translateY = bInterpolate(openTransition, 75, -10);
  const scale = bInterpolate(openTransition, 0, 1);

  return (
    <>
      <ColorWheel visible={visible} />
      <TapGestureHandler {...tapHandler}>
        <Animated.View
          style={[
            styles.closeButton,
            {
              transform: [
                { translateY },
                { scale },
                { scale: bInterpolate(closeTransition, 1, 0.9) }
              ]
            }
          ]}
        >
          <CloseIcon width={70} height={70} />
        </Animated.View>
      </TapGestureHandler>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    bottom: 0
  },
  color: {
    position: "absolute",
    borderWidth: 3,
    height: COLOR_SIZE,
    width: COLOR_SIZE
  },
  closeButton: {
    position: "absolute",
    bottom: 20
  }
});

const connector = connect(mapStateToProps, {});
export default connector(ColorPicker);
