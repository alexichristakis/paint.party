import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  onGestureEvent,
  withSpringTransition,
  mix,
  useValues,
  withSpring,
  withTransition,
  canvas2Polar,
} from "react-native-redash";
import { StyleSheet } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";
import { useMemoOne } from "use-memo-one";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  COLOR_BORDER_WIDTH,
  COLOR_SIZE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  COLOR_WHEEL_RADIUS,
  POPUP_SIZE,
} from "@lib";
import { PaletteActions } from "@redux/modules";

import Label from "./Label";

const {
  onChange,
  neq,
  greaterOrEq,
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
  cell: selectors.selectedCellLatestUpdate(state),
  angleIncrement: selectors.angleIncrement(state, props),
  numColors: selectors.numColors(state, props),
});

const mapDispatchToProps = {
  setColor: PaletteActions.set,
};

const Popup: React.FC<PopupProps & PopupConnectedProps> = ({
  setColor,
  position,
  activeIndex,
  rotation,
  openTransition,
  angleIncrement,
  numColors,
  cell,
  state,
}) => {
  const [dragX, dragY, velocityX, velocityY] = useValues<number>(
    [0, 0, 0, 0],
    []
  );

  const handler = onGestureEvent({
    absoluteX: position.x,
    absoluteY: position.y,
    translationX: dragX,
    translationY: dragY,
    velocityX,
    velocityY,
    state,
  });

  const active = eq(state, State.ACTIVE);
  const activeTransition = withTransition(active);
  const activeSpringTransition = withSpringTransition(active);

  const [translateX, translateY] = useMemoOne(
    () => [
      withSpring({
        value: dragX,
        velocity: velocityX,
        state,
        snapPoints: [0],
        config,
      }),
      withSpring({
        value: dragY,
        velocity: velocityY,
        state,
        snapPoints: [0],
        config,
      }),
    ],
    []
  );

  const { theta, radius } = canvas2Polar(
    { x: position.x, y: position.y },
    { y: SCREEN_HEIGHT, x: SCREEN_WIDTH / 2 }
  );

  useCode(
    () => [
      onChange(
        state,
        cond(
          and(eq(state, State.END), greaterOrEq(activeIndex, 0)),
          [
            call([activeIndex], ([index]) => {
              Haptics.trigger("impactHeavy");
              setColor(cell.color, index);
            }),
            set(activeIndex, -1),
            set(position.x, 0),
            set(position.y, 0),
          ],
          [set(position.x, 0), set(position.y, 0)]
        )
      ),
    ],
    [cell.color]
  );

  useCode(
    () => [
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

  const width = mix(activeSpringTransition, POPUP_SIZE, COLOR_SIZE);
  const height = mix(activeSpringTransition, POPUP_SIZE, COLOR_SIZE);
  const borderRadius = divide(height, 2);
  const borderWidth = mix(activeTransition, 0, COLOR_BORDER_WIDTH);
  const translate = mix(activeTransition, 0, -(COLOR_SIZE - POPUP_SIZE) / 2);

  return (
    <PanGestureHandler {...handler}>
      <Animated.View
        style={{
          ...styles.container,
          opacity: openTransition,
          transform: [{ translateX }, { translateY }],
        }}
      >
        <Label {...{ activeTransition }} />
        <Animated.View
          style={{
            position: "absolute",
            left: 5,
            borderRadius,
            borderWidth,
            width,
            height,
            backgroundColor: cell.color,
            transform: [{ translateX: translate }],
          }}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

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
