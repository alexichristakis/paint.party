import React, { ReactNode, memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useMemoOne } from "use-memo-one";
import { snapPoint, horizontalPanGestureHandler } from "react-native-redash";
import { useOnLayout } from "@hooks";

const marginTop = 32;
const CONTAINER_HEIGHT = 100;
export const THRESHOLD = CONTAINER_HEIGHT + marginTop;

const {
  SpringUtils,
  Value,
  Clock,
  eq,
  startClock,
  set,
  add,
  and,
  greaterOrEq,
  lessOrEq,
  cond,
  decay,
  block,
  not,
  spring,
  abs,
  multiply,
  divide,
  sub,
  useCode,
  call,
  neq,
  diff,
  pow,
  min,
} = Animated;

const friction = (ratio: Animated.Node<number>) =>
  multiply(0.52, pow(sub(1, ratio), 2));

interface WithScrollParams {
  translation: Animated.Value<number>;
  velocity: Animated.Value<number>;
  state: Animated.Value<State>;
  container: number;
  content: number;
}

const withScroll = ({
  translation,
  velocity,
  state: gestureState,
  container,
  content,
}: WithScrollParams) => {
  const clock = new Clock();
  const delta = new Value(0);
  const isSpringing = new Value(0);
  const state = {
    time: new Value(0),
    position: new Value(0),
    velocity: new Value(0),
    finished: new Value(0),
  };
  const upperBound = 0;
  const lowerBound = -1 * (content - container);
  const isInBound = and(
    lessOrEq(state.position, upperBound),
    greaterOrEq(state.position, lowerBound)
  );

  const config = {
    ...SpringUtils.makeDefaultConfig(),
    toValue: new Value(0),
  };

  const overscroll = sub(
    state.position,
    cond(greaterOrEq(state.position, 0), upperBound, lowerBound)
  );
  return block([
    startClock(clock),
    set(delta, diff(translation)),
    cond(
      eq(gestureState, State.ACTIVE),
      [
        set(isSpringing, 0),
        set(
          state.position,
          add(
            state.position,
            cond(
              isInBound,
              delta,
              multiply(
                delta,
                friction(min(divide(abs(overscroll), container), 1))
              )
            )
          )
        ),
        set(state.velocity, velocity),
        set(state.time, 0),
      ],
      [
        set(translation, 0),
        cond(
          and(isInBound, not(isSpringing)),
          [decay(clock, state, { deceleration: 0.997 })],
          [
            set(isSpringing, 1),
            set(
              config.toValue,
              snapPoint(state.position, state.velocity, [
                lowerBound,
                upperBound,
              ])
            ),
            spring(clock, state, config),
          ]
        ),
      ]
    ),
    state.position,
  ]);
};
interface ScrollViewProps {
  children: ReactNode;
  translate: Animated.Value<number>;
  velocity: Animated.Value<number>;
}

export default memo(({ children, translate, velocity }: ScrollViewProps) => {
  const { width: content, onLayout: contentOnLayout } = useOnLayout();
  const { width: container, onLayout: containerOnLayout } = useOnLayout();

  const { gestureHandler, translationX, velocityX, state } = useMemoOne(
    () => horizontalPanGestureHandler(),
    []
  );
  useCode(
    () => [
      set(velocity, velocityX),
      set(
        translate,
        withScroll({
          translation: translationX,
          velocity: velocityX,
          state,
          container,
          content,
        })
      ),
    ],
    [container, content, state, translationX, velocityX]
  );

  return (
    <View style={styles.container} onLayout={containerOnLayout}>
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          onLayout={contentOnLayout}
          style={{
            transform: [{ translateX: translate }],
            flexDirection: "row",
          }}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
