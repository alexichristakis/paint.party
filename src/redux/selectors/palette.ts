import { createSelector } from "reselect";

import { RootState } from "../types";

const p = (_: RootState, props: any) => props;
const s = (state: RootState) => state.palette;

export const colors = createSelector(s, state => state.colors);

export const color = createSelector(
  [colors, p],
  (colors, props) => colors[props.index]
);

export const numColors = createSelector([colors], colors => colors.length);

export const angleIncrement = createSelector(
  numColors,
  num => (2 * Math.PI) / num
);
