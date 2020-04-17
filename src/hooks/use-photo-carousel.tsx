import React, { useContext, useState, useCallback } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { useValues, useTransition } from "react-native-redash";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";

import { COLOR_SIZE, hash, onPress } from "@lib";
import { PaletteActions } from "@redux/modules";
import { useReduxAction } from "./use-redux-action";

const { onChange, cond, set, call, or, eq } = Animated;

export type PhotoCarouselState = {
  index: number;
  visible: boolean;
  transition: Animated.Node<number>;
  x: Animated.Value<number>;
  y: Animated.Value<number>;
  setActiveIndex: (index: number) => void;
  open: () => void;
  close: () => void;
};

export const PhotoCarouselContext = React.createContext<PhotoCarouselState>(
  {} as PhotoCarouselState
);

export const usePhotoCarouselState = (): PhotoCarouselState => {
  const [x, y] = useValues<number>([-0, 0], []);
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);

  const setActiveIndex = useCallback((index: number) => setIndex(index), [
    setIndex,
  ]);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const transition = useTransition(visible, { easing: Easing.ease });

  return {
    index,
    transition,
    setActiveIndex,
    open,
    close,
    visible,
    x,
    y,
  };
};
