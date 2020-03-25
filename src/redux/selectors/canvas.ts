import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.canvas || {};

export const activeCanvas = createSelector(s, state => state.activeCanvas);

export const canvas = createSelector(s, state => state.canvas);
