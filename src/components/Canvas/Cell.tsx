import React from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import { CELL_SIZE } from "@lib";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

export interface CellProps {
  index: number;
}

export const Cell: React.FC<CellProps> = React.memo(({ index }) => {
  const color = useSelector((state: RootState) =>
    selectors.cellColor(state, index)
  );

  return (
    <View
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: color,
        borderWidth: StyleSheet.hairlineWidth
      }}
    ></View>
  );
});
