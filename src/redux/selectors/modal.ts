import { createSelector } from "reselect";

import { RootState } from "../types";

const p = (_: RootState, props: any) => props;
const s = (state: RootState) => state.modal;

export const showPaletteEditor = createSelector(
  s,
  (state) => state.showPaletteEditor
);

export const showCreateCanvas = createSelector(
  s,
  (state) => state.showCreateCanvas
);
