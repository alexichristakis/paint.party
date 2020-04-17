import React, { useContext, useState, useCallback } from "react";
import Animated, { useCode, Easing } from "react-native-reanimated";
import { useValues, useTransition } from "react-native-redash";
import { State } from "react-native-gesture-handler";
import Haptics from "react-native-haptic-feedback";

import { COLOR_SIZE, hash, onPress } from "@lib";
import { PaletteActions, Canvas } from "@redux/modules";
import { useReduxAction } from "./use-redux-action";

const { onChange, cond, set, call, or, eq } = Animated;

export type PhotoCarouselState = {
  canvas: Canvas;
  visible: boolean;
  transition: Animated.Node<number>;
  x: Animated.Value<number>;
  y: Animated.Value<number>;
  setActiveCanvas: (canvas: Canvas) => void;
  open: () => void;
  close: () => void;
};

export const PhotoCarouselContext = React.createContext<PhotoCarouselState>(
  {} as PhotoCarouselState
);

export const usePhotoCarouselState = (): PhotoCarouselState => {
  const [x, y] = useValues<number>([-0, 0], []);
  const [canvas, setCanvas] = useState<Canvas>({} as Canvas);
  const [visible, setVisible] = useState(false);

  const setActiveCanvas = useCallback((canvas: Canvas) => setCanvas(canvas), [
    setCanvas,
  ]);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const transition = useTransition(visible, { easing: Easing.ease });

  return {
    canvas,
    setActiveCanvas,
    transition,
    open,
    close,
    visible,
    x,
    y,
  };
};
