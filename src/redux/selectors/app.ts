import { createSelector } from "reselect";

import { RootState } from "../types";

const s = (state: RootState) => state.app || {};

export const isAuthenticated = createSelector(
  s,
  state => state.isAuthenticated
);

export const isAuthenticating = createSelector(
  s,
  state => state.isAuthenticating
);

export const uid = createSelector(s, state => state.user?.uid);
