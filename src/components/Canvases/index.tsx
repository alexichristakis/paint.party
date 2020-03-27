import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { CanvasRow } from "./CanvasRow";
import { Canvas } from "@redux/modules/canvas";
import { Colors, TextStyles } from "@lib";
import Animated, { interpolate } from "react-native-reanimated";

export interface CanvasesProps {
  onPressCanvas: (canvasId: string) => void;
  scrollY: Animated.Value<number>;
  canvases: Canvas[];
}

export const Canvases: React.FC<CanvasesProps> = ({
  onPressCanvas,
  scrollY,
  canvases
}) => {
  const translateY = (index: number) => ({
    translateY: interpolate(scrollY, {
      inputRange: [-10, 0, 10],
      outputRange: [0 + index * 2, 0, 0]
    })
  });

  if (canvases.length)
    return (
      <>
        {canvases.map((canvas, i) => (
          <Animated.View key={i} style={{ transform: [translateY(i)] }}>
            {i ? <View style={styles.separator} /> : null}
            <CanvasRow onPress={onPressCanvas} canvas={canvas} />
          </Animated.View>
        ))}
      </>
    );

  return <Text style={styles.emptyState}>{"Welcome to PaintParty"}</Text>;
};

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    marginLeft: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.nearBlack
  },
  emptyState: {
    marginTop: 30,
    marginHorizontal: 10,
    ...TextStyles.title,
    fontSize: 50
  }
});
