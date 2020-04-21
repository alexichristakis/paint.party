import { createAction, ActionUnion, ActionTypes } from "../types";

export type ModalState = {
  showCreateCanvas: boolean;
  showPaletteEditor: boolean;
};

const initialState: ModalState = {
  showCreateCanvas: false,
  showPaletteEditor: false,
};

export default (
  state: ModalState = initialState,
  action: ActionUnion
): ModalState => {
  switch (action.type) {
    case ActionTypes.OPEN_CREATE_CANVAS: {
      return { ...state, showCreateCanvas: true };
    }

    case ActionTypes.CREATE_CANVAS_SUCCESS:
    case ActionTypes.CLOSE_CREATE_CANVAS: {
      return { ...state, showCreateCanvas: false };
    }

    case ActionTypes.OPEN_PALETTE_EDITOR: {
      return { ...state, showPaletteEditor: true };
    }

    case ActionTypes.CLOSE_PALETTE_EDITOR: {
      return { ...state, showPaletteEditor: false };
    }

    default:
      return state;
  }
};

export const ModalActions = {
  openPaletteEditor: () => createAction(ActionTypes.OPEN_PALETTE_EDITOR),
  closePaletteEditor: () => createAction(ActionTypes.CLOSE_PALETTE_EDITOR),
  openCreateCanvas: () => createAction(ActionTypes.OPEN_CREATE_CANVAS),
  closeCreateCanvas: () => createAction(ActionTypes.CLOSE_CREATE_CANVAS),
};
