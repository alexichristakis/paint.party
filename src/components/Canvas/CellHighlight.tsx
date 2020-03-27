import React from "react";
import Animated, { useCode, onChange } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { useMemoOne } from "use-memo-one";
import { withTimingTransition, delay } from "react-native-redash";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { CELL_SIZE, coordinatesFromIndex } from "@lib";

const { cond, call, not } = Animated;

export interface CellHighlightProps {
  selectCell: (cell: number) => void;
  visible: Animated.Value<0 | 1>;
}

export const CellHighlight: React.FC<CellHighlightProps> = ({
  selectCell,
  visible
}) => {
  const cell = useSelector(selectors.selectedCell);

  const { x, y } = coordinatesFromIndex(cell);

  const opacity = useMemoOne(() => withTimingTransition(visible), []);

  useCode(
    () => [
      onChange(
        visible,
        cond(
          not(visible),
          call([], () => setTimeout(() => selectCell(-1), 250))
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
