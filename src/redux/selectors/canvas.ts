import { createSelector } from "reselect";
import values from "lodash/values";
import sortBy from "lodash/sortBy";

import { RootState } from "../types";

const s = (state: RootState) => state.canvas || {};

export const activeCanvas = createSelector(
  s,
  state => state.activeCanvas ?? ""
);

export const canvases = createSelector(s, state => state.canvases);

export const canvasList = createSelector(canvases, c => values(c));

export const activeCanvasEntity = createSelector(
  [activeCanvas, canvases],
  (id, canvases) => canvases[id] ?? {}
);

export const canvasActiveAt = createSelector(
  activeCanvasEntity,
  entity => entity.nextDrawAt ?? 0
);

export const canvas = createSelector(s, state => state.canvas);

export const canvasEnabled = createSelector(canvas, state => state.enabled);

export const selectedCell = createSelector(canvas, state => state.selectedCell);

export const selectedColor = createSelector(
  canvas,
  state => state.selectedColor
);

export const cellColor = createSelector(
  [canvas, (_: RootState, i: number) => i],
  (canvas, index) => {
    const cells = canvas.cells ?? {};
    const updates = values(cells[index]) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, o => o.time);

      return sorted[updates.length - 1].color;
    }
  }
);

export const isCreatingCanvas = createSelector(
  s,
  state => state.creatingCanvas
);

export const livePositions = createSelector(canvas, canvas => canvas.live);

export const numberOfLiveUsers = createSelector(
  livePositions,
  positions => Object.keys(positions ?? {}).length - 1
);

export const isLoadingCanvas = createSelector(s, state => state.loadingCanvas);
