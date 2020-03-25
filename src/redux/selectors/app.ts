import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.app || {};

export const isAuthenticated = createSelector(
  s,
  state => state.isAuthenticated
);
