import React from "react";
import { View, StyleSheet } from "react-native";

import { Canvas } from "@redux/modules";
import { CanvasPreview } from "@components/universal";
import { SCREEN_WIDTH } from "@lib";

export interface RowProps {
  canvases: Canvas[];
}

const Row: React.FC<RowProps> = ({ canvases }) => {
  const size = (SCREEN_WIDTH - 10) / 3 - 2.5;
  return (
    <View style={styles.container}>
      {canvases.map((canvas, i) => (
        <CanvasPreview key={i} {...canvas} {...{ size }} />
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
});

export default Row;
