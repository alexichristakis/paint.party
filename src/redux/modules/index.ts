import { combineReducers } from "redux";

import { ActionsUnion } from "../types";

import AppReducer, {
  Actions as AppActions,
  ActionTypes as AppActionTypes
} from "./app";
import CanvasReducer, {
  Actions as CanvasActions,
  ActionTypes as CanvasActionTypes
} from "./canvas";
import PaletteReducer, {
  Actions as PaletteActions,
  ActionTypes as PaletteActionTypes
} from "./palette";

export const rootReducer = combineReducers({
  app: AppReducer,
  canvas: CanvasReducer,
  palette: PaletteReducer
});

export type Actions = ActionsUnion<
  typeof AppActions & typeof CanvasActions & typeof PaletteActions
>;

export const ActionTypes = {
  ...AppActionTypes,
  ...CanvasActionTypes,
  ...PaletteActionTypes
};
export type ActionTypes = AppActionTypes &
  CanvasActionTypes &
  PaletteActionTypes;

export { AppActions, CanvasActions, PaletteActions };
