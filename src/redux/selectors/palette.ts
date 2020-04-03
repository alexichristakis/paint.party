import { createSelector } from "reselect";

import { RootState } from "../types";
import { FillColors } from "@lib";

const p = (_: RootState, props: any) => props;
const s = (state: RootState) => state.palette;

export const activePaletteId = createSelector([s, p], (state, props) =>
  props ? props.paletteId ?? state.activePalette : state.activePalette
);
export const palettes = createSelector(s, state => state.palettes);

export const activePalette = createSelector(
  [palettes, activePaletteId],
  (palettes, id) => palettes[id] ?? {}
);

export const colors = createSelector(
  activePalette,
  palette => palette.colors ?? FillColors
);

export const color = createSelector(
  [colors, p],
  (colors, props) => colors[props.index]
);

export const numColors = createSelector(colors, colors => colors.length);

export const angleIncrement = createSelector([numColors, p], (num, p) =>
  p.index ? ((2 * Math.PI) / num) * p.index : (2 * Math.PI) / num
);

export const editing = createSelector(s, state => state.editing);

export const isEditing = createSelector([editing, p], (editing, props) => {
  const { active, index, paletteId } = editing;

  return active && index === props.index && paletteId === props.paletteId;
});
