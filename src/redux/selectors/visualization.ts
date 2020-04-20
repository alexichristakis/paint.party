import { createSelector } from "reselect";
import sortBy from "lodash/sortBy";
import omit from "lodash/omit";

import { RootState } from "../types";
import { uid } from "./app";
import { activeCanvasEntity } from "./canvas";

const s = (state: RootState) => state.visualization;

export const canvasVizId = createSelector(s, (state) => state.id);
export const canvasEnabled = createSelector(s, (state) => state.enabled);
export const cells = createSelector(s, (s) => s.cells ?? {});
export const cellColor = createSelector(
  [cells, (_: RootState, i: number) => i],
  (cells, index) => {
    const updates = Object.values(cells[index] ?? {}) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, (o) => o.time);

      return sorted[updates.length - 1].color;
    }
  }
);
export const live = createSelector(s, (canvas) => canvas.live);

export const isLoadingCanvas = createSelector(s, (state) => state.loading);

export const cellLatestUpdate = createSelector(
  [
    cells,
    activeCanvasEntity,
    (_: RootState, props: any) => props.cell as number,
  ],
  (cells, canvas, cell) => {
    const updates = Object.values(cells[cell] ?? {}) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, (o) => o.time);

      return sorted[updates.length - 1];
    }

    return {
      color: canvas.backgroundColor,
      time: canvas.createdAt,
    };
  }
);
/*
export const selectedCellLatestUpdate = createSelector(
  [cells, selectedCell, activeCanvasEntity],
  (cells, cell, canvas) => {
    const updates = Object.values(cells[cell] ?? {}) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, (o) => o.time);

      return sorted[updates.length - 1];
    }

    return {
      color: canvas.backgroundColor,
      time: canvas.createdAt,
    };
  }
);
*/

export const livePositions = createSelector([live, uid], (live, uid) =>
  Object.values(omit(live ?? {}, uid ?? ""))
);

export const numLiveUsers = createSelector(
  livePositions,
  (positions) => positions.length
);
