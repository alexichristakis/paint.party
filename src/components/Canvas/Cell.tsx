import React from "react";
import { View, StyleSheet, PixelRatio } from "react-native";
import { useSelector } from "react-redux";

import { CELL_SIZE, Colors } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

export interface CellProps {
  index: number;
}

export const Cell: React.FC<CellProps> = React.memo(({ index }) => {
  const backgroundColor = useSelector((state: RootState) =>
    selectors.cellColor(state, index)
  );

  return <View style={{ ...styles.cell, backgroundColor }}></View>;
});

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE
  }
});
