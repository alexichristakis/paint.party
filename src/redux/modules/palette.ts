import immer from "immer";
import { createAction, ActionTypes, ActionUnion } from "../types";
import { FillColors } from "@lib";

export type PaletteState = Readonly<{
  colors: string[];
}>;

const initialState: PaletteState = {
  colors: FillColors
};

export default (
  state: PaletteState = initialState,
  action: ActionUnion
): PaletteState => {
  switch (action.type) {
    case ActionTypes.RESET_COLORS: {
      return { ...initialState };
    }

    case ActionTypes.SET_COLOR: {
      const { index, color } = action.payload;

      return immer(state, draft => {
        draft.colors[index] = color;
      });
    }

    default:
      return state;
  }
};

export const PaletteActions = {
  reset: () => createAction(ActionTypes.RESET_COLORS),
  set: (color: string, index: number) =>
    createAction(ActionTypes.SET_COLOR, { color, index })
};
