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
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";

import * as selectors from "@redux/selectors";
import { FillColors, OuterWheel } from "@lib";
import { RootState } from "@redux/types";

import Color from "./Color";
import { CanvasActions } from "@redux/modules";

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

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ColorWheelProps {
  colors?: string[];
  visible: Animated.Value<0 | 1>;
}

export type ColorWheelConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  enabled: selectors.canvasEnabled(state)
});
const mapDispatchToProps = {
  onChoose: CanvasActions.selectColor
};

const ColorWheel: React.FC<ColorWheelProps & ColorWheelConnectedProps> = ({
  colors = OuterWheel,
  onChoose,
  enabled,
  visible
}) => {
  const enabledTransition = useSpringTransition(enabled, config);

  const panRef = useRef<PanGestureHandler>(null);

  const [
    x,
    y,
    translationX,
    translationY,
    velocityX,
    velocityY,
    velocity,
    angle
  ] = useValues<number>(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    []
  );

  const [panState, tapState] = useValues<State>(
    [State.UNDETERMINED, State.UNDETERMINED],
    []
  );

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

  const panHandler = useMemoOne(
    () =>
      onGestureEvent({
        state: panState,
        x,
        y,
        velocityX,
        velocityY,
        translationX,
        translationY
      }),
    []
  );

  useCode(
    () => [
      onChange(tapState, cond(eq(tapState, State.END), set(visible, 0))),
      set(
        angle,
        sub(
          atan(
            divide(sub(x, translationX), multiply(-1, sub(y, translationY)))
          ),
          atan(divide(x, multiply(-1, y)))
        )
      ),

      set(
        velocity,
        divide(
          sub(multiply(x, velocityY), multiply(y, velocityX)),
          add(multiply(x, x), multiply(y, y))
        )
      )
    ],
    []
  );

  const rotate = useMemoOne(
    () =>
      withDecay({
        velocity,
        value: cond(defined(angle), multiply(-1, angle), 0),
        state: panState
      }),
    []
  );

  const translateY = bInterpolate(openTransition, 75, 10);

  const opacity = bInterpolate(enabledTransition, 0.5, 1);

  const rotationStyle = {
    transform: [
      { rotate },
      { rotate: bInterpolate(openTransition, -Math.PI / 4, 0) }
    ]
  };

  const angleIncrement = (2 * Math.PI) / colors.length;
  return (
    <PanGestureHandler ref={panRef} {...panHandler}>
      <Animated.View
        style={[styles.container, { transform: [{ translateY }] }]}
      >
        <Animated.View
          pointerEvents={enabled ? "auto" : "none"}
          style={[styles.container, rotationStyle, { opacity }]}
        >
          {FillColors.map((color, index) => (
            <Color
              key={index}
              rotate={angleIncrement * index}
              {...{
                color,
                panRef,
                onChoose,
                openTransition,
                closeTransition
              }}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    bottom: 0
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorWheel);
