import React, { useRef } from "react";
import Animated, {
  useCode,
  Easing,
  Value,
  Clock,
  block,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  useValues,
  mix,
  atan2,
  useTransition,
  useGestureHandler,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";
import { connect, ConnectedProps } from "react-redux";
import times from "lodash/times";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { DrawActions } from "@redux/modules";
import { useVectors } from "@lib";

import Swatch from "./Swatch";

const {
  neq,
  and,
  clockRunning,
  stopClock,
  startClock,
  onChange,
  not,
  divide,
  pow,
  set,
  eq,
  sub,
  cond,
  add,
  multiply,
  decay,
} = Animated;

const connector = connect(
  (state: RootState, props: ColorWheelProps) => ({
    numColors: selectors.numColors(state, props),
    enabled: selectors.drawEnabled(state),
  }),
  {
    selectColor: DrawActions.selectColor,
  }
);

export interface ColorWheelProps {
  angle: Animated.Value<number>;
  activeIndex: Animated.Value<number>;
  openTransition: Animated.Node<number>;
  isDragging: Animated.Node<0 | 1>;
}

export type ColorWheelConnectedProps = ConnectedProps<typeof connector>;

const ColorWheel: React.FC<
  ColorWheelProps & ColorWheelConnectedProps
> = React.memo(
  ({
    numColors,
    enabled,
    activeIndex,
    selectColor,
    angle,
    openTransition,
    isDragging,
  }) => {
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

    const [state] = useValues<State>([State.UNDETERMINED]);

    const panHandler = useGestureHandler({
      state,
      ...pos,
      velocityX: velocity.x,
      velocityY: velocity.y,
      translationX: translation.x,
      translationY: translation.y,
    });

    const rotate = useMemoOne(() => {
      const deceleration = 0.998;
      const clock = new Clock();
      const offset = new Value(0);
      const a0 = new Value(0);
      const decayState = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0),
      };

      const angularVelocity = divide(
        sub(multiply(pos.x, velocity.y), multiply(pos.y, velocity.x)),
        add(pow(pos.x, 2), pow(pos.y, 2))
      );

      const value = sub(a0, atan2(pos.x, pos.y));

      const isDecayInterrupted = and(
        eq(state, State.BEGAN),
        clockRunning(clock)
      );
      const finishDecay = [set(offset, decayState.position), stopClock(clock)];

      return block([
        cond(isDecayInterrupted, finishDecay),
        onChange(
          state,
          cond(neq(state, State.END), [set(a0, atan2(pos.x, pos.y))])
        ),
        cond(neq(state, State.END), [
          set(decayState.finished, 0),
          set(decayState.position, add(offset, value)),
        ]),
        cond(eq(state, State.END), [
          cond(and(not(clockRunning(clock)), not(decayState.finished)), [
            set(decayState.velocity, angularVelocity),
            set(decayState.time, 0),
            startClock(clock),
          ]),
          decay(clock, decayState, { deceleration }),
          cond(decayState.finished, finishDecay),
        ]),
        decayState.position,
      ]);
    }, [state, pos, velocity]);

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
                onPress={selectColor}
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

export default connector(ColorWheel);
