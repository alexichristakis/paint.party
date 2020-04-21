import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.draw;

export const drawEnabled = createSelector(s, (state) => state.enabled);
export const selectedCell = createSelector(s, (state) => state.cell);
export const selectedColor = createSelector(s, (state) => state.color);
export const captureRef = createSelector(s, (state) => state.captureRef);
