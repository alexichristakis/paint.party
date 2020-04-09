import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, { useCode, onChange } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import { useValues, onGestureEvent, bin } from "react-native-redash";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";
import { hash, COLOR_SIZE, COLOR_BORDER_WIDTH, COLOR_MARGIN } from "@lib";

import { ColorEditorState } from "../ColorEditor";

const { cond, call, sub, not, eq, set, add } = Animated;

export type ColorConnectedProps = ConnectedProps<typeof connector>;

export interface ColorProps {
  colorEditorState: ColorEditorState;
  index: number;
  paletteId: string;
  xOffset: Animated.Node<number>;
}

const mapStateToProps = (state: RootState, props: ColorProps) => ({
  isEditing: selectors.isEditing(state, props),
  color: selectors.color(state, props),
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
    isEditing,
    edit,
    xOffset,
    color: backgroundColor,
  }) => {
    const ref = useRef<Animated.View>(null);
    const [state] = useValues([State.UNDETERMINED], []);

    const handler = onGestureEvent({ state });
    const colorId = hash(paletteId, index);

    const WIDTH = COLOR_SIZE + 2 * COLOR_MARGIN;
    const DIST_FROM_FRONT = index * WIDTH + 2 * COLOR_MARGIN;

    useCode(
      () => [
        cond(eq(colorEditorState.id, colorId), [
          set(colorEditorState.layout.x, sub(DIST_FROM_FRONT, xOffset)),
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
            call([], () => {
              ref.current
                ?.getNode()
                .measure((_, __, width, height, ____, y) => {
                  const { id, layout } = colorEditorState;

                  // set values
                  id.setValue(colorId);

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

    return (
      <TapGestureHandler maxDist={50} {...handler}>
        <Animated.View
          ref={ref}
          style={{
            ...styles.color,
            backgroundColor,
            opacity: not(bin(isEditing)),
          }}
        />
      </TapGestureHandler>
    );
  },
  (p, n) => p.isEditing === n.isEditing && p.color === n.color
);

const styles = StyleSheet.create({
  color: {
    marginHorizontal: COLOR_MARGIN,
    borderWidth: COLOR_BORDER_WIDTH,
    width: COLOR_SIZE,
    height: COLOR_SIZE,
    borderRadius: COLOR_SIZE / 2,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Color);
