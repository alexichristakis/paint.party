import React, { useImperativeHandle, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  State,
  TapGestureHandler
} from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";
import Animated, { Extrapolate, concat } from "react-native-reanimated";
import {
  bin,
  clamp,
  onGestureEvent,
  spring,
  useValues,
  withSpring,
  withSpringTransition,
  bInterpolate
} from "react-native-redash";

import Plus from "@assets/svg/plus.svg";
import { CreateCanvasRef, CreateCanvas } from "./CreateCanvas";
import { useMemoOne } from "use-memo-one";

const {
  interpolate,
  onChange,
  or,
  useCode,
  cond,
  and,
  debug,
  abs,
  eq,
  not,
  call,
  block,
  set,
  clockRunning,
  sub,
  Clock,
  Value
} = Animated;

const { UNDETERMINED } = State;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface NewCanvasProps {}

export const NewCanvas: React.FC<NewCanvasProps> = React.memo(() => {
  const createCanvasRef = useRef<CreateCanvasRef>(null);

  const [state] = useValues([State.UNDETERMINED], []);

  const handler = onGestureEvent({ state });

  // const openTransition = useMemoOne(
  //   () => withSpringTransition(open, config),
  //   []
  // );

  const pressedTransition = useMemoOne(
    () =>
      withSpringTransition(
        or(eq(state, State.BEGAN), eq(state, State.ACTIVE)),
        config
      ),
    []
  );

  useCode(
    () => [
      onChange(
        state,
        cond(eq(state, State.END), [
          call([], () => {
            Haptics.trigger("impactLight");
            createCanvasRef.current?.open();
          })
        ])
      )
    ],
    []
  );

  const scale = bInterpolate(pressedTransition, 1, 0.8);
  //   const rotate = concat(bInterpolate(openTransition, 0, 45), "deg");
  return (
    <>
      <TapGestureHandler maxDist={20} {...handler}>
        <Animated.View
          style={[styles.buttonContainer, { transform: [{ scale }] }]}
        >
          <Plus width={75} height={75} />
        </Animated.View>
      </TapGestureHandler>
      <CreateCanvas ref={createCanvasRef} />
    </>
  );
});

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    right: 20,
    bottom: 40
  }
});
