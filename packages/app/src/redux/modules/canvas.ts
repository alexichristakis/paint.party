import immer from "immer";
import { Alert } from "react-native";
import keyBy from "lodash/keyBy";

import { Canvas, NewCanvas } from "@global";

import { createAction, ActionUnion, ActionTypes } from "../types";

export type CanvasState = Readonly<{
  activeCanvas: string;
  canvases: { [canvasId: string]: Canvas };
  previews: { [canvasId: string]: string };
  joiningCanvas: boolean;
  creatingCanvas: boolean;
  fetchingCanvases: boolean;
}>;

const initialState: CanvasState = {
  activeCanvas: "",
  joiningCanvas: false,
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
    case ActionTypes.RENAME_CANVAS:
    case ActionTypes.LEAVE_CANVAS:
    case ActionTypes.FETCH_CANVASES: {
      return { ...state, fetchingCanvases: true };
    }

    case ActionTypes.JOIN_CANVAS: {
      return { ...state, joiningCanvas: true };
    }

    case ActionTypes.FETCH_CANVASES_SUCCESS: {
      const { canvases } = action.payload;

      return immer(state, (draft) => {
        const newCanvases = keyBy(canvases, (o) => o.id);

        draft.fetchingCanvases = false;
        draft.creatingCanvas = false;
        draft.canvases = newCanvases;
      });
    }

    case ActionTypes.RENAME_CANVAS_SUCCESS: {
      const { id, name } = action.payload;

      return immer(state, (draft) => {
        if (draft.canvases[id]) draft.canvases[id].name = name;

        draft.fetchingCanvases = false;
      });
    }

    case ActionTypes.LEAVE_CANVAS_SUCCESS: {
      const { id } = action.payload;

      return immer(state, (draft) => {
        delete draft.canvases[id];
        draft.fetchingCanvases = false;
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
        draft.joiningCanvas = false;
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

  rename: (id: string, name: string) =>
    createAction(ActionTypes.RENAME_CANVAS, { id, name }),
  renameSuccess: (id: string, name: string) =>
    createAction(ActionTypes.RENAME_CANVAS_SUCCESS, { id, name }),
  renameFailure: () => createAction(ActionTypes.RENAME_CANVAS_FAILURE),

  leave: (id: string) => createAction(ActionTypes.LEAVE_CANVAS, { id }),
  leaveSuccess: (id: string) =>
    createAction(ActionTypes.LEAVE_CANVAS_SUCCESS, { id }),
  leaveFailure: () => createAction(ActionTypes.LEAVE_CANVAS_FAILURE),

  setPreviewUrl: (id: string, url: string) =>
    createAction(ActionTypes.SET_CANVAS_PREVIEW, { id, url }),

  open: (id: string) => createAction(ActionTypes.OPEN_CANVAS, { id }),
  close: () => createAction(ActionTypes.CLOSE_CANVAS),
};
