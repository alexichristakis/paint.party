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
import { createContext } from "use-context-selector";

import * as selectors from "@redux/selectors";
import { VisualizationActions } from "@redux/modules";
import { CANVAS_DIMENSIONS } from "@lib";

import { useReduxAction } from "./use-redux-action";

export type DrawingState = {
  captureRef: React.RefObject<View>;
  color: string;
  cell: number;
  selectCell: (index: number) => void;
  selectColor: (color: string) => void;
  draw: () => void;
};

export const DrawContext = createContext({} as DrawingState);

export interface DrawingProviderProps {
  captureRef: React.RefObject<View>;
}

export const drawingContextSelectors = {
  selectColor: (state: DrawingState) => state.selectColor,
  selectCell: (state: DrawingState) => state.selectCell,
  draw: (state: DrawingState) => state.draw,
  color: (state: DrawingState) => state.color,
  cell: (state: DrawingState) => state.cell,
  captureRef: (state: DrawingState) => state.captureRef,
};

export const DrawingProvider: React.FC = React.memo(
  ({ children }) => {
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
    }, []);

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

    const state: DrawingState = useMemo(
      () => ({
        captureRef,
        color,
        cell,
        selectColor,
        selectCell,
        draw,
      }),
      [captureRef, color, cell, selectColor, selectCell, draw]
    );

    return (
      <DrawContext.Provider value={state}>{children}</DrawContext.Provider>
    );
  },
  () => true
);
