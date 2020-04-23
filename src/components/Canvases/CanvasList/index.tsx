import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import sortBy from "lodash/sortBy";

import { Canvas } from "@redux/modules/canvas";
import { Colors } from "@lib";

import CanvasRow from "./CanvasRow";

export interface CanvasListProps {
  onPressCanvas: (canvasId: string) => void;
  canvases: Canvas[];
}

const CanvasList: React.FC<CanvasListProps> = ({ onPressCanvas, canvases }) => {
  console.log("render canvaslist");
  return (
    <>
      {sortBy(canvases, (o) => o.nextDrawAt).map((canvas, i) => (
        <React.Fragment key={canvas.id}>
          {i ? <Animated.View style={styles.separator} /> : null}
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
    backgroundColor: Colors.mediumGray,
  },
});

export default CanvasList;
