import immer from "immer";

// @ts-ignore
import uuid from "uuid/v1";

import { createAction, ActionTypes, ActionUnion } from "../types";
import { Palette1, Palette2 } from "@lib";

export const DefaultPalettes: Palettes = {
  default: {
    id: "default",
    name: "Default",
    colors: Palette1,
  },
  default2: {
    id: "default2",
    name: "Pastel",
    colors: Palette2,
  },
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
  palettes: DefaultPalettes,
};

export default (
  state: PaletteState = initialState,
  action: ActionUnion
): PaletteState => {
  switch (action.type) {
    case ActionTypes.RESET_COLORS: {
      return { ...initialState };
    }

    case ActionTypes.CREATE_PALETTE: {
      const { name } = action.payload;

      const id = uuid();

      return immer(state, (draft) => {
        draft.palettes[id] = { id, name, colors: Palette1 };
      });
    }

    case ActionTypes.ENABLE_PALETTE: {
      const { paletteId } = action.payload;

      return {
        ...state,
        activePalette: paletteId,
      };
    }

    case ActionTypes.SET_COLOR: {
      const { color, index, paletteId = state.activePalette } = action.payload;

      return immer(state, (draft) => {
        draft.palettes[paletteId].colors[index!] = color;
      });
    }

    case ActionTypes.ADD_COLOR: {
      const { color, paletteId } = action.payload;

      return immer(state, (draft) => {
        draft.palettes[paletteId].colors.push(color);
      });
    }

    case ActionTypes.REMOVE_COLOR: {
      const { index, paletteId } = action.payload;

      return immer(state, (draft) => {
        const { colors } = draft.palettes[paletteId];
        draft.palettes[paletteId].colors = colors.splice(index, 1);
      });
    }

    default:
      return state;
  }
};

export const PaletteActions = {
  reset: () => createAction(ActionTypes.RESET_COLORS),

  createPalette: (name: string) =>
    createAction(ActionTypes.CREATE_PALETTE, { name }),

  enablePalette: (paletteId: string) =>
    createAction(ActionTypes.ENABLE_PALETTE, { paletteId }),

  set: (color: string, index?: number, paletteId?: string) =>
    createAction(ActionTypes.SET_COLOR, { color, index, paletteId }),
  add: (color: string, paletteId: string) =>
    createAction(ActionTypes.ADD_COLOR, { color, paletteId }),

  remove: (index: number, paletteId: string) =>
    createAction(ActionTypes.REMOVE_COLOR, { index, paletteId }),
};
