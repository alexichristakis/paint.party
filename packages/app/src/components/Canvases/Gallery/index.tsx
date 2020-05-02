import React, { useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";

import { Canvas } from "@global";

import Row from "./Row";

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

export interface GalleryProps {
  canvases: Canvas[];
}

const Gallery: React.FC<GalleryProps> = ({ canvases }) => {
  const ref = useRef<View>(null);

  return useMemo(() => {
    const rows = generateRows(canvases);

    return (
      <View style={styles.container} ref={ref}>
        {rows.map(({ canvases }, index) => (
          <Row key={index} {...{ canvases }} />
        ))}
      </View>
    );
  }, [canvases.length, ref]);
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
});

export default Gallery;
export { default as Carousel } from "./Carousel";
