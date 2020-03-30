import immer from "immer";
import { Alert } from "react-native";
import keyBy from "lodash/keyBy";
import merge from "lodash/merge";

import { createAction, ActionsUnion } from "../types";
import { REHYDRATE } from "redux-persist";

export type CellUpdate = {
  id: string;
  time: string;
  author: string;
  color: string;
};

export type Cell = { [cellUpdateId: string]: CellUpdate };
export type Cells = { [id: string]: Cell };

export type Positions = { [uid: string]: number };

export type CanvasViz = {
  id: string;
  enabled: boolean;
  selectedCell: number;
  selectedColor: string | null;
  cells: Cells | null;
  live: Positions | null;
};

export type Canvas = {
  id: string;
  name: string;
  creator: string;
  authors: string[];
  backgroundColor: string;
  nextDrawAt: number;
  createdAt: number;
  expiresAt: number;
};

export type NewCanvas = Pick<Canvas, "name" | "backgroundColor" | "expiresAt">;

export type CanvasState = Readonly<{
  activeCanvas: string;
  canvas: CanvasViz;
  canvases: { [canvasId: string]: Canvas };
  creatingCanvas: boolean;
  fetchingCanvases: boolean;
  joiningCanvas: boolean;
  loadingCell: boolean;
  loadingCanvas: boolean;
}>;

export const initialCanvasViz: CanvasViz = {
  id: "",
  enabled: false,
  selectedCell: -1,
  selectedColor: "",
  live: null,
  cells: null
};

const initialState: CanvasState = {
  activeCanvas: "",
  creatingCanvas: false,
  fetchingCanvases: false,
  loadingCanvas: false,
  joiningCanvas: false,
  loadingCell: false,
  canvases: {},
  canvas: initialCanvasViz
};

export default (
  state: CanvasState = initialState,
  action: ActionsUnion<typeof Actions>
): CanvasState => {
  switch (action.type) {
    case ActionTypes.FETCH_CANVASES: {
      return { ...state, fetchingCanvases: true };
    }

    case ActionTypes.FETCH_CANVASES_SUCCESS: {
      const { canvases } = action.payload;

      return immer(state, draft => {
        const newCanvases = keyBy(canvases, o => o.id);

        draft.fetchingCanvases = false;
        draft.creatingCanvas = false;
        draft.canvases = merge(draft.canvases, newCanvases);

        return draft;
      });
    }

    case ActionTypes.OPEN_CANVAS: {
      const { id } = action.payload;

      return { ...state, loadingCanvas: true, activeCanvas: id };
    }

    case ActionTypes.OPEN_CANVAS_SUCCESS: {
      const { canvas } = action.payload;

      return {
        ...state,
        loadingCanvas: false,
        canvas
      };
    }

    case ActionTypes.JOIN_CANVAS: {
      return { ...state, joiningCanvas: true };
    }

    case ActionTypes.CREATE_CANVAS: {
      return { ...state, creatingCanvas: true };
    }

    case ActionTypes.JOIN_CANVAS_SUCCESS:
    case ActionTypes.CREATE_CANVAS_SUCCESS: {
      const { canvas } = action.payload;

      return immer(state, draft => {
        draft.activeCanvas = canvas.id;
        draft.canvases[canvas.id] = canvas;
        draft.loadingCanvas = false;
        draft.creatingCanvas = false;
        draft.joiningCanvas = false;

        return draft;
      });
    }

    case ActionTypes.JOIN_CANVAS_FAILURE: {
      Alert.alert(
        "invalid canvas",
        "hmmm it appears that canvas doesn't exist"
      );

      return immer(state, draft => {
        draft.joiningCanvas = false;
      });
    }

    case ActionTypes.ENABLE_CANVAS: {
      return immer(state, draft => {
        draft.canvas.enabled = true;
        return draft;
      });
    }

    case ActionTypes.SELECT_CELL: {
      const { cell } = action.payload;

      return immer(state, draft => {
        draft.canvas.selectedCell = cell;
        draft.canvas.selectedColor = null;

        return draft;
      });
    }

    case ActionTypes.SELECT_COLOR: {
      const { color } = action.payload;

      return immer(state, draft => {
        draft.canvas.selectedColor = color;

        return draft;
      });
    }

    case ActionTypes.DRAW: {
      return { ...state, loadingCell: true, loadingCanvas: true };
    }

    case ActionTypes.SET_LIVE_POSITIONS: {
      const { positions } = action.payload;

      return immer(state, draft => {
        draft.canvas.live = positions;
      });
    }

    case ActionTypes.DRAW_SUCCESS: {
      const { nextDrawAt } = action.payload;
      const { activeCanvas } = state;

      return immer(state, draft => {
        draft.canvases[activeCanvas].nextDrawAt = nextDrawAt;
        draft.canvas.enabled = false;
        draft.canvas.selectedColor = null;

        draft.loadingCell = false;
        draft.loadingCanvas = false;

        return draft;
      });
    }

    case ActionTypes.CLOSE_CANVAS: {
      return { ...state, activeCanvas: "" };
    }

    case ActionTypes.UPDATE_CANVAS: {
      const { cellId, update } = action.payload;

      return immer(state, draft => {
        if (draft.canvas.cells) draft.canvas.cells[cellId] = update;
        else draft.canvas.cells = { [cellId]: update };
        draft.loadingCell = false;

        return draft;
      });
    }

    default:
      return state;
  }
};

export enum ActionTypes {
  FETCH_CANVASES = "canvas/FETCH",
  FETCH_CANVASES_SUCCESS = "canvas/FETCH_SUCCESS",
  OPEN_CANVAS = "canvas/OPEN",
  OPEN_CANVAS_SUCCESS = "canvas/OPEN_SUCCESS",
  ENABLE_CANVAS = "cavnas/ENABLE",
  SELECT_CELL = "canvas/SELECT_CELL",
  SELECT_COLOR = "canvas/SELECT",
  DRAW = "canvas/DRAW",
  DRAW_SUCCESS = "canvas/DRAW_SUCCESS",
  SET_LIVE_POSITIONS = "canvas/SET_LIVE_POSITIONS",
  CREATE_CANVAS = "canvas/CREATE",
  CREATE_CANVAS_SUCCESS = "canvas/CREATE_SUCCESS",
  JOIN_CANVAS = "canvas/JOIN",
  JOIN_CANVAS_SUCCESS = "canvas/JOIN_SUCCESS",
  JOIN_CANVAS_FAILURE = "canvas/JOIN_FAILURE",
  CLOSE_CANVAS = "canvas/CLOSE",
  UPDATE_CANVAS = "canvas/UPDATE",
  UPDATE_CANVAS_SUCCESS = "canvas/UPDATE_SUCCESS",
  UPDATE_CANVAS_FAILURE = "canvas/UPDATE_FAILURE"
}

export const Actions = {
  fetch: () => createAction(ActionTypes.FETCH_CANVASES),
  fetchSuccess: (canvases: Canvas[]) =>
    createAction(ActionTypes.FETCH_CANVASES_SUCCESS, { canvases }),
  open: (id: string) => createAction(ActionTypes.OPEN_CANVAS, { id }),
  openSuccess: (canvas: CanvasViz) =>
    createAction(ActionTypes.OPEN_CANVAS_SUCCESS, { canvas }),
  create: (canvas: NewCanvas) =>
    createAction(ActionTypes.CREATE_CANVAS, { canvas }),
  createSuccess: (canvas: Canvas) =>
    createAction(ActionTypes.CREATE_CANVAS_SUCCESS, { canvas }),

  enableCanvas: () => createAction(ActionTypes.ENABLE_CANVAS),

  selectCell: (cell: number) => createAction(ActionTypes.SELECT_CELL, { cell }),
  selectColor: (color: string) =>
    createAction(ActionTypes.SELECT_COLOR, { color }),
  setLivePositions: (positions: Positions) =>
    createAction(ActionTypes.SET_LIVE_POSITIONS, { positions }),

  draw: () => createAction(ActionTypes.DRAW),
  drawSuccess: (nextDrawAt: number) =>
    createAction(ActionTypes.DRAW_SUCCESS, { nextDrawAt }),

  join: (id: string) => createAction(ActionTypes.JOIN_CANVAS, { id }),
  joinSuccess: (canvas: Canvas) =>
    createAction(ActionTypes.JOIN_CANVAS_SUCCESS, { canvas }),
  joinFailure: () => createAction(ActionTypes.JOIN_CANVAS_FAILURE),

  close: () => createAction(ActionTypes.CLOSE_CANVAS),
  update: (cellId: number, update: Cell) =>
    createAction(ActionTypes.UPDATE_CANVAS, { cellId, update }),
  updateFailure: (error: any) =>
    createAction(ActionTypes.UPDATE_CANVAS_FAILURE, { error })
};
