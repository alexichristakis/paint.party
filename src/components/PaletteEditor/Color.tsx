import React, { useRef, useContext } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useCode,
  interpolate,
  onChange,
  multiply
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import {
  useValues,
  onGestureEvent,
  withSpringTransition,
  bInterpolate
} from "react-native-redash";
import tinycolor from "tinycolor2";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import {
  COLOR_SIZE,
  SCREEN_WIDTH,
  COLOR_BORDER_WIDTH,
  COLOR_MARGIN,
  SPRING_CONFIG
} from "@lib";

import { ColorEditorContext } from "./ColorEditor";

const { cond, call, eq, set, add } = Animated;

export type ColorConnectedProps = ConnectedProps<typeof connector>;

export interface ColorProps {
  index: number;
  paletteId: string;
  numColors: number;
  xOffset: Animated.Node<number>;
  color: string;
}

const mapStateToProps = (state: RootState) => ({
  palettes: selectors.palettes(state)
});
const mapDispatchToProps = {
  set: PaletteActions.set
};

const Color: React.FC<ColorProps & ColorConnectedProps> = ({
  paletteId,
  index,
  numColors,
  xOffset,
  color
}) => {
  const ref = useRef<Animated.View>(null);
  const [state] = useValues([State.UNDETERMINED], []);
  const [opacity] = useValues<0 | 1>([1], []);

  const colorEditorState = useContext(ColorEditorContext);

  const handler = onGestureEvent({ state });

  const activeTransition = withSpringTransition(
    eq(state, State.BEGAN),
    SPRING_CONFIG
  );
  const scale = bInterpolate(activeTransition, 1, 1.5);
  const zIndex = bInterpolate(activeTransition, 0, 100);

  useCode(
    () => [
      onChange(
        state,
        cond(eq(state, State.END), [
          call([], () => {
            ref.current?.getNode().measure((_, __, width, ___, ____, y) => {
              const { layout } = colorEditorState;

              const { h, s, v } = tinycolor(color).toHsv();

              // set values
              colorEditorState.paletteId.setValue(paletteId);
              colorEditorState.index.setValue(index);

              colorEditorState.color.h.setValue(h);
              colorEditorState.color.s.setValue(s);
              colorEditorState.color.v.setValue(v);

              layout.y.setValue(y + (width - COLOR_SIZE) / 2);
            });
          })
        ])
      ),

      cond(eq(colorEditorState.index, index), [
        set(colorEditorState.layout.x, translateX),
        set(colorEditorState.layout.width, multiply(scale, COLOR_SIZE)),
        set(colorEditorState.layout.height, multiply(scale, COLOR_SIZE))
      ])
    ],
    []
  );

  const WIDTH = COLOR_SIZE + COLOR_MARGIN;
  const MIN = -numColors * WIDTH;
  const DIST_FROM_FRONT = index * WIDTH;

  const inputRange =
    DIST_FROM_FRONT < SCREEN_WIDTH
      ? [
          MIN,
          MIN + SCREEN_WIDTH - DIST_FROM_FRONT,
          MIN + SCREEN_WIDTH - DIST_FROM_FRONT,
          0
        ]
      : [MIN, -DIST_FROM_FRONT - WIDTH, -DIST_FROM_FRONT - WIDTH, 0];

  const outputRange =
    DIST_FROM_FRONT < SCREEN_WIDTH
      ? [DIST_FROM_FRONT, SCREEN_WIDTH, -SCREEN_WIDTH, DIST_FROM_FRONT]
      : [
          DIST_FROM_FRONT,
          SCREEN_WIDTH + DIST_FROM_FRONT,
          -WIDTH,
          DIST_FROM_FRONT
        ];

  const translateX = add(
    interpolate(xOffset, {
      inputRange,
      outputRange
    }),
    COLOR_MARGIN
  );

  return (
    <Animated.View
      style={{
        ...styles.container,
        zIndex,
        opacity,
        transform: [{ translateX }]
      }}
    >
      <TapGestureHandler maxDist={50} {...handler}>
        <Animated.View
          ref={ref}
          style={{
            ...styles.color,
            backgroundColor: color,
            transform: [{ scale }]
          }}
        />
      </TapGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0
  },
  color: {
    borderWidth: COLOR_BORDER_WIDTH,
    width: COLOR_SIZE,
    height: COLOR_SIZE,
    borderRadius: COLOR_SIZE / 2
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Color);
