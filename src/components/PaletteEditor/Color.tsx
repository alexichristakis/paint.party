import React, { useRef, useContext } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useCode,
  interpolate,
  onChange,
} from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { useValues, onGestureEvent, bin } from "react-native-redash";
import tinycolor from "tinycolor2";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import {
  hash,
  COLOR_SIZE,
  SCREEN_WIDTH,
  COLOR_BORDER_WIDTH,
  COLOR_MARGIN,
  SPRING_CONFIG,
} from "@lib";

import { ColorEditorContext, ColorEditorState } from "./ColorEditor";

const { cond, call, sub, not, eq, set, add } = Animated;

export type ColorConnectedProps = ConnectedProps<typeof connector>;

export interface ColorProps {
  colorEditorState: ColorEditorState;
  index: number;
  paletteId: string;
  numColors: number;
  xOffset: Animated.Node<number>;
  color: string;
}

const mapStateToProps = (state: RootState, props: ColorProps) => ({
  isEditing: selectors.isEditing(state, props),
});

const mapDispatchToProps = {
  edit: PaletteActions.edit,
  set: PaletteActions.set,
};

const Color: React.FC<ColorProps & ColorConnectedProps> = React.memo(
  ({
    colorEditorState,
    paletteId,
    index,
    numColors,
    isEditing,
    edit,
    xOffset,
    color: backgroundColor,
  }) => {
    // const colorEditorState = useContext(ColorEditorContext);
    // console.log("render color", backgroundColor);

    const ref = useRef<Animated.View>(null);
    const [state] = useValues([State.UNDETERMINED], []);

    const hsv = tinycolor(backgroundColor).toHsv();
    const [h, s, v] = useValues<number>([hsv.h, hsv.s, hsv.v], []);

    useCode(() => [set(h, hsv.h), set(s, hsv.s), set(v, hsv.v)], [
      backgroundColor,
    ]);

    const handler = onGestureEvent({ state });
    const colorId = hash(paletteId, index);
    useCode(
      () => [
        cond(eq(colorEditorState.id, colorId), [
          set(colorEditorState.layout.x, translateX),
          cond(
            not(bin(isEditing)),
            call([], () => edit(index, paletteId))
          ),
        ]),
      ],
      [isEditing]
    );

    useCode(
      () => [
        onChange(
          state,
          cond(eq(state, State.END), [
            call([h, s, v], ([h, s, v]) => {
              ref.current
                ?.getNode()
                .measure((_, __, width, height, ____, y) => {
                  const { id, layout, color } = colorEditorState;

                  // set values
                  id.setValue(colorId);

                  color.h.setValue(h);
                  color.s.setValue(s);
                  color.v.setValue(v);

                  layout.y.setValue(y + (width - COLOR_SIZE) / 2);
                  layout.height.setValue(height);
                  layout.width.setValue(width);
                });
            }),
          ])
        ),
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
            0,
          ]
        : [MIN, -DIST_FROM_FRONT - WIDTH, -DIST_FROM_FRONT - WIDTH, 0];

    const outputRange =
      DIST_FROM_FRONT < SCREEN_WIDTH
        ? [DIST_FROM_FRONT, SCREEN_WIDTH, -SCREEN_WIDTH, DIST_FROM_FRONT]
        : [
            DIST_FROM_FRONT,
            SCREEN_WIDTH + DIST_FROM_FRONT,
            -WIDTH,
            DIST_FROM_FRONT,
          ];

    const translateX = add(
      interpolate(xOffset, {
        inputRange,
        outputRange,
      }),
      COLOR_MARGIN
    );

    return (
      <Animated.View
        style={{
          ...styles.container,
          opacity: not(bin(isEditing)),
          transform: [{ translateX }],
        }}
      >
        <TapGestureHandler maxDist={50} {...handler}>
          <Animated.View
            ref={ref}
            style={{
              ...styles.color,
              backgroundColor,
            }}
          />
        </TapGestureHandler>
      </Animated.View>
    );
  },
  (p, n) => p.isEditing === n.isEditing && p.color === n.color
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
  },
  color: {
    borderWidth: COLOR_BORDER_WIDTH,
    width: COLOR_SIZE,
    height: COLOR_SIZE,
    borderRadius: COLOR_SIZE / 2,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Color);
