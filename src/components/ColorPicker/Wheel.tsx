import React, { useRef } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  mix,
  withDecay,
  atan2,
  useTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

import Swatch from "./Swatch";
import { useVectors } from "@lib";

const { divide, pow, set, eq, sub, cond, add, multiply } = Animated;

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

    const [pos, translation, velocity] = useVectors(
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      []
    );

    const [state] = useValues<State>([State.UNDETERMINED], []);

    const panHandler = onGestureEvent({
      state,
      ...pos,
      velocityX: velocity.x,
      velocityY: velocity.y,
      translationX: translation.x,
      translationY: translation.y,
    });

    const angularVelocity = divide(
      sub(multiply(pos.x, velocity.y), multiply(pos.y, velocity.x)),
      add(pow(pos.x, 2), pow(pos.y, 2))
    );

    const value = sub(
      atan2(sub(pos.x, translation.x), sub(pos.y, translation.y)),
      atan2(pos.x, pos.y)
    );

    const rotate = useMemoOne(
      () => withDecay({ velocity: angularVelocity, value, state }),
      []
    );

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
