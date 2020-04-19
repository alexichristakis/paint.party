import React, { useContext, useState, useCallback, useMemo } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { bin, useValues, useTransition } from "react-native-redash";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";
import { useSelector } from "react-redux";

import { COLOR_SIZE } from "@lib";
import * as selectors from "@redux/selectors";
import { PaletteActions } from "@redux/modules";
import { RootState } from "@redux/types";

import { useReduxAction } from "./use-redux-action";

const { onChange, cond, call, or, eq } = Animated;

type EditorState = {
  visible: boolean;
  paletteId: string;
  index: number;
};

export type ColorEditorState = {
  visible: boolean;
  index: number;
  paletteId: string;
  transition: Animated.Node<number>;
  x: Animated.Value<number>;
  y: Animated.Value<number>;
  scale: Animated.Value<number>;
  color: string;
  close: (newColor?: string) => void;
  edit: (index: number, paletteId: string) => void;
};

export const ColorEditorContext = React.createContext<ColorEditorState>(
  {} as ColorEditorState
);

export const useColorEditorState = (): ColorEditorState => {
  const [x, y, scale] = useValues<number>([0, 0, 1], []);
  const [{ visible, paletteId, index }, setState] = useState<EditorState>({
    visible: false,
    paletteId: "",
    index: -1,
  });

  const color = useSelector((state: RootState) =>
    selectors.color(state, { index, paletteId })
  );
  const set = useReduxAction(PaletteActions.set);

  const transition = useTransition(visible, {
    easing: Easing.inOut(Easing.ease),
  });

  const close = useCallback((newColor?: string) => {
    setState(({ index, paletteId }) => {
      if (newColor) set(newColor, index, paletteId);

      return { index, paletteId, visible: false };
    });
  }, []);

  const edit = useCallback(
    (index: number, paletteId: string) =>
      setState({ visible: true, index, paletteId }),
    []
  );

  return {
    visible,
    paletteId,
    index,
    transition,
    x,
    y,
    scale,
    color,
    edit,
    close,
  };
};

export const useColorEditor = (
  index: number,
  paletteId: string,
  ref: React.RefObject<Animated.View>,
  state: Animated.Value<State>
) => {
  const {
    x,
    y,
    scale,
    edit,
    transition,
    index: activeIndex,
    paletteId: activePaletteId,
  } = useContext(ColorEditorContext);

  useCode(
    () => [
      onChange(state, [
        cond(
          or(eq(state, State.END), eq(state, State.ACTIVE)),
          call([], () => {
            ref.current
              ?.getNode()
              .measure((_, __, width, ___, pageX, pageY) => {
                Haptics.trigger("impactLight");

                // set values
                x.setValue(pageX + (width - COLOR_SIZE) / 2);
                y.setValue(pageY + (width - COLOR_SIZE) / 2);
                scale.setValue(1);

                edit(index, paletteId);
              });
          })
        ),
      ]),
    ],
    []
  );

  const editing = index === activeIndex && paletteId === activePaletteId;
  return {
    editing,
    opacity: cond(bin(editing), cond(eq(transition, 0), 1, 0), 1),
  };
};
