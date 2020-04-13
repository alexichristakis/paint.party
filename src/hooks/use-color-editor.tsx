import React from "react";
import Animated, { useCode } from "react-native-reanimated";
import { useValues } from "react-native-redash";
import { State } from "react-native-gesture-handler";

import { COLOR_SIZE, hash } from "@lib";
import { useReduxAction } from "./use-redux-action";
import { PaletteActions } from "@redux/modules";
import { useContext } from "react";

const { onChange, cond, call, or, eq } = Animated;

export type ColorEditorState = {
  id: Animated.Value<number>;
  layout: {
    x: Animated.Value<number>;
    y: Animated.Value<number>;
    scale: Animated.Value<number>;
  };
};

export const ColorEditorContext = React.createContext<ColorEditorState>(
  {} as ColorEditorState
);

export const useColorEditorState = (): ColorEditorState => {
  const [id, x, y, scale] = useValues<number>([-1, 0, 0, 1], []);

  return {
    id,
    layout: { x, y, scale },
  };
};

export const useColorEditor = (
  index: number,
  paletteId: string,
  ref: React.RefObject<Animated.View>,
  state: Animated.Value<State>
) => {
  const { id, layout } = useContext(ColorEditorContext);
  const edit = useReduxAction(PaletteActions.edit);

  const colorId = hash(paletteId, index);
  return useCode(
    () => [
      onChange(
        id,
        cond(eq(colorId, id), [
          //
          call([], () => edit(index, paletteId)),
        ])
      ),

      onChange(state, [
        cond(
          or(eq(state, State.END), eq(state, State.ACTIVE)),
          call([], () => {
            ref.current?.getNode().measure((_, __, width, height, x, y) => {
              // set values
              layout.x.setValue(x + (width - COLOR_SIZE) / 2);
              layout.y.setValue(y + (width - COLOR_SIZE) / 2);
              layout.scale.setValue(1);

              id.setValue(colorId);
            });
          })
        ),
      ]),
    ],
    []
  );
};
