import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import database from "@react-native-firebase/database";

import * as selectors from "@redux/selectors";
import { VisualizationActions } from "@redux/modules";

import { useReduxAction } from "./use-redux-action";
import { CANVAS_DIMENSIONS } from "@lib";

export type DrawingState = {
  captureRef: React.RefObject<View>;
  color: string;
  cell: number;
  selectCell: (index: number) => void;
  selectColor: (color: string) => void;
  draw: () => void;
};

export const DrawContext = React.createContext({} as DrawingState);

export interface DrawingProviderProps {
  captureRef: React.RefObject<View>;
}

export const DrawingProvider: React.FC = ({ children }) => {
  const captureRef = useRef<View>(null);
  const [{ color, cell }, onSelect] = useState({ color: "", cell: -1 });

  const uid = useSelector(selectors.uid);
  const canvas = useSelector(selectors.activeCanvas);

  const onDraw = useReduxAction(VisualizationActions.draw);
  const subscribe = useReduxAction(VisualizationActions.subscribe);

  /* side effects */
  useEffect(() => {
    reset();
    subscribe();
    return () => {
      database().ref(canvas).child(`live/${uid}`).remove();
    };
  }, [canvas]);

  useEffect(() => {
    if (cell > -1) database().ref(canvas).child(`live/${uid}`).set(cell);
  }, [cell]);

  const reset = useCallback(() => onSelect({ color: "", cell: -1 }), []);

  const draw = useCallback(() => {
    onSelect(({ color, cell }) => {
      onDraw(cell, color, captureRef);
      return { cell: -1, color: "" };
    });
  }, [captureRef]);

  const selectCell = useCallback(
    (cell: number) =>
      onSelect({
        cell: Math.max(0, Math.min(cell, Math.pow(CANVAS_DIMENSIONS, 2) - 1)),
        color: "",
      }),
    []
  );
  const selectColor = useCallback(
    (color: string) => onSelect(({ cell }) => ({ color, cell })),
    []
  );

  const state = useMemo(
    () => ({
      captureRef,
      color,
      cell,
      selectColor,
      selectCell,
      draw,
    }),
    [color, cell, selectColor, selectCell, captureRef, draw]
  );

  return <DrawContext.Provider value={state}>{children}</DrawContext.Provider>;
};
