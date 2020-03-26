import React from "react";
import Animated, { useCode, debug, onChange } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useMemoOne } from "use-memo-one";
import { withTimingTransition, delay } from "react-native-redash";

import { CELL_SIZE, coordinatesFromIndex } from "@lib";

const { cond, call, not } = Animated;

export interface CellHighlightProps {
  reset: () => void;
  visible: Animated.Value<0 | 1>;
  cell: number;
}

export const CellHighlight: React.FC<CellHighlightProps> = ({
  reset,
  visible,
  cell
}) => {
  const { x, y } = coordinatesFromIndex(cell);

  const opacity = useMemoOne(() => withTimingTransition(visible), []);

  useCode(
    () => [
      onChange(
        visible,
        cond(
          not(visible),
          call([], () => setTimeout(reset, 250))
        )
      )
    ],
    []
  );

  if (cell > -1)
    return (
      <Animated.View style={[styles.cell, { opacity, top: y, left: x }]} />
    );

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
