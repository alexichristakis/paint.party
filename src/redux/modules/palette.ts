import immer from "immer";
import { createAction, ActionTypes, ActionUnion } from "../types";
import { OuterWheel, InnerWheel } from "@lib";

export const DefaultPalettes: Palettes = {
  default: {
    id: "default",
    name: "Default",
    colors: OuterWheel
  },
  default2: {
    id: "default2",
    name: "Default 2",
    colors: InnerWheel
  }
};

export type Palette = {
  id: string;
  name: string;
  colors: string[];
};

export type Palettes = { [id: string]: Palette };

export type PaletteState = Readonly<{
  activePalette: string;
  palettes: Palettes;
}>;

const initialState: PaletteState = {
  activePalette: "default",
  palettes: DefaultPalettes
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
      const { index, color, paletteId = state.activePalette } = action.payload;

      return immer(state, draft => {
        draft.palettes[paletteId].colors[index] = color;

        return draft;
      });
    }

    case ActionTypes.ADD_COLOR: {
      const { color, paletteId } = action.payload;

      return immer(state, draft => {
        draft.palettes[paletteId].colors.push(color);

        return draft;
      });
    }

    case ActionTypes.REMOVE_COLOR: {
      const { index, paletteId } = action.payload;

      return immer(state, draft => {
        const { colors } = draft.palettes[paletteId];
        draft.palettes[paletteId].colors = colors.splice(index, 1);

        return draft;
      });
    }

    default:
      return state;
  }
};

export const PaletteActions = {
  reset: () => createAction(ActionTypes.RESET_COLORS),
  set: (color: string, index: number, paletteId?: string) =>
    createAction(ActionTypes.SET_COLOR, { color, index, paletteId }),
  add: (color: string, paletteId: string) =>
    createAction(ActionTypes.ADD_COLOR, { color, paletteId }),
  remove: (index: number, paletteId: string) =>
    createAction(ActionTypes.REMOVE_COLOR, { index, paletteId })
};
