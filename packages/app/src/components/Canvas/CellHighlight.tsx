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
  mix,
  useClock,
} from "react-native-redash";
import { connect } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { CELL_SIZE, coordinatesFromIndex, Colors } from "@lib";

const { set } = Animated;

const config = {
  damping: 40,
  mass: 1.1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface CellHighlightProps {
  borderColor?: string;
  cell: number;
  visible: Animated.Value<0 | 1>;
}

const BORDER_WIDTH = 3;

export const CellHighlight: React.FC<CellHighlightProps> = React.memo(
  ({ borderColor = Colors.nearBlack, visible, cell }) => {
    const [top, left] = useValues<number>([0, 0]);
    const loopClock = useClock();

    const { x, y } = coordinatesFromIndex(cell);
    useCode(
      () => [
        set(
          top,
          spring({
            to: y - BORDER_WIDTH,
            from: top,
            config,
          })
        ),
        set(
          left,
          spring({
            to: x - BORDER_WIDTH,
            from: left,
            config,
          })
        ),
      ],
      [cell]
    );

    const [loopValue, opacity] = useMemoOne(
      () => [
        loop({
          clock: loopClock,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          boomerang: true,
          autoStart: true,
        }),
        withTimingTransition(visible),
      ],
      []
    );

    const scale = mix(loopValue, 0.9, 1.1);
    if (cell > -1)
      return (
        <Animated.View
          style={[
            styles.cell,
            {
              borderColor,
              opacity,
              top,
              left,
              transform: [{ scale }],
            },
          ]}
        />
      );

    return null;
  },
  (p, n) => p.cell === n.cell
);

const styles = StyleSheet.create({
  cell: {
    borderRadius: PixelRatio.roundToNearestPixel(3),
    position: "absolute",
    width: CELL_SIZE + 2 * BORDER_WIDTH,
    height: CELL_SIZE + 2 * BORDER_WIDTH,
    borderWidth: BORDER_WIDTH,
  },
});

const connector = connect(
  (state: RootState) => ({ cell: selectors.selectedCell(state) }),
  {}
);

export default connector(CellHighlight);
