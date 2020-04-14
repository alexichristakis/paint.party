import React, { useRef } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  mix,
  withDecay,
  useSpringTransition,
  atan2,
  useTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Swatch from "./Swatch";

const { divide, set, eq, sub, cond, add, multiply } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ColorWheelProps {
  angle: Animated.Value<number>;
  activeIndex: Animated.Value<number>;
  openTransition: Animated.Node<number>;
  isDragging: Animated.Node<0 | 1>;
}

export type ColorWheelConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState, props: ColorWheelProps) => ({
  numColors: selectors.numColors(state, props),
  enabled: selectors.canvasEnabled(state),
});
const mapDispatchToProps = {};

const ColorWheel: React.FC<
  ColorWheelProps & ColorWheelConnectedProps
> = React.memo(
  ({ numColors, enabled, activeIndex, angle, openTransition, isDragging }) => {
    const enabledTransition = useTransition(enabled, {
      easing: Easing.inOut(Easing.ease),
    });

    const panRef = useRef<PanGestureHandler>(null);

    const [x, y, translationX, translationY, velocityX, velocityY] = useValues<
      number
    >([0, 0, 0, 0, 0, 0], []);

    const [state] = useValues<State>([State.UNDETERMINED], []);

    const panHandler = onGestureEvent({
      state,
      x,
      y,
      velocityX,
      velocityY,
      translationX,
      translationY,
    });

    const velocity = divide(
      sub(multiply(x, velocityY), multiply(y, velocityX)),
      add(multiply(x, x), multiply(y, y))
    );

    const value = sub(
      atan2(sub(x, translationX), sub(y, translationY)),
      atan2(x, y)
    );

    const rotate = useMemoOne(() => withDecay({ velocity, value, state }), []);

    useCode(() => [cond(isDragging, set(angle, rotate))], []);

    const containerAnimatedStyle = {
      transform: [{ translateY: mix(openTransition, 75, 10) }],
    };

    const animatedStyle = {
      opacity: mix(enabledTransition, 0.5, 1),
      transform: [{ rotate }, { rotate: mix(openTransition, -Math.PI / 4, 0) }],
    };

    return (
      <PanGestureHandler ref={panRef} {...panHandler}>
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <Animated.View
            pointerEvents={enabled ? "auto" : "box-only"}
            style={[styles.container, animatedStyle]}
          >
            {times(numColors, (index) => (
              <Swatch
                key={index}
                active={eq(activeIndex, index)}
                {...{ index, openTransition }}
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
    bottom: 0,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ColorWheel);
