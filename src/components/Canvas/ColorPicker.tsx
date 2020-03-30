import React from "react";
import Animated, { Easing, onChange, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withSpringTransition,
  withTransition
} from "react-native-redash";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";

import CloseIcon from "@assets/svg/close.svg";

import ColorWheel from "./ColorWheel";

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

const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ visible }) => {
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
    () => [
      onChange(
        tapState,
        cond(eq(tapState, State.END), [
          set(visible, 0),
          call([], () => Haptics.trigger("impactLight"))
        ])
      )
    ],
    []
  );

  const animatedStyle = {
    transform: [
      { translateY: bInterpolate(openTransition, 75, -10) },
      { scale: bInterpolate(openTransition, 0, 1) },
      { scale: bInterpolate(closeTransition, 1, 0.9) }
    ]
  };

  return (
    <>
      <ColorWheel
        openTransition={openTransition}
        closeTransition={closeTransition}
      />
      <TapGestureHandler maxDist={20} {...tapHandler}>
        <Animated.View style={[styles.closeButton, animatedStyle]}>
          <CloseIcon width={70} height={70} />
        </Animated.View>
      </TapGestureHandler>
    </>
  );
});

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    bottom: 20
  }
});

export default ColorPicker;
