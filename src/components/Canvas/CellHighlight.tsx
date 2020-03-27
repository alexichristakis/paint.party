import React from "react";
import Animated, { useCode, onChange } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useMemoOne } from "use-memo-one";
import {
  withTimingTransition,
  spring,
  delay,
  useSpringTransition,
  useValues
} from "react-native-redash";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { CELL_SIZE, coordinatesFromIndex } from "@lib";

const { cond, set, call, not } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface CellHighlightProps {
  visible: Animated.Value<0 | 1>;
}

export const CellHighlight: React.FC<CellHighlightProps> = ({ visible }) => {
  const [top, left] = useValues<number>([0, 0], []);

  const cell = useSelector(selectors.selectedCell);

  const { x, y } = coordinatesFromIndex(cell);

  useCode(
    () => [
      set(top, spring({ to: y, from: top, config })),
      set(left, spring({ to: x, from: left, config }))
    ],
    [x, y]
  );

  const opacity = useMemoOne(() => withTimingTransition(visible), []);

  if (cell > -1)
    return <Animated.View style={[styles.cell, { opacity, top, left }]} />;

  return null;
};

const styles = StyleSheet.create({
  cell: {
    position: "absolute",
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 5
  }
});
