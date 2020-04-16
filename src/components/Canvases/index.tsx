import React from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { interpolate } from "react-native-reanimated";
import sortBy from "lodash/sortBy";

import { Canvas } from "@redux/modules/canvas";
import { Colors, TextStyles } from "@lib";

import { CanvasRow } from "./CanvasRow";

export interface CanvasesProps {
  onPressCanvas: (canvasId: string) => void;
  scrollY: Animated.Value<number>;
  canvases: Canvas[];
}

export const Canvases: React.FC<CanvasesProps> = ({
  onPressCanvas,
  scrollY,
  canvases,
}) => {
  if (canvases.length)
    return (
      <>
        {sortBy(canvases, (o) => o.nextDrawAt).map((canvas, i) => (
          <React.Fragment key={i}>
            {i ? <Animated.View style={styles.separator} /> : null}
            <CanvasRow index={i} onPress={onPressCanvas} canvas={canvas} />
          </React.Fragment>
        ))}
      </>
    );

  return <Text style={styles.emptyState}>Welcome to PaintParty</Text>;
};

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    marginLeft: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.mediumGray,
  },
  emptyState: {
    marginTop: 30,
    marginHorizontal: 10,
    ...TextStyles.title,
    fontSize: 50,
  },
});
