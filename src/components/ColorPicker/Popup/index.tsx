import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  onGestureEvent,
  withTransition,
  canvas2Polar,
  withSpringTransition,
  vec,
  translate,
  spring,
} from "react-native-redash";
import { StyleSheet } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  COLOR_SIZE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  COLOR_WHEEL_RADIUS,
  useVectors,
} from "@lib";

import Label from "./Label";
import Indicator from "./Indicator";

const {
  onChange,
  neq,
  add,
  round,
  modulo,
  set,
  eq,
  divide,
  sub,
  cond,
  and,
  lessOrEq,
  greaterThan,
  call,
} = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export type PopupConnectedProps = ConnectedProps<typeof connector>;

export interface PopupProps {
  state: Animated.Value<State>;
  rotation: Animated.Value<number>;
  activeIndex: Animated.Value<number>;
  openTransition: Animated.Node<number>;
  position: {
    x: Animated.Value<number>;
    y: Animated.Value<number>;
  };
}

const mapStateToProps = (state: RootState, props: PopupProps) => ({
  angleIncrement: selectors.angleIncrement(state, props),
  numColors: selectors.numColors(state, props),
});

const mapDispatchToProps = {};

const Popup: React.FC<PopupProps & PopupConnectedProps> = React.memo(
  ({
    position,
    activeIndex,
    rotation,
    openTransition,
    angleIncrement,
    numColors,
    state,
  }) => {
    const [drag, translation] = useVectors(
      [
        [0, 0],
        [0, 0],
      ],
      []
    );

    const handler = onGestureEvent({
      absoluteX: position.x,
      absoluteY: position.y,
      translationX: drag.x,
      translationY: drag.y,
      state,
    });

    const active = eq(state, State.ACTIVE);
    const activeTransition = withTransition(active);
    const activeSpringTransition = withSpringTransition(active);

    const { theta, radius } = canvas2Polar(
      { x: position.x, y: position.y },
      { y: SCREEN_HEIGHT, x: SCREEN_WIDTH / 2 }
    );

    useCode(
      () => [
        onChange(state, cond(eq(state, State.END), vec.set(position, 0))),
        cond(active, vec.set(translation, drag), [
          cond(eq(state, State.END), [
            set(translation.x, spring({ from: translation.x, to: 0, config })),
            set(translation.y, spring({ from: translation.y, to: 0, config })),
          ]),
        ]),
        onChange(
          activeIndex,
          cond(
            neq(activeIndex, -1),
            call([], () => Haptics.trigger("impactLight"))
          )
        ),
        cond(
          and(
            lessOrEq(radius, COLOR_WHEEL_RADIUS + COLOR_SIZE),
            greaterThan(radius, COLOR_WHEEL_RADIUS - COLOR_SIZE / 2)
          ),
          [
            set(
              activeIndex,
              round(
                sub(
                  numColors,
                  modulo(
                    divide(
                      add(theta, modulo(rotation, 2 * Math.PI)),
                      angleIncrement
                    ),
                    numColors
                  )
                )
              )
            ),
          ],
          [set(activeIndex, -1)]
        ),
      ],
      [angleIncrement, numColors]
    );

    return (
      <PanGestureHandler {...handler}>
        <Animated.View
          style={{
            ...styles.container,
            opacity: openTransition,
            transform: translate(translation),
          }}
        >
          <Label transition={activeTransition} />
          <Indicator
            transition={activeSpringTransition}
            {...{ activeIndex, state }}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  },
  (p, n) => p.numColors === n.numColors && p.angleIncrement === n.angleIncrement
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    flexDirection: "row",
    left: 5,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Popup);
