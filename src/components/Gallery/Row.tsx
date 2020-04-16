import React from "react";

import { SCREEN_WIDTH } from "@lib";
import { Canvas } from "@redux/modules";
import { View, StyleSheet } from "react-native";
import { CanvasPreview } from "@components/universal";

export interface RowProps {
  canvases: Canvas[];
}

const Row: React.FC<RowProps> = ({ canvases }) => {
  const size = (SCREEN_WIDTH - 10) / canvases.length - 2.5;
  return (
    <View style={styles.container}>
      {canvases.map((canvas, i) => (
        <CanvasPreview
          key={canvas.id}
          canvasId={canvas.id}
          backgroundColor={canvas.backgroundColor}
          size={size}
        />
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
