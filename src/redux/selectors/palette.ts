import { createSelector } from "reselect";
import isUndefined from "lodash/isUndefined";

import { FillColors } from "@lib";
import { RootState } from "../types";

const p = (_: RootState, props: any) => props;
const s = (state: RootState) => state.palette;

export const activePaletteId = createSelector([s, p], (state, props) =>
  props
    ? (props.paletteId as string) ?? state.activePalette
    : state.activePalette
);

export const isActivePalette = createSelector(
  [s, p],
  (state, props) => state.activePalette === props.palette.id
);

export const palettes = createSelector(s, (state) => state.palettes);

export const activePalette = createSelector(
  [palettes, activePaletteId],
  (palettes, id) => palettes[id] ?? {}
);

export const colors = createSelector(
  activePalette,
  (palette) => palette.colors ?? FillColors
);

export const color = createSelector(
  [colors, p],
  (colors, props) => colors[props.index]
);

export const numColors = createSelector(colors, (colors) => colors.length);

export const angleIncrement = createSelector([numColors, p], (num, p) =>
  !isUndefined(p.index) ? ((2 * Math.PI) / num) * p.index : (2 * Math.PI) / num
);

export const editing = createSelector(s, (state) => state.editing);

export const editingColor = createSelector(
  [palettes, editing],
  (palettes, editing) => {
    const { index, paletteId } = editing;

    return palettes[paletteId]?.colors[index];
  }
);

export const editingActive = createSelector(
  editing,
  (editing) => editing.active
);

export const isEditing = createSelector(
  [editing, activePaletteId, p],
  (editing, activePaletteId, props) => {
    const { active, index, paletteId } = editing;

    if (props.paletteId) {
      return active && index === props.index && paletteId === props.paletteId;
    }

    return active && index === props.index && paletteId === activePaletteId;
  }
);

export const showPaletteEditor = createSelector(s, (state) => state.showEditor);
