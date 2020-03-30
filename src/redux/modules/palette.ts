import { createAction, ActionsUnion } from "../types";
import { FillColors } from "@lib";
import immer from "immer";

export type PaletteState = Readonly<{
  colors: string[];
}>;

const initialState: PaletteState = {
  colors: FillColors
};

export default (
  state: PaletteState = initialState,
  action: ActionsUnion<typeof Actions>
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

export enum ActionTypes {
  RESET_COLORS = "palette/RESET",
  SET_COLOR = "palette/SET"
}

export const Actions = {
  reset: () => createAction(ActionTypes.RESET_COLORS),
  set: (color: string, index: number) =>
    createAction(ActionTypes.SET_COLOR, { color, index })
};
