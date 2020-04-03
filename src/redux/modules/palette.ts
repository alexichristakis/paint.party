import immer from "immer";
import { createAction, ActionTypes, ActionUnion } from "../types";
import { Palette1, Palette2 } from "@lib";

export const DefaultPalettes: Palettes = {
  default: {
    id: "default",
    name: "Default",
    colors: Palette1
  },
  default2: {
    id: "default2",
    name: "Pastel",
    colors: Palette2
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
  editing: {
    active: boolean;
    paletteId: string;
    index: number;
  };
}>;

const initialState: PaletteState = {
  activePalette: "default",
  palettes: DefaultPalettes,
  editing: {
    active: false,
    paletteId: "",
    index: -1
  }
};

export default (
  state: PaletteState = initialState,
  action: ActionUnion
): PaletteState => {
  switch (action.type) {
    case ActionTypes.RESET_COLORS: {
      return { ...initialState };
    }

    case ActionTypes.EDIT_COLOR: {
      const { index, paletteId } = action.payload;

      return immer(state, draft => {
        draft.editing.active = true;
        draft.editing.paletteId = paletteId;
        draft.editing.index = index;
      });
    }

    case ActionTypes.CLOSE_EDITOR: {
      return immer(state, draft => {
        draft.editing.active = false;
        draft.editing.paletteId = "";
        draft.editing.index = -1;
      });
    }

    case ActionTypes.SET_COLOR: {
      const { editing } = state;
      let { color, index, paletteId = state.activePalette } = action.payload;

      if (editing.active) {
        ({ index, paletteId } = editing);
      }

      return immer(state, draft => {
        draft.palettes[paletteId].colors[index!] = color;
      });
    }

    case ActionTypes.ADD_COLOR: {
      const { color, paletteId } = action.payload;

      return immer(state, draft => {
        draft.palettes[paletteId].colors.push(color);
      });
    }

    case ActionTypes.REMOVE_COLOR: {
      const { index, paletteId } = action.payload;

      return immer(state, draft => {
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

  closeEditor: () => createAction(ActionTypes.CLOSE_EDITOR),

  edit: (index: number, paletteId: string) =>
    createAction(ActionTypes.EDIT_COLOR, { index, paletteId }),
  set: (color: string, index?: number, paletteId?: string) =>
    createAction(ActionTypes.SET_COLOR, { color, index, paletteId }),
  add: (color: string, paletteId: string) =>
    createAction(ActionTypes.ADD_COLOR, { color, paletteId }),

  remove: (index: number, paletteId: string) =>
    createAction(ActionTypes.REMOVE_COLOR, { index, paletteId })
};
