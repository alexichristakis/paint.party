import immer from "immer";

import { createAction, ActionUnion, ActionTypes } from "../types";

export type CellUpdate = {
  id: string;
  time: string;
  author: string;
  color: string;
};

export type Cell = { [cellUpdateId: string]: CellUpdate };
export type Cells = { [id: string]: Cell };

export type Positions = { [uid: string]: number };

export type VisualizationState = {
  id: string;
  loading: boolean;
  enabled: boolean;
  selectedCell: number;
  selectedColor: string | null;
  cells: Cells | null;
  live: Positions | null;
};

export const initialCanvasViz: VisualizationState = {
  id: "",
  loading: false,
  enabled: false,
  selectedCell: -1,
  selectedColor: "",
  live: null,
  cells: null,
};

export default (
  state: VisualizationState = initialCanvasViz,
  action: ActionUnion
): VisualizationState => {
  switch (action.type) {
    case ActionTypes.ENABLE_CANVAS: {
      return { ...state, enabled: true };
    }

    case ActionTypes.OPEN_CANVAS_SUCCESS: {
      const { id, live, cells } = action.payload;
      return { ...state, id, live, cells };
    }

    case ActionTypes.SELECT_CELL: {
      const { cell } = action.payload;

      return immer(state, (draft) => {
        draft.selectedCell = cell;
        draft.selectedColor = null;

        return draft;
      });
    }

    case ActionTypes.SELECT_COLOR: {
      const { color } = action.payload;

      return { ...state, selectedColor: color };
    }

    case ActionTypes.DRAW: {
      return { ...state, loading: true };
    }

    case ActionTypes.SET_LIVE_POSITIONS: {
      const { positions } = action.payload;

      return {
        ...state,
        live: positions,
      };
    }

    case ActionTypes.DRAW_SUCCESS: {
      return immer(state, (draft) => {
        draft.enabled = false;
        draft.selectedColor = null;

        draft.loading = false;

        return draft;
      });
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

    case ActionTypes.CAPTURE_CANVAS_PREVIEW: {
    }

    default:
      return state;
  }
};

export const VisualizationActions = {
  capturePreview: () => createAction(ActionTypes.CAPTURE_CANVAS_PREVIEW),
  capturePreviewSuccess: () =>
    createAction(ActionTypes.CAPTURE_CANVAS_PREVIEW_SUCCESS),

  enableCanvas: () => createAction(ActionTypes.ENABLE_CANVAS),
  openSuccess: (id: string, cells: Cells | null, live: Positions | null) =>
    createAction(ActionTypes.OPEN_CANVAS_SUCCESS, { id, cells, live }),

  selectCell: (cell: number) => createAction(ActionTypes.SELECT_CELL, { cell }),
  selectColor: (color: string) =>
    createAction(ActionTypes.SELECT_COLOR, { color }),
  setLivePositions: (positions: Positions) =>
    createAction(ActionTypes.SET_LIVE_POSITIONS, { positions }),

  draw: () => createAction(ActionTypes.DRAW),
  drawSuccess: (id: string, nextDrawAt: number) =>
    createAction(ActionTypes.DRAW_SUCCESS, { id, nextDrawAt }),

  update: (cellId: number, update: Cell) =>
    createAction(ActionTypes.UPDATE_CANVAS, { cellId, update }),
  updateFailure: (error: any) =>
    createAction(ActionTypes.UPDATE_CANVAS_FAILURE, { error }),
};
