import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import {
  onGestureEvent,
  withSpringTransition,
  bInterpolate,
  useValues,
  spring
} from "react-native-redash";
import { StyleSheet } from "react-native";
import { ConnectedProps, connect } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { COLOR_BORDER_WIDTH, COLOR_SIZE, coordinatesFromIndex } from "@lib";

const { cond, eq, set } = Animated;

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
  position: {
    x: Animated.Value<number>;
    y: Animated.Value<number>;
  };
}

const mapStateToProps = (state: RootState) => ({
  cell: selectors.selectedCell(state)
});

const Popup: React.FC<PopupProps & PopupConnectedProps> = ({
  position,
  cell,
  state
}) => {
  const handler = onGestureEvent({
    absoluteX: position.x,
    absoluteY: position.y,
    state
  });

  const [top, left] = useValues<number>([0, 0], []);

  const { x, y } = coordinatesFromIndex(cell);
  useCode(
    () => [
      set(top, spring({ to: y, from: top, config })),
      set(left, spring({ to: x, from: left, config }))
    ],
    [cell]
  );

  //   const visibleTransition = withSpringTransition();
  const activeTransition = withSpringTransition(eq(state, State.ACTIVE));

  const scale = bInterpolate(activeTransition, 1, 1.5);

  return (
    <PanGestureHandler {...handler}>
      <Animated.View
        style={[styles.color, { top, left, transform: [{ scale }] }]}
      />
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  color: {
    position: "absolute",
    borderWidth: COLOR_BORDER_WIDTH,
    height: COLOR_SIZE,
    width: COLOR_SIZE
  }
});

const connector = connect(mapStateToProps, {});
export default connector(Popup);
