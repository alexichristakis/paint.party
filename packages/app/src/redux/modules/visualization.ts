import { View } from "react-native";
import immer from "immer";

import { createAction, ActionUnion, ActionTypes } from "../types";

export type CellUpdate = {
  id: string;
  time: number;
  author: string;
  color: string;
};

export type Cell = { [cellUpdateId: string]: CellUpdate };
export type Cells = { [id: string]: Cell };

export type Positions = { [uid: string]: number };

export type VisualizationState = {
  id: string;
  loading: boolean;
  cells: Cells | null;
  live: Positions | null;
};

export const initialCanvasViz: VisualizationState = {
  id: "",
  loading: false,
  live: null,
  cells: null,
};

export default (
  state: VisualizationState = initialCanvasViz,
  action: ActionUnion
): VisualizationState => {
  switch (action.type) {
    case ActionTypes.SUBSCRIBE: {
      return { ...initialCanvasViz, loading: true };
    }

    case ActionTypes.SUBSCRIBE_SUCCESS: {
      const { id, live, cells } = action.payload;
      return { ...state, id, live, cells, loading: false };
    }

    case ActionTypes.SET_LIVE_POSITIONS: {
      const { positions } = action.payload;

      return {
        ...state,
        live: positions,
      };
    }

    case ActionTypes.UPDATE_CANVAS: {
      const { cellId, update } = action.payload;

      return immer(state, (draft) => {
        if (draft.cells) draft.cells[cellId] = update;
        else draft.cells = { [cellId]: update };

        draft.loading = false;
        return draft;
      });
    }

    default:
      return state;
  }
};

export const VisualizationActions = {
  subscribe: () => createAction(ActionTypes.SUBSCRIBE),
  subscribeSuccess: (id: string, cells: Cells | null, live: Positions | null) =>
    createAction(ActionTypes.SUBSCRIBE_SUCCESS, { id, cells, live }),

  setLivePositions: (positions: Positions) =>
    createAction(ActionTypes.SET_LIVE_POSITIONS, { positions }),

  draw: (cell: number, color: string, canvasRef: React.RefObject<View>) =>
    createAction(ActionTypes.DRAW, { color, cell, canvasRef }),
  drawSuccess: (id: string, nextDrawAt: number) =>
    createAction(ActionTypes.DRAW_SUCCESS, { id, nextDrawAt }),

  update: (cellId: number, update: Cell) =>
    createAction(ActionTypes.UPDATE_CANVAS, { cellId, update }),
  updateFailure: (error: any) =>
    createAction(ActionTypes.UPDATE_CANVAS_FAILURE, { error }),
};
