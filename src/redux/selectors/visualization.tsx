import { createSelector } from "reselect";
import values from "lodash/values";
import sortBy from "lodash/sortBy";
import omit from "lodash/omit";

import { RootState } from "../types";
import { uid } from "./app";

const s = (state: RootState) => state.visualization;

export const canvasVizId = createSelector(s, state => state.id);
export const canvasEnabled = createSelector(s, state => state.enabled);
export const selectedCell = createSelector(s, state => state.selectedCell);
export const selectedColor = createSelector(s, state => state.selectedColor);
export const cellColor = createSelector(
  [s, (_: RootState, i: number) => i],
  (canvas, index) => {
    const cells = canvas.cells ?? {};
    const updates = values(cells[index]) ?? [];

    if (updates.length) {
      const sorted = sortBy(updates, o => o.time);

      return sorted[updates.length - 1].color;
    }
  }
);
export const live = createSelector(s, canvas => canvas.live);

export const livePositions = createSelector([live, uid], (live, uid) =>
  Object.values(omit(live ?? {}, uid ?? ""))
);

export const numLiveUsers = createSelector(
  livePositions,
  positions => positions.length
);
