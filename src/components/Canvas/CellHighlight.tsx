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
  useTransition,
  bInterpolateColor,
} from "react-native-redash";
import { connect, ConnectedProps } from "react-redux";
import isNull from "lodash/isNull";

import * as selectors from "@redux/selectors";
import { CELL_SIZE, coordinatesFromIndex, Colors } from "@lib";
import { RootState } from "@redux/types";

const { set } = Animated;

const config = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export type CellHighlightConnectedProps = ConnectedProps<typeof connector>;

export interface CellHighlightProps {
  borderColor?: string;
  cell: number;
  visible: Animated.Value<0 | 1>;
}

const BORDER_WIDTH = 3;

export const CellHighlight: React.FC<
  CellHighlightProps & CellHighlightConnectedProps
> = React.memo(
  ({ borderColor = Colors.nearBlack, color, cell, visible }) => {
    const [top, left] = useValues<number>([0, 0], []);
    const [clock] = useClocks(1, []);

    const { x, y } = coordinatesFromIndex(cell);
    useCode(
      () => [
        set(
          top,
          spring({ to: y - BORDER_WIDTH, from: top, config }) as Animated.Node<
            number
          >
        ),
        set(
          left,
          spring({ to: x - BORDER_WIDTH, from: left, config }) as Animated.Node<
            number
          >
        ),
      ],
      [cell]
    );

    const [loopValue, opacity] = useMemoOne(
      () => [
        loop({
          clock,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          boomerang: true,
          autoStart: true,
        }),
        withTimingTransition(visible),
      ],
      []
    );

    const colorTransition = useTransition(!isNull(color));
    const backgroundColor = bInterpolateColor(
      colorTransition,
      "transparent",
      color as string
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
              backgroundColor,
              transform: [{ scale }],
            },
          ]}
        />
      );

    return null;
  },
  (p, n) => p.cell === n.cell && p.color === n.color
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

// default export inject user's selected cell
const mapStateToProps = (state: RootState) => ({
  cell: selectors.selectedCell(state),
  color: selectors.selectedColor(state),
});

const connector = connect(mapStateToProps, {});
export default connector(CellHighlight);
