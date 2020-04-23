import React from "react";
import { View, StyleSheet } from "react-native";
import times from "lodash/times";

import { Canvas } from "@redux/modules";
import { CANVAS_PREVIEW_SIZE } from "@lib";

import Item from "./Item";

export interface RowProps {
  canvases: Canvas[];
}

const Row: React.FC<RowProps> = ({ canvases }) => {
  //
  return (
    <View style={styles.container}>
      {canvases.map((canvas) => (
        <Item key={canvas.id} canvas={canvas} />
      ))}
      {times(3 - canvases.length, (j) => (
        <View key={j} style={styles.filler} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 5,
    marginTop: 5,
  },
  filler: {
    width: CANVAS_PREVIEW_SIZE,
  },
});

export default Row;
