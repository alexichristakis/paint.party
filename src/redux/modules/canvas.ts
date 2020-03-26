import immer from "immer";
import moment from "moment";
import keyBy from "lodash/keyBy";

import { DRAW_INTERVAL } from "@lib";
import { createAction, ActionsUnion } from "../types";

export type CellUpdate = {
  id: string;
  time: string;
  author: string;
  color: string;
};

export type Cell = { [cellUpdateId: string]: CellUpdate };

export type CanvasViz = {
  id: string;
  cells: Cell[];
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
  fetchingCanvases: boolean;
  joiningCanvas: boolean;
  loadingCell: boolean;
  loadingCanvas: boolean;
}>;

const initialState: CanvasState = {
  activeCanvas: "",
  fetchingCanvases: false,
  loadingCanvas: false,
  joiningCanvas: false,
  loadingCell: false,
  canvases: {},
  canvas: {
    id: "",
    cells: []
  }
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

      return { ...state, canvases: keyBy(canvases, o => o.id) };
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
      return { ...state, joiningCanvas: false };
    }

    case ActionTypes.CREATE_CANVAS: {
      return {
        ...state,
        loadingCanvas: true
      };
    }

    case ActionTypes.JOIN_CANVAS_SUCCESS:
    case ActionTypes.CREATE_CANVAS_SUCCESS: {
      const { canvas } = action.payload;
      return immer(state, draft => {
        draft.activeCanvas = canvas.id;
        draft.canvases[canvas.id] = canvas;
        draft.loadingCanvas = false;
        draft.joiningCanvas = false;

        return draft;
      });
    }

    case ActionTypes.DRAW_ON_CANVAS: {
      return {
        ...state,
        loadingCell: true
      };
    }

    case ActionTypes.DRAW_ON_CANVAS_SUCCESS: {
      const { activeCanvas } = state;
      return immer(state, draft => {
        draft.canvases[activeCanvas].nextDrawAt = moment()
          .add(DRAW_INTERVAL, "minutes")
          .unix();

        return draft;
      });
    }

    case ActionTypes.CLOSE_CANVAS: {
      return { ...state, activeCanvas: "" };
    }

    case ActionTypes.UPDATE_CANVAS: {
      const { cellId, update } = action.payload;

      return immer(state, draft => {
        draft.canvas.cells[cellId] = update;
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
  CREATE_CANVAS = "canvas/CREATE",
  CREATE_CANVAS_SUCCESS = "canvas/CREATE_SUCCESS",
  JOIN_CANVAS = "canvas/JOIN",
  JOIN_CANVAS_SUCCESS = "canvas/JOIN_SUCCESS",
  JOIN_CANVAS_FAILURE = "canvas/JOIN_FAILURE",
  CLOSE_CANVAS = "canvas/CLOSE",
  DRAW_ON_CANVAS = "canvas/DRAW",
  DRAW_ON_CANVAS_SUCCESS = "canvas/DRAW_SUCCESS",
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

  join: (id: string) => createAction(ActionTypes.JOIN_CANVAS, { id }),
  joinSuccess: (canvas: Canvas) =>
    createAction(ActionTypes.JOIN_CANVAS_SUCCESS, { canvas }),
  joinFailure: () => createAction(ActionTypes.JOIN_CANVAS_FAILURE),

  draw: (cellId: number, color: string) =>
    createAction(ActionTypes.DRAW_ON_CANVAS, { cellId, color }),
  drawSuccess: () => createAction(ActionTypes.DRAW_ON_CANVAS_SUCCESS),
  close: () => createAction(ActionTypes.CLOSE_CANVAS),
  update: (cellId: number, update: Cell) =>
    createAction(ActionTypes.UPDATE_CANVAS, { cellId, update }),
  updateFailure: (error: any) =>
    createAction(ActionTypes.UPDATE_CANVAS_FAILURE, { error })
};
