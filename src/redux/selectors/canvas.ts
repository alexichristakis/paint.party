import { createSelector } from "reselect";
import values from "lodash/values";
import sortBy from "lodash/sortBy";

import { RootState } from "../types";

const s = (state: RootState) => state.canvas || {};

export const activeCanvas = createSelector(s, state => state.activeCanvas);

export const canvases = createSelector(s, state => state.canvases);

export const canvasList = createSelector(canvases, c => values(c));

export const activeCanvasEntity = createSelector(
  [activeCanvas, canvases],
  (id, canvases) => canvases[id]
);

export const canvasActiveAt = createSelector(
  activeCanvasEntity,
  entity => entity.nextDrawAt ?? 0
);

export const canvas = createSelector(s, state => state.canvas);

export const cellColor = createSelector(
  [canvas, activeCanvasEntity, (_: RootState, i: number) => i],
  (canvas, activeCanvasMetadata, index) => {
    const updates = values(canvas.cells[index]) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, o => o.time);

      return sorted[updates.length - 1].color;
    }

    return activeCanvasMetadata.backgroundColor ?? "#FFFFFF";
  }
);
