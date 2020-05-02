import React, { useState, useCallback } from "react";
import Animated, { Easing } from "react-native-reanimated";
import { useValues, useTransition } from "react-native-redash";

import { Canvas } from "@global";

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

export const PhotoCarouselContext = React.createContext(
  {} as PhotoCarouselState
);

export const usePhotoCarouselState = (): PhotoCarouselState => {
  const [x, y] = useValues<number>([0, 0]);
  const [canvas, setCanvas] = useState<Canvas>({} as Canvas);
  const [visible, setVisible] = useState(false);

  const setActiveCanvas = useCallback((canvas: Canvas) => setCanvas(canvas), [
    setCanvas,
  ]);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const transition = useTransition(visible, {
    easing: Easing.inOut(Easing.ease),
  });

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

export const PhotoCarouselProvider: React.FC = ({ children }) => {
  const state = usePhotoCarouselState();

  return (
    <PhotoCarouselContext.Provider value={state}>
      {children}
    </PhotoCarouselContext.Provider>
  );
};
