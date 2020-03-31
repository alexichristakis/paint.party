import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  onGestureEvent,
  withSpringTransition,
  bInterpolate,
  useValues,
  withSpring,
  withTransition,
  canvas2Polar,
  toDeg,
  spring
} from "react-native-redash";
import { StyleSheet, Text } from "react-native";
import { ConnectedProps, connect } from "react-redux";
import Haptics from "react-native-haptic-feedback";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import {
  COLOR_BORDER_WIDTH,
  COLOR_SIZE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  COLOR_WHEEL_RADIUS
} from "@lib";
import { useMemoOne } from "use-memo-one";
import { useOnLayout } from "@hooks";
import { PaletteActions } from "@redux/modules";

const {
  onChange,
  greaterOrEq,
  add,
  round,
  modulo,
  set,
  or,
  eq,
  divide,
  sub,
  debug,
  cond,
  and,
  lessThan,
  lessOrEq,
  greaterThan,
  call
} = Animated;
const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
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

const mapStateToProps = (state: RootState) => ({
  cell: selectors.selectedCellLatestUpdate(state),
  angleIncrement: selectors.angleIncrement(state),
  numColors: selectors.numColors(state)
});

const mapDispatchToProps = {
  setColor: PaletteActions.set
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
  state
}) => {
  const { onLayout, width: measuredWidth } = useOnLayout();

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
    state
  });

  const activeTransition = withSpringTransition(eq(state, State.ACTIVE));

  const [translateX, translateY] = useMemoOne(
    () => [
      withSpring({
        value: dragX,
        velocity: velocityX,
        state,
        snapPoints: [0],
        config
      }),
      withSpring({
        value: dragY,
        velocity: velocityY,
        state,
        snapPoints: [0],
        config
      })
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
            set(position.y, 0)
          ],
          [set(position.x, 0), set(position.y, 0)]
        )
      )
    ],
    [cell.color]
  );

  useCode(
    () => [
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
          call([], () => Haptics.trigger("impactLight"))
        ],
        [set(activeIndex, -1)]
      )
    ],
    [angleIncrement, numColors]
  );

  const scale = bInterpolate(activeTransition, 1, 1.3);
  const width = bInterpolate(activeTransition, measuredWidth, 0);
  return (
    <PanGestureHandler {...handler}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: openTransition,
            transform: [{ scale }, { translateX }, { translateY }]
          }
        ]}
      >
        <Animated.View
          style={[
            styles.color,
            {
              backgroundColor: cell.color
            }
          ]}
        />
        {/* <Animated.View
          style={{
            transform: [
              { translateX: bInterpolate(activeTransition, 0, -100) }
            ],
            justifyContent: "center"
            // position: "absolute",
            // left: COLOR_SIZE / 1.5,
          }}
        >
          <Text style={styles.colorText}>{cell?.color}</Text>
        </Animated.View> */}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    // top: 20,
    left: 5
  },
  colorText: {
    textTransform: "uppercase"
  },
  color: {
    borderWidth: COLOR_BORDER_WIDTH,
    borderRadius: COLOR_SIZE / 3,
    height: COLOR_SIZE / 1.5,
    width: COLOR_SIZE / 1.5
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Popup);
