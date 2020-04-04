import { ActionCreatorsMapObject } from "redux";

import { AppState } from "./modules/app";
import { CanvasState } from "./modules/canvas";
import { PaletteState } from "./modules/palette";
import { VisualizationState } from "./modules/visualization";
import {
  AppActions,
  CanvasActions,
  PaletteActions,
  VisualizationActions
} from "./modules";

export enum PaletteActionTypes {
  RESET_COLORS = "palette/RESET",
  EDIT_COLOR = "palette/EDIT",
  CLOSE_EDITOR = "palette/CLOSE_EDITOR",
  SET_COLOR = "palette/SET",
  ADD_COLOR = "palette/ADD",
  REMOVE_COLOR = "palette/REMOVE",
  ENABLE_PALETTE = "palette/ENABLE"
}

export enum AppActionTypes {
  LOGIN = "app/LOGIN",
  LOGIN_SUCCESS = "app/LOGIN_SUCCESS",
  LOGOUT = "app/LOGOUT",
  LOGOUT_SUCCESS = "app/LOGOUT_SUCCESS",
  SET_APP_STATUS = "app/SET_STATUS",
  AUTH_ERROR = "app/AUTH_ERROR"
}

export enum CanvasActionTypes {
  FETCH_CANVASES = "canvas/FETCH",
  FETCH_CANVASES_SUCCESS = "canvas/FETCH_SUCCESS",
  OPEN_CANVAS = "canvas/OPEN",
  OPEN_CANVAS_SUCCESS = "canvas/OPEN_SUCCESS",
  CREATE_CANVAS = "canvas/CREATE",
  CREATE_CANVAS_SUCCESS = "canvas/CREATE_SUCCESS",
  JOIN_CANVAS = "canvas/JOIN",
  JOIN_CANVAS_SUCCESS = "canvas/JOIN_SUCCESS",
  JOIN_CANVAS_FAILURE = "canvas/JOIN_FAILURE",
  CLOSE_CANVAS = "canvas/CLOSE"
}

export enum VisualizationActionTypes {
  ENABLE_CANVAS = "viz/ENABLE",
  OPEN_CANVAS_SUCCESS = "viz/OPEN_SUCCESS",
  SELECT_CELL = "viz/SELECT_CELL",
  SELECT_COLOR = "viz/SELECT_COLOR",
  DRAW = "viz/DRAW",
  DRAW_SUCCESS = "viz/DRAW_SUCCESS",
  SET_LIVE_POSITIONS = "viz/SET_LIVE_POSITIONS",
  UPDATE_CANVAS = "viz/UPDATE",
  UPDATE_CANVAS_SUCCESS = "viz/UPDATE_SUCCESS",
  UPDATE_CANVAS_FAILURE = "viz/UPDATE_FAILURE"
}

export type RootState = {
  app: AppState;
  canvas: CanvasState;
  palette: PaletteState;
  visualization: VisualizationState;
};

export type ActionUnion = ActionsUnion<
  typeof AppActions &
    typeof CanvasActions &
    typeof PaletteActions &
    typeof VisualizationActions
>;

export const ActionTypes = {
  ...AppActionTypes,
  ...CanvasActionTypes,
  ...PaletteActionTypes,
  ...VisualizationActionTypes
};

interface Action<T extends string> {
  type: T;
}

interface ActionWithPayload<T extends string, P> extends Action<T> {
  payload: P;
}

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(
  type: T,
  payload: P
): ActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<
  A[keyof A]
>;

export type ExtractActionFromActionCreator<AC> = AC extends (
  ...args: any[]
) => infer A
  ? A
  : AC extends (payload: any) => infer A
  ? A
  : AC extends (payload: any, error: any) => infer A
  ? A
  : never;

// export type ExtractActionFromActionCreator<AC> = AC extends (...args: any) => infer A ? A
