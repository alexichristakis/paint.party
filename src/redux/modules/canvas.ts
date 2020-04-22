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
  previews: { [canvasId: string]: string };
  creatingCanvas: boolean;
  fetchingCanvases: boolean;
}>;

const initialState: CanvasState = {
  activeCanvas: "",
  creatingCanvas: false,
  fetchingCanvases: false,
  canvases: {},
  previews: {},
};

export default (
  state: CanvasState = initialState,
  action: ActionUnion
): CanvasState => {
  switch (action.type) {
    case ActionTypes.JOIN_CANVAS:
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

      return { ...state, activeCanvas: id };
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
        draft.creatingCanvas = false;
      });
    }

    case ActionTypes.JOIN_CANVAS_FAILURE: {
      Alert.alert(
        "invalid canvas",
        "hmmm it appears that canvas doesn't exist"
      );

      return immer(state, (draft) => {
        draft.fetchingCanvases = false;
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

    case ActionTypes.SET_CANVAS_PREVIEW: {
      const { id, url } = action.payload;

      return immer(state, (draft) => {
        if (!draft.previews) draft.previews = {};
        draft.previews[id] = url;
      });
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

  leave: (id: string) => createAction(ActionTypes.LEAVE_CANVAS, { id }),
  leaveSuccess: (id: string) =>
    createAction(ActionTypes.LEAVE_CANVAS_SUCCESS, { id }),
  leaveFailure: (id: string) =>
    createAction(ActionTypes.LEAVE_CANVAS_FAILURE, { id }),

  setPreviewUrl: (id: string, url: string) =>
    createAction(ActionTypes.SET_CANVAS_PREVIEW, { id, url }),

  open: (id: string) => createAction(ActionTypes.OPEN_CANVAS, { id }),
  close: () => createAction(ActionTypes.CLOSE_CANVAS),
};
