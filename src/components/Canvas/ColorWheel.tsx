import React, { useRef } from "react";
import Animated, { Easing, useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withDecay,
  withSpringTransition,
  useSpringTransition,
  withTransition,
  cartesian2Polar
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Color from "./Color";

const {
  and,
  divide,
  onChange,
  defined,
  set,
  or,
  eq,
  sub,
  cond,
  add,
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
  visible: Animated.Value<0 | 1>;
}

export type ColorWheelConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  numColors: selectors.numColors(state),
  enabled: selectors.canvasEnabled(state)
});
const mapDispatchToProps = {};

const ColorWheel: React.FC<ColorWheelProps &
  ColorWheelConnectedProps> = React.memo(
  ({ numColors, enabled, visible }) => {
    const enabledTransition = useSpringTransition(enabled, config);

    const panRef = useRef<PanGestureHandler>(null);

    const [
      x0,
      y0,
      x,
      y,
      translationX,
      translationY,
      velocityX,
      velocityY,
      velocity,
      absoluteY,
      editingColor
    ] = useValues<number>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], []);

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
          absoluteY,
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
        set(x0, sub(x, translationX)),
        set(y0, sub(y, translationY)),

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

    const diff = sub(
      cartesian2Polar({ x, y }).theta,
      cartesian2Polar({ x: x0, y: y0 }).theta
    );

    const rotate = useMemoOne(
      () =>
        withDecay({
          velocity: cond(editingColor, 0, velocity),
          value: cond(defined(diff), diff, 0),
          state: cond(
            and(editingColor, eq(panState, State.ACTIVE)),
            State.END,
            panState
          ) as Animated.Value<State>
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

    return (
      <PanGestureHandler ref={panRef} {...panHandler}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
        >
          <Animated.View
            pointerEvents={enabled ? "auto" : "none"}
            style={[styles.container, rotationStyle, { opacity }]}
          >
            {times(numColors, index => (
              <Color
                key={index}
                {...{
                  index,
                  x0,
                  absoluteY,
                  x: translationX,
                  y: translationY,
                  editingColor,
                  panRef,
                  openTransition,
                  closeTransition
                }}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  },
  (p, n) => p.enabled === n.enabled && p.numColors === n.numColors
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    bottom: 0
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorWheel);
