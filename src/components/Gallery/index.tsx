import React, { useContext, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useCode } from "react-native-reanimated";
import Haptics from "react-native-haptic-feedback";

import { Canvas } from "@redux/modules";
import { CANVAS_PREVIEW_SIZE, CANVAS_PREVIEW_MARGIN } from "@lib";
import { PhotoCarouselContext } from "@hooks";
import Item from "./Item";

const { event, call } = Animated;

// utils
const generateRows = (canvases: Canvas[]) => {
  const rows: { canvases: Canvas[] }[] = [];
  for (let i = 0; i < canvases.length; ) {
    const remaining = canvases.length - i;

    if (remaining >= 3) {
      rows.push({ canvases: canvases.slice(i, i + 3) });
      i += 3;
    } else {
      rows.push({ canvases: canvases.slice(i) });
      i += remaining;
    }
  }

  return rows;
};

const getXOffset = (index: number) =>
  (index % 3) * (CANVAS_PREVIEW_SIZE + CANVAS_PREVIEW_MARGIN) +
  CANVAS_PREVIEW_MARGIN;

const getYOffset = (index: number) =>
  Math.floor(index / 3) * CANVAS_PREVIEW_SIZE +
  (Math.floor(index / 3) + 1) * CANVAS_PREVIEW_MARGIN;

export interface GalleryProps {
  yOffset: Animated.Value<number>;
  canvases: Canvas[];
}

const Gallery: React.FC<GalleryProps> = ({ canvases }) => {
  const ref = useRef<View>(null);

  const {
    x,
    y,
    setActiveCanvas,
    transition,
    canvas: activeCanvas,
    open,
  } = useContext(PhotoCarouselContext);

  return useMemo(() => {
    const rows = generateRows(canvases);

    const handleOnPressCanvas = (canvas: Canvas, index: number) =>
      ref.current?.measure((_, __, width, height, pageX, pageY) => {
        x.setValue(getXOffset(index));
        y.setValue(pageY + getYOffset(index));

        Haptics.trigger("impactLight");
        setActiveCanvas(canvas);
        open();
      });

    return (
      <View ref={ref}>
        {rows.map((row, i) => (
          <View key={i} style={styles.container}>
            {row.canvases.map((canvas, j) => {
              const index = i * 3 + j;

              const handleOnPress = () => handleOnPressCanvas(canvas, index);
              return (
                <Item
                  key={canvas.id}
                  transition={transition}
                  focused={canvas.id === activeCanvas.id}
                  canvas={canvas}
                  onPress={handleOnPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [canvases.length, ref, activeCanvas.id]);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: CANVAS_PREVIEW_MARGIN,
    marginTop: CANVAS_PREVIEW_MARGIN,
  },
});

export default Gallery;
export { default as Carousel } from "./Carousel";
