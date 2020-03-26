import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State
} from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import {
  contains,
  onGestureEvent,
  timing,
  useClocks,
  useValues
} from "react-native-redash";
import times from "lodash/times";

import { CANVAS_DIMENSIONS } from "@lib";

import { Cell } from "./Cell";

export interface RowProps {
  index: number;
}

export const Row: React.FC<RowProps> = React.memo(({ index }) => {
  return (
    <View style={styles.container}>
      {times(CANVAS_DIMENSIONS, i => (
        <Cell key={i} index={index * CANVAS_DIMENSIONS + i} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  }
});
