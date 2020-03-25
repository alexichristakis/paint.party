import { combineEpics } from "redux-observable";
import { combineReducers } from "redux";

import AppReducer, {
  Actions as AppActions,
  ActionTypes as AppActionTypes
} from "./app";

import CanvasReducer, {
  Actions as CanvasActions,
  ActionTypes as CanvasActionTypes
} from "./canvas";

import { RootState, ActionsUnion } from "../types";

export const rootReducer = combineReducers({
  app: AppReducer,
  canvas: CanvasReducer
});

//

export type Actions = ActionsUnion<typeof AppActions & typeof CanvasActions>;

export const ActionTypes = { ...AppActionTypes, ...CanvasActionTypes };
export type ActionTypes = AppActionTypes & CanvasActionTypes;
export { AppActions, CanvasActions };
