import React from "react";
import { View, StyleSheet } from "react-native";
import times from "lodash/times";

import { CANVAS_DIMENSIONS } from "@lib";

import { Cell } from "./Cell";

export interface RowProps {
  index: number;
}

export const Row: React.FC<RowProps> = React.memo(({ index }) => (
  <View style={styles.container}>
    {times(CANVAS_DIMENSIONS, i => (
      <Cell key={i} index={index * CANVAS_DIMENSIONS + i} />
    ))}
  </View>
));

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  }
});
