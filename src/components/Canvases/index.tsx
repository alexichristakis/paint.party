import React from "react";
import { View, StyleSheet } from "react-native";

import { CanvasRow } from "./CanvasRow";
import { Canvas } from "@redux/modules/canvas";
import { Colors } from "@lib";

export interface CanvasesProps {
  onPressCanvas: (canvasId: string) => void;
  canvases: Canvas[];
}

export const Canvases: React.FC<CanvasesProps> = ({
  onPressCanvas,
  canvases
}) => {
  return (
    <>
      {canvases.map((canvas, i) => (
        <React.Fragment key={i}>
          {i ? <View style={styles.separator} /> : null}
          <CanvasRow onPress={onPressCanvas} canvas={canvas} />
        </React.Fragment>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    marginLeft: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.nearBlack
  }
});
