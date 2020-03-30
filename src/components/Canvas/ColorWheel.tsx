import React, { useRef } from "react";
import Animated, { useCode } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  bInterpolate,
  withDecay,
  useSpringTransition,
  atan2
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Color from "./Color";

const { and, divide, defined, set, eq, sub, cond, add, multiply } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ColorWheelProps {
  onChoose: () => void;
  openTransition: Animated.Node<number>;
  closeTransition: Animated.Node<number>;
}

export type ColorWheelConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({
  numColors: selectors.numColors(state),
  enabled: selectors.canvasEnabled(state)
});
const mapDispatchToProps = {};

const ColorWheel: React.FC<ColorWheelProps &
  ColorWheelConnectedProps> = React.memo(
  ({ numColors, enabled, openTransition, closeTransition, onChoose }) => {
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

    const [panState] = useValues<State>([State.UNDETERMINED], []);

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

    const diff = sub(atan2(x0, y0), atan2(x, y));
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

    const containerAnimatedStyle = {
      transform: [{ translateY: bInterpolate(openTransition, 75, 10) }]
    };

    const animatedStyle = {
      opacity: bInterpolate(enabledTransition, 0.5, 1),
      transform: [
        { scale: bInterpolate(closeTransition, 1, 0.9) },
        { rotate },
        { rotate: bInterpolate(openTransition, -Math.PI / 4, 0) }
      ]
    };

    return (
      <PanGestureHandler ref={panRef} {...panHandler}>
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <Animated.View
            pointerEvents={enabled ? "auto" : "none"}
            style={[styles.container, animatedStyle]}
          >
            {times(numColors, index => (
              <Color
                key={index}
                {...{
                  index,
                  panRef,
                  x0,
                  absoluteY,
                  x: translationX,
                  y: translationY,
                  editingColor,
                  openTransition
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
