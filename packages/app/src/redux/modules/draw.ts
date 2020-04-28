import { createRef } from "react";
import { View } from "react-native";

import { createAction, ActionUnion, ActionTypes } from "../types";

export type DrawState = {
  captureRef: React.RefObject<View>;
  color: string;
  cell: number;
  enabled: boolean;
};

const initialState: DrawState = {
  captureRef: createRef(),
  color: "",
  cell: -1,
  enabled: false,
};

export default (
  state: DrawState = initialState,
  action: ActionUnion
): DrawState => {
  switch (action.type) {
    case ActionTypes.ENABLE: {
      return { ...state, enabled: true };
    }

    case ActionTypes.SELECT_CELL: {
      const { cell } = action.payload;
      return { ...state, cell, color: "" };
    }

    case ActionTypes.SELECT_COLOR: {
      const { color } = action.payload;
      return { ...state, color };
    }

    case ActionTypes.DRAW: {
      return { ...state, enabled: false };
    }

    default:
      return state;
  }
};

export const DrawActions = {
  enableCanvas: () => createAction(ActionTypes.ENABLE),

  selectColor: (color: string) =>
    createAction(ActionTypes.SELECT_COLOR, { color }),
  selectCell: (cell: number) => createAction(ActionTypes.SELECT_CELL, { cell }),

  draw: () => createAction(ActionTypes.DRAW),
  drawSuccess: (id: string, nextDrawAt: number) =>
    createAction(ActionTypes.DRAW_SUCCESS, { id, nextDrawAt }),
};
