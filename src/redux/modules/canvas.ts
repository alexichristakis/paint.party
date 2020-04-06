import immer from "immer";
import { Alert } from "react-native";
import keyBy from "lodash/keyBy";
import merge from "lodash/merge";

import { createAction, ActionUnion, ActionTypes } from "../types";

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
  canvases: { [canvasId: string]: Canvas };
  creatingCanvas: boolean;
  fetchingCanvases: boolean;
  joiningCanvas: boolean;
  loadingCanvas: boolean;
}>;

const initialState: CanvasState = {
  activeCanvas: "",
  creatingCanvas: false,
  fetchingCanvases: false,
  loadingCanvas: false,
  joiningCanvas: false,
  canvases: {},
};

export default (
  state: CanvasState = initialState,
  action: ActionUnion
): CanvasState => {
  switch (action.type) {
    case ActionTypes.FETCH_CANVASES: {
      return { ...state, fetchingCanvases: true };
    }

    case ActionTypes.FETCH_CANVASES_SUCCESS: {
      const { canvases } = action.payload;

      return immer(state, (draft) => {
        const newCanvases = keyBy(canvases, (o) => o.id);

        draft.fetchingCanvases = false;
        draft.creatingCanvas = false;
        draft.canvases = merge(draft.canvases, newCanvases);
      });
    }

    case ActionTypes.OPEN_CANVAS: {
      const { id } = action.payload;

      return { ...state, loadingCanvas: true, activeCanvas: id };
    }

    case ActionTypes.OPEN_CANVAS_SUCCESS: {
      return {
        ...state,
        loadingCanvas: false,
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

      return immer(state, (draft) => {
        draft.activeCanvas = canvas.id;
        draft.canvases[canvas.id] = canvas;
        draft.loadingCanvas = false;
        draft.creatingCanvas = false;
        draft.joiningCanvas = false;
      });
    }

    case ActionTypes.JOIN_CANVAS_FAILURE: {
      Alert.alert(
        "invalid canvas",
        "hmmm it appears that canvas doesn't exist"
      );

      return immer(state, (draft) => {
        draft.joiningCanvas = false;
      });
    }

    case ActionTypes.DRAW_SUCCESS: {
      const { id, nextDrawAt } = action.payload;

      return immer(state, (draft) => {
        draft.canvases[id].nextDrawAt = nextDrawAt;

        return draft;
      });
    }

    case ActionTypes.CLOSE_CANVAS: {
      return { ...state, activeCanvas: "" };
    }

    default:
      return state;
  }
};

export const CanvasActions = {
  fetch: () => createAction(ActionTypes.FETCH_CANVASES),
  fetchSuccess: (canvases: Canvas[]) =>
    createAction(ActionTypes.FETCH_CANVASES_SUCCESS, { canvases }),

  create: (canvas: NewCanvas) =>
    createAction(ActionTypes.CREATE_CANVAS, { canvas }),

  createSuccess: (canvas: Canvas) =>
    createAction(ActionTypes.CREATE_CANVAS_SUCCESS, { canvas }),

  join: (id: string) => createAction(ActionTypes.JOIN_CANVAS, { id }),
  joinSuccess: (canvas: Canvas) =>
    createAction(ActionTypes.JOIN_CANVAS_SUCCESS, { canvas }),
  joinFailure: () => createAction(ActionTypes.JOIN_CANVAS_FAILURE),

  open: (id: string) => createAction(ActionTypes.OPEN_CANVAS, { id }),
  close: () => createAction(ActionTypes.CLOSE_CANVAS),
};
