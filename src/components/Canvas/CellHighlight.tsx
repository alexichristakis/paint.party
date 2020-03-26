import React from "react";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useMemoOne } from "use-memo-one";
import { withTimingTransition } from "react-native-redash";

import { CELL_SIZE, coordinatesFromIndex } from "@lib";

export interface CellHighlightProps {
  visible: Animated.Value<0 | 1>;
  cell: number;
}

export const CellHighlight: React.FC<CellHighlightProps> = ({
  visible,
  cell
}) => {
  const { x, y } = coordinatesFromIndex(cell);

  const opacity = useMemoOne(() => withTimingTransition(visible), []);

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
