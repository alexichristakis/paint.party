import { createSelector } from "reselect";
import values from "lodash/values";
import sortBy from "lodash/sortBy";
import omit from "lodash/omit";

import { RootState } from "../types";
import { uid } from "./app";

// const createSelector = createSelectorCreator(defaultMemoize, isEqual);

const s = (state: RootState) => state.canvas || {};
const p = (_: RootState, props: any) => props || {};

export const activeCanvas = createSelector(
  s,
  (state) => state.activeCanvas ?? ""
);

export const canvases = createSelector(s, (state) => state.canvases);

export const canvas = createSelector(
  [canvases, activeCanvas, p],
  (canvases, activeCanvas, props) =>
    canvases[props.canvasId ?? activeCanvas] ?? {}
);

export const canvasBackgroundColor = createSelector(
  canvas,
  (canvas) => canvas.backgroundColor ?? ""
);

export const canvasList = createSelector(canvases, (c) => values(c));

export const activeCanvasEntity = createSelector(
  [activeCanvas, canvases],
  (id, canvases) => canvases[id] ?? {}
);

export const activeCanvasBackgroundColor = createSelector(
  activeCanvasEntity,
  (entity) => entity.backgroundColor ?? "#FFFFFF"
);

export const canvasActiveAt = createSelector(
  activeCanvasEntity,
  (entity) => entity.nextDrawAt ?? 0
);

export const isCreatingCanvas = createSelector(
  s,
  (state) => state.creatingCanvas
);

export const isLoadingCanvas = createSelector(
  s,
  (state) => state.loadingCanvas
);

export const showCanvasCreator = createSelector(
  s,
  (state) => state.showCreator
);
