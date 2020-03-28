import React from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { StyleSheet, PixelRatio } from "react-native";
import { useMemoOne } from "use-memo-one";
import {
  withTimingTransition,
  spring,
  loop,
  useValues,
  useClocks,
  bInterpolate
} from "react-native-redash";
import { useSelector } from "react-redux";

import * as selectors from "@redux/selectors";
import { CELL_SIZE, coordinatesFromIndex } from "@lib";

const { set } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface CellHighlightProps {
  visible: Animated.Value<0 | 1>;
}

const BORDER_WIDTH = 3;

export const CellHighlight: React.FC<CellHighlightProps> = ({ visible }) => {
  const [clock] = useClocks(1, []);
  const [top, left] = useValues<number>([0, 0], []);

  const cell = useSelector(selectors.selectedCell);
  const { x, y } = coordinatesFromIndex(cell);

  useCode(
    () => [
      set(top, spring({ to: y - BORDER_WIDTH, from: top, config })),
      set(left, spring({ to: x - BORDER_WIDTH, from: left, config }))
    ],
    [x, y]
  );

  const loopValue = useMemoOne(
    () =>
      loop({
        clock,
        duration: 550,
        easing: Easing.inOut(Easing.ease),
        boomerang: true,
        autoStart: true
      }),
    []
  );

  const opacity = useMemoOne(() => withTimingTransition(visible), []);

  const scale = bInterpolate(loopValue, 0.9, 1.1);
  if (cell > -1)
    return (
      <Animated.View
        style={[
          styles.cell,
          {
            opacity,
            top,
            left,
            transform: [{ scale }]
          }
        ]}
      />
    );

  return null;
};

const styles = StyleSheet.create({
  cell: {
    borderRadius: PixelRatio.roundToNearestPixel(3),
    position: "absolute",
    width: CELL_SIZE + 2 * BORDER_WIDTH,
    height: CELL_SIZE + 2 * BORDER_WIDTH,
    borderWidth: BORDER_WIDTH
  }
});
