import React from "react";
import Animated from "react-native-reanimated";
import { StyleSheet } from "react-native";

import { CELL_SIZE, coordinatesFromIndex } from "@lib";

export interface CellHighlightProps {
  cell: number;
}

export const CellHighlight: React.FC<CellHighlightProps> = ({ cell }) => {
  const { x, y } = coordinatesFromIndex(cell);

  if (cell > -1)
    return <Animated.View style={[styles.cell, { top: y, left: x }]} />;

  return null;
};

const styles = StyleSheet.create({
  cell: {
    position: "absolute",
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 2
  }
});
